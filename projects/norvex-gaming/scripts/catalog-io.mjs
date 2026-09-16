/* Shared helpers: load/write assets/js/catalog.js without losing its header comment. */
import { readFileSync, writeFileSync } from 'node:fs';

export function loadCatalog(path) {
  const src = readFileSync(path, 'utf8');
  const sandbox = {};
  new Function('window', src)(sandbox);
  if (!sandbox.NORVEX_DATA) throw new Error(`No window.NORVEX_DATA in ${path}`);
  const at = src.search(/^window\.NORVEX_DATA\s*=/m);
  return { data: sandbox.NORVEX_DATA, header: at >= 0 ? src.slice(0, at) : '' };
}

export function writeCatalog(path, data, header = '') {
  const ind = (v) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');
  const js = `${header}window.NORVEX_DATA = {\n  config: ${ind(data.config)},\n\n  games: ${ind(data.games)},\n\n  types: ${ind(data.types)},\n\n  products: ${ind(data.products)}\n};\n`;
  writeFileSync(path, js);
}

export const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* CSV with quotes/newlines */
export function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.some((v) => v.trim() !== '')).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}
export const csvCell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
