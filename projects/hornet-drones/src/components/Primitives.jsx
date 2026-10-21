import { motion, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp } from '../lib/motion'

/** Numbered, heavily-tracked section eyebrow: "02 / EXPLODED VIEW". */
export function SectionLabel({ index, children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-white/45" aria-hidden="true" />
      <span className="eyebrow">
        {index ? `${index} / ` : ''}
        {children}
      </span>
    </div>
  )
}

/** Any block that should fade+rise into place once, when scrolled to. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div
  return (
    <MotionTag
      className={className}
      variants={revealUp(reduce, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Primary CTA — amber outline that blooms on hover.
 * The glow is a sibling layer (not a box-shadow transition) so the browser
 * animates opacity/transform only: no shadow repaints, no layout work.
 */
export function GlowButton({ children, className = '', ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.985 }}
      transition={{ duration: DURATION.micro, ease: EASE }}
      className={`group relative isolate overflow-hidden rounded-full border border-white/70 bg-white/[0.07] px-8 py-4 font-mono text-[12px] uppercase tracking-wide2 text-white shadow-glow transition-colors duration-200 hover:bg-white hover:text-void ${className}`}
      {...props}
    >
      {/* Sweeping highlight that crosses the button on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%] motion-reduce:hidden"
      />
      {children}
    </motion.button>
  )
}

/** Secondary CTA — glassmorphism: blurred translucent plate + hairline edge. */
export function GlassButton({ children, className = '', ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.985 }}
      transition={{ duration: DURATION.micro, ease: EASE }}
      className={`glass group inline-flex items-center gap-3 rounded-full px-8 py-4 font-mono text-[12px] uppercase tracking-wide2 text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/** Live status dot: solid core + expanding halo. */
export function StatusDot({ tone = 'signal' }) {
  const color = tone === 'signal' ? 'bg-white' : 'bg-white/55'
  return (
    <span className="relative flex h-2 w-2" aria-hidden="true">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  )
}
