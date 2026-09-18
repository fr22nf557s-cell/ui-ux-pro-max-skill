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
 * ── A warning about the response shape ───────────────────────────────────────
 * This file was written against the published API documentation, not against a
 * live response, because the network this was authored on could not reach
 * either service. The envelope each service wraps its releases in is therefore
 * the least certain thing here.
 *
 * `collectReleases` exists for exactly that reason: rather than reaching into
 * a documented path like `body.results[0].releases`, it walks the whole JSON
 * tree and picks out every object that looks like an OCDS release. That is
 * slower and less elegant, and it survives an envelope that differs from the
 * documentation. Run /api/selftest after deploying to see the real shape.
 */

import { classify, score, supplierSlug, cpvStem } from './score.js'

export const SOURCES = {
  contracts_finder: {
    label: 'Contracts Finder',
    /*
     * Documented as GET /Published/Notices/OCDS/Search. Keyword search plus a
     * published-from watermark; the API has no CPV filter, so relevance is
     * decided locally by classify().
     */
    url({ since, keyword }) {
      const u = new URL('https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search')
      u.searchParams.set('publishedFrom', since)
      if (keyword) u.searchParams.set('keyword', keyword)
      u.searchParams.set('stages', 'planning,tender,award,contract')
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
     */
    url({ since }) {
      const u = new URL('https://www.find-tender.service.gov.uk/api/1.0/ocdsReleasePackages')
      u.searchParams.set('updatedFrom', since)
      u.searchParams.set('limit', '100')
      return u.toString()
    },
    noticeUrl: (id) => `https://www.find-tender.service.gov.uk/Notice/${encodeURIComponent(id)}`,
  },
}

/*
 * Keywords passed to Contracts Finder's own search, to keep the volume down
 * before classify() runs. Each is fetched separately; Contracts Finder takes a
 * single keyword per query.
 */
export const SEARCH_KEYWORDS = ['drone', 'unmanned aerial', 'UAV', 'remotely piloted']

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
