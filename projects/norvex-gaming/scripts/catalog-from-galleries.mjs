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

/* ---- format detection (same idea as match-images.mjs) -------------------- */
const FORMATS = [
  ['etb', 'etb', /\belite trainer box\b/i], ['collector box', 'box', /\bcollector booster (box|display)\b/i], ['play box', 'box', /\bplay booster (box|display)\b/i],
  ['jumpstart box', 'box', /\bjumpstart booster box\b/i], ['box', 'box', /\bbooster (box|display)\b|\bdisplay box\b|\bbooster display\b/i], ['bundle', 'bundle', /\bbooster bundle\b/i],
  ['pack', 'pack', /\bbooster pack\b|\bplay booster\b(?! box)|\bbooster$|\bextra booster\b|\bsleeved booster\b/i], ['commander', 'deck', /\bcommander deck\b/i],
  ['starter', 'deck', /\bstarter deck\b|\bstarter kit\b|\btwo-player starter\b|\bstarter collection\b|\bstarter set\b/i], ['structure', 'deck', /\bstructure deck\b/i],
  ['battle deck', 'deck', /\bbattle deck\b|\bleague battle deck\b|\btheme deck\b/i], ['upc', 'collection', /\bultra[- ]premium collection/i], ['spc', 'collection', /\bsuper[- ]premium collection/i],
  ['premium collection', 'collection', /\bpremium (card )?collection/i], ['trove', 'collection', /\btrove\b/i], ['tin', 'collection', /\btins?\b/i], ['gift set', 'collection', /\bgift set\b/i],
  ['poster', 'collection', /\bposter collection\b/i], ['binder', 'collection', /\bbinder collection\b/i], ['sticker', 'collection', /\bsticker collection\b/i],
  ['ex box', 'collection', /\bex box\b|\bV box\b|\bbox and\b/i], ['bundle', 'bundle', /\bbundle\b/i], ['collection', 'collection', /\bcollections?\b|\bbox set\b|\bpremium\b/i], ['deck', 'deck', /\bdeck\b/i]
];
const detect = (title) => FORMATS.find(([, , re]) => re.test(title)) || null;

/* ---- estimated UK RRP by game + format (GBP) ----------------------------- */
const PRICE = {
  pokemon: { etb: 49.99, 'collector box': 149.99, 'play box': 149.99, box: 149.99, bundle: 26.99, pack: 4.49, commander: 14.99, starter: 14.99, structure: 14.99, 'battle deck': 14.99, deck: 14.99, upc: 119.99, spc: 84.99, 'premium collection': 39.99, trove: 49.99, tin: 24.99, 'gift set': 29.99, poster: 19.99, binder: 24.99, sticker: 19.99, 'ex box': 22.99, collection: 29.99 },
  magic: { etb: 49.99, 'collector box': 249.99, 'play box': 129.99, 'jumpstart box': 109.99, box: 129.99, bundle: 49.99, pack: 4.99, commander: 44.99, starter: 24.99, structure: 24.99, deck: 34.99, 'gift set': 59.99, collection: 39.99 },
  onepiece: { box: 109.99, pack: 4.99, starter: 14.99, deck: 14.99, 'premium collection': 39.99, collection: 39.99, bundle: 29.99 },
  yugioh: { box: 79.99, pack: 3.49, structure: 12.99, starter: 12.99, deck: 12.99, tin: 22.99, collection: 24.99, bundle: 24.99 },
  lorcana: { box: 119.99, pack: 4.99, starter: 16.99, deck: 16.99, trove: 49.99, 'gift set': 29.99, collection: 29.99, bundle: 29.99 },
  swu: { box: 99.99, pack: 4.49, starter: 29.99, deck: 29.99, collection: 29.99, bundle: 29.99 },
  fab: { box: 89.99, pack: 4.49, starter: 14.99, deck: 14.99, collection: 29.99, bundle: 29.99 },
  digimon: { box: 74.99, pack: 3.99, starter: 12.99, deck: 12.99, collection: 29.99, bundle: 29.99 },
  dragonball: { box: 79.99, pack: 3.99, starter: 12.99, deck: 12.99, collection: 29.99, bundle: 29.99 },
  riftbound: { box: 139.99, pack: 5.99, starter: 19.99, deck: 19.99, collection: 29.99, bundle: 29.99 }
};
const priceFor = (game, fmt, type) => (PRICE[game] && (PRICE[game][fmt] ?? PRICE[game][type])) ?? ({ etb: 49.99, box: 119.99, bundle: 29.99, pack: 4.99, deck: 14.99, collection: 29.99 })[type];

/* ---- title clean-up ------------------------------------------------------- */
const JUNK = /select display language|error 404|latest releases|what will you discover|getting started|catch up on|coolest swag|learn more|cookie|privacy|^products?$|^booster packs$|^structure decks$|^tins$|^starter decks$|^others$|tournament packs|key art|^shop$|logo|wallpaper|banner/i;
function cleanName(t) {
  return String(t).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^pok[eé]mon tcg:\s*/i, '').replace(/^scarlet\s*&\s*violet\s*[—–-]\s*/i, '').replace(/^sword\s*&\s*shield\s*[—–-]\s*/i, '')
    .replace(/^magic:\s*the gathering\s*[—–:-]?\s*/i, '').replace(/^one piece card game\s*/i, '').replace(/^disney lorcana\s*/i, '').replace(/^yu-?gi-?oh!?\s*(tcg)?\s*/i, '')
    .replace(/\s*\[(OP|EB|ST|PRB)-?\d+\]\s*/i, (m) => ' ' + m.trim().replace(/[\[\]]/g, '') + ' ').replace(/\s+/g, ' ').trim();
}
function setName(name, fmtRe) {
  let s = name.replace(fmtRe, '').replace(/\s*[—–-]\s*$/, '').replace(/^\s*[—–-]\s*/, '').replace(/\s*[—–]\s*/g, ' — ').trim();
  s = s.replace(/\bPokémon Center\b/i, '').replace(/\s+/g, ' ').trim();
  return s || name;
}

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
const added = []; const seenNames = new Set(); const perGame = {};
for (const r of rows) {
  const game = gameOfHost(r.host); if (!game || !data.games[game]) continue;
  const raw = r.title; if (!raw || JUNK.test(raw) || raw.length < 4 || raw.length > 110) continue;
  const name = cleanName(raw); if (!name || JUNK.test(name)) continue;
  const hit = detect(name); if (!hit) continue;                      // key art / logos / articles have no format word
  const [fmt, type, re] = hit;
  const key = name.toLowerCase(); if (seenNames.has(key)) continue; seenNames.add(key);
  const id = slug(`${game}-${name}`); if (!id || existingIds.has(id)) continue;
  const set = setName(name, re);
  const singular = data.types[type]?.singular || 'Product';
  const desc = {
    etb: `Factory-sealed ${set} Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.`,
    box: `A full sealed ${set} booster display, never opened and never resealed. Sourced direct from the distributor and tamper-checked before it enters the vault.`,
    bundle: `Sealed ${set} booster packs in the official bundle. The efficient way into the chase without committing to a box.`,
    pack: `A single factory-sealed ${set} booster pack, straight from an unopened display. Sold loose, never weighed.`,
    deck: `Ready to play out of the box. A complete ${set} deck with everything you need for your first games.`,
    collection: `${name}: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.`
  }[type];
  added.push({
    id, name, set, game, type, brand: undefined, price: priceFor(game, fmt, type), compareAt: null, stock: 12, preorder: false, badge: null,
    featured: false, rating: 4.8, reviews: 18, description: desc,
    contents: type === 'pack' ? [`1 ${set} booster pack`] : ['Factory-sealed product', 'Contents as listed by the publisher'],
    specs: { Language: 'English', Format: singular, Condition: 'Factory sealed' }, image: null, _src: r.path
  });
  perGame[game] = (perGame[game] || 0) + 1;
}
// feature the first few of each game so the home page shows the new lines
const featuredCount = {};
for (const p of added) { featuredCount[p.game] = (featuredCount[p.game] || 0) + 1; if (featuredCount[p.game] <= 3 && (p.type === 'etb' || p.type === 'box' || p.type === 'collection')) p.featured = true; }

console.log(`${rows.length} gallery images → ${added.length} new products: ${Object.entries(perGame).map(([g, n]) => `${g} ${n}`).join(', ') || 'none'}`);
for (const p of added.slice(0, 60)) console.log(`   + [${p.game}/${p.type}] ${p.name}  £${p.price}`);
if (added.length > 60) console.log(`   … and ${added.length - 60} more`);

let removed = 0;
if (replace) {
  const covered = new Set(Object.entries(perGame).filter(([, n]) => n >= minPerGame).map(([g]) => g));
  const sealed = new Set(['etb', 'box', 'bundle', 'pack', 'deck', 'collection']);
  const before = data.products.length;
  data.products = data.products.filter((p) => !(covered.has(p.game) && sealed.has(p.type) && !p.image));
  removed = before - data.products.length;
  console.log(`replace: dropped ${removed} older ${[...covered].join('/')} products that have no photo`);
}

if (!apply) { console.log('Dry run — add --apply to copy images and update catalog.js'); process.exit(0); }
mkdirSync(outDir, { recursive: true });
for (const p of added) {
  const ext = (extname(p._src) || '.jpg').toLowerCase();
  const dest = join(outDir, `${p.id}${ext}`);
  copyFileSync(p._src, dest);
  p.image = relative(root, dest).replace(/\\/g, '/');
  delete p._src; if (p.brand === undefined) delete p.brand;
  data.products.push(p);
}
writeCatalog(catalogPath, data, header);
console.log(`✔ added ${added.length} products with images (${removed} removed) → ${relative(root, catalogPath)}`);
