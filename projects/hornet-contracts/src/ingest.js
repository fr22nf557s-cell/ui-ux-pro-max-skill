/*
 * INGEST — pull notices from the UK open-contracting APIs and normalise them.
 *
 * Two sources, both publishing Open Contracting Data Standard (OCDS) JSON:
 *
 *   Contracts Finder   contracts over £12k central government / £30k wider
 *                      public sector. The high-volume source.
 *   Find a Tender      the UK's post-Brexit replacement for OJEU. Above-
 *                      threshold contracts, including most MOD work.
 *
 * ── What was learned by probing the live APIs ────────────────────────────────
 * This was first written against published documentation, on a machine that
 * could reach neither service. Probing the real endpoints from the deployed
 * Worker corrected two things worth stating plainly.
 *
 * The envelope was fine: both wrap releases the documented way, and
 * `collectReleases` — which walks the whole JSON tree rather than reaching
 * into a fixed path — handles both. It stays, because it costs little and
 * would survive the shape changing under us.
 *
 * The query was not fine. Contracts Finder honours neither a text search nor
 * a CPV filter; both were being sent and silently ignored, so the ingest was
 * reading an undifferentiated slice of all UK procurement and throwing 92% of
 * it away. What it does honour is `stages` and `publishedTo`, and those two
 * are what the design below is built on. See SOURCES.contracts_finder.
 */

import { classify, score, supplierSlug, cpvStem } from './score.js'

export const SOURCES = {
  contracts_finder: {
    label: 'Contracts Finder',
    /*
     * GET /Published/Notices/OCDS/Search.
     *
     * What this API does and does not offer, established by probing it rather
     * than by reading the documentation:
     *
     *   - There is NO text search. keyword, searchTerm, keywords, q and
     *     searchCriteria.keyword are all accepted and all silently ignored;
     *     each returns a page identical to passing nothing at all.
     *   - There is NO CPV filter. cpvCodes and classification are ignored too.
     *   - `stages` DOES filter, and it is the one that matters. Roughly 86% of
     *     everything published is award notices and about 8% open tenders, so
     *     asking for tenders alone cuts the volume fifteenfold.
     *   - `publishedTo` DOES bound the window (publishedUntil does not), which
     *     makes it possible to walk history in dated slices instead of always
     *     paging back from today.
     *   - Results are newest first, 100 to a page.
     *
     * Those five facts are the whole design. Ask for one stage at a time
     * inside a bounded window, and a Worker can cover ninety days of tenders
     * in about ten requests instead of the two hundred and seventy it would
     * take to read everything.
     */
    url({ from, to, stage }) {
      const u = new URL('https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search')
      u.searchParams.set('publishedFrom', from)
      if (to) u.searchParams.set('publishedTo', to)
      if (stage) u.searchParams.set('stages', stage)
      return u.toString()
    },
    noticeUrl: (id) => `https://www.contractsfinder.service.gov.uk/notice/${encodeURIComponent(id)}`,
  },
  find_a_tender: {
    label: 'Find a Tender',
    /*
     * GET /api/1.0/ocdsReleasePackages, cursor-paginated via links.next, at
     * most 100 releases a page. updatedFrom is when the record last changed,
     * not when it was first published, so a re-published notice reappears —
     * which is what we want, since the upsert is keyed on ocid.
     *
     * Above-threshold work only, so the volume is a fraction of Contracts
     * Finder's and no stage filter is needed to keep it manageable.
     */
    url({ from }) {
      const u = new URL('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages')
      u.searchParams.set('updatedFrom', from)
      u.searchParams.set('limit', '100')
      return u.toString()
    },
    noticeUrl: (id) => `https://www.find-tender.service.gov.uk/Notice/${encodeURIComponent(id)}`,
  },
}

/*
 * What to pull from Contracts Finder, in priority order, and how hard to work
 * at each.
 *
 * `sliceDays` is chosen so that one slice fits comfortably inside `maxPages`
 * at observed volumes: ~10 tenders a day, ~260 awards. A slice that cannot be
 * read to its end in one run would stall the walk, so these are deliberately
 * conservative.
 *
 * The page budgets add up to well under the fifty outbound requests a Worker
 * gets per invocation, leaving room for Find a Tender and for the volume to
 * grow without anything silently truncating.
 */
export const CF_PASSES = [
  { stage: 'tender', sliceDays: 7, maxPages: 12, backfillDays: 90 },
  { stage: 'planning', sliceDays: 30, maxPages: 4, backfillDays: 90 },
  /*
   * Awards are the bulk of the feed and only feed the supplier table, so they
   * get the smallest slices and catch up over several runs rather than
   * blocking the tenders anyone actually bids on.
   */
  { stage: 'award', sliceDays: 1, maxPages: 16, backfillDays: 60 },
]

/** Walk arbitrary JSON and return every object that looks like an OCDS release. */
export function collectReleases(node, found = [], depth = 0) {
  if (!node || typeof node !== 'object' || depth > 8) return found
  if (Array.isArray(node)) {
    for (const item of node) collectReleases(item, found, depth + 1)
    return found
  }
  const looksLikeRelease =
    typeof node.ocid === 'string' &&
    (node.tender || node.awards || node.contracts || node.planning)
  if (looksLikeRelease) {
    found.push(node)
    return found
  }
  for (const key of Object.keys(node)) collectReleases(node[key], found, depth + 1)
  return found
}

/** Every CPV code on a release, from items and their additional classifications. */
export function extractCpv(release) {
  const codes = new Set()
  const items = [
    ...(release?.tender?.items || []),
    ...(release?.awards || []).flatMap((a) => a?.items || []),
  ]
  for (const item of items) {
    const all = [item?.classification, ...(item?.additionalClassifications || [])]
    for (const c of all) {
      const stem = cpvStem(c?.id)
      /* scheme is usually "CPV" but has been seen as "CPV_2008" and absent. */
      if (stem && (!c?.scheme || /cpv/i.test(c.scheme))) codes.add(stem)
    }
  }
  return [...codes]
}

/*
 * OCDS carries the stage in `tag`, which is an array and can hold several
 * values on a single release. Order matters: a release tagged both tender and
 * award is an award, because the thing has been decided.
 */
export function extractStage(release) {
  const tags = (release?.tag || []).map((t) => String(t).toLowerCase())
  if (tags.some((t) => t.includes('award'))) return 'award'
  if (tags.some((t) => t.includes('contract'))) return 'contract'
  if (tags.some((t) => t.includes('tender'))) return 'tender'
  if (tags.some((t) => t.includes('planning'))) return 'planning'
  if ((release?.awards || []).length > 0) return 'award'
  if (release?.tender) return 'tender'
  return 'unknown'
}

function firstNumber(...values) {
  for (const v of values) {
    const n = Number(v)
    if (Number.isFinite(n) && n !== 0) return n
  }
  return null
}

/**
 * Turn one OCDS release into our row shape, or null if it is not drone work.
 *
 * Every field access is optional because the two publishers populate OCDS
 * differently and a missing `tender.value` must not throw and lose the run.
 */
export function normalise(release, sourceKey, now = new Date()) {
  const source = SOURCES[sourceKey]
  const title = release?.tender?.title || release?.awards?.[0]?.title || ''
  const description = release?.tender?.description || release?.awards?.[0]?.description || ''
  const cpv = extractCpv(release)

  const evidence = classify({ title, description, cpv })
  if (!evidence) return null

  const stage = extractStage(release)
  const noticeId = release?.tender?.id || release?.id || release?.ocid

  const row = {
    ocid: release.ocid,
    source: sourceKey,
    notice_id: String(noticeId ?? ''),
    title: String(title).slice(0, 500),
    description: String(description).slice(0, 4000),
    buyer_name: release?.buyer?.name || release?.parties?.find((p) => (p?.roles || []).includes('buyer'))?.name || '',
    buyer_id: release?.buyer?.id || '',
    stage,
    status: release?.tender?.status || '',
    value_amount: firstNumber(
      release?.tender?.value?.amount,
      release?.awards?.[0]?.value?.amount,
      release?.tender?.minValue?.amount,
    ),
    value_currency:
      release?.tender?.value?.currency || release?.awards?.[0]?.value?.currency || 'GBP',
    published_at: release?.date || release?.tender?.tenderPeriod?.startDate || null,
    deadline_at: release?.tender?.tenderPeriod?.endDate || release?.tender?.awardPeriod?.startDate || null,
    url: source.noticeUrl(noticeId),
    cpv_codes: cpv.join(','),
  }

  const scored = score(row, evidence, now)
  row.fit_score = scored.score
  row.fit_reasons = JSON.stringify(scored.reasons)
  row.raw = JSON.stringify(release).slice(0, 60000)
  return row
}

/**
 * Award rows: who actually won, and for how much.
 *
 * This is the whole basis of the supplier view. It is real award history from
 * the public record, not a guess about who might be a good fit.
 */
export function normaliseAwards(release, sourceKey) {
  const rows = []
  const buyer =
    release?.buyer?.name ||
    release?.parties?.find((p) => (p?.roles || []).includes('buyer'))?.name ||
    ''
  const cpv = extractCpv(release).join(',')

  for (const award of release?.awards || []) {
    /* An award with no supplier is a placeholder; it tells us nothing. */
    for (const supplier of award?.suppliers || []) {
      const name = supplier?.name
      if (!name) continue
      const slug = supplierSlug(name)
      if (!slug) continue
      rows.push({
        id: `${release.ocid}:${award?.id ?? '0'}:${slug}`,
        ocid: release.ocid,
        source: sourceKey,
        supplier_name: String(name).slice(0, 300),
        supplier_slug: slug,
        supplier_id: supplier?.id ? String(supplier.id) : '',
        value_amount: firstNumber(award?.value?.amount),
        value_currency: award?.value?.currency || 'GBP',
        awarded_at: award?.date || release?.date || null,
        buyer_name: buyer,
        cpv_codes: cpv,
      })
    }
  }
  return rows
}

/**
 * Fetch one page and return its JSON plus the next cursor, if any.
 *
 * Any non-2xx is thrown with the body attached, because a silent empty result
 * from a changed API would look identical to "no new contracts today" and
 * would be the easiest possible way for this thing to rot unnoticed.
 */
export async function fetchPage(url, { timeoutMs = 20000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'HornetDronesContractMonitor/1.0 (+https://hornetdrones.com)',
      },
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url} — ${text.slice(0, 300)}`)
    }
    let body
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error(`Non-JSON response from ${url} — ${text.slice(0, 300)}`)
    }
    const next = body?.links?.next || null
    return { body, next }
  } finally {
    clearTimeout(timer)
  }
}
