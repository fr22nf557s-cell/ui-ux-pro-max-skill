#!/usr/bin/env node
/* Sanity-check assets/js/catalog.js before the site is built, so a typo made in the GitHub
   editor fails the deploy and the previous version stays live instead of a blank shop.
     node scripts/check-catalog.mjs            (exit 1 with a readable list of problems) */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog-io.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
let data;
try { ({ data } = loadCatalog(resolve(root, 'assets/js/catalog.js'))); }
catch (e) { console.error(`catalog.js does not parse: ${e.message}\n(usually a missing comma, quote or bracket near the last edit)`); process.exit(1); }

const { config, games, types, products } = data;
if (!config || !config.storeName || !config.currency) problems.push('config needs storeName and currency');
if (!Array.isArray(products) || !products.length) problems.push('products must be a non-empty list');
const seen = new Set();
for (const [i, p] of (products || []).entries()) {
  const where = p && p.id ? p.id : `product #${i + 1}`;
  if (!p || typeof p !== 'object') { problems.push(`${where}: not an object`); continue; }
  if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) problems.push(`${where}: id must be lowercase letters, digits and hyphens`);
  if (seen.has(p.id)) problems.push(`${where}: duplicate id`); seen.add(p.id);
  if (!p.name) problems.push(`${where}: missing name`);
  if (!games[p.game]) problems.push(`${where}: unknown game "${p.game}" (one of ${Object.keys(games).join(', ')})`);
  if (!types[p.type]) problems.push(`${where}: unknown type "${p.type}" (one of ${Object.keys(types).join(', ')})`);
  if (!(Number(p.price) > 0)) problems.push(`${where}: price must be a number above 0 (got ${JSON.stringify(p.price)})`);
  if (p.compareAt != null && !(Number(p.compareAt) > Number(p.price))) problems.push(`${where}: compareAt must be empty or higher than price`);
  if (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0) problems.push(`${where}: stock must be a whole number (got ${JSON.stringify(p.stock)})`);
  if (!p.image) problems.push(`${where}: missing image`);
  else if (!/^https?:/.test(p.image) && !existsSync(resolve(root, p.image))) problems.push(`${where}: image file not found: ${p.image}`);
}
if (problems.length) { console.error(`catalog.js has ${problems.length} problem(s):\n  ` + problems.join('\n  ')); process.exit(1); }
console.log(`catalog ok: ${products.length} products, ${Object.keys(games).length} games, ${Object.keys(types).length} types`);
