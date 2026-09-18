/*
 * HORNET DRONES — CONTRACT MONITOR
 *
 * A Cloudflare Worker that watches the UK public-procurement feeds for drone
 * work, scores each notice for whether a small UK drone company could bid it,
 * and records who actually wins.
 *
 * It runs on a cron trigger (see wrangler.toml) and stores everything in D1.
 *
 * ── Why this is a Worker and not part of the Pages site ──────────────────────
 * Cloudflare Pages Functions have no scheduled handler. Cron triggers are a
 * Workers feature. Putting the monitor here also means a mistake in it cannot
 * take down hornetdrones.com, which is a live marketing site with a working
 * waitlist behind it.
 *
 * ── Access ──────────────────────────────────────────────────────────────────
 * This is competitive intelligence, not marketing. The Worker fails closed: if
 * DASH_TOKEN is unset it serves nothing but setup instructions. Put Cloudflare
 * Access in front of it as well when you can — a shared token is a lock, not a
 * security model.
 */

import { SOURCES, SEARCH_KEYWORDS, collectReleases, normalise, normaliseAwards, fetchPage } from './ingest.js'
import {
  upsertContracts, upsertAwards, rebuildSuppliers,
  getWatermark, setWatermark, recordRun,
} from './db.js'
import { dashboard } from './ui.js'

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

/*
 * Constant-time-ish comparison. Worker request timing is noisy enough that a
 * timing attack on a token is not the realistic threat here, but comparing
 * properly costs one loop and removes the question.
 */
function tokenMatches(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function authorised(request, env) {
  if (!env.DASH_TOKEN) return false
  const url = new URL(request.url)
  const header = request.headers.get('authorization') || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
  const cookie = (request.headers.get('cookie') || '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('hc_token='))
  const fromCookie = cookie ? decodeURIComponent(cookie.slice('hc_token='.length)) : ''
  const fromQuery = url.searchParams.get('key') || ''
  return [bearer, fromCookie, fromQuery].some((t) => tokenMatches(t, env.DASH_TOKEN))
}

/**
 * Pull one source end to end.
 *
 * Failure of one source never aborts the other: MOD work lives on Find a
 * Tender and everyday work on Contracts Finder, so half the picture is much
 * better than none while one API is having a bad day.
 */
async function ingestSource(env, sourceKey, { maxPages = 15 } = {}) {
  const db = env.DB
  const started = new Date()
  const run = { source: sourceKey, started_at: started.toISOString(), pages_fetched: 0, releases_seen: 0 }

  try {
    const since = await getWatermark(db, sourceKey)
    const source = SOURCES[sourceKey]

    /*
     * Contracts Finder takes one keyword per query, so it needs a pass each.
     * Find a Tender has no keyword filter and returns everything changed since
     * the watermark, which classify() then narrows — a bigger download, but the
     * only way to avoid missing a notice whose title never says "drone".
     */
    const startUrls =
      sourceKey === 'contracts_finder'
        ? SEARCH_KEYWORDS.map((keyword) => source.url({ since, keyword }))
        : [source.url({ since })]

    const contractRows = new Map()
    const awardRows = new Map()

    for (const startUrl of startUrls) {
      let url = startUrl
      let pages = 0
      while (url && pages < maxPages) {
        const { body, next } = await fetchPage(url)
        pages += 1
        run.pages_fetched += 1

        const releases = collectReleases(body)
        run.releases_seen += releases.length

        for (const release of releases) {
          const row = normalise(release, sourceKey, started)
          if (!row) continue
          contractRows.set(row.ocid, row)
          for (const award of normaliseAwards(release, sourceKey)) awardRows.set(award.id, award)
        }

        /* A next link that does not move is a loop, not a page. */
        url = next && next !== url ? next : null
      }
    }

    const nowIso = started.toISOString()
    run.contracts_upserted = await upsertContracts(db, [...contractRows.values()], nowIso)
    run.awards_upserted = await upsertAwards(db, [...awardRows.values()])

    await setWatermark(db, sourceKey, nowIso)
    run.ok = true
  } catch (err) {
    run.ok = false
    run.error = err?.stack || String(err)
  }

  run.finished_at = new Date().toISOString()
  await recordRun(db, run).catch(() => {})
  return run
}

export async function runIngest(env) {
  const runs = []
  for (const key of Object.keys(SOURCES)) {
    runs.push(await ingestSource(env, key))
  }
  /* Rebuilt once after both sources, not once per source. */
  let suppliers = 0
  try {
    suppliers = await rebuildSuppliers(env.DB)
  } catch (err) {
    runs.push({ source: 'suppliers_rollup', ok: false, error: String(err) })
  }
  return { runs, suppliers }
}

/*
 * Fetch one page from each source and report exactly what came back, without
 * writing anything.
 *
 * This endpoint exists because this Worker was written against API
 * documentation rather than against live responses. It is the fastest way to
 * find out whether the envelope matches what collectReleases expects.
 */
async function selftest(env) {
  const out = {}
  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  for (const [key, source] of Object.entries(SOURCES)) {
    const url = key === 'contracts_finder' ? source.url({ since, keyword: 'drone' }) : source.url({ since })
    try {
      const { body } = await fetchPage(url)
      const releases = collectReleases(body)
      out[key] = {
        ok: true,
        url,
        top_level_keys: Object.keys(body || {}),
        releases_found: releases.length,
        first_release_keys: releases[0] ? Object.keys(releases[0]) : [],
        first_release_sample: releases[0]
          ? {
              ocid: releases[0].ocid,
              tag: releases[0].tag,
              title: releases[0]?.tender?.title,
              buyer: releases[0]?.buyer?.name,
              classified_as_drone_work: Boolean(normalise(releases[0], key)),
            }
          : null,
      }
    } catch (err) {
      out[key] = { ok: false, url, error: String(err).slice(0, 600) }
    }
  }
  return out
}

/*
 * Parameter probe.
 *
 * The selftest proved both APIs answer and that the envelope parses. It also
 * showed something worse: a Contracts Finder search for keyword=drone came
 * back with a solicitor's development loan first, which means the keyword is
 * being ignored and we are reading an undifferentiated slice of all UK
 * procurement.
 *
 * This endpoint exists to find the parameter that does work. It fetches one
 * page per candidate and reports, for each, how many of the hundred releases
 * actually classify as drone work, plus the date range of the page so we can
 * tell which end of the window the API serves first. Whichever variant scores
 * far above the unfiltered baseline is the right one.
 *
 * It writes nothing. Delete it once the answer is known.
 */
async function probe(env) {
  const CF = 'https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search'
  const days = (n) => new Date(Date.now() - n * 86400000).toISOString()

  const summarise = (releases) => {
    const dates = releases.map((r) => r?.date).filter(Boolean).sort()
    const drone = releases.filter((r) => Boolean(normalise(r, 'contracts_finder')))
    const stages = {}
    for (const r of releases) {
      const t = Array.isArray(r?.tag) ? r.tag.join('+') : String(r?.tag ?? '?')
      stages[t] = (stages[t] || 0) + 1
    }
    return {
      releases_on_page: releases.length,
      drone_work: drone.length,
      oldest: dates[0] || null,
      newest: dates[dates.length - 1] || null,
      tags: stages,
    }
  }

  const tryUrl = async (label, params) => {
    const u = new URL(CF)
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
    try {
      const { body, next } = await fetchPage(u.toString())
      return { label, ok: true, ...summarise(collectReleases(body)), has_next: Boolean(next) }
    } catch (err) {
      return { label, ok: false, error: String(err).slice(0, 160) }
    }
  }

  /*
   * Question 1 — can the window be bounded at both ends?
   *
   * If publishedTo works, the 90-day backfill can be walked in slices instead
   * of paged from the present day, which is the difference between a few
   * requests and a few hundred.
   */
  const windowing = [
    await tryUrl('control: publishedFrom=2d only', { publishedFrom: days(2) }),
    await tryUrl('publishedFrom=60d & publishedTo=58d', { publishedFrom: days(60), publishedTo: days(58) }),
    await tryUrl('publishedFrom=60d & publishedUntil=58d', { publishedFrom: days(60), publishedUntil: days(58) }),
  ]

  /*
   * Question 2 — can a page carry more than a hundred?
   *
   * Cloudflare caps a Worker at fifty outbound requests per invocation, so
   * page size sets how much history one run can cover at all.
   */
  const pageSize = [
    await tryUrl('size=500', { publishedFrom: days(2), size: '500' }),
    await tryUrl('limit=500', { publishedFrom: days(2), limit: '500' }),
    await tryUrl('pageSize=500', { publishedFrom: days(2), pageSize: '500' }),
  ]

  /*
   * Question 3 — is there a CPV filter after all?
   *
   * 34711200 is the procurement code for unmanned aerial vehicles. If any of
   * these narrows the results, the whole volume problem disappears: ask for
   * the code and get only drone work back.
   */
  const cpv = [
    await tryUrl('cpvCodes=34711200', { publishedFrom: days(90), cpvCodes: '34711200' }),
    await tryUrl('cpv=34711200', { publishedFrom: days(90), cpv: '34711200' }),
    await tryUrl('classification=34711200', { publishedFrom: days(90), classification: '34711200' }),
    await tryUrl('cpvCodes=34711200-6 (with check digit)', { publishedFrom: days(90), cpvCodes: '34711200-6' }),
  ]

  /* Question 4 — does the stage filter do anything? */
  const stageFilter = [
    await tryUrl('stages=tender only', { publishedFrom: days(2), stages: 'tender' }),
  ]

  return {
    read_this_first: [
      'windowing: if a publishedTo/publishedUntil row shows dates around 60 days old rather than',
      '  today, the window can be bounded and the backfill can be sliced.',
      'pageSize: if releases_on_page is above 100 anywhere, one request covers more history.',
      'cpv: if any row shows drone_work close to releases_on_page, that filter works and solves',
      '  the volume problem outright.',
      'stageFilter: if tags shows only tender, the stage filter works.',
    ],
    windowing,
    pageSize,
    cpv,
    stageFilter,
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (!env.DASH_TOKEN) {
      return new Response(
        'Contract monitor is not configured.\n\n' +
          'Set a dashboard token before this Worker will serve anything:\n' +
          '  npx wrangler secret put DASH_TOKEN\n',
        { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
      )
    }

    if (!authorised(request, env)) {
      return new Response('Unauthorised. Append ?key=YOUR_DASH_TOKEN once, or send a bearer token.', {
        status: 401,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      })
    }

    /* Trade the ?key= for a cookie so the token stops riding in the URL bar. */
    const setCookie =
      url.searchParams.get('key') === env.DASH_TOKEN
        ? {
            'set-cookie': `hc_token=${encodeURIComponent(env.DASH_TOKEN)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
          }
        : {}

    try {
      if (url.pathname === '/api/selftest') return json(await selftest(env))

      if (url.pathname === '/api/probe') return json(await probe(env))

      if (url.pathname === '/api/ingest' && request.method === 'POST') {
        return json(await runIngest(env))
      }

      /*
       * The dashboard's "Refresh now" button.
       *
       * Started in the background rather than awaited: a full ingest takes a
       * minute or two, which is far longer than anyone should watch a browser
       * spinner, and longer than a request should reasonably be held open.
       * The redirect comes back immediately and the page says a run is under
       * way. The cron does exactly the same work on its own schedule; this is
       * only for when you do not want to wait for it.
       */
      if (url.pathname === '/refresh' && request.method === 'POST') {
        ctx.waitUntil(runIngest(env))
        return new Response(null, {
          status: 303,
          headers: { location: '/?refreshing=1', 'cache-control': 'no-store', ...setCookie },
        })
      }

      if (url.pathname === '/api/contracts') {
        const stage = url.searchParams.get('stage')
        const minScore = Number(url.searchParams.get('minScore') ?? 0)
        const q = url.searchParams.get('q')
        const limit = Math.min(500, Number(url.searchParams.get('limit') ?? 200))

        const where = ['fit_score >= ?']
        const binds = [Number.isFinite(minScore) ? minScore : 0]
        if (stage && stage !== 'all') {
          where.push('stage = ?')
          binds.push(stage)
        }
        if (q) {
          where.push('(title LIKE ? OR description LIKE ? OR buyer_name LIKE ?)')
          binds.push(`%${q}%`, `%${q}%`, `%${q}%`)
        }
        binds.push(limit)

        const { results } = await env.DB.prepare(
          `SELECT ocid, source, title, buyer_name, stage, status, value_amount, value_currency,
                  published_at, deadline_at, url, cpv_codes, fit_score, fit_reasons,
                  first_seen_at, last_seen_at
             FROM contracts
            WHERE ${where.join(' AND ')}
            ORDER BY fit_score DESC, COALESCE(published_at, first_seen_at) DESC
            LIMIT ?`,
        )
          .bind(...binds)
          .all()
        return json({ count: results?.length ?? 0, contracts: results ?? [] }, 200)
      }

      if (url.pathname === '/api/suppliers') {
        const { results } = await env.DB.prepare(
          `SELECT slug, name, award_count, total_value, currency, first_award_at, last_award_at, buyers
             FROM suppliers ORDER BY award_count DESC, total_value DESC LIMIT 200`,
        ).all()
        return json({ count: results?.length ?? 0, suppliers: results ?? [] })
      }

      if (url.pathname === '/api/runs') {
        const { results } = await env.DB.prepare(
          `SELECT * FROM ingest_runs ORDER BY started_at DESC LIMIT 40`,
        ).all()
        return json({ runs: results ?? [] })
      }

      if (url.pathname === '/' || url.pathname === '/index.html') {
        const html = await dashboard(env, url)
        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...setCookie },
        })
      }

      return new Response('Not found', { status: 404 })
    } catch (err) {
      /*
       * Surface the real error. This dashboard has one user, and a stack trace
       * is worth more to them than a tidy message.
       */
      return json({ error: String(err), stack: err?.stack ?? null }, 500)
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runIngest(env))
  },
}
