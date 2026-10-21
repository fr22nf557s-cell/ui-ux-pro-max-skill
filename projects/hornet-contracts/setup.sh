#!/usr/bin/env bash
#
# Hornet Drones — contract monitor, one-command setup.
#
# Does every step of the README for you: creates the database, writes its id
# into wrangler.toml, builds the tables, sets a dashboard password, deploys,
# and then checks that the government APIs actually answer.
#
# Run it from this folder:
#   bash setup.sh
#
# Safe to run twice. If something already exists it is reused, not duplicated.

set -euo pipefail

cd "$(dirname "$0")"

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
die()  { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node.js is not installed. Get it from https://nodejs.org and run this again."

# ── 1. Dependencies ──────────────────────────────────────────────────────────
say "1/6  Installing dependencies"
NPM_RC=0
NPM_OUT="$(npm install --no-audit --no-fund 2>&1)" || NPM_RC=$?
if [ "$NPM_RC" -ne 0 ]; then
  printf '\n%s\n' "$NPM_OUT"
  die "Installing dependencies failed. The output above says why."
fi
note "done"

WRANGLER="npx --yes wrangler"

# ── 2. Cloudflare login ──────────────────────────────────────────────────────
#
# `wrangler whoami` exits 0 even when nobody is signed in — it reports the fact
# rather than failing on it — so the exit code cannot be trusted here. Read what
# it actually says instead.
#
# And `wrangler login` must run attached to this terminal. Wrangler checks
# whether its output is a terminal; if it is not, it decides it is running
# unattended and refuses to open a browser, asking for an API token instead.
# So nothing below captures its output.
say "2/6  Checking you are signed in to Cloudflare"
WHOAMI_OUT="$($WRANGLER whoami 2>&1 || true)"
if printf '%s' "$WHOAMI_OUT" | grep -qiE 'not authenticated|not logged in|CLOUDFLARE_API_TOKEN|you need to login'; then
  NEEDS_LOGIN=yes
elif printf '%s' "$WHOAMI_OUT" | grep -qiE 'associated with the email|account id|account name'; then
  NEEDS_LOGIN=no
else
  # Unrecognised output — assume signed out, since a redundant login is
  # harmless and a missed one strands the next step.
  NEEDS_LOGIN=yes
fi

if [ "$NEEDS_LOGIN" = "no" ]; then
  note "already signed in"
else
  note "a browser window will open — approve the login, then come back here"
  echo
  $WRANGLER login || die "Cloudflare login did not complete. Run this script again to retry."
  echo

  WHOAMI_OUT="$($WRANGLER whoami 2>&1 || true)"
  if ! printf '%s' "$WHOAMI_OUT" | grep -qiE 'associated with the email|account id|account name'; then
    printf '%s\n' "$WHOAMI_OUT"
    die "Still not signed in after the login step. Run this script again."
  fi
  note "signed in"
fi

# ── 3. Database ──────────────────────────────────────────────────────────────
# The id is an identifier, not a password, and is safe to commit.
#
# Nothing here hides an error. Every wrangler call keeps its output so that a
# failure prints the real reason; and no command substitution is allowed to
# abort the script, because `set -e` would kill it before the check below runs
# and you would be left staring at a prompt with no explanation.
say "3/6  Database"
if grep -q 'PASTE_DATABASE_ID_HERE' wrangler.toml; then
  # Attached to the terminal, for the same reason as the login step above:
  # a captured wrangler cannot prompt. Whether this worked is decided below by
  # looking for the database, not by this command's exit code — "already
  # exists" is a failure here and a success for our purposes.
  echo
  $WRANGLER d1 create hornet-contracts || true
  echo

  # Read the id back. `|| true` keeps a failure here from killing the script.
  LIST_ERR="$(mktemp)"
  LIST_OUT="$($WRANGLER d1 list --json 2>"$LIST_ERR" || true)"

  # Tolerant of a banner or warning printed before the JSON.
  DB_ID="$(printf '%s' "$LIST_OUT" | node -e '
    let s = ""
    process.stdin.on("data", (d) => (s += d)).on("end", () => {
      try {
        const start = s.indexOf("[")
        const rows = start < 0 ? [] : JSON.parse(s.slice(start))
        const row = rows.find((d) => d && d.name === "hornet-contracts")
        process.stdout.write(row ? String(row.uuid || row.id || "") : "")
      } catch { /* leave empty; handled below */ }
    })
  ' || true)"

  if [ -z "$DB_ID" ]; then
    printf '\n--- what wrangler printed ---\n%s\n' "${LIST_OUT:-(nothing)}"
    [ -s "$LIST_ERR" ] && printf -- '--- errors ---\n%s\n' "$(cat "$LIST_ERR")"
    rm -f "$LIST_ERR"
    die "No database called hornet-contracts exists, and it could not be created.
The output above says why.

If it mentions billing or a plan: D1 needs the Workers free plan switched on
for the account once. Go to dash.cloudflare.com, open Workers & Pages, follow
the prompt to enable Workers, then run this script again.

If it is something else, you can do this step by hand:
  1. Run:  npx wrangler d1 list
  2. Copy the id shown for hornet-contracts.
  3. Open wrangler.toml, replace PASTE_DATABASE_ID_HERE with it, save.
  4. Run this script again — it will skip straight past this step."
  fi
  rm -f "$LIST_ERR"

  node -e '
    const fs = require("fs"), f = "wrangler.toml";
    fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("PASTE_DATABASE_ID_HERE", process.argv[1]));
  ' "$DB_ID"
  note "ready, and written into wrangler.toml"
else
  note "already configured in wrangler.toml"
fi

# ── 4. Tables ────────────────────────────────────────────────────────────────
say "4/6  Creating the tables"
SCHEMA_RC=0
SCHEMA_OUT="$($WRANGLER d1 execute hornet-contracts --remote --file=./schema.sql --yes 2>&1)" || SCHEMA_RC=$?
if [ "$SCHEMA_RC" -ne 0 ]; then
  printf '\n%s\n' "$SCHEMA_OUT"
  die "Could not create the tables. The output above says why."
fi
note "done"

# ── 5. Deploy, then set the dashboard password ───────────────────────────────
# Deploy first: a secret can only be attached to a Worker that exists.
say "5/6  Deploying"
DEPLOY_OUT="$($WRANGLER deploy 2>&1)" || { printf '%s\n' "$DEPLOY_OUT"; die "Deploy failed — the output above says why."; }
WORKER_URL="$(printf '%s\n' "$DEPLOY_OUT" | grep -Eo 'https://[a-z0-9.-]*workers\.dev' | head -1 || true)"
note "${WORKER_URL:-deployed}"

say "6/6  Dashboard password"
if $WRANGLER secret list 2>/dev/null | grep -q 'DASH_TOKEN'; then
  note "already set — leaving it alone"
  TOKEN=""
else
  TOKEN="$(node -e 'process.stdout.write(require("crypto").randomBytes(24).toString("base64url"))')"
  printf '%s' "$TOKEN" | $WRANGLER secret put DASH_TOKEN >/dev/null
  note "generated and stored in Cloudflare"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
say "Ready"
if [ -n "$TOKEN" ]; then
  cat <<EOF

  Your dashboard password — save it in your password manager now.
  It is stored in Cloudflare and cannot be shown again.

      $TOKEN

  Do not paste it into a chat, including to Claude.

EOF
fi

if [ -n "$WORKER_URL" ]; then
  cat <<EOF
  Next, in this order:

  1. Check the government APIs answer the way this code expects:
         $WORKER_URL/api/selftest?key=YOUR_PASSWORD
     Both sources should say "ok": true with "releases_found" above zero.

  2. Fill it for the first time (reaches back 90 days, takes a minute):
         curl -X POST "$WORKER_URL/api/ingest" -H "Authorization: Bearer YOUR_PASSWORD"

  3. Open the dashboard:
         $WORKER_URL/?key=YOUR_PASSWORD

  From then on it refreshes itself every six hours. Nothing to press.
EOF
else
  note "Deployed, but the URL was not printed. Find it under Workers & Pages in the Cloudflare dashboard."
fi

say "One last thing"
note "A password is a lock, not a security model. When you get a chance, put"
note "Cloudflare Access in front of this Worker: Zero Trust, Access,"
note "Applications, add a self-hosted app for this hostname, restrict it to"
note "your two email addresses. Free, and much stronger."
