# Norvex Gaming — storefront

A premium, dark-luxury e-commerce front end for **Norvex Gaming**: sealed TCG product
(booster boxes, booster bundles, Elite Trainer Boxes, premium collections), graded singles and
pre-orders across Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh!, Disney Lorcana,
Star Wars: Unlimited and Riftbound.

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
│   └── img/               # favicon.svg, logo.svg
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

1. **Inventory** — replace the `products` array in `assets/js/catalog.js` (the field reference is at the
   top of that file). Or fetch your live catalogue and assign it to `window.NORVEX_DATA.products`
   before `norvex.js` runs.
2. **Photos** — set `image: 'assets/img/products/<file>.webp'` on any product; the stylised CSS packaging
   mock is only rendered when `image` is `null`. Use 4:5 images (800 × 1000 recommended).
3. **Currency / thresholds / support email** — `config` block in `catalog.js`.
4. **Checkout** — the "Secure checkout" button currently shows a toast. Wire it to Shopify (Storefront
   API / cart permalink), Stripe Checkout, Snipcart, Medusa, etc. in `initGlobalClicks()` inside
   `norvex.js` (`[data-checkout]`).
5. **Newsletter** — `initNewsletter()` in `norvex.js` validates the email client-side; POST it to
   Klaviyo / Mailchimp / Resend where the `TODO` comment sits.
6. **Placeholder content to replace before launch** — the four stats in the strip under the hero
   (orders shipped, rating, games, dispatch time), the three sample reviews, the pre-order items and
   any product names/prices that don't match your real allocations. Footer links marked `#` need pages.

## Accessibility & performance notes

* Skip link, landmarks, visible gold focus rings, 44 px+ touch targets, labelled icon buttons,
  focus-trapped dialogs (cart, menu, search) with `Esc` and focus restore, `aria-live` cart count.
* Text contrast ≥ 4.5:1 everywhere (muted text 9.6:1, tertiary labels 5.1:1, gold on black 10:1).
* No layout shift: product media uses a fixed 4:5 ratio; images are `loading="lazy"` with dimensions.
* Works without JavaScript (content and links render; cart/search/filters need JS).
* No third-party scripts. Only external requests are the two Google Fonts families.

## Trademarks

Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece Card Game, Disney Lorcana, Star Wars: Unlimited,
Riftbound, PSA and all related names are trademarks of their respective owners. Norvex Gaming is an
independent retailer. Keep the disclaimer in the footer and avoid using the publishers' logos or card
artwork without a licence.
