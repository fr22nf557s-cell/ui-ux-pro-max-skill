/*
 * BRAND LOCKUP
 *
 * Vector reconstruction of the Hornet Drones mark: a faceted hornet head in
 * hard profile, three swept blade-wings raking back, antennae and mandibles
 * as spikes. Every shape is a straight-edged polygon — no curves anywhere —
 * which is what gives the mark its cut-from-sheet-metal aggression.
 *
 * ── Swapping in the official artwork ──────────────────────────────────────
 * This is drawn from the supplied reference, not the source file. To use the
 * real asset, drop it at src/assets/hornet-mark.svg and replace the <svg> in
 * HornetMark with an <img src={mark} alt="" />. Nothing else needs to change:
 * both call sites size the mark through the `size` prop and take their colour
 * from `currentColor`, so the official file inherits the same behaviour.
 */

/** The hornet head. Single-colour, inherits currentColor, scales cleanly. */
export function HornetMark({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={(size * 118) / 195}
      viewBox="0 0 195 118"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/*
        Wings: three long, thin blades raking back and up, each tapering to a
        single sharp point. Length is what gives the mark its speed — a short
        wing reads as an insect, a long one reads as a weapon. The two upper
        blades sit back in tone so the stack reads as depth, not a flat fan.
      */}
      <polygon points="122,42 6,4 44,36 129,58" opacity="0.5" />
      <polygon points="124,55 12,42 50,58 129,69" opacity="0.78" />
      <polygon points="126,67 38,94 72,83 130,79" />

      {/* Thorax wedge bridging the wing roots to the head */}
      <polygon points="107,49 123,42 128,79 113,72" />

      {/* Antennae, swept forward off the crown */}
      <polygon points="139,41 157,6 150,42" />
      <polygon points="152,41 189,19 167,46" />

      {/*
        Head. The second sub-path is the eye: fill-rule evenodd punches it out
        as a hole rather than painting over, so the mark stays one colour and
        reads correctly on any ground.
      */}
      <path
        fillRule="evenodd"
        d="M118 43 L151 39 L177 52 L187 67 L169 83 L139 85 L119 68 Z M148 54 L171 59 L164 73 L146 67 Z"
      />

      {/* Mandible spikes, driving down off the jaw */}
      <polygon points="151,84 163,114 170,83" />
      <polygon points="127,79 116,108 140,87" />
    </svg>
  )
}

/**
 * Full lockup.
 *
 * `inline` — mark + the HORNET / DRONES lockup stacked, for the nav bar.
 * `stacked` — mark above HORNET with DRONES letterspaced beneath it between
 *   two tapered rules, matching the brand lockup.
 */
export default function Logo({ variant = 'inline', className = '' }) {
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-start ${className}`}>
        <HornetMark size={64} className="text-white" />
        <span className="mt-3 font-brand text-3xl font-bold italic leading-none tracking-[-0.01em] text-white">
          HORNET
        </span>
        {/* DRONES sits between two rules that taper away from the word */}
        <span className="mt-2 flex w-full items-center gap-2.5">
          <span className="h-px flex-1 bg-gradient-to-l from-white/45 to-transparent" aria-hidden="true" />
          <span className="font-brand text-[11px] font-semibold tracking-[0.42em] text-white/70">DRONES</span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/45 to-transparent" aria-hidden="true" />
        </span>
      </div>
    )
  }

  // The brand is "Hornet Drones", so the nav carries the whole lockup, not just
  // the first word — stacked rather than inline so it still fits the bar height.
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <HornetMark size={30} className="text-white" />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[15px] font-bold italic tracking-[-0.01em] text-white">HORNET</span>
        <span className="mt-[3px] font-brand text-[7.5px] font-semibold tracking-[0.34em] text-white/55">
          DRONES
        </span>
      </span>
    </span>
  )
}
