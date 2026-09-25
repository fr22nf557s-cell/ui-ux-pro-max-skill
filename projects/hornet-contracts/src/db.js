/*
 * D1 persistence.
 *
 * D1 caps how many statements a single batch may carry, so every write here
 * chunks. The chunk size is conservative rather than tuned: an ingest that
 * takes two seconds longer is invisible, an ingest that throws halfway and
 * leaves the table half-written is not.
 */

const CHUNK = 20

function chunked(items, size = CHUNK) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/**
 * Insert or update contracts.
 *
 * first_seen_at is preserved on conflict — it is the one piece of information
 * this system holds that the source APIs do not, and it answers "is this new
 * to us?", which is the question the dashboard opens on.
 */
export async function upsertContracts(db, rows, now) {
  if (rows.length === 0) return 0
  let written = 0
  for (const group of chunked(rows)) {
    const statements = group.map((r) =>
      db
        .prepare(
          `INSERT INTO contracts (
             ocid, source, notice_id, title, description, buyer_name, buyer_id,
             stage, status, value_amount, value_currency, published_at, deadline_at,
             url, cpv_codes, fit_score, fit_reasons, raw, first_seen_at, last_seen_at
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(ocid) DO UPDATE SET
             source=excluded.source,
             notice_id=excluded.notice_id,
             title=excluded.title,
             description=excluded.description,
             buyer_name=excluded.buyer_name,
             buyer_id=excluded.buyer_id,
             stage=excluded.stage,
             status=excluded.status,
             value_amount=excluded.value_amount,
             value_currency=excluded.value_currency,
             published_at=excluded.published_at,
             deadline_at=excluded.deadline_at,
             url=excluded.url,
             cpv_codes=excluded.cpv_codes,
             fit_score=excluded.fit_score,
             fit_reasons=excluded.fit_reasons,
             raw=excluded.raw,
             last_seen_at=excluded.last_seen_at`,
        )
        .bind(
          r.ocid, r.source, r.notice_id, r.title, r.description, r.buyer_name, r.buyer_id,
          r.stage, r.status, r.value_amount, r.value_currency, r.published_at, r.deadline_at,
          r.url, r.cpv_codes, r.fit_score, r.fit_reasons, r.raw, now, now,
        ),
    )
    await db.batch(statements)
    written += group.length
  }
  return written
}

export async function upsertAwards(db, rows) {
  if (rows.length === 0) return 0
  let written = 0
  for (const group of chunked(rows)) {
    const statements = group.map((r) =>
      db
        .prepare(
          `INSERT INTO awards (
             id, ocid, source, supplier_name, supplier_slug, supplier_id,
             value_amount, value_currency, awarded_at, buyer_name, cpv_codes
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET
             supplier_name=excluded.supplier_name,
             value_amount=excluded.value_amount,
             value_currency=excluded.value_currency,
             awarded_at=excluded.awarded_at,
             buyer_name=excluded.buyer_name,
             cpv_codes=excluded.cpv_codes`,
        )
        .bind(
          r.id, r.ocid, r.source, r.supplier_name, r.supplier_slug, r.supplier_id,
          r.value_amount, r.value_currency, r.awarded_at, r.buyer_name, r.cpv_codes,
        ),
    )
    await db.batch(statements)
    written += group.length
  }
  return written
}

/**
 * Rebuild the suppliers rollup from the awards table.
 *
 * Done as a full rebuild rather than an incremental update because the table
 * is small, and because an incremental counter that drifts is worse than a
 * rebuild that takes a second. If it is ever wrong, it is wrong about data
 * that is one query away from being recomputed.
 */
export async function rebuildSuppliers(db) {
  await db.prepare('DELETE FROM suppliers').run()
  const { results } = await db
    .prepare(
      `SELECT
         supplier_slug                                   AS slug,
         MAX(supplier_name)                              AS name,
         COUNT(*)                                        AS award_count,
         COALESCE(SUM(value_amount), 0)                  AS total_value,
         MAX(COALESCE(value_currency, 'GBP'))            AS currency,
         MIN(awarded_at)                                 AS first_award_at,
         MAX(awarded_at)                                 AS last_award_at,
         GROUP_CONCAT(DISTINCT buyer_name)               AS buyers,
         GROUP_CONCAT(DISTINCT cpv_codes)                AS cpv_codes
       FROM awards
       WHERE supplier_slug <> ''
       GROUP BY supplier_slug`,
    )
    .all()

  if (!results?.length) return 0

  for (const group of chunked(results)) {
    await db.batch(
      group.map((r) =>
        db
          .prepare(
            `INSERT INTO suppliers
               (slug, name, award_count, total_value, currency, first_award_at, last_award_at, buyers, cpv_codes)
             VALUES (?,?,?,?,?,?,?,?,?)`,
          )
          .bind(
            r.slug,
            r.name,
            r.award_count,
            r.total_value,
            r.currency,
            r.first_award_at,
            r.last_award_at,
            /* GROUP_CONCAT gives a comma string; store JSON so the UI need not guess. */
            JSON.stringify(String(r.buyers || '').split(',').map((s) => s.trim()).filter(Boolean)),
            r.cpv_codes || '',
          ),
      ),
    )
  }
  return results.length
}

export async function getWatermark(db, source, fallbackDays = 90) {
  const row = await db.prepare('SELECT last_success FROM ingest_state WHERE source = ?').bind(source).first()
  if (row?.last_success) {
    /*
     * Overlap by two days on every run. These publishers backdate and amend
     * notices, so asking strictly for "since the last run" quietly loses the
     * ones that were edited after we looked.
     */
    const t = new Date(row.last_success)
    t.setUTCDate(t.getUTCDate() - 2)
    return t.toISOString()
  }
  const t = new Date()
  t.setUTCDate(t.getUTCDate() - fallbackDays)
  return t.toISOString()
}

export async function setWatermark(db, source, iso, note = '') {
  await db
    .prepare(
      `INSERT INTO ingest_state (source, last_success, note) VALUES (?,?,?)
       ON CONFLICT(source) DO UPDATE SET last_success=excluded.last_success, note=excluded.note`,
    )
    .bind(source, iso, note)
    .run()
}

export async function recordRun(db, run) {
  await db
    .prepare(
      `INSERT INTO ingest_runs
         (source, started_at, finished_at, ok, pages_fetched, releases_seen,
          contracts_upserted, awards_upserted, error)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      run.source, run.started_at, run.finished_at, run.ok ? 1 : 0,
      run.pages_fetched ?? 0, run.releases_seen ?? 0,
      run.contracts_upserted ?? 0, run.awards_upserted ?? 0,
      run.error ? String(run.error).slice(0, 2000) : null,
    )
    .run()
}
