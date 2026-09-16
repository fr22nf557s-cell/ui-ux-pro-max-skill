/*
 * Shared helpers for the Hornet Drones API.
 *
 * Every export here runs on the Cloudflare Workers runtime, so it uses Web
 * Crypto and fetch rather than any Node built-in.
 *
 * Environment bindings (set in the Pages dashboard, never in the repo):
 *   DB                    D1 binding — the waitlist database
 *   TURNSTILE_SECRET_KEY  secret — server half of the Turnstile keypair
 *   RESEND_API_KEY        secret — transactional email
 *   SITE_URL              var    — e.g. https://hornetdrones.com (no trailing slash)
 *   MAIL_FROM             var    — e.g. "Hornet Drones <alpha@hornetdrones.com>"
 */

export const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  // These endpoints are strictly same-origin. No CORS header is emitted at
  // all, so a cross-site fetch fails before it reaches the handler.
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } })
}

/**
 * Deliberately strict but not clever. Over-engineered email regexes reject
 * valid addresses; the real proof of validity is that the confirmation mail
 * arrives and the recipient clicks it.
 */
export function normaliseEmail(raw) {
  if (typeof raw !== 'string') return null
  const email = raw.trim().toLowerCase()
  if (email.length < 6 || email.length > 254) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null
  return email
}

/** 32 bytes of CSPRNG as hex. Used for both confirm and unsubscribe tokens. */
export function token() {
  const b = new Uint8Array(32)
  crypto.getRandomValues(b)
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/**
 * Constant-time string compare, so token lookups cannot be narrowed by timing.
 * D1 does the matching in SQL, but any comparison we do in JS uses this.
 */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** SHA-256 hex. Used to key rate limits without storing a raw IP. */
export async function sha256(input) {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/**
 * Fixed-window rate limit in D1.
 *
 * A fixed window can allow up to 2x the limit across a boundary. That is an
 * accepted trade here: the cost of an extra signup attempt is nil, and a
 * sliding window would need either Durable Objects or several more round
 * trips per request.
 *
 * Returns true when the caller is over budget.
 */
export async function rateLimited(db, key, { limit, windowSeconds }) {
  const now = Math.floor(Date.now() / 1000)
  const windowAt = now - (now % windowSeconds)
  const id = `${key}:${windowAt}`

  // One statement: insert, or bump the counter if this window already exists.
  const row = await db
    .prepare(
      `INSERT INTO rate_limit (key, hits, window_at) VALUES (?1, 1, ?2)
       ON CONFLICT(key) DO UPDATE SET hits = hits + 1
       RETURNING hits`,
    )
    .bind(id, windowAt)
    .first()

  // Opportunistic prune, ~2% of writes, so the table cannot grow without bound
  // and we still avoid a scheduled worker.
  if (Math.random() < 0.02) {
    await db.prepare('DELETE FROM rate_limit WHERE window_at < ?1').bind(windowAt - windowSeconds * 4).run()
  }

  return (row?.hits ?? 0) > limit
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * The widget token alone proves nothing — it MUST be exchanged with
 * siteverify using the secret key, which is why this cannot be done in the
 * browser. Each token is single-use and short-lived.
 */
export async function verifyTurnstile(secret, responseToken, remoteIp) {
  if (!responseToken || typeof responseToken !== 'string') return false

  const body = new FormData()
  body.append('secret', secret)
  body.append('response', responseToken)
  if (remoteIp) body.append('remoteip', remoteIp)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    if (!res.ok) return false
    const out = await res.json()
    return out.success === true
  } catch {
    // A siteverify outage must not silently disable the check.
    return false
  }
}

/**
 * Which Origins may POST to the API.
 *
 * The production host and its www variant, plus any *.pages.dev host: the
 * very first deploy lives on <project>.pages.dev before custom domains are
 * attached, and every preview deploy lives there permanently. Rejecting those
 * makes the form fail at precisely the moment someone first tests it.
 *
 * This is defence in depth only. A cross-site POST still needs a valid
 * Turnstile token, and those are bound to the site key's domain.
 */
export function originAllowed(origin, siteUrl) {
  let o
  try {
    o = new URL(origin)
  } catch {
    return false
  }
  if (o.protocol !== 'https:' && o.hostname !== 'localhost') return false
  if (o.hostname.endsWith('.pages.dev')) return true
  if (!siteUrl) return true // unset in local dev; nothing to compare against
  try {
    const site = new URL(siteUrl).hostname
    return o.hostname === site || o.hostname === `www.${site}`
  } catch {
    return false
  }
}

/**
 * Delete signups that never confirmed.
 *
 * The privacy notice promises unconfirmed addresses are removed after 30 days.
 * This is what makes that true. Runs on ~2% of signups so no cron is needed,
 * and keys on consent_at rather than created_at: consent_at refreshes on every
 * submit, so someone who re-signed up yesterday is never swept out because
 * their original row happens to be old.
 */
export async function pruneUnconfirmed(db) {
  if (Math.random() >= 0.02) return
  await db
    .prepare(`DELETE FROM waitlist WHERE confirmed_at IS NULL AND consent_at < datetime('now', '-30 days')`)
    .run()
}

/** Escape untrusted values before they reach an HTML email or response body. */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

/**
 * Send transactional mail via Resend.
 *
 * `listUnsubscribe` adds the RFC 8058 headers. Gmail and Yahoo require
 * one-click unsubscribe for bulk senders, and the POST variant is what makes
 * it one click rather than a landing page.
 */
export async function sendMail(env, { to, subject, html, text, listUnsubscribe }) {
  const headers = {}
  if (listUnsubscribe) {
    headers['List-Unsubscribe'] = `<${listUnsubscribe}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject, html, text, headers }),
  })

  if (!res.ok) {
    // Surface to Workers logs; never to the caller, since the body can echo
    // the recipient address back.
    console.error('resend failed', res.status, await res.text())
    return false
  }
  return true
}

/**
 * Email shell. Dark, minimal, matches the site.
 *
 * The mark is a hosted PNG (email clients cannot render inline SVG). Gmail
 * and Outlook hide remote images until the reader allows them, so the
 * wordmark is real text beside it and the message reads fine without it.
 * The image URL is the production domain by design: emails are opened
 * long after a preview deploy has gone, so it must never point at one.
 */
const MARK_URL = 'https://hornetdrones.com/press/hornet-mark.png'

export function mailShell(heading, bodyHtml, cta) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${heading}</title></head>
<body style="margin:0;background:#0b0c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c10;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:32px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px;vertical-align:middle"><img src="${MARK_URL}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border-radius:8px"></td>
    <td style="vertical-align:middle;line-height:1">
      <div style="color:#fff;font-size:18px;font-weight:700;font-style:italic;letter-spacing:-.01em">HORNET</div>
      <div style="color:#a8adb8;font-size:9px;font-weight:700;letter-spacing:.42em;padding-top:4px">DRONES</div>
    </td>
  </tr></table>
</td></tr>
<tr><td style="color:#fff;font-size:24px;font-weight:700;line-height:1.25;letter-spacing:-.02em;padding-bottom:16px">${heading}</td></tr>
<tr><td style="color:#a8adb8;font-size:15px;line-height:1.65">${bodyHtml}</td></tr>
${cta ? `<tr><td style="padding-top:28px"><a href="${cta.href}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:14px 28px;border-radius:999px">${cta.label}</a></td></tr>
<tr><td style="color:#a8adb8;font-size:12px;line-height:1.6;padding-top:18px">If the button does not work, open this link:<br><a href="${cta.href}" style="color:#fff;word-break:break-all">${cta.href}</a></td></tr>` : ''}
<tr><td style="color:#a8adb8;font-size:12px;line-height:1.6;padding-top:36px;margin-top:36px;border-top:1px solid #262a33">
  You are receiving this because this address was entered on the Hornet Drones alpha waitlist.<br>
  <a href="https://hornetdrones.com/" style="color:#a8adb8">hornetdrones.com</a> · <a href="https://hornetdrones.com/privacy" style="color:#a8adb8">Privacy notice</a>
</td></tr>
</table></td></tr></table></body></html>`
}

/**
 * Full-page HTML for the endpoints an email link opens directly (confirm,
 * unsubscribe). Same stylesheet, header and footer as the static pages, so
 * the last thing a signup sees looks like the site they signed up on.
 */
export function htmlPage(title, body, status = 200) {
  return new Response(
    `<!doctype html><html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark"><meta name="theme-color" content="#0B0C10"><meta name="robots" content="noindex">
<title>${escapeHtml(title)} — Hornet Drones</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/pages.css">
</head><body><div class="wrap">
<header class="pagehead"><a class="mark" href="/">HORNET<span>DRONES</span></a><nav aria-label="Site"><a href="/#hardware">Hardware</a><a href="/#how">How it works</a><a href="/#command">Command</a><a href="/#specs">Specs</a><a href="/#faq">FAQ</a><a class="pill" href="/#reserve">Reserve</a></nav></header>
<main>${body}</main>
<footer>© 2026 Hornet Drones. <a href="/">Back to the site</a><nav aria-label="Site pages"><a href="/about">About</a><a href="/press">Press</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></footer>
</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  )
}
