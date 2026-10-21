/**
 * Shared motion tokens.
 *
 * Every transition in the app pulls from here so timing stays coherent:
 * short distances get short durations, large reveals get longer ones, and
 * the easing curve is a single custom cubic-bezier ("tactical ease") that
 * starts fast and settles slowly — it reads as machinery locking into place.
 */
export const EASE = [0.22, 1, 0.36, 1]
export const EASE_SHARP = [0.16, 0.84, 0.44, 1]

export const DURATION = {
  micro: 0.18, // hover/press feedback — must feel instant
  ui: 0.32, // toggles, badges, small state changes
  reveal: 0.7, // section entrances
  hero: 1.1, // the one big first impression
}

/**
 * Section reveal used by every headline/body block.
 * `reduce` collapses it to a pure fade with no travel, which satisfies
 * prefers-reduced-motion without leaving elements invisible.
 */
export const revealUp = (reduce = false, delay = 0) => ({
  hidden: { opacity: 0, y: reduce ? 0 : 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduce ? 0.001 : DURATION.reveal, ease: EASE, delay: reduce ? 0 : delay },
  },
})

/**
 * Parent variant that walks its children in sequence.
 * staggerChildren is the single knob that gives the page its cadence.
 */
export const stagger = (reduce = false, gap = 0.09) => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : gap, delayChildren: reduce ? 0 : 0.08 } },
})

/** Standard viewport config: fire once, slightly before the block is centred. */
export const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' }
