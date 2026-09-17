#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — gallery image fetcher
   --------------------------------------------------------------------------
   Opens a publisher's product-gallery page in a real (headless) browser,
   scrolls / clicks "load more" / follows "next" links until the page stops
   growing, sniffs any JSON the page loads for product records, then downloads
   every product image it can find and writes a manifest CSV next to them.

   Run this on your own machine (it needs normal internet access):

     npm install                          # once — installs Playwright + Chromium
     npm run fetch -- "https://www.pokemon.com/uk/pokemon-tcg/product-gallery"
     npm run fetch -- "https://magic.wizards.com/en/products" --out assets/img/gallery/magic

   Options:
     --out <dir>        where to save (default: assets/img/gallery/<hostname>)
     --selector <css>   only look at images inside this container (default: whole page)
     --min-size <px>    ignore images smaller than this on their longest side (default 180)
     --max-rounds <n>   max scroll / load-more rounds per page (default 80)
     --max-pages <n>    max "next" pages to follow (default 40)
     --paginate <css>   selector of the "next page" link/button (default: auto-detect rel=next / "Next")
     --headed           show the browser (handy for cookie walls and debugging)
     --debug            print page diagnostics (block pages, "more" controls, first card markup)

   Output:
     <out>/<image files>            named after the product title (slugified)
     <out>/manifest.csv             title, alt, context (page h1), file, image_url, page_url, width, height

   Then run `npm run match` to pair the files with catalogue products.
   Images belong to the publisher — you are an authorised retailer of their products;
   confirm the retailer terms with your distributor before launch.
   ========================================================================== */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug, csvCell } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('Usage: node scripts/fetch-gallery.mjs <gallery-url> [--out <dir>] [--selector <css>] [--min-size 180] [--max-rounds 80] [--max-pages 40] [--paginate <css>] [--crawl <path-prefix>] [--channel chrome] [--headed] [--debug]'); process.exit(1); }

const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'gallery'; } })();
const outDir = resolve(root, opt('--out', join('assets/img/gallery', host)));
const scope = opt('--selector', null);
const minSize = Number(opt('--min-size', 180));
const maxRounds = Number(opt('--max-rounds', 80));
const maxPages = Number(opt('--max-pages', 40));
const paginate = opt('--paginate', null);
const crawl = opt('--crawl', null); // e.g. "/en/products/" — also harvest same-host links under this path prefix
const channel = opt('--channel', null); // e.g. "chrome" — use the runner's installed Google Chrome (gets past some bot walls that block bundled Chromium)
const headed = args.includes('--headed');
const debug = args.includes('--debug');
mkdirSync(outDir, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Playwright is not installed. Run `npm install` in projects/norvex-gaming first.'); process.exit(1); }

const browser = await chromium.launch({ headless: !headed, ...(channel ? { channel } : {}) });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 }, locale: 'en-GB',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  extraHTTPHeaders: { 'Accept-Language': 'en-GB,en;q=0.9' }
});
const page = await ctx.newPage();
const found = new Map(); // image_url -> record
const clean = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
let pageCtx = '';

/* ---- JSON sniffing: product records inside API responses the page loads ---- */
const IMG_KEY = /(image|img|thumb|thumbnail|picture|photo|artwork|media|src)/i;
const NAME_KEY = /^(name|title|label|heading|productName|product_name|displayName|display_name)$/i;
function walkJson(node, base, depth = 0) {
  if (!node || depth > 8) return;
  if (Array.isArray(node)) { node.forEach((n) => walkJson(n, base, depth + 1)); return; }
  if (typeof node !== 'object') return;
  let name = ''; let img = '';
  for (const [k, v] of Object.entries(node)) {
    if (!name && NAME_KEY.test(k) && typeof v === 'string' && v.trim()) name = clean(v);
    if (!img && IMG_KEY.test(k)) {
      const cand = typeof v === 'string' ? v : v && typeof v === 'object' ? (v.url || v.src || v.large || v.medium || v.original || '') : '';
      if (typeof cand === 'string' && /\.(png|jpe?g|webp)(\?|$)/i.test(cand)) { try { img = new URL(cand, base).href; } catch { /* ignore */ } }
    }
  }
  if (name && img && !found.has(img)) found.set(img, { title: name, alt: '', context: 'api', image_url: img, page_url: base, width: 0, height: 0 });
  for (const v of Object.values(node)) if (v && typeof v === 'object') walkJson(v, base, depth + 1);
}
page.on('response', async (res) => {
  try {
    const ct = res.headers()['content-type'] || '';
    if (!/json/i.test(ct) || res.request().resourceType() === 'document') return;
    const text = await res.text();
    if (text.length > 6_000_000) return;
    walkJson(JSON.parse(text), res.url());
  } catch { /* not json / body gone */ }
});

async function dismissBanners() {
  for (const re of [/^(accept|allow|agree|got it|ok|okay|i agree|accept all|accept cookies|yes|continue|confirm)\b/i]) {
    const btn = page.getByRole('button', { name: re }).first();
    if (await btn.count() && await btn.isVisible().catch(() => false)) { await btn.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(500); }
  }
}

async function collect() {
  const recs = await page.evaluate(({ scope, minSize }) => {
    const rootEl = scope ? document.querySelector(scope) : document.body;
    if (!rootEl) return [];
    const h1 = document.querySelector('h1'); const ctx = ((h1 && h1.textContent) || document.title || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    const bad = /logo|icon|sprite|badge|flag|avatar|arrow|pixel|tracking|spacer|banner-bg|placeholder|loading|spinner/i;
    const out = [];
    for (const img of rootEl.querySelectorAll('img')) {
      let src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || img.currentSrc || img.src || '';
      try { src = new URL(src, location.href).href; } catch { /* keep as is */ }
      const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
      if (srcset) {
        const best = srcset.split(',').map((s) => s.trim().split(/\s+/)).map(([u, d]) => [u, parseFloat(d) || 0]).sort((a, b) => b[1] - a[1])[0];
        if (best && best[0]) { try { src = new URL(best[0], location.href).href; } catch { /* keep src */ } }
      }
      if (!src || src.startsWith('data:') || /\.svg(\?|$)/i.test(src) || bad.test(src) || bad.test(img.className)) continue;
      const w = img.naturalWidth || img.width || 0; const h = img.naturalHeight || img.height || 0;
      if (Math.max(w, h) && Math.max(w, h) < minSize) continue;
      let title = ''; let el = img;
      for (let i = 0; i < 6 && el && el !== rootEl; i++) {
        el = el.parentElement; if (!el) break;
        const hd = el.querySelector('h1, h2, h3, h4, h5, h6, [class*="title" i], [class*="name" i], [class*="heading" i], figcaption');
        if (hd && hd.textContent.trim()) { title = hd.textContent.trim().replace(/\s+/g, ' '); break; }
      }
      if (!title) title = (img.alt || img.title || '').trim();
      if (!title) continue;
      out.push({ title, alt: (img.alt || '').trim(), image_url: src, width: w, height: h, context: ctx });
    }
    return out;
  }, { scope, minSize });
  let added = 0;
  for (const r of recs) {
    r.title = clean(r.title); r.alt = clean(r.alt); r.context = clean(r.context);
    if (!found.has(r.image_url)) { found.set(r.image_url, { ...r, page_url: page.url() }); added++; }
  }
  pageCtx = recs[0] ? recs[0].context : pageCtx;
  return added;
}

const MORE = /^\s*(load|show|view|see|display)\s+(more|all)(\s+(products|results|items))?\s*$/i;
async function clickMore() {
  const candidates = page.getByText(MORE);
  const n = await candidates.count();
  for (let i = 0; i < Math.min(n, 5); i++) {
    const el = candidates.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    await el.scrollIntoViewIfNeeded().catch(() => {});
    const ok = await el.click({ timeout: 2500 }).then(() => true).catch(() => el.evaluate((e) => { e.click(); return true; }).catch(() => false));
    if (ok) { await page.waitForTimeout(1500); return true; }
  }
  return false;
}

async function growPage() {
  // gentle incremental scroll so IntersectionObserver-based lazy loaders and infinite lists fire
  for (let i = 0; i < 4; i++) { await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.8))); await page.waitForTimeout(250); }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  return clickMore();
}

async function findNext() {
  if (paginate) { const l = page.locator(paginate).first(); return (await l.count()) ? l : null; }
  const rel = page.locator('a[rel="next"], link[rel="next"]').first();
  if (await rel.count()) return rel;
  const byText = page.getByRole('link', { name: /^\s*(next|next page|›|»|>)\s*$/i }).first();
  if (await byText.count()) return byText;
  const byLabel = page.locator('a[aria-label*="next" i], button[aria-label*="next" i]').first();
  if (await byLabel.count()) return byLabel;
  return null;
}

async function debugDump(label) {
  if (!debug) return;
  const info = await page.evaluate(() => {
    const txt = (el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const more = [...document.querySelectorAll('button, a, div, span')].filter((e) => /more|next|page|show all|view all/i.test(txt(e)) && txt(e).length < 40).slice(0, 12).map((e) => `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 40)} "${txt(e)}"`);
    const imgs = [...document.querySelectorAll('img')];
    const first = imgs.find((i) => Math.max(i.naturalWidth, i.width) >= 120);
    let card = ''; if (first) { let el = first; for (let i = 0; i < 3 && el.parentElement; i++) el = el.parentElement; card = el.outerHTML.replace(/\s+/g, ' ').slice(0, 1500); }
    return { title: document.title, url: location.href, imgs: imgs.length, bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400), more, card };
  });
  console.log(`--- debug ${label}: ${JSON.stringify(info, null, 1)}`);
}

async function harvest(pageUrl, depth = 0) {
  console.log(`→ ${pageUrl}`);
  const resp = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => { console.log(`   ! navigation failed: ${e.message}`); return null; });
  if (resp) console.log(`   HTTP ${resp.status()} ${resp.url() !== pageUrl ? '→ ' + resp.url() : ''}`);
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(500);
  await dismissBanners();
  const title = await page.title().catch(() => '');
  if (/just a moment|attention required|access denied|verify you are human/i.test(title)) console.log(`   ! bot wall: "${title}"`);
  let stale = 0;
  for (let round = 0; round < maxRounds && stale < 3; round++) {
    const added = await collect();
    const clicked = await growPage();
    const atBottom = await page.evaluate(() => window.innerHeight + window.scrollY >= document.body.scrollHeight - 4);
    stale = added === 0 && !clicked && atBottom ? stale + 1 : 0;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await collect();
  console.log(`   ${found.size} unique images so far`);
  await debugDump(pageUrl);
  if (depth >= maxPages) return;
  const next = await findNext();
  if (!next || !(await next.isVisible().catch(() => false))) return;
  const href = await next.getAttribute('href').catch(() => null);
  if (href && !/^(#|javascript:)/i.test(href)) {
    const abs = new URL(href, page.url()).href;
    if (abs !== page.url()) return harvest(abs, depth + 1);
  } else {
    const before = page.url(); const beforeCount = found.size;
    await next.click({ timeout: 3000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(500);
    if (page.url() !== before || (await collect()) > 0 || found.size > beforeCount) return harvest(page.url(), depth + 1);
  }
}

await harvest(url);

/* ---- optional crawl: sub-pages under a path prefix (set pages, categories) ----
   Breadth-first: links under the prefix on the start page are visited first, then the links
   those pages expose (a category page leads to its product pages), up to --max-pages. */
if (crawl) {
  const origin = new URL(url).origin;
  const normLink = (h) => { try { const u = new URL(h); u.hash = ''; return u.href.replace(/\/$/, ''); } catch { return null; } };
  const okLink = (h) => h && h.startsWith(origin) && !/\.(pdf|zip|jpe?g|png|webp|gif|svg|mp4)(\?|$)/i.test(h);
  const linksOn = async () => [...new Set((await page.evaluate((prefix) => [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => { try { return new URL(h).pathname.startsWith(prefix); } catch { return false; } }), crawl)).map(normLink).filter(okLink))];
  const seen = new Set([normLink(page.url()), normLink(url)]);
  const queue = (await linksOn()).filter((h) => !seen.has(h));
  console.log(`   crawl: ${queue.length} link(s) under ${crawl} on the start page; visiting up to ${maxPages}`);
  let visited = 0;
  while (queue.length && visited < maxPages) {
    const link = queue.shift(); if (seen.has(link)) continue; seen.add(link); visited++;
    try {
      await harvest(link, maxPages);
      for (const h of await linksOn()) if (!seen.has(h) && !queue.includes(h)) queue.push(h);
    } catch (e) { console.log(`   ! ${link}: ${e.message}`); }
  }
  console.log(`   crawl: visited ${visited} sub-page(s)${queue.length ? `, ${queue.length} left (raise --max-pages to go further)` : ''}`);
}

// download
const rows = []; const used = new Set(); let ok = 0; let fail = 0;
for (const rec of found.values()) {
  const file = slug(rec.title).slice(0, 90) || 'image';
  let ext = '.jpg';
  try { ext = (extname(new URL(rec.image_url).pathname) || '.jpg').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg'; } catch { /* keep */ }
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
