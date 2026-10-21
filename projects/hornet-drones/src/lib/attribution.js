/*
 * First-touch attribution.
 *
 * UTMs are read once on first arrival and kept in sessionStorage, so the
 * campaign that actually earned the visit survives the user bouncing around
 * the page, following an anchor, or coming back from an email confirmation.
 * Last-touch would credit whichever link happened to be most recent, which
 * for a single-page site is usually no link at all.
 *
 * sessionStorage rather than localStorage or a cookie: it expires with the
 * tab, is not sent to any server by default, and is not a cookie for the
 * purposes of PECR, so it needs no consent banner.
 */

const KEY = 'hrn_attribution'
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

/** Read whatever attribution we hold, capturing it on first call if present. */
export function getAttribution() {
  let stored = null
  try {
    stored = JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    // Private mode, blocked storage, or corrupt JSON. Attribution is a
    // nice-to-have; it must never break the form.
  }
  if (stored) return stored

  const params = new URLSearchParams(window.location.search)
  const utm = {}
  for (const f of FIELDS) {
    const v = params.get(f)
    if (v) utm[f] = v.slice(0, 200)
  }

  // Google Ads and Meta send click IDs rather than UTMs on some setups.
  const gclid = params.get('gclid')
  if (gclid && !utm.utm_source) {
    utm.utm_source = 'google'
    utm.utm_medium = 'cpc'
  }

  const captured = {
    utm,
    // Same-origin referrers are internal navigation, not acquisition.
    referrer: referrerIfExternal(),
  }

  try {
    sessionStorage.setItem(KEY, JSON.stringify(captured))
  } catch {
    /* non-fatal */
  }
  return captured
}

function referrerIfExternal() {
  const ref = document.referrer
  if (!ref) return null
  try {
    if (new URL(ref).origin === window.location.origin) return null
  } catch {
    return null
  }
  return ref.slice(0, 200)
}
