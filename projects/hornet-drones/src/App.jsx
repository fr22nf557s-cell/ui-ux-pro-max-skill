import Nav from './components/Nav'
import Hero from './components/Hero'
import ExplodedView from './components/ExplodedView'
import HowItWorks from './components/HowItWorks'
import Dashboard from './components/Dashboard'
import SpecGrid from './components/SpecGrid'
import WhyDrone from './components/WhyDrone'
import FAQ from './components/FAQ'
import FooterCTA from './components/FooterCTA'

export default function App() {
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
        <HowItWorks />
        <Dashboard />
        <SpecGrid />
        <WhyDrone />
        <FAQ />
      </main>

      <FooterCTA />
    </>
  )
}
