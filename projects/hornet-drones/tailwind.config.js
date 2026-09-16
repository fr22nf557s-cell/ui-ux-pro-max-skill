/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Monochrome system. Hierarchy comes from luminance, never hue:
        // black grounds, charcoal surfaces, and white as the single accent.
        void: '#000000',
        ink: '#0B0C10',
        carbon: '#16181D',
        steel: {
          900: '#16181D',
          800: '#1C1F26',
          700: '#262A33',
          600: '#333843',
          500: '#454B58',
        },
        signal: '#FFFFFF', // accent: CTAs, active state, live indicators
        silver: '#A8ADB8', // secondary: technical labels, eyebrows, sub-heads
        // 4.04:1 on the page ground — under AA for body text. Large or bold
        // text only; never small copy. Use `silver` (8.69:1) for muted text.
        slate: '#6B7280',
      },
      fontFamily: {
        // Space Grotesk = geometric/technical display. Inter = UI + body.
        // JetBrains Mono = every number, readout and telemetry label.
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // Logo lockup only — chamfered techno sans matching the brand wordmark.
        brand: ['"Chakra Petch"', '"Space Grotesk"', 'sans-serif'],
      },
      letterSpacing: {
        // Generous tracking is the signature of the section eyebrows / labels.
        label: '0.28em',
        wide2: '0.16em',
      },
      fontSize: {
        // Fluid display scale — no breakpoint jumps between 360px and 2560px.
        hero: ['clamp(2.15rem, 5.2vw, 4.75rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        section: ['clamp(2rem, 4.6vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        finale: ['clamp(2.4rem, 8.5vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      boxShadow: {
        // The amber "glow" is two stacked shadows: a tight core + a wide bloom.
        glow: '0 0 0 1px rgba(255,255,255,0.42), 0 0 22px -6px rgba(255,255,255,0.30), 0 0 60px -22px rgba(255,255,255,0.20)',
        'glow-lg': '0 0 0 1px rgba(255,255,255,0.68), 0 0 34px -4px rgba(255,255,255,0.42), 0 0 90px -22px rgba(255,255,255,0.26)',
        panel: '0 30px 80px -30px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
        // Film grain: an SVG turbulence tile. Vector, so it costs no asset and
        // tiles at any density.
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        // Radar sweep + status pulse live in CSS so they keep running without JS work.
        sweep: { to: { transform: 'rotate(360deg)' } },
        ping: {
          '0%': { transform: 'scale(0.35)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        breathe: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(400%)' } },
        // The aircraft marker riding the patrol route on the site plan.
        patrol: { from: { offsetDistance: '0%' }, to: { offsetDistance: '100%' } },
      },
      animation: {
        sweep: 'sweep 4s linear infinite',
        ping: 'ping 2.8s cubic-bezier(0.2,0.7,0.3,1) infinite',
        breathe: 'breathe 2.4s ease-in-out infinite',
        scanline: 'scanline 5.5s linear infinite',
        patrol: 'patrol 28s linear infinite',
      },
    },
  },
  plugins: [],
}
