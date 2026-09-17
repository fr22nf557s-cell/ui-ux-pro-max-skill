#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — gallery image fetcher
   --------------------------------------------------------------------------
   Opens a publisher's product-gallery page in a real (headless) browser,
   scrolls / clicks "load more" until the page stops growing, then downloads
   every product image it can find and writes a manifest CSV next to them.

   Run this on your own machine (it needs normal internet access):

     npm install                          # once — installs Playwright + Chromium
     npm run fetch -- "https://www.pokemon.com/uk/pokemon-tcg/product-gallery"
     npm run fetch -- "https://magic.wizards.com/en/products" --out assets/img/gallery/magic

   Options:
     --out <dir>        where to save (default: assets/img/gallery/<hostname>)
     --selector <css>   only look at images inside this container (default: whole page)
     --min-size <px>    ignore images smaller than this on their longest side (default 180)
     --max-rounds <n>   max scroll / load-more rounds (default 80)
     --headed           show the browser (handy for cookie walls and debugging)
     --paginate <css>   selector of a "next page" link/button to follow, if the gallery paginates

   Output:
     <out>/<image files>            named after the product title (slugified)
     <out>/manifest.csv             title, alt, context (page h1), file, image_url, page_url, width, height

   Then run `npm run match` to pair the files with catalogue products.
   Images belong to the publisher — you are an authorised retailer of their products;
   confirm the retailer terms with your distributor before launch.
   ========================================================================== */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug, csvCell } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('Usage: node scripts/fetch-gallery.mjs <gallery-url> [--out <dir>] [--selector <css>] [--min-size 180] [--max-rounds 80] [--paginate <css>] [--headed]'); process.exit(1); }

const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'gallery'; } })();
const outDir = resolve(root, opt('--out', join('assets/img/gallery', host)));
const scope = opt('--selector', null);
const minSize = Number(opt('--min-size', 180));
const maxRounds = Number(opt('--max-rounds', 80));
const paginate = opt('--paginate', null);
const headed = args.includes('--headed');
mkdirSync(outDir, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Playwright is not installed. Run `npm install` in projects/norvex-gaming first.'); process.exit(1); }

const browser = await chromium.launch({ headless: !headed });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', locale: 'en-GB' });
const page = await ctx.newPage();
const found = new Map(); // image_url -> record
let pageNo = 1;

async function dismissBanners() {
  for (const re of [/^(accept|allow|agree|got it|ok|i agree|accept all|accept cookies|yes)/i]) {
    const btn = page.getByRole('button', { name: re }).first();
    if (await btn.count() && await btn.isVisible().catch(() => false)) { await btn.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(500); }
  }
}

async function collect() {
  const recs = await page.evaluate(({ scope, minSize }) => {
    const rootEl = scope ? document.querySelector(scope) : document.body;
    if (!rootEl) return [];
    const h1 = document.querySelector('h1'); const ctx = ((h1 && h1.textContent) || document.title || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    const bad = /logo|icon|sprite|badge|flag|avatar|arrow|pixel|tracking|spacer|banner-bg|placeholder/i;
    const out = [];
    for (const img of rootEl.querySelectorAll('img')) {
      let src = img.currentSrc || img.src || img.getAttribute('data-src') || '';
      const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
      if (srcset) { // take the largest candidate
        const best = srcset.split(',').map((s) => s.trim().split(/\s+/)).map(([u, d]) => [u, parseFloat(d) || 0]).sort((a, b) => b[1] - a[1])[0];
        if (best && best[0]) src = new URL(best[0], location.href).href;
      }
      if (!src || src.startsWith('data:') || /\.svg(\?|$)/i.test(src) || bad.test(src) || bad.test(img.className)) continue;
      const w = img.naturalWidth || img.width || 0; const h = img.naturalHeight || img.height || 0;
      if (Math.max(w, h) && Math.max(w, h) < minSize) continue;
      // title: nearest card-ish ancestor's heading, else alt, else figcaption
      let title = ''; let el = img;
      for (let i = 0; i < 6 && el && el !== rootEl; i++) {
        el = el.parentElement; if (!el) break;
        const hd = el.querySelector('h1, h2, h3, h4, h5, [class*="title" i], [class*="name" i], figcaption');
        if (hd && hd.textContent.trim()) { title = hd.textContent.trim().replace(/\s+/g, ' '); break; }
      }
      if (!title) title = (img.alt || '').trim();
      if (!title) continue;
      out.push({ title, alt: (img.alt || '').trim(), image_url: src, width: w, height: h, context: ctx });
    }
    return out;
  }, { scope, minSize });
  let added = 0;
  for (const r of recs) if (!found.has(r.image_url)) { found.set(r.image_url, { ...r, page_url: page.url() }); added++; }
  return added;
}

async function growPage() {
  // scroll to the bottom, then try "load more" style buttons
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(700);
  const more = page.getByRole('button', { name: /load more|show more|view more|see more|more products|load additional/i }).first();
  if (await more.count() && await more.isVisible().catch(() => false)) { await more.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1200); return true; }
  const moreLink = page.getByRole('link', { name: /load more|show more|view more|see more/i }).first();
  if (await moreLink.count() && await moreLink.isVisible().catch(() => false)) { await moreLink.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(1200); return true; }
  return false;
}

async function harvest(pageUrl) {
  console.log(`→ ${pageUrl}`);
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await dismissBanners();
  let stale = 0;
  for (let round = 0; round < maxRounds && stale < 4; round++) {
    const added = await collect();
    const clicked = await growPage();
    const atBottom = await page.evaluate(() => window.innerHeight + window.scrollY >= document.body.scrollHeight - 4);
    stale = added === 0 && !clicked && atBottom ? stale + 1 : 0;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await collect();
  console.log(`   ${found.size} unique images so far`);
}

await harvest(url);
while (paginate && pageNo < 200) {
  const next = page.locator(paginate).first();
  if (!(await next.count()) || !(await next.isVisible().catch(() => false))) break;
  const href = await next.getAttribute('href');
  pageNo++;
  if (href) await harvest(new URL(href, page.url()).href);
  else { await next.click(); await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {}); await harvest(page.url()); }
}

// download
const rows = []; const used = new Set(); let ok = 0; let fail = 0;
for (const rec of found.values()) {
  let file = slug(rec.title).slice(0, 90) || 'image';
  const ext = (extname(new URL(rec.image_url).pathname) || '.jpg').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
  let name = file + ext; let n = 2;
  while (used.has(name)) name = `${file}-${n++}${ext}`;
  used.add(name);
  try {
    const res = await ctx.request.get(rec.image_url, { timeout: 30000, headers: { referer: rec.page_url } });
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    const buf = await res.body();
    if (buf.length < 1000) throw new Error('too small to be a packshot');
    writeFileSync(join(outDir, name), buf); ok++;
    rows.push({ ...rec, file: name });
  } catch (e) { fail++; rows.push({ ...rec, file: '', error: e.message }); }
}
const cols = ['title', 'alt', 'context', 'file', 'image_url', 'page_url', 'width', 'height', 'error'];
writeFileSync(join(outDir, 'manifest.csv'), cols.join(',') + '\n' + rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')).join('\n') + '\n');
await browser.close();
console.log(`✔ ${ok} images saved to ${outDir}${fail ? ` (${fail} failed — see manifest.csv)` : ''}`);
console.log('Next: node scripts/match-images.mjs   (dry run)  →  node scripts/match-images.mjs --apply');
