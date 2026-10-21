import { motion, useReducedMotion } from 'framer-motion'
import { EASE, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { SectionLabel } from './Primitives'

/*
 * SECTION — FAQ
 *
 * Native <details>/<summary>: keyboard and screen-reader behaviour for free,
 * no JavaScript state, and the open/close animation is the grid-rows trick
 * (no measured heights, so it never fights the scroll — see ExplodedView).
 *
 * No FAQ structured data on purpose: Google no longer shows it for sites
 * like this one, and marking up answers that say "we will tell you later"
 * earns nothing.
 *
 * Answers say only what is true today. Pricing, dates and the regulatory
 * position are deliberately "shared with the waitlist first", not invented.
 */

const QA = [
  {
    q: 'When can I get one?',
    a: 'The alpha programme opens to the waitlist first, and joining it is the only way in. Alpha members hear about timing, pricing and installation before it is published anywhere else.',
  },
  {
    q: 'How much does it cost?',
    a: 'Pricing goes to the waitlist before anyone else. There is no charge to join the list and no obligation to buy.',
  },
  {
    q: 'Does it film my neighbours?',
    a: 'The aircraft patrols inside the geofence you draw, which is the boundary of your own property. Classification happens on the aircraft and footage stays on your premises rather than in a cloud account. Anyone operating a camera in the UK still has data-protection duties, which we set out on the Airspace & regulation page.',
    link: ['/airspace', 'Airspace & regulation'],
  },
  {
    q: 'Is it legal to fly in the UK?',
    a: 'Drone flight in the UK is regulated by the Civil Aviation Authority. We will publish the HRN-01’s regulatory status in full before any unit is supplied. Until then, the rules that apply to any drone are linked from the Airspace & regulation page.',
    link: ['/airspace', 'Airspace & regulation'],
  },
  {
    q: 'Does it need the internet?',
    a: 'The link between the nest, the aircraft and the command view is a local encrypted mesh, so patrols and alerts at home do not depend on your broadband. Receiving an alert on your phone while you are away does.',
  },
  {
    q: 'What happens to my data?',
    a: 'The only personal data this site collects is the email address you give us for the waitlist, with your consent, and we send one confirmation email before anything else. Beyond that we keep cookie-free, aggregated page counts, nothing tied to you. Everything we do with it is in the privacy notice.',
    link: ['/privacy', 'Privacy notice'],
  },
]

export default function FAQ() {
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="relative border-t border-white/8 py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12">
        <motion.div
          variants={stagger(reduce)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="lg:col-span-4"
        >
          <motion.div variants={revealUp(reduce)}>
            <SectionLabel index="07">Questions</SectionLabel>
          </motion.div>
          <motion.h2 variants={revealUp(reduce)} className="mt-6 font-display text-section font-bold">
            Straight answers.
          </motion.h2>
          <motion.p variants={revealUp(reduce)} className="mt-6 max-w-sm text-[17px] leading-relaxed text-white/60">
            Anything not answered here, ask us at{' '}
            <a href="mailto:hello@hornetdrones.com" className="text-white underline underline-offset-4 hover:text-white/80">
              hello@hornetdrones.com
            </a>
            .
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="lg:col-span-8"
        >
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {QA.map((item) => (
              <details key={item.q} className="faq group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-lg font-semibold text-white sm:text-xl">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="relative grid h-8 w-8 flex-none place-items-center rounded-full border border-white/20 transition-colors group-open:bg-white group-open:text-void"
                  >
                    <span className="absolute h-px w-3 bg-current" />
                    <span className="absolute h-3 w-px bg-current transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <div className="faq-body">
                  <div className="min-h-0 overflow-hidden">
                    <p className="max-w-2xl pb-7 text-[15.5px] leading-relaxed text-white/60">
                      {item.a}
                      {item.link && (
                        <>
                          {' '}
                          <a href={item.link[0]} className="text-white underline underline-offset-4 hover:text-white/80">
                            {item.link[1]}
                          </a>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
