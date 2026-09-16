import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { EASE, DURATION } from '../lib/motion'
import { SectionLabel } from './Primitives'

/*
 * SECTION 02 — SCROLL-TRIGGERED EXPLODED VIEW
 *
 * How it works:
 *  1. A tall (420vh) section provides the scroll runway.
 *  2. Its first child is `sticky top-0 h-screen`, so the visual pins while the
 *     runway scrolls past — no scroll-jacking, no wheel listeners, the user
 *     keeps full control of their scrollbar.
 *  3. useScroll() on the section gives 0 -> 1 progress across that runway.
 *  4. Each hardware layer maps that progress onto a translateZ value, so the
 *     stack physically separates as you scroll. Because the wrapper is
 *     `preserve-3d` and pre-rotated, translateZ reads as isometric lift.
 *
 * prefers-reduced-motion users get the static, fully-exploded layout instead
 * (see StaticBreakdown) — same information, no pinning, no movement.
 */

const PARTS = [
  {
    id: 'sensor',
    glyph: 'sensor',
    code: 'SNS-4K',
    name: '4K Thermal & Night Vision Sensor Array',
    copy: 'A stabilised triple-aperture head fuses 4K optical, 640×512 LWIR thermal and low-lux starlight into one image pipeline. It sees a body-heat signature through hedgerows at 120 m, in total darkness.',
    specs: ['640×512 LWIR', '0.0001 lux', '3-axis gimbal'],
  },
  {
    id: 'propulsion',
    glyph: 'rotor',
    code: 'WHD-II',
    name: 'WhisperDrive™ Ultra-Quiet Propulsion',
    copy: 'Toroidal rotors turning at half the tip speed of a conventional quad, on magnetically-damped mounts. The result is 18 dB at 30 m — quieter than a suburban street at night, and inaudible from inside the house.',
    specs: ['18 dB @ 30 m', 'Toroidal blade', 'Mag-damped'],
  },
  {
    id: 'chip',
    glyph: 'chip',
    code: 'AI-TC7',
    name: 'AI Threat Classification Chip',
    copy: 'A 42 TOPS on-board NPU classifies every moving body in 0.4 s — cat, fox, delivery courier, intruder — entirely on the aircraft. No frame ever leaves your property to make that decision.',
    specs: ['42 TOPS NPU', '0.4 s verdict', 'On-device only'],
  },
  {
    id: 'nest',
    glyph: 'nest',
    code: 'NST-01',
    name: 'All-Weather Autonomous Charging Nest',
    copy: 'A sealed, heated dock that opens on command, recharges to 80% in 22 minutes and rides out a storm at IP67. The drone launches, patrols and re-seats itself without anyone touching it.',
    specs: ['80% / 22 min', 'IP67 sealed', 'Self-seating'],
  },
]

/**
 * Schematic glyph stamped on each slab — technical-drawing shorthand for the
 * component it represents. Stroke-only and currentColor, so the active layer
 * just switches text colour rather than swapping any asset.
 */
function Glyph({ kind }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }
  return (
    <svg viewBox="0 0 100 100" className="h-[46%] w-[46%]" aria-hidden="true">
      {kind === 'sensor' && (
        <g {...common}>
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="19" />
          <circle cx="50" cy="50" r="7" fill="currentColor" stroke="none" />
          <path d="M50 8v12M50 80v12M8 50h12M80 50h12" />
        </g>
      )}
      {kind === 'rotor' && (
        <g {...common}>
          <circle cx="50" cy="50" r="8" />
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx="50" cy="26" rx="9" ry="17" transform={`rotate(${a} 50 50)`} />
          ))}
        </g>
      )}
      {kind === 'chip' && (
        <g {...common}>
          <rect x="26" y="26" width="48" height="48" rx="4" />
          <rect x="40" y="40" width="20" height="20" rx="2" />
          <path d="M38 14v12M50 14v12M62 14v12M38 74v12M50 74v12M62 74v12M14 38h12M14 50h12M14 62h12M74 38h12M74 50h12M74 62h12" />
        </g>
      )}
      {kind === 'nest' && (
        <g {...common}>
          <path d="M34 20h32l14 14v32L66 80H34L20 66V34z" />
          <circle cx="50" cy="50" r="13" />
          <path d="M50 37v26M37 50h26" />
        </g>
      )}
    </svg>
  )
}

/**
 * The assembled aircraft, as line art, lifting off the top of the stack as
 * the parts separate. It is what the slabs add up to: without it the stack
 * reads as circuit boards, with it the boards read as a drone.
 */
function Airframe({ progress }) {
  const z = useTransform(progress, [0, 0.55], [22, 124])
  const opacity = useTransform(progress, [0, 0.14, 0.9, 1], [0.18, 0.9, 0.9, 0.9])
  return (
    <motion.div style={{ z, opacity }} className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 100 100" className="h-full w-full text-white" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
        {/* Rotor discs at the four corners, with a faint blur ring for motion */}
        {[[22, 22], [78, 22], [22, 78], [78, 78]].map(([x, y]) => (
          <g key={x + '-' + y}>
            <circle cx={x} cy={y} r="14" strokeOpacity="0.25" strokeDasharray="1.5 2.5" />
            <circle cx={x} cy={y} r="9.5" strokeOpacity="0.7" />
            <circle cx={x} cy={y} r="2.2" fill="currentColor" stroke="none" fillOpacity="0.9" />
            <path d={`M ${x - 9} ${y} L ${x + 9} ${y}`} strokeOpacity="0.5" />
          </g>
        ))}
        {/* Arms from the body to each rotor */}
        <path d="M 40 42 L 26 26 M 60 42 L 74 26 M 40 58 L 26 74 M 60 58 L 74 74" strokeWidth="2.2" strokeOpacity="0.85" />
        {/* Body: faceted, nose to the top */}
        <path d="M 50 30 L 61 40 L 61 60 L 50 70 L 39 60 L 39 40 Z" fill="currentColor" fillOpacity="0.08" />
        <path d="M 50 34 L 57 41 L 57 59 L 50 66 L 43 59 L 43 41 Z" strokeOpacity="0.5" />
        {/* Sensor head at the nose */}
        <circle cx="50" cy="42" r="3.2" strokeOpacity="0.9" />
        <circle cx="50" cy="42" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    </motion.div>
  )
}

/** One slab in the isometric stack. */
function Layer({ part, index, progress, active }) {
  // Layer i starts stacked (z = -i * 14) and separates to (z = -i * 130).
  // Each layer reaches full separation at a slightly different point, which
  // gives the stack a cascading "unlatch" feel instead of one rigid move.
  const start = index * 0.06
  const z = useTransform(progress, [start, start + 0.55], [-index * 14, -index * 132])
  const spread = useTransform(progress, [start, start + 0.55], [0, index * 18])

  return (
    <motion.div
      style={{ z, x: spread }}
      className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
        active
          ? 'border-white/60 bg-white/[0.07] shadow-[0_0_40px_-10px_rgba(255,255,255,0.28)]'
          : 'border-white/12 bg-steel-900/80'
      }`}
    >
      {/* Board texture: fine grid + a diagonal sheen */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-grid [background-size:22px_22px] opacity-40" />
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)' }}
        />
      </div>

      {/* Schematic glyph, centred and laid flat on the slab */}
      <div
        className={`absolute inset-0 grid place-items-center transition-colors duration-300 ${
          active ? 'text-white/85' : 'text-white/12'
        }`}
      >
        <Glyph kind={part.glyph} />
      </div>

      {/* Corner pins + part code, laid flat on the slab */}
      <span className="absolute left-4 top-3 font-mono text-[10px] tracking-wide2 text-white/45">{part.code}</span>
      <span className={`absolute right-4 top-3 h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-white/20'}`} />
      <span className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-label text-white/55">
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

/** Non-animated equivalent shown to prefers-reduced-motion users. */
function StaticBreakdown() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {PARTS.map((p, i) => (
        <li key={p.id} className="rounded-2xl border border-white/12 bg-steel-900/70 p-6">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide2 text-silver">
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span className="text-white/55">{p.code}</span>
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold leading-snug">{p.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/55">{p.copy}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {p.specs.map((s) => (
              <li key={s} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] text-white/50">
                {s}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}

export default function ExplodedView() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Derive the active step from progress. Writing to state only when the
  // integer index actually changes keeps re-renders to 4 per full scroll.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(PARTS.length - 1, Math.max(0, Math.floor(p * PARTS.length * 0.98)))
    setActive((cur) => (cur === next ? cur : next))
  })

  // Whole rig tilts slightly as it separates — sells the third dimension.
  const rigRotate = useTransform(scrollYProgress, [0, 1], [0, 8])

  if (reduce) {
    return (
      <section id="hardware" className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8 lg:px-12">
        <SectionLabel index="02">Exploded View</SectionLabel>
        <h2 className="mt-6 max-w-3xl font-display text-section font-bold">Four systems. One airframe.</h2>
        <div className="mt-14">
          <StaticBreakdown />
        </div>
      </section>
    )
  }

  return (
    <section id="hardware" ref={ref} className="relative h-[420vh]">
      {/* Sticky stage: pinned for the length of the runway above. */}
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-16 lg:pt-0">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12">
          {/* ── Step list ── */}
          <div className="lg:col-span-5">
            <SectionLabel index="02">Exploded View</SectionLabel>
            <h2 className="mt-5 font-display text-[1.7rem] font-bold leading-[1.05] sm:mt-6 sm:text-section">
              Four systems.
              <br />
              One airframe.
            </h2>

            {/* Desktop: full list with the active row lit */}
            <ol className="mt-10 hidden space-y-1 lg:block">
              {PARTS.map((p, i) => (
                <li key={p.id}>
                  <div
                    className={`relative flex gap-4 rounded-xl px-4 py-3.5 transition-colors duration-300 ${
                      i === active ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Active marker slides between rows via layoutId */}
                    {i === active && (
                      <motion.span
                        layoutId="step-marker"
                        transition={{ duration: DURATION.ui, ease: EASE }}
                        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-white"
                      />
                    )}
                    <span
                      className={`mt-0.5 font-mono text-[11px] transition-colors duration-300 ${
                        i === active ? 'text-white' : 'text-white/55'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3
                        className={`font-display text-lg font-semibold leading-snug transition-colors duration-300 ${
                          i === active ? 'text-white' : 'text-white/55'
                        }`}
                      >
                        {p.name}
                      </h3>
                      {/*
                          Body copy collapses via grid-template-rows 0fr -> 1fr,
                          not an animated `height: auto`. Framer has to measure
                          an auto height, and its measurement pass ends with
                          window.scrollTo(0, currentY) — which cancels any
                          smooth scroll in progress. This section changes its
                          active row *while* the page scrolls through it, so
                          every "jump to Command/Specs" link was being cut short
                          right here. The CSS transition needs no measurement.
                      */}
                      <div
                        aria-hidden={i !== active}
                        className={`grid transition-[grid-template-rows] duration-[400ms] ease-out ${
                          i === active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className={`transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="pt-2 text-sm leading-relaxed text-white/55">{p.copy}</p>
                            <ul className="flex flex-wrap gap-2 pt-3">
                              {p.specs.map((s) => (
                                <li
                                  key={s}
                                  className="rounded-full border border-white/25 bg-white/[0.06] px-3 py-1 font-mono text-[10px] text-white/80"
                                >
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Mobile: one card at a time, cross-faded on step change */}
            <div className="mt-6 lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={PARTS[active].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="font-mono text-[11px] text-white">
                    {String(active + 1).padStart(2, '0')} / {String(PARTS.length).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{PARTS[active].name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/55">{PARTS[active].copy}</p>
                </motion.div>
              </AnimatePresence>
              {/* Segmented progress bar */}
              <div className="mt-5 flex gap-1.5" aria-hidden="true">
                {PARTS.map((p, i) => (
                  <span
                    key={p.id}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= active ? 'bg-white' : 'bg-white/12'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Isometric stack ── */}
          <div className="lg:col-span-7">
            <div className="relative mx-auto aspect-square w-full max-w-[250px] [perspective:1500px] sm:max-w-[340px] lg:max-w-[560px]">
              <motion.div
                style={{ rotateZ: rigRotate }}
                className="absolute inset-[16%] [transform-style:preserve-3d]"
              >
                {/* Fixed isometric attitude; children lift along Z from here */}
                <div
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  style={{ transform: 'rotateX(58deg) rotateZ(-38deg)' }}
                >
                  <Airframe progress={scrollYProgress} />
                  {PARTS.map((p, i) => (
                    <Layer key={p.id} part={p} index={i} progress={scrollYProgress} active={i === active} />
                  ))}
                </div>
              </motion.div>

              {/* Amber ground glow under the stack */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[68%] h-40 w-[70%] -translate-x-1/2 rounded-[50%] bg-white/[0.07] blur-3xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Screen readers and non-JS crawlers get the full text of every part,
          independent of the scroll choreography above. */}
      <div className="sr-only">
        <StaticBreakdown />
      </div>
    </section>
  )
}
