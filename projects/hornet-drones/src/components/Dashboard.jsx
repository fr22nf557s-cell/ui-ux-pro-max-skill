import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel, StatusDot } from './Primitives'

/*
 * SECTION 03 — LIVE SECURITY DASHBOARD MOCKUP
 *
 * A non-functional but fully interactive product mockup: pointer-tilt, a
 * running radar sweep, a thermal/optical feed toggle and an armed
 * "Deploy Intercept" trigger with a real state machine
 * (idle -> arming -> deployed -> idle).
 */

const FEED_MODES = {
  optical: {
    label: 'Optical',
    // Cool moonlit CCTV grade
    background: 'linear-gradient(170deg,#1B2130 0%,#0C0E13 60%,#05060A 100%)',
    blob: 'rgba(159,196,255,0.30)',
  },
  thermal: {
    label: 'Thermal',
    // LWIR palette: black -> amber -> white-hot
    background: 'linear-gradient(170deg,#2A1405 0%,#120A02 55%,#05060A 100%)',
    blob: 'rgba(245,158,11,0.62)',
  },
}

const TELEMETRY = [
  ['Altitude', '31.4 m'],
  ['Battery', '92%'],
  ['Link', 'AES-256'],
  ['Wind', '14 km/h'],
]

const EVENTS = [
  { t: '02:14:07', text: 'Perimeter sweep complete — sector NW', tone: 'ok' },
  { t: '02:11:52', text: 'Motion classified: domestic cat — ignored', tone: 'muted' },
  { t: '02:09:30', text: 'Geofence breach — south gate', tone: 'alert' },
]

export default function Dashboard() {
  const reduce = useReducedMotion()
  const [mode, setMode] = useState('optical')
  const [trigger, setTrigger] = useState('idle') // idle | arming | deployed
  const panelRef = useRef(null)

  // ── Pointer tilt ────────────────────────────────────────────────────────
  // Raw pointer offset (-0.5 … 0.5) feeds a spring, and the spring drives
  // rotation. Springs (not tweens) are what make the panel feel like a
  // physical object with weight rather than a CSS transition.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 120, damping: 18, mass: 0.6 })
  const rotateY = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-9, 9])
  const rotateX = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [7, -7])

  const handlePointer = (e) => {
    if (reduce || !panelRef.current) return
    const r = panelRef.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const resetPointer = () => {
    px.set(0)
    py.set(0)
  }

  // ── Deploy trigger state machine ────────────────────────────────────────
  useEffect(() => {
    if (trigger === 'idle') return
    const ms = trigger === 'arming' ? 900 : 2600
    const id = setTimeout(() => setTrigger(trigger === 'arming' ? 'deployed' : 'idle'), ms)
    return () => clearTimeout(id) // never leak a timer if the user re-clicks
  }, [trigger])

  const feed = FEED_MODES[mode]

  return (
    <section id="command" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[38vh] w-[70vw] -translate-x-1/2 rounded-[50%] bg-tactical/[0.09] blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
        {/* ── Copy ── */}
        <motion.div
          variants={stagger(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="lg:col-span-5"
        >
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="03">Command</SectionLabel>
          </motion.div>
          <motion.h2 variants={revealUp(reduce)} className="mt-6 font-display text-section font-bold">
            Your perimeter, on one pane of glass.
          </motion.h2>
          <motion.p variants={revealUp(reduce)} className="mt-6 text-[17px] leading-relaxed text-white/60">
            Every patrol, classification and intercept in a single control centre — on desktop, or in your pocket.
            Switch to thermal, redraw a geofence, or launch an intercept in one tap.
          </motion.p>

          <motion.ul variants={revealUp(reduce)} className="mt-9 space-y-3.5">
            {['Sub-second live link over local mesh', 'Geofence editing with drag handles', 'Full event history, stored on-premise'].map(
              (line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-white/55">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-tactical" aria-hidden="true" />
                  {line}
                </li>
              ),
            )}
          </motion.ul>
        </motion.div>

        {/* ── Floating control centre ── */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE }}
          className="lg:col-span-7"
        >
          <div className="relative [perspective:1600px]">
            <motion.div
              ref={panelRef}
              onPointerMove={handlePointer}
              onPointerLeave={resetPointer}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="glass gpu relative rounded-2xl p-3 shadow-panel sm:p-4"
            >
              {/* Window chrome */}
              <div className="flex items-center justify-between px-2 pb-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-tactical/70" />
                  <span className="ml-3 font-mono text-[10px] uppercase tracking-wide2 text-white/40">
                    Hornet Command · HRN-01
                  </span>
                </div>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide2 text-white/40">
                  <StatusDot />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                {/* ── Radar / geofence ── */}
                <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-void/60 p-4 md:col-span-2">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide2">
                    <p className="text-white/40">Perimeter</p>
                    <p className="text-white/30">Range 120 m</p>
                  </div>

                  <div className="relative mx-auto mt-3 aspect-square w-full max-w-[220px]">
                    {/* Static range rings */}
                    {[1, 0.7, 0.42, 0.16].map((s) => (
                      <span
                        key={s}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-tactical/20"
                        style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
                      />
                    ))}
                    {/* Crosshair */}
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-tactical/12" />
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-tactical/12" />

                    {/* Sweep: a rotating conic gradient is one composited layer,
                        far cheaper than redrawing a canvas every frame. */}
                    <span
                      className="absolute inset-0 rounded-full animate-sweep"
                      style={{
                        background:
                          'conic-gradient(from 0deg, rgba(245,158,11,0) 0deg, rgba(245,158,11,0) 300deg, rgba(245,158,11,0.32) 352deg, rgba(245,158,11,0.75) 360deg)',
                        maskImage: 'radial-gradient(circle, #000 68%, transparent 69%)',
                        WebkitMaskImage: 'radial-gradient(circle, #000 68%, transparent 69%)',
                      }}
                    />
                    {/* Expanding geofence pulse */}
                    <span className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-tactical/50 animate-ping" />

                    {/* Contacts. The breach blip carries the amber alert colour. */}
                    {[
                      { x: '68%', y: '34%', alert: true, label: 'Unclassified contact, south gate' },
                      { x: '31%', y: '62%', alert: false, label: 'Known contact' },
                      { x: '54%', y: '74%', alert: false, label: 'Known contact' },
                    ].map((b) => (
                      <span
                        key={b.x + b.y}
                        title={b.label}
                        className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                          b.alert ? 'bg-tactical shadow-glow animate-breathe' : 'bg-white/45'
                        }`}
                        style={{ left: b.x, top: b.y }}
                      />
                    ))}
                    {/* Home node */}
                    <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-white/70 bg-white/10" />
                  </div>

                  {/* The empty space below the scope is deliberate: it is where
                      the companion phone panel floats on large screens. */}
                  <div className="mt-auto flex items-center justify-end pt-6 font-mono text-[10px]">
                    <span className="text-tactical">3 CONTACTS</span>
                  </div>
                </div>

                {/* ── Feed + telemetry + trigger ── */}
                <div className="space-y-3 md:col-span-3">
                  {/* Feed preview */}
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: DURATION.ui, ease: EASE }}
                      className="relative aspect-[16/9] w-full"
                      style={{ background: feed.background }}
                    >
                      {/* Two heat/light blobs stand in for a live subject */}
                      <span
                        className="absolute left-[30%] top-[45%] h-24 w-16 -translate-x-1/2 rounded-full blur-xl"
                        style={{ background: feed.blob }}
                      />
                      <span
                        className="absolute left-[30%] top-[33%] h-9 w-9 -translate-x-1/2 rounded-full blur-md"
                        style={{ background: feed.blob }}
                      />
                      {/* Tracking box */}
                      <span className="absolute left-[22%] top-[27%] h-[44%] w-[17%] border border-tactical/80">
                        <span className="absolute -top-5 left-0 whitespace-nowrap bg-tactical px-1.5 py-0.5 font-mono text-[9px] font-bold text-void">
                          HUMAN 98%
                        </span>
                      </span>
                      {/* Scanline overlay */}
                      <span className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute inset-x-0 h-12 bg-white/[0.05] animate-scanline" />
                      </span>
                      {/* Feed HUD */}
                      <span className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wide2 text-white/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-breathe" />
                        REC · CAM-01
                      </span>
                      <span className="absolute bottom-3 right-3 font-mono text-[9px] text-white/50">02:14:31</span>
                    </motion.div>

                    {/* Optical / Thermal segmented toggle */}
                    <div
                      role="radiogroup"
                      aria-label="Camera feed mode"
                      className="flex items-center gap-1 border-t border-white/10 bg-void/70 p-1.5"
                    >
                      {Object.entries(FEED_MODES).map(([key, m]) => (
                        <button
                          key={key}
                          role="radio"
                          aria-checked={mode === key}
                          onClick={() => setMode(key)}
                          className={`relative flex-1 rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-wide2 transition-colors duration-200 ${
                            mode === key ? 'text-void' : 'text-white/45 hover:text-white'
                          }`}
                        >
                          {/* The amber pill slides between options via layoutId —
                              one shared element, not two cross-fading blocks. */}
                          {mode === key && (
                            <motion.span
                              layoutId="feed-pill"
                              transition={{ duration: reduce ? 0.001 : DURATION.ui, ease: EASE }}
                              className="absolute inset-0 rounded-lg bg-tactical"
                            />
                          )}
                          <span className="relative">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry strip */}
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
                    {TELEMETRY.map(([k, v]) => (
                      <div key={k} className="bg-void/70 px-3 py-3">
                        <dt className="font-mono text-[9px] uppercase tracking-wide2 text-white/35">{k}</dt>
                        <dd className="mt-1 font-mono text-sm text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Event log */}
                  <ul className="space-y-1.5 rounded-xl border border-white/10 bg-void/50 p-3">
                    {EVENTS.map((e, i) => (
                      <motion.li
                        key={e.t}
                        initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={VIEWPORT}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
                        className="flex items-center gap-3 font-mono text-[10px]"
                      >
                        <span className="text-white/30">{e.t}</span>
                        <span
                          className={`h-1 w-1 flex-none rounded-full ${
                            e.tone === 'alert' ? 'bg-tactical' : e.tone === 'ok' ? 'bg-emerald-400' : 'bg-white/25'
                          }`}
                        />
                        <span className={e.tone === 'alert' ? 'text-white' : 'text-white/45'}>{e.text}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* ── Deploy Intercept trigger ── */}
                  <button
                    type="button"
                    onClick={() => trigger === 'idle' && setTrigger('arming')}
                    aria-live="polite"
                    className={`relative w-full overflow-hidden rounded-xl px-6 py-4 font-mono text-[12px] font-bold uppercase tracking-wide2 transition-colors duration-200 ${
                      trigger === 'idle'
                        ? 'bg-tactical text-void hover:bg-tactical-300'
                        : 'bg-tactical-600 text-void'
                    }`}
                  >
                    {/* Arming progress bar sweeps left→right beneath the label */}
                    <AnimatePresence>
                      {trigger === 'arming' && (
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.9, ease: 'linear' }}
                          className="absolute inset-0 origin-left bg-void/25"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative flex items-center justify-center gap-2.5">
                      {trigger === 'deployed' && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path d="M2 7.5l3.5 3.5L12 3.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        </motion.svg>
                      )}
                      {trigger === 'idle' && 'Deploy Intercept'}
                      {trigger === 'arming' && 'Arming…'}
                      {trigger === 'deployed' && 'Intercept En Route'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Companion phone panel, floating proud of the desktop window */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: DURATION.reveal, ease: EASE, delay: 0.2 }}
              className="glass absolute -bottom-12 -left-10 hidden w-48 xl:-left-16 rounded-[1.6rem] p-3 shadow-panel lg:block"
            >
              <div className="rounded-[1.2rem] bg-void/80 p-3">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
                <p className="font-mono text-[9px] uppercase tracking-wide2 text-tactical">Alert · South gate</p>
                <p className="mt-2 text-xs leading-snug text-white/70">
                  Unrecognised person detected. Drone is on station.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <span className="rounded-md bg-tactical px-2 py-1.5 text-center font-mono text-[9px] font-bold uppercase text-void">
                    Deter
                  </span>
                  <span className="rounded-md border border-white/15 px-2 py-1.5 text-center font-mono text-[9px] uppercase text-white/70">
                    Dismiss
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
