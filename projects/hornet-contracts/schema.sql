-- Hornet Drones — contract monitor schema (Cloudflare D1 / SQLite).
--
-- Apply with:
--   npx wrangler d1 execute hornet-contracts --remote --file=./schema.sql
--
-- Every table is safe to re-run: the monitor is designed to be rebuilt from
-- the source APIs at any time, so nothing here is precious. The one thing
-- worth keeping across a rebuild is `first_seen_at`, which is why upserts
-- preserve it rather than overwriting.

-- One row per contracting process, keyed on the OCDS identifier (ocid).
-- A notice that is re-published updates its row rather than adding one.
CREATE TABLE IF NOT EXISTS contracts (
  ocid           TEXT PRIMARY KEY,
  source         TEXT NOT NULL,          -- contracts_finder | find_a_tender
  notice_id      TEXT,
  title          TEXT,
  description    TEXT,
  buyer_name     TEXT,
  buyer_id       TEXT,
  stage          TEXT,                   -- planning | tender | award | contract
  status         TEXT,
  value_amount   REAL,
  value_currency TEXT,
  published_at   TEXT,                   -- ISO 8601
  deadline_at    TEXT,                   -- ISO 8601, tender close
  url            TEXT,
  cpv_codes      TEXT,                   -- comma-separated 8-digit stems
  fit_score      INTEGER,                -- 0-100, see src/score.js
  fit_reasons    TEXT,                   -- JSON array of human-readable strings
  raw            TEXT,                   -- the source release, for audit
  first_seen_at  TEXT NOT NULL,
  last_seen_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contracts_score    ON contracts (fit_score DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_stage    ON contracts (stage);
CREATE INDEX IF NOT EXISTS idx_contracts_deadline ON contracts (deadline_at);
CREATE INDEX IF NOT EXISTS idx_contracts_seen     ON contracts (first_seen_at DESC);

-- One row per (process, award, supplier). This is real award history from the
-- public record: who won, from whom, for how much.
CREATE TABLE IF NOT EXISTS awards (
  id             TEXT PRIMARY KEY,       -- ocid:awardId:supplierSlug
  ocid           TEXT NOT NULL,
  source         TEXT,
  supplier_name  TEXT NOT NULL,
  supplier_slug  TEXT NOT NULL,
  supplier_id    TEXT,
  value_amount   REAL,
  value_currency TEXT,
  awarded_at     TEXT,
  buyer_name     TEXT,
  cpv_codes      TEXT
);

CREATE INDEX IF NOT EXISTS idx_awards_supplier ON awards (supplier_slug);
CREATE INDEX IF NOT EXISTS idx_awards_ocid     ON awards (ocid);
CREATE INDEX IF NOT EXISTS idx_awards_date     ON awards (awarded_at DESC);

-- Rollup of the awards table. Derived, never hand-edited: rebuilt after each
-- ingest so it can always be thrown away and regenerated.
CREATE TABLE IF NOT EXISTS suppliers (
  slug            TEXT PRIMARY KEY,
  name            TEXT,                  -- most recently seen spelling
  award_count     INTEGER,
  total_value     REAL,
  currency        TEXT,
  first_award_at  TEXT,
  last_award_at   TEXT,
  buyers          TEXT,                  -- JSON array of distinct buyer names
  cpv_codes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_suppliers_count ON suppliers (award_count DESC);
CREATE INDEX IF NOT EXISTS idx_suppliers_value ON suppliers (total_value DESC);

-- Watermark per source, so each run asks only for what changed since the last
-- successful one. Losing this table costs a slow first run, nothing more.
CREATE TABLE IF NOT EXISTS ingest_state (
  source        TEXT PRIMARY KEY,
  last_success  TEXT,                    -- ISO 8601
  note          TEXT
);

-- Audit log. Exists so that "no new contracts" and "the API changed shape and
-- we have been failing silently for a fortnight" cannot look the same.
CREATE TABLE IF NOT EXISTS ingest_runs (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  source             TEXT,
  started_at         TEXT,
  finished_at        TEXT,
  ok                 INTEGER,            -- 1 success, 0 failure
  pages_fetched      INTEGER,
  releases_seen      INTEGER,
  contracts_upserted INTEGER,
  awards_upserted    INTEGER,
  error              TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_started ON ingest_runs (started_at DESC);
