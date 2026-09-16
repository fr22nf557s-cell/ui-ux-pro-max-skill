import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel, StatusDot } from './Primitives'

/*
 * SECTION 03 — COMMAND VIEW
 *
 * A working mock of the control software. Everything on screen is either
 * real (the footage, the clock, the state machines) or drawn to scale from
 * the same data the page already quotes. Nothing is a blurred stand-in.
 *
 *  - Feed: the flight footage on a loop, with a HUD. "Thermal" is the same
 *    footage as a white-hot inversion, which is what a LWIR camera in
 *    white-hot mode actually looks like — not an orange colour wash.
 *  - Site plan: geofence, house, nest, patrol route with the aircraft moving
 *    along it (CSS offset-path, one composited layer), and contacts.
 *  - Clock, zoom, feed mode, intercept and return-to-nest all respond.
 */

const FEED = {
  optical: {
    label: 'Optical',
    filter: 'grayscale(1) contrast(1.08) brightness(0.92)',
  },
  thermal: {
    label: 'Thermal',
    // White-hot: warm = bright. Inverting the monochrome footage puts the
    // motors and body (the hot parts) at the top of the scale.
    filter: 'grayscale(1) invert(1) contrast(1.45) brightness(1.02)',
  },
}

const ZOOM = [1, 1.5, 2]

// The patrol route the aircraft flies, in site-plan units (viewBox 0 0 200 150).
const ROUTE =
  'M 58 40 C 100 22, 150 26, 168 52 C 184 76, 176 110, 140 124 C 104 138, 52 130, 34 104 C 18 80, 26 52, 58 40 Z'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const hhmmss = (d) => d.toTimeString().slice(0, 8)
const minus = (d, s) => new Date(d.getTime() - s * 1000)

export default function Dashboard() {
  const reduce = useReducedMotion()
  const now = useClock()
  const [mode, setMode] = useState('optical')
  const [zoom, setZoom] = useState(0)
  const [tab, setTab] = useState('live')
  const [trigger, setTrigger] = useState('idle') // idle | arming | deployed | returning
  const panelRef = useRef(null)
  const videoRef = useRef(null)

  // ── Pointer tilt ────────────────────────────────────────────────────────
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 120, damping: 18, mass: 0.6 })
  const rotateY = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-5, 5])
  const rotateX = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [4, -4])
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

  // ── Intercept / return state machine ───────────────────────────────────
  useEffect(() => {
    if (trigger === 'idle' || trigger === 'deployed') return undefined
    const ms = trigger === 'arming' ? 900 : 2200
    const id = setTimeout(() => setTrigger(trigger === 'arming' ? 'deployed' : 'idle'), ms)
    return () => clearTimeout(id)
  }, [trigger])

  // Slow the loop so the 3 s clip reads as a steady feed rather than a GIF.
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.55
  }, [])

  // Events are timestamped relative to the live clock so the log never
  // shows a time that is obviously in the past or future.
  const events = [
    { t: minus(now, 84), text: 'Perimeter sweep complete · sector NW', tone: 'ok' },
    { t: minus(now, 219), text: 'Motion classified: domestic cat · ignored', tone: 'muted' },
    { t: minus(now, 361), text: 'Geofence breach · south gate', tone: 'alert' },
    { t: minus(now, 902), text: 'Recharged to 92% · ready', tone: 'muted' },
  ]

  const airborne = trigger === 'deployed' || trigger === 'returning'

  return (
    <section id="command" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[38vh] w-[70vw] -translate-x-1/2 rounded-[50%] bg-white/[0.045] blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12">
        {/* ── Copy ── */}
        <motion.div
          variants={stagger(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="lg:col-span-4"
        >
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="03">Command</SectionLabel>
          </motion.div>
          <motion.h2 variants={revealUp(reduce)} className="mt-6 font-display text-section font-bold">
            Your perimeter, on one pane of glass.
          </motion.h2>
          <motion.p variants={revealUp(reduce)} className="mt-6 text-[17px] leading-relaxed text-white/60">
            Every patrol, classification and intercept in a single control centre, on desktop or in your pocket.
            Switch to thermal, redraw a geofence, or launch an intercept in one tap.
          </motion.p>

          <motion.ul variants={revealUp(reduce)} className="mt-9 space-y-3.5">
            {['Sub-second live link over local mesh', 'Geofence editing with drag handles', 'Full event history, stored on-premise'].map(
              (line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-white/55">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-white/70" aria-hidden="true" />
                  {line}
                </li>
              ),
            )}
          </motion.ul>
          <motion.p variants={revealUp(reduce)} className="mt-8 font-mono text-[10px] uppercase tracking-wide2 text-white/40">
            Working mock · try the controls
          </motion.p>
        </motion.div>

        {/* ── Control centre ── */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE }}
          className="lg:col-span-8"
        >
          <div className="relative [perspective:1800px]">
            <motion.div
              ref={panelRef}
              onPointerMove={handlePointer}
              onPointerLeave={resetPointer}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="gpu relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f14] shadow-panel"
            >
              {/* ── Title bar ── */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5 sm:gap-3 sm:px-4">
                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
                  </div>
                  <span className="hidden font-mono text-[10px] uppercase tracking-wide2 text-white/60 sm:inline">
                    Hornet Command
                  </span>
                  <span className="hidden text-white/20 sm:inline">/</span>
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wide2 text-white">HRN-01</span>
                </div>

                <div role="tablist" aria-label="Command view" className="flex items-center gap-0.5 rounded-lg bg-black/40 p-0.5">
                  {[
                    ['live', 'Live'],
                    ['map', 'Site'],
                    ['events', 'Events'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={tab === key}
                      onClick={() => setTab(key)}
                      className={`relative rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide2 transition-colors ${
                        tab === key ? 'text-void' : 'text-white/45 hover:text-white'
                      }`}
                    >
                      {tab === key && (
                        <motion.span
                          layoutId="cmd-tab"
                          transition={{ duration: reduce ? 0.001 : DURATION.ui, ease: EASE }}
                          className="absolute inset-0 rounded-md bg-white"
                        />
                      )}
                      <span className="relative">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide2 text-white/60">
                  <span className="hidden items-center gap-2 sm:flex">
                    <StatusDot />
                    Live
                  </span>
                  <time className="whitespace-nowrap tabular-nums text-white" dateTime={now.toISOString()}>
                    {hhmmss(now)}
                  </time>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-5">
                {/* Feed */}
                <div
                  className={`relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black md:col-span-3 ${
                    tab === 'events' ? 'hidden md:flex' : ''
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[300px] md:flex-1">
                    {reduce ? (
                      <img
                        src="hornet-flight-poster.jpg"
                        alt="Nest camera view of the HRN-01 outbound at dusk"
                        className="h-full w-full object-cover transition-[filter] duration-500"
                        style={{ filter: FEED[mode].filter, transform: `scale(${ZOOM[zoom]})` }}
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        className="h-full w-full object-cover object-[50%_40%] transition-[filter,transform] duration-500"
                        style={{ filter: FEED[mode].filter, transform: `scale(${ZOOM[zoom]})` }}
                        poster="hornet-flight-poster.jpg"
                        autoPlay
                        muted
                        loop
                        playsInline
                        disablePictureInPicture
                        aria-label="Nest camera: live feed of the HRN-01 outbound"
                      >
                        <source src="hornet-flight.webm" type="video/webm" />
                        <source src="hornet-flight.mp4" type="video/mp4" />
                      </video>
                    )}

                    {/* Sensor noise + vignette, so the footage reads as a camera, not a video player */}
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-grid [background-size:3px_3px]" />

                    {/* HUD */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 font-mono text-[9px] uppercase tracking-wide2 text-white/80">
                      {/* Corner brackets */}
                      {['left-2 top-2 border-l border-t', 'right-2 top-2 border-r border-t', 'left-2 bottom-2 border-l border-b', 'right-2 bottom-2 border-r border-b'].map((c) => (
                        <span key={c} className={`absolute h-4 w-4 border-white/50 ${c}`} />
                      ))}
                      {/* Reticle */}
                      <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-white/60" />
                        <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-white/60" />
                        <span className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-white/60" />
                        <span className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-white/60" />
                      </span>

                      {/* Top-left: recording + camera */}
                      <span className="absolute left-7 top-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-breathe" />
                        REC · CAM-02 · Nest
                      </span>
                      {/* Top-right: mode + format */}
                      <span className="absolute right-7 top-3 text-right">
                        {mode === 'thermal' ? 'LWIR · White hot' : 'Optical · 4K'}
                      </span>

                      {/* Tracking box on the lead aircraft. It sits in a layer that
                          zooms with the picture, so the lock stays on the target. */}
                      <span className="absolute inset-0 transition-transform duration-500" style={{ transform: `scale(${ZOOM[zoom]})` }}>
                        <span className="absolute left-[41%] top-[26%] h-[38%] w-[22%] border border-white/80">
                          <span className="absolute -top-5 left-0 whitespace-nowrap bg-white px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal text-void">
                            HRN-01 · 12 m
                          </span>
                          <span className="absolute -bottom-5 right-0 whitespace-nowrap text-white/70">outbound</span>
                        </span>
                      </span>

                      {/* Bottom-left: zoom readout / bottom-right: clock */}
                      <span className="absolute bottom-3 left-7">Zoom {ZOOM[zoom].toFixed(1)}×</span>
                      <span className="absolute bottom-3 right-7 tabular-nums">{hhmmss(now)}</span>

                      {/* Thermal scale, only in thermal mode */}
                      <AnimatePresence>
                        {mode === 'thermal' && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
                          >
                            <span>36°</span>
                            <span className="h-20 w-1.5 rounded-full bg-gradient-to-b from-white via-white/50 to-black ring-1 ring-white/30" />
                            <span>8°</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Feed controls */}
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/[0.03] p-1.5">
                    <div role="radiogroup" aria-label="Camera mode" className="flex items-center gap-0.5 rounded-lg bg-black/50 p-0.5">
                      {Object.entries(FEED).map(([key, m]) => (
                        <button
                          key={key}
                          role="radio"
                          aria-checked={mode === key}
                          onClick={() => setMode(key)}
                          className={`relative rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide2 transition-colors ${
                            mode === key ? 'text-void' : 'text-white/45 hover:text-white'
                          }`}
                        >
                          {mode === key && (
                            <motion.span
                              layoutId="feed-pill"
                              transition={{ duration: reduce ? 0.001 : DURATION.ui, ease: EASE }}
                              className="absolute inset-0 rounded-md bg-white"
                            />
                          )}
                          <span className="relative">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-0.5 rounded-lg bg-black/50 p-0.5" aria-label="Zoom">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0, z - 1))}
                        disabled={zoom === 0}
                        aria-label="Zoom out"
                        className="rounded-md px-2.5 py-1.5 font-mono text-xs text-white/70 hover:text-white disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-mono text-[10px] tabular-nums text-white">{ZOOM[zoom].toFixed(1)}×</span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(ZOOM.length - 1, z + 1))}
                        disabled={zoom === ZOOM.length - 1}
                        aria-label="Zoom in"
                        className="rounded-md px-2.5 py-1.5 font-mono text-xs text-white/70 hover:text-white disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Site plan + telemetry */}
                <div className={`flex flex-col gap-3 md:col-span-2 ${tab === 'events' ? 'hidden md:flex' : ''}`}>
                  <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-3">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wide2 text-white/55">
                      <span>Site plan</span>
                      <span>Geofence · 1 : 400</span>
                    </div>

                    <svg viewBox="0 0 200 150" className="mt-2 w-full" role="img" aria-label="Site plan: geofence around the property, the house, the nest and the aircraft on its patrol route">
                      <defs>
                        <pattern id="plan-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M10 0H0V10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="200" height="150" fill="url(#plan-grid)" />

                      {/* Geofence */}
                      <path
                        d="M 18 30 L 120 12 L 186 44 L 190 118 L 126 142 L 24 128 Z"
                        fill="rgba(255,255,255,0.03)"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                      />
                      {['18,30', '120,12', '186,44', '190,118', '126,142', '24,128'].map((p) => (
                        <circle key={p} cx={p.split(',')[0]} cy={p.split(',')[1]} r="2" fill="#0d0f14" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
                      ))}

                      {/* House + drive */}
                      <rect x="72" y="52" width="58" height="46" rx="1.5" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
                      <path d="M 101 98 L 101 142" stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round" />
                      <text x="101" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="JetBrains Mono, monospace" letterSpacing="1">HOUSE</text>

                      {/* Gates */}
                      <text x="101" y="148" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">S GATE</text>

                      {/* Patrol route */}
                      <path d={ROUTE} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" strokeDasharray="2 2.5" />

                      {/* Nest */}
                      <g transform="translate(140 108)">
                        <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="0.9" />
                        <text x="7" y="2.5" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontFamily="JetBrains Mono, monospace">NEST</text>
                      </g>

                      {/* Contacts */}
                      <circle cx="46" cy="70" r="2.2" fill="rgba(255,255,255,0.4)" />
                      <circle cx="160" cy="66" r="2.2" fill="rgba(255,255,255,0.4)" />
                      <g transform="translate(112 136)">
                        <circle r="6" fill="none" stroke="#fff" strokeWidth="0.8" className="animate-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
                        <circle r="2.6" fill="#fff" />
                      </g>

                      {/* Aircraft on route (CSS motion path) */}
                      <g
                        className={reduce ? '' : 'animate-patrol'}
                        style={reduce ? { transform: 'translate(58px, 40px)' } : { offsetPath: `path("${ROUTE}")`, offsetRotate: 'auto' }}
                      >
                        <circle r="7" fill="rgba(255,255,255,0.12)" />
                        <path d="M -4 -4 L 4 4 M -4 4 L 4 -4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                        <circle r="1.6" fill="#0d0f14" stroke="#fff" strokeWidth="1" />
                      </g>
                    </svg>

                    <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wide2">
                      <span className="text-white/55">3 contacts · 1 flagged</span>
                      <span className="text-white">{airborne ? 'Intercept' : 'Patrol'}</span>
                    </div>
                  </div>

                  {/* Telemetry */}
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
                    {[
                      ['Altitude', airborne ? '38.0 m' : '31.4 m'],
                      ['Battery', '92%'],
                      ['Link', 'AES-256'],
                      ['Wind', '14 km/h'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-[#0d0f14] px-3 py-2.5">
                        <dt className="font-mono text-[9px] uppercase tracking-wide2 text-white/50">{k}</dt>
                        <dd className="mt-0.5 font-mono text-sm tabular-nums text-white">
                          {v}
                          {k === 'Battery' && (
                            <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full w-[92%] rounded-full bg-white/80" />
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Event log */}
                <div className={`rounded-xl border border-white/10 bg-black/50 md:col-span-3 lg:ml-[8.5rem] ${tab === 'events' ? '' : 'hidden md:block'}`}>
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-wide2 text-white/55">
                    <span>Events · today</span>
                    <span className="text-white/35">Stored on-premise</span>
                  </div>
                  <ul className="divide-y divide-white/[0.06]">
                    {events.map((e) => (
                      <li key={e.text} className="flex items-center gap-3 px-3 py-2 font-mono text-[10px]">
                        <time className="tabular-nums text-white/45">{hhmmss(e.t)}</time>
                        <span
                          className={`h-1.5 w-1.5 flex-none rounded-full ${
                            e.tone === 'alert' ? 'bg-white' : e.tone === 'ok' ? 'bg-white/50' : 'bg-white/20'
                          }`}
                        />
                        <span className={`truncate ${e.tone === 'alert' ? 'text-white' : 'text-white/55'}`}>{e.text}</span>
                        {e.tone === 'alert' && (
                          <span className="ml-auto rounded border border-white/30 px-1.5 py-0.5 text-[8px] uppercase tracking-wide2 text-white/80">
                            Review
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => trigger === 'idle' && setTrigger('arming')}
                    aria-live="polite"
                    className={`relative flex-1 overflow-hidden rounded-xl px-5 py-4 font-mono text-[12px] font-bold uppercase tracking-wide2 transition-colors duration-200 ${
                      trigger === 'idle' ? 'bg-white text-void hover:bg-white/90' : 'bg-white/75 text-void'
                    }`}
                  >
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
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                          <path d="M2 7.5l3.5 3.5L12 3.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        </motion.svg>
                      )}
                      {trigger === 'idle' && 'Deploy Intercept'}
                      {trigger === 'arming' && 'Arming…'}
                      {trigger === 'deployed' && 'On station · S gate'}
                      {trigger === 'returning' && 'Returning…'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => trigger === 'deployed' && setTrigger('returning')}
                    disabled={trigger !== 'deployed'}
                    className="rounded-xl border border-white/20 px-5 py-3 font-mono text-[11px] uppercase tracking-wide2 text-white/80 transition-colors hover:border-white/40 hover:text-white disabled:opacity-35"
                  >
                    Return to nest
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Companion phone, floating proud of the desktop window */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: DURATION.reveal, ease: EASE, delay: 0.2 }}
              className="glass absolute -bottom-6 -left-5 hidden w-44 rounded-[1.6rem] p-2.5 shadow-panel lg:block"
            >
              <div className="rounded-[1.2rem] bg-void/85 p-3">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
                <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide2 text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-breathe" />
                  Alert · S gate
                </p>
                <p className="mt-2 text-xs leading-snug text-white/70">Unrecognised person at the south gate. Drone on station.</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <span className="rounded-md bg-white px-2 py-1.5 text-center font-mono text-[9px] font-bold uppercase text-void">Deter</span>
                  <span className="rounded-md border border-white/15 px-2 py-1.5 text-center font-mono text-[9px] uppercase text-white/70">Dismiss</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
