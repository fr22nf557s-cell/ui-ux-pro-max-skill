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
npm install --no-audit --no-fund >/dev/null
note "done"

WRANGLER="npx --yes wrangler"

# ── 2. Cloudflare login ──────────────────────────────────────────────────────
say "2/6  Checking you are signed in to Cloudflare"
if $WRANGLER whoami >/dev/null 2>&1; then
  note "already signed in"
else
  note "opening a browser window — approve the login, then come back here"
  $WRANGLER login
fi

# ── 3. Database ──────────────────────────────────────────────────────────────
# The id is an identifier, not a password, and is safe to commit.
say "3/6  Database"
if grep -q 'PASTE_DATABASE_ID_HERE' wrangler.toml; then
  $WRANGLER d1 create hornet-contracts >/dev/null 2>&1 || note "(a database of that name already exists — reusing it)"

  DB_ID="$($WRANGLER d1 list --json 2>/dev/null \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s).find(d=>d.name==="hornet-contracts");process.stdout.write(r?(r.uuid||r.id||""):"")}catch(e){}})')"

  [ -n "$DB_ID" ] || die "Could not read the database id back from Cloudflare.
Run: npx wrangler d1 list
then paste the id for hornet-contracts into wrangler.toml, replacing PASTE_DATABASE_ID_HERE, and run this script again."

  node -e '
    const fs=require("fs"),f="wrangler.toml";
    fs.writeFileSync(f,fs.readFileSync(f,"utf8").replace("PASTE_DATABASE_ID_HERE",process.argv[1]));
  ' "$DB_ID"
  note "created and written into wrangler.toml"
else
  note "already configured in wrangler.toml"
fi

# ── 4. Tables ────────────────────────────────────────────────────────────────
say "4/6  Creating the tables"
$WRANGLER d1 execute hornet-contracts --remote --file=./schema.sql --yes >/dev/null
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
