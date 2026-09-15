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

Requires Node 18+. No API keys, no external assets — every visual is drawn in
code (SVG, CSS or three.js primitives), so the page works fully offline once
the Google Fonts stylesheet is cached.

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

- `three.js` is `React.lazy()`-loaded and split into its own chunk, so the
  ~820 KB 3D vendor payload never blocks first paint. Initial JS is ~97 KB gzip.
- The canvas caps DPR at 1.75 and switches to `frameloop="demand"` for
  reduced-motion users (one frame, then idle).
- Animations are limited to `transform` and `opacity`; the radar sweep and
  status pulses are composited CSS keyframes, not per-frame JS.
- A cached WebGL probe (`src/lib/webgl.js`) skips the 3D chunk entirely on
  devices that cannot render it.

### Accessibility

- `prefers-reduced-motion` is honoured everywhere. The exploded view drops its
  pinning entirely and renders a static, fully-readable four-card breakdown;
  hovers, springs and loops collapse to their end state.
- Semantic landmarks, a skip link, one high-contrast focus ring site-wide,
  `aria-checked` on the feed toggle, `role="alert"` on form validation, and an
  `sr-only` copy of the hardware breakdown so the choreography never hides content.
- Amber `#F59E0B` on `#0B0C10` clears 4.5:1; the amber-filled buttons use black
  text rather than white.

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
