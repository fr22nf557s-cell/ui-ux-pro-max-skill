import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts a number up once the element scrolls into view.
 *
 * Driven by requestAnimationFrame rather than a CSS/Framer tween because we
 * need the *formatted* value (1.8s, 45, IP67…) on every frame, not a
 * transformable style. Eased with the same out-expo curve as the rest of the
 * page so the numbers decelerate like the reveals do.
 */
export function useCountUp(target, { duration = 1600, decimals = 0 } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    // Respect the OS motion setting: jump straight to the final number.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }

    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4) // out-quart
      setValue(Number((target * eased).toFixed(decimals)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, decimals])

  return [ref, value]
}
