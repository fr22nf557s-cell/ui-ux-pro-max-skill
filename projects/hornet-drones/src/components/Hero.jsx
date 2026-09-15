import { Suspense, lazy, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, stagger, revealUp } from '../lib/motion'
import { supportsWebGL } from '../lib/webgl'
import { GlowButton, GlassButton, StatusDot } from './Primitives'
import DroneSVG from './DroneSVG'

// three.js only downloads if/when the hero actually mounts the 3D branch.
const DroneScene = lazy(() => import('./DroneScene'))

const HEADLINE = ['Autonomous Aerial', 'Protection.', 'Unseen. Unmatched.']

export default function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef(null)
  const canUse3D = supportsWebGL()

  // Scroll-linked hero exit. Mapping the section's own progress (0 -> 1 across
  // one viewport) means the copy drifts up and dims as the next section takes
  // over — a depth cue, not a parallax gimmick.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0])
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.16])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden pt-24 sm:pt-32"
      aria-labelledby="hero-heading"
    >
      {/* ── Ambient background stack (all decorative, all pointer-events-none) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Tactical grid, masked to fade toward the edges */}
        <div
          className="absolute inset-0 bg-grid [background-size:64px_64px] opacity-[0.55]"
          style={{ maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 78%)' }}
        />
        {/* Amber floor bloom beneath the aircraft */}
        <div className="absolute left-1/2 top-[58%] h-[46vh] w-[76vw] -translate-x-1/2 rounded-[50%] bg-tactical/[0.16] blur-[110px]" />
        {/* Pure-black vignette anchors the section to the footer */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-void to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12">
        {/* ── Copy column ── */}
        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          variants={stagger(reduce, 0.11)}
          initial="hidden"
          animate="visible"
          className="z-10 lg:col-span-6"
        >
          <motion.div variants={revealUp(reduce)} className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
            <StatusDot />
            <span className="font-mono text-[10px] uppercase tracking-tactical text-white/70">
              Alpha units shipping Q3
            </span>
          </motion.div>

          <h1 id="hero-heading" className="font-display text-hero font-bold">
            {/* Each line masks its own reveal, so the headline "unfolds" rather
                than fading as a single block. overflow-hidden + y:100% is the
                classic award-site line-mask, done with zero extra libraries. */}
            {HEADLINE.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={reduce ? { opacity: 0 } : { y: '110%' }}
                  animate={reduce ? { opacity: 1 } : { y: '0%' }}
                  transition={{ duration: DURATION.hero, ease: EASE, delay: 0.18 + i * 0.1 }}
                >
                  {i === 2 ? (
                    <>
                      <span className="text-tactical">Unseen.</span> Unmatched.
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p variants={revealUp(reduce, 0.5)} className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/60">
            The ultra-quiet, AI-powered perimeter drone system that patrols, detects, and deters threats before they
            reach your doorstep.
          </motion.p>

          <motion.div variants={revealUp(reduce, 0.62)} className="mt-9 flex flex-wrap items-center gap-4">
            <GlowButton onClick={() => document.querySelector('#reserve')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>
              Reserve System
            </GlowButton>
            <GlassButton>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-tactical group-hover:text-void">
                <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden="true">
                  <path d="M0 0l8 4.5L0 9z" fill="currentColor" />
                </svg>
              </span>
              Watch Patrol Demo
            </GlassButton>
          </motion.div>

          <motion.dl
            variants={revealUp(reduce, 0.74)}
            className="mt-11 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10"
          >
            {[
              ['24/7', 'Autonomous patrol'],
              ['<18 dB', 'At 30 m altitude'],
              ['0.4 s', 'Threat classify'],
            ].map(([v, k]) => (
              <div key={k} className="bg-ink/90 px-4 py-4">
                <dt className="font-mono text-lg font-medium text-white">{v}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-wide2 text-white/40">{k}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ── Visual column: 3D canvas, or the SVG airframe if WebGL is out ── */}
        <motion.div
          style={{ scale: sceneScale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.25 }}
          className="gpu relative order-first h-[32vh] min-h-[240px] w-full lg:order-none lg:col-span-6 lg:h-[72vh]"
        >
          {canUse3D ? (
            // Suspense fallback is the SVG drone: the hero is never empty,
            // even on the first paint before the three.js chunk lands.
            <Suspense fallback={<DroneSVG reduce={reduce} />}>
              <DroneScene reduce={Boolean(reduce)} />
            </Suspense>
          ) : (
            <DroneSVG reduce={reduce} />
          )}

          {/* HUD corner brackets framing the aircraft */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-6 hidden lg:block">
            {[
              'left-0 top-0 border-l border-t',
              'right-0 top-0 border-r border-t',
              'left-0 bottom-0 border-l border-b',
              'right-0 bottom-0 border-r border-b',
            ].map((pos) => (
              <span key={pos} className={`absolute h-6 w-6 border-tactical/40 ${pos}`} />
            ))}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-tactical text-white/25">
              HRN-01 · Live telemetry
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll affordance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        style={{ opacity: copyOpacity }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="font-mono text-[9px] uppercase tracking-tactical text-white/35">Scroll</span>
        {/* The line "drains" downward on a loop: transform-origin trick, GPU only */}
        <span className="relative h-12 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-tactical animate-scanline" />
        </span>
      </motion.div>
    </section>
  )
}
