#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — build every brand asset from scripts/brand.mjs
   --------------------------------------------------------------------------
     node scripts/build-brand.mjs          (or: npm run brand)

   Writes assets/img/: mark.svg, mark-inline.svg, favicon.svg, logo.svg,
   favicon-32.png, apple-touch-icon.png, logo-512.png, og-image.jpg
   Needs Playwright (a dev dependency) to rasterise and to measure the wordmark.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sealSvg, sealBody, sealMonoBody, SPEC, INK, GOLD, GOLD_DEEP } from './brand.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const img = (f) => resolve(root, 'assets/img', f);
const out = [];
const note = (f, extra = '') => { const b = existsSync(img(f)) ? Buffer.byteLength(readFileSync(img(f))) : 0; out.push(`  ${f.padEnd(22)} ${String(Math.max(1, Math.round(b / 1024))).padStart(4)} KB  ${extra}`); };

/* ---------------------------------------------------------------- vectors */
// the mark as the site inlines it (one gradient id per copy, so several can share a page)
writeFileSync(resolve(root, 'scripts/mark-inline.svg'), `<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">${sealBody('__ID__')}</svg>\n`);
writeFileSync(img('mark.svg'), sealSvg({ id: 'nvm' }) + '\n');
// favicon: the seal pushed to the edge of the canvas, every pixel counts at 16 px
writeFileSync(img('favicon.svg'), sealSvg({ id: 'nvf', scale: 19.4 / SPEC.outer }) + '\n');
note('mark.svg'); note('favicon.svg', 'seal at full bleed');
out.push(`  scripts/mark-inline.svg   ${String(Math.round(Buffer.byteLength(readFileSync(resolve(root, 'scripts/mark-inline.svg'))) / 1024)).padStart(2)} KB  inlined by build-pages.py`);

/* ---------------------------------------------------------------- rasters */
const { chromium } = await import('playwright');
const fontCss = readFileSync(resolve(root, 'assets/css/fonts.css'), 'utf8')
  .replace(/url\(\.\.\/fonts\/([^)]+)\)/g, (m, f) => `url(data:font/woff2;base64,${readFileSync(resolve(root, 'assets/fonts', f)).toString('base64')})`);
const browser = await chromium.launch();
const page = await browser.newPage();
const dataUri = (svg) => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

async function shoot(file, size, html, type) {
  await page.setViewportSize({ width: size.w, height: size.h });
  await page.setContent(`<style>${fontCss} *{margin:0;box-sizing:border-box}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: img(file), ...(type === 'jpeg' ? { type: 'jpeg', quality: 90 } : { omitBackground: size.transparent === true }) });
}

const plate = (px, pad) => `<body style="width:${px}px;height:${px}px;background:${INK};display:grid;place-items:center">
  <div style="width:${px - pad * 2}px;height:${px - pad * 2}px">${sealSvg({ id: 'p', size: px - pad * 2 })}</div></body>`;

await shoot('favicon-32.png', { w: 32, h: 32, transparent: true }, `<body style="width:32px;height:32px">${sealSvg({ id: 'f', scale: 19.4 / SPEC.outer, size: 32 })}</body>`);
await shoot('apple-touch-icon.png', { w: 180, h: 180 }, plate(180, 22));
await shoot('logo-512.png', { w: 512, h: 512 }, plate(512, 62));
note('favicon-32.png'); note('apple-touch-icon.png'); note('logo-512.png');

/* ------------------------------------------------- wordmark measurements */
/* GAMING is tracked so its visible width matches NORVEX exactly: both are six letters. */
const NAME = 'NORVEX', SUB = 'GAMING';
const NAME_SIZE = 19, NAME_LS = 6, SUB_SIZE = 8;
const m = await page.evaluate(async ({ fontCss, NAME, SUB, NAME_SIZE, SUB_SIZE }) => {
  const st = document.createElement('style'); st.textContent = fontCss; document.head.appendChild(st);
  await document.fonts.load(`700 ${NAME_SIZE}px Montserrat`); await document.fonts.load(`600 ${SUB_SIZE}px Montserrat`);
  await document.fonts.load(`400 ${NAME_SIZE}px Montserrat`); await document.fonts.ready;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg'); document.body.appendChild(svg);
  const measure = (text, size, weight) => {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('font-family', 'Montserrat'); t.setAttribute('font-size', size); t.setAttribute('font-weight', weight);
    t.textContent = text; svg.appendChild(t);
    const w = t.getComputedTextLength(); const box = t.getBBox(); t.remove();
    return { w, capTop: box.y, capH: box.height };
  };
  return { name: measure(NAME, NAME_SIZE, 700), sub: measure(SUB, SUB_SIZE, 600),
           weightTest: { w400: measure(NAME, NAME_SIZE, 400).w, w700: measure(NAME, NAME_SIZE, 700).w } };
}, { fontCss, NAME, SUB, NAME_SIZE, SUB_SIZE });

const n = NAME.length - 1;                                     // gaps between letters
const nameVisible = m.name.w + NAME_LS * n;
const SUB_LS = Math.round(((nameVisible - m.sub.w) / n) * 100) / 100;
const variableFont = Math.abs(m.weightTest.w700 - m.weightTest.w400) > 0.5;

/* ------------------------------------------------------ the lockup, logo.svg */
const MARK = 40, GAP = 15, PAD = 0;
const textX = MARK + GAP;
const blockH = m.name.capH + 5 + m.sub.capH;                   // cap height + leading + cap height
const nameBase = (MARK - blockH) / 2 + m.name.capH;
const subBase = nameBase + 5 + m.sub.capH;
const W = Math.ceil(textX + nameVisible + PAD);
const fontFace = fontCss.match(/@font-face\s*\{[^}]*font-family:\s*'Montserrat'[^}]*U\+0000-00FF[^}]*\}/);
const face = fontFace ? fontFace[0].replace(/\s+/g, ' ') : '';
const wordmark = (nameFill, subFill) =>
  `<text x="${textX}" y="${Math.round(nameBase * 100) / 100}" font-family="Montserrat, Helvetica, Arial, sans-serif" font-weight="700" font-size="${NAME_SIZE}" letter-spacing="${NAME_LS}" fill="${nameFill}">${NAME}</text>` +
  `<text x="${textX}" y="${Math.round(subBase * 100) / 100}" font-family="Montserrat, Helvetica, Arial, sans-serif" font-weight="600" font-size="${SUB_SIZE}" letter-spacing="${SUB_LS}" fill="${subFill}">${SUB}</text>`;
const lockup = (id, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${MARK}" width="${W}" height="${MARK}" role="img" aria-label="Norvex Gaming">
  <style>${face}</style>
  ${inner}
</svg>
`;
writeFileSync(img('logo.svg'), lockup('nvl', sealBody('nvl') + wordmark('#f4f2ee', GOLD)));
writeFileSync(img('logo-on-light.svg'), lockup('nvll', sealBody('nvll') + wordmark(INK, GOLD_DEEP)));
writeFileSync(img('logo-mono.svg'), lockup('nvlm', sealMonoBody('currentColor') + wordmark('currentColor', 'currentColor')));
note('logo.svg', `${W}x${MARK} for dark backgrounds, font embedded`);
note('logo-on-light.svg', 'for white backgrounds and print');
note('logo-mono.svg', 'one colour, inherits currentColor');

/* ------------------------------------------------------------- share image */
await shoot('og-image.jpg', { w: 1200, h: 630 }, `<body style="width:1200px;height:630px;background:${INK};color:#f4f2ee;font-family:Montserrat,sans-serif;display:grid;place-items:center;position:relative;overflow:hidden">
  <div style="position:absolute;inset:-20%;background:radial-gradient(circle at 30% 40%, rgba(217,183,91,.22), transparent 45%), radial-gradient(circle at 75% 65%, rgba(42,117,187,.18), transparent 45%)"></div>
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(circle at center, #000 30%, transparent 75%)"></div>
  <div style="position:relative;text-align:center;display:grid;justify-items:center;gap:18px">
    <div style="display:flex;align-items:center;gap:24px">${sealSvg({ id: 'og', size: 96 })}
      <div><div style="font-weight:700;letter-spacing:.34em;font-size:44px">NORVEX</div>
      <div style="font-size:13px;letter-spacing:.42em;color:${GOLD};margin-top:7px">GAMING</div></div></div>
    <h1 style="font-family:Cormorant,serif;font-weight:500;font-size:74px;line-height:1.05;margin:10px 0 0;letter-spacing:-.01em">The vault for <em style="color:#e9cf7a">serious</em> collectors.</h1>
    <p style="font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:#a9a49a">Sealed TCG product · Pre-orders · Tracked, insured UK delivery</p>
  </div></body>`, 'jpeg');
note('og-image.jpg', '1200x630');

await browser.close();
console.log(`Norvex brand assets\n${out.join('\n')}\n`);
console.log(`  wordmark: NORVEX ${nameVisible.toFixed(2)}u wide, GAMING tracked to ${SUB_LS} to match`);
console.log(`  Montserrat is a ${variableFont ? 'variable font (real weights embedded)' : 'single weight — bold would be synthesised'}`);
