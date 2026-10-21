import markUrl from '../assets/hornet-mark.png'

/*
 * BRAND LOCKUP
 *
 * The hornet is the supplied artwork, not a reconstruction. It arrived as a
 * screenshot of the full stacked lockup -- black mark on a light grey ground,
 * fully opaque, with a two-pixel panel edge down the right side -- so it was
 * keyed out rather than dropped in as-is: darkness became coverage, the ground
 * became nothing, and what remains is painted white. That is the only reading
 * that survives the move onto a near-black page, where the original black
 * artwork would simply be invisible.
 *
 * Only the hornet is taken from that file. The wordmark sitting under it in
 * the supplied image is deliberately left behind, because HORNET / DRONES is
 * set below as live text in Chakra Petch: it stays crisp at every size, it is
 * selectable and legible to a screen reader, and it keeps the header lockup
 * horizontal, which a stacked image could not do at 30px tall.
 *
 * -- When the vector arrives --------------------------------------------
 * This is a raster lifted from a screenshot, so it softens under magnification
 * and cannot be recoloured. Ask whoever produced the logo for the SVG, drop it
 * at src/assets/hornet-mark.svg and point `markUrl` at it; nothing else in this
 * file changes. Note that `currentColor` no longer reaches the mark, since the
 * asset is baked white -- which is exactly what both call sites already asked
 * for with `text-white`, so the swap costs no behaviour.
 */

/** Intrinsic size of the asset, kept here so the aspect is never guessed. */
const MARK_W = 320
const MARK_H = 159

/** The hornet. `size` sets the width; the height follows the artwork. */
export function HornetMark({ size = 30, className = '' }) {
  return (
    <img
      src={markUrl}
      width={size}
      height={(size * MARK_H) / MARK_W}
      className={className}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  )
}

/**
 * Full lockup: the mark, then HORNET with DRONES directly beneath it as one
 * word-block. DRONES is letter-spaced to sit the full width of HORNET, so the
 * two words read as a single unit rather than a title and a caption.
 *
 * `variant="stacked"` is the same lockup at footer size.
 */
export default function Logo({ variant = 'inline', className = '' }) {
  const big = variant === 'stacked'
  return (
    <span className={`inline-flex items-center ${big ? 'gap-4' : 'gap-2.5'} ${className}`}>
      {/* Sized to the optical height the old mark had: this artwork is 2:1 where
          that was 1.65:1, so matching on width alone would shrink it. */}
      <HornetMark size={big ? 88 : 37} className="flex-none" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-brand font-bold italic tracking-[-0.01em] text-white ${
            big ? 'text-[2.6rem]' : 'text-[15px]'
          }`}
        >
          HORNET
        </span>
        {/* Justified under HORNET: flex + space-between spreads the letters
            edge to edge whatever the rendered width of the word above. */}
        <span
          aria-hidden="true"
          className={`flex w-full justify-between font-brand font-semibold text-white/75 ${
            big ? 'mt-1.5 text-[0.95rem]' : 'mt-[3px] text-[7.5px]'
          }`}
        >
          {'DRONES'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
        <span className="sr-only">Hornet Drones</span>
      </span>
    </span>
  )
}
