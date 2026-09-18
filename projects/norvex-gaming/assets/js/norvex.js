/* ==========================================================================
   NORVEX GAMING — storefront runtime (zero dependencies)
   Header/nav state, mobile menu, search palette, cart drawer (localStorage),
   product rendering, shop filters, product detail page, scroll reveals.
   ========================================================================== */
(function () {
  'use strict';

  const D = window.NORVEX_DATA;
  if (!D) return;
  const { config, games, types } = D;
  // a product marked hidden is reachable by its URL and can be bought, but never listed, searched or related
  const products = D.products.filter((p) => !p.hidden);
  document.documentElement.classList.remove('no-js');

  /* ------------------------------------------------------------ helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency });
  const fmt = (n) => money.format(n);
  const money0 = new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency, maximumFractionDigits: 0 });
  const fmt0 = (n) => (Number.isInteger(n) ? money0 : money).format(n);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = Object.fromEntries(D.products.map((p) => [p.id, p]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

  /* -------------------------------------------------------------- icons */
  const PATHS = {
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    refresh: '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    filter: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    badge: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>'
  };
  const icon = (name, cls = '') =>
    `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="${name === 'star' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;

  /* the menu shows the header's own brand, with any ids re-scoped so the copy stays valid markup */
  const brandHtml = () => {
    const el = $('.brand');
    return el ? el.outerHTML.replace(/id="([^"]+)"/g, (_, id) => `id="${id}-m"`).replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-m)`) : '';
  };

  const NAV = [
    { label: 'Shop all', href: 'shop.html' },
    { label: 'Pokémon', href: 'shop.html?game=pokemon' },
    { label: 'Magic: The Gathering', href: 'shop.html?game=magic' },
    { label: 'One Piece', href: 'shop.html?game=onepiece' },
    { label: 'Yu-Gi-Oh!', href: 'shop.html?game=yugioh' },
    { label: 'Disney Lorcana', href: 'shop.html?game=lorcana' },
    { label: 'Pre-orders', href: 'shop.html?avail=preorder' },
    ...(products.some((p) => p.type === 'single') ? [{ label: 'Graded vault', href: 'shop.html?type=single' }] : []),
    { label: 'Accessories', href: 'shop.html?type=accessory' }
  ];

  /* ---------------------------------------------------- product helpers */
  /* accessory brands get their own packaging palette; sleeve colour variants tint the art */
  const BRAND_PALETTES = {
    'dragon shield': { a: '#9f1239', b: '#1c1917', c: '#e11d48' },
    'ultra pro': { a: '#1d4ed8', b: '#0f172a', c: '#60a5fa' },
    'gamegenic': { a: '#0f766e', b: '#0b1a1a', c: '#2dd4bf' },
    'ultimate guard': { a: '#52525b', b: '#18181b', c: '#a1a1aa' }
  };
  const COLOUR_HEX = { black: '#3f3f46', red: '#b91c1c', blue: '#1d4ed8', white: '#d4d4d8', green: '#15803d', purple: '#6d28d9', pink: '#db2777', gold: '#d9b75b', silver: '#a1a1aa', onyx: '#3f3f46', 'jet black': '#27272a' };
  const gameOf = (p) => {
    const base = games[p.game] || games.norvex;
    const brand = p.brand && BRAND_PALETTES[p.brand.toLowerCase()];
    const colour = p.specs && p.specs.Colour && COLOUR_HEX[String(p.specs.Colour).toLowerCase()];
    if (!brand && !colour) return base;
    return Object.assign({}, base, brand || {}, colour ? { a: colour } : {});
  };
  const typeOf = (p) => types[p.type] || types.accessory;
  const availability = (p) =>
    p.preorder ? { key: 'pre', label: 'Pre-order' }
      : p.stock <= 0 ? { key: 'out', label: 'Sold out' }
        : p.stock <= 5 ? { key: 'low', label: `Only ${p.stock} left` }
          : { key: 'in', label: 'In stock' };
  const productHref = (p) => `product.html?id=${encodeURIComponent(p.id)}`;
  const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ALIASES = {
    game: { pokemon: 'pokemon pkmn ptcg', magic: 'mtg magic gathering', onepiece: 'one piece optcg', yugioh: 'yugioh ygo yu-gi-oh konami', lorcana: 'lorcana disney', swu: 'star wars unlimited swu', digimon: 'digimon bandai', dragonball: 'dragon ball dbs fusion world bandai' },
    type: { etb: 'etb elite trainer box', box: 'booster box display', bundle: 'bundle', pack: 'booster pack', deck: 'deck starter', collection: 'collection', accessory: 'accessory accessories' },
  };
  const haystack = (p) => fold(`${p.name} ${p.set} ${p.brand || ''} ${gameOf(p).name} ${typeOf(p).name} ${ALIASES.game[p.game] || ''} ${ALIASES.type[p.type] || ''} ${p.grade ? p.grade.grader + ' ' + p.grade.grade : ''}`);
  // every query word must start a word of the product (so "tin" finds tins, not "Destiny"; "case" finds cases, not "Showcase")
  const words = (s) => s.split(/[^a-z0-9]+/).filter(Boolean);
  const matches = (p, q) => { const ws = words(haystack(p)); return words(fold(q)).every((t) => ws.some((w) => w.startsWith(t))); };
  const soldOut = (p) => !p.preorder && !(p.stock > 0);
  const releaseText = (p) => { if (!p.releaseDate) return ''; const d = new Date(p.releaseDate + 'T00:00:00'); return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); };

  function badges(p) {
    const b = [];
    if (p.preorder) b.push('<span class="badge badge--gold">Pre-order</span>');
    if (p.badge === 'new') b.push('<span class="badge badge--new">New</span>');
    if (p.badge === 'hot') b.push('<span class="badge badge--hot">Hot</span>');
    if (!p.preorder && p.stock > 0 && p.stock <= 5) b.push('<span class="badge">Low stock</span>');
    if (p.type === 'single') b.push('<span class="badge badge--holo">Graded</span>');
    if (p.compareAt && p.compareAt > p.price) b.push(`<span class="badge">Save ${Math.round((1 - p.price / p.compareAt) * 100)}%</span>`);
    return b.join('');
  }

  /* Packaging art. The CSS mock always renders; a product photo (p.image) is layered on top and
     fades in when it loads. If the photo fails, it is removed and the mock stays. */
  /* Packaging art. A product with a photo shows only the photo, on a background sampled from the
     photo's own edges (white when the photo is transparent or has no dominant edge colour). The
     CSS mock is used for products without a photo, and swapped in if a photo fails to load. */
  function art(p, opts = {}) {
    if (!p.image) return artMock(p);
    return `<figure class="photo"><img class="photo__img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="${opts.eager ? 'eager' : 'lazy'}"${opts.eager ? ' fetchpriority="high"' : ''} decoding="async" width="800" height="1000" data-art-fallback="${esc(p.id)}"></figure>`;
  }
  /* Dominant colour along the photo's edges: the background the packshot was shot on. */
  function photoBackground(img) {
    try {
      const s = 48; const c = document.createElement('canvas'); c.width = s; c.height = s;
      const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, s, s);
      const d = ctx.getImageData(0, 0, s, s).data; const buckets = new Map(); let clear = 0; let n = 0;
      const px = (x, y) => {
        const i = (y * s + x) * 4; n++;
        if (d[i + 3] < 40) { clear++; return; }
        const k = `${d[i] >> 4}-${d[i + 1] >> 4}-${d[i + 2] >> 4}`;
        const b = buckets.get(k) || [0, 0, 0, 0]; b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++; buckets.set(k, b);
      };
      for (let x = 0; x < s; x++) { px(x, 0); px(x, s - 1); }
      for (let y = 1; y < s - 1; y++) { px(0, y); px(s - 1, y); }
      if (clear > n / 2) return '#fff';
      let best = null; for (const b of buckets.values()) if (!best || b[3] > best[3]) best = b;
      if (!best || best[3] < n * 0.3) return '#fff';
      return `rgb(${Math.round(best[0] / best[3])} ${Math.round(best[1] / best[3])} ${Math.round(best[2] / best[3])})`;
    } catch { return '#fff'; }
  }
  function artMock(p) {
    const g = gameOf(p);
    const t = typeOf(p);
    const style = `--a:${g.a};--b:${g.b};--c:${g.c}`;
    if (t.art === 'slab') {
      const gr = p.grade || { grader: 'PSA', grade: 10 };
      const label = p.artLabel || p.name;
      return `<div class="art art--slab" style="${style}" aria-hidden="true"><div class="art__slab">
        <div class="art__label"><span>${esc(label)}<small>${esc(p.set)} · ${esc(gr.grader)}</small></span><b>${esc(gr.grade)}</b></div>
        <div class="art__card"><span class="art__game">${esc(g.name)}</span><div class="art__picture"></div><span class="art__set">${esc(label)}</span></div>
      </div></div>`;
    }
    const isBox = t.art === 'box';
    const gameLine = p.brand || (p.game === 'norvex' ? 'Norvex' : g.name);
    return `<div class="art art--${t.art}" style="${style}" aria-hidden="true"><div class="art__box">
      <div class="art__top"></div><div class="art__side"></div>
      <div class="art__front">
        <span class="art__game">${esc(gameLine)}${isBox ? ' · ' + esc(p.set) : ''}</span>
        ${isBox ? '<div class="art__window"><i></i><i></i><i></i></div>' : `<span class="art__set">${esc(p.set)}</span>`}
        <span class="art__type">${esc(t.singular)}<i class="art__emblem"></i></span>
      </div>
      <div class="art__shadow"></div>
    </div></div>`;
  }

  function card(p, i = 0) {
    const g = gameOf(p);
    const t = typeOf(p);
    const av = availability(p);
    const addLabel = av.key === 'out' ? 'Sold out' : av.key === 'pre' ? 'Pre-order' : 'Add to cart';
    const stockLabel = av.key === 'pre' && releaseText(p) ? `Releases ${releaseText(p)}` : av.label;
    return `<article class="product reveal reveal--scale" style="--i:${i % 8}" data-product="${esc(p.id)}">
      <div class="product__media" style="--a:${g.a}">
        <div class="product__badges">${badges(p)}</div>
        ${art(p)}
      </div>
      <div class="product__body">
        <span class="product__game">${esc(p.brand || g.short)} · ${esc(t.singular)}</span>
        <h3 class="product__name"><a href="${productHref(p)}">${esc(p.name)}</a></h3>
        <div class="product__row">
          <span class="price product__price">${fmt(p.price)}${p.compareAt ? `<span class="price--compare">${fmt(p.compareAt)}</span>` : ''}</span>
          <span class="product__stock product__stock--${av.key}">${esc(stockLabel)}</span>
        </div>
        <button class="btn btn--ghost btn--sm btn--block product__add" type="button" data-add="${esc(p.id)}"${av.key === 'out' ? ' disabled' : ''} aria-label="${addLabel}: ${esc(p.name)}">${addLabel}</button>
      </div>
    </article>`;
  }

  function select(spec) {
    const [kind, val] = String(spec || 'all').split(':');
    switch (kind) {
      case 'featured': return products.filter((p) => p.featured && !p.preorder && p.type !== 'single').sort((a, b) => soldOut(a) - soldOut(b));
      case 'preorder': return products.filter((p) => p.preorder);
      case 'type': return products.filter((p) => p.type === val);
      case 'game': return products.filter((p) => p.game === val);
      case 'related': {
        const p = byId[val];
        if (!p) return [];
        return products
          .filter((x) => x.id !== p.id && (x.game === p.game || x.type === p.type))
          .sort((a, b) => ((b.game === p.game) - (a.game === p.game)) || ((b.type === p.type) - (a.type === p.type)));
      }
      default: return products.slice();
    }
  }

  function renderGrid(el, list) {
    el.innerHTML = list.map(card).join('');
    observe(el);
  }

  /* ------------------------------------------------------------- reveal */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    : null;
  function observe(root = document) {
    $$('.reveal:not(.is-in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
  }

  /* -------------------------------------------------------------- toast */
  let toastTimer;
  function toast(msg, ic = 'check') {
    let el = $('#nv-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'nv-toast'; el.className = 'toast glass';
      el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2800);
  }

  /* ------------------------------------------------- layers (a11y core) */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const Layer = (() => {
    const stack = [];
    function open(el, opts = {}) {
      if (stack.some((l) => l.el === el)) return;
      const opener = document.activeElement;
      el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
      if (opts.scrim) opts.scrim.classList.add('is-open');
      document.body.classList.add('is-locked');
      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(el); return; }
        if (e.key !== 'Tab') return;
        const f = $$(FOCUSABLE, el).filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0]; const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', onKey);
      stack.push({ el, opener, onKey, scrim: opts.scrim, onClose: opts.onClose });
      requestAnimationFrame(() => {
        const target = opts.initialFocus || $(FOCUSABLE, el);
        target && target.focus({ preventScroll: true });
      });
    }
    function close(el) {
      const i = stack.findIndex((l) => l.el === el);
      if (i < 0) return;
      const [l] = stack.splice(i, 1);
      l.el.classList.remove('is-open'); l.el.setAttribute('aria-hidden', 'true');
      if (l.scrim) l.scrim.classList.remove('is-open');
      document.removeEventListener('keydown', l.onKey);
      if (!stack.length) document.body.classList.remove('is-locked');
      l.onClose && l.onClose();
      l.opener && l.opener.focus && l.opener.focus({ preventScroll: true });
    }
    return { open, close, isOpen: (el) => stack.some((l) => l.el === el) };
  })();

  /* --------------------------------------------------------------- cart */
  const Cart = {
    KEY: 'norvex.cart.v1',
    items: [],
    el: null,
    scrim: null,
    load() {
      try { this.items = (JSON.parse(localStorage.getItem(this.KEY) || '[]') || []).filter((i) => byId[i.id] && i.qty > 0); }
      catch (e) { this.items = []; }
    },
    save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.items)); } catch (e) { /* private mode */ } },
    max(p) { return p.preorder ? 10 : p.stock; },
    add(id, qty = 1) {
      const p = byId[id]; if (!p) return false;
      const line = this.items.find((i) => i.id === id);
      const cur = line ? line.qty : 0;
      const next = Math.min(cur + qty, this.max(p));
      if (next === cur) { toast(`Only ${this.max(p)} of this item can be ordered`, 'lock'); return false; }
      if (line) line.qty = next; else this.items.push({ id, qty: next });
      this.save(); this.render(); return true;
    },
    setQty(id, qty) {
      const p = byId[id]; if (!p) return;
      const line = this.items.find((i) => i.id === id); if (!line) return;
      const next = Math.max(0, Math.min(qty, this.max(p)));
      if (next === 0) return this.remove(id);
      if (next === line.qty && qty > line.qty) toast(`Only ${this.max(p)} of this item can be ordered`, 'lock');
      line.qty = next; this.save(); this.render();
    },
    remove(id) { this.items = this.items.filter((i) => i.id !== id); this.save(); this.render(); },
    count() { return this.items.reduce((n, i) => n + i.qty, 0); },
    subtotal() { return this.items.reduce((n, i) => n + i.qty * byId[i.id].price, 0); },
    mount() {
      this.scrim = document.createElement('div');
      this.scrim.className = 'scrim'; this.scrim.setAttribute('data-scrim', '');
      this.el = document.createElement('aside');
      this.el.className = 'drawer'; this.el.id = 'cart-drawer';
      this.el.setAttribute('role', 'dialog'); this.el.setAttribute('aria-modal', 'true');
      this.el.setAttribute('aria-labelledby', 'cart-title'); this.el.setAttribute('aria-hidden', 'true');
      this.el.innerHTML = `
        <div class="drawer__head">
          <h2 class="drawer__title" id="cart-title">Your cart <small data-cart-summary>0 items</small></h2>
          <button class="btn btn--icon btn--ghost" type="button" data-close-cart aria-label="Close cart">${icon('x')}</button>
        </div>
        <div class="drawer__body" data-cart-body></div>
        <div class="drawer__foot" data-cart-foot hidden>
          <div class="shipbar"><span data-ship-text></span><div class="shipbar__track" aria-hidden="true"><div class="shipbar__fill" data-ship-fill></div></div></div>
          <div class="total"><span>Subtotal</span><b data-cart-total>${fmt(0)}</b></div>
          <p class="tiny muted-2">Shipping, insurance and taxes are calculated at checkout.</p>
          <button class="btn btn--primary btn--lg btn--block" type="button" data-checkout>${icon('lock')}Secure checkout</button>
          <button class="btn btn--link" type="button" data-close-cart style="justify-self:center">Continue shopping</button>
        </div>`;
      document.body.append(this.scrim, this.el);
      this.scrim.addEventListener('click', () => this.close());
      this.render();
    },
    open() { Layer.open(this.el, { scrim: this.scrim, initialFocus: $('[data-close-cart]', this.el) }); },
    close() { Layer.close(this.el); },
    render() {
      const n = this.count();
      $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.classList.toggle('is-visible', n > 0); });
      $$('[data-open-cart]').forEach((b) => b.setAttribute('aria-label', `Open cart, ${plural(n, 'item')}`));
      if (!this.el) return;
      const body = $('[data-cart-body]', this.el); const foot = $('[data-cart-foot]', this.el);
      $('[data-cart-summary]', this.el).textContent = plural(n, 'item');
      if (!this.items.length) {
        body.innerHTML = `<div class="drawer__empty">${icon('bag')}<p>Your cart is empty.</p><a class="btn btn--primary" href="shop.html">Browse the collection</a></div>`;
        foot.hidden = true; return;
      }
      foot.hidden = false;
      body.innerHTML = this.items.map(({ id, qty }) => {
        const p = byId[id]; const g = gameOf(p);
        return `<div class="line" data-line="${esc(id)}">
          <div class="line__media" style="--a:${g.a}">${art(p)}</div>
          <div class="line__info">
            <a class="line__name" href="${productHref(p)}">${esc(p.name)}</a>
            <span class="line__meta">${esc(p.brand || g.short)} · ${p.preorder ? 'Pre-order · ships on release' : 'In stock'}</span>
            <div class="line__controls">
              <div class="stepper stepper--sm" role="group" aria-label="Quantity for ${esc(p.name)}">
                <button type="button" data-line-step="-1" aria-label="Decrease quantity">${icon('minus')}</button>
                <span aria-live="polite">${qty}</span>
                <button type="button" data-line-step="1" aria-label="Increase quantity">${icon('plus')}</button>
              </div>
              <button class="line__remove" type="button" data-line-remove aria-label="Remove ${esc(p.name)}">${icon('trash')}</button>
            </div>
          </div>
          <div class="line__price"><span class="price small">${fmt(p.price * qty)}</span>${qty > 1 ? `<span class="tiny muted-2">${fmt(p.price)} each</span>` : ''}</div>
        </div>`;
      }).join('');
      const sub = this.subtotal(); const th = config.freeShippingThreshold; const remaining = Math.max(0, th - sub);
      $('[data-cart-total]', this.el).textContent = fmt(sub);
      $('[data-ship-fill]', this.el).style.width = `${Math.min(100, (sub / th) * 100)}%`;
      $('[data-ship-text]', this.el).innerHTML = remaining > 0
        ? `Add <b>${fmt(remaining)}</b> more for free insured shipping`
        : `<span class="gold">Free insured shipping unlocked</span>`;
    }
  };

  /* ----------------------------------------------------------- header */
  function initHeader() {
    const header = $('[data-header]'); if (!header) return;
    const solid = header.dataset.header === 'solid';
    const onScroll = () => header.classList.toggle('is-scrolled', solid || window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    // mark current nav link
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.nav__links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === here || (here === 'shop.html' && href === 'shop.html' + location.search) ) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------ mobile menu */
  let menuEl;
  function initMenu() {
    menuEl = document.createElement('div');
    menuEl.className = 'menu'; menuEl.id = 'menu';
    menuEl.setAttribute('role', 'dialog'); menuEl.setAttribute('aria-modal', 'true');
    menuEl.setAttribute('aria-label', 'Menu'); menuEl.setAttribute('aria-hidden', 'true');
    menuEl.innerHTML = `
      <div class="menu__top">${brandHtml()}<button class="btn btn--icon btn--ghost" type="button" data-close-menu aria-label="Close menu">${icon('x')}</button></div>
      <nav class="menu__links" aria-label="Mobile">${NAV.map((l) => `<a href="${l.href}">${esc(l.label)}${icon('arrowRight')}</a>`).join('')}</nav>
      <div class="menu__foot"><a href="help.html">Help &amp; delivery</a><a href="help.html#track">Order tracking</a><a href="mailto:${esc(config.supportEmail)}">${esc(config.supportEmail)}</a></div>`;
    document.body.appendChild(menuEl);
  }
  function openMenu(btn) {
    btn && btn.setAttribute('aria-expanded', 'true');
    Layer.open(menuEl, { initialFocus: $('[data-close-menu]', menuEl), onClose: () => btn && btn.setAttribute('aria-expanded', 'false') });
  }

  /* ------------------------------------------------------------ search */
  let searchEl;
  function initSearch() {
    searchEl = document.createElement('div');
    searchEl.className = 'modal'; searchEl.id = 'search';
    searchEl.setAttribute('role', 'dialog'); searchEl.setAttribute('aria-modal', 'true');
    searchEl.setAttribute('aria-label', 'Search products'); searchEl.setAttribute('aria-hidden', 'true');
    searchEl.innerHTML = `
      <div class="modal__panel glass">
        <div class="search__bar">${icon('search')}<input class="search__input" type="search" placeholder="Search sets, games or products…" aria-label="Search products" autocomplete="off" spellcheck="false"><span class="kbd" aria-hidden="true">ESC</span></div>
        <div class="search__results" data-search-results></div>
      </div>`;
    document.body.appendChild(searchEl);
    const input = $('.search__input', searchEl); const results = $('[data-search-results]', searchEl);
    const hint = (t) => `<div class="search__hint">${t}</div>`;
    function render(q) {
      q = q.trim();
      if (q.length < 2) { results.innerHTML = hint('Try “Prismatic”, “Collector Booster” or “PSA 10”.'); return; }
      const hits = products.filter((p) => matches(p, q)).slice(0, 7);
      if (!hits.length) { results.innerHTML = hint(`No products found for “${esc(q)}”.`); return; }
      results.innerHTML = hits.map((p) => {
        const g = gameOf(p); const t = typeOf(p);
        return `<a class="hit" href="${productHref(p)}"><div class="hit__media" style="--a:${g.a}">${art(p)}</div><div><div class="hit__name">${esc(p.name)}</div><div class="hit__meta">${esc(p.brand || g.short)} · ${esc(t.singular)} · ${esc(availability(p).label)}</div></div><span class="price small">${fmt(p.price)}</span></a>`;
      }).join('') + `<a class="hit" href="shop.html?q=${encodeURIComponent(q)}"><div></div><div class="hit__name gold">See all results for “${esc(q)}”</div><span class="gold">${icon('arrowRight')}</span></a>`;
    }
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const q = input.value.trim(); if (q) location.href = `shop.html?q=${encodeURIComponent(q)}`; }
    });
    searchEl.addEventListener('click', (e) => { if (e.target === searchEl) Layer.close(searchEl); });
    render('');
    document.addEventListener('keydown', (e) => {
      const typing = /^(input|textarea|select)$/i.test(document.activeElement && document.activeElement.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
      else if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); }
    });
  }
  function openSearch() {
    const input = $('.search__input', searchEl);
    Layer.open(searchEl, { initialFocus: input });
    input.select();
  }

  /* -------------------------------------------------------------- hero */
  function initHero() {
    const hero = $('[data-hero]'); const stage = $('[data-stage]');
    if (!hero || !stage || reducedMotion.matches || !finePointer.matches) return;
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { stage.style.setProperty('--mx', mx.toFixed(3)); stage.style.setProperty('--my', my.toFixed(3)); });
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--mx', '0'); stage.style.setProperty('--my', '0'); });
  }

  function initMarquee() {
    $$('[data-marquee]').forEach((track) => { track.innerHTML += track.innerHTML; });
  }

  function mailto(subject, body) {
    return `mailto:${config.supportEmail || 'info@norvexgaming.com'}?subject=${encodeURIComponent(subject)}${body ? '&body=' + encodeURIComponent(body) : ''}`;
  }

  /* business details, contact email and social links all come from the catalogue config,
     so the help/legal pages never go out of date when the config changes */
  function initBusiness() {
    const b = config.business || {}; const email = config.supportEmail;
    $$('[data-business]').forEach((el) => {
      const rows = [];
      if (b.legalName) rows.push(`<b>${esc(b.legalName)}</b>${b.tradingName && b.tradingName !== b.legalName ? ` trading as ${esc(b.tradingName)}` : ''}`);
      const addr = (b.address || []).concat(b.country && !(b.address || []).includes(b.country) ? [b.country] : []).map(esc).join(', ');
      if (addr) rows.push((b.address || []).length ? `Registered office: ${addr}` : addr);
      if (b.companyNumber) rows.push(`${b.registeredIn ? `Registered in ${esc(b.registeredIn)}, company` : 'Company'} number ${esc(b.companyNumber)}`);
      if (b.vatNumber) rows.push(`VAT number ${esc(b.vatNumber)}`);
      if (email) rows.push(`<a href="mailto:${esc(email)}">${esc(email)}</a>`);
      if (b.hours) rows.push(`Email replies ${esc(b.hours)}`);
      el.innerHTML = rows.map((r) => `<span>${r}</span>`).join('');
    });
    if (email) $$('[data-email]').forEach((a) => { a.href = `mailto:${email}`; a.textContent = email; });
    $$('[data-social]').forEach((el) => {
      const links = Object.entries(config.social || {}).filter(([, url]) => url);
      if (!links.length) return;
      el.innerHTML = links.map(([name, url]) => `<a href="${esc(url)}" rel="me noopener" target="_blank">${esc(name)}</a>`).join('');
      el.hidden = false;
    });
  }

  function initNewsletter() {
    $$('[data-newsletter]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('input[type="email"]', form);
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        form.classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok) { input.focus(); return; }
        form.closest('.newsletter').classList.add('is-done');
        location.href = mailto('Allocation list', `Please add ${input.value.trim()} to the Norvex allocation list.`);
      });
    });
  }

  /* ---------------------------------------------------------- shop page */
  function initShop() {
    const grid = $('[data-shop-grid]'); if (!grid) return;
    const filtersEl = $('[data-filters]'); const countEl = $('[data-shop-count]'); const titleEl = $('[data-shop-title]');
    const chipsEl = $('[data-active-filters]'); const sortEl = $('[data-sort]'); const crumbEl = $('[data-shop-crumb]');
    const params = new URLSearchParams(location.search);
    const list = (k) => (params.get(k) || '').split(',').filter(Boolean);
    const state = { game: list('game'), type: list('type'), avail: list('avail'), min: params.get('min') || '', max: params.get('max') || '', sort: params.get('sort') || 'featured', q: params.get('q') || '' };

    const counts = (key) => products.reduce((m, p) => { m[p[key]] = (m[p[key]] || 0) + 1; return m; }, {});
    const gc = counts('game'); const tc = counts('type');
    const cb = (group, key, label, n) => `<label class="checkbox"><input type="checkbox" name="${group}" value="${esc(key)}"${state[group].includes(key) ? ' checked' : ''}><span>${esc(label)}</span><span class="checkbox__count">${n}</span></label>`;
    filtersEl.innerHTML = `
      <div class="filters__group"><div class="filters__title">Game</div>${Object.entries(games).filter(([k]) => gc[k] && k !== 'norvex').map(([k, g]) => cb('game', k, g.name, gc[k])).join('')}</div>
      <div class="filters__group"><div class="filters__title">Product type</div>${Object.entries(types).filter(([k]) => tc[k]).map(([k, t]) => cb('type', k, t.name, tc[k])).join('')}</div>
      <div class="filters__group"><div class="filters__title">Availability</div>${cb('avail', 'instock', 'In stock', products.filter((p) => !p.preorder && p.stock > 0).length)}${cb('avail', 'preorder', 'Pre-order', products.filter((p) => p.preorder).length)}</div>
      <div class="filters__group"><div class="filters__title">Price</div><div class="filters__price">
        <label class="sr-only" for="f-min">Minimum price</label><input class="input" id="f-min" type="number" min="0" inputmode="decimal" placeholder="Min" value="${esc(state.min)}">
        <span aria-hidden="true">–</span>
        <label class="sr-only" for="f-max">Maximum price</label><input class="input" id="f-max" type="number" min="0" inputmode="decimal" placeholder="Max" value="${esc(state.max)}">
      </div></div>
      <div class="filters__group"><button class="btn btn--ghost btn--sm btn--block" type="button" data-clear-filters>Clear all filters</button></div>`;

    filtersEl.addEventListener('change', (e) => {
      const i = e.target;
      if (i.type === 'checkbox') {
        const arr = state[i.name];
        if (i.checked) { if (!arr.includes(i.value)) arr.push(i.value); } else state[i.name] = arr.filter((v) => v !== i.value);
      }
      if (i.id === 'f-min') state.min = i.value;
      if (i.id === 'f-max') state.max = i.value;
      apply();
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-filters]')) {
        Object.assign(state, { game: [], type: [], avail: [], min: '', max: '', q: '' });
        syncInputs(); apply();
      }
    });
    sortEl.value = state.sort;
    sortEl.addEventListener('change', () => { state.sort = sortEl.value; apply(); });
    chipsEl.addEventListener('click', (e) => {
      const c = e.target.closest('[data-remove]'); if (!c) return;
      const [g, v] = c.dataset.remove.split('|');
      if (g === 'min' || g === 'max' || g === 'q') state[g] = ''; else state[g] = state[g].filter((x) => x !== v);
      syncInputs(); apply();
    });
    const toggle = $('[data-toggle-filters]');
    toggle && toggle.addEventListener('click', () => {
      const open = filtersEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    function syncInputs() {
      $$('input[type="checkbox"]', filtersEl).forEach((i) => { i.checked = state[i.name].includes(i.value); });
      $('#f-min').value = state.min; $('#f-max').value = state.max;
    }
    const rank = (p) => (p.badge === 'hot' ? 2 : p.badge === 'new' ? 1 : 0);
    const sorters = {
      featured: (a, b) => (soldOut(a) - soldOut(b)) || (b.featured - a.featured) || (rank(b) - rank(a)),
      newest: (a, b) => ((b.badge === 'new') - (a.badge === 'new')) || (b.preorder - a.preorder),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name)
    };
    const chip = (g, v, label) => `<button class="chip is-active" type="button" data-remove="${g}|${esc(v)}" aria-label="Remove filter: ${esc(label)}">${esc(label)}${icon('x')}</button>`;

    const PAGE = 48; let shown = PAGE; let current = [];
    const moreEl = document.createElement('div'); moreEl.className = 'shop__more'; moreEl.hidden = true;
    moreEl.innerHTML = `<p class="shop__more-count muted"></p><button class="btn btn--ghost" type="button" data-show-more>Show more products</button>`;
    grid.insertAdjacentElement('afterend', moreEl);
    function renderMore() {
      const from = shown; shown = Math.min(current.length, shown + PAGE);
      grid.insertAdjacentHTML('beforeend', current.slice(from, shown).map((p, i) => card(p, i)).join(''));
      observe(grid); updateMore();
      const first = grid.children[from]; if (first) { const link = first.querySelector('a'); if (link) link.focus({ preventScroll: true }); }
    }
    function updateMore() {
      moreEl.hidden = shown >= current.length;
      $('.shop__more-count', moreEl).textContent = `Showing ${Math.min(shown, current.length)} of ${plural(current.length, 'product')}`;
    }
    moreEl.addEventListener('click', (e) => { if (e.target.closest('[data-show-more]')) renderMore(); });
    function apply() {
      shown = PAGE;
      const min = state.min === '' ? -Infinity : Number(state.min);
      const max = state.max === '' ? Infinity : Number(state.max);
      const out = products.filter((p) =>
        (!state.game.length || state.game.includes(p.game)) &&
        (!state.type.length || state.type.includes(p.type)) &&
        (!state.avail.length || (state.avail.includes('instock') && !p.preorder && p.stock > 0) || (state.avail.includes('preorder') && p.preorder)) &&
        p.price >= min && p.price <= max &&
        (!state.q || matches(p, state.q)));
      out.sort(sorters[state.sort] || sorters.featured);
      current = out;
      grid.innerHTML = out.length ? out.slice(0, shown).map(card).join('') : `<div class="empty" style="grid-column:1/-1">${icon('search')}<p>No products match those filters.</p><button class="btn btn--ghost btn--sm" type="button" data-clear-filters>Clear filters</button></div>`;
      observe(grid); updateMore();
      countEl.textContent = plural(out.length, 'product');

      const title = state.q ? `Results for “${state.q}”`
        : state.game.length === 1 && !state.type.length ? games[state.game[0]].name
          : state.type.length === 1 && !state.game.length ? types[state.type[0]].name
            : state.avail.length === 1 && state.avail[0] === 'preorder' && !state.game.length && !state.type.length ? 'Pre-orders'
              : 'All products';
      titleEl.textContent = title; if (crumbEl) crumbEl.textContent = title;
      document.title = `${title} · ${config.storeName}`;

      const chips = [];
      state.game.forEach((g) => games[g] && chips.push(chip('game', g, games[g].short)));
      state.type.forEach((t) => types[t] && chips.push(chip('type', t, types[t].name)));
      state.avail.forEach((a) => chips.push(chip('avail', a, a === 'instock' ? 'In stock' : 'Pre-order')));
      if (state.min !== '') chips.push(chip('min', state.min, `From ${fmt(+state.min)}`));
      if (state.max !== '') chips.push(chip('max', state.max, `Up to ${fmt(+state.max)}`));
      if (state.q) chips.push(chip('q', state.q, `“${state.q}”`));
      chipsEl.innerHTML = chips.join('');

      const u = new URLSearchParams();
      if (state.game.length) u.set('game', state.game.join(','));
      if (state.type.length) u.set('type', state.type.join(','));
      if (state.avail.length) u.set('avail', state.avail.join(','));
      if (state.min !== '') u.set('min', state.min);
      if (state.max !== '') u.set('max', state.max);
      if (state.q) u.set('q', state.q);
      if (state.sort !== 'featured') u.set('sort', state.sort);
      const qs = u.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }
    apply();
  }

  /* ------------------------------------------------------- product page */
  function initProduct() {
    const root = $('[data-pdp]'); if (!root) return;
    const id = new URLSearchParams(location.search).get('id'); const p = byId[id];
    const crumb = $('[data-pdp-crumb]'); const related = $('[data-related]'); const relatedSection = $('[data-related-section]');
    if (!p) {
      document.title = `Product not found · ${config.storeName}`;
      root.innerHTML = `<div class="empty" style="grid-column:1/-1">${icon('search')}<h1 class="h3">We couldn't find that product.</h1><p>It may have sold out or moved. Browse the full collection instead.</p><a class="btn btn--primary" href="shop.html">Browse the shop</a></div>`;
      if (relatedSection) relatedSection.hidden = true;
      return;
    }
    const g = gameOf(p); const t = typeOf(p); const av = availability(p); const max = Cart.max(p);
    document.title = `${p.name} · ${config.storeName}`;
    if (crumb) crumb.textContent = p.name;
    seo(p, g, t, av);
    const gameCrumb = $('[data-pdp-game]');
    if (gameCrumb) { gameCrumb.textContent = g.short; gameCrumb.href = `shop.html?game=${encodeURIComponent(p.game)}`; }
    const stars = p.rating
      ? `<div class="cluster"><span class="testimonial__stars" role="img" aria-label="Rated ${p.rating} out of 5">${icon('star').repeat(5)}</span><span class="small muted">${p.rating.toFixed(1)} · ${plural(p.reviews, 'review')}</span></div>`
      : '';
    const dispatchHours = (config.shipping && config.shipping.dispatchHours) || 48;
    const returnsDays = config.returnsDays || 14;
    const stockNote = p.preorder ? (releaseText(p) ? ` · releases ${releaseText(p)}, charged now and dispatched insured on release day` : ' · charged now, dispatched insured on release day') : av.key === 'out' ? '' : ` · dispatched within ${dispatchHours} hours`;
    const buy = av.key === 'out'
      ? `<button class="btn btn--ghost btn--lg btn--block" type="button" disabled style="grid-column:1/-1">Sold out</button><button class="btn btn--outline btn--block" type="button" style="grid-column:1/-1" data-notify>Notify me when restocked</button>`
      : `<div class="stepper" role="group" aria-label="Quantity">
           <button type="button" data-step="-1" aria-label="Decrease quantity">${icon('minus')}</button>
           <output data-qty-out aria-live="polite">1</output>
           <button type="button" data-step="1" aria-label="Increase quantity">${icon('plus')}</button>
         </div>
         <button class="btn btn--primary btn--lg btn--block" type="button" data-add="${esc(p.id)}" data-qty="1">${icon('bag')}${av.key === 'pre' ? 'Pre-order now' : 'Add to cart'}</button>`;

    root.innerHTML = `
      <div class="pdp__gallery reveal">
        <div class="pdp__media" style="--a:${g.a}"><div class="product__badges">${badges(p)}</div>${art(p, { eager: true })}</div>
      </div>
      <div class="pdp__info">
        <div class="stack reveal" style="gap:.85rem">
          <span class="eyebrow eyebrow--plain">${esc(p.brand || g.name)} · ${esc(t.singular)}</span>
          <h1 class="pdp__title">${esc(p.name)}</h1>
          ${stars}
        </div>
        <div class="pdp__price reveal" style="--i:1"><span class="price">${fmt(p.price)}</span>${p.compareAt ? `<span class="price price--compare">${fmt(p.compareAt)}</span><span class="save">Save ${fmt(p.compareAt - p.price)}</span>` : ''}</div>
        <p class="lede reveal" style="--i:2;font-size:1rem">${esc(p.description)}</p>
        <div class="pdp__buy glass reveal" style="--i:3">
          <div class="pdp__stock pdp__stock--${av.key}" style="grid-column:1/-1"><i aria-hidden="true"></i>${esc(av.label)}${stockNote}</div>
          ${buy}
        </div>
        <ul class="pdp__perks reveal" style="--i:4">
          <li>${icon('shield')}100% authentic · factory-sealed or slab-verified</li>
          <li>${icon('truck')}Insured, tracked shipping · free over ${fmt0(config.freeShippingThreshold)}</li>
          <li>${icon('package')}Double-boxed with corner protection</li>
          <li>${icon('refresh')}${returnsDays}-day returns on sealed product</li>
        </ul>
        <div class="acc reveal" style="--i:5">
          <details open><summary>What's inside ${icon('plus')}</summary><div class="acc__body"><ul>${(p.contents || []).map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div></details>
          <details><summary>Details ${icon('plus')}</summary><div class="acc__body"><dl class="spec">${Object.entries(p.specs || {}).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}${p.grade ? `<div><dt>Certification</dt><dd>${esc(p.grade.grader)} #${esc(p.grade.cert)}</dd></div>` : ''}</dl></div></details>
          <details><summary>Shipping &amp; returns ${icon('plus')}</summary><div class="acc__body"><p>In-stock orders are dispatched within ${dispatchHours} hours, tracked and insured, across the UK. Standard delivery is ${fmt(config.shipping ? config.shipping.standard : 4.99)}, free over ${fmt0(config.freeShippingThreshold)}; next working day is ${fmt(config.shipping ? config.shipping.express : 9.99)}. Pre-orders are dispatched on release day. Change your mind within ${returnsDays} days of delivery for a full refund on sealed product with its seals intact and on graded singles still in their undamaged slab. <a href="help.html#returns">Full returns policy</a>.</p></div></details>
          <details><summary>Authenticity guarantee ${icon('plus')}</summary><div class="acc__body"><p>Every sealed product is bought directly from official UK distributors and checked for intact factory seals before it is listed and before it ships. Graded singles ship in their original slab with a certification number you can verify on the grader's registry. If anything ever falls short, we refund in full, postage included. <a href="help.html#authenticity">Read the guarantee</a>.</p></div></details>
        </div>
      </div>`;

    let qty = 1;
    const out = $('[data-qty-out]', root); const addBtn = $('[data-add]', root);
    root.addEventListener('click', (e) => {
      const s = e.target.closest('[data-step]');
      if (s) {
        const next = Math.min(max, Math.max(1, qty + Number(s.dataset.step)));
        if (next === qty && next === max) toast(`Only ${max} available`, 'lock');
        qty = next; out.value = qty; out.textContent = qty; addBtn.dataset.qty = qty;
      }
      if (e.target.closest('[data-notify]')) {
        location.href = mailto('Restock alert: ' + p.name, `Please email me when "${p.name}" is back in stock.\n\nProduct: ${location.href}`);
        toast('Your email app should open. Send it and we reply when it is back.', 'check');
      }
    });
    if (related) renderGrid(related, select('related:' + p.id).slice(0, 4));
    observe(root);
  }

  /* Per-product canonical URL, social preview and Product structured data (JSON-LD), so
     search engines index each product page on its own rather than as copies of product.html */
  function seo(p, g, t, av) {
    const dispatchHours = (config.shipping && config.shipping.dispatchHours) || 48; const returnsDays = config.returnsDays || 14;
    const canon = $('link[rel="canonical"]'); const origin = canon ? new URL(canon.href).origin : location.origin;
    const url = `${origin}/product.html?id=${encodeURIComponent(p.id)}`; const image = `${origin}/${p.image}`;
    if (canon) canon.href = url;
    const meta = (sel, value) => { const el = $(sel); if (el) el.setAttribute('content', value); };
    const desc = `${p.name}: ${p.description}`.slice(0, 300);
    meta('meta[name="description"]', desc); meta('meta[property="og:title"]', `${p.name} · ${config.storeName}`); meta('meta[property="og:description"]', desc);
    meta('meta[property="og:url"]', url); meta('meta[property="og:image"]', image); meta('meta[property="og:type"]', 'product');
    const availability = av.key === 'out' ? 'https://schema.org/OutOfStock' : p.preorder ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
    const data = [
      { '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: [image], description: p.description, sku: p.id, category: `${g.name} ${t.name}`,
        brand: { '@type': 'Brand', name: p.brand || g.name },
        offers: { '@type': 'Offer', url, priceCurrency: config.currency || 'GBP', price: Number(p.price).toFixed(2), availability, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: (config.business && config.business.legalName) || config.storeName },
          ...(p.preorder && p.releaseDate ? { availabilityStarts: p.releaseDate } : {}),
          shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: p.freeShipping ? 0 : Number((config.shipping && config.shipping.standard) || 4.99), currency: config.currency || 'GBP' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GB' },
            deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: Math.ceil(dispatchHours / 24), unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' } } },
          hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'GB', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: returnsDays, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnShippingFees' } } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${origin}/shop.html` },
        { '@type': 'ListItem', position: 3, name: g.short || g.name, item: `${origin}/shop.html?game=${encodeURIComponent(p.game)}` },
        { '@type': 'ListItem', position: 4, name: p.name, item: url }] }
    ];
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }

  /* ------------------------------------------------ global delegation */
  function initGlobalClicks() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { if (Cart.add(add.dataset.add, Number(add.dataset.qty || 1))) Cart.open(); return; }
      if (e.target.closest('[data-open-cart]')) { Cart.open(); return; }
      if (e.target.closest('[data-close-cart]')) { Cart.close(); return; }
      if (e.target.closest('[data-open-search]')) { openSearch(); return; }
      const menuBtn = e.target.closest('[data-open-menu]');
      if (menuBtn) { openMenu(menuBtn); return; }
      if (e.target.closest('[data-close-menu]')) { Layer.close(menuEl); return; }
      if (e.target.closest('[data-checkout]')) { checkout(); return; }
      const step = e.target.closest('[data-line-step]');
      if (step) { const id = step.closest('[data-line]').dataset.line; const line = Cart.items.find((i) => i.id === id); if (line) Cart.setQty(id, line.qty + Number(step.dataset.lineStep)); return; }
      const rm = e.target.closest('[data-line-remove]');
      if (rm) { Cart.remove(rm.closest('[data-line]').dataset.line); return; }
    });
    // close the mobile menu when a link inside it is followed (same-page anchors)
    document.addEventListener('click', (e) => { if (menuEl && e.target.closest('.menu__links a')) Layer.close(menuEl); });
  }

  /* ----------------------------------------------------------- checkout */
  /* The cart is sent to config.checkout.endpoint (see checkout/worker.js), which looks every item up in
     the catalogue server-side and returns a Stripe Checkout URL. Stripe brings the shopper back with
     ?checkout=success or ?checkout=cancelled. */
  async function checkout() {
    const cfg = config.checkout || {};
    if (!Cart.items.length) { toast('Your cart is empty', 'lock'); return; }
    if (!cfg.endpoint) { toast('Secure checkout goes live once payments are connected', 'lock'); return; }
    const btn = $('[data-checkout]'); const label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = `${icon('lock')}Opening secure checkout…`; }
    try {
      const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: Cart.items.map((i) => ({ id: i.id, qty: i.qty })), key: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout is unavailable right now');
      location.assign(data.url);
    } catch (err) {
      toast(err.message || 'Checkout is unavailable right now', 'lock');
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
  }
  function checkoutReturn() {
    const params = new URLSearchParams(location.search); const state = params.get('checkout'); if (!state) return;
    if (state === 'success' && params.get('session_id')) { location.replace(`order.html?session_id=${encodeURIComponent(params.get('session_id'))}`); return; }
    if (state === 'success') { Cart.items = []; Cart.save(); Cart.render(); toast('Order received. Your receipt is on its way by email.', 'check'); }
    else if (state === 'cancelled') toast('Checkout cancelled. Your cart is still here.', 'lock');
    params.delete('checkout'); params.delete('session_id');
    const qs = params.toString(); history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  /* ---------------------------------------------------------- order page */
  /* order.html?session_id=… — the order summary comes from the checkout function (GET endpoint?id=),
     which reads it back from Stripe. If that is unreachable, the page still confirms the payment
     from the cart it had before checkout. */
  const orderRef = (id) => 'NV-' + String(id || '').replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase();
  async function initOrder() {
    const root = $('[data-order]'); if (!root) return;
    const sid = new URLSearchParams(location.search).get('session_id') || '';
    const snapshot = Cart.items.map((i) => ({ ...i }));
    Cart.items = []; Cart.save(); Cart.render();
    const cfg = config.checkout || {}; let order = null;
    if (sid && cfg.endpoint) {
      try { const res = await fetch(`${cfg.endpoint}?id=${encodeURIComponent(sid)}`); if (res.ok) order = await res.json(); } catch (e) { /* offline or blocked: fall back to the snapshot */ }
    }
    if (!sid && !snapshot.length) { root.innerHTML = `<div class="order__main"><span class="eyebrow">Your order</span><h1 class="order__title">Nothing to show yet.</h1><p class="order__lead muted">This page appears after a purchase. Your confirmation email has a link back to it.</p><p><a class="btn btn--primary" href="shop.html">Browse the shop</a></p></div>`; return; }
    root.innerHTML = renderOrder(order, sid, snapshot);
    document.title = `Order ${orderRef((order && order.id) || sid)} · ${config.storeName || 'Norvex Gaming'}`;
  }
  function renderOrder(o, sid, snapshot) {
    const ref = orderRef((o && o.id) || sid);
    const items = o && o.items && o.items.length ? o.items : snapshot.map((i) => ({ product_id: i.id, name: byId[i.id] ? byId[i.id].name : i.id, qty: i.qty, amount_total: Math.round((byId[i.id] ? byId[i.id].price : 0) * 100 * i.qty) }));
    const line = (it) => {
      const p = it.product_id ? byId[it.product_id] : null;
      return `<div class="line"><div class="line__media" style="--a:${p ? gameOf(p).a : '#d9b75b'}">${p ? art(p) : ''}</div><div><div class="line__name">${esc(it.name)}</div><div class="muted-2 tiny">Qty ${esc(it.qty)}</div></div><span class="price">${fmt((it.amount_total || 0) / 100)}</span></div>`;
    };
    const pending = !!(o && o.payment_status && o.payment_status !== 'paid');
    const first = o && o.name ? esc(String(o.name).trim().split(/\s+/)[0]) : '';
    const totals = o ? `<div class="order__totals"><div><span>Subtotal</span><span>${fmt(o.amount_subtotal / 100)}</span></div><div><span>Delivery</span><span>${o.shipping_total ? fmt(o.shipping_total / 100) : 'Free'}</span></div><div class="order__total"><span>Total paid</span><span class="price">${fmt(o.amount_total / 100)}</span></div></div>` : '';
    const addr = o && o.shipping ? [o.shipping.name].concat(o.shipping.address || []).filter(Boolean).map(esc).join('<br>') : '';
    const lead = pending
      ? `Your payment for order <b>${ref}</b> is being confirmed by your bank. We will email you the moment it clears, and nothing ships until it does.`
      : `Order <b>${ref}</b> is paid and is being prepared.${o && o.email ? ` A receipt has been sent to <b>${esc(o.email)}</b>.` : ' Your receipt will arrive by email.'}`;
    const support = config.supportEmail || '';
    return `
      <div class="order__main">
        <span class="eyebrow">${pending ? 'Payment processing' : 'Order confirmed'}</span>
        <h1 class="order__title">Thank you${first ? ', ' + first : ''}.</h1>
        <p class="order__lead muted">${lead}</p>
        ${pending ? `<span class="order__pending">${icon('lock')}Awaiting bank confirmation</span>` : ''}
        <div class="order__lines">${items.map(line).join('')}</div>
        ${totals}
      </div>
      <aside class="order__aside panel">
        <h2>What happens next</h2>
        <ol class="order__steps">
          <li>We pull your items from the vault and double-box them with corner protection.</li>
          <li>Dispatch within 48 hours. Pre-orders ship on release day.</li>
          <li>You get a tracking number by email the moment it leaves us.</li>
        </ol>
        ${addr ? `<div class="order__address"><span class="tiny muted-2">Delivering to</span><address>${addr}</address></div>` : ''}
        <a class="btn btn--primary btn--block" href="shop.html">Continue shopping</a>
        <p class="tiny muted-2">Questions? Email <a href="mailto:${esc(support)}">${esc(support)}</a> quoting ${ref}.</p>
      </aside>`;
  }

  /* --------------------------------------------------------------- init */
  function init() {
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.artFallback) return;
      if (img.dataset.altSrc && !img.dataset.altTried) { img.dataset.altTried = '1'; img.src = img.dataset.altSrc; return; }
      const fig = img.closest('.photo'); const p = byId[img.dataset.artFallback];
      if (fig && p) fig.outerHTML = artMock(p); else img.remove();
    }, true);
    document.addEventListener('load', (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.artFallback) return;
      const fig = img.closest('.photo');
      if (fig) { fig.style.setProperty('--photo-bg', photoBackground(img)); fig.classList.add('is-loaded'); }
      img.classList.add('is-loaded');
    }, true);
    $$('[data-free-ship]').forEach((el) => { el.textContent = fmt0(config.freeShippingThreshold); });
    Cart.load();
    Cart.mount();
    checkoutReturn();
    initOrder();
    initMenu();
    initSearch();
    initHeader();
    initGlobalClicks();
    initProduct();
    $$('[data-products]').forEach((el) => renderGrid(el, select(el.dataset.products).slice(0, Number(el.dataset.limit) || 999)));
    $$('[data-art-product]').forEach((el) => { const p = byId[el.dataset.artProduct]; if (p) el.innerHTML = art(p, { eager: Boolean(el.closest('[data-stage]')) }); });
    initShop();
    initHero();
    initMarquee();
    initNewsletter();
    initBusiness();
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    observe(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.Norvex = { cart: Cart, toast, products, art, card };
})();
