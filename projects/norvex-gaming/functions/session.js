/* Cloudflare Pages Function: POST /session → Stripe Checkout Session.
   Same code as checkout/worker.js, served from the site's own origin so the
   storefront's config.checkout.endpoint can simply be "/session".
   Set STRIPE_SECRET_KEY (secret) and SITE_URL on the Pages project. */
import worker from '../checkout/worker.js';
export const onRequest = ({ request, env }) => worker.fetch(request, env);
