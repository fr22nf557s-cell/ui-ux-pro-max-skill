import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { StatusDot } from './Primitives'
import Logo from './Logo'

/*
 * SECTION 05 — FINAL CTA + FOOTER
 *
 * The waitlist form is fully client-side here: it validates, shows pending
 * and success states, and never pretends to have submitted anything.
 * Wire `submitEmail` to your real endpoint (see the TODO) and the UI states
 * already handle the rest.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const FOOTER_LINKS = [
  { title: 'System', links: ['HRN-01 Drone', 'Charging Nest', 'Command App', 'Coverage Map'] },
  { title: 'Company', links: ['About', 'Engineering', 'Press', 'Careers'] },
  { title: 'Legal', links: ['Privacy', 'Data residency', 'Airspace compliance', 'Terms'] },
]

export default function FooterCTA() {
  const reduce = useReducedMotion()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | error | pending | done
  const [error, setError] = useState('')

  async function submitEmail(e) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }
    setError('')
    setStatus('pending')

    // TODO: replace with your real endpoint, e.g.
    // await fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) })
    await new Promise((r) => setTimeout(r, 900))
    setStatus('done')
  }

  return (
    <footer id="reserve" className="relative overflow-hidden bg-void pt-28 sm:pt-36">
      {/* Amber horizon glow rising from the bottom edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[60vh] w-[110vw] -translate-x-1/2 rounded-[50%] bg-white/[0.05] blur-[130px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.div variants={stagger(reduce)} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <motion.div variants={revealUp(reduce)} className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/45" aria-hidden="true" />
            <span className="eyebrow">05 / Alpha access</span>
          </motion.div>

          {/* The finale headline: full-bleed, tight leading, amber second line */}
          <motion.h2
            variants={revealUp(reduce)}
            className="mt-8 max-w-[14ch] font-display text-finale font-bold lg:max-w-none"
          >
            Your Perimeter,
            <br />
            <span className="text-silver">Reimagined.</span>
          </motion.h2>

          <motion.p variants={revealUp(reduce)} className="mt-8 max-w-xl text-[17px] leading-relaxed text-white/55">
            The Alpha programme opens with 500 systems. Join the waitlist for an install slot, pricing and the full
            technical dossier.
          </motion.p>

          {/* ── Waitlist capture ── */}
          <motion.div variants={revealUp(reduce)} className="mt-10 max-w-xl">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'done' ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.ui, ease: EASE }}
                  className="flex items-center gap-4 rounded-full border border-white/50 bg-white/[0.08] px-6 py-4"
                >
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white text-void">
                    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
                      <path d="M2 7.5l3.5 3.5L12 3.5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                  <p className="font-mono text-[12px] uppercase tracking-wide2 text-white">
                    You're on the list — dossier inbound.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submitEmail}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.ui, ease: EASE }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@perimeter.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === 'error') setStatus('idle')
                      }}
                      aria-invalid={status === 'error'}
                      aria-describedby={status === 'error' ? 'waitlist-error' : undefined}
                      className={`h-14 w-full rounded-full border bg-white/[0.04] px-6 font-mono text-sm text-white placeholder:text-white/55 transition-colors duration-200 focus:bg-white/[0.07] ${
                        status === 'error' ? 'border-red-500/70' : 'border-white/15 hover:border-white/30'
                      }`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'pending'}
                    whileHover={reduce ? undefined : { y: -2 }}
                    whileTap={reduce ? undefined : { y: 0, scale: 0.985 }}
                    transition={{ duration: DURATION.micro, ease: EASE }}
                    className="h-14 flex-none rounded-full bg-white px-8 font-mono text-[12px] font-bold uppercase tracking-wide2 text-void shadow-glow transition-colors duration-200 hover:bg-white/90 disabled:opacity-60"
                  >
                    {status === 'pending' ? 'Securing…' : 'Join Alpha'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Inline validation message, announced to screen readers */}
            <AnimatePresence>
              {status === 'error' && (
                <motion.p
                  id="waitlist-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pl-6 pt-3 font-mono text-[11px] text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="mt-4 pl-6 font-mono text-[10px] uppercase tracking-wide2 text-white/55">
              No spam · Unsubscribe anytime · Data stays in-region
            </p>
          </motion.div>
        </motion.div>

        {/* ── Footer body ── */}
        <div className="mt-24 grid grid-cols-2 gap-10 border-t border-white/8 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <Logo variant="stacked" className="max-w-[210px]" />
            <p className="mt-7 max-w-xs text-sm leading-relaxed text-white/55">
              Autonomous aerial protection for the private perimeter. Designed and assembled in-house.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-label text-white/55">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-sm text-white/55 transition-colors duration-200 hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ── Status bar ── */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/8 py-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-white/55">
            © {new Date().getFullYear()} Hornet Drones Ltd. All rights reserved.
          </p>
          <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide2 text-white/55">
            <StatusDot />
            All Systems Operational
          </p>
        </div>
      </div>
    </footer>
  )
}
