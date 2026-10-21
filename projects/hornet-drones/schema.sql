-- Hornet Drones — waitlist schema (Cloudflare D1 / SQLite)
--
-- Apply with:
--   npx wrangler d1 execute hornet-waitlist --file=./schema.sql --remote
--
-- Design notes:
--  * `email` is stored lowercased and is UNIQUE, so a double signup updates
--    rather than duplicating. The app relies on that constraint instead of a
--    read-then-write, which would race under concurrent submits.
--  * `confirmed_at NULL` means the address has not completed double opt-in.
--    Nothing may be emailed to an unconfirmed address except the confirmation
--    itself — that is what makes the list lawful under UK GDPR and what keeps
--    it deliverable.
--  * `confirm_token` is a random 32-byte hex string, cleared once used so a
--    leaked confirmation link cannot be replayed.
--  * UTM fields are captured for attribution. They are first-touch: the API
--    only writes them when the row is created, so a later organic visit does
--    not overwrite the campaign that actually earned the signup.

CREATE TABLE IF NOT EXISTS waitlist (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  email            TEXT    NOT NULL UNIQUE,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),

  -- Double opt-in
  confirm_token    TEXT,
  confirmed_at     TEXT,

  -- One-click unsubscribe (RFC 8058). Stable for the row's lifetime.
  unsub_token      TEXT    NOT NULL,
  unsubscribed_at  TEXT,

  -- Consent evidence. Under UK GDPR you must be able to show WHEN and HOW
  -- consent was given, not merely that it was.
  consent_text     TEXT    NOT NULL,
  consent_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  ip_country       TEXT,

  -- First-touch attribution
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  utm_term         TEXT,
  utm_content      TEXT,
  referrer         TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_confirm ON waitlist (confirm_token);
CREATE INDEX IF NOT EXISTS idx_waitlist_unsub   ON waitlist (unsub_token);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist (created_at);

-- Rate limiting. Keyed by hashed IP so the table never holds a raw address.
-- Rows are pruned opportunistically on write rather than by a cron.
CREATE TABLE IF NOT EXISTS rate_limit (
  key        TEXT PRIMARY KEY,
  hits       INTEGER NOT NULL DEFAULT 1,
  window_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_window ON rate_limit (window_at);
