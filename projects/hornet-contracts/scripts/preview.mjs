/*
 * Renders the contract-monitor dashboard offline, so it can be looked at
 * before it is deployed.
 *
 * It runs the REAL code: the real schema in an in-memory SQLite database
 * behind a small D1-shaped shim, the real normalise/score/upsert pipeline,
 * and the real dashboard renderer. Only the data is stand-in.
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, writeFileSync } from 'node:fs'
import { normalise, normaliseAwards } from '../src/ingest.js'
import { upsertContracts, upsertAwards, rebuildSuppliers, recordRun }
  from '../src/db.js'
import { dashboard } from '../src/ui.js'


/* ── D1 shim over node:sqlite ──────────────────────────────────────────── */
const sqlite = new DatabaseSync(':memory:')

const norm = (v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v)

function makeStmt(sql, args = []) {
  return {
    sql,
    args,
    bind: (...a) => makeStmt(sql, a.map(norm)),
    async all() {
      return { results: sqlite.prepare(sql).all(...args) }
    },
    async first() {
      return sqlite.prepare(sql).get(...args) ?? null
    },
    async run() {
      return sqlite.prepare(sql).run(...args)
    },
  }
}

const DB = {
  prepare: (sql) => makeStmt(sql),
  async batch(statements) {
    const out = []
    for (const s of statements) out.push(await s.run())
    return out
  },
}

/* ── Schema ────────────────────────────────────────────────────────────── */
sqlite.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'))

/* ── Stand-in notices ──────────────────────────────────────────────────────
 * Shaped like real OCDS releases, with invented buyers and suppliers. Nothing
 * here is a real contract. The banner in the output says so.
 */
const now = new Date()
const iso = (daysFromNow) => new Date(Date.now() + daysFromNow * 86400000).toISOString()

const releases = [
  {
    ocid: 'SAMPLE-0001', id: '1', date: iso(-3), tag: ['tender'],
    buyer: { name: 'Sample County Council' },
    tender: {
      id: 'S-1',
      title: 'Supply of small unmanned aircraft systems for estate surveillance',
      description: 'Framework for sUAS with thermal payloads for persistent surveillance of council sites.',
      status: 'active',
      value: { amount: 420000, currency: 'GBP' },
      tenderPeriod: { endDate: iso(19) },
      items: [{ id: '1', classification: { scheme: 'CPV', id: '34711200-6' } }],
    },
  },
  {
    ocid: 'SAMPLE-0002', id: '2', date: iso(-1), tag: ['tender'],
    buyer: { name: 'Sample Police Force' },
    tender: {
      id: 'S-2',
      title: 'Drone detection and counter-UAS capability',
      description: 'Detection, tracking and mitigation of unauthorised drones over custodial estates. BVLOS operation required.',
      status: 'active',
      value: { amount: 1150000, currency: 'GBP' },
      tenderPeriod: { endDate: iso(5) },
      items: [{ id: '1', classification: { scheme: 'CPV', id: '35613000-4' } }],
    },
  },
  {
    ocid: 'SAMPLE-0003', id: '3', date: iso(-9), tag: ['tender'],
    buyer: { name: 'Sample NHS Trust' },
    tender: {
      id: 'S-3',
      title: 'Aerial inspection of hospital roofs and plant',
      description: 'Periodic inspection using remotely piloted aircraft where access equipment is impractical.',
      status: 'active',
      value: { amount: 86000, currency: 'GBP' },
      tenderPeriod: { endDate: iso(32) },
      items: [{ id: '1', classification: { scheme: 'CPV', id: '71356100-9' } }],
    },
  },
  {
    ocid: 'SAMPLE-0004', id: '4', date: iso(-21), tag: ['tender'],
    buyer: { name: 'Sample Fire and Rescue Service' },
    tender: {
      id: 'S-4',
      title: 'Thermal imaging UAV and pilot training package',
      description: 'Quadcopter airframes with thermal cameras, plus GVC training for twelve operators.',
      status: 'active',
      value: { amount: 38000, currency: 'GBP' },
      tenderPeriod: { endDate: iso(-4) },
      items: [{ id: '1', classification: { scheme: 'CPV', id: '34711200-6' } }],
    },
  },
  {
    ocid: 'SAMPLE-0005', id: '5', date: iso(-40), tag: ['award'],
    buyer: { name: 'Sample Ministry Department' },
    tender: {
      id: 'S-5',
      title: 'Unmanned aerial systems for site security — lot 2',
      description: 'Provision of UAS airframes, ground control and maintenance.',
      items: [{ id: '1', classification: { scheme: 'CPV', id: '35613000-4' } }],
    },
    awards: [
      { id: 'a1', date: iso(-40), status: 'active', value: { amount: 2400000, currency: 'GBP' },
        suppliers: [{ name: 'Example Aerial Systems Ltd' }] },
      { id: 'a2', date: iso(-40), status: 'active', value: { amount: 610000, currency: 'GBP' },
        suppliers: [{ name: 'Example UAV Services Limited' }] },
    ],
  },
  {
    ocid: 'SAMPLE-0006', id: '6', date: iso(-62), tag: ['award'],
    buyer: { name: 'Sample City Council' },
    tender: {
      id: 'S-6',
      title: 'Drone survey services framework',
      description: 'Topographic and condition survey by drone across the city estate.',
      items: [{ id: '1', classification: { scheme: 'CPV', id: '34711200-6' } }],
    },
    awards: [
      { id: 'a1', date: iso(-62), status: 'active', value: { amount: 145000, currency: 'GBP' },
        suppliers: [{ name: 'Example Aerial Systems Ltd' }] },
    ],
  },
  {
    ocid: 'SAMPLE-0007', id: '7', date: iso(-75), tag: ['award'],
    buyer: { name: 'Sample Port Authority' },
    tender: {
      id: 'S-7',
      title: 'Counter-drone monitoring at port perimeter',
      description: 'Detection of unmanned aircraft in restricted airspace over the estate.',
      items: [{ id: '1', classification: { scheme: 'CPV', id: '35613000-4' } }],
    },
    awards: [
      { id: 'a1', date: iso(-75), status: 'active', value: { amount: 880000, currency: 'GBP' },
        suppliers: [{ name: 'Example Counter-UAS Group plc' }] },
    ],
  },
]

/* ── Run the real pipeline ─────────────────────────────────────────────── */
const contracts = []
const awards = []
for (const r of releases) {
  const row = normalise(r, 'contracts_finder', now)
  if (row) contracts.push(row)
  awards.push(...normaliseAwards(r, 'contracts_finder'))
}

await upsertContracts(DB, contracts, now.toISOString())
await upsertAwards(DB, awards)
await rebuildSuppliers(DB)

await recordRun(DB, {
  source: 'contracts_finder', started_at: iso(-0.02), finished_at: iso(-0.015),
  ok: true, pages_fetched: 4, releases_seen: 118,
  contracts_upserted: contracts.length, awards_upserted: awards.length,
})
await recordRun(DB, {
  source: 'find_a_tender', started_at: iso(-0.015), finished_at: iso(-0.01),
  ok: true, pages_fetched: 2, releases_seen: 61,
  contracts_upserted: 0, awards_upserted: 0,
})

/* ── Render ────────────────────────────────────────────────────────────── */
let html = await dashboard({ DB }, new URL('https://example.invalid/'))

/* Unmissable banner: this is a preview, the numbers are stand-ins. */
const banner = `<div style="background:#fff;color:#000;padding:14px 20px;font:600 14px/1.45 system-ui,sans-serif;text-align:center">
PREVIEW — the layout is real, the contracts are not. Every buyer and supplier below is invented sample data,
so you can see the shape of the thing before it is deployed. Once it is live this fills with real UK
procurement notices.</div>`
html = html.replace(/(<body[^>]*>)/i, `$1${banner}`)

const out = new URL('../dashboard-preview.html', import.meta.url)
writeFileSync(out, html)
console.log(`Wrote ${out.pathname} — ${contracts.length} sample notices, ${awards.length} awards. Open it in a browser.`)
