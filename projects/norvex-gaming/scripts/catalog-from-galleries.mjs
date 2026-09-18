#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — build catalogue products from fetched publisher galleries
   --------------------------------------------------------------------------
   The publishers' galleries list exactly what is on sale right now, with the
   official packshot. This turns every gallery manifest (from fetch-gallery.mjs)
   into catalogue products: name, set, game, format, an estimated UK price by
   format, and the image — and merges them into assets/js/catalog.js.

     node scripts/catalog-from-galleries.mjs            # dry run: prints what would be added
     node scripts/catalog-from-galleries.mjs --apply    # copy images + write catalog.js

   Options:
     --gallery <dir>       where manifests live (default assets/img/gallery)
     --replace             drop existing sealed products (etb/box/bundle/pack/deck/collection)
                           that have no photo for games the galleries covered (default: keep them)
     --min-per-game <n>    only replace a game's old products if the galleries yielded ≥ n (default 4)

   Prices are ESTIMATED UK RRP by format — review them before launch.
   ========================================================================== */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, writeCatalog, parseCSV, slug } from './catalog-io.mjs';
import { JUNK, MIN_IMAGE_BYTES, cleanName, setName, dedupeKey, detectFormat, describe, productCode, looksLikeProduct, priceFor, boxSibling } from './catalog-rules.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const galleryDir = resolve(root, opt('--gallery', 'assets/img/gallery'));
const catalogPath = resolve(root, 'assets/js/catalog.js');
const outDir = resolve(root, 'assets/img/products');
const apply = args.includes('--apply');
const replace = args.includes('--replace');
const minPerGame = Number(opt('--min-per-game', 4));

/* ---- which publisher is which game -------------------------------------- */
const HOST_GAME = [
  [/pokemon\.com/, 'pokemon'], [/wizards\.com/, 'magic'], [/onepiece-cardgame\.com/, 'onepiece'], [/yugioh-card\.com/, 'yugioh'],
  [/disneylorcana\.com/, 'lorcana'], [/starwarsunlimited\.com/, 'swu'], [/fabtcg\.com/, 'fab'], [/digimoncard\.com/, 'digimon'], [/dbs-cardgame\.com/, 'dragonball'], [/riftbound|leagueoflegends/, 'riftbound']
];
const gameOfHost = (h) => (HOST_GAME.find(([re]) => re.test(h)) || [null, null])[1];

/* Format detection, naming and junk rules live in catalog-rules.mjs (shared with tidy-catalog.mjs). */

/* Prices and booster-box siblings: catalog-rules.mjs (shared with tidy-catalog.mjs). */


/* ---- format from context when the title has none ---------------------------
   Konami titles are just the set name ("Glorious Victors"); the category page,
   URL or packshot filename says what it is (Foil-Stack = booster packs,
   Tuckbox = structure deck, TIN = tin). */
const CTX_FORMAT = [
  [/booster ?packs?|foil-?stack|\bbooster\b/i, 'Booster Pack'], [/structure ?decks?|tuck-?box|tuck-/i, 'Structure Deck'], [/starter ?decks?/i, 'Starter Deck'],
  [/\btins?\b/i, 'Tin'], [/speed duel/i, 'Speed Duel Box'], [/collection|box set|special edition/i, 'Collection'], [/\bdecks?\b/i, 'Deck']
];
function inferFormat(r) {
  for (const hint of [r.context || '', decodeURIComponent(r.page_url || ''), r.image_url || '']) for (const [re, label] of CTX_FORMAT) if (re.test(hint)) return label;
  return null;
}
/* ---- set from context: a product page titled "Hyperia City" lists "Illumineer's Trove" ---- */
const CTX_SKIP = /product|gallery|release|news|home|shop|latest|card game|tcg|^all\b|categor|^search|error|sign in|account/i;
function withContext(name, r, game) {
  const ctx = cleanName(r.context || '', game);
  if (!ctx || ctx.length > 40 || JUNK.test(ctx) || CTX_SKIP.test(ctx) || productCode(name)) return name;
  const c = ctx.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); const n = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  return !c || n.includes(c) ? name : `${ctx} ${name}`;
}
const SEALED = new Set(['etb', 'box', 'bundle', 'pack', 'deck', 'collection', 'accessory']);

/* ---- read manifests ------------------------------------------------------- */
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('manifest.csv') ? [p] : []; });
}
const manifests = walk(galleryDir);
if (!manifests.length) { console.error(`No manifest.csv under ${galleryDir}`); process.exit(1); }
const rows = manifests.flatMap((m) => {
  const host = (() => { try { return new URL(parseCSV(readFileSync(m, 'utf8'))[0]?.page_url || 'https://x/').hostname; } catch { return ''; } })();
  return parseCSV(readFileSync(m, 'utf8')).filter((r) => r.file).map((r) => ({ ...r, path: join(dirname(m), r.file), host: (() => { try { return new URL(r.page_url).hostname; } catch { return host; } })() }));
});

const { data, header } = loadCatalog(catalogPath);
const existingIds = new Set(data.products.map((p) => p.id));
const existingByKey = new Map(data.products.filter((p) => SEALED.has(p.type)).map((p) => [dedupeKey(p.game, p.name), p]));
const existingById = new Map(data.products.map((p) => [p.id, p]));
const added = []; const seenNames = new Set(); const perGame = {}; const attach = new Map(); // existing product without a photo -> gallery file
for (const r of rows) {
  const game = gameOfHost(r.host); if (!game || !data.games[game]) continue;
  const raw = r.title; if (!raw || JUNK.test(raw) || raw.length < 4 || raw.length > 110) continue;
  let bare = cleanName(raw, game); if (!bare || JUNK.test(bare) || !looksLikeProduct(bare, game)) continue;
  let hit = detectFormat(bare);
  if (!hit) { const label = inferFormat(r); if (!label) continue; bare = `${bare} ${label}`; hit = detectFormat(bare); if (!hit) continue; } // key art / logos / articles have no format anywhere
  const [fmt, type, re] = hit;
  if (!existsSync(r.path) || statSync(r.path).size < MIN_IMAGE_BYTES) continue; // logos / gradients / "coming soon" placeholders
  const name = withContext(bare, r, game);
  const key = dedupeKey(game, name); const bareKey = dedupeKey(game, bare);
  if (seenNames.has(key) || seenNames.has(bareKey)) continue; seenNames.add(key); seenNames.add(bareKey);
  const id = slug(`${game}-${name}`); if (!id) continue;
  const existing = existingByKey.get(key) || existingByKey.get(bareKey) || existingById.get(id) || existingById.get(slug(`${game}-${bare}`));
  if (existing) { if (!existing.image && !attach.has(existing)) attach.set(existing, r.path); continue; } // already listed: give it the photo if it lacks one
  const set = setName(name, game, re);
  const singular = data.types[type]?.singular || 'Product';
  const desc = describe(type, set, name);
  added.push({
    id, name, set, game, type, brand: undefined, price: priceFor(game, fmt, type), compareAt: null, stock: 12, preorder: false, badge: null,
    featured: false, rating: 4.8, reviews: 18, description: desc,
    contents: type === 'pack' ? [`1 ${set} booster pack`] : ['Factory-sealed product', 'Contents as listed by the publisher'],
    specs: { Language: 'English', Format: singular, Condition: 'Factory sealed' }, image: null, _src: r.path
  });
  perGame[game] = (perGame[game] || 0) + 1;
}
// booster displays for games that sell them as plain 24-pack boxes
for (const p of [...added]) {
  const box = boxSibling(p, data.types); if (!box) continue;
  const key = dedupeKey(p.game, box.name); if (seenNames.has(key) || existingByKey.has(key) || existingIds.has(box.id)) continue; seenNames.add(key);
  added.push(box); perGame[p.game] = (perGame[p.game] || 0) + 1;
}
// feature the first few of each game so the home page shows the new lines
const featuredCount = {};
for (const p of added) { featuredCount[p.game] = (featuredCount[p.game] || 0) + 1; if (featuredCount[p.game] <= 3 && (p.type === 'etb' || p.type === 'box' || p.type === 'collection')) p.featured = true; }

console.log(`${rows.length} gallery images → ${added.length} new products: ${Object.entries(perGame).map(([g, n]) => `${g} ${n}`).join(', ') || 'none'}${attach.size ? `; ${attach.size} existing product(s) get a photo` : ''}`);
for (const [p] of attach) console.log(`   ⊕ photo for existing: ${p.name}`);
for (const p of added.slice(0, 60)) console.log(`   + [${p.game}/${p.type}] ${p.name}  £${p.price}`);
if (added.length > 60) console.log(`   … and ${added.length - 60} more`);

let removed = 0;
if (replace) {
  const covered = new Set(Object.entries(perGame).filter(([, n]) => n >= minPerGame).map(([g]) => g));
  const sealed = new Set(['etb', 'box', 'bundle', 'pack', 'deck', 'collection']);
  const before = data.products.length;
  data.products = data.products.filter((p) => p.manual || !(covered.has(p.game) && sealed.has(p.type) && !p.image && !attach.has(p)));
  removed = before - data.products.length;
  console.log(`replace: dropped ${removed} older ${[...covered].join('/')} products that have no photo`);
}

if (!apply) { console.log('Dry run — add --apply to copy images and update catalog.js'); process.exit(0); }
mkdirSync(outDir, { recursive: true });
for (const [p, src] of attach) {
  const dest = join(outDir, `${p.id}${(extname(src) || '.jpg').toLowerCase()}`);
  copyFileSync(src, dest); p.image = relative(root, dest).replace(/\\/g, '/');
}
for (const p of added) {
  const ext = (extname(p._src) || '.jpg').toLowerCase();
  const dest = join(outDir, `${p.id}${ext}`);
  copyFileSync(p._src, dest);
  p.image = relative(root, dest).replace(/\\/g, '/');
  delete p._src; if (p.brand === undefined) delete p.brand;
  data.products.push(p);
}
writeCatalog(catalogPath, data, header);
console.log(`✔ added ${added.length} products with images, gave ${attach.size} existing products a photo (${removed} removed) → ${relative(root, catalogPath)}`);
