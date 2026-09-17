# Norvex Property — "The Mansion Experience"

A high-end, scroll-driven landing page prototype for **Norvex Property**, an estate agency with four services: Buy / Let / Sell, Mortgages, Bridging Finance and Surveying.

The whole page is one continuous camera move. You arrive outside a modern mansion at night, scroll to push through the front door, and each scroll stop lands you in a room that hosts one service:

| Stop | Room | Service | Interactive piece |
|------|------|---------|-------------------|
| 0 | Exterior (hero) | Brand + entry | Scroll cue, two CTAs |
| 1 | The Grand Foyer | Buy, let & sell | Property search, featured listings, valuation CTA |
| 2 | The Executive Office | Mortgages | Repayment / interest-only calculator, rate comparison, stress test |
| 3 | The Architectural Study | Surveying | Interactive survey-level chart + "what's inspected" breakdown |
| 4 | The Vault | Bridging finance | Fast liquidity calculator (retained vs serviced interest) |
| 5 | The Garden Terrace | Contact + footer | Validated quick-enquiry form |

No build step. Vanilla HTML, CSS and JavaScript with GSAP + ScrollTrigger from a CDN.

## Run it

```bash
# From the repo root
python3 -m http.server 8080 --directory projects/norvex-property
# then open http://localhost:8080
```

Opening `index.html` directly from disk also works.

Add `?nosnap` to the URL to disable snap-to-room while debugging the timeline. `window.Norvex` exposes `goToRoom(i)`, `mode()`, `room()`, `progress()` and `roomTarget()` in the console.

## Files

```
projects/norvex-property/
├── index.html   # markup: SVG scene sprite, nav, stage, six room panels, dots nav
├── styles.css   # design tokens, both layout modes, components
├── app.js       # mode switching, GSAP master timeline, navigation, five widgets
└── README.md
```

## Design system

Chosen with the `ui-ux-pro-max` skill (`--design-system` → Hero-centric pattern, Glassmorphism cards; typography → "Luxury Serif" pairing), then re-coloured to the brief:

| Token | Value | Use |
|-------|-------|-----|
| `--ink-900` | `#0B0C10` | Page ground |
| `--ink-800` / `--ink-700` | `#12141A` / `#1A1D25` | Surfaces, inputs |
| `--champagne` | `#E9D6AE` | Headlines' warm accent, focus rings, active states |
| `--gold` | `#C9A96E` | Primary buttons, eyebrow rules, chart fills |
| `--ivory` | `#F3EEE4` | Body text |
| `--stone` | `#B4AE9F` | Secondary text (7.5:1 on ink) |
| `--card` | `rgba(11,12,16,.68)` + `backdrop-filter: blur(16px)` | Frosted dark cards over the scenes |

Type: **Cormorant Garamond** (display, 500/600) with **Montserrat** (body, 300–600). Radii stay tight (4px / 8px) to read as architecture rather than an app.

## How the scroll journey works

### 1. Scenes are layered vector sets

Every room is drawn twice in `index.html`'s SVG sprite: `#sc-<room>-far` (walls, floor, furniture) and `#sc-<room>-near` (foreground columns, plants, frames). Both are 1600×900 symbols. The stage instances them with `<use>` at `preserveAspectRatio="xMidYMid slice"` so they crop like a `background-size: cover` photograph.

Each `.scene` carries `data-portal="x y"`: the doorway the camera will push through, in viewBox units. The exterior's portal is the front door (800 530); the foyer's is the rear arch; the office's is the door to the study; the study's is the hidden door in the bookcase; the vault's is the glass door onto the terrace.

```html
<div class="scene" data-scene="exterior" data-portal="800 530">
  <svg class="layer layer-far"  viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><use href="#sc-exterior-far"/></svg>
  <svg class="layer layer-near" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><use href="#sc-exterior-near"/></svg>
  <span class="portal-glow"></span>
</div>
```

### 2. The doorway becomes the transform origin

Because the SVG is cropped with `slice`, a viewBox point maps to the screen through one scale factor and a centring offset. `portalPoint()` in `app.js` does that maths and writes it as `transform-origin` on both layers (and positions the `.portal-glow`). It re-runs on every `ScrollTrigger` refresh, so resizing keeps the zoom locked on the door:

```js
const s = Math.max(W / 1600, H / 900);               // slice scale
const x = (W - 1600 * s) / 2 + px * s;               // centring offset + point
const y = (H - 900 * s) / 2 + py * s;
layer.style.transformOrigin = `${x}px ${y}px`;
```

### 3. One pinned container, one scrubbed master timeline

`#journey` is pinned for roughly eight viewport-heights of scroll. A single GSAP timeline is attached with `scrub: 1`, so scrolling drives the playhead with a ~1 s smoothing lag. The timeline is built room by room with two kinds of segment:

```
time →  [ DWELL 0.7 ][ TRAVEL 1.0 ][ DWELL ][ TRAVEL ] … [ DWELL ]
         room 0        0 → 1        room 1   1 → 2          room 5
```

- **DWELL** – nothing animates. The room's overlay is at rest and fully interactive. Labels (`room-0` … `room-5`) mark these.
- **TRAVEL** – the doorway push, choreographed inside one unit of time:

  | 0.00–0.28 | current overlay lifts up and fades (`y: -28, opacity: 0`, small stagger) |
  |---|---|
  | 0.00–1.00 | far layer scales 1 → 3.6, near layer 1 → 5.4 from the portal origin (`power2.in`). The speed difference sells depth. |
  | 0.25–0.65 | near layer fades so foreground silhouettes don't smear over the doorway |
  | 0.15–0.65 | `.portal-glow` blooms from 0 → 1 at the doorway (light flooding in) |
  | 0.55–0.85 | old scene fades out; glow blows out to 3.2× and fades |
  | 0.50–1.00 | next scene fades in and settles from 1.18× → 1× (`power2.out`) |
  | 0.70–1.00 | next overlay's `.reveal` children rise into place with a stagger |

Every tween has a fixed position on the timeline (`tl.to(target, vars, time)`), so the sequence is fully reversible when the user scrolls back up.

### 4. Pinning and scroll length

```js
ScrollTrigger.create({
  trigger: '#journey', start: 'top top',
  end: () => '+=' + Math.round(total * innerHeight * 0.9),  // total = 9.2 timeline units
  pin: true, anticipatePin: 1, scrub: 1, animation: tl,
  snap: { snapTo: settleIntoRoom, duration: { min: .25, max: .7 }, delay: .12 },
});
```

- `end` is a function, so the pinned distance is recalculated on refresh (orientation change, font load).
- `snap` only acts inside a TRAVEL band: if the user stops halfway through a doorway, the page settles into the nearer room. Inside a DWELL band the function returns the value unchanged, so normal scrolling never fights the user.
- `onUpdate` drives the 2px progress line and the active dot / nav highlight.
- Only one element on the page is pinned. The skill's GSAP data warns against pinning several sections; one long pin is the storytelling pattern, not the multi-pin anti-pattern.

### 5. Overlay content

Each room's content is a `.panel` stacked absolutely inside the pinned container. Panels toggle with `autoAlpha`, so hidden rooms are `visibility: hidden` (no paint, no tab stops). Within a panel every block that should animate carries `.reveal`. The panel's inner wrapper caps at the viewport height with `overflow: auto` as a safety net on short screens; on 1280×720 no room needs it.

### 6. Room navigation

Nav links, footer links, the dots on the right, CTAs and the hash all route through `goToRoom(i)`. In cinematic mode it converts a room's timeline label into a scroll position (`start + (end - start) * progress`) and scrolls there natively (smooth unless motion is reduced). In standard mode it's `scrollIntoView` with `scroll-margin-top` for the fixed header.

## Responsive & motion strategy

`app.js` picks one of two layouts on load and re-evaluates on resize, on `prefers-reduced-motion` change, and when the user presses the **Motion** toggle in the nav (remembered in `localStorage`).

| Condition | Mode | What happens |
|-----------|------|--------------|
| ≥ 1024px wide, no reduced-motion, GSAP loaded | **cinematic** | Pinned journey, zoom transitions, dots + progress line |
| Narrower than 1024px (phones, tablets) | **standard** | No pin, no zoom. Each room is a full-height section with its own static scene behind a dark scrim; content fades up 12px on entry (skill's "subtle scroll reveal" preset). |
| `prefers-reduced-motion: reduce` or Motion toggle off | **standard** + `data-static="true"` | As above with no reveals or hero entrance animation; the toggle is disabled when the OS setting is on. |
| GSAP fails to load / JS disabled | **standard** | The CSS default is the standard layout, so the page is complete without JavaScript; widgets need JS. |

Switching modes tears down the GSAP context (`ctx.revert()`), clears the transform origins, rebuilds, and keeps you in the same room.

Performance notes: only the two visible scene layers paint at any time; layers get `will-change: transform, opacity` in cinematic mode only; nothing animates `width`/`height`/`top`. The scene art is vector so there is no image decode cost. If you move to photography, keep the scenes ≤ 1920px wide, export AVIF/WebP with a JPEG fallback, and preload the first two.

## Using real photography

The vector rooms are placeholders drawn to establish the mechanics. To drop in shots of a real property:

1. Export each room as two images: `far` (the room) and `near` (something in the foreground: a door frame, a plant, a column, or a copy of the same shot with everything but the foreground masked to transparent PNG/WebP).
2. Replace the `<svg class="layer …">` pair with images that cover the stage:

   ```html
   <div class="scene" data-scene="foyer" data-portal="1180 640">
     <img class="layer layer-far"  src="assets/scenes/foyer-far.avif"  width="1920" height="1080" alt="" decoding="async">
     <img class="layer layer-near" src="assets/scenes/foyer-near.png"  width="1920" height="1080" alt="" decoding="async">
     <span class="portal-glow"></span>
   </div>
   ```
   ```css
   .layer { object-fit: cover; object-position: center; }
   ```
3. Set `VB` in `app.js` to the image dimensions (`{ w: 1920, h: 1080 }`) and `data-portal` to the doorway's pixel position in that image. The origin maths is identical for `object-fit: cover`.
4. Keep the standard-mode backgrounds in sync by pointing each `.panel-bg` at the same `far` image (a plain `<img>` with `object-fit: cover`).

For an actual walk-through video, the same timeline works with a `<canvas>` frame sequence: scrub `frameIndex` from the timeline instead of `scale`, and keep the overlays as they are.

## Widgets and their assumptions

All figures are illustrative and are labelled as such on the page.

- **Property search** – filters an in-page array of eight sample listings by intent (buy / rent), free-text location, type and price band. Replace `LISTINGS` with your feed and `render()` with your card template.
- **Mortgage calculator** – standard amortisation `M = P·r / (1 − (1 + r)^−n)`; interest-only is `P·r`. Shows loan, LTV, total interest, total repayable, a +3% stress test and monthly cost for three sample products. Includes the standard UK repossession warning.
- **Survey chart** – horizontal bars (skill's `chart` guidance for comparing ≤ 15 categories) across three metrics: typical fee, inspection depth, turnaround. Each bar is a button; selecting one updates the "what's inspected" breakdown, which encodes coverage with an icon and a word (Full / Visual / Not included), never colour alone. A `<details>` table view backs the chart up for screen readers and copy-paste.
- **Bridging calculator** – gross loan × monthly rate × term, 2% arrangement fee; retained interest is deducted from the advance, serviced is paid monthly.
- **Enquiry form** – validates on blur, inline errors linked with `aria-describedby`, focusable error summary with links to each field on submit, simulated success state. CTAs across the page pre-select the service and draft a message. **Nothing is sent**: wire the submit handler to your CRM, Formspree, Netlify Forms or an email API before launch.

## Porting to React / Next.js + Tailwind

The prototype is deliberately framework-free, but it maps cleanly:

```
<MansionJourney>                 // owns useGSAP + the master timeline (pin, scrub, snap)
  <Stage scenes={SCENES}/>       // renders <Scene far near portal/> ×6
  <Panels>
    <HeroPanel/>
    <FoyerPanel/>      // <PropertySearch/> <ListingGrid/>
    <OfficePanel/>     // <MortgageCalculator/> <RateComparison/>
    <StudyPanel/>      // <SurveyChart/> <InspectionBreakdown/>
    <VaultPanel/>      // <BridgingCalculator/>
    <TerracePanel/>    // <EnquiryForm/> <Footer/>
  </Panels>
  <RoomDots/>
</MansionJourney>
```

```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function MansionJourney({ children }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      // buildCinematic() from app.js, scoped to ref.current
    });
    return () => mm.revert();
  }, { scope: ref });
  return <div ref={ref} className="journey">{children}</div>;
}
```

`gsap.matchMedia()` replaces the hand-rolled mode switch; `useGSAP` replaces `gsap.context()` and cleans up on unmount. Tokens in `styles.css` become `theme.extend.colors` / `fontFamily` in `tailwind.config`, and the `.card` recipe becomes `bg-ink-900/70 backdrop-blur-xl border border-champagne/15 rounded-lg`.

## Going live on your domain

The prototype is static, so any static host works: Cloudflare Pages, Netlify, Vercel or GitHub Pages. Point the domain's `A`/`CNAME` records at the host, enable HTTPS, then before launch:

1. Replace the placeholder office details and `enquiries@norvex.example` with real ones.
2. Wire the enquiry form to a backend and add a privacy notice link next to the consent checkbox.
3. Swap the vector scenes for photography (above) and the sample listings for your feed.
4. Add analytics and a cookie notice if you use them, and an `og:image` for link previews.
5. Run Lighthouse on a mid-range phone; the standard layout should score well on performance and accessibility out of the box.

## Accessibility notes

- Semantic landmarks, one `h1`, sequential headings per room, skip link, visible focus rings, ≥ 44px targets.
- Hidden rooms in cinematic mode are `visibility: hidden`, so keyboard focus never lands in an invisible panel.
- Reduced motion is honoured three ways (OS setting, user toggle, missing GSAP) and the final readable state is always rendered.
- Charts and status never rely on colour alone; live regions announce calculator and search updates.
- Text contrast is ≥ 4.5:1 on the darkest and lightest card states.

## Known limitations / next steps

- Scene art is stylised vector, not photography (by design for the prototype).
- The property feed, rates, survey fees and bridging pricing are static sample data.
- The enquiry form does not submit anywhere.
- The cinematic mode relies on native scrolling; if you adopt Lenis or Locomotive for inertia, register it with `ScrollTrigger.scrollerProxy`.
