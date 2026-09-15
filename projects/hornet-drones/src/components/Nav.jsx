import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useReducedMotion } from 'framer-motion'
import { EASE, DURATION } from '../lib/motion'
import { StatusDot } from './Primitives'
import Logo from './Logo'

const LINKS = [
  { href: '#hardware', label: 'Hardware' },
  { href: '#command', label: 'Command' },
  { href: '#specs', label: 'Specs' },
]

export default function Nav() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)

  // Condense the bar past the hero fold. Reading scrollY through a motion
  // value keeps this off React's render path until the boolean actually flips.
  useMotionValueEvent(scrollY, 'change', (v) => setCondensed(v > 64))

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      initial={reduce ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: DURATION.reveal, ease: EASE, delay: 0.15 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        condensed ? 'border-b border-white/10 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12"
      >
        <a href="#top" className="flex items-center">
          <Logo />
          <span className="sr-only">Hornet Drones home</span>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative font-mono text-[11px] uppercase tracking-wide2 text-white/60 transition-colors duration-200 hover:text-white"
              >
                {l.label}
                {/* Underline wipes in from the left on hover — scaleX only, no reflow */}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href="#reserve"
            className="hidden rounded-full border border-white/60 px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide2 text-white transition-colors duration-200 hover:bg-white hover:text-void sm:inline-block"
          >
            Reserve
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="glass rounded-full p-3 md:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d={open ? 'M3 3l10 10M13 3L3 13' : 'M2 5h12M2 11h12'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile sheet: height animation is cheap here (few children, no images) */}
      <motion.div
        id="mobile-nav"
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0.001 : DURATION.ui, ease: EASE }}
        className="overflow-hidden border-t border-white/5 bg-ink/95 backdrop-blur-xl md:hidden"
      >
        <ul className="space-y-1 px-5 py-4">
          {[...LINKS, { href: '#reserve', label: 'Reserve System' }].map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 font-mono text-xs uppercase tracking-wide2 text-white/70 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 px-8 pb-5 font-mono text-[10px] uppercase tracking-wide2 text-white/40">
          <StatusDot />
          All systems operational
        </div>
      </motion.div>
    </motion.header>
  )
}
