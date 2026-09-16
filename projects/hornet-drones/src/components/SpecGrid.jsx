import { motion, useReducedMotion } from 'framer-motion'
import { EASE, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { useCountUp } from '../hooks/useCountUp'
import { SectionLabel } from './Primitives'

/*
 * SECTION 04 — TECHNICAL PERFORMANCE SPEC GRID
 *
 * Four columns on desktop, two on tablet, one on mobile. Numeric specs
 * count up once when scrolled into view (see useCountUp); text specs such as
 * IP67 / AES-256 render immediately, because animating a string is noise.
 */

const SPECS = [
  {
    value: 1.8,
    decimals: 1,
    unit: 's',
    label: '0 – 30 mph',
    detail: 'Standing start to intercept speed. Ducted rotors spool in under 400 ms.',
  },
  {
    value: 45,
    decimals: 0,
    unit: 'min',
    label: 'Flight time',
    detail: 'Continuous patrol on a single charge, at 12 °C with a full sensor payload.',
  },
  {
    text: 'IP67',
    label: 'All-weather',
    detail: 'Sealed against dust ingress and 30 minutes under one metre of water.',
  },
  {
    text: 'AES-256',
    label: 'Encrypted link',
    detail: 'Local-first radio link. Keys are generated on the nest and never leave it.',
  },
]

/** Single spec cell. Extracted so each one owns its own useCountUp hook. */
function Spec({ spec, index }) {
  const reduce = useReducedMotion()
  const [ref, counted] = useCountUp(spec.value ?? 0, { decimals: spec.decimals ?? 0, duration: 1500 })

  return (
    <motion.div
      ref={ref}
      variants={revealUp(reduce, index * 0.06)}
      className="group relative overflow-hidden border-t border-white/10 px-1 pt-8 md:border-l md:border-t-0 md:px-8 md:first:border-l-0 md:first:pl-0"
    >
      {/* Amber rule wipes across the cell top on hover (scaleX only) */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none md:left-auto md:top-0 md:h-full md:w-px md:origin-top md:scale-y-0 md:group-hover:scale-y-100"
      />

      <p className="font-mono text-[10px] uppercase tracking-label text-silver">
        {String(index + 1).padStart(2, '0')}
      </p>

      <p
        className={`mt-6 flex min-h-[4.2rem] items-end whitespace-nowrap font-display font-bold leading-none tracking-tight ${
          spec.text ? 'text-[clamp(2.1rem,3.2vw,2.9rem)]' : 'text-[clamp(2.6rem,4.6vw,4rem)]'
        }`}
      >
        {spec.text ?? (spec.decimals ? counted.toFixed(spec.decimals) : Math.round(counted))}
        {spec.unit && <span className="ml-1 font-mono text-xl font-medium text-white/55">{spec.unit}</span>}
      </p>

      <h3 className="mt-5 font-mono text-[11px] uppercase tracking-wide2 text-white">{spec.label}</h3>
      <p className="mt-2.5 max-w-[26ch] text-sm leading-relaxed text-white/45">{spec.detail}</p>
    </motion.div>
  )
}

export default function SpecGrid() {
  const reduce = useReducedMotion()

  return (
    <section id="specs" className="relative border-y border-white/8 bg-void/40 py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div variants={stagger(reduce)} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="05">Performance</SectionLabel>
          </motion.div>

          <motion.div variants={revealUp(reduce)} className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-2xl font-display text-section font-bold">Engineered to the edge of the envelope.</h2>
            {/* Honest label: these are targets for a pre-production system, not
                third-party verified figures. "Verified" would be a claim. */}
            <a
              href="/specifications"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide2 text-white/70 transition-colors hover:text-white"
            >
              <span>Pre-production targets · <span className="whitespace-nowrap">full specifications <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-0.5">→</span></span></span>
            </a>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-4 lg:gap-y-0">
            {SPECS.map((s, i) => (
              <Spec key={s.label} spec={s} index={i} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hairline that scales in as the grid arrives — a full-bleed "locked" cue */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: reduce ? 0.001 : 1.2, ease: EASE, delay: 0.2 }}
        className="hairline mx-auto mt-20 h-px w-full max-w-[1400px] origin-center"
      />
    </section>
  )
}
