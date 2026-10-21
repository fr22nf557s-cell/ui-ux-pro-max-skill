import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useReducedMotion } from 'framer-motion'
import { EASE, DURATION } from '../lib/motion'
import { StatusDot } from './Primitives'
import Logo from './Logo'

const LINKS = [
  { href: '#hardware', label: 'Hardware' },
  { href: '#how', label: 'How it works' },
  { href: '#command', label: 'Command' },
  { href: '#specs', label: 'Specs' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav() {
  const reduce = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  // Which section is under the reader. One observer over the five anchors;
  // the section crossing a band a third of the way down the viewport wins.
  // Sections below the fold arrive as lazy chunks, so the anchors are
  // re-scanned whenever <main> gains children. aria-current tells assistive
  // tech the same thing the underline shows.
  useEffect(() => {
    const band = { rootMargin: '-35% 0px -60% 0px' }
    const seen = new Set()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id === 'top' ? '' : '#' + e.target.id)
      })
    }, band)
    const scan = () => {
      ;['#top', ...LINKS.map((l) => l.href)].forEach((sel) => {
        const el = document.querySelector(sel)
        if (el && !seen.has(el)) {
          seen.add(el)
          io.observe(el)
        }
      })
    }
    scan()
    const main = document.getElementById('main')
    const mo = main && new MutationObserver(scan)
    mo?.observe(main, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo?.disconnect()
    }
  }, [])

  // Condense the bar past the hero fold. Reading scrollY through a motion
  // value keeps this off React's render path until the boolean actually flips.
  useMotionValueEvent(scrollY, 'change', (v) => setCondensed(v > 64))

  // Lock body scroll while the mobile sheet is open, and let Escape close it
  // with focus back on the button that opened it.
  const toggleRef = useRef(null)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return () => { document.body.style.overflow = '' }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
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
      {/* Reading progress: a hairline across the top of the bar that fills as
          the page is scrolled. Transform-only, so it never causes layout. */}
      <motion.span
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-white/70"
      />
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12"
      >
        <a href="#top" className="flex items-center">
          <Logo />
          <span className="sr-only">Hornet Drones home</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex lg:gap-9">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? 'true' : undefined}
                className={`group relative font-mono text-[11px] uppercase tracking-wide2 transition-colors duration-200 hover:text-white ${
                  active === l.href ? 'text-white' : 'text-white/60'
                }`}
              >
                {l.label}
                {/* Underline wipes in from the left on hover, and stays while the section is on screen — scaleX only, no reflow */}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-white transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none ${
                    active === l.href ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
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
            ref={toggleRef}
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

      {/*
        Mobile sheet. Opens/closes with a grid-template-rows transition rather
        than an animated `height: auto`: Framer's auto-height measurement ends
        with a window.scrollTo() that cancels the smooth scroll a tapped link
        has just started, so the menu would close and the page would stop
        moving. `inert` keeps the hidden links out of the tab order.
      */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        inert={open ? undefined : ''}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden border-t border-white/5 bg-ink/95 backdrop-blur-xl">
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
        <div className="flex items-center gap-2 px-8 pb-5 font-mono text-[10px] uppercase tracking-wide2 text-white/55">
          <StatusDot />
          All systems operational
        </div>
        </div>
      </div>
    </motion.header>
  )
}
