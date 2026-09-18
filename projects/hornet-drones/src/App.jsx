import { Suspense, lazy, useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ExplodedView from './components/ExplodedView'

/*
 * Everything below the second section is a separate chunk. The first bundle
 * carries only what the first two screens need; the rest is fetched on idle
 * (so it is there long before anyone scrolls to it) and rendered through
 * Suspense with a sized placeholder, so nothing shifts when it arrives.
 */
const load = {
  HowItWorks: () => import('./components/HowItWorks'),
  Dashboard: () => import('./components/Dashboard'),
  SpecGrid: () => import('./components/SpecGrid'),
  WhyDrone: () => import('./components/WhyDrone'),
  FAQ: () => import('./components/FAQ'),
  FooterCTA: () => import('./components/FooterCTA'),
  MobileCTA: () => import('./components/MobileCTA'),
}
const HowItWorks = lazy(load.HowItWorks)
const Dashboard = lazy(load.Dashboard)
const SpecGrid = lazy(load.SpecGrid)
const WhyDrone = lazy(load.WhyDrone)
const FAQ = lazy(load.FAQ)
const FooterCTA = lazy(load.FooterCTA)
const MobileCTA = lazy(load.MobileCTA)

function Shell({ h = '70vh' }) {
  return <div aria-hidden="true" style={{ minHeight: h }} />
}

export default function App() {
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200))
    const id = idle(() => Object.values(load).forEach((fn) => fn()))
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])

  // Deep links into lazy sections (/#specs from another page, a shared
  // /#faq link). The browser tries the hash before the chunk has mounted and
  // finds nothing, so: jump as soon as the target exists, and keep it pinned
  // while the sections above it swap their placeholders for real content.
  // Stops the moment the reader scrolls themselves.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id || id === 'top') return undefined
    let stopped = false
    let settle = 0
    const stop = () => {
      stopped = true
      mo.disconnect()
      clearTimeout(settle)
    }
    const jump = () => {
      if (stopped) return
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ block: 'start', behavior: 'auto' })
      clearTimeout(settle)
      settle = setTimeout(stop, 1500)
    }
    const mo = new MutationObserver(jump)
    mo.observe(document.body, { childList: true, subtree: true })
    jump()
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    const giveUp = setTimeout(stop, 8000)
    return () => {
      stop()
      clearTimeout(giveUp)
    }
  }, [])

  return (
    <>
      {/* Keyboard users land here first. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:text-void"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <ExplodedView />
        <Suspense fallback={<Shell h="60vh" />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<Shell h="100vh" />}>
          <Dashboard />
        </Suspense>
        <Suspense fallback={<Shell h="60vh" />}>
          <SpecGrid />
        </Suspense>
        <Suspense fallback={<Shell h="80vh" />}>
          <WhyDrone />
        </Suspense>
        <Suspense fallback={<Shell h="80vh" />}>
          <FAQ />
        </Suspense>
      </main>

      <Suspense fallback={<Shell h="90vh" />}>
        <FooterCTA />
      </Suspense>
      <Suspense fallback={null}>
        <MobileCTA />
      </Suspense>
    </>
  )
}
