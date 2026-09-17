# Norvex Gaming — storefront

A premium, dark-luxury e-commerce front end for **Norvex Gaming**: sealed TCG product
(booster boxes, bundles, packs, Elite Trainer Boxes, decks, premium collections), graded singles,
pre-orders and accessories across Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh!, Disney
Lorcana, Star Wars: Unlimited, Flesh and Blood, Riftbound, Digimon and Dragon Ball Super.

The catalogue (144 products, priced in GBP) is modelled on a full UK TCG retailer's range: every
major game, sealed product in every format, PSA 10 singles and the big accessory brands (Dragon
Shield, Ultra Pro, Gamegenic, Ultimate Guard). Product names follow the publishers' real lines;
**prices are estimated UK RRP / market prices and stock levels are placeholders**, so verify both
against your live inventory before launch.

Zero build step, zero runtime dependencies. Open `index.html` in a browser or serve the folder:

```bash
cd projects/norvex-gaming
python3 -m http.server 8080      # then open http://localhost:8080
```

## Pages

| File | What it does |
|------|--------------|
| `index.html` | Home: hero, stats, brand marquee, new arrivals, category bento, "The Norvex standard", graded vault, pre-orders, reviews, newsletter |
| `shop.html` | Catalogue with live filters (game, product type, availability, price), sort, search, URL-addressable state (`?game=pokemon&type=etb&avail=preorder&sort=price-asc&q=…`) |
| `product.html?id=<id>` | Product detail: packaging art, price/compare price, stock state, quantity, add to cart / pre-order, contents, specs, shipping, authenticity, related products |

Shared across every page (injected by `assets/js/norvex.js`): sticky glass header, mobile menu,
search palette (`/` or `Ctrl/Cmd+K`), slide-in cart drawer with free-shipping progress
(persisted in `localStorage`), toasts.

## Structure

```
projects/norvex-gaming/
├── index.html · shop.html · product.html
├── assets/
│   ├── css/norvex.css     # design tokens + components (dark luxury, liquid glass, gold accent)
│   ├── js/catalog.js      # ALL product / game / type data + store config
│   ├── js/norvex.js       # storefront runtime (cart, search, filters, PDP, motion, a11y)
│   └── img/
│       ├── favicon.svg · logo.svg
│       └── products/      # drop product photos here (4:5, ~800x1000, WebP/JPG)
├── scripts/
│   ├── fetch-gallery.mjs  # download every packshot from a publisher gallery page (+ manifest)
│   ├── match-images.mjs   # pair downloaded images with products by name, wire them in
│   ├── import-catalog.mjs # CSV → assets/js/catalog.js (validates rows + image paths)
│   ├── catalog-io.mjs     # shared load/write helpers
│   └── catalog-template.csv
├── package.json           # npm run fetch | match | import | serve (Playwright is the only dev dep)
└── README.md
```

## Design system (generated with the ui-ux-pro-max tooling in this repo)

```bash
python3 src/ui-ux-pro-max/scripts/search.py "trading card game TCG e-commerce premium gaming store collectibles" \
  --design-system --variance 7 --motion 7 --density 5 -p "Norvex Gaming"
```

* **Pattern** Feature-Rich Showcase (hero → product grid → categories → proof → CTA, sticky CTA repetition)
* **Style** Liquid Glass / Glassmorphism on an OLED-black base, with Aurora UI mesh gradients and
  holographic "foil" accents (TCG-native)
* **Palette** E-commerce Luxury: near-black `#08080a`, warm off-white text `#f4f2ee`,
  champagne gold accent `#d9b75b` (10:1 on the background), holo gradient for graded/foil moments
* **Type** Cormorant (display, italics for emphasis) + Montserrat (UI/body), both from Google Fonts
* **Motion** hover micro-interactions 200–300 ms `power2.out`, scroll reveals + grid stagger
  (`back.out`-style), 12–16 s aurora drift, all disabled under `prefers-reduced-motion`

All colours, spacing, radii and easings are CSS custom properties at the top of `norvex.css`.

## Make it yours

1. **Inventory** — the fastest route is the importer. Export your products to CSV (distributor feed,
   Shopify/WooCommerce export, or a spreadsheet; columns documented in `scripts/catalog-template.csv`
   and at the top of `scripts/import-catalog.mjs`), then:

   ```bash
   node scripts/import-catalog.mjs my-products.csv --images assets/img/products --dry-run   # validate
   node scripts/import-catalog.mjs my-products.csv --images assets/img/products             # write catalog.js
   ```

   The importer keeps `config`, `games` and `types`, generates ids, derives the set name, and refuses to
   write if a row has an unknown game/type, a bad price, or a photo that isn't on disk. You can also edit
   the `products` array in `assets/js/catalog.js` by hand, or fetch a live catalogue and assign it to
   `window.NORVEX_DATA.products` before `norvex.js` runs.
2. **Photos** — put files in `assets/img/products/` and reference them in the CSV `image` column (or set
   `image` on a product). The stylised CSS packaging mock is only rendered when `image` is empty.
   Use 4:5 images (800 × 1000 recommended). Source them legitimately: official packshots from your
   distributor / publisher retailer portals, the Pokémon TCG API or Scryfall for card images on singles,
   your own photos of graded slabs. Do not copy another retailer's photos or descriptions.
3. **Currency / thresholds / support email** — `config` block in `catalog.js`.
4. **Checkout** — the "Secure checkout" button currently shows a toast. Wire it to Shopify (Storefront
   API / cart permalink), Stripe Checkout, Snipcart, Medusa, etc. in `initGlobalClicks()` inside
   `norvex.js` (`[data-checkout]`).
5. **Newsletter** — `initNewsletter()` in `norvex.js` validates the email client-side; POST it to
   Klaviyo / Mailchimp / Resend where the `TODO` comment sits.
6. **Placeholder content to replace before launch** — every price and stock figure in the catalogue,
   the four stats in the strip under the hero (orders shipped, rating, games, dispatch time), the three
   sample reviews, the pre-order items (they reflect the newest sets at the time of writing) and the
   graded-single cert numbers. Footer links marked `#` need pages.

## Getting official product images

Publisher and accessory-brand packshots are supplied to retailers through their trade channels, not
scraped from consumer sites. Where to ask:

| Publisher / brand | Where retailers get packshots |
|---|---|
| Pokémon TCG | Your Pokémon distributor's retailer resources (the same kit that ships with each set's sell sheet) |
| Magic: The Gathering | Wizards Play Network (WPN) retailer portal → Marketing Materials |
| One Piece, Digimon, Dragon Ball Super | Bandai retailer assets via your Bandai distributor |
| Yu-Gi-Oh! | Konami OTS (Official Tournament Store) portal |
| Disney Lorcana | Ravensburger retailer programme via your distributor |
| Star Wars: Unlimited | Fantasy Flight Games / Asmodee retailer assets |
| Flesh and Blood | Legend Story Studios retailer resources |
| Riftbound | Riot Games retailer programme |
| Dragon Shield, Ultra Pro, Gamegenic, Ultimate Guard | Each brand's B2B / dealer portal (image packs per SKU) |

Name each file `<product id>.webp` (ids are in `catalog.js` and in every product URL), drop it in
`assets/img/products/`, and re-run the importer — it matches images to products by id automatically.

### Pulling packshots from the publishers' public galleries

You do not need thousands of images — one per product you list (a few hundred for a full range).
Two scripts do the legwork; run them on your own machine, where the publisher sites are reachable:

```bash
cd projects/norvex-gaming
npm install                                   # once: Playwright + a headless Chromium

# 1. Walk a gallery page: scrolls, clicks "load more", downloads every packshot + writes manifest.csv
npm run fetch -- "https://www.pokemon.com/uk/pokemon-tcg/product-gallery"
npm run fetch -- "https://magic.wizards.com/en/products"
npm run fetch -- "https://en.onepiece-cardgame.com/products/"
npm run fetch -- "https://www.yugioh-card.com/uk/products/"
npm run fetch -- "https://www.disneylorcana.com/en-GB/products"
npm run fetch -- "https://starwarsunlimited.com/products"
npm run fetch -- "https://fabtcg.com/products/"
#   options: --selector <css> to scope to the product grid, --paginate <css> for "next page" links,
#            --headed to watch it work (and click through any wall the script can't)

# 2. Pair the downloaded files with catalogue products by name, then copy them in and set `image`
npm run match                                 # dry run → assets/img/gallery/match-report.csv
npm run match -- --apply                      # copies to assets/img/products/<id>.<ext> + updates catalog.js
```

**No machine to run it on?** The same pipeline runs in GitHub Actions: `Actions` tab → *Norvex – fetch
product images* → *Run workflow* (pick the branch, keep the default gallery list). The runner walks the
galleries, matches, converts to WebP and commits the results to the branch. On a fork, GitHub keeps
Actions disabled until you click *"I understand my workflows, go ahead and enable them"* on the Actions
tab once.

After a run, `npm run tidy -- --apply` cleans what the galleries dragged in: article photos and key art
are dropped (`JUNK` in `scripts/catalog-rules.mjs`), titles are rewritten into house style (`OP-17 The
World's Strongest Warriors Booster Pack`, not `BOOSTER PACK -THE WORLD'S STRONGEST WARRIORS- OP-17`),
duplicates worded two ways are merged, placeholder-sized photos are removed, ids follow names and each
game gets up to three featured products with a real photo. Anything the rules can't know (which set a
generic "Booster Display Box" belongs to, a photo that shows the wrong product) goes in
`scripts/catalog-overrides.json`, keyed by the id the generator derives, so it survives the next run.
The Actions workflow runs the same tidy pass automatically.

The matcher scores titles against product names (it understands "ETB", "Booster Display", set
prefixes like "Scarlet & Violet—") and refuses cross-format matches (a bundle never gets a box photo).
Check `match-report.csv`, rename any stragglers to `<id>.<ext>` by hand, and re-run. Downloaded
galleries live in `assets/img/gallery/` (git-ignored); only the matched `products/` files ship with
the site. Both scripts were verified against a local fixture gallery; the real sites change their
markup from time to time, so if a fetch comes back empty run it with `--headed` and pass the grid's
selector with `--selector`.

Graded singles currently point at the public Pokémon TCG card-image CDN (`images.pokemontcg.io`);
if any image fails to load the storefront swaps in the slab art on its own. For launch, replace those
URLs with your own photos of the actual slabs, cert label visible — buyers expect to see the real card.

## Accessibility & performance notes

* Skip link, landmarks, visible gold focus rings, 44 px+ touch targets, labelled icon buttons,
  focus-trapped dialogs (cart, menu, search) with `Esc` and focus restore, `aria-live` cart count.
* Text contrast ≥ 4.5:1 everywhere (muted text 9.6:1, tertiary labels 5.1:1, gold on black 10:1).
* No layout shift: product media uses a fixed 4:5 ratio; images are `loading="lazy"` with dimensions.
* Works without JavaScript (content and links render; cart/search/filters need JS).
* No third-party scripts. External requests are the two Google Fonts families and, for graded singles, the card images noted above.

## Trademarks

Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece Card Game, Disney Lorcana, Star Wars: Unlimited,
Riftbound, PSA and all related names are trademarks of their respective owners. Norvex Gaming is an
independent retailer. Keep the disclaimer in the footer and avoid using the publishers' logos or card
artwork without a licence.
