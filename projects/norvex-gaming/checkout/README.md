# Checkout (Stripe)

The storefront is static, so payment runs through one small server-side function,
`worker.js`, that turns the shopper's cart into a Stripe Checkout Session. Stripe hosts the
payment page (card, Apple Pay, Google Pay, Klarna if enabled, address, receipt); the shopper
returns to the site afterwards. The secret key lives only in the function's settings.

## Deploy on Cloudflare Workers (free tier is plenty)

1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
   Name it `norvex-checkout` and click **Deploy** (it deploys a hello-world first).
2. Click **Edit code**, delete the sample, paste the whole of `worker.js`, click **Deploy**.
3. **Settings → Variables and Secrets** → add:
   - `STRIPE_SECRET_KEY` — type *Secret* — your key from https://dashboard.stripe.com/apikeys
     (`sk_live_…` to take real payments, `sk_test_…` to try it first)
   - `SITE_URL` — `https://norvexgaming.com`
   Optional: `SHIP_COUNTRIES` (`GB,IE,FR,DE`), `SHIPPING_STANDARD` (pence, default 499, free above
   the catalogue's free-shipping threshold), `SHIPPING_EXPRESS` (pence, default 999; `0` hides it).
4. Copy the worker's URL from its overview page, e.g. `https://norvex-checkout.<you>.workers.dev`.
5. Put that URL, with `/session` on the end, into `assets/js/catalog.js`:

   ```js
   "checkout": { "provider": "stripe", "endpoint": "https://norvex-checkout.<you>.workers.dev/session" }
   ```

   Commit and push; the site redeploys and the cart's **Secure checkout** button goes live.

Open `https://norvex-checkout.<you>.workers.dev/` in a browser: `{"ok":true,…,"configured":true}`
confirms the key is set.

## Test before going live

Set `STRIPE_SECRET_KEY` to a `sk_test_…` key, add something to the cart, check out with card
number `4242 4242 4242 4242`, any future expiry, any CVC. The order appears under
**Payments** in the Stripe test dashboard. Swap the secret to `sk_live_…` when happy.

## What Stripe should be told once

- **Settings → Customer emails**: turn on *Successful payments* so shoppers get a receipt.
- **Settings → Payment methods**: enable Apple Pay / Google Pay / Klarna as you like; Checkout
  shows them automatically.
- **Settings → Public details**: business name, support email and address shown on receipts.

## What the function checks

Every cart line is looked up in the live `catalog.js` by product id: the price, name and photo
come from the catalogue, never from the browser; quantities are capped at stock (10 for
pre-orders); unknown ids and empty carts are refused; requests are only accepted from the
storefront's origin. Shipping is a fixed rate per order (free above `freeShippingThreshold`),
plus an optional express option. Pre-orders are flagged in the session's metadata so you can
tell them apart in the dashboard.

## Orders and stock

Stripe's dashboard is the order list: each payment carries the product ids and quantities in
its metadata and the delivery address. Stock in `catalog.js` is a display value; update it
(and re-push) as you sell, or move the catalogue into a platform when volume justifies it.
