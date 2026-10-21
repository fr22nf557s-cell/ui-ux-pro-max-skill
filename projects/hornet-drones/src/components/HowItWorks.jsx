import { motion, useReducedMotion } from 'framer-motion'
import { EASE, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel } from './Primitives'

/*
 * SECTION — HOW IT WORKS
 *
 * The four things the system does on every event, in order. Every line here
 * restates something the page already claims elsewhere (exploded view, spec
 * grid, command view); nothing new is asserted.
 */

const STEPS = [
  {
    n: '01',
    title: 'Patrol',
    copy: 'The aircraft lifts from the nest and flies the route you drew, at low altitude, quieter than the street outside.',
    icon: (
      <g>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    n: '02',
    title: 'Detect',
    copy: 'Thermal and low-light sensors pick up movement anywhere inside the geofence, in total darkness.',
    icon: (
      <g>
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
        <circle cx="12" cy="12" r="2.6" />
      </g>
    ),
  },
  {
    n: '03',
    title: 'Classify',
    copy: 'The on-board chip decides what it is in 0.4 seconds: cat, fox, courier, intruder. Nothing leaves your property to make that call.',
    icon: (
      <g>
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="0.6" />
        <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
      </g>
    ),
  },
  {
    n: '04',
    title: 'Respond',
    copy: 'Known contacts are ignored. An intruder is flagged, the aircraft holds on station with eyes on, and you get the alert.',
    icon: (
      <g>
        <path d="M12 4 4 8v5c0 4.4 3.4 7.6 8 8 4.6-.4 8-3.6 8-8V8l-8-4Z" />
        <path d="m9 12.5 2 2 4-4.5" />
      </g>
    ),
  },
]

export default function HowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section id="how" className="relative border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div variants={stagger(reduce)} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="03">How it works</SectionLabel>
          </motion.div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            <motion.h2 variants={revealUp(reduce)} className="font-display text-section font-bold lg:col-span-7">
              Four moves.
              <br />
              <span className="text-silver">Nobody gets up.</span>
            </motion.h2>
            <motion.p variants={revealUp(reduce)} className="max-w-md text-[17px] leading-relaxed text-white/60 lg:col-span-5 lg:pt-3">
              Every event runs the same sequence, from the first sign of movement to the alert on your phone. The
              aircraft does all of it; you only see the last step.
            </motion.p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-16 sm:mt-20">
          {/* Rail: the line the steps hang off. Draws itself in on desktop. */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: reduce ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.4, ease: EASE }}
            className="absolute left-0 top-[22px] hidden h-px w-full origin-left bg-gradient-to-r from-white/40 via-white/25 to-transparent lg:block"
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: reduce ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.15 + i * 0.18 }}
                className="relative"
              >
                {/* Node on the rail */}
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-full border border-white/25 bg-ink text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-label text-silver">{s.n}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-white/55">{s.copy}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
