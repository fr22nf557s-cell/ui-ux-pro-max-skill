/* Worker entry for the all-in-one Cloudflare deployment (see wrangler.jsonc):
   POST /session → Stripe Checkout (checkout/worker.js); everything else → the static site. */
import checkout from './worker.js';
export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (/^\/session\/?$/.test(pathname)) return checkout.fetch(request, env);
    return env.ASSETS.fetch(request);
  }
};
