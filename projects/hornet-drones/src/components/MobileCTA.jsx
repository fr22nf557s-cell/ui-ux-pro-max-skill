import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE, DURATION } from '../lib/motion'

/*
 * MOBILE CTA BAR
 *
 * On phones the hero's Reserve button scrolls away in the first swipe and the
 * form is a long way down. This bar sits at the bottom of the viewport from
 * the moment the hero leaves until the form itself is on screen, so the
 * one thing the page exists for is always one tap away.
 *
 * Two IntersectionObservers, no scroll listener: it is shown when #top is
 * out of view and #reserve is out of view. Hidden entirely from md up, where
 * the nav's Reserve button is always visible.
 */
export default function MobileCTA() {
  const reduce = useReducedMotion()
  const [pastHero, setPastHero] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const form = document.getElementById('reserve')
    if (!hero || !form) return undefined
    const a = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { threshold: 0.05 })
    const b = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 })
    a.observe(hero)
    b.observe(form)
    return () => {
      a.disconnect()
      b.disconnect()
    }
  }, [])

  const show = pastHero && !formVisible

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: reduce ? 0 : 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 80, opacity: 0 }}
          transition={{ duration: DURATION.ui, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink/90 p-2 pl-4 shadow-panel backdrop-blur-xl">
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-wide2 text-white/60">Alpha waitlist open</span>
            <a
              href="#reserve"
              className="flex-none rounded-xl bg-white px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide2 text-void"
            >
              Join the alpha
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
