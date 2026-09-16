#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — catalog importer
   --------------------------------------------------------------------------
   Turns a CSV (distributor feed, Shopify/WooCommerce export, or a spreadsheet
   you compiled) into assets/js/catalog.js, keeping the store config, game
   palettes and product types already defined there.

   Usage:
     node scripts/import-catalog.mjs <products.csv> [--images <dir>] [--out assets/js/catalog.js] [--base assets/js/catalog.js] [--dry-run]

   --base is the existing catalog whose config / games / types are kept (default: the live one).

   CSV columns (header row required; order doesn't matter; extra columns are ignored):
     name*        full product title
     game*        one of the keys in `games` (pokemon, magic, onepiece, yugioh, lorcana, swu, riftbound, digimon, dragonball, norvex)
     type*        one of the keys in `types` (etb, bundle, box, collection, single, accessory)
     price*       number
     set          set / expansion name (defaults to the part of the name before the product type)
     id           slug; generated from game + name when empty
     compareAt    optional "was" price
     stock        integer, default 0
     preorder     true/false/yes/no/1/0
     badge        new | hot | (empty)
     featured     true/false
     rating       0-5, reviews integer
     description  your own copy (never paste another retailer's text)
     contents     items separated by " | "
     specs        key=value pairs separated by " | "   e.g. Language=English | Packs=9
     brand        optional manufacturer shown instead of the game (Dragon Shield, Ultra Pro…)
     image        file name, path or URL; with --images <dir> a bare file name is resolved there.
                  Left empty, the importer looks for <dir>/<id>.webp|.jpg|.jpeg|.png automatically
     grader, grade, gradeLabel, cert, artLabel   graded singles only

   Images: put product photos in assets/img/products/ (4:5 ratio, ~800x1000, WebP or JPG)
   and reference them by file name in the `image` column.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const outPath = resolve(root, opt('--out', 'assets/js/catalog.js'));
const basePath = resolve(root, opt('--base', 'assets/js/catalog.js'));
const imagesDir = opt('--images', null);
const dryRun = args.includes('--dry-run');

if (!csvPath) { console.error('Usage: node scripts/import-catalog.mjs <products.csv> [--images <dir>] [--out <file>] [--base <file>] [--dry-run]'); process.exit(1); }
if (!existsSync(basePath)) { console.error(`Base catalog not found: ${basePath}`); process.exit(1); }

/* ---- load the existing catalog to keep config / games / types ---------- */
const existingSrc = readFileSync(basePath, 'utf8');
const sandbox = { window: {} };
new Function('window', existingSrc)(sandbox.window);
const existing = sandbox.window.NORVEX_DATA;
if (!existing) { console.error(`Could not read window.NORVEX_DATA from ${basePath}`); process.exit(1); }
const { config, games, types } = existing;

/* ---- tiny CSV parser (handles quotes, commas, newlines in quotes) ------- */
function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.some((v) => v.trim() !== '')).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const bool = (v) => /^(true|yes|y|1)$/i.test(String(v || ''));
const num = (v) => { const n = Number(String(v || '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : null; };
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TYPE_WORDS = /\s*(elite trainer box|booster bundle|booster box|booster display|collector booster box|play booster box|set booster box|draft booster box|bundle|illumineer'?s trove|ultra-premium collection|premium collection|collection|tin|starter deck|structure deck)\b.*$/i;

const rows = parseCSV(readFileSync(resolve(csvPath), 'utf8'));
const products = []; const errors = []; const seen = new Set();
rows.forEach((r, i) => {
  const line = i + 2;
  const name = r.name; const game = (r.game || '').toLowerCase(); const type = (r.type || '').toLowerCase(); const price = num(r.price);
  if (!name) return errors.push(`line ${line}: missing name`);
  if (!games[game]) return errors.push(`line ${line}: unknown game "${r.game}" (allowed: ${Object.keys(games).join(', ')})`);
  if (!types[type]) return errors.push(`line ${line}: unknown type "${r.type}" (allowed: ${Object.keys(types).join(', ')})`);
  if (price === null) return errors.push(`line ${line}: bad price "${r.price}"`);
  let id = r.id || slug(`${game}-${name}`);
  if (seen.has(id)) { let n = 2; while (seen.has(`${id}-${n}`)) n++; id = `${id}-${n}`; }
  seen.add(id);
  let image = r.image || null;
  if (!image && imagesDir) {
    const hit = ['webp', 'jpg', 'jpeg', 'png'].map((ext) => join(imagesDir, `${id}.${ext}`)).find((f) => existsSync(resolve(root, f)));
    if (hit) image = hit.replace(/\\/g, '/');
  }
  if (image) {
    if (imagesDir && !image.includes('/')) image = join(imagesDir, image).replace(/\\/g, '/');
    if (!image.startsWith('http') && !existsSync(resolve(root, image))) errors.push(`line ${line}: image not found: ${image}`);
  }
  const p = {
    id, name,
    set: r.set || name.replace(TYPE_WORDS, '').trim() || name,
    game, type, price,
    compareAt: num(r.compareAt),
    stock: Math.max(0, Math.round(num(r.stock) ?? 0)),
    preorder: bool(r.preorder),
    badge: /^(new|hot)$/i.test(r.badge || '') ? r.badge.toLowerCase() : null,
    featured: bool(r.featured),
    rating: num(r.rating) ?? 0,
    reviews: Math.round(num(r.reviews) ?? 0),
    description: r.description || `${name}. Factory-sealed and verified before it enters the vault.`,
    contents: (r.contents || '').split('|').map((s) => s.trim()).filter(Boolean),
    specs: Object.fromEntries((r.specs || '').split('|').map((s) => s.split('=').map((x) => x.trim())).filter(([k, v]) => k && v)),
    image
  };
  if (r.brand) p.brand = r.brand;
  if (type === 'single') {
    p.artLabel = r.artLabel || p.set;
    p.grade = { grader: r.grader || 'PSA', grade: num(r.grade) ?? 10, label: r.gradeLabel || 'Gem Mint', cert: r.cert || '' };
  }
  products.push(p);
});

if (errors.length) { console.error(`✖ ${errors.length} problem(s):\n  ` + errors.join('\n  ')); process.exit(1); }

/* ---- write catalog.js (config/games/types preserved) ------------------- */
const assignAt = existingSrc.search(/^window\.NORVEX_DATA\s*=/m);
const header = assignAt >= 0 ? existingSrc.slice(0, assignAt) : '';
const js = `${header}window.NORVEX_DATA = {
  config: ${JSON.stringify(config, null, 4).replace(/\n/g, '\n  ')},

  games: ${JSON.stringify(games, null, 4).replace(/\n/g, '\n  ')},

  types: ${JSON.stringify(types, null, 4).replace(/\n/g, '\n  ')},

  /* generated by scripts/import-catalog.mjs from ${basename(csvPath)} on ${new Date().toISOString().slice(0, 10)} */
  products: ${JSON.stringify(products, null, 4).replace(/\n/g, '\n  ')}
};
`;
const withImages = products.filter((p) => p.image).length;
console.log(`✔ ${products.length} products (${withImages} with photos, ${products.length - withImages} using CSS packaging art)`);
if (dryRun) { console.log(`dry run: not writing ${outPath}`); } else { writeFileSync(outPath, js); console.log(`→ wrote ${outPath}`); }
