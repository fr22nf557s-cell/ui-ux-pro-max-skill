/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand core — dark charcoal ground, pure black wells, tactical amber, crisp white.
        ink: '#0B0C10',
        void: '#000000',
        steel: {
          900: '#0E1015',
          800: '#14171F',
          700: '#1C202A',
          600: '#2A2F3C',
          500: '#3B4250',
        },
        tactical: {
          DEFAULT: '#F59E0B',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
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
        tactical: '0.28em',
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
        glow: '0 0 0 1px rgba(245,158,11,0.55), 0 0 22px -4px rgba(245,158,11,0.55), 0 0 60px -20px rgba(245,158,11,0.45)',
        'glow-lg': '0 0 0 1px rgba(245,158,11,0.75), 0 0 34px -2px rgba(245,158,11,0.7), 0 0 90px -20px rgba(245,158,11,0.55)',
        panel: '0 30px 80px -30px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
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
      },
      animation: {
        sweep: 'sweep 4s linear infinite',
        ping: 'ping 2.8s cubic-bezier(0.2,0.7,0.3,1) infinite',
        breathe: 'breathe 2.4s ease-in-out infinite',
        scanline: 'scanline 5.5s linear infinite',
      },
    },
  },
  plugins: [],
}
