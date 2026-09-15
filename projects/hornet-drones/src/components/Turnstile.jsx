import { useEffect, useRef, useState } from 'react'

/*
 * Cloudflare Turnstile, loaded lazily.
 *
 * The script is only fetched once the widget actually mounts, so a visitor who
 * never scrolls to the form never pays for it. That matters: it is a
 * third-party request on the critical path otherwise.
 *
 * The token this produces proves nothing on its own — the server exchanges it
 * with siteverify using the secret key. Treat it as a claim, never a result.
 *
 * Tokens expire after ~300s, so the widget refreshes itself rather than
 * letting a user who filled the form slowly hit a confusing failure.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let scriptPromise = null

function loadScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve()
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('turnstile script failed'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export default function Turnstile({ siteKey, onToken, onError }) {
  const hostRef = useRef(null)
  const widgetId = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!siteKey) return undefined
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return
        widgetId.current = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'flexible',
          callback: (t) => onToken(t),
          'expired-callback': () => {
            onToken(null)
            // Silent refresh: the user has done nothing wrong.
            if (widgetId.current) window.turnstile.reset(widgetId.current)
          },
          'error-callback': () => {
            onToken(null)
            setFailed(true)
            onError?.()
          },
        })
      })
      .catch(() => {
        if (cancelled) return
        setFailed(true)
        onError?.()
      })

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current)
        } catch {
          /* already gone */
        }
      }
    }
    // siteKey is build-time constant; callbacks are stable via refs upstream.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  if (!siteKey) return null

  return (
    <div className="mt-4">
      <div ref={hostRef} />
      {failed && (
        <p role="alert" className="pt-2 font-mono text-[11px] text-red-400">
          Verification could not load. Check that your browser or an extension isn&apos;t blocking
          challenges.cloudflare.com, then reload.
        </p>
      )}
    </div>
  )
}
