#!/usr/bin/env node
/* ==========================================================================
   NORVEX GAMING — price & stock sheet
   --------------------------------------------------------------------------
   The quick way to correct prices and stock without touching code: export the
   catalogue to a spreadsheet, edit the price / stock / preorder columns, import
   it back. Only those columns are read on import; everything else in
   catalog.js (names, photos, descriptions) is left exactly as it is.

   Usage:
     node scripts/catalog-sheet.mjs export [prices.csv]            # write the sheet (default: catalog-prices.csv)
     node scripts/catalog-sheet.mjs import prices.csv [--dry-run]  # apply price / stock / preorder / compareAt by id

   Sheet columns: id, game, type, name, set, price, compareAt, stock, preorder
   - price      pounds, e.g. 49.99 (required, > 0)
   - compareAt  optional "was" price shown struck through; leave empty for none
   - stock      whole number; 0 shows the product as sold out
   - preorder   yes / no (a pre-order can be ordered up to 10 per customer regardless of stock)
   Rows whose id is not in the catalogue are reported and skipped; no row is ever deleted.
   Opens in Excel, Numbers and Google Sheets (UTF-8 with BOM). Save back as CSV to import.
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, writeCatalog, parseCSV, csvCell } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = resolve(root, 'assets/js/catalog.js');
const [cmd, fileArg, ...rest] = process.argv.slice(2);
const dry = rest.includes('--dry-run') || fileArg === '--dry-run';
const COLS = ['id', 'game', 'type', 'name', 'set', 'price', 'compareAt', 'stock', 'preorder'];

if (cmd === 'export') {
  const { data } = loadCatalog(CATALOG);
  const out = resolve(fileArg && !fileArg.startsWith('--') ? fileArg : 'catalog-prices.csv');
  const rows = data.products.map((p) => [p.id, p.game, p.type, p.name, p.set || '', p.price, p.compareAt ?? '', p.stock ?? 0, p.preorder ? 'yes' : 'no']);
  writeFileSync(out, '﻿' + [COLS, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n');
  console.log(`exported ${rows.length} products → ${out}`);
} else if (cmd === 'import' && fileArg && !fileArg.startsWith('--')) {
  const raw = readFileSync(resolve(fileArg));
  let text; try { text = new TextDecoder('utf-8', { fatal: true }).decode(raw); } catch { text = new TextDecoder('windows-1252').decode(raw); }  // Excel sometimes saves CSV as Windows-1252
  const rows = parseCSV(text);
  for (const need of ['id', 'price', 'stock']) if (!rows.length || !(need in rows[0])) { console.error(`The sheet needs an "${need}" column (found: ${Object.keys(rows[0] || {}).join(', ') || 'nothing'})`); process.exit(1); }
  const { data, header } = loadCatalog(CATALOG);
  const byId = Object.fromEntries(data.products.map((p) => [p.id, p]));
  const money = (v) => { const n = Number(String(v).replace(/[£$,\s]/g, '')); return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN; };
  const yes = (v) => /^(y|yes|true|1)$/i.test(String(v).trim());
  const changes = []; const problems = []; const unknown = []; const seen = new Set();
  for (const r of rows) {
    const p = byId[r.id]; if (!p) { unknown.push(r.id); continue; }
    if (seen.has(r.id)) { problems.push(`${r.id}: listed twice, second row ignored`); continue; } seen.add(r.id);
    const price = money(r.price); const stock = Math.floor(Number(r.stock)); const compareAt = r.compareAt === undefined || r.compareAt === '' ? null : money(r.compareAt);
    if (!(price > 0)) { problems.push(`${r.id}: price "${r.price}" is not a number above 0`); continue; }
    if (!(stock >= 0)) { problems.push(`${r.id}: stock "${r.stock}" is not a whole number`); continue; }
    if (compareAt !== null && !(compareAt > price)) { problems.push(`${r.id}: compareAt "${r.compareAt}" must be empty or higher than the price`); continue; }
    const preorder = 'preorder' in r ? yes(r.preorder) : Boolean(p.preorder);
    const diff = [];
    if (price !== p.price) diff.push(`price ${p.price} → ${price}`);
    if (stock !== (p.stock ?? 0)) diff.push(`stock ${p.stock ?? 0} → ${stock}`);
    if ((compareAt ?? null) !== (p.compareAt ?? null)) diff.push(`compareAt ${p.compareAt ?? '-'} → ${compareAt ?? '-'}`);
    if (preorder !== Boolean(p.preorder)) diff.push(`preorder ${Boolean(p.preorder)} → ${preorder}`);
    if (diff.length) { changes.push(`${p.name}: ${diff.join(', ')}`); Object.assign(p, { price, stock, compareAt, preorder }); }
  }
  for (const line of changes) console.log('  ' + line);
  if (unknown.length) console.log(`skipped ${unknown.length} row(s) with ids not in the catalogue: ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? '…' : ''}`);
  for (const line of problems) console.log('  ! ' + line);
  const untouched = data.products.length - seen.size;
  if (untouched) console.log(`${untouched} catalogue product(s) were not in the sheet and keep their current values`);
  if (problems.length) { console.error(`\n${problems.length} row(s) need fixing; nothing written.`); process.exit(1); }
  if (!changes.length) { console.log('no changes'); process.exit(0); }
  if (dry) { console.log(`\n${changes.length} change(s) (dry run, nothing written)`); process.exit(0); }
  writeCatalog(CATALOG, data, header);
  console.log(`\n${changes.length} change(s) written to assets/js/catalog.js`);
} else {
  console.log('usage: node scripts/catalog-sheet.mjs export [file.csv] | import file.csv [--dry-run]'); process.exit(1);
}
