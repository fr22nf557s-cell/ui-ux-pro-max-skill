# Contract monitor

Watches UK public procurement for drone work, scores each notice for whether a
small supplier could realistically bid it, and records who actually wins.

Runs itself every six hours on a Cloudflare cron trigger. Nothing to press.

---

## What it does

**Two sources, both official and free.**

| Source | What it carries |
|---|---|
| [Contracts Finder](https://www.contractsfinder.service.gov.uk) | Contracts over £12k central government, £30k wider public sector |
| [Find a Tender](https://www.find-tender.service.gov.uk) | Above-threshold contracts, including most Ministry of Defence work |

Both publish Open Contracting Data Standard JSON, so this reads the same feed
the commercial tender-alert services resell.

**Three things come out of it.**

1. **Opportunities**, ranked. Every notice that mentions unmanned aircraft or
   carries a drone procurement code, scored 0 to 100 with the reasons shown.
2. **Who wins this work.** Built purely from published award notices: the
   companies that have actually won UK drone contracts, the buyers, and the
   values. This is the competitive field, and your list of possible primes to
   subcontract under.
3. **An ingest log**, so a monitor that has quietly stopped working looks
   different from a quiet week.

### A deliberate omission

You asked for "companies that will suit these contracts". This shows companies
that have **won** contracts like these, from the public record. It does not
rank companies by whether they *would suit* a contract, because no open dataset
records what a drone company can actually do, and generating that would mean
inventing capability profiles and presenting them as fact. Award history is
real, checkable, and tells you the same thing more honestly.

---

## Setting it up

You need the Cloudflare account that already hosts the website. Roughly fifteen
minutes, once.

### 1. Install

```bash
cd projects/hornet-contracts
npm install
npx wrangler login
```

### 2. Create the database

```bash
npx wrangler d1 create hornet-contracts
```

It prints a `database_id`. Open `wrangler.toml` and replace
`PASTE_DATABASE_ID_HERE` with it. The id is an identifier, not a password, and
is safe to commit.

### 3. Create the tables

```bash
npm run schema
```

### 4. Set a password for the dashboard

This data is commercially sensitive. The Worker refuses to serve anything until
you set a token.

```bash
npx wrangler secret put DASH_TOKEN
```

Paste a long random string when prompted. Keep a copy — it is how you open the
dashboard. **Do not paste it into a chat, including to me.**

### 5. Deploy

```bash
npm run deploy
```

It prints a URL like `https://hornet-contracts.<your-subdomain>.workers.dev`.

### 6. Check the APIs actually answer the way this code expects

**Do not skip this.** See the warning below for why.

```
https://hornet-contracts.<your-subdomain>.workers.dev/api/selftest?key=YOUR_TOKEN
```

For each source you want to see `"ok": true` and `"releases_found"` greater
than zero. If you see `releases_found: 0` but `ok: true`, the API answered but
in a shape this code does not recognise — send me the output and I will fix the
parser. That is a ten-minute fix with a real response in hand.

### 7. Fill it for the first time

```bash
curl -X POST "https://hornet-contracts.<your-subdomain>.workers.dev/api/ingest" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The first run reaches back ninety days, so it takes a minute or two. After
that the cron keeps it current and each run only fetches what changed.

### 8. Open it

```
https://hornet-contracts.<your-subdomain>.workers.dev/?key=YOUR_TOKEN
```

The token becomes a cookie, so you only pass it in the URL once.

---

## Please read this before trusting it

**The transform logic is tested. The live API shapes are not.**

This was written on a machine whose network blocked both government APIs, so
every line here was built against published documentation rather than a real
response. `npm test` covers the parsing, classification, scoring and supplier
logic against fixtures, and all of it passes. What no test here can prove is
that the real APIs wrap their data the way the documentation says.

The code is built to survive being wrong about that. It walks the whole JSON
tree looking for anything shaped like an OCDS release rather than reaching into
a fixed path, every field access tolerates absence, and a failed run is written
to the ingest log with its error rather than passing silently. But
`/api/selftest` is the only thing that actually settles it. Run it.

**Everything else worth knowing.**

- **Scores are opinions.** Every rule is in `src/score.js` with a comment
  saying why. Disagree with one, change the number, redeploy. The reasons
  behind each score are shown in the dashboard so you can argue with them.
- **The supplier table is award history, not a recommendation.** A company
  appearing there means it won a contract, nothing more.
- **Relevance is CPV codes plus keywords.** It will miss a drone contract that
  never says "drone" and carries no drone code. Widen `TERMS_STRONG` or
  `CPV_RELATED` in `src/score.js` if you find gaps.
- **Not connected to the website.** Separate Worker, separate database. A
  mistake here cannot take hornetdrones.com down. Cloudflare Pages has no
  scheduled handler, which is the other reason it lives apart.
- **A token is a lock, not a security model.** Put Cloudflare Access in front
  of the Worker when you get a chance: Zero Trust, Access, Applications, add a
  self-hosted app pointing at this hostname, and restrict it to your two email
  addresses. Free, and much stronger.

---

## Everyday use

| Want to | Do |
|---|---|
| See what is new | Open the dashboard |
| Force a refresh now | `POST /api/ingest` with the bearer token |
| Check it is still working | Dashboard header, or `/api/runs` |
| Diagnose an empty dashboard | `/api/selftest` |
| Pull the data elsewhere | `/api/contracts`, `/api/suppliers` |
| Watch it run live | `npm run tail` |
| Change how things are scored | Edit `src/score.js`, `npm test`, `npm run deploy` |
| Change how often it runs | `crons` in `wrangler.toml` |

## Files

```
src/score.js    relevance rules and scoring. Pure, tested, the bit to tune.
src/ingest.js   fetching and normalising OCDS from both sources.
src/db.js       D1 upserts and the supplier rollup.
src/ui.js       the dashboard, server-rendered, no build step.
src/index.js    routes, auth, cron handler.
schema.sql      the tables.
test/run.mjs    63 tests over the pure logic. npm test.
```
