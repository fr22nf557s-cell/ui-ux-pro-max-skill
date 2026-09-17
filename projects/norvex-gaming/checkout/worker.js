/* ==========================================================================
   NORVEX GAMING — Stripe Checkout function
   --------------------------------------------------------------------------
   Turns the storefront's cart into a Stripe Checkout Session. Runs as a
   Cloudflare Worker (paste this file into the dashboard editor); the same
   `export default { fetch }` shape also runs on Vercel Edge or Deno Deploy.

   The browser POSTs { items: [{ id, qty }] } to /session. This function
   looks every id up in the live catalogue (assets/js/catalog.js on the
   site), takes the price, name and photo from there — never from the
   browser — and asks Stripe for a hosted checkout page. Stripe handles the
   card, address, receipt and fraud checks; the shopper comes back to the
   site with ?checkout=success or ?checkout=cancelled.

   Settings (Worker → Settings → Variables):
     STRIPE_SECRET_KEY   secret  sk_live_… (or sk_test_… while testing)
     SITE_URL            https://norvexgaming.com          (default)
     CATALOG_URL         ${SITE_URL}/assets/js/catalog.js   (default)
     ALLOWED_ORIGINS     https://norvexgaming.com,https://www.norvexgaming.com
     SHIP_COUNTRIES      GB                                 (comma-separated ISO codes)
     SHIPPING_STANDARD   499   pence, free above the catalogue's freeShippingThreshold
     SHIPPING_EXPRESS    999   pence, set to 0 to hide the express option
     REQUIRE_TERMS       true  make shoppers accept your terms (needs a Terms URL under
                               Stripe → Settings → Public details first)
   ========================================================================== */

const CATALOG_TTL_MS = 5 * 60 * 1000;
let cached = { at: 0, url: '', data: null };

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

/* Stripe's form encoding: nested objects and arrays become bracketed keys. */
export function toForm(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? toForm(item, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))));
    else if (typeof v === 'object') toForm(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

/* catalog.js is `window.NORVEX_DATA = { config: {...}, games: {...}, types: {...}, products: [...] };` */
export function parseCatalog(text) {
  const m = /window\.NORVEX_DATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$/.exec(text.trim());
  if (!m) throw new Error('catalog.js does not contain window.NORVEX_DATA');
  const data = JSON.parse(m[1].replace(/^(\s*)(config|games|types|products):/gm, '$1"$2":'));
  return { ...data, byId: Object.fromEntries(data.products.map((p) => [p.id, p])) };
}

/* The catalogue comes from the Worker's own static assets when the site is deployed with it
   (wrangler.jsonc `assets`), otherwise from CATALOG_URL / the live site. */
async function loadCatalog(env, site, request) {
  const own = env.ASSETS && request ? new URL('/assets/js/catalog.js', request.url).href : null;
  const url = own || env.CATALOG_URL || `${site}/assets/js/catalog.js`;
  if (cached.data && cached.url === url && Date.now() - cached.at < CATALOG_TTL_MS) return cached.data;
  const res = own ? await env.ASSETS.fetch(new Request(own)) : await fetch(url, { headers: { Accept: 'application/javascript,*/*' } });
  if (!res.ok) throw new Error(`Could not load the catalogue (${res.status})`);
  cached = { at: Date.now(), url, data: parseCatalog(await res.text()) };
  return cached.data;
}

export async function buildSession(items, catalog, env, site, imageBase = site) {
  if (!items.every((it) => it && typeof it.id === 'string' && it.id.length < 120)) throw Object.assign(new Error('Bad cart'), { status: 400 });
  const currency = String(catalog.config.currency || 'GBP').toLowerCase();
  const lines = []; let subtotal = 0; let preorder = false;
  for (const it of items) {
    const p = catalog.byId[String(it.id)]; const qty = Math.floor(Number(it.qty));
    if (!p) throw Object.assign(new Error(`Unknown product: ${it.id}`), { status: 400 });
    if (!(qty >= 1 && qty <= 99)) throw Object.assign(new Error(`Bad quantity for ${p.name}`), { status: 400 });
    const max = p.preorder ? 10 : Number(p.stock || 0);
    if (qty > max) throw Object.assign(new Error(max ? `Only ${max} of ${p.name} can be ordered` : `${p.name} is sold out`), { status: 400 });
    if (p.preorder) preorder = true;
    const image = p.image ? (/^https?:/i.test(p.image) ? p.image : `${imageBase}/${p.image}`) : null;
    lines.push({
      quantity: qty,
      price_data: { currency, unit_amount: Math.round(Number(p.price) * 100),
        product_data: { name: p.name, description: [p.set, p.preorder ? 'Pre-order' : null].filter(Boolean).join(' · ') || undefined, images: image ? [image] : undefined, metadata: { id: p.id, game: p.game, type: p.type } } }
    });
    subtotal += Number(p.price) * qty;
  }
  const free = subtotal >= Number(catalog.config.freeShippingThreshold ?? 100);
  const standard = Number(env.SHIPPING_STANDARD ?? 499); const express = Number(env.SHIPPING_EXPRESS ?? 999);
  const rate = (amount, name, min, max) => ({ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount, currency }, display_name: name, delivery_estimate: { minimum: { unit: 'business_day', value: min }, maximum: { unit: 'business_day', value: max } } } });
  const shipping_options = [rate(free ? 0 : standard, free ? 'Free tracked & insured delivery' : 'Tracked & insured delivery', 2, 4)];
  if (express > 0) shipping_options.push(rate(express, 'Next working day, insured', 1, 1));
  return {
    mode: 'payment',
    line_items: lines,
    success_url: `${site}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/?checkout=cancelled`,
    shipping_address_collection: { allowed_countries: String(env.SHIP_COUNTRIES || 'GB').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) },
    shipping_options,
    billing_address_collection: 'auto',
    phone_number_collection: { enabled: true },
    allow_promotion_codes: true,
    customer_creation: 'if_required',
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,      // an abandoned session releases its stock after 30 minutes
    ...(String(env.REQUIRE_TERMS || '').toLowerCase() === 'true' ? { consent_collection: { terms_of_service: 'required' } } : {}),
    metadata: { store: catalog.config.storeName || 'Norvex Gaming', preorder: String(preorder), items: items.map((i) => `${i.id}x${i.qty}`).join(',').slice(0, 490) }
  };
}

export default {
  async fetch(request, env) {
    const site = String(env.SITE_URL || 'https://norvexgaming.com').replace(/\/$/, '');
    const allowed = String(env.ALLOWED_ORIGINS || `${site},${site.replace('https://', 'https://www.')}`).split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const cors = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (request.method === 'GET') return json({ ok: true, service: 'norvex-checkout', configured: Boolean(env.STRIPE_SECRET_KEY) }, 200, cors);
    if (request.method !== 'POST' || !/\/session\/?$/.test(url.pathname)) return json({ error: 'Not found' }, 404, cors);
    if (!env.STRIPE_SECRET_KEY) return json({ error: 'Checkout is not configured yet (STRIPE_SECRET_KEY missing)' }, 500, cors);
    let body; try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400, cors); }
    const items = Array.isArray(body && body.items) ? body.items : [];
    const idem = typeof body.key === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(body.key) ? body.key : null; // one Stripe session per checkout click, even on retries
    if (!items.length) return json({ error: 'Your cart is empty' }, 400, cors);
    if (items.length > 50) return json({ error: 'Too many items in one order' }, 400, cors);
    try {
      const catalog = await loadCatalog(env, site, request);
      // Stripe fetches product photos itself: serve them from this Worker's own origin when it hosts the site
      // (always a valid certificate), otherwise from the public site.
      const imageBase = env.ASSETS ? new URL(request.url).origin : site;
      const session = await buildSession(items, catalog, env, site, imageBase);
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST', headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', ...(idem ? { 'Idempotency-Key': idem } : {}) }, body: toForm(session)
      });
      const data = await res.json();
      if (!res.ok || !data.url) return json({ error: (data.error && data.error.message) || 'Stripe rejected the request' }, 502, cors);
      return json({ url: data.url, id: data.id }, 200, cors);
    } catch (e) {
      return json({ error: e.message || 'Checkout is unavailable right now' }, e.status || 500, cors);
    }
  }
};
