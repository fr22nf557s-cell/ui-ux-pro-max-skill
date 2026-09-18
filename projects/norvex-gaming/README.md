# Norvex Gaming — storefront

The online shop for **Norvex Gaming**, an independent UK trading card retailer: factory-sealed
product (booster boxes, bundles, packs, Elite Trainer Boxes, decks, collections), pre-orders and
official accessories across Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh!, Disney Lorcana,
Star Wars: Unlimited, Digimon and Dragon Ball Super, with room for graded singles.

It is a static site (no framework, no build tooling at runtime) plus one small Cloudflare Worker
that creates Stripe Checkout sessions. Every product carries an official publisher packshot.

**Prices are estimated UK RRP and stock levels are placeholders.** Verify both against your
inventory before taking orders (see *Before you show customers*).

## Pages

| File | What it does |
|------|--------------|
| `index.html` | Home: hero, what every order gets, brand marquee, new arrivals, category tiles, the Norvex standard, pre-orders, buying guide, allocation list |
| `shop.html` | Catalogue with live filters (game, product type, availability, price), sort, search, URL-addressable state (`?game=pokemon&type=etb&avail=preorder&sort=price-asc&q=…`) |
| `product.html?id=<id>` | Product detail: photo, price, stock, quantity, add to cart / pre-order, contents, details, delivery and returns, authenticity, related products |
| `order.html?session_id=…` | Order confirmation after Stripe Checkout (items, totals, delivery address, what happens next); `noindex` |
| `help.html` | Delivery & insurance, returns & refunds, authenticity guarantee, pre-orders, order tracking, contact |
| `about.html` | Who we are, what we sell, the vault, trade & wholesale, sell your cards |
| `legal.html` | Terms of sale, privacy, cookies & storage |
| `404.html` | Not-found page (served by GitHub Pages and by the Worker's `not_found_handling`) |

Shared across every page (rendered by `assets/js/norvex.js`): sticky glass header, mobile menu,
search palette (`/` or `Ctrl/Cmd+K`), cart drawer with free-delivery progress (persisted in
`localStorage`), toasts, business details and contact links filled from the catalogue config.

## Structure

```
projects/norvex-gaming/
├── *.html                    # generated pages (edit scripts/build-pages.py, not these)
├── assets/
│   ├── css/norvex.css        # design tokens + components (dark luxury, glass, gold accent)
│   ├── js/catalog.js         # ALL product / game / type data + store config
│   ├── js/norvex.js          # storefront runtime (cart, search, filters, PDP, checkout, order page)
│   └── img/products/         # one official packshot per product, <product id>.webp
├── checkout/                 # Stripe Checkout Worker (worker.js) + Worker entry that also serves the site
├── functions/session.js      # the same checkout as a Cloudflare Pages Function, if you host on Pages
├── scripts/
│   ├── build-pages.py        # HTML generator: python3 scripts/build-pages.py
│   ├── fetch-gallery.mjs     # download every packshot from a publisher gallery (Playwright)
│   ├── match-images.mjs      # pair downloaded images with products by name
│   ├── catalog-from-galleries.mjs · tidy-catalog.mjs · catalog-rules.mjs · catalog-overrides.json
│   ├── import-catalog.mjs    # CSV → catalog.js (validates rows + image paths)
│   └── catalog-io.mjs        # shared load/write helpers
├── build.sh                  # assembles _site/ (pages, assets, CNAME, _headers, robots.txt, sitemap.xml)
├── wrangler.jsonc            # Cloudflare Worker config: site as static assets + /session checkout
└── CNAME                     # custom domain for GitHub Pages
```

## Editing the site

**Pages.** The HTML files are generated. Change copy or layout in `scripts/build-pages.py`, then:

```bash
python3 scripts/build-pages.py
```

Sections that depend on the catalogue are computed at build time: the game list and count, the brand
marquee, and everything about graded singles (the nav link, the vault section, the category tile) only
appears once at least one product with `"type": "single"` exists.

**Store settings** live in the `config` block of `assets/js/catalog.js`:

| Key | Used for |
|-----|----------|
| `storeName`, `supportEmail` | Titles, every "email us" link, the newsletter and restock requests |
| `business` | Legal name (the Companies House name), trading name, registered office address lines, `registeredIn` (e.g. England and Wales), company and VAT numbers, reply hours; rendered on the help and legal pages and in the footer copyright (empty fields are skipped) |
| `shipping` | Standard and express prices, free-delivery threshold, countries, dispatch window; shown on product pages. Keep in step with the Worker's `SHIPPING_*` settings |
| `returnsDays` | Change-of-mind window shown on product pages |
| `social` | Optional `{ "Instagram": "https://…", "TikTok": "https://…" }`; the footer links render only when set |
| `checkout.endpoint` | Where the cart is POSTed: the Worker's `/session` URL |

**Product manager (no code).** `manage.html` is an unlisted page on the site (`noindex`, kept out of
robots and the sitemap) for changing prices and stock, adding a product with a photo, or removing
one, then publishing in one click. It reads the catalogue straight from GitHub and publishes a
commit on the deploy branch under the owner's own GitHub account, so the site rebuilds itself. It
needs a fine-grained personal access token with *Contents: read and write* on this one repository;
the token is stored only in that browser. Unpublished changes are kept in the browser until
published or discarded, and every publish is validated with the same rules as the build. Photos are
resized and converted to WebP in the browser. The repository, branch and folder it targets are
constants at the top of `assets/js/manage.js` (and can be overridden under "Repository details" on
the connect screen).

**Prices and stock** are quickest to correct in a spreadsheet:

```bash
node scripts/catalog-sheet.mjs export prices.csv      # one row per product: id, name, price, compareAt, stock, preorder
# edit the price / stock / preorder columns in Excel, Numbers or Google Sheets, save as CSV
node scripts/catalog-sheet.mjs import prices.csv --dry-run   # shows every change and refuses bad rows
node scripts/catalog-sheet.mjs import prices.csv             # writes assets/js/catalog.js
```

Only those columns are read; names, photos and descriptions are untouched, and a row with an unknown id is skipped rather than added.

Every build runs `node scripts/check-catalog.mjs` first: a catalogue that does not parse, a product with a bad price or stock, an unknown game or type, a duplicate id or a missing photo fails the deploy and the previous version stays live. Run it yourself after editing by hand.

**Products** are the `products` array. Each needs a unique `id` (used in URLs and image names),
`game`, `type`, `name`, `set`, `price`, `stock`, `image` (`assets/img/products/<id>.webp`) and
optionally `preorder`, `releaseDate`, `maxQty`, `compareAt`, `contents`, `specs`, `description`.

**Graded singles.** Add them by hand with your own photo of the actual slab, cert label visible:

```js
{ "id": "pokemon-charizard-ex-199-165-psa-10", "game": "pokemon", "type": "single",
  "name": "Charizard ex 199/165 PSA 10", "set": "Scarlet & Violet 151", "price": 1350, "stock": 1, "maxQty": 1,
  "grade": { "grader": "PSA", "grade": 10, "label": "Gem Mint", "cert": "12345678" },
  "image": "assets/img/products/pokemon-charizard-ex-199-165-psa-10.webp", "featured": true }
```

Then run `python3 scripts/build-pages.py` so the vault sections come back.

Products created or edited in the product manager carry `"manual": true`. The image pipeline
(`tidy-catalog.mjs`, `catalog-from-galleries.mjs`) leaves those exactly as they are: no renames,
merges, drops or featured re-picks. Pre-orders with a `releaseDate` (ISO date) show it on the card and
product page and in the structured data.

**Photos.** The catalogue rule is *no photo, no listing* (`tidy-catalog.mjs --photos-only`).
Publisher packshots are pulled from the publishers' public product galleries:

```bash
npm install                                          # once: Playwright + headless Chromium
npm run fetch -- "https://www.pokemon.com/uk/pokemon-tcg/product-gallery"   # one gallery
npm run match -- --apply                             # pair files with products, copy in, set image
npm run catalog:galleries -- --apply --replace       # everything else the galleries list → products
npm run tidy -- --apply --photos-only                # house-style names, duplicates, featured picks
```

The same pipeline runs in GitHub Actions (*Norvex – fetch product images*, or any push whose commit
message contains `[fetch-images]`) and commits the results to the branch. Anything the rules cannot
know goes in `scripts/catalog-overrides.json`, keyed by product id, so it survives the next run.

## Build & deploy

```bash
bash build.sh        # → _site/: pages, assets, CNAME, _headers, robots.txt, sitemap.xml, cache-busted asset URLs
python3 -m http.server 8080 --directory _site       # preview exactly what ships
```

**GitHub Pages** (`.github/workflows/norvex-pages.yml`): every push touching this folder builds
`_site/` and publishes it to the `gh-pages` branch. Settings → Pages → Source: *Deploy from a branch*
→ `gh-pages`. The custom domain comes from `CNAME`. DNS at the registrar: A records for the bare
domain to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `CNAME`
from `www` to `<owner>.github.io`. Tick *Enforce HTTPS* once the certificate is issued.

**Cloudflare Worker** (`wrangler.jsonc`): Workers & Pages → Create → Import a repository, root
directory `projects/norvex-gaming`, build command `bash build.sh`, deploy command
`npx wrangler deploy`, production branch = this branch. The Worker serves `_site/` as static assets
and answers `/session` for checkout. Add `STRIPE_SECRET_KEY` as a **secret** under Settings →
Variables and Secrets (`SITE_URL` is in `wrangler.jsonc`). When the domain points at Cloudflare,
set `config.checkout.endpoint` to `/session` and switch the GitHub Pages deploy off.

## Checkout

`checkout/worker.js` prices every cart line from the catalogue, applies stock limits and delivery
options, creates a Stripe Checkout Session and sends the shopper to Stripe's hosted page (card,
Apple Pay, Google Pay, Klarna where enabled). Stripe returns the shopper to `order.html`, which
reads the paid session back through the same Worker. Full setup and options in `checkout/README.md`.

Use a **test** key (`sk_test_…`) until you have placed a test order end to end, then swap in a
**restricted live** key with only *Checkout Sessions: Write* and *Checkout Sessions: Read*. Never
paste keys into chat, commits or the front end.

## Before you show customers

1. Check every price and stock figure in `catalog.js` against your inventory.
2. Fill in `config.business` (address, company number, VAT number if registered) — the terms of
   sale and help page print them.
3. Make sure `info@norvexgaming.com` (or whatever `supportEmail` is) is a real mailbox you read.
4. Confirm the delivery prices and windows on `help.html` match what your courier actually offers,
   and set the Worker's `SHIPPING_*` values to match.
5. Place a test order with Stripe's test card, then switch the Worker to the live restricted key.
6. Re-run `bash build.sh` locally after any change and open `_site/` to check.

## Accessibility & performance

Skip link, landmarks, visible gold focus rings, 44 px+ touch targets, labelled icon buttons,
focus-trapped dialogs (cart, menu, search) with `Esc` and focus restore, `aria-live` cart count,
text contrast ≥ 4.5:1 throughout, motion disabled under `prefers-reduced-motion`. Product media uses
a fixed ratio so there is no layout shift; images are lazy-loaded. No analytics or third-party
scripts. The two typefaces are self-hosted under `assets/fonts/` (SIL Open Font License), so the only external request a shopper's browser makes is to Stripe at checkout.

## Trademarks

Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece Card Game, Disney Lorcana, Star Wars: Unlimited,
Digimon Card Game, Dragon Ball Super Card Game, PSA and all related names are trademarks of their
respective owners. Norvex Gaming is an independent retailer. Keep the disclaimer in the footer and do
not use the publishers' logos or card artwork without a licence.
