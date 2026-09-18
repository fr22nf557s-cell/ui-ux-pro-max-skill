/* ==========================================================================
   NORVEX GAMING — product manager (manage.html)
   --------------------------------------------------------------------------
   Reads the live catalogue from GitHub, lets the shop owner change prices and
   stock, add products with a photo and remove products, then publishes the
   result as one commit on the deploy branch. The site rebuilds itself.
   Needs a fine-grained GitHub token (Contents: read & write on the one repo),
   kept in this browser's localStorage only. Pending changes are also kept in
   localStorage so a refresh or a reload of the catalogue never loses them.
   ========================================================================== */
(() => {
  'use strict';
  const REPO = { owner: 'fr22nf557s-cell', repo: 'ui-ux-pro-max-skill', branch: 'claude/norvex-gaming-ecommerce-5x8luq', base: 'projects/norvex-gaming' };
  const LS = { token: 'norvex.manage.token.v1', pending: 'norvex.manage.pending.v1', repo: 'norvex.manage.repo.v1' };
  const API = window.NORVEX_GITHUB_API || 'https://api.github.com';
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
  const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const emptyPending = () => ({ edits: {}, added: {}, removed: [], images: {} });

  const state = {
    token: localStorage.getItem(LS.token) || '',
    repo: { ...REPO, ...load(LS.repo, {}) },
    base: null,                 // { header, config, games, types, products, sha }
    pending: load(LS.pending, emptyPending()),
    filter: { q: '', game: '', type: '', stock: '' },
  };

  /* ------------------------------------------------------------ GitHub */
  async function gh(path, opts = {}) {
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    if (opts.body) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${API}${path}`, { ...opts, headers });
    if (!res.ok) { let msg = `GitHub said ${res.status}`; try { const j = await res.json(); if (j.message) msg += `: ${j.message}`; } catch {} throw new Error(msg); }
    return res.status === 204 ? null : res.json();
  }
  const R = () => `/repos/${state.repo.owner}/${state.repo.repo}`;
  const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

  async function loadBase() {
    let src, sha = null;
    if (state.token) {
      const f = await gh(`${R()}/contents/${state.repo.base}/assets/js/catalog.js?ref=${encodeURIComponent(state.repo.branch)}`);
      src = b64decode(f.content); sha = f.sha;
    } else {
      src = await (await fetch(`assets/js/catalog.js?ts=${Date.now()}`)).text();
    }
    const sandbox = {}; new Function('window', src)(sandbox);
    const D = sandbox.NORVEX_DATA; if (!D) throw new Error('The catalogue file could not be read');
    const at = src.search(/^window\.NORVEX_DATA\s*=/m);
    state.base = { header: at >= 0 ? src.slice(0, at) : '', config: D.config, games: D.games, types: D.types, products: D.products, sha };
  }

  function serialize(products) {
    const ind = (v) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');
    const { header, config, games, types } = state.base;
    return `${header}window.NORVEX_DATA = {\n  config: ${ind(config)},\n\n  games: ${ind(games)},\n\n  types: ${ind(types)},\n\n  products: ${ind(products)}\n};\n`;
  }

  /* ------------------------------------------------------- the products */
  const baseById = () => Object.fromEntries(state.base.products.map((p) => [p.id, p]));
  function current() {
    const removed = new Set(state.pending.removed);
    const out = state.base.products.map((p) => (state.pending.edits[p.id] ? { ...p, ...state.pending.edits[p.id] } : p)).filter((p) => !removed.has(p.id));
    for (const p of Object.values(state.pending.added)) out.push(p);
    return out;
  }
  const statusOf = (id) => state.pending.added[id] ? 'new' : state.pending.removed.includes(id) ? 'removed' : state.pending.edits[id] ? 'edited' : '';
  function persist() { if (!save(LS.pending, state.pending)) toast('Could not save your pending changes in this browser (storage full). Publish soon.'); }

  function setFields(id, fields) {
    if (state.pending.added[id]) { Object.assign(state.pending.added[id], fields); persist(); return; }
    const base = baseById()[id]; if (!base) return;
    const edits = { ...(state.pending.edits[id] || {}), ...fields };
    for (const k of Object.keys(edits)) if (JSON.stringify(edits[k]) === JSON.stringify(base[k]) && !(k === 'image' && state.pending.images[id])) delete edits[k];
    if (Object.keys(edits).length) state.pending.edits[id] = edits; else delete state.pending.edits[id];
    persist();
  }
  function removeProduct(id) {
    if (state.pending.added[id]) { delete state.pending.added[id]; delete state.pending.images[id]; }
    else if (!state.pending.removed.includes(id)) state.pending.removed.push(id);
    persist();
  }
  function restoreProduct(id) { state.pending.removed = state.pending.removed.filter((x) => x !== id); persist(); }
  function uniqueId(game, name) {
    const taken = new Set(current().map((p) => p.id)); let id = `${game}-${slug(name)}`.replace(/-+/g, '-'); let n = 2; const root = id;
    while (taken.has(id)) id = `${root}-${n++}`;
    return id;
  }

  function validate(products) {
    const problems = []; const seen = new Set();
    for (const p of products) {
      const w = p.name || p.id;
      if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) problems.push(`${w}: bad id`);
      if (seen.has(p.id)) problems.push(`${w}: duplicate id`); seen.add(p.id);
      if (!p.name || !p.name.trim()) problems.push(`${p.id}: needs a name`);
      if (!state.base.games[p.game]) problems.push(`${w}: unknown game`);
      if (!state.base.types[p.type]) problems.push(`${w}: unknown type`);
      if (!(Number(p.price) > 0)) problems.push(`${w}: price must be above £0`);
      if (p.compareAt != null && !(Number(p.compareAt) > Number(p.price))) problems.push(`${w}: "was" price must be higher than the price, or empty`);
      if (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0) problems.push(`${w}: stock must be a whole number`);
      if (!p.image) problems.push(`${w}: needs a photo`);
    }
    return problems;
  }

  /* ------------------------------------------------------------ images */
  async function processImage(file) {
    const bitmap = await createImageBitmap(file);
    const MAX = 1200; const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const c = document.createElement('canvas'); c.width = Math.round(bitmap.width * scale); c.height = Math.round(bitmap.height * scale);
    const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bitmap, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/webp', 0.84);
    return { data: dataUrl.split(',')[1], dataUrl, w: c.width, h: c.height };
  }

  /* ------------------------------------------------------------ render */
  const toastEl = () => $('#mg-toast'); let toastTimer;
  function toast(msg) { const el = toastEl(); el.textContent = msg; el.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200); }

  function renderStatus() {
    const el = $('[data-status]'); const n = pendingCount();
    if (!state.token) el.innerHTML = 'Viewing the published catalogue. <b>Connect GitHub</b> below to make changes.';
    else el.innerHTML = `Connected to <b>${esc(state.repo.owner)}/${esc(state.repo.repo)}</b> · ${esc(state.repo.branch)}`;
    const pub = $('[data-publish]'); pub.disabled = !state.token || !n; pub.textContent = n ? `Publish ${n} change${n === 1 ? '' : 's'}` : 'Publish';
  }
  const pendingCount = () => Object.keys(state.pending.edits).length + Object.keys(state.pending.added).length + state.pending.removed.length;

  function renderTools() {
    const gameSel = $('[data-filter="game"]'); const typeSel = $('[data-filter="type"]');
    gameSel.innerHTML = '<option value="">All games</option>' + Object.entries(state.base.games).map(([k, g]) => `<option value="${esc(k)}">${esc(g.name)}</option>`).join('');
    typeSel.innerHTML = '<option value="">All types</option>' + Object.entries(state.base.types).map(([k, t]) => `<option value="${esc(k)}">${esc(t.name)}</option>`).join('');
    gameSel.value = state.filter.game; typeSel.value = state.filter.type;
  }

  function rowHtml(p) {
    const st = statusOf(p.id); const g = state.base.games[p.game] || {}; const t = state.base.types[p.type] || {};
    const img = state.pending.images[p.id] ? state.pending.images[p.id].dataUrl : p.image;
    const tags = [st === 'new' && '<span class="mg-tag mg-tag--new">New</span>', st === 'edited' && '<span class="mg-tag mg-tag--edited">Edited</span>', st === 'removed' && '<span class="mg-tag mg-tag--removed">Removed</span>', p.hidden && '<span class="mg-tag">Hidden</span>', !p.preorder && Number(p.stock) === 0 && '<span class="mg-tag mg-tag--out">Sold out</span>'].filter(Boolean).join('');
    const base = baseById()[p.id];
    const changed = (k) => base && JSON.stringify(base[k]) !== JSON.stringify(p[k]) ? ' is-changed' : '';
    return `<article class="mg-row${st ? ' is-' + st : ''}" data-id="${esc(p.id)}">
      <div class="mg-row__photo">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ''}</div>
      <div class="mg-row__name"><a href="product.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">${esc(p.name)}</a>${tags}</div>
      <div class="mg-row__meta">${esc(g.short || g.name || p.game)} · ${esc(t.singular || p.type)}${p.set ? ' · ' + esc(p.set) : ''}${p.preorder && p.releaseDate ? ' · releases ' + esc(p.releaseDate) : ''}</div>
      <div class="mg-row__fields">
        <label class="mg-num mg-num--price"><span>£</span><input class="input${changed('price')}" type="number" min="0.01" step="0.01" value="${esc(p.price)}" data-field="price" aria-label="Price" ${st === 'removed' ? 'disabled' : ''}></label>
        <label class="mg-num mg-num--stock"><input class="input${changed('stock')}" type="number" min="0" step="1" value="${esc(p.stock ?? 0)}" data-field="stock" aria-label="Stock" ${st === 'removed' ? 'disabled' : ''}></label>
        <label class="mg-check mg-row__pre"><input type="checkbox" data-field="preorder" ${p.preorder ? 'checked' : ''} ${st === 'removed' ? 'disabled' : ''}> Pre-order</label>
      </div>
      <div class="mg-row__actions">${st === 'removed' ? `<button class="btn btn--ghost btn--sm" type="button" data-restore>Undo remove</button>` : `<button class="btn btn--ghost btn--sm" type="button" data-edit>Edit</button><button class="btn btn--ghost btn--sm" type="button" data-remove aria-label="Remove ${esc(p.name)}">Remove</button>`}</div>
    </article>`;
  }

  function matches(p) {
    const f = state.filter; const st = statusOf(p.id);
    if (f.game && p.game !== f.game) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.stock === 'in' && !(Number(p.stock) > 0 && !p.preorder)) return false;
    if (f.stock === 'low' && !(Number(p.stock) <= 3 && !p.preorder)) return false;
    if (f.stock === 'out' && !(Number(p.stock) === 0 && !p.preorder)) return false;
    if (f.stock === 'pre' && !p.preorder) return false;
    if (f.stock === 'changed' && !st) return false;
    if (f.q) { const q = f.q.toLowerCase(); if (!`${p.name} ${p.set || ''} ${p.id}`.toLowerCase().includes(q)) return false; }
    return true;
  }

  function renderList() {
    const removedSet = new Set(state.pending.removed);
    const all = [...current(), ...state.base.products.filter((p) => removedSet.has(p.id))];
    const list = all.filter(matches);
    $('[data-list]').innerHTML = list.length ? list.map(rowHtml).join('') : '<div class="mg-empty">No products match.</div>';
    const filtered = Boolean(state.filter.q || state.filter.game || state.filter.type || state.filter.stock);
    $('[data-count]').textContent = `${current().length} products${filtered ? ` · ${list.length} shown` : ''}`;
    const n = pendingCount(); const pend = $('[data-pending]'); pend.hidden = !n;
    if (n) $('[data-pending-text]').textContent = [Object.keys(state.pending.edits).length && `${Object.keys(state.pending.edits).length} edited`, Object.keys(state.pending.added).length && `${Object.keys(state.pending.added).length} new`, state.pending.removed.length && `${state.pending.removed.length} removed`].filter(Boolean).join(', ') + ' · not published yet';
    renderStatus();
  }
  function render() { renderTools(); renderList(); }

  /* ------------------------------------------------------------ editor */
  const editor = () => $('[data-editor]'); let editing = null; let editingImage = null;
  function openEditor(id) {
    const form = $('[data-editor-form]'); form.reset(); editingImage = null; $('[data-editor-error]').classList.remove('is-visible');
    $('[name="game"]', form).innerHTML = Object.entries(state.base.games).map(([k, g]) => `<option value="${esc(k)}">${esc(g.name)}</option>`).join('');
    $('[name="type"]', form).innerHTML = Object.entries(state.base.types).map(([k, t]) => `<option value="${esc(k)}">${esc(t.name)}</option>`).join('');
    const p = id ? current().find((x) => x.id === id) : null; editing = id || null;
    $('[data-editor-title]').textContent = p ? 'Edit product' : 'Add a product';
    $('[data-editor-remove]').hidden = !p;
    $('[data-editor-id]').textContent = p ? `Product link: product.html?id=${p.id}` : 'The product link is made from the game and the name.';
    const v = p || { name: '', game: 'pokemon', type: 'etb', set: '', price: '', compareAt: null, stock: 0, preorder: false, featured: false, hidden: false, freeShipping: false, description: '', contents: [], specs: {} };
    for (const k of ['name', 'game', 'type', 'set', 'price', 'stock', 'description']) form.elements[k].value = v[k] ?? '';
    form.elements.releaseDate.value = v.releaseDate || ''; form.elements.badge.value = v.badge || '';
    form.elements.compareAt.value = v.compareAt ?? '';
    for (const k of ['preorder', 'featured', 'hidden', 'freeShipping']) form.elements[k].checked = Boolean(v[k]);
    form.elements.contents.value = (v.contents || []).join('\n');
    form.elements.specs.value = Object.entries(v.specs || {}).map(([k, val]) => `${k}: ${val}`).join('\n');
    const prev = $('[data-photo-preview]'); const img = p && (state.pending.images[p.id] ? state.pending.images[p.id].dataUrl : p.image);
    prev.innerHTML = img ? `<img src="${esc(img)}" alt="">` : '';
    editor().showModal(); form.elements.name.focus();
  }
  function saveEditor(e) {
    e.preventDefault(); const form = $('[data-editor-form]'); const f = form.elements;
    const name = f.name.value.trim(); const game = f.game.value; const type = f.type.value;
    const fields = {
      name, game, type, set: f.set.value.trim(), price: Math.round(Number(f.price.value) * 100) / 100, compareAt: f.compareAt.value === '' ? null : Math.round(Number(f.compareAt.value) * 100) / 100,
      stock: Math.floor(Number(f.stock.value)), preorder: f.preorder.checked, featured: f.featured.checked, hidden: f.hidden.checked, freeShipping: f.freeShipping.checked,
      releaseDate: f.releaseDate.value || null, badge: f.badge.value || null, manual: true,
      description: f.description.value.trim(), contents: f.contents.value.split('\n').map((s) => s.trim()).filter(Boolean),
      specs: Object.fromEntries(f.specs.value.split('\n').map((s) => s.trim()).filter(Boolean).map((line) => { const i = line.indexOf(':'); return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : [line, '']; })),
    };
    if (!fields.description) fields.description = type === 'accessory' ? `${name}. Official product, brand new.` : `Factory-sealed ${name}. Sourced from official distributors, checked for intact seals and shipped tracked and insured.`;
    let id = editing;
    if (!id) { id = uniqueId(game, name); state.pending.added[id] = { id, badge: null, rating: null, reviews: 0, image: '' }; }
    if (editingImage) { state.pending.images[id] = editingImage; fields.image = `assets/img/products/${id}.webp`; }
    const draft = { ...(current().find((x) => x.id === id) || state.pending.added[id]), ...fields, id };
    const problems = validate([draft]);
    if (problems.length) { const err = $('[data-editor-error]'); err.textContent = problems.join(' · '); err.classList.add('is-visible'); if (!editing) { delete state.pending.added[id]; delete state.pending.images[id]; } return; }
    setFields(id, fields); editor().close(); renderList(); toast(editing ? 'Saved. Publish when you are ready.' : 'Added. Publish when you are ready.');
  }
  async function pickPhoto(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try { editingImage = await processImage(file); $('[data-photo-preview]').innerHTML = `<img src="${editingImage.dataUrl}" alt="">`; }
    catch { toast('That image could not be read. Try a JPG, PNG or WebP.'); }
  }

  /* ------------------------------------------------------------ publish */
  function openPublish() {
    const dlg = $('[data-publish-dialog]'); const body = $('[data-publish-body]'); const btn = $('[data-publish-confirm]');
    const products = current(); const problems = validate(products);
    const changes = [
      ...Object.keys(state.pending.added).map((id) => `Add ${state.pending.added[id].name}`),
      ...Object.entries(state.pending.edits).map(([id, e]) => { const p = baseById()[id]; return `${p ? p.name : id}: ${Object.keys(e).map((k) => k === 'price' ? `price ${money.format(p.price)} → ${money.format(e.price)}` : k === 'stock' ? `stock ${p.stock} → ${e.stock}` : k === 'image' ? 'new photo' : k).join(', ')}`; }),
      ...state.pending.removed.map((id) => `Remove ${(baseById()[id] || { name: id }).name}`),
    ];
    $('[data-publish-title]').textContent = problems.length ? 'Fix these before publishing' : 'Publish changes';
    body.innerHTML = problems.length ? `<ul>${problems.map((p) => `<li class="is-problem">${esc(p)}</li>`).join('')}</ul>` : `<p class="muted">These changes go live on the site within about two minutes of publishing.</p><ul>${changes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    btn.hidden = Boolean(problems.length); btn.disabled = false; dlg.showModal();
  }
  async function publish() {
    const body = $('[data-publish-body]'); const btn = $('[data-publish-confirm]'); btn.disabled = true;
    const log = document.createElement('div'); log.className = 'mg-log'; body.innerHTML = ''; body.appendChild(log);
    const say = (m, cls = '') => { const d = document.createElement('div'); d.className = cls; d.textContent = m; log.appendChild(d); };
    try {
      say('Checking the repository…');
      const ref = await gh(`${R()}/git/ref/heads/${encodeURIComponent(state.repo.branch)}`); const headSha = ref.object.sha;
      const head = await gh(`${R()}/git/commits/${headSha}`);
      const cur = await gh(`${R()}/contents/${state.repo.base}/assets/js/catalog.js?ref=${encodeURIComponent(state.repo.branch)}`);
      if (cur.sha !== state.base.sha) { say('The catalogue changed since you loaded it; applying your changes on top of the latest version.'); await loadBase(); }
      const products = current(); const problems = validate(products); if (problems.length) throw new Error(problems.join(' · '));
      const tree = [];
      say('Uploading the catalogue…');
      const cat = await gh(`${R()}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: serialize(products), encoding: 'utf-8' }) });
      tree.push({ path: `${state.repo.base}/assets/js/catalog.js`, mode: '100644', type: 'blob', sha: cat.sha });
      for (const [id, img] of Object.entries(state.pending.images)) {
        if (!products.find((p) => p.id === id)) continue;
        say(`Uploading photo for ${id}…`);
        const blob = await gh(`${R()}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: img.data, encoding: 'base64' }) });
        tree.push({ path: `${state.repo.base}/assets/img/products/${id}.webp`, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const used = new Set(products.map((p) => p.image)); const byId = baseById();
      for (const id of state.pending.removed) { const p = byId[id]; if (p && p.image && p.image.startsWith('assets/img/products/') && !used.has(p.image)) tree.push({ path: `${state.repo.base}/${p.image}`, mode: '100644', type: 'blob', sha: null }); }
      say('Creating the commit…');
      const newTree = await gh(`${R()}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
      const n = pendingCount();
      const commit = await gh(`${R()}/git/commits`, { method: 'POST', body: JSON.stringify({ message: `Products: ${n} change${n === 1 ? '' : 's'} from the product manager\n\n${summary().join('\n')}`, tree: newTree.sha, parents: [headSha] }) });
      await gh(`${R()}/git/refs/heads/${encodeURIComponent(state.repo.branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
      say(`Published as commit ${commit.sha.slice(0, 7)}. The site is rebuilding and will be live in about two minutes.`, 'ok');
      state.pending = emptyPending(); persist();
      await loadBase(); render();
      watchDeploy(commit.sha, say);
    } catch (e) { say(`Publishing failed: ${e.message}`, 'err'); say('Nothing was changed on the site. Your edits are still here; fix the problem and try again.'); btn.disabled = false; }
  }
  function summary() {
    return [...Object.keys(state.pending.added).map((id) => `add ${id}`), ...Object.keys(state.pending.edits).map((id) => `update ${id} (${Object.keys(state.pending.edits[id]).join(', ')})`), ...state.pending.removed.map((id) => `remove ${id}`)];
  }
  async function watchDeploy(sha, say) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      try {
        const runs = await gh(`${R()}/actions/runs?head_sha=${sha}&per_page=10`);
        const run = (runs.workflow_runs || []).find((r) => /deploy/i.test(r.name));
        if (run && run.status === 'completed') { say(run.conclusion === 'success' ? 'Deployed. The changes are live.' : `The deploy finished with "${run.conclusion}". Open the Actions tab on GitHub to see why.`, run.conclusion === 'success' ? 'ok' : 'err'); return; }
      } catch { /* keep waiting */ }
    }
    say('Still deploying after five minutes; check the Actions tab on GitHub.');
  }

  /* ------------------------------------------------------------ wiring */
  async function connect(e) {
    e.preventDefault(); const err = $('[data-connect-error]'); err.classList.remove('is-visible');
    const token = $('#mg-token').value.trim(); if (!token) return;
    const repo = { ...state.repo }; $$('[data-repo-field]').forEach((i) => { if (i.value.trim()) repo[i.dataset.repoField] = i.value.trim(); });
    const prevToken = state.token; state.token = token; state.repo = repo;
    try {
      await gh(`${R()}/branches/${encodeURIComponent(repo.branch)}`);
      localStorage.setItem(LS.token, token); save(LS.repo, repo);
      await loadBase(); $('[data-connect]').hidden = true; $('[data-tools]').hidden = false; render(); toast('Connected. Your changes will publish to the shop.');
    } catch (ex) { state.token = prevToken; err.textContent = `Could not connect: ${ex.message}. Check the token has Contents read & write on ${repo.owner}/${repo.repo}.`; err.classList.add('is-visible'); }
  }

  async function init() {
    $$('[data-repo-field]').forEach((i) => { i.value = state.repo[i.dataset.repoField] || ''; });
    $('[data-repo-name]').textContent = state.repo.repo;
    try { await loadBase(); } catch (e) { if (state.token) { localStorage.removeItem(LS.token); state.token = ''; toast(`Your saved token no longer works (${e.message}). Connect again.`); await loadBase(); } else throw e; }
    $('[data-connect]').hidden = Boolean(state.token); $('[data-tools]').hidden = false; render();

    $('[data-connect-form]').addEventListener('submit', connect);
    $('[data-reload]').addEventListener('click', async () => { await loadBase(); render(); toast('Catalogue reloaded. Your unpublished changes are kept.'); });
    $('[data-publish]').addEventListener('click', openPublish);
    $('[data-publish-confirm]').addEventListener('click', publish);
    $('[data-add]').addEventListener('click', () => openEditor(null));
    $('[data-discard]').addEventListener('click', () => { if (confirm('Discard every unpublished change?')) { state.pending = emptyPending(); persist(); renderList(); } });
    $$('[data-filter]').forEach((el) => el.addEventListener('input', () => { state.filter[el.dataset.filter] = el.value; renderList(); }));
    $('[data-editor-form]').addEventListener('submit', saveEditor);
    $('[data-photo-input]').addEventListener('change', pickPhoto);
    $('[data-editor-remove]').addEventListener('click', () => { if (editing) { removeProduct(editing); editor().close(); renderList(); } });
    $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    const list = $('[data-list]');
    list.addEventListener('change', (e) => {
      const row = e.target.closest('.mg-row'); if (!row) return; const id = row.dataset.id; const field = e.target.dataset.field; if (!field) return;
      const value = field === 'preorder' ? e.target.checked : field === 'stock' ? Math.max(0, Math.floor(Number(e.target.value) || 0)) : Math.round(Number(e.target.value) * 100) / 100;
      if (field === 'price' && !(value > 0)) { toast('Price must be above £0.'); e.target.value = current().find((p) => p.id === id).price; return; }
      setFields(id, { [field]: value, manual: true }); renderList();
    });
    list.addEventListener('click', (e) => {
      const row = e.target.closest('.mg-row'); if (!row) return; const id = row.dataset.id;
      if (e.target.closest('[data-edit]')) openEditor(id);
      else if (e.target.closest('[data-remove]')) { removeProduct(id); renderList(); toast('Marked for removal. Publish to make it final.'); }
      else if (e.target.closest('[data-restore]')) { restoreProduct(id); renderList(); }
    });
    window.addEventListener('beforeunload', (e) => { if (pendingCount() && !state.token) return; });
  }
  init().catch((e) => { $('[data-status]').textContent = `Could not load the catalogue: ${e.message}`; });
})();
