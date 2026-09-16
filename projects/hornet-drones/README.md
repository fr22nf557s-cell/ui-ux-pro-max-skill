# Hornet Drones — Homepage

Production-ready marketing homepage for **Hornet Drones**, a premium autonomous
home-security drone system. Dark, stealthy, military-grade luxury: charcoal
ground, pure-black wells, tactical amber, crisp white.

Built with **React 18 + Vite**, **Tailwind CSS**, **Framer Motion** and
**React Three Fiber**.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

Requires Node 18+. No API keys, no external assets: every visual is drawn in
code (SVG, CSS or three.js primitives) and the fonts are served from
`public/fonts` (latin subsets, declared in `src/index.css`), so nothing on the
page is fetched from a third-party origin.

## Design system

Monochrome: black and charcoal grey. There is no accent hue — hierarchy is
carried entirely by luminance, which is what keeps a one-colour page readable.

| Token | Value | Use |
| --- | --- | --- |
| `void` | `#000000` | Wells, feeds, footer |
| `ink` | `#0B0C10` | Page ground |
| `carbon` | `#16181D` | Raised sections |
| `steel-500…900` | `#454B58` → `#16181D` | Panels, borders, airframe |
| `signal` | `#FFFFFF` | The accent — CTAs, active step, live indicators |
| `silver` | `#A8ADB8` | Technical labels, eyebrows, sub-heads |
| `slate` | `#6B7280` | Muted detail |

**Type** — Chakra Petch (brand lockup), Space Grotesk (display), Inter
(body/UI), JetBrains Mono (every number, label and telemetry readout). Section eyebrows use `0.28em` tracking;
display sizes are fluid `clamp()` values, so there are no breakpoint jumps
between 360 px and 2560 px.

**Motion** — all timing comes from `src/lib/motion.js` (one easing curve, four
durations). Nothing animates without a reason, and no view animates more than
one or two elements at once.

## Sections

| # | Component | What it does |
| --- | --- | --- |
| 01 | `Hero.jsx` | Line-masked headline reveal, scroll-linked exit, dual CTAs, live-status badge |
| — | `HeroFlight.jsx` | Scroll-scrubbed flight footage — the hero visual |
| — | `DroneScene.jsx` | React Three Fiber quadcopter, used if the video cannot play |
| — | `DroneSVG.jsx` | Animated SVG airframe — last-resort fallback |
| — | `Logo.jsx` | Hornet mark + HORNET / DRONES lockup |
| 02 | `ExplodedView.jsx` | Scroll-triggered isometric hardware breakdown (sensor / propulsion / AI chip / nest) |
| 03 | `Dashboard.jsx` | Interactive command-centre mockup: radar sweep, thermal toggle, Deploy Intercept trigger |
| 04 | `SpecGrid.jsx` | Four-column spec grid with scroll-triggered count-up |
| 05 | `FooterCTA.jsx` | Finale headline, Alpha waitlist capture, live system-status dot |

### How the exploded view works

A 420 vh section provides the scroll runway; its first child is
`sticky top-0 h-screen`, so the visual pins while the runway scrolls past.
`useScroll()` maps that runway to 0 → 1, and each hardware layer maps that
progress onto a `translateZ` value inside a `preserve-3d`, pre-rotated wrapper —
so scrolling physically separates the stack. There is no wheel hijacking: the
user's scrollbar behaves normally throughout.

### Scroll-scrubbed hero video

`public/hornet-flight.*` is real flight footage whose playhead is driven by
scroll position rather than time. Three things make it smooth:

1. **Every frame is a keyframe** (`-g 1`). Normal video carries an I-frame
   every 1–2s, so an arbitrary `currentTime` must decode forward from the last
   one. All-intra turns each seek into a direct frame fetch. This is the single
   thing that makes scrubbing viable.
2. **`moov` at the front** (`-movflags +faststart`), so the browser can seek
   before the whole clip has downloaded.
3. **Scroll never writes `currentTime` directly.** Scroll fires far more often
   than the decoder can serve seeks, and queued seeks thrash it. Scroll updates
   a target; a rAF loop eases the playhead toward it.

Re-encoding from a new source (the grade desaturates and crushes highlights so
the clip sits inside the page's black rather than punching a hole in it):

```bash
GRADE="hue=s=0,curves=all='0/0 0.25/0.11 0.55/0.32 0.8/0.50 1/0.62',eq=contrast=1.08,scale=720:720:flags=lanczos"
ffmpeg -i source.mov -an -vf "$GRADE" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -sc_threshold 0 -crf 23 -preset slow \
  -movflags +faststart public/hornet-flight.mp4
```

**The host must support HTTP Range requests.** Without `Accept-Ranges`, the
browser marks the media non-seekable and the playhead silently refuses to move
— `python -m http.server` and `vite preview` both fail this; use a real static
host.

### Performance

- The hero badge, headline and intro are plain HTML in `index.html`
  (`#lcp-copy`), painted with the first frame, with invisible layout-only
  stand-ins for the buttons and stats. `Hero.jsx` renders the same markup with
  the same Tailwind classes and removes the shell after it mounts, so the swap
  is pixel-identical. **Keep the two in sync**: any class change to the hero
  copy, buttons or stats must be made in both files, and the shell keeps no
  entrance animation on the text (Chrome records a composited fade as painted
  only when it ends, which put the LCP a second late).
- Fonts are self-hosted from `public/fonts` and declared in `src/index.css`;
  `index.html` preloads the two faces the hero is set in, so there is no
  font-swap shift.
- Everything below the second section is a lazy chunk fetched on idle and
  rendered through Suspense with sized placeholders; deep links to those
  sections are handled in `App.jsx`, which jumps to the target once it mounts.
- `three.js` only ever loads through the hero's WebGL fallback, when the
  footage cannot play. Data Saver users get the poster and no clip.
- Animations are limited to `transform` and `opacity`; the command feed is a
  single canvas that pauses off-screen and under reduced motion. Its tracking
  lock is a DOM overlay positioned from the canvas box each frame, so it stays
  crisp at 2x zoom.
- Never bind a Framer motion value in `style` on an element that also animates
  the same property: Framer animates the shared value itself. The hero's scroll
  fade and the scroll cue's delayed entrance live on separate elements for this
  reason.

### Accessibility

- `prefers-reduced-motion` is honoured everywhere. The exploded view drops its
  pinning entirely and renders a static, fully-readable four-card breakdown;
  hovers, springs and loops collapse to their end state; the command feed
  pauses and zoom applies directly.
- Semantic landmarks, a skip link, one high-contrast focus ring site-wide,
  `aria-current` on the active nav link, a radiogroup for the feed mode,
  `role="alert"` on form validation with `aria-invalid` scoped to the control
  the error belongs to, Escape closes the mobile menu and returns focus, and an
  `sr-only` copy of the hardware breakdown so the choreography never hides
  content. axe reports zero violations at 1440 and 390 on every page.
- The palette is monochrome; every text tone on the dark ground clears WCAG AA.

## Wiring the waitlist

`FooterCTA.jsx` validates and manages `idle → error → pending → done` locally.
Replace the simulated delay in `submitEmail()` with your endpoint:

```js
await fetch('/api/waitlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
})
```

The dashboard is a **mockup** — its telemetry, events and contacts are static
fixtures at the top of `Dashboard.jsx`. Swap them for live data and the UI
states already handle the rest.
