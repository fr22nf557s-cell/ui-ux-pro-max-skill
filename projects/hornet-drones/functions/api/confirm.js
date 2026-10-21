import { htmlPage } from '../_shared.js'

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

const page = htmlPage

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get('token')

  // Shape-check before touching the database: the token is always 64 hex chars,
  // so anything else is noise and never reaches D1.
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return page('Invalid link', `<p class="eyebrow">Alpha waitlist</p><h1>That link isn't valid</h1><p>It may have been truncated by your email client. Try copying the whole URL, or join again from the site.</p><div class="cta-row"><a class="cta" href="${env.SITE_URL}/#reserve">Back to the site</a></div>`, 400)
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
      `<p class="eyebrow">Alpha waitlist</p><h1>You're on the list</h1><p>Your place on the HRN-01 alpha is confirmed. We'll be in touch before units ship — no newsletter, no noise.</p><div class="cta-row"><a class="cta" href="${env.SITE_URL}/">Back to the site</a></div>`,
    )
  }

  // Either already confirmed, or the token is unknown. Both get the same
  // reassuring answer: distinguishing them would leak which addresses exist.
  return page(
    'Already confirmed',
    `<p class="eyebrow">Alpha waitlist</p><h1>Already confirmed</h1><p>This address is on the list. Nothing further to do.</p><div class="cta-row"><a class="cta" href="${env.SITE_URL}/">Back to the site</a></div>`,
  )
}
