#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — tidy the catalogue after a gallery run
   --------------------------------------------------------------------------
   Publisher galleries mix real packshots with article photos, key art and
   placeholders, and word the same product several ways. This pass makes the
   catalogue shop-ready again:

     · applies scripts/catalog-overrides.json (drop / unsetImage / field edits)
     · drops titles that are not products (see JUNK in catalog-rules.mjs)
     · rewrites names into the storefront's house style (One Piece codes first,
       Title Case, combined Pokémon titles merged) and re-derives set names
     · removes photos that are placeholders (tiny files) or missing on disk
     · merges duplicates (same game, format and product code / set words)
     · ids follow names (image files are renamed with them)
     · keeps up to 3 featured products per game, all with a real photo
     · deletes image files no product references any more

     node scripts/tidy-catalog.mjs            # dry run: prints every change
     node scripts/tidy-catalog.mjs --apply    # write catalog.js + move/delete files
   ========================================================================== */
import { readFileSync, existsSync, statSync, unlinkSync, renameSync, readdirSync } from 'node:fs';
import { resolve, join, extname, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, writeCatalog, slug } from './catalog-io.mjs';
import { JUNK, MIN_IMAGE_BYTES, cleanName, setName, dedupeKey, detectFormat, describe, isTemplateCopy } from './catalog-rules.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const catalogPath = resolve(root, opt('--catalog', 'assets/js/catalog.js'));
const imgDir = resolve(root, opt('--images', 'assets/img/products'));
const overridesPath = resolve(root, opt('--overrides', 'scripts/catalog-overrides.json'));
const apply = args.includes('--apply');
const SEALED = new Set(['etb', 'box', 'bundle', 'pack', 'deck', 'collection']);
const FEATURED_PER_GAME = 3;
const PRI = { etb: 0, box: 1, bundle: 2, deck: 3, collection: 4, pack: 5 };

const { data, header } = loadCatalog(catalogPath);
const ov = existsSync(overridesPath) ? JSON.parse(readFileSync(overridesPath, 'utf8')) : {};
const drop = new Set(ov.drop || []); const unset = new Set(ov.unsetImage || []); const edits = ov.products || {};
const rel = (f) => relative(root, f).replace(/\\/g, '/');
const localImg = (p) => (p.image && !/^https?:/i.test(p.image) ? resolve(root, p.image) : null);
const stats = { dropped: 0, renamed: 0, photosRemoved: 0, merged: 0, moved: 0, orphans: 0 };
const deleted = new Set();
let products = data.products;

/* 1. hand-curated overrides ------------------------------------------------ */
products = products.filter((p) => {
  if (!drop.has(p.id)) return true;
  console.log(`− drop (overrides): ${p.name}`); const f = localImg(p); if (f) deleted.add(f); stats.dropped++; return false;
});
for (const p of products) {
  if (unset.has(p.id) && p.image) { console.log(`· photo removed (overrides): ${p.name}`); const f = localImg(p); if (f) deleted.add(f); p.image = null; stats.photosRemoved++; }
  const e = edits[p.id]; if (!e) continue;
  for (const k of ['name', 'set', 'type', 'price', 'compareAt', 'stock', 'badge', 'brand', 'description', 'featured', 'preorder', 'image']) if (e[k] !== undefined) p[k] = e[k];
  if (e.id) p._id = e.id;
  p._forcedSet = e.set !== undefined;
}

/* 2. rules: junk titles, house-style names, sets, template copy ----------- */
products = products.filter((p) => {
  if (!SEALED.has(p.type) || !JUNK.test(p.name)) return true;
  console.log(`− drop (not a product): ${p.name}`); const f = localImg(p); if (f) deleted.add(f); stats.dropped++; return false;
});
for (const p of products) {
  if (!SEALED.has(p.type)) continue;
  const before = p.name;
  const name = cleanName(p.name, p.game);
  if (name !== p.name) { console.log(`~ rename: ${p.name} → ${name}`); p.name = name; stats.renamed++; }
  const derived = isTemplateCopy(p.description);
  if (derived) {
    if (!p._forcedSet) p.set = setName(p.name, p.game, (detectFormat(p.name) || [])[2]);
    p.description = describe(p.type, p.set, p.name);
    if (p.type === 'pack') p.contents = [`1 ${p.set} booster pack`];
    if (p.specs && data.types[p.type]?.singular) p.specs.Format = data.types[p.type].singular;
  }
  if (!p._id && (p.name !== before || derived)) p._id = slug(`${p.game}-${p.name}`);
}

/* 3. photos: missing or placeholder-sized --------------------------------- */
for (const p of products) {
  const f = localImg(p); if (!f) continue;
  if (!existsSync(f)) { console.log(`· photo missing on disk, cleared: ${p.name} (${p.image})`); p.image = null; stats.photosRemoved++; continue; }
  if (statSync(f).size < MIN_IMAGE_BYTES) { console.log(`· photo is a placeholder (${statSync(f).size} B), removed: ${p.name}`); deleted.add(f); p.image = null; stats.photosRemoved++; }
}

/* 4. duplicates ------------------------------------------------------------- */
const groups = new Map();
for (const p of products) { if (!SEALED.has(p.type)) continue; const k = dedupeKey(p.game, p.name); (groups.get(k) || groups.set(k, []).get(k)).push(p); }
const losers = new Set();
for (const [, ps] of groups) {
  if (ps.length < 2) continue;
  ps.sort((a, b) => (!!b.image - !!a.image) || ((b._id || b.id) === slug(`${b.game}-${b.name}`)) - ((a._id || a.id) === slug(`${a.game}-${a.name}`)) || a.name.length - b.name.length);
  const keep = ps[0];
  for (const p of ps.slice(1)) { console.log(`= merge: "${p.name}" into "${keep.name}"`); losers.add(p); const f = localImg(p); if (f) deleted.add(f); stats.merged++; }
}
products = products.filter((p) => !losers.has(p));

/* 5. ids follow names; image files follow ids ------------------------------ */
const taken = new Set(products.map((p) => p.id));
const moves = [];
for (const p of products) {
  const want = p._id; delete p._id; delete p._forcedSet;
  if (want && want !== p.id) {
    if (taken.has(want)) { console.log(`! id ${want} already taken, keeping ${p.id}`); }
    else { console.log(`~ id: ${p.id} → ${want}`); taken.delete(p.id); taken.add(want); p.id = want; }
  }
  const f = localImg(p); if (!f) continue;
  const target = join(dirname(f), p.id + extname(f).toLowerCase());
  if (target !== f) { moves.push([f, target]); p.image = rel(target); stats.moved++; }
}
const referenced = new Set(products.map(localImg).filter(Boolean));
for (const f of [...deleted]) if (referenced.has(f) || moves.some(([, t]) => t === f)) deleted.delete(f);

/* 6. featured: real photos only, up to N per game -------------------------- */
for (const p of products) if (SEALED.has(p.type)) p.featured = false;   // re-picked below; graded singles keep their flag
const byGame = {};
for (const p of products) if (SEALED.has(p.type)) (byGame[p.game] ||= []).push(p);
for (const [g, ps] of Object.entries(byGame)) {
  let have = 0;
  const pool = ps.filter((p) => p.image && !p.preorder).sort((a, b) => (PRI[a.type] ?? 9) - (PRI[b.type] ?? 9));
  const sets = new Set();
  for (const pass of [0, 1]) for (const p of pool) {   // pass 0: one per set, no store-exclusive variants; pass 1: fill up
    if (have >= FEATURED_PER_GAME) break;
    if (p.featured) continue;
    if (pass === 0 && (sets.has(p.set) || /Pok\u00e9mon Center/i.test(p.name))) continue;
    p.featured = true; sets.add(p.set); have++;
  }
  const extra = ps.filter((p) => p.featured).slice(FEATURED_PER_GAME);
  for (const p of extra) p.featured = false;
  if (ps.some((p) => p.image)) console.log(`★ ${g}: ${ps.filter((p) => p.featured).map((p) => p.name).join(' · ')}`);
}

/* 7. orphan image files ----------------------------------------------------- */
if (existsSync(imgDir)) {
  const finalRefs = new Set(products.map(localImg).filter(Boolean));
  const moveTargets = new Set(moves.map(([, t]) => t)); const moveSources = new Set(moves.map(([s]) => s));
  for (const f of readdirSync(imgDir)) {
    const full = join(imgDir, f); if (f.startsWith('.') || !statSync(full).isFile()) continue;
    if (!finalRefs.has(full) && !moveTargets.has(full) && !moveSources.has(full) && !deleted.has(full)) { deleted.add(full); stats.orphans++; }
  }
}

/* summary ------------------------------------------------------------------- */
data.products = products;
const withPhoto = products.filter((p) => p.image).length;
console.log(`\n${products.length} products (${withPhoto} with a photo) · dropped ${stats.dropped} · merged ${stats.merged} · renamed ${stats.renamed} · photos removed ${stats.photosRemoved} · files to move ${moves.length} · files to delete ${deleted.size} (${stats.orphans} orphans)`);
if (!apply) { console.log('Dry run — add --apply to write catalog.js and move/delete the files'); process.exit(0); }
for (const [from, to] of moves) { if (existsSync(from)) renameSync(from, to); }
for (const f of deleted) { if (existsSync(f)) unlinkSync(f); }
writeCatalog(catalogPath, data, header);
console.log(`✔ wrote ${rel(catalogPath)}`);
