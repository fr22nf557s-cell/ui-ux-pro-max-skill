import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { supportsWebGL } from '../lib/webgl'
import DroneSVG from './DroneSVG'

// Only downloaded if the video can't be used at all.
const DroneScene = lazy(() => import('./DroneScene'))

/*
 * SCROLL-SCRUBBED FLIGHT FOOTAGE
 *
 * The hero aircraft is real footage whose playhead is driven by scroll
 * position rather than by time — scroll down and the swarm flies in.
 *
 * Three things make this smooth rather than janky:
 *
 *  1. The source is encoded with EVERY frame as a keyframe (-g 1). Normal
 *     video has an I-frame every 1–2s, so an arbitrary `currentTime` has to
 *     decode forward from the last one; all-intra makes each seek a direct
 *     frame fetch. This is the single thing that makes scrubbing viable.
 *  2. `moov` sits at the front of the file (+faststart), so the browser can
 *     seek before the whole clip has arrived.
 *  3. We never write `currentTime` straight from the scroll handler. Scroll
 *     fires far more often than the decoder can serve seeks, and queued seeks
 *     thrash it. Instead scroll only updates a target, and a rAF loop eases
 *     the playhead toward it — which also adds a little inertia that reads as
 *     physical weight.
 *
 * Fallbacks, in order: video → WebGL drone → animated SVG drone.
 */
export default function HeroFlight({ progress, className = '', fullBleed = false }) {
  const reduce = useReducedMotion()
  const videoRef = useRef(null)
  const target = useRef(0)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  // As a contained plate the clip needs its edges feathered so it does not read
  // as a pasted-in rectangle. Full-bleed it runs to the viewport edge instead,
  // and the section's own scrims do the blending.
  const edgeMask = fullBleed
    ? undefined
    : 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 30%, rgba(0,0,0,0.45) 66%, transparent 100%)'
  const maskStyle = edgeMask ? { maskImage: edgeMask, WebkitMaskImage: edgeMask } : undefined

  // Scroll only ever writes a target; it never touches the video directly.
  useMotionValueEvent(progress, 'change', (p) => {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration)) return
    const clamped = Math.min(Math.max(p, 0), 1)
    // Stop a hair short of the end: seeking to exactly duration can park the
    // element on a blank frame in some browsers.
    target.current = clamped * (v.duration - 0.05)
  })

  useEffect(() => {
    if (reduce || failed) return undefined

    let raf = 0
    const tick = () => {
      const v = videoRef.current
      // readyState 2 = HAVE_CURRENT_DATA. Skipping while `seeking` is what
      // stops the queue of pending seeks from building up.
      if (v && v.readyState >= 2 && !v.seeking && Number.isFinite(v.duration)) {
        const cur = v.currentTime
        const next = cur + (target.current - cur) * 0.16
        // Below half a frame the move is invisible but still costs a seek.
        if (Math.abs(next - cur) > 1 / 120) v.currentTime = next
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, failed])

  // iOS Safari refuses to seek a video that has never been activated, even a
  // muted inline one. A single play/pause on the first interaction unlocks it.
  useEffect(() => {
    const prime = () => {
      const v = videoRef.current
      if (!v) return
      const played = v.play()
      if (played?.then) played.then(() => v.pause()).catch(() => {})
    }
    window.addEventListener('pointerdown', prime, { once: true })
    window.addEventListener('touchstart', prime, { once: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('touchstart', prime)
    }
  }, [])

  if (failed) {
    return (
      <div className={className}>
        {supportsWebGL() ? (
          <Suspense fallback={<DroneSVG reduce={reduce} />}>
            <DroneScene reduce={Boolean(reduce)} />
          </Suspense>
        ) : (
          <DroneSVG reduce={reduce} />
        )}
      </div>
    )
  }

  return (
    <div className={fullBleed ? className : `relative ${className}`}>
      <video
        ref={videoRef}
        className={`h-full w-full object-cover object-[50%_38%] transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={maskStyle}
        poster="hornet-flight-poster.jpg"
        preload="auto"
        muted
        playsInline
        disablePictureInPicture
        aria-label="Hornet drone swarm on approach over open ground at dusk"
        onLoadedData={() => setReady(true)}
        onError={() => setFailed(true)}
      >
        {/* WebM first: where both decode, VP9 avoids H.264 patent-encumbered paths */}
        <source src="hornet-flight.webm" type="video/webm" />
        <source src="hornet-flight.mp4" type="video/mp4" />
      </video>

      {/* Poster holds the frame until the first video frame is decoded */}
      {!ready && (
        <img
          src="hornet-flight-poster.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[50%_38%]"
          style={maskStyle}
        />
      )}
    </div>
  )
}
