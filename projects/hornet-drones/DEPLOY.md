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

The domain is **hornetdrones.com**, and all 14 references in the repo already
use it — `wrangler.toml`, `index.html` (canonical, og:url, JSON-LD),
`robots.txt`, `sitemap.xml` and the privacy notice. Nothing to substitute.

If it ever changes, those are the five files to update together:

| File | What it holds |
| --- | --- |
| `wrangler.toml` | `SITE_URL`, `MAIL_FROM` |
| `index.html` | canonical, `og:url`, three `@id`/`url` values in the JSON-LD |
| `public/robots.txt` | the `Sitemap:` line |
| `public/sitemap.xml` | both `<loc>` values |
| `public/privacy/index.html` | canonical and the contact address |
| `functions/_shared.js` | `MARK_URL` (the logo in every email) and the footer links |

Verify with:

```bash
grep -rn 'hornetdrones\.com' --include='*.html' --include='*.xml' \
  --include='*.txt' --include='*.toml' . | grep -v dist/
```

---

## 1. Point the domain at Cloudflare

The domain is registered at **123-reg**. Cloudflare needs to become
authoritative for DNS, which means replacing 123-reg's nameservers with
Cloudflare's.

### In Cloudflare

Dashboard → **Add a site** → `hornetdrones.com` → choose the **Free** plan.

It will scan for existing DNS records (a brand-new domain has none worth
keeping) and then show you **two nameservers**, something like:

```
gina.ns.cloudflare.com
rick.ns.cloudflare.com
```

Those two are unique to your account. Copy them exactly.

### In 123-reg

1. Log in → **Manage** next to `hornetdrones.com`.
2. Find **Manage DNS** / **Change nameservers** (123-reg moves this around;
   it is sometimes under "Advanced settings").
3. Switch from *123-reg nameservers* to **custom / other nameservers**.
4. **Delete every existing entry** — the `ns.123-reg.co.uk` ones — and enter
   only the two Cloudflare names. Adding Cloudflare *alongside* 123-reg is the
   classic mistake: DNS answers then come from whichever responds first, so the
   site works intermittently and is maddening to debug.
5. Save.

Two 123-reg specifics worth knowing:

- **Turn off any web forwarding or parking page** on the domain. If it stays
  on, 123-reg keeps answering for the apex and your site never appears.
- A 60-day *transfer* lock after purchase does **not** affect nameserver
  changes. You do not need to wait.

Propagation is usually under two hours, occasionally up to 24. Cloudflare
emails you when the zone goes active — do not start step 5 before it does.

Check progress yourself:

```bash
dig +short NS hornetdrones.com
# expect the two *.ns.cloudflare.com names, nothing from 123-reg
```

### Then, in Cloudflare

**SSL/TLS → Overview** → set **Full (strict)**.
**SSL/TLS → Edge Certificates** → turn on **Always Use HTTPS**.

That gives you forced HTTPS, a free certificate, and the ability to serve the
`_headers` file — three items off the launch checklist.

### Pick one hostname and redirect the other

Every canonical tag in this repo points at the **apex**
(`https://hornetdrones.com/`), so `www` must 301 to it. If both hostnames
serve the site, Google sees two copies of every page and splits the ranking
signals between them — the canonical tag is a hint, a 301 is not.

Do this as a zone-level **Redirect Rule**, not in the Pages `_redirects` file,
which matches on path and does not reliably match on hostname:

Dashboard → your domain → **Rules** → **Redirect Rules** → **Create rule**

| Field | Value |
| --- | --- |
| When incoming requests match | `Hostname` `equals` `www.hornetdrones.com` |
| Type | Dynamic |
| Expression | `concat("https://hornetdrones.com", http.request.uri.path)` |
| Status code | 301 |
| Preserve query string | on |

Add **both** `hornetdrones.com` and `www.hornetdrones.com` as custom domains on
the Pages project first, otherwise the `www` certificate will not issue and the
redirect will fail on TLS before it ever runs.

Verify once live:

```bash
curl -sI https://www.hornetdrones.com/privacy | grep -iE '^(HTTP|location)'
# expect: HTTP/2 301  +  location: https://hornetdrones.com/privacy
```

---

## 2. Create the database

All in the dashboard — no terminal, no `wrangler` install.

1. Cloudflare → **Storage & Databases** → **D1** → **Create database**. Name it
   exactly `hornet-waitlist`. Under **Location**, pick **Western Europe (WEUR)**:
   the privacy notice and the form's "data stays in-region" line both promise
   the list lives in Europe, and the location hint is what makes that true.
2. Open it → **Console** tab → paste the contents of `schema.sql` (comments and
   all; SQLite ignores them) → **Execute**.
3. **Tables** tab should now list `waitlist` and `rate_limit`, both empty.

4. Copy the **database ID** shown on the database's Overview page into the
   `[[d1_databases]]` block in `wrangler.toml` (it is already there for the
   database created on launch day). Once a Pages project has a
   `wrangler.toml`, bindings come from that file, not the dashboard, so this
   block is what makes `env.DB` exist. The id is an identifier, not a secret.

If you later want `wrangler dev` locally:

```bash
npx wrangler login
npx wrangler d1 execute hornet-waitlist --file=./schema.sql --remote
```

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
| Site key | `VITE_TURNSTILE_SITE_KEY` in `.env.production` (committed) | Yes — it is embedded in the page by design |
| Secret key | `TURNSTILE_SECRET_KEY`, a **Secret** in the Pages dashboard | **No. Never commit it, never paste it anywhere else.** |

The secret must never be given a `VITE_` prefix. Vite inlines every `VITE_`
variable into the client bundle, so prefixing it would publish it.

If the secret is ever exposed — pasted into a chat, shown in a screenshot,
committed by mistake — rotate it: Turnstile → the widget → **Settings** →
**Rotate secret key**, then update the Pages secret with the new value. The
old one stops working immediately, which is the point.

---

## 4. Email

Two separate systems, and they must not be confused:

- **Resend sends** the confirmation and update emails from the site.
- **The 123-reg / GoDaddy "Professional Email" mailbox receives** mail at
  @hornetdrones.com. It was set up on launch day, and its records live in
  Cloudflare DNS (Cloudflare is authoritative; 123-reg's own DNS is ignored).

### Sending — Resend

Resend → **Domains** → **Add Domain** → `hornetdrones.com`, region
**Europe (Ireland)**. Choose **Manual setup**, not Auto configure: the
automatic path writes into Cloudflare DNS itself and can replace the DMARC
record below. Leave **Enable Receiving** switched off; receiving is the
mailbox's job.

Add the three records it shows, in Cloudflare, all **DNS only**:

| Type | Name | Content |
| --- | --- | --- |
| TXT | `resend._domainkey` | the DKIM key (`p=MIGf…`, several hundred characters) |
| CNAME | `rsend` | the `…rmta.net` target Resend shows |
| CNAME | `send` | the `…rmta.net` target Resend shows |

Every one of them is on its own sub-name, so nothing collides with the
mailbox records at the apex. Copy the values with Resend's copy button:
its table shows long values collapsed with `[...]`, and pasting the
collapsed display text is the classic way to get a record that looks right
and never verifies.

Then **API keys** → **Create API key**, permission **Sending access** (never
Full access, which can read and manage the whole account), domain
`hornetdrones.com`. Copy it once into the Pages secret `RESEND_API_KEY`
(step 5). Never screenshot the key screen.

### Receiving — the Professional Email mailbox

The GoDaddy setup wizard for the mailbox lists the records it needs. As
added on launch day, all DNS only:

| Type | Name | Content |
| --- | --- | --- |
| TXT | `@` | the verification value the wizard shows (`T…`) |
| TXT | `@` | `v=spf1 include:secureserver.net -all` |
| TXT | `_dmarc` | `v=DMARC1; p=reject; rua=mailto:dmarc_rua@onsecureserver.net; adkim=r; aspf=r;` |
| CNAME | `email` | `email.secureserver.net` |
| CNAME | `secureserver1._domainkey` | `s1.dkim.hornetdrones_com.2c0.onsecureserver.net` |
| CNAME | `secureserver2._domainkey` | `s2.dkim.hornetdrones_com.2c0.onsecureserver.net` |
| MX | `@` | `smtp.secureserver.net`, priority 0 |
| MX | `@` | `mailstore1.secureserver.net`, priority 10 |
| SRV | `_autodiscover._tcp` | priority 100, weight 1, port 443, `autodiscover.secureserver.net` |

Two things that bit during setup and will bite again if touched:

- **CNAMEs default to Proxied (orange cloud) in Cloudflare.** A proxied mail
  record silently breaks. Every record in both tables must show **DNS only**.
- **One SPF record at the apex, ever.** The mailbox owns it
  (`include:secureserver.net`). Resend's SPF lives on `send.hornetdrones.com`,
  so there is no conflict; if a future sender wants the apex too, merge its
  `include:` into the existing record rather than adding a second.

DMARC is `p=reject` with relaxed alignment. Resend signs with
`resend._domainkey.hornetdrones.com`, so its mail aligns on DKIM and passes.
Do not switch on Cloudflare's "DMARC Management": it rewrites the record.

### Addresses the site publishes

These must exist on the mailbox as aliases (or the site must be changed to
an address that does), otherwise mail to them bounces:

- `privacy@hornetdrones.com` — in the privacy notice; a UK GDPR
  subject-access request sent there must reach you.
- `hello@hornetdrones.com` — the contact address on the About, Press,
  Careers, Terms and Airspace pages, and the footer's Contact link.
- `alpha@hornetdrones.com` — `MAIL_FROM`; people reply to everything.

`dmarc_rua@onsecureserver.net` in the DMARC record is GoDaddy's own report
collector, so no `dmarc@` alias is needed.

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

### Secrets

Workers & Pages → `hornet-drones` → **Settings** → **Variables and Secrets** →
**Add** → type **Secret**:

| Name | Value |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | the Turnstile secret key |
| `RESEND_API_KEY` | the Resend API key |

Secrets are the only thing configured in the dashboard. `SITE_URL`,
`MAIL_FROM` and the `DB` binding come from `wrangler.toml`, and the public
Turnstile site key comes from `.env.production` at build time. Adding a new
secret does not rebuild the site; trigger a redeploy afterwards
(Deployments → latest → ⋯ → **Retry deployment**) so the Functions pick it up.

If either secret is ever exposed (pasted in a chat, shown in a screenshot),
rotate it: Turnstile → widget → **Rotate secret key**; Resend → **API keys**
→ delete and create a new one. Then edit the Pages secret and redeploy.

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

Then do it by hand: submit the form with a real address. The form's message
tells you exactly how far the request got:

| Message | Meaning |
| --- | --- |
| Check your email | everything works |
| Signups are not switched on yet (…missing its verification key) | `TURNSTILE_SECRET_KEY` not set for this deployment |
| Signups are not switched on yet (…no database connection) | the `DB` binding is missing |
| Verification failed | the Turnstile secret is wrong |
| Your address is saved, but we couldn't send the confirmation email | row written; Resend key missing, wrong, or domain unverified |
| Something went wrong (HTTP nnn) | a non-JSON answer: something in front of the Function replied |

Confirm the email arrives, click the link, and check the row:

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
3. **The privacy notice and terms are drafts.** Every `[square bracket]` needs
   filling and both documents need a solicitor's eye. The About, Press,
   Careers and Airspace pages each carry a ⚠ box saying what is still missing
   (team and registration details, a real press kit, application retention,
   the product's regulatory status). Remove each box only when its content is
   real.
4. **Company details.** If Hornet Drones Ltd is a registered company, UK law
   requires its number and registered office on the site.
5. **Error tracking** is not wired up. Cloudflare's Workers logs cover the API;
   add Sentry if you want client-side errors too.
6. **Rotate both secrets.** The Turnstile secret and the Resend API key were
   each shown on screen during setup. Turnstile → widget → Rotate secret
   key; Resend → API keys → delete and recreate (Sending access). Update the
   two Pages secrets, retry the deployment, submit the form once.
7. **Mailbox aliases.** `privacy@`, `hello@` and `alpha@hornetdrones.com` must
   exist on the Professional Email mailbox or mail to them bounces.
