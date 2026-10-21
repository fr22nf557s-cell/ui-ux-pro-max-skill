import { htmlPage } from '../_shared.js'

/*
 * /api/unsubscribe?token=… — RFC 8058 one-click unsubscribe.
 *
 * Two methods, both required:
 *
 *   POST  Gmail and Yahoo send this automatically when the user clicks the
 *         mail client's own unsubscribe control, driven by the
 *         List-Unsubscribe-Post header. It must succeed with no confirmation
 *         step and no login — that is what "one click" means, and bulk
 *         senders to those providers are required to support it.
 *   GET   A human following the link in the email body.
 *
 * Unsubscribing is idempotent and always reports success, so a replayed
 * POST from a mail provider never looks like a failure.
 */

const page = htmlPage

async function unsubscribe(env, token) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false
  await env.DB.prepare(
    `UPDATE waitlist
        SET unsubscribed_at = datetime('now')
      WHERE unsub_token = ?1 AND unsubscribed_at IS NULL`,
  )
    .bind(token)
    .run()
  // Deliberately not reporting whether a row changed: an unknown or
  // already-used token must look the same as a successful removal.
  return true
}

/** Mail providers POST here. Answer 200 quickly, no body required. */
export async function onRequestPost({ request, env }) {
  const url = new URL(request.url)
  let token = url.searchParams.get('token')

  // Some providers post the RFC 8058 body instead of preserving the query.
  if (!token) {
    const body = await request.text()
    token = new URLSearchParams(body).get('token')
  }

  await unsubscribe(env, token)
  return new Response(null, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}

/** A person clicking the link in the email body. */
export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get('token')
  const ok = await unsubscribe(env, token)

  if (!ok) {
    return page('Invalid link', `<p class="eyebrow">Alpha waitlist</p><h1>That link isn't valid</h1><p>It may have been truncated by your email client. Reply to any of our emails and we'll remove you by hand.</p>`, 400)
  }

  return page(
    'Unsubscribed',
    `<p class="eyebrow">Alpha waitlist</p><h1>You're unsubscribed</h1><p>This address has been removed from the Hornet Drones alpha list. You won't hear from us again unless you sign up a second time.</p><div class="cta-row"><a class="cta" href="${env.SITE_URL}/">Back to the site</a></div>`,
  )
}
