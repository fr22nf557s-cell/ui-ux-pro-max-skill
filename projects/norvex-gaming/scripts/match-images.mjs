#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — match downloaded gallery images to catalogue products
   --------------------------------------------------------------------------
   Reads every manifest.csv under the gallery folder, scores each image title
   against each product name, and (with --apply) copies the best match to
   assets/img/products/<product id>.<ext> and sets `image` on the product.

     node scripts/match-images.mjs                 # dry run: prints the pairing report
     node scripts/match-images.mjs --apply         # copy files + update catalog.js
     node scripts/match-images.mjs --min-score 0.7 # be stricter (default 0.6)
     node scripts/match-images.mjs --game pokemon  # only products of one game

   Writes assets/img/gallery/match-report.csv either way so you can eyeball
   the pairings and fix the odd one by hand (rename the file to <id>.<ext> and
   re-run `node scripts/import-catalog.mjs` or set `image` in catalog.js).
   ========================================================================== */
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, writeCatalog, parseCSV, csvCell } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const galleryDir = resolve(root, opt('--gallery', 'assets/img/gallery'));
const catalogPath = resolve(root, opt('--catalog', 'assets/js/catalog.js'));
const outDir = resolve(root, opt('--out', 'assets/img/products'));
const minScore = Number(opt('--min-score', 0.6));
const onlyGame = opt('--game', null);
const apply = args.includes('--apply');

/* ---- gather manifests ------------------------------------------------- */
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('manifest.csv') ? [p] : []; });
}
const manifests = walk(galleryDir);
if (!manifests.length) { console.error(`No manifest.csv found under ${galleryDir}. Run scripts/fetch-gallery.mjs first.`); process.exit(1); }
const images = manifests.flatMap((m) => parseCSV(readFileSync(m, 'utf8')).filter((r) => r.file).map((r) => ({ ...r, path: join(dirname(m), r.file) })));
console.log(`${images.length} images from ${manifests.length} manifest(s)`);

/* ---- normalisation + scoring ----------------------------------------- */
const SYN = [
  [/\betbs?\b/g, 'elite trainer box'], [/\bbooster display\b/g, 'booster box'], [/\bdisplay box\b/g, 'booster box'],
  [/\bcollector'?s? booster box\b/g, 'collector booster box'],
  [/\bpokemon tcg\b|\bpokemon trading card game\b/g, ''], [/\bscarlet\s*&\s*violet\b|\bsv\b/g, ''], [/\bmagic:? the gathering\b|\bmtg\b/g, ''],
  [/\bone piece card game\b/g, ''], [/\bdisney lorcana\b|\blorcana\b/g, ''], [/\byu-?gi-?oh!?\b/g, ''], [/\btrading card game\b|\btcg\b/g, ''],
  [/\bpre-?order\b|\bcoming soon\b/g, ''], [/\(\d+ packs?\)|\b\d+ packs?\b/g, ''], [/\b(en|english)\b/g, '']
];
function norm(s) {
  s = String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, "'").replace(/[—–]/g, '-').replace(/[^a-z0-9&:'\-\s]/g, ' ');
  for (const [re, rep] of SYN) s = s.replace(re, rep);
  return s.replace(/\s+/g, ' ').trim();
}
/* Product format, most specific first. Two items only match when their formats agree. */
const FORMATS = [
  ['etb', /\belite trainer box\b/], ['collector box', /\bcollector booster (box|display)\b/], ['play box', /\bplay booster (box|display)\b/],
  ['jumpstart box', /\bjumpstart booster box\b/], ['box', /\bbooster (box|display)\b|\bdisplay box\b/], ['bundle', /\bbooster bundle\b/],
  ['pack', /\bbooster pack\b|\bplay booster\b(?! box)|\bbooster$/], ['commander', /\bcommander deck\b/],
  ['starter', /\bstarter deck\b|\bstarter kit\b|\btwo-player starter\b|\bstarter collection\b/], ['structure', /\bstructure deck\b/],
  ['battle deck', /\bbattle deck\b/], ['upc', /\bultra[- ]premium collection\b/], ['spc', /\bsuper[- ]premium collection\b/],
  ['premium collection', /\bpremium collection\b/], ['trove', /\btrove\b/], ['tin', /\btin\b/], ['gift set', /\bgift set\b/],
  ['poster', /\bposter collection\b/], ['bundle', /\bbundle\b/], ['collection', /\bcollection\b/], ['deck', /\bdeck\b/]
];
const format = (s) => { const n = norm(s); const hit = FORMATS.find(([, re]) => re.test(n)); return hit ? hit[0] : null; };
/* Words that describe the format, not the set — ignored when comparing names. */
const GENERIC = new Set(['booster', 'boosters', 'box', 'display', 'pack', 'packs', 'deck', 'collection', 'bundle', 'edition', 'elite', 'trainer', 'premium', 'ultra', 'super', 'commander', 'starter', 'structure', 'kit', 'set', 'tin', 'trove', 'illumineer', "illumineer's", 'illumineers', 'gift', 'poster', 'battle', 'play', 'collector', 'jumpstart', 'two', 'player', 'the', 'of', 'and', 'a', 'an', 'in', 'x', 'card', 'cards', 'game', 'tcg', 'en']);
const setTokens = (s) => new Set(norm(s).split(/[\s\-:]+/).filter((t) => t && !GENERIC.has(t)));
function score(productName, title) {
  const fa = format(productName); const fb = format(title);
  if (fa && fb && fa !== fb) return 0;                // a bundle never gets a box photo
  const a = setTokens(productName); const b = setTokens(title);
  if (!a.size || !b.size) return 0;
  let inter = 0; for (const t of a) if (b.has(t)) inter++;
  let s = (2 * inter) / (a.size + b.size);           // Dice overlap of the set-name words only
  if (fa && fb) s = Math.min(1, s + 0.05); else s -= 0.1; // one side has no recognisable format: be cautious
  return Math.max(0, s);
}

/* ---- match ------------------------------------------------------------- */
const { data, header } = loadCatalog(catalogPath);
const products = data.products.filter((p) => !onlyGame || p.game === onlyGame);
const report = []; let matched = 0; let updated = 0;
mkdirSync(outDir, { recursive: true });
for (const p of products) {
  let best = null;
  for (const img of images) {
    const ctx = img.context ? img.context + ' ' : '';
    const sc = Math.max(score(p.name, img.title), img.alt ? score(p.name, img.alt) : 0, ctx ? score(p.name, ctx + img.title) : 0);
    if (!best || sc > best.sc) best = { img, sc };
  }
  const ok = best && best.sc >= minScore;
  report.push({ id: p.id, product: p.name, matched_title: best ? best.img.title : '', score: best ? best.sc.toFixed(2) : '', file: ok ? best.img.file : '', status: ok ? 'matched' : 'no match' });
  if (!ok) continue;
  matched++;
  if (apply) {
    const ext = extname(best.img.file).toLowerCase() || '.jpg';
    const dest = join(outDir, `${p.id}${ext}`);
    copyFileSync(best.img.path, dest);
    const rel = relative(root, dest).replace(/\\/g, '/');
    if (p.image !== rel) { p.image = rel; updated++; }
  }
}
const cols = ['id', 'product', 'matched_title', 'score', 'file', 'status'];
mkdirSync(galleryDir, { recursive: true });
writeFileSync(join(galleryDir, 'match-report.csv'), cols.join(',') + '\n' + report.map((r) => cols.map((c) => csvCell(r[c])).join(',')).join('\n') + '\n');
console.log(`${matched}/${products.length} products matched at score ≥ ${minScore} → ${relative(root, join(galleryDir, 'match-report.csv'))}`);
const misses = report.filter((r) => r.status === 'no match');
for (const r of misses.slice(0, 15)) console.log(`   · no match: ${r.product}${r.matched_title ? `  (closest: "${r.matched_title}" ${r.score})` : ''}`);
if (misses.length > 15) console.log('   · …see match-report.csv for the rest');
if (apply) { writeCatalog(catalogPath, data, header); console.log(`✔ copied ${matched} images to ${relative(root, outDir)} and set image on ${updated} products in ${relative(root, catalogPath)}`); }
else console.log('Dry run — add --apply to copy files and update catalog.js');
