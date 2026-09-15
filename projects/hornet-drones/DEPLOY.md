# Deploying Hornet Drones

Cloudflare Pages + Functions + D1 + Turnstile. Everything below is free at
waitlist volume.

Work through it in order — several steps produce values the next one needs.

---

## 0. Before you start

You need:

- A Cloudflare account (free).
- A **domain** you control, with nameservers you can point at Cloudflare.
- A [Resend](https://resend.com) account (free tier: 3,000 emails/month) for
  confirmation mail.

Throughout, replace `hornetdrones.com` with your real domain. It appears in
five places and they must agree:

| File | What to change |
| --- | --- |
| `wrangler.toml` | `SITE_URL`, `MAIL_FROM` |
| `index.html` | `<link rel="canonical">`, the `og:url`, and the three `@id`/`url` values in the JSON-LD |
| `public/robots.txt` | the `Sitemap:` line |
| `public/sitemap.xml` | both `<loc>` values |
| `public/privacy/index.html` | `<link rel="canonical">` and the contact address |

---

## 1. Add the domain to Cloudflare

Dashboard → **Add a site** → enter your domain → follow the nameserver
instructions at your registrar. Wait for it to go active (usually minutes;
occasionally hours).

This one step gives you **forced HTTPS**, a free certificate, and the ability
to serve the `_headers` file — three items off the launch checklist.

Then under **SSL/TLS → Overview** set the mode to **Full (strict)**, and under
**Edge Certificates** turn on **Always Use HTTPS**.

---

## 2. Create the database

```bash
cd projects/hornet-drones
npx wrangler login
npx wrangler d1 create hornet-waitlist
```

Copy the `database_id` it prints into `wrangler.toml`, replacing
`PASTE_DATABASE_ID_HERE`. Then create the tables:

```bash
npx wrangler d1 execute hornet-waitlist --file=./schema.sql --remote
```

Verify:

```bash
npx wrangler d1 execute hornet-waitlist --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

You should see `waitlist` and `rate_limit`.

> **Backups.** D1 has Time Travel: any point in the last 30 days can be
> restored with `wrangler d1 time-travel restore`. That covers the "daily
> backups" requirement without a cron job. Test a restore once, before you need
> it — an untested backup is a hope, not a backup.

---

## 3. Turnstile

Dashboard → **Turnstile** → **Add widget**.

- Domain: your domain (add `localhost` too if you want it working in dev).
- Mode: **Managed**.

You get two keys:

| Key | Where it goes | Public? |
| --- | --- | --- |
| Site key | `VITE_TURNSTILE_SITE_KEY` build variable | Yes — it is embedded in the page by design |
| Secret key | `TURNSTILE_SECRET_KEY` encrypted env var | **No. Never commit it.** |

The secret must never be given a `VITE_` prefix. Vite inlines every `VITE_`
variable into the client bundle, so prefixing it would publish it.

---

## 4. Email sending

In Resend, add and verify your domain. It will give you DNS records to add in
Cloudflare:

- **SPF** — a TXT record authorising Resend to send as you.
- **DKIM** — a TXT (or CNAME) record carrying the signing key.
- **DMARC** — add this yourself if Resend doesn't:
  `_dmarc` TXT → `v=DMARC1; p=none; rua=mailto:dmarc@hornetdrones.com`

  Start at `p=none`, watch the reports for a couple of weeks, then tighten to
  `p=quarantine` and eventually `p=reject`. Going straight to `p=reject` on a
  new domain is how people silently lose their own mail.

That covers three more checklist items. Then create an API key in Resend for
`RESEND_API_KEY`.

---

## 5. Create the Pages project

Dashboard → **Workers & Pages** → **Create** → **Pages** → connect this repo.

Build settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `projects/hornet-drones` |

### Environment variables

Settings → **Environment variables** → Production:

| Name | Value | Encrypt? |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | your Turnstile site key | No |
| `TURNSTILE_SECRET_KEY` | your Turnstile secret | **Yes** |
| `RESEND_API_KEY` | your Resend key | **Yes** |
| `SITE_URL` | `https://hornetdrones.com` (no trailing slash) | No |
| `MAIL_FROM` | `Hornet Drones <alpha@hornetdrones.com>` | No |

### D1 binding

Settings → **Functions** → **D1 database bindings** → add:

- Variable name: `DB`
- Database: `hornet-waitlist`

This binding is what makes `env.DB` exist. Without it every API call 500s.

---

## 6. Deploy and verify

Push to the branch Pages is watching. Then check, in this order:

```bash
# Headers are live
curl -sI https://hornetdrones.com | grep -iE 'strict-transport|content-security|x-frame'

# Static routes
curl -s -o /dev/null -w '%{http_code}\n' https://hornetdrones.com/privacy
curl -s -o /dev/null -w '%{http_code}\n' https://hornetdrones.com/robots.txt

# The API rejects a request with no Turnstile token (expect 400)
curl -s -X POST https://hornetdrones.com/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","consent":true,"consentText":"test"}'
```

Then do it by hand: submit the form with a real address, confirm the email
arrives, click the link, and check the row:

```bash
npx wrangler d1 execute hornet-waitlist --remote \
  --command="SELECT email, confirmed_at, utm_source FROM waitlist ORDER BY id DESC LIMIT 5"
```

Finally, click **unsubscribe** in that email and confirm `unsubscribed_at`
fills in.

---

## 7. Exporting the list

```bash
npx wrangler d1 execute hornet-waitlist --remote --json \
  --command="SELECT email, created_at, utm_source, utm_medium, utm_campaign
             FROM waitlist WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
             ORDER BY created_at" > confirmed.json
```

**Only ever mail the rows this query returns.** Anything with a null
`confirmed_at` has not opted in, and anything with `unsubscribed_at` set has
opted out. Mailing either is both unlawful and the fastest way to get your
sending domain blocked.

---

## Still outstanding before launch

These are not code problems, so they are not done:

1. **The spec figures are invented.** `1.8 s`, `45 min`, `IP67`, `AES-256`,
   `<18 dB`, and the `VERIFIED · HRN-01 · REV. 4` stamp. Replace with measured
   figures or remove. The "VERIFIED" stamp asserts third-party validation and
   should go regardless.
2. **"Alpha units shipping Q3"** is a delivery promise.
3. **The privacy notice is a draft.** Every `[square bracket]` needs filling
   and the whole document needs a solicitor's eye.
4. **Company details.** If Hornet Drones Ltd is a registered company, UK law
   requires its number and registered office on the site.
5. **Error tracking** is not wired up. Cloudflare's Workers logs cover the API;
   add Sentry if you want client-side errors too.
