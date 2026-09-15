import { json, normaliseEmail, token, sha256, rateLimited, verifyTurnstile, sendMail, mailShell, originAllowed, pruneUnconfirmed } from '../_shared.js'

/*
 * POST /api/waitlist — join the alpha waitlist.
 *
 * Order of checks is deliberate: the cheap local ones run before anything
 * that costs a network round trip or a database write, so a flood of junk is
 * rejected without spending a Turnstile call or a D1 query.
 *
 *   1. Origin        — same-origin only
 *   2. Body shape    — size-capped, JSON, honeypot
 *   3. Email syntax
 *   4. Consent       — must be explicit
 *   5. Rate limit    — per-IP, D1
 *   6. Turnstile     — network call, so it goes last before writing
 *   7. Upsert + send confirmation
 *
 * The response is deliberately identical whether the address is new or
 * already on the list. Telling the caller "already registered" turns the
 * endpoint into an account-existence oracle.
 */

const MAX_BODY = 4096 // bytes; a legitimate submission is ~400

export async function onRequestPost({ request, env }) {
  const db = env.DB

  // ── 1. Same-origin. No CORS headers are ever sent, but a form POST from
  //    another site would still arrive, so Origin is checked explicitly.
  //    Accepted: the production host, its www variant, and *.pages.dev —
  //    the first deploy and every preview deploy live there, and rejecting
  //    them means the form fails at exactly the moment it is first tested.
  //    This is defence in depth; Turnstile is the real gate.
  const origin = request.headers.get('Origin')
  if (origin && !originAllowed(origin, env.SITE_URL)) {
    return json({ error: 'Bad origin.' }, 403)
  }

  // ── 2. Body
  const raw = await request.text()
  if (raw.length > MAX_BODY) return json({ error: 'Payload too large.' }, 413)

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return json({ error: 'Malformed request.' }, 400)
  }

  // Honeypot: a hidden field real users never see. Bots fill everything.
  // Answer 200 so the bot records a success and does not retry or adapt.
  if (payload.company) return json({ ok: true })

  // ── 3. Email
  const email = normaliseEmail(payload.email)
  if (!email) return json({ error: 'Enter a valid email address.', field: 'email' }, 400)

  // ── 4. Consent must be affirmative and we record exactly what was agreed to,
  //    because UK GDPR requires evidence of how consent was obtained.
  if (payload.consent !== true || typeof payload.consentText !== 'string' || !payload.consentText.trim()) {
    return json({ error: 'Please tick the consent box to continue.', field: 'consent' }, 400)
  }
  const consentText = payload.consentText.slice(0, 500)

  // ── 5. Rate limit, keyed on hashed IP so no raw address is stored.
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0'
  const ipKey = await sha256(`wl:${ip}`)
  if (await rateLimited(db, ipKey, { limit: 5, windowSeconds: 3600 })) {
    return json({ error: 'Too many attempts. Try again later.' }, 429, { 'Retry-After': '3600' })
  }

  // Keep the privacy notice true: unconfirmed rows do not live forever.
  await pruneUnconfirmed(db)

  // ── 6. Turnstile. Last gate before any write.
  const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, payload.turnstileToken, ip)
  if (!ok) return json({ error: 'Verification failed. Please try again.', field: 'turnstile' }, 400)

  // ── 7. Upsert.
  const confirmToken = token()
  const unsubToken = token()
  const utm = payload.utm && typeof payload.utm === 'object' ? payload.utm : {}
  const clip = (v) => (typeof v === 'string' ? v.slice(0, 200) : null)

  // ON CONFLICT rather than SELECT-then-INSERT: the UNIQUE index decides,
  // so two simultaneous submits cannot both create a row. On a repeat signup
  // we issue a fresh confirm token (the old link may have expired), record
  // the new consent act, and leave created_at and the first-touch UTMs alone.
  const row = await db
    .prepare(
      `INSERT INTO waitlist
         (email, confirm_token, unsub_token, consent_text, ip_country,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(email) DO UPDATE SET
         confirm_token   = CASE WHEN waitlist.confirmed_at IS NULL OR waitlist.unsubscribed_at IS NOT NULL
                                THEN ?2 ELSE waitlist.confirm_token END,
         confirmed_at    = CASE WHEN waitlist.unsubscribed_at IS NOT NULL
                                THEN NULL ELSE waitlist.confirmed_at END,
         unsubscribed_at = NULL,
         -- A repeat submit is a fresh consent event; the record must say so.
         consent_text    = ?4,
         consent_at      = datetime('now')
       RETURNING id, confirm_token, unsub_token, confirmed_at`,
    )
    .bind(
      email,
      confirmToken,
      unsubToken,
      consentText,
      request.cf?.country ?? null,
      clip(utm.utm_source),
      clip(utm.utm_medium),
      clip(utm.utm_campaign),
      clip(utm.utm_term),
      clip(utm.utm_content),
      clip(payload.referrer),
    )
    .first()

  // Already confirmed AND still subscribed: send nothing. Re-mailing a
  // confirmed address on every repeat submit is an easy way to get a sending
  // domain reported. A previously-unsubscribed row had confirmed_at cleared
  // above, so it correctly falls through and must confirm again.
  if (row?.confirmed_at) return json({ ok: true })

  const confirmUrl = `${env.SITE_URL}/api/confirm?token=${row.confirm_token}`
  const unsubUrl = `${env.SITE_URL}/api/unsubscribe?token=${row.unsub_token}`

  const sent = await sendMail(env, {
    to: email,
    subject: 'Confirm your Hornet Drones alpha place',
    listUnsubscribe: unsubUrl,
    text: `Confirm your place on the Hornet Drones alpha waitlist:\n\n${confirmUrl}\n\nIf you did not request this, ignore this email — nothing happens without the click above.`,
    html: mailShell(
      'Confirm your place',
      `<p style="margin:0">One click and you are on the alpha list for the HRN-01.</p>
       <p style="margin:16px 0 0">If you did not request this, ignore this email. Nothing happens without the confirmation below, and the address is removed automatically.</p>`,
      { href: confirmUrl, label: 'Confirm my place' },
    ),
  })

  if (!sent) {
    // The row is saved; only the email failed. A retry re-issues the token
    // and sends again, so this is recoverable by the user, not just by ops.
    return json(
      { error: "Your address is saved, but we couldn't send the confirmation email. Please try again in a minute." },
      502,
      { 'Retry-After': '60' },
    )
  }

  // Identical response whether new, unconfirmed-repeat, or already-confirmed.
  return json({ ok: true })
}

// Only POST is exported, so Pages answers every other method with 405.
