#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — optimise product images
   --------------------------------------------------------------------------
   Converts every PNG/JPG in assets/img/products/ to WebP (max 1000px on the
   long side, quality 82), deletes the original and updates the `image` path in
   assets/js/catalog.js. Needs `sharp` (npm install --no-save sharp). Without it
   the script exits quietly so the pipeline still works with the originals.

     node scripts/optimize-images.mjs [--dir assets/img/products] [--max 1000] [--quality 82]
   ========================================================================== */
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, join, dirname, extname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, writeCatalog } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dir = resolve(root, opt('--dir', 'assets/img/products'));
const max = Number(opt('--max', 1000));
const quality = Number(opt('--quality', 82));
const catalogPath = resolve(root, 'assets/js/catalog.js');

let sharp;
try { ({ default: sharp } = await import('sharp')); }
catch { console.log('sharp not installed — leaving images as they are (npm install --no-save sharp to enable WebP conversion)'); process.exit(0); }
if (!existsSync(dir)) { console.log(`No ${relative(root, dir)} directory — nothing to do`); process.exit(0); }

const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f) && statSync(join(dir, f)).isFile());
if (!files.length) { console.log('No PNG/JPG files to convert'); process.exit(0); }

const { data, header } = loadCatalog(catalogPath);
let converted = 0; let relinked = 0; let before = 0; let after = 0;
for (const f of files) {
  const src = join(dir, f); const out = join(dir, basename(f, extname(f)) + '.webp');
  try {
    before += statSync(src).size;
    await sharp(src).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).webp({ quality }).toFile(out);
    after += statSync(out).size;
    unlinkSync(src); converted++;
    const relSrc = relative(root, src).replace(/\\/g, '/'); const relOut = relative(root, out).replace(/\\/g, '/');
    for (const p of data.products) if (p.image === relSrc) { p.image = relOut; relinked++; }
  } catch (e) { console.warn(`  ! ${f}: ${e.message}`); }
}
if (relinked) writeCatalog(catalogPath, data, header);
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
console.log(`✔ converted ${converted} image(s) to WebP (${mb(before)} → ${mb(after)}), relinked ${relinked} product(s)`);
