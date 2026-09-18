/*
 * Dashboard, rendered server-side from D1.
 *
 * No build step and no framework on purpose: this Worker should deploy with a
 * single `wrangler deploy` and keep working years from now without a toolchain
 * to maintain. The page renders complete on first paint; filtering is done with
 * a form that reloads, not with client-side state.
 *
 * Visual language follows the marketing site: black ground, white as the only
 * accent, mono for every number.
 */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const money = (amount, currency = 'GBP') => {
  const n = Number(amount)
  if (!Number.isFinite(n) || n === 0) return '—'
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${currency} ${Math.round(n).toLocaleString('en-GB')}`
  }
}

const day = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Days until a deadline, as a short human phrase. */
function closes(iso) {
  if (!iso) return { text: '—', urgent: false, gone: false }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { text: '—', urgent: false, gone: false }
  const days = Math.round((d - new Date()) / 86400000)
  if (days < 0) return { text: `closed ${Math.abs(days)}d ago`, urgent: false, gone: true }
  if (days === 0) return { text: 'closes today', urgent: true, gone: false }
  if (days <= 7) return { text: `${days}d left`, urgent: true, gone: false }
  return { text: `${days}d left`, urgent: false, gone: false }
}

export async function dashboard(env, requestUrl) {
  const db = env.DB

  /*
   * Filters come from the query string so the page stays a plain document:
   * the form is a GET, the result is bookmarkable, and there is no client-side
   * state to go stale.
   */
  const params = requestUrl instanceof URL ? requestUrl.searchParams : new URLSearchParams()
  const refreshing = params.get('refreshing') === '1'
  const q = (params.get('q') || '').trim()
  const stage = params.get('stage') || 'all'

  const where = []
  const binds = []
  if (stage !== 'all') {
    where.push('stage = ?')
    binds.push(stage)
  }
  if (q) {
    where.push('(title LIKE ? OR description LIKE ? OR buyer_name LIKE ?)')
    binds.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }
  const filterSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const filtered = Boolean(q) || stage !== 'all'

  /*
   * Everything the page needs in one batch. If the schema has not been applied
   * yet these throw, and the catch turns that into a setup message rather than
   * a stack trace, because "run the schema" is the actual next step.
   */
  let contracts = []
  let suppliers = []
  let runs = []
  let totals = { all: 0, open: 0, awarded: 0 }
  let setupError = null

  try {
    const [c, s, r, t] = await Promise.all([
      db
        .prepare(
          `SELECT ocid, source, title, buyer_name, stage, value_amount, value_currency,
                  published_at, deadline_at, url, fit_score, fit_reasons, first_seen_at
             FROM contracts
            ${filterSql}
            ORDER BY fit_score DESC, COALESCE(published_at, first_seen_at) DESC
            LIMIT 60`,
        )
        .bind(...binds)
        .all(),
      db
        .prepare(
          `SELECT name, award_count, total_value, currency, last_award_at, buyers
             FROM suppliers ORDER BY award_count DESC, total_value DESC LIMIT 25`,
        )
        .all(),
      db.prepare(`SELECT * FROM ingest_runs ORDER BY started_at DESC LIMIT 12`).all(),
      db
        .prepare(
          `SELECT COUNT(*) AS all_count,
                  SUM(CASE WHEN stage IN ('tender','planning') THEN 1 ELSE 0 END) AS open_count,
                  SUM(CASE WHEN stage IN ('award','contract') THEN 1 ELSE 0 END) AS awarded_count
             FROM contracts`,
        )
        .first(),
    ])
    contracts = c.results ?? []
    suppliers = s.results ?? []
    runs = r.results ?? []
    totals = {
      all: t?.all_count ?? 0,
      open: t?.open_count ?? 0,
      awarded: t?.awarded_count ?? 0,
    }
  } catch (err) {
    setupError = String(err)
  }

  /*
   * An empty list is ambiguous on its own: it could mean nothing matched, or
   * that nothing was ever fetched. These two numbers separate them, and they
   * are the first thing to reach for when the dashboard looks wrong.
   */
  const tenderRun = runs.find((r) => r.source === 'contracts_finder:tender')
  const tendersScanned = Number(tenderRun?.releases_seen) || 0

  const lastRun = runs[0]
  const lastOk = runs.find((r) => r.ok === 1)
  /* A monitor that has silently stopped is the main failure mode, so say so loudly. */
  const stale =
    !lastOk || Date.now() - new Date(lastOk.started_at).getTime() > 36 * 3600 * 1000

  const statusLine = setupError
    ? 'Database not ready'
    : !lastRun
      ? 'Never run'
      : stale
        ? 'Stale — last success over 36 hours ago'
        : 'Healthy'

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Contract monitor — Hornet Drones</title>
<style>
  :root{
    --void:#000; --ink:#0B0C10; --panel:#16181D; --line:rgba(255,255,255,.10);
    --line2:rgba(255,255,255,.22); --fg:#fff; --silver:#A8ADB8; --slate:#6B7280;
    --warn:#F5C451; --bad:#F07A7A; --good:#7ED9A7;
    --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
    --sans:Inter,system-ui,-apple-system,sans-serif;
    color-scheme:dark;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--void);color:var(--fg);font-family:var(--sans);font-size:15px;line-height:1.5;
       padding:0 16px env(safe-area-inset-bottom,0) 16px}
  .wrap{max-width:1200px;margin:0 auto;padding-block:40px 80px}
  a{color:inherit}
  h1{font-size:clamp(26px,4vw,40px);letter-spacing:-.025em;line-height:1.05;font-weight:700}
  h2{font-size:20px;letter-spacing:-.01em;margin-bottom:14px;font-weight:700}
  .eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--silver)}
  .sub{color:var(--silver);margin-top:10px;max-width:70ch}
  section{margin-top:44px}

  .status{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:20px;
          font-family:var(--mono);font-size:12px;letter-spacing:.06em}
  .chip{border:1px solid var(--line2);border-radius:999px;padding:6px 14px;white-space:nowrap}
  .chip.good{border-color:rgba(126,217,167,.5);color:var(--good)}
  .chip.bad{border-color:rgba(240,122,122,.5);color:var(--bad)}
  .chip.warn{border-color:rgba(245,196,81,.5);color:var(--warn)}

  .tiles{display:flex;flex-wrap:wrap;gap:0;margin-top:26px;border:1px solid var(--line);
    border-radius:14px;background:var(--ink);overflow:hidden}
  .tile{flex:1 1 150px;padding:16px 20px;border-right:1px solid var(--line)}
  .tile:last-child{border-right:0}
  .tile .v{font-family:var(--mono);font-size:26px;font-variant-numeric:tabular-nums;line-height:1}
  .tile .l{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;
    color:var(--slate);margin-top:8px}

  .rows{display:flex;flex-direction:column;gap:8px}

  /* A live opportunity. The score anchors the row; everything else supports it. */
  .row{border:1px solid var(--line);border-radius:12px;background:var(--ink);padding:16px 20px;
    display:grid;grid-template-columns:56px 1fr auto;gap:20px;align-items:center}
  .row:hover{border-color:var(--line2)}

  .sc{font-family:var(--mono);font-size:21px;font-variant-numeric:tabular-nums;text-align:center;
    border:1px solid var(--line2);border-radius:9px;padding:9px 0;color:var(--silver)}
  .sc.mid{color:var(--fg);border-color:var(--fg)}
  .sc.hi{background:#fff;color:#000;border-color:#fff;font-weight:600}

  .row h3{font-size:15.5px;font-weight:600;line-height:1.35}
  .row h3 a{text-decoration:none}
  .row h3 a:hover{text-decoration:underline}
  .meta{font-family:var(--mono);font-size:11px;color:var(--slate);margin-top:7px;
    display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center}
  .meta .stage{text-transform:uppercase;letter-spacing:.16em;font-size:9.5px;color:var(--silver);
    border:1px solid var(--line);border-radius:4px;padding:2px 6px}
  .why{margin-top:9px;display:flex;flex-wrap:wrap;gap:5px}
  .why span{font-size:11px;color:var(--slate);border:1px solid var(--line);border-radius:999px;
    padding:2px 9px;white-space:nowrap}
  .why span.block{color:var(--warn);border-color:rgba(245,196,81,.35)}

  .right{text-align:right;font-family:var(--mono);white-space:nowrap}
  .right .val{font-size:17px;font-variant-numeric:tabular-nums}
  .right .when{font-size:11.5px;color:var(--slate);margin-top:5px}
  .right .when.urgent{color:var(--warn)}

  /* Already-awarded work is reference, not opportunity: one clear tempo quieter. */
  .past .row{padding:12px 20px;background:transparent;grid-template-columns:1fr auto}
  .past .row h3{font-size:14px;font-weight:500;color:var(--silver)}
  .past .row .right .val{font-size:14px;color:var(--silver)}

  .count{font-family:var(--mono);font-size:12px;color:var(--slate);letter-spacing:.1em;
    margin-left:10px;font-weight:400}
  .stage{text-transform:uppercase;letter-spacing:.16em;font-size:10px}

  table{width:100%;border-collapse:collapse;font-size:14px}
  th{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--silver);
     text-align:left;padding:0 14px 12px 0;border-bottom:1px solid var(--line2)}
  td{padding:13px 14px 13px 0;border-bottom:1px solid var(--line);vertical-align:top}
  td.n{font-family:var(--mono);font-variant-numeric:tabular-nums;white-space:nowrap}

  form.filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}
  input,select,button{font:inherit;background:var(--panel);color:var(--fg);
    border:1px solid var(--line2);border-radius:10px;padding:9px 13px}
  button{cursor:pointer;background:#fff;color:#000;border-color:#fff;font-weight:600}
  button:hover{opacity:.88}
  .empty{border:1px dashed var(--line2);border-radius:14px;padding:28px;color:var(--silver);text-align:center}
  code{font-family:var(--mono);font-size:12.5px;background:var(--panel);padding:2px 6px;border-radius:5px}
  .note{border-left:2px solid var(--line2);padding-left:16px;color:var(--silver);font-size:13.5px;margin-top:14px}
  button.refresh{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;
    padding:6px 14px;border-radius:999px}
  .banner{margin-top:18px;border:1px solid var(--line2);border-radius:12px;background:var(--ink);
    padding:14px 18px;font-size:14px;color:var(--silver)}
  .banner a{color:var(--fg)}
  @media(max-width:700px){
    .row{grid-template-columns:52px 1fr;gap:14px}
    .right{grid-column:1/-1;text-align:left;margin-top:6px}
  }
</style>
</head>
<body><div class="wrap">

<p class="eyebrow">Hornet Drones · internal</p>
<h1>Drone contract monitor</h1>
<p class="sub">UK public procurement notices mentioning unmanned aircraft, scored for whether a
small supplier could realistically bid, plus the award history of who actually wins this work.</p>

<div class="status">
  <span class="chip ${setupError ? 'bad' : stale ? 'warn' : 'good'}">${esc(statusLine)}</span>
  ${lastRun ? `<span class="chip">last run ${esc(day(lastRun.started_at))}</span>` : ''}
  ${lastOk ? `<span class="chip">last success ${esc(day(lastOk.started_at))}</span>` : ''}
  <span class="chip">sources: Contracts Finder · Find a Tender</span>
  <form method="post" action="/refresh" style="display:inline">
    <button type="submit" class="refresh">Refresh now</button>
  </form>
</div>

${
  refreshing
    ? `<div class="banner">Fetching from both sources now. It takes a minute or two —
       <a href="/">reload this page</a> when you are ready to see the result.</div>`
    : ''
}

${
  setupError
    ? `<section><div class="empty" style="text-align:left">
        <strong>The database is not ready.</strong>
        <p class="note">${esc(setupError)}</p>
        <p class="note">Apply the schema, then trigger the first run:<br>
        <code>npx wrangler d1 execute hornet-contracts --remote --file=./schema.sql</code><br>
        <code>curl -X POST https://&lt;worker&gt;/api/ingest -H "Authorization: Bearer $DASH_TOKEN"</code></p>
      </div></section>`
    : ''
}

<div class="tiles">
  <div class="tile"><div class="v">${totals.all}</div><div class="l">Notices tracked</div></div>
  <div class="tile"><div class="v">${totals.open}</div><div class="l">Open or planned</div></div>
  <div class="tile"><div class="v">${totals.awarded}</div><div class="l">Already awarded</div></div>
  <div class="tile"><div class="v">${suppliers.length}</div><div class="l">Suppliers seen winning</div></div>
</div>

${(() => {
  /*
   * Two lists, not one. A tender you can still bid and an award somebody else
   * already won are different kinds of thing, and the old single list made
   * them look identical — the one distinction that actually decides whether
   * you act on a row.
   */
  const now = Date.now()
  const isLive = (c) => {
    if (c.stage !== 'tender' && c.stage !== 'planning') return false
    if (!c.deadline_at) return true
    const d = new Date(c.deadline_at).getTime()
    return Number.isNaN(d) || d >= now
  }
  const live = contracts.filter(isLive)
  const past = contracts.filter((c) => !isLive(c))

  const row = (c, compact) => {
    const cl = closes(c.deadline_at)
    let reasons = []
    try {
      reasons = JSON.parse(c.fit_reasons || '[]')
    } catch {
      reasons = []
    }
    const score = Number(c.fit_score) || 0
    const tier = score >= 75 ? 'hi' : score >= 55 ? 'mid' : ''
    const blocking = /^(deadline passed|already awarded|over £|very low value)/i
    const title = esc(c.title) || '(untitled notice)'
    const link = c.url
      ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${title}</a>`
      : title

    return `<article class="row">
      ${compact ? '' : `<div class="sc ${tier}">${score}</div>`}
      <div>
        <h3>${link}</h3>
        <div class="meta">
          <span class="stage">${esc(c.stage)}</span>
          <span>${esc(c.buyer_name) || 'buyer unknown'}</span>
          <span>${esc(day(c.published_at))}</span>
          <span>${esc(c.source === 'find_a_tender' ? 'Find a Tender' : 'Contracts Finder')}</span>
        </div>
        ${
          compact
            ? ''
            : `<div class="why">${reasons
                .slice(0, 3)
                .map((r) => `<span class="${blocking.test(r) ? 'block' : ''}">${esc(r)}</span>`)
                .join('')}</div>`
        }
      </div>
      <div class="right">
        <div class="val">${esc(money(c.value_amount, c.value_currency))}</div>
        <div class="when ${cl.urgent ? 'urgent' : ''}">${esc(cl.text)}</div>
      </div>
    </article>`
  }

  const filters = `<form class="filters" method="get" action="/">
    <input type="search" name="q" placeholder="Search title or buyer" value="${esc(q)}">
    <select name="stage">
      ${[
        ['all', 'All stages'],
        ['tender', 'Open tenders'],
        ['planning', 'Early notices'],
        ['award', 'Awarded'],
        ['contract', 'Contracts'],
      ]
        .map(([v, l]) => `<option value="${v}"${stage === v ? ' selected' : ''}>${l}</option>`)
        .join('')}
    </select>
    <button type="submit">Filter</button>
    ${filtered ? '<a class="chip" href="/" style="align-self:center">clear</a>' : ''}
  </form>`

  if (contracts.length === 0) {
    return `<section>
      <h2>Opportunities</h2>
      ${filters}
      <div class="empty">
        ${
          filtered
            ? `Nothing matches that filter. <a href="/">Show everything</a>.`
            : tendersScanned > 0
              ? `<strong>Nothing drone-related in the window.</strong><br>
                 <span class="note" style="border:0;padding:0;display:block;margin-top:8px">
                 The last run read <strong>${tendersScanned}</strong> tender notices — every open tender
                 published across UK public procurement in that period — and none were drone work.
                 UK public bodies put out only a handful of drone tenders a year, so an empty list
                 here is normal rather than broken.</span>`
              : `<strong>Nothing fetched yet.</strong><br>
                 <span class="note" style="border:0;padding:0;display:block;margin-top:8px">
                 Press <strong>Refresh now</strong> above and reload in a minute. It also fills
                 itself every six hours without being asked.</span>`
        }
      </div>
    </section>`
  }

  return `<section>
    <h2>Open to bid${live.length ? `<span class="count">${live.length}</span>` : ''}</h2>
    ${filters}
    ${
      live.length
        ? `<div class="rows">${live.map((c) => row(c, false)).join('')}</div>
           <p class="note">Scored 0–100 for whether a small supplier could realistically bid: drone
           procurement codes, explicit mentions of unmanned aircraft, an open deadline, a contract size
           you could deliver. Closed deadlines and prime-only sizes cost points. The rules are in
           <code>src/score.js</code>, and the reasons behind each score sit under its title.</p>`
        : `<div class="empty"><strong>Nothing open to bid right now.</strong><br>
           <span class="note" style="border:0;padding:0;display:block;margin-top:8px">
           ${
             tendersScanned > 0
               ? `The last run read <strong>${tendersScanned}</strong> tender notices across all of UK
                  public procurement and none of the drone work in them is still open. `
               : ''
           }The closed and awarded work below still tells you who wins these contracts and for how
           much.</span></div>`
    }
  </section>

  ${
    past.length
      ? `<section class="past">
          <h2>Closed and awarded<span class="count">${past.length}</span></h2>
          <p class="note" style="margin-bottom:16px">Not biddable — kept because it shows what gets
          bought, by whom, and for how much.</p>
          <div class="rows">${past.map((c) => row(c, true)).join('')}</div>
        </section>`
      : ''
  }`
})()}

<section>
  <h2>Who wins this work</h2>
  ${
    suppliers.length === 0
      ? `<div class="empty">No award notices ingested yet.</div>`
      : `<table>
          <thead><tr><th>Supplier</th><th>Awards</th><th>Total value</th><th>Last award</th><th>Buyers</th></tr></thead>
          <tbody>${suppliers
            .map((s) => {
              let buyers = []
              try {
                buyers = JSON.parse(s.buyers || '[]')
              } catch {
                buyers = []
              }
              return `<tr>
                <td>${esc(s.name)}</td>
                <td class="n">${Number(s.award_count) || 0}</td>
                <td class="n">${esc(money(s.total_value, s.currency))}</td>
                <td class="n">${esc(day(s.last_award_at))}</td>
                <td>${esc(buyers.slice(0, 3).join(', '))}${buyers.length > 3 ? ` +${buyers.length - 3}` : ''}</td>
              </tr>`
            })
            .join('')}</tbody>
        </table>`
  }
  <p class="note">Built only from published award notices: these are companies that have actually won
  UK drone contracts, with the buyer and the value as recorded. It is not a list of companies judged
  suitable for anything — that would be an opinion dressed as data. Read it as the competitive field,
  and as a list of potential primes to subcontract under.</p>
</section>

<section>
  <h2>Ingest log</h2>
  ${
    runs.length === 0
      ? `<div class="empty">No runs recorded.</div>`
      : `<table>
          <thead><tr><th>Started</th><th>Source</th><th>Result</th><th>Pages</th><th>Seen</th><th>Kept</th><th>Awards</th></tr></thead>
          <tbody>${runs
            .map(
              (r) => `<tr>
                <td class="n">${esc(new Date(r.started_at).toLocaleString('en-GB'))}</td>
                <td>${esc(r.source)}</td>
                <td class="${r.ok ? '' : 'urgent'}">${r.ok ? 'ok' : esc(String(r.error || 'failed').slice(0, 120))}</td>
                <td class="n">${r.pages_fetched ?? 0}</td>
                <td class="n">${r.releases_seen ?? 0}</td>
                <td class="n">${r.contracts_upserted ?? 0}</td>
                <td class="n">${r.awards_upserted ?? 0}</td>
              </tr>`,
            )
            .join('')}</tbody>
        </table>`
  }
  <p class="note">"Seen" is every notice the API returned; "kept" is the ones that are drone work.
  A run that sees thousands and keeps none has probably hit an API change rather than a quiet week —
  check <code>/api/selftest</code>, which fetches one page from each source and reports its shape.</p>
</section>

</div></body></html>`
}
