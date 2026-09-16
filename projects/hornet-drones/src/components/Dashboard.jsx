import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel, StatusDot } from './Primitives'
import FeedScene, { W as FEED_W, H as FEED_H } from './FeedScene'
import SitePlan, { DEFAULT_FENCE } from './SitePlan'

/*
 * SECTION 03 — COMMAND VIEW
 *
 * A working mock of the control software. Everything on screen is either
 * real (the footage, the clock, the state machines) or drawn to scale from
 * the same data the page already quotes. Nothing is a blurred stand-in.
 *
 *  - Feed: the aircraft's own camera looking down at the garden, rendered
 *    live by FeedScene: a person walks in from the gate, and the tracking
 *    lock follows them. Thermal is white-hot LWIR, optical is starlight.
 *  - Site plan: geofence, house, nest, patrol route with the aircraft moving
 *    along it (CSS offset-path, one composited layer), and contacts.
 *  - Clock, zoom, feed mode, intercept and return-to-nest all respond.
 */

const FEED = {
  optical: { label: 'Optical', hud: 'Optical · Starlight' },
  thermal: { label: 'Thermal', hud: 'LWIR · White hot' },
}

const ZOOM = [1, 1.5, 2]

/*
 * A patrol day, newest first, as seconds before the live clock. Kinds drive
 * the Events tab filters; tones drive the row weight. Everything in it is a
 * thing the page says the system does: sweeps, on-aircraft classification,
 * a breach, docking and charging, the link check.
 */
const LOG = [
  [84, 'Perimeter sweep complete · sector NW', 'ok', 'patrol'],
  [219, 'Motion classified: domestic cat · ignored', 'muted', 'patrol'],
  [361, 'Geofence breach · south gate', 'alert', 'alert'],
  [402, 'Motion detected · south gate · classifying', 'muted', 'patrol'],
  [902, 'Recharged to 92% · ready', 'muted', 'nest'],
  [1340, 'Docked · charging', 'muted', 'nest'],
  [1412, 'Perimeter sweep complete · sector SE', 'ok', 'patrol'],
  [2210, 'Motion classified: fox · ignored', 'muted', 'patrol'],
  [2790, 'Perimeter sweep complete · sector NE', 'ok', 'patrol'],
  [3350, 'Wind 14 km/h · inside patrol envelope', 'muted', 'system'],
  [4180, 'Perimeter sweep complete · sector SW', 'ok', 'patrol'],
  [5400, 'Link check · AES-256 · mesh nominal', 'muted', 'system'],
]

const FILTERS = [
  ['all', 'All'],
  ['alert', 'Alerts'],
  ['patrol', 'Patrol'],
  ['nest', 'Nest'],
]

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
  const [mode, setMode] = useState('thermal')
  const [zoom, setZoom] = useState(0)
  const [tab, setTab] = useState('live')
  const [fence, setFence] = useState(DEFAULT_FENCE)
  const [trigger, setTrigger] = useState('idle') // idle | arming | deployed | returning
  const [filter, setFilter] = useState('all')
  // Entries the reader's own actions add to the log, newest first.
  const [added, setAdded] = useState([])
  const logEvent = (text, tone, kind) => setAdded((l) => [{ t: new Date(), text, tone, kind, key: Date.now() + text }, ...l])
  const panelRef = useRef(null)

  // ── Tracking lock overlay ──────────────────────────────────────────────
  // FeedScene reports the figure's box every frame; the lock is DOM, placed
  // over the picture with the same object-cover mapping and zoom the picture
  // uses, so its text stays crisp and its brackets the same size at 2×. The
  // zoom itself is eased here, per frame, so picture and lock never drift.
  const feedRef = useRef(null)
  const zoomWrapRef = useRef(null)
  const lockRef = useRef(null)
  const zoomTarget = useRef(ZOOM[0])
  const zoomNow = useRef(ZOOM[0])
  zoomTarget.current = ZOOM[zoom]
  // With the feed paused (reduced motion) no frame drives the easing, so
  // the zoom is applied directly.
  useEffect(() => {
    if (!reduce || !zoomWrapRef.current) return
    zoomNow.current = ZOOM[zoom]
    zoomWrapRef.current.style.transform = `scale(${ZOOM[zoom]})`
  }, [zoom, reduce])
  const onTrack = useCallback((box) => {
    const c = feedRef.current
    const wrap = zoomWrapRef.current
    const el = lockRef.current
    if (!c || !wrap || !el) return
    const zt = zoomTarget.current
    zoomNow.current += (zt - zoomNow.current) * 0.18
    if (Math.abs(zt - zoomNow.current) < 0.002) zoomNow.current = zt
    const z = zoomNow.current
    wrap.style.transform = `scale(${z})`
    if (!box) {
      el.style.opacity = '0'
      return
    }
    const cw = c.clientWidth
    const ch = c.clientHeight
    const s = Math.max(cw / FEED_W, ch / FEED_H)
    const ox = (cw - FEED_W * s) / 2
    const oy = (ch - FEED_H * s) / 2
    const map = (x, y) => [(x * s + ox - cw / 2) * z + cw / 2, (y * s + oy - ch / 2) * z + ch / 2]
    const [x1, y1] = map(box.x, box.y)
    const [x2, y2] = map(box.x + box.w, box.y + box.h)
    el.style.opacity = '1'
    el.style.transform = `translate(${x1.toFixed(1)}px, ${y1.toFixed(1)}px)`
    el.style.width = `${(x2 - x1).toFixed(1)}px`
    el.style.height = `${(y2 - y1).toFixed(1)}px`
    el.firstElementChild.textContent = `Human ${box.confidence}%`
    el.lastElementChild.textContent = `${box.range} m`
  }, [])

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
    const id = setTimeout(() => {
      if (trigger === 'arming') {
        setTrigger('deployed')
        logEvent('Intercept on station · south gate · eyes on', 'alert', 'alert')
      } else {
        setTrigger('idle')
        logEvent('Returned to nest · charging', 'muted', 'nest')
      }
    }, ms)
    return () => clearTimeout(id)
  }, [trigger])

  // Events are timestamped relative to the live clock so the log never
  // shows a time that is obviously in the past or future.
  const events = [
    ...added,
    ...LOG.map(([s, text, tone, kind]) => ({ t: minus(now, s), text, tone, kind, key: text })),
  ]
  const shown = tab === 'events' ? events.filter((e) => filter === 'all' || e.kind === filter) : events.slice(0, 4)
  const counts = {
    sweeps: events.filter((e) => e.text.startsWith('Perimeter sweep')).length,
    classified: events.filter((e) => e.text.startsWith('Motion classified')).length,
    alerts: events.filter((e) => e.kind === 'alert').length,
  }

  const airborne = trigger === 'deployed' || trigger === 'returning'

  // Keyboard: T thermal, O optical, + / - zoom, 1-3 tabs. Only while the
  // pointer is over the panel, so the page's own shortcuts are untouched.
  const hover = useRef(false)
  useEffect(() => {
    const onKey = (e) => {
      if (!hover.current || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 't') setMode('thermal')
      else if (k === 'o') setMode('optical')
      else if (k === '+' || k === '=') setZoom((z) => Math.min(ZOOM.length - 1, z + 1))
      else if (k === '-' || k === '_') setZoom((z) => Math.max(0, z - 1))
      else if (k === '1') setTab('live')
      else if (k === '2') setTab('map')
      else if (k === '3') setTab('events')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
            <SectionLabel index="04">Command</SectionLabel>
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
          <motion.p variants={revealUp(reduce)} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-wide2 text-white/55">
            <span>Working mock · try the controls</span>
            <a href="/command-view" className="text-white/70 transition-colors hover:text-white">About the command view →</a>
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
              onPointerEnter={() => {
                hover.current = true
              }}
              onPointerLeave={() => {
                hover.current = false
                resetPointer()
              }}
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
                  <span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-wide2 text-white/60 sm:inline">
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
                  <span className="hidden whitespace-nowrap text-white/35 xl:inline" title="Keyboard: T thermal · O optical · + − zoom · 1 2 3 tabs">
                    T · O · ± · 1 2 3
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
                    tab === 'live' ? '' : 'hidden'
                  }`}
                >
                  <div ref={feedRef} className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[300px] md:flex-1">
                    <div ref={zoomWrapRef} className="h-full w-full">
                      <FeedScene mode={mode} paused={Boolean(reduce)} onTrack={onTrack} className="h-full w-full object-cover" />
                    </div>

                    {/* Tracking lock: corner brackets, class + confidence, range */}
                    <div ref={lockRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform">
                      <span className="absolute -top-[15px] left-0 whitespace-nowrap bg-white px-1 font-mono text-[8px] font-bold uppercase leading-[11px] tracking-wide2 text-black">Human 97%</span>
                      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-white/90" />
                      <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-white/90" />
                      <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-white/90" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-white/90" />
                      <span className="absolute -bottom-[14px] right-0 whitespace-nowrap font-mono text-[8px] tabular-nums text-white/85">22 m</span>
                    </div>

                    {/* Sensor noise + vignette, so the footage reads as a camera, not a video player */}
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

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
                        REC · CAM-01<span className="hidden sm:inline"> · HRN-01</span>
                      </span>
                      {/* Top-right: mode + format */}
                      <span className="absolute right-7 top-3 text-right">
                        {FEED[mode].hud}
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

                {/* Site plan + telemetry. On the Site tab the plan takes the whole
                    panel and the geofence handles become draggable. */}
                <div
                  className={`flex flex-col gap-3 ${
                    tab === 'map' ? 'md:col-span-5' : tab === 'live' ? 'md:col-span-2' : 'hidden'
                  }`}
                >
                  <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-3">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wide2 text-white/55">
                      <span>Site plan</span>
                      {tab === 'map' ? (
                        <span className="flex items-center gap-3">
                          <span className="hidden text-white/70 sm:inline">Drag the handles to redraw the geofence</span>
                          <button
                            type="button"
                            onClick={() => setFence(DEFAULT_FENCE)}
                            className="rounded border border-white/25 px-2 py-0.5 text-[9px] uppercase tracking-wide2 text-white/80 hover:border-white/50 hover:text-white"
                          >
                            Reset
                          </button>
                        </span>
                      ) : (
                        <span className="whitespace-nowrap">Geofence · 1 : 400</span>
                      )}
                    </div>
                    <SitePlan
                      fence={fence}
                      onFenceChange={setFence}
                      editable={tab === 'map'}
                      reduce={Boolean(reduce)}
                      airborne={airborne}
                      className={`mt-2 ${tab === 'map' ? 'mx-auto max-w-[640px]' : ''}`}
                    />
                  </div>

                  {/* Telemetry */}
                  <dl className={`grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 ${tab === 'map' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
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
                <div
                  className={`rounded-xl border border-white/10 bg-black/50 ${
                    tab === 'events' ? 'md:col-span-5' : tab === 'live' ? 'hidden md:col-span-3 md:block lg:ml-[8.5rem]' : 'hidden'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-wide2 text-white/55">
                    <span className="whitespace-nowrap">Events · today</span>
                    <span className="hidden whitespace-nowrap text-white/35 xl:inline">Stored on-premise</span>
                  </div>
                  {tab === 'events' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
                      <div role="group" aria-label="Filter events" className="flex gap-1">
                        {FILTERS.map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={filter === key}
                            onClick={() => setFilter(key)}
                            className={`rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-wide2 transition-colors ${
                              filter === key ? 'bg-white text-void' : 'text-white/55 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wide2 text-white/45">
                        {counts.sweeps} sweeps · {counts.classified} classified · {counts.alerts} {counts.alerts === 1 ? 'alert' : 'alerts'}
                      </span>
                    </div>
                  )}
                  <ul className="divide-y divide-white/[0.06]" aria-live={tab === 'events' ? 'polite' : undefined}>
                    {shown.map((e) => (
                      <li key={e.key} className="flex items-center gap-3 px-3 py-2 font-mono text-[10px]">
                        <time className="tabular-nums text-white/45">{hhmmss(e.t)}</time>
                        <span
                          className={`h-1.5 w-1.5 flex-none rounded-full ${
                            e.tone === 'alert' ? 'bg-white' : e.tone === 'ok' ? 'bg-white/50' : 'bg-white/20'
                          }`}
                        />
                        <span className={`truncate ${e.tone === 'alert' ? 'text-white' : 'text-white/55'}`}>{e.text}</span>
                        {e.tone === 'alert' && (
                          <button
                            type="button"
                            onClick={() => setTab('live')}
                            className="ml-auto rounded border border-white/30 px-1.5 py-0.5 text-[8px] uppercase tracking-wide2 text-white/80 transition-colors hover:border-white hover:text-white"
                          >
                            Review
                          </button>
                        )}
                      </li>
                    ))}
                    {shown.length === 0 && (
                      <li className="px-3 py-6 text-center font-mono text-[10px] uppercase tracking-wide2 text-white/40">Nothing logged</li>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 ${tab === 'live' ? 'flex-col md:col-span-2' : 'flex-col sm:flex-row md:col-span-5'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (trigger !== 'idle') return
                      setTrigger('arming')
                      logEvent('Intercept launched · south gate', 'ok', 'alert')
                    }}
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
                    onClick={() => {
                      if (trigger !== 'deployed') return
                      setTrigger('returning')
                      logEvent('Return to nest · en route', 'muted', 'nest')
                    }}
                    disabled={trigger !== 'deployed'}
                    className="rounded-xl border border-white/20 px-5 py-3 font-mono text-[11px] uppercase tracking-wide2 text-white/80 transition-colors hover:border-white/40 hover:text-white disabled:opacity-35"
                  >
                    Return to nest
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Companion phone, floating proud of the desktop window */}
            {tab === 'live' && (
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
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
