/* ==========================================================================
   NORVEX GAMING — the mark, defined once
   --------------------------------------------------------------------------
   Every brand asset (favicon, app icon, logo, share image, the mark inlined in
   the site header) is generated from the numbers here by scripts/build-brand.mjs.
   Change a value, run `npm run brand`, and everything follows.
   ========================================================================== */
export const INK = '#08080a';
export const GOLD = '#d9b75b';
export const GOLD_LIGHT = '#f3d98b';
export const GOLD_DEEP = '#b8902b';

/* the seal's proportions, on a 40 x 40 canvas */
export const SPEC = {
  outer: 18.8,        // hexagon circumradius
  keyline: 16.3,      // inner hairline hexagon
  keylineWeight: 1.0,
  keylineOpacity: 0.6,
  nWidth: 16.0,
  nHeight: 16.8,
  nStem: 3.7,
  nDiagonal: 1.035,   // the diagonal is drawn this much heavier than the stems,
};                    // because a diagonal of equal width always reads thinner

const r = (n) => Math.round(n * 100) / 100;

/** Regular pointy-top hexagon. */
export function hexPath(cx, cy, R) {
  const a = R * Math.sqrt(3) / 2;
  return `M${r(cx)} ${r(cy - R)}L${r(cx + a)} ${r(cy - R / 2)}V${r(cy + R / 2)}L${r(cx)} ${r(cy + R)}L${r(cx - a)} ${r(cy + R / 2)}V${r(cy - R / 2)}Z`;
}

/** Monogram N as one closed outline: two stems joined by a diagonal, flat terminals. */
export function nPath(cx, cy, w = SPEC.nWidth, h = SPEC.nHeight, stem = SPEC.nStem, k = SPEC.nDiagonal) {
  const x0 = cx - w / 2, x3 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  const x1 = x0 + stem, x2 = x3 - stem;
  const dh = stem * k * Math.hypot(w, h) / h;          // the diagonal's horizontal footprint
  const rightTop = x0 + dh, leftBot = x3 - dh;
  const yOn = (xa, xb, x) => y0 + h * (x - xa) / (xb - xa);
  return `M${r(x0)} ${r(y0)}H${r(rightTop)}L${r(x2)} ${r(yOn(rightTop, x3, x2))}V${r(y0)}H${r(x3)}V${r(y1)}` +
         `H${r(leftBot)}L${r(x1)} ${r(yOn(x0, leftBot, x1))}V${r(y1)}H${r(x0)}Z`;
}

/**
 * The seal's inner markup, for a 40 x 40 viewBox.
 * `id` scopes the gradient so several copies can sit on one page.
 * `scale` grows the whole mark about its centre (1 = the standard lockup size).
 */
export function sealBody(id = 'nvm', scale = 1) {
  const s = SPEC;
  const R = s.outer * scale, kR = s.keyline * scale;
  const open = scale === 1 ? '' : `<g transform="translate(20 20) scale(${r(scale)}) translate(-20 -20)">`;
  const close = scale === 1 ? '' : '</g>';
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${GOLD_LIGHT}"/><stop offset=".5" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD_DEEP}"/>` +
    `</linearGradient></defs>${open}` +
    `<path d="${hexPath(20, 20, s.outer)}" fill="url(#${id})"/>` +
    `<path d="${hexPath(20, 20, s.keyline)}" fill="none" stroke="${INK}" stroke-width="${s.keylineWeight}" opacity="${s.keylineOpacity}"/>` +
    `<path d="${nPath(20, 20)}" fill="${INK}"/>${close}`;
}

/**
 * One-colour seal for print, packing tape, stamps and embroidery: a solid hexagon
 * with the N knocked clean out. The keyline is dropped because it cannot exist in a
 * single ink, which is also what the eye sees below about 20 px anyway.
 */
export function sealMonoBody(fill = 'currentColor') {
  return `<path d="${hexPath(20, 20, SPEC.outer)}${nPath(20, 20)}" fill="${fill}" fill-rule="evenodd"/>`;
}

/** A standalone square SVG of the seal. */
export function sealSvg({ id = 'nvm', scale = 1, title = 'Norvex Gaming', plate = null, size = null } = {}) {
  const dim = size ? ` width="${size}" height="${size}"` : '';
  const bg = plate ? `<rect width="40" height="40" fill="${plate}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"${dim} role="img" aria-label="${title}">${bg}${sealBody(id, scale)}</svg>`;
}
