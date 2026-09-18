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

export default {
  async fetch(request, env) {
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

      if (url.pathname === '/api/ingest' && request.method === 'POST') {
        return json(await runIngest(env))
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
