import { motion, useReducedMotion } from 'framer-motion'
import { EASE, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel } from './Primitives'

/*
 * SECTION — WHY A DRONE
 *
 * A category comparison: what a fixed camera, an alarm and a patrol drone
 * each do about an intruder. It compares kinds of product, never a named
 * one, and every HRN-01 tick is something the page already claims.
 */

const ROWS = [
  ['Covers the whole perimeter, not one angle', 'no', 'no', 'yes'],
  ['Goes and looks when something moves', 'no', 'no', 'yes'],
  ['Sees in total darkness', 'part', 'no', 'yes'],
  ['Decides what it is before alerting you', 'part', 'no', 'yes'],
  ['Acts before anyone reaches the door', 'no', 'no', 'yes'],
  ['Keeps the footage on your premises', 'part', 'no', 'yes'],
]

const COLS = ['Fixed cameras', 'Alarm system', 'HRN-01']

function Mark({ v }) {
  if (v === 'yes')
    return (
      <span role="img" aria-label="Yes" className="grid h-7 w-7 place-items-center rounded-full bg-white text-void">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6.5 4.8 9 10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  if (v === 'part')
    return (
      <span role="img" aria-label="Partly" className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-white/70">
        <span className="h-px w-3 bg-current" />
      </span>
    )
  return (
    <span role="img" aria-label="No" className="grid h-7 w-7 place-items-center rounded-full border border-white/12 text-white/30">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function WhyDrone() {
  const reduce = useReducedMotion()

  return (
    <section id="why" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div variants={stagger(reduce)} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="max-w-2xl">
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="06">Why a drone</SectionLabel>
          </motion.div>
          <motion.h2 variants={revealUp(reduce)} className="mt-6 font-display text-section font-bold">
            Cameras watch. Alarms react.
            <br />
            <span className="text-silver">This one goes and looks.</span>
          </motion.h2>
          <motion.p variants={revealUp(reduce)} className="mt-6 text-[17px] leading-relaxed text-white/60">
            A fixed camera covers one angle and tells you afterwards. An alarm waits for a door. A patrol aircraft
            covers the whole boundary and puts eyes on the thing that moved, before it reaches the house.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="mt-14 overflow-hidden rounded-2xl border border-white/10"
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th scope="col" className="px-4 py-4 font-mono text-[10px] font-normal uppercase tracking-label text-silver sm:px-6">
                  Against an intruder
                </th>
                {COLS.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`px-2 py-4 text-center font-mono text-[10px] uppercase tracking-wide2 sm:px-4 ${
                      i === COLS.length - 1 ? 'bg-white/[0.04] font-semibold text-white' : 'font-normal text-white/55'
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, ...vals]) => (
                <tr key={label} className="border-b border-white/[0.06] last:border-0">
                  <th scope="row" className="px-4 py-4 text-[15px] font-normal text-white/80 sm:px-6">
                    {label}
                  </th>
                  {vals.map((v, i) => (
                    <td key={i} className={`px-2 py-4 sm:px-4 ${i === vals.length - 1 ? 'bg-white/[0.04]' : ''}`}>
                      <div className="flex justify-center">
                        <Mark v={v} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wide2 text-silver">
          Category comparison · not a comparison with any named product · pre-production system
        </p>
      </div>
    </section>
  )
}
