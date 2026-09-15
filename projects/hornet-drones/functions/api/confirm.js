import { escapeHtml } from '../_shared.js'

/*
 * GET /api/confirm?token=… — completes double opt-in.
 *
 * Returns HTML rather than JSON because this URL is opened directly from an
 * email client, not by our own JS.
 *
 * The token is cleared on use, so the link cannot be replayed. That also
 * means a second click lands on the "already confirmed" branch rather than
 * an error, which is what a user who double-clicks actually expects.
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

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get('token')

  // Shape-check before touching the database: the token is always 64 hex chars,
  // so anything else is noise and never reaches D1.
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return page('Invalid link', `<h1>That link isn't valid</h1><p>It may have been truncated by your email client. Try copying the whole URL, or join again from the site.</p><a class="btn" href="${env.SITE_URL}/#reserve">Back to the site</a>`, 400)
  }

  // Single statement: confirm and clear the token together, so a replayed
  // link matches nothing. `changes` tells us whether this click did the work.
  const res = await env.DB.prepare(
    `UPDATE waitlist
        SET confirmed_at = datetime('now'), confirm_token = NULL
      WHERE confirm_token = ?1 AND confirmed_at IS NULL`,
  )
    .bind(token)
    .run()

  if (res.meta?.changes === 1) {
    return page(
      'Confirmed',
      `<h1>You're on the list</h1><p>Your place on the HRN-01 alpha is confirmed. We'll be in touch before units ship — no newsletter, no noise.</p><a class="btn" href="${env.SITE_URL}/">Back to the site</a>`,
    )
  }

  // Either already confirmed, or the token is unknown. Both get the same
  // reassuring answer: distinguishing them would leak which addresses exist.
  return page(
    'Already confirmed',
    `<h1>Already confirmed</h1><p>This address is on the list. Nothing further to do.</p><a class="btn" href="${env.SITE_URL}/">Back to the site</a>`,
  )
}
