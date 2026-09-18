/*
 * Tests for the pure half of the monitor: envelope walking, relevance
 * classification, normalisation and scoring.
 *
 * No test framework and no network. Run with `npm test`.
 *
 * These matter more than usual here. The live APIs were unreachable from the
 * machine this was written on, so these fixtures are the only thing standing
 * between a logic error and a dashboard that silently shows nothing.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { classify, score, supplierSlug, cpvStem } from '../src/score.js'
import { collectReleases, extractCpv, extractStage, normalise, normaliseAwards, SOURCES, CF_PASSES } from '../src/ingest.js'

const here = dirname(fileURLToPath(import.meta.url))
const fx = JSON.parse(readFileSync(join(here, 'fixtures', 'releases.json'), 'utf8'))

let passed = 0
let failed = 0

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  ok   ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function group(title, fn) {
  console.log(`\n${title}`)
  return fn()
}

/* ────────────────────────────────────────────────────────────────────────── */

group('collectReleases finds releases whatever the envelope', () => {
  const cf = collectReleases(fx.contracts_finder_envelope)
  const ft = collectReleases(fx.find_a_tender_envelope)
  check('finds both Contracts Finder releases through results[].releases[]', cf.length === 2, `got ${cf.length}`)
  check('finds both Find a Tender releases through releases[]', ft.length === 2, `got ${ft.length}`)
  check('handles a bare release object', collectReleases(cf[0]).length === 1)
  check('handles an array of releases', collectReleases([cf[0], cf[1]]).length === 2)
  check('returns nothing for junk', collectReleases({ foo: 'bar' }).length === 0)
  check('survives null', collectReleases(null).length === 0)
})

group('CPV extraction', () => {
  const [mod] = collectReleases(fx.contracts_finder_envelope)
  const codes = extractCpv(mod)
  check('strips the check digit to an 8-digit stem', codes.includes('35613000'), codes.join(','))
  check('includes additionalClassifications', codes.includes('35125000'), codes.join(','))
  check('cpvStem tolerates a bare code', cpvStem('34711200') === '34711200')
  check('cpvStem rejects nonsense', cpvStem('not-a-code') === null)
})

group('stage detection', () => {
  const [award] = collectReleases(fx.find_a_tender_envelope)
  check('award tag wins', extractStage(award) === 'award', extractStage(award))
  check('tender tag detected', extractStage(collectReleases(fx.contracts_finder_envelope)[0]) === 'tender')
  check('falls back to awards presence', extractStage({ ocid: 'x', awards: [{}] }) === 'award')
  check('unknown when there is nothing to go on', extractStage({ ocid: 'x' }) === 'unknown')
})

group('classification keeps drone work and drops the rest', () => {
  const [mod, grass] = collectReleases(fx.contracts_finder_envelope)
  check('keeps an sUAS framework', classify({
    title: mod.tender.title, description: mod.tender.description, cpv: extractCpv(mod),
  }) !== null)
  check('drops grass cutting that says "no drones"', classify({
    title: grass.tender.title, description: grass.tender.description, cpv: extractCpv(grass),
  }) === null)
  check('drops a CCTV contract with no drone term', classify({
    title: 'Supply and installation of CCTV', description: 'Perimeter security cameras for car parks.',
    cpv: ['35125000'],
  }) === null)
  check('keeps a drone contract with no CPV code at all', classify({
    title: 'UAV pilot services', description: 'Provision of qualified drone pilots.', cpv: [],
  }) !== null)
  check('does not match "uas" inside another word', classify({
    title: 'Casual staffing framework', description: 'Nuanced usage of casual labour.', cpv: [],
  }) === null)
})

group('scoring behaves the way the rules say', () => {
  const [mod] = collectReleases(fx.contracts_finder_envelope)
  const row = normalise(mod, 'contracts_finder')
  check('an open, well-coded, mid-value tender scores high', row.fit_score >= 70, `scored ${row.fit_score}`)
  check('reasons are recorded', JSON.parse(row.fit_reasons).length >= 3)

  const ft = collectReleases(fx.find_a_tender_envelope)
  const closedHuge = normalise(ft[1], 'find_a_tender')
  check('a closed £40M tender scores far lower', closedHuge.fit_score < row.fit_score,
    `${closedHuge.fit_score} vs ${row.fit_score}`)
  check('the closed deadline is given as a reason',
    JSON.parse(closedHuge.fit_reasons).some((r) => /deadline passed/i.test(r)))
  check('the size penalty is given as a reason',
    JSON.parse(closedHuge.fit_reasons).some((r) => /prime contractor/i.test(r)))

  /*
   * The dashboard shows only the first few reasons, so a reason that kills the
   * opportunity has to appear before the ones that flatter it. Caught by
   * rendering the dashboard against sample data, where a closed notice read as
   * "Open tender, biddable".
   */
  check('a blocking reason is listed before the encouraging ones',
    /deadline passed/i.test(JSON.parse(closedHuge.fit_reasons)[0]),
    JSON.parse(closedHuge.fit_reasons)[0])
  check('a blocking reason survives the dashboard cutting the list to four',
    JSON.parse(closedHuge.fit_reasons).slice(0, 4).some((r) => /deadline passed/i.test(r)))
  check('a tender past its deadline is not described as biddable',
    !JSON.parse(closedHuge.fit_reasons).some((r) => /biddable/i.test(r)),
    JSON.parse(closedHuge.fit_reasons).join(' | '))

  const awarded = normalise(ft[0], 'find_a_tender')
  check('an already-awarded notice is marked as intelligence only',
    JSON.parse(awarded.fit_reasons).some((r) => /already awarded/i.test(r)))

  check('score is clamped to 0-100', score(
    { stage: 'tender', value_amount: 500000, deadline_at: null },
    { cpvDrone: ['35613000'], cpvRelated: [], strong: 9, capability: 9 },
  ).score <= 100)
})

group('the Contracts Finder query asks only for what the API honours', () => {
  const u = (opts) => new URL(SOURCES.contracts_finder.url(opts))
  const from = '2026-06-01T00:00:00Z'
  const to = '2026-06-08T00:00:00Z'

  const full = u({ from, to, stage: 'tender' })
  check('publishedFrom is set', full.searchParams.get('publishedFrom') === from)
  check('publishedTo bounds the window', full.searchParams.get('publishedTo') === to)
  check('stages carries the one filter that works', full.searchParams.get('stages') === 'tender')

  /*
   * Probing the live API showed keyword, searchTerm, keywords, q and
   * searchCriteria.keyword are all accepted and all ignored, returning pages
   * identical to the unfiltered baseline. Sending one would be a lie about
   * what the request does, and it was what made the ingest read five days of
   * everything instead of ninety days of tenders.
   */
  for (const dead of ['keyword', 'searchTerm', 'keywords', 'q', 'cpvCodes', 'classification']) {
    check(`no ${dead} parameter, which the API ignores`, !full.searchParams.has(dead))
  }

  const open = u({ from, stage: 'tender' })
  check('publishedTo is omitted when no end is given', !open.searchParams.has('publishedTo'))

  check('find a tender still builds a notice url', typeof SOURCES.find_a_tender.noticeUrl === 'function')
  check('find a tender notice url points at the right service',
    SOURCES.find_a_tender.noticeUrl('abc').includes('find-tender.service.gov.uk'))
})

group('the slice plan can actually finish inside a run', () => {
  /*
   * Observed volumes: about 10 tenders and 260 awards published a day, 100
   * releases to a page. A slice that cannot be read to its last page inside
   * its own page budget stalls the walk, so each pass is checked against the
   * volume it will meet.
   */
  const perDay = { tender: 12, planning: 4, award: 300 }
  for (const pass of CF_PASSES) {
    const pagesNeeded = Math.ceil((perDay[pass.stage] * pass.sliceDays) / 100)
    check(`${pass.stage}: a ${pass.sliceDays}-day slice needs ~${pagesNeeded} pages, budget ${pass.maxPages}`,
      pagesNeeded <= pass.maxPages)
  }

  const totalPages = CF_PASSES.reduce((n, p) => n + p.maxPages, 0) + 12
  /* Cloudflare allows fifty outbound requests per Worker invocation. */
  check(`every pass together stays under the subrequest cap (${totalPages} of 50)`, totalPages <= 50)

  check('tenders are walked before awards, being the only actionable rows',
    CF_PASSES.findIndex((p) => p.stage === 'tender') < CF_PASSES.findIndex((p) => p.stage === 'award'))
  check('every pass backfills at least 60 days', CF_PASSES.every((p) => p.backfillDays >= 60))
  check('no slice is smaller than a day', CF_PASSES.every((p) => p.sliceDays >= 1))
})

group('normalisation produces complete rows', () => {
  const [mod] = collectReleases(fx.contracts_finder_envelope)
  const row = normalise(mod, 'contracts_finder')
  check('keyed on ocid', row.ocid === 'ocds-h6vhtk-04a1b2')
  check('buyer carried through', row.buyer_name === 'Ministry of Defence')
  check('value read from tender.value', row.value_amount === 850000 && row.value_currency === 'GBP')
  check('deadline read from tenderPeriod.endDate', String(row.deadline_at).startsWith('2099-10-15'))
  check('notice url built for the right service', row.url.includes('contractsfinder.service.gov.uk'))
  check('raw release retained for audit', typeof row.raw === 'string' && row.raw.includes('ocds-h6vhtk-04a1b2'))

  const ft = collectReleases(fx.find_a_tender_envelope)[0]
  const ftRow = normalise(ft, 'find_a_tender')
  check('buyer found via parties[] when buyer.name is absent or not', ftRow.buyer_name === 'Police Digital Service')
  check('find-a-tender url built', ftRow.url.includes('find-tender.service.gov.uk'))
  check('non-drone notices normalise to null', normalise(collectReleases(fx.contracts_finder_envelope)[1], 'contracts_finder') === null)

  /* The whole point of the defensive field access. */
  check('a nearly empty release does not throw', (() => {
    try {
      normalise({ ocid: 'x', tender: { title: 'drone survey' } }, 'contracts_finder')
      return true
    } catch {
      return false
    }
  })())
})

group('awards give real supplier history', () => {
  const [award] = collectReleases(fx.find_a_tender_envelope)
  const rows = normaliseAwards(award, 'find_a_tender')
  check('one row per supplier per award', rows.length === 2, `got ${rows.length}`)
  check('supplier name kept verbatim', rows[0].supplier_name === 'Skyward Aerial Systems Ltd')
  check('value carried', rows[0].value_amount === 1250000)
  check('buyer carried', rows[0].buyer_name === 'Police Digital Service')
  check('ids are unique and stable', new Set(rows.map((r) => r.id)).size === 2)
  check('an award with no supplier yields nothing',
    normaliseAwards({ ocid: 'x', awards: [{ id: '1', value: { amount: 1 } }] }, 'find_a_tender').length === 0)
})

group('supplier slugs collapse spelling, not distinct companies', () => {
  check('Ltd / Limited / plc collapse',
    supplierSlug('Skyward Aerial Systems Ltd') === supplierSlug('SKYWARD AERIAL SYSTEMS LIMITED'))
  check('punctuation collapses', supplierSlug('Q-Bot, Inc.') === supplierSlug('Q Bot Inc'))
  check('ampersand normalises', supplierSlug('Smith & Jones') === supplierSlug('Smith and Jones'))
  check('genuinely different firms stay apart',
    supplierSlug('Northern UAV Services Limited') !== supplierSlug('Southern UAV Services Limited'))
  check('empty input is safe', supplierSlug(null) === '' && supplierSlug(undefined) === '')
})

await group("dashboard renders without a live database", async () => {
  /*
   * A stub shaped like D1's prepare().bind().all()/.first() chain. This cannot
   * prove the SQL is right, but it does prove the page renders, escapes its
   * input and survives every empty case — which is where a server-rendered
   * template usually breaks.
   */
  const rows = {
    contracts: [
      {
        ocid: 'ocds-x-1',
        source: 'find_a_tender',
        title: 'Supply of <script>alert(1)</script> UAS',
        buyer_name: 'Ministry of Defence',
        stage: 'tender',
        value_amount: 850000,
        value_currency: 'GBP',
        published_at: '2026-09-01T00:00:00Z',
        deadline_at: '2099-10-15T00:00:00Z',
        url: 'https://example.invalid/notice/1',
        fit_score: 87,
        fit_reasons: '["Classified under a drone CPV code","Open tender, biddable"]',
        first_seen_at: '2026-09-02T00:00:00Z',
      },
    ],
    suppliers: [
      {
        name: 'Skyward Aerial Systems Ltd',
        award_count: 3,
        total_value: 2100000,
        currency: 'GBP',
        last_award_at: '2026-07-14T00:00:00Z',
        buyers: '["Police Digital Service","Ministry of Defence"]',
      },
    ],
    runs: [
      {
        started_at: '2026-09-18T06:00:00Z',
        source: 'find_a_tender',
        ok: 1,
        pages_fetched: 3,
        releases_seen: 210,
        contracts_upserted: 4,
        awards_upserted: 2,
        error: null,
      },
    ],
  }

  const stub = {
    prepare(sql) {
      const pick = () =>
        /FROM contracts\b[\s\S]*ORDER BY fit_score/.test(sql)
          ? { results: rows.contracts }
          : /FROM suppliers/.test(sql)
            ? { results: rows.suppliers }
            : /FROM ingest_runs/.test(sql)
              ? { results: rows.runs }
              : { results: [] }
      const api = {
        bind: () => api,
        all: async () => pick(),
        first: async () => ({ all_count: 1, open_count: 1, awarded_count: 0 }),
        run: async () => ({}),
      }
      return api
    },
  }

  const { dashboard } = await import('../src/ui.js')
  const html = await dashboard({ DB: stub }, new URL('https://x.invalid/'))

  check('returns a full document', html.startsWith('<!doctype html>') && html.includes('</html>'))
  check('shows a contract title', html.includes('UAS'))
  check('escapes injected markup', !html.includes('<script>alert(1)</script>'))
  check('shows the escaped form instead', html.includes('&lt;script&gt;'))
  check('renders the score', html.includes('>87<'))
  check('formats money as sterling', /£850,000/.test(html))
  check('renders a supplier row', html.includes('Skyward Aerial Systems Ltd'))
  check('renders the ingest log', html.includes('210'))
  check('reports health', html.includes('Healthy'))
  check('is marked noindex', html.includes('noindex'))

  const filtered = await dashboard({ DB: stub }, new URL('https://x.invalid/?stage=tender&q=uas'))
  check('keeps the search term in the box', filtered.includes('value="uas"'))
  check('marks the chosen stage selected', /value="tender" selected/.test(filtered))
  check('offers a clear link when filtered', filtered.includes('>clear<'))

  /* The case that matters most on day one: nothing in the database yet. */
  const emptyStub = {
    prepare: () => ({
      bind() { return this },
      all: async () => ({ results: [] }),
      first: async () => ({ all_count: 0, open_count: 0, awarded_count: 0 }),
    }),
  }
  const empty = await dashboard({ DB: emptyStub }, new URL('https://x.invalid/'))
  check('empty database renders an explanation, not a crash', empty.includes('Nothing here yet'))
  /* The explanation has to name the thing to press, not a command to type. */
  check('empty database points at the refresh button', empty.includes('Refresh now'))
  check('empty database is flagged as never run', empty.includes('Never run'))

  /* And the case where the schema was never applied. */
  const brokenStub = {
    prepare: () => ({
      bind() { return this },
      all: async () => { throw new Error('no such table: contracts') },
      first: async () => { throw new Error('no such table: contracts') },
    }),
  }
  const broken = await dashboard({ DB: brokenStub }, new URL('https://x.invalid/'))
  check('missing schema shows setup steps rather than a stack trace',
    broken.includes('The database is not ready') && broken.includes('schema.sql'))
})

/* ────────────────────────────────────────────────────────────────────────── */

/* The render group is async, so let the microtask queue drain before the tally. */
await new Promise((r) => setTimeout(r, 50))

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
