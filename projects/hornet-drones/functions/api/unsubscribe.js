import { escapeHtml } from '../_shared.js'

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

function page(title, body, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} — Hornet Drones</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c10;color:#fff;
       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;padding:24px}
  .card{max-width:440px;text-align:center}
  .mark{font-size:17px;font-weight:700;letter-spacing:-.01em}
  .mark span{font-size:9px;letter-spacing:.34em;color:#a8adb8;padding-left:8px}
  h1{font-size:26px;line-height:1.25;margin:32px 0 12px}
  p{color:#a8adb8;font-size:15px;line-height:1.65;margin:0}
  a.btn{display:inline-block;margin-top:28px;background:#fff;color:#000;text-decoration:none;
        font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
        padding:14px 28px;border-radius:999px}
  a.btn:focus-visible{outline:2px solid #fff;outline-offset:3px}
</style></head><body><main class="card">
<div class="mark">HORNET<span>DRONES</span></div>
${body}
</main></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  )
}

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
    return page('Invalid link', `<h1>That link isn't valid</h1><p>It may have been truncated by your email client. Reply to any of our emails and we'll remove you by hand.</p>`, 400)
  }

  return page(
    'Unsubscribed',
    `<h1>You're unsubscribed</h1><p>This address has been removed from the Hornet Drones alpha list. You won't hear from us again unless you sign up a second time.</p><a class="btn" href="${env.SITE_URL}/">Back to the site</a>`,
  )
}
