import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE, DURATION, VIEWPORT, revealUp, stagger } from '../lib/motion'
import { StatusDot } from './Primitives'
import Logo from './Logo'
import Turnstile from './Turnstile'
import { getAttribution } from '../lib/attribution'

/*
 * SECTION 05 — FINAL CTA + FOOTER
 *
 * The waitlist form posts to /api/waitlist (Cloudflare Pages Function), which
 * verifies Turnstile server-side, rate-limits by IP, stores the row in D1 and
 * sends a double opt-in confirmation.
 *
 * Three things the UI has to get right for that back end to be lawful and
 * deliverable:
 *  - Consent is an unticked checkbox. Pre-ticked is not consent under UK GDPR,
 *    and the exact wording agreed to is sent with the request so it can be
 *    stored as evidence.
 *  - Success says "check your email", never "you're on the list" — nothing is
 *    confirmed until the link is clicked.
 *  - The honeypot field is hidden from sight AND from assistive tech, but is
 *    not `display:none`, which some bots detect.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Rendered in the checkbox label AND posted to the API verbatim. One constant,
// so the consent we store is always the consent that was actually shown.
const CONSENT_TEXT =
  'I agree to Hornet Drones emailing me about alpha access. I can unsubscribe at any time.'

// Injected at build time (VITE_TURNSTILE_SITE_KEY). The site key is public by
// design; the secret half never leaves the server.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

const FOOTER_LINKS = [
  { title: 'System', links: ['HRN-01 Drone', 'Charging Nest', 'Command App', 'Coverage Map'] },
  { title: 'Company', links: ['About', 'Engineering', 'Press', 'Careers'] },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy notice', href: '/privacy' },
      { label: 'Data residency', href: '/privacy#who-processes-it-for-us' },
      { label: 'Airspace compliance', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export default function FooterCTA() {
  const reduce = useReducedMotion()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('idle') // idle | error | pending | done
  const [error, setError] = useState('')
  const turnstileToken = useRef(null)
  const honeypot = useRef(null)

  async function submitEmail(e) {
    e.preventDefault()

    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }
    if (!consent) {
      setError('Please tick the box so we know we can email you.')
      setStatus('error')
      return
    }
    // Only block on a missing token when Turnstile is actually configured;
    // otherwise local development would be unusable.
    if (TURNSTILE_SITE_KEY && !turnstileToken.current) {
      setError('Still verifying you are human — give it a second and try again.')
      setStatus('error')
      return
    }

    setError('')
    setStatus('pending')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          consent,
          consentText: CONSENT_TEXT,
          turnstileToken: turnstileToken.current,
          company: honeypot.current?.value || '', // honeypot; empty for humans
          ...getAttribution(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      // Network failure, offline, blocked request.
      setError('Could not reach the server. Check your connection and try again.')
      setStatus('error')
    }
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
                    Check your email — dossier inbound.
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
                  className="block"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
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
                  </div>

                  {/*
                    Honeypot. Positioned off-screen rather than display:none —
                    headless bots increasingly skip fields that are not rendered.
                    aria-hidden + tabIndex -1 keeps it away from real users.
                  */}
                  <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
                  <label htmlFor="waitlist-company">Company (leave blank)</label>
                  <input
                    ref={honeypot}
                    id="waitlist-company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Unticked by default. A pre-ticked box is not consent. */}
                <div className="mt-5 flex items-start gap-3 pl-6">
                  <input
                    id="waitlist-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked)
                      if (status === 'error') setStatus('idle')
                    }}
                    className="mt-0.5 h-4 w-4 flex-none cursor-pointer rounded border-white/30 bg-white/[0.06] accent-white"
                  />
                  <label htmlFor="waitlist-consent" className="cursor-pointer text-[13px] leading-relaxed text-white/55">
                    {CONSENT_TEXT}{' '}
                    <a href="/privacy" className="text-white underline underline-offset-2 hover:text-white/80">
                      Privacy notice
                    </a>
                    .
                  </label>
                </div>

                  <div className="pl-6">
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      onToken={(t) => {
                        turnstileToken.current = t
                      }}
                    />
                  </div>
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
                {/* Columns hold either a plain label or a {label, href} pair,
                    so the ones with real destinations link out properly. */}
                {col.links.map((l) => {
                  const { label, href } = typeof l === 'string' ? { label: l, href: '#top' } : l
                  return (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/55 transition-colors duration-200 hover:text-white">
                        {label}
                      </a>
                    </li>
                  )
                })}
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
