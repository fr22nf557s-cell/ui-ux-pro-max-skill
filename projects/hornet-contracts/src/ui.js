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
      db.prepare(`SELECT * FROM ingest_runs ORDER BY started_at DESC LIMIT 6`).all(),
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

  .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:22px}
  .tile{border:1px solid var(--line);border-radius:14px;background:var(--ink);padding:18px 20px}
  .tile .v{font-family:var(--mono);font-size:30px;font-variant-numeric:tabular-nums;line-height:1}
  .tile .l{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--silver);margin-top:10px}

  .rows{display:flex;flex-direction:column;gap:10px}
  .row{border:1px solid var(--line);border-radius:14px;background:var(--ink);padding:18px 20px;
       display:grid;grid-template-columns:64px 1fr auto;gap:18px;align-items:start}
  .sc{font-family:var(--mono);font-size:24px;font-variant-numeric:tabular-nums;text-align:center;
      border:1px solid var(--line2);border-radius:10px;padding:8px 0}
  .sc.hi{background:#fff;color:#000;border-color:#fff}
  .row h3{font-size:16px;font-weight:600;line-height:1.35}
  .meta{font-family:var(--mono);font-size:11.5px;color:var(--silver);margin-top:8px;
        display:flex;flex-wrap:wrap;gap:6px 14px}
  .why{margin-top:10px;font-size:13px;color:var(--silver)}
  .why span{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:3px 10px;margin:3px 4px 0 0}
  .right{text-align:right;font-family:var(--mono);font-size:13px;white-space:nowrap}
  .right .val{font-size:17px}
  .urgent{color:var(--warn)}
  .gone{color:var(--slate);text-decoration:line-through}
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
</div>

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

<section>
  <h2>Opportunities, best fit first</h2>
  <form class="filters" method="get" action="/">
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
  </form>

  ${
    contracts.length === 0
      ? filtered
        ? `<div class="empty">No notices match that filter. <a href="/">Show everything</a>.</div>`
        : `<div class="empty">Nothing ingested yet. The cron runs every six hours, or trigger it now with
           <code>POST /api/ingest</code>.</div>`
      : `<div class="rows">${contracts
          .map((c) => {
            const cl = closes(c.deadline_at)
            let reasons = []
            try {
              reasons = JSON.parse(c.fit_reasons || '[]')
            } catch {
              reasons = []
            }
            return `<article class="row">
              <div class="sc ${c.fit_score >= 60 ? 'hi' : ''}">${Number(c.fit_score) || 0}</div>
              <div>
                <h3><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title) || '(untitled notice)'}</a></h3>
                <div class="meta">
                  <span>${esc(c.buyer_name) || 'buyer unknown'}</span>
                  <span class="stage">${esc(c.stage)}</span>
                  <span>published ${esc(day(c.published_at))}</span>
                  <span>${esc(c.source === 'find_a_tender' ? 'Find a Tender' : 'Contracts Finder')}</span>
                </div>
                <div class="why">${reasons.slice(0, 4).map((r) => `<span>${esc(r)}</span>`).join('')}</div>
              </div>
              <div class="right">
                <div class="val">${esc(money(c.value_amount, c.value_currency))}</div>
                <div class="${cl.urgent ? 'urgent' : cl.gone ? 'gone' : ''}">${esc(cl.text)}</div>
              </div>
            </article>`
          })
          .join('')}</div>`
  }
  <p class="note">The score is a rule of thumb, not a judgement. It rewards drone procurement codes,
  explicit mentions of unmanned aircraft, an open deadline and a contract size a small supplier could
  deliver; it penalises closed deadlines and contracts large enough to be prime-only. Every rule lives
  in <code>src/score.js</code> and the reasons behind each score are shown above.</p>
</section>

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
