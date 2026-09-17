/* =====================================================================
   Norvex Property — app.js
   1. Mode selection: cinematic (pinned GSAP journey) vs standard (sections)
   2. Cinematic timeline: zoom-through-doorway scene transitions + overlays
   3. Room navigation (nav links, dots, hash)
   4. Widgets: property search, mortgage calculator, survey chart,
      bridging calculator, enquiry form
   No build step. GSAP is loaded from a CDN; if it is missing the page
   simply runs in standard mode.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Config
     ------------------------------------------------------------------ */
  const VB = { w: 1600, h: 900 };   // scene viewBox (matches the SVG symbols)
  const DWELL = 0.7;                // timeline units spent "inside" a room
  const TRAVEL = 1.0;               // timeline units spent moving through a doorway
  const SCROLL_PER_UNIT = 0.9;      // viewport heights of scrolling per timeline unit
  const WIDE_QUERY = '(min-width: 1024px)';
  const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
  const NO_SNAP = /[?&]nosnap\b/.test(window.location.search); // debugging aid: disable snapping

  const html = document.documentElement;
  const journey = document.getElementById('journey');
  const stage = journey.querySelector('.stage');
  const scenes = Array.from(stage.querySelectorAll('.scene'));
  const panels = Array.from(journey.querySelectorAll('.panel'));
  const dots = Array.from(document.querySelectorAll('.dots [data-room]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-menu > a[data-room]'));
  const progressBar = document.querySelector('.progress > span');
  const motionToggle = document.getElementById('motion-toggle');
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('nav-toggle');

  const mqWide = window.matchMedia(WIDE_QUERY);
  const mqReduce = window.matchMedia(REDUCE_QUERY);
  const onMedia = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));

  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode etc. */ } },
  };
  let userReduced = store.get('norvex:motion') === 'reduced';

  const state = {
    mode: null,          // 'cinematic' | 'standard'
    ctx: null,           // gsap.context for clean teardown
    master: null,        // master timeline
    trigger: null,       // master ScrollTrigger
    roomTarget: [],      // progress (0-1) that lands the camera in each room
    refreshHandler: null,
    io: null,            // IntersectionObserver (standard mode)
    currentRoom: 0,
  };

  const hasGsap = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const prefersStatic = () => mqReduce.matches || userReduced;
  const wantsCinematic = () => hasGsap() && mqWide.matches && !prefersStatic();

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------
     Scene geometry: where is each doorway on screen?
     Scenes are rendered with preserveAspectRatio="xMidYMid slice", so a
     point in viewBox units maps to the stage through the same maths.
     ------------------------------------------------------------------ */
  function portalPoint(scene) {
    const parts = (scene.dataset.portal || '800 450').split(/\s+/).map(Number);
    const W = stage.clientWidth || window.innerWidth;
    const H = stage.clientHeight || window.innerHeight;
    const s = Math.max(W / VB.w, H / VB.h);
    return { x: (W - VB.w * s) / 2 + parts[0] * s, y: (H - VB.h * s) / 2 + parts[1] * s };
  }
  function applyOrigins() {
    scenes.forEach((scene) => {
      const p = portalPoint(scene);
      $$('.layer', scene).forEach((layer) => { layer.style.transformOrigin = p.x + 'px ' + p.y + 'px'; });
      const glow = $('.portal-glow', scene);
      if (glow) { glow.style.left = p.x + 'px'; glow.style.top = p.y + 'px'; }
    });
  }
  function clearOrigins() {
    scenes.forEach((scene) => {
      $$('.layer', scene).forEach((layer) => { layer.style.transformOrigin = ''; });
      const glow = $('.portal-glow', scene);
      if (glow) { glow.style.left = ''; glow.style.top = ''; }
    });
  }

  /* ------------------------------------------------------------------
     Cinematic mode
     One pinned container, one scrubbed master timeline. Per room:
       [ DWELL ]  nothing moves; the overlay content is interactive
       [ TRAVEL ] current content lifts out → camera pushes through the
                  doorway (near layer faster than far) → light floods →
                  next scene settles from 1.18× to 1× → next content rises
     ------------------------------------------------------------------ */
  function buildCinematic() {
    html.dataset.mode = 'cinematic';
    window.gsap.registerPlugin(window.ScrollTrigger);
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    applyOrigins();

    state.ctx = gsap.context(() => {
      scenes.forEach((scene, i) => {
        gsap.set(scene, { autoAlpha: i === 0 ? 1 : 0 });
        gsap.set($$('.layer', scene), { scale: i === 0 ? 1 : 1.18 });
        gsap.set($('.portal-glow', scene), { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
      });
      panels.forEach((panel, i) => {
        gsap.set(panel, { autoAlpha: i === 0 ? 1 : 0 });
        gsap.set($$('.reveal', panel), { y: i === 0 ? 0 : 36, opacity: i === 0 ? 1 : 0 });
      });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      let t = 0;
      scenes.forEach((scene, i) => {
        tl.addLabel('room-' + i, t);
        t += DWELL;
        if (i === scenes.length - 1) return;

        const next = scenes[i + 1];
        const far = $('.layer-far', scene);
        const near = $('.layer-near', scene);
        const glow = $('.portal-glow', scene);

        // 1. Current room's content lifts away.
        tl.to($$('.reveal', panels[i]), { y: -28, opacity: 0, duration: TRAVEL * 0.28, stagger: 0.015, ease: 'power1.in' }, t);
        tl.set(panels[i], { autoAlpha: 0 }, t + TRAVEL * 0.3);
        // 2. Camera pushes through the doorway; the near layer travels faster for depth.
        tl.to(far, { scale: 3.6, duration: TRAVEL, ease: 'power2.in' }, t);
        tl.to(near, { scale: 5.4, duration: TRAVEL, ease: 'power2.in' }, t);
        tl.to(near, { opacity: 0, duration: TRAVEL * 0.4, ease: 'power1.in' }, t + TRAVEL * 0.25);
        // 3. Light floods out of the doorway, then the old room dissolves.
        tl.to(glow, { scale: 1, opacity: 1, duration: TRAVEL * 0.5, ease: 'power2.in' }, t + TRAVEL * 0.15);
        tl.to(glow, { scale: 3.2, opacity: 0, duration: TRAVEL * 0.35, ease: 'power1.out' }, t + TRAVEL * 0.65);
        tl.to(scene, { autoAlpha: 0, duration: TRAVEL * 0.3, ease: 'power1.in' }, t + TRAVEL * 0.55);
        // 4. Next room settles from a slight zoom to rest.
        tl.to(next, { autoAlpha: 1, duration: TRAVEL * 0.35, ease: 'power1.out' }, t + TRAVEL * 0.5);
        tl.to($$('.layer', next), { scale: 1, duration: TRAVEL * 0.5, ease: 'power2.out' }, t + TRAVEL * 0.5);
        // 5. Next room's content rises in (finishes just as the room comes to rest).
        tl.set(panels[i + 1], { autoAlpha: 1 }, t + TRAVEL * 0.58);
        tl.to($$('.reveal', panels[i + 1]), { y: 0, opacity: 1, duration: TRAVEL * 0.3, stagger: 0.02, ease: 'power2.out' }, t + TRAVEL * 0.58);

        t += TRAVEL;
      });

      // The last room has no outgoing tween, so pad the timeline to the full
      // length; otherwise tl.duration() would stop at the last reveal and the
      // progress -> room mapping below would drift.
      tl.to({}, { duration: DWELL }, tl.labels['room-' + (scenes.length - 1)]);
      const total = tl.duration();
      state.master = tl;
      state.roomTarget = scenes.map((_, i) => (i === 0 ? 0 : (tl.labels['room-' + i] + DWELL / 2) / total));
      // Scroll bands where a transition is in progress; snapping settles them into a room.
      const bands = scenes.slice(0, -1).map((_, i) => [
        (tl.labels['room-' + i] + DWELL) / total,
        tl.labels['room-' + (i + 1)] / total,
      ]);

      state.trigger = ScrollTrigger.create({
        trigger: journey,
        start: 'top top',
        end: () => '+=' + Math.round(total * window.innerHeight * SCROLL_PER_UNIT),
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        animation: tl,
        snap: NO_SNAP ? false : {
          snapTo: (value) => {
            for (let i = 0; i < bands.length; i += 1) {
              const a = bands[i][0]; const b = bands[i][1];
              if (value > a && value < b) return value < (a + b) / 2 ? a : b;
            }
            return value;
          },
          duration: { min: 0.25, max: 0.7 },
          delay: 0.12,
          ease: 'power2.inOut',
        },
        onUpdate: (self) => {
          if (progressBar) progressBar.style.transform = 'scaleX(' + self.progress + ')';
          setActiveRoom(nearestRoom(self.progress));
        },
      });
    }, journey);

    state.refreshHandler = () => applyOrigins();
    ScrollTrigger.addEventListener('refreshInit', state.refreshHandler);
    ScrollTrigger.refresh();
  }

  function teardownCinematic() {
    if (state.refreshHandler && hasGsap()) {
      window.ScrollTrigger.removeEventListener('refreshInit', state.refreshHandler);
    }
    state.refreshHandler = null;
    if (state.ctx) { state.ctx.revert(); state.ctx = null; }
    state.master = null;
    state.trigger = null;
    state.roomTarget = [];
    clearOrigins();
    if (progressBar) progressBar.style.transform = '';
  }

  function nearestRoom(progress) {
    let best = 0; let bestDist = Infinity;
    state.roomTarget.forEach((p, i) => {
      const d = Math.abs(p - progress);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  /* ------------------------------------------------------------------
     Standard mode: sections in normal flow + gentle reveal on entry
     ------------------------------------------------------------------ */
  function buildStandard() {
    html.dataset.mode = 'standard';
    if (!('IntersectionObserver' in window)) {
      panels.forEach((p) => p.classList.add('in-view'));
      return;
    }
    const ratios = new Map();
    state.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('in-view');
        ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
      });
      let best = null; let bestRatio = 0;
      ratios.forEach((r, el) => { if (r > bestRatio) { bestRatio = r; best = el; } });
      if (best) setActiveRoom(panels.indexOf(best));
    }, { threshold: [0, 0.15, 0.35, 0.6], rootMargin: '-10% 0px -10% 0px' });
    panels.forEach((p) => state.io.observe(p));
  }
  function teardownStandard() {
    if (state.io) { state.io.disconnect(); state.io = null; }
    panels.forEach((p) => p.classList.remove('in-view'));
  }

  /* ------------------------------------------------------------------
     Mode switching
     ------------------------------------------------------------------ */
  function applyMode(opts) {
    const options = opts || {};
    const next = wantsCinematic() ? 'cinematic' : 'standard';
    html.dataset.static = prefersStatic() ? 'true' : 'false';
    if (next === state.mode && !options.force) return;

    const room = state.currentRoom;
    if (state.mode === 'cinematic') teardownCinematic();
    if (state.mode === 'standard') teardownStandard();
    state.mode = next;
    if (next === 'cinematic') buildCinematic(); else buildStandard();

    if (options.keepRoom && room > 0) {
      window.requestAnimationFrame(() => goToRoom(room, { instant: true, silent: true }));
    }
  }

  /* ------------------------------------------------------------------
     Room navigation
     ------------------------------------------------------------------ */
  function setActiveRoom(i) {
    if (i === state.currentRoom && html.dataset.room) return;
    state.currentRoom = i;
    html.dataset.room = String(i);
    dots.forEach((d) => { if (Number(d.dataset.room) === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    navLinks.forEach((a) => { if (Number(a.dataset.room) === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }

  function goToRoom(index, opts) {
    const options = opts || {};
    const i = Math.max(0, Math.min(panels.length - 1, Number(index) || 0));
    const behavior = options.instant || prefersStatic() ? 'auto' : 'smooth';
    if (state.mode === 'cinematic' && state.trigger) {
      const st = state.trigger;
      const top = st.start + (st.end - st.start) * state.roomTarget[i];
      window.scrollTo({ top: top, behavior: behavior });
    } else {
      panels[i].scrollIntoView({ behavior: behavior, block: 'start' });
    }
    if (!options.silent && window.history && window.history.replaceState) {
      const url = i === 0 ? window.location.pathname + window.location.search : '#' + panels[i].id;
      window.history.replaceState(null, '', url);
    }
  }

  function closeMenu() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function wireNavigation() {
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }
    document.addEventListener('click', (e) => {
      const el = e.target.closest('a[data-room], button[data-room]');
      if (!el) return;
      e.preventDefault();
      if (el.dataset.service) prefillEnquiry(el.dataset.service, el.dataset.message || '');
      closeMenu();
      goToRoom(el.dataset.room);
    });
    window.addEventListener('hashchange', () => {
      const i = panels.findIndex((p) => '#' + p.id === window.location.hash);
      if (i >= 0) goToRoom(i, { silent: true });
    });
  }

  function updateToggle() {
    if (!motionToggle) return;
    const systemReduced = mqReduce.matches;
    const off = prefersStatic();
    motionToggle.setAttribute('aria-pressed', String(userReduced));
    motionToggle.disabled = systemReduced;
    motionToggle.title = systemReduced
      ? 'Following your system’s reduced-motion setting'
      : 'Switch between the cinematic scroll and a standard page';
    $('.motion-label', motionToggle).textContent = off ? 'Motion off' : 'Motion on';
  }
  function wireMotionToggle() {
    if (!motionToggle) return;
    motionToggle.addEventListener('click', () => {
      userReduced = !userReduced;
      store.set('norvex:motion', userReduced ? 'reduced' : 'full');
      updateToggle();
      applyMode({ keepRoom: true });
    });
    updateToggle();
  }

  /* ------------------------------------------------------------------
     Formatting helpers
     ------------------------------------------------------------------ */
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const fmtGBP = (n) => gbp.format(Math.round(n));
  const fmtPct = (n, d) => Number(n).toFixed(d == null ? 2 : d) + '%';
  const fmtInt = (n) => new Intl.NumberFormat('en-GB').format(n);
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  /* ------------------------------------------------------------------
     Widget 1 — Property search + featured listings (Grand Foyer)
     ------------------------------------------------------------------ */
  const LISTINGS = [
    { id: 1, name: 'Hawthorne House', area: 'Hampstead', region: 'London', intent: 'buy', type: 'house', price: 4250000, beds: 5, baths: 4, sqft: 4820, thumb: 'th-house', featured: true },
    { id: 2, name: 'The Penthouse, Albion Wharf', area: 'Richmond', region: 'London', intent: 'buy', type: 'penthouse', price: 2750000, beds: 3, baths: 3, sqft: 2150, thumb: 'th-penthouse', featured: true },
    { id: 3, name: 'Orchard Lodge', area: 'Chipping Campden', region: 'Cotswolds', intent: 'buy', type: 'house', price: 1650000, beds: 4, baths: 3, sqft: 2900, thumb: 'th-lodge', featured: true },
    { id: 4, name: 'Wexcombe Park', area: 'Surrey Hills', region: 'Surrey', intent: 'buy', type: 'estate', price: 7900000, beds: 8, baths: 7, sqft: 11200, thumb: 'th-estate' },
    { id: 5, name: 'Marlow riverside apartment', area: 'Marlow', region: 'Buckinghamshire', intent: 'buy', type: 'apartment', price: 985000, beds: 2, baths: 2, sqft: 1180, thumb: 'th-penthouse' },
    { id: 6, name: 'Eaton Terrace apartment', area: 'Belgravia', region: 'London', intent: 'let', type: 'apartment', price: 5200, beds: 2, baths: 2, sqft: 1240, thumb: 'th-penthouse', featured: true },
    { id: 7, name: 'Mill House', area: 'Bath', region: 'Somerset', intent: 'let', type: 'house', price: 6900, beds: 4, baths: 3, sqft: 3100, thumb: 'th-lodge', featured: true },
    { id: 8, name: 'Kensington Gate townhouse', area: 'Kensington', region: 'London', intent: 'let', type: 'house', price: 14500, beds: 5, baths: 4, sqft: 3800, thumb: 'th-house', featured: true },
  ];
  const PRICE_BANDS = {
    buy: [['any', 'Any price'], ['0-1000000', 'Up to £1m'], ['1000000-2500000', '£1m to £2.5m'], ['2500000-5000000', '£2.5m to £5m'], ['5000000-', '£5m and above']],
    let: [['any', 'Any rent'], ['0-5000', 'Up to £5,000 pcm'], ['5000-10000', '£5,000 to £10,000 pcm'], ['10000-', '£10,000 pcm and above']],
  };

  function listingCard(l) {
    const price = l.intent === 'let' ? fmtGBP(l.price) + ' <small>pcm</small>' : fmtGBP(l.price);
    const badge = l.intent === 'let' ? 'To let' : 'For sale';
    const service = l.intent === 'let' ? 'letting' : 'buying';
    const message = 'I’d like to arrange a viewing of ' + l.name + ', ' + l.area + '.';
    return (
      '<article class="listing">' +
        '<div class="listing-media"><svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#' + l.thumb + '"/></svg><span class="badge">' + badge + '</span></div>' +
        '<div class="listing-body">' +
          '<p class="listing-price">' + price + '</p>' +
          '<h3 class="listing-name">' + l.name + '</h3>' +
          '<p class="listing-area">' + l.area + ', ' + l.region + '</p>' +
          '<ul class="listing-meta"><li>' + l.beds + ' bed</li><li>' + l.baths + ' bath</li><li>' + fmtInt(l.sqft) + ' sq ft</li></ul>' +
          '<a class="link" href="#contact" data-room="5" data-service="' + service + '" data-message="' + message.replace(/"/g, '&quot;') + '">Arrange a viewing<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
        '</div>' +
      '</article>'
    );
  }

  function propertyInit() {
    const form = $('#property-search');
    const grid = $('#listing-grid');
    const status = $('#search-status');
    const priceSel = $('#s-price');
    if (!form || !grid) return;

    const intent = () => (form.querySelector('input[name="intent"]:checked') || {}).value || 'buy';
    function fillPriceBands() {
      const bands = PRICE_BANDS[intent()];
      priceSel.innerHTML = bands.map((b) => '<option value="' + b[0] + '">' + b[1] + '</option>').join('');
    }
    function render(list, message) {
      grid.innerHTML = list.length ? list.map(listingCard).join('') : '<p class="listing-empty">No homes match yet. Widen the price band or leave the location blank and we’ll show you what’s close.</p>';
      if (status && message) status.textContent = message;
    }
    function featured(kind) { return LISTINGS.filter((l) => l.intent === kind && l.featured).slice(0, 3); }

    form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', () => {
      fillPriceBands();
      const kind = intent();
      render(featured(kind), kind === 'let' ? 'Featured lets: three homes with tenants moving out this quarter.' : 'Featured this week: three homes our negotiators would buy themselves.');
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const kind = intent();
      const q = ($('#s-location').value || '').trim().toLowerCase();
      const type = $('#s-type').value;
      const band = priceSel.value;
      let results = LISTINGS.filter((l) => l.intent === kind);
      if (q) results = results.filter((l) => (l.area + ' ' + l.region + ' ' + l.name).toLowerCase().includes(q));
      if (type !== 'any') results = results.filter((l) => l.type === type);
      if (band !== 'any') {
        const parts = band.split('-');
        const lo = Number(parts[0]) || 0; const hi = parts[1] ? Number(parts[1]) : Infinity;
        results = results.filter((l) => l.price >= lo && l.price <= hi);
      }
      const total = results.length;
      if (total) {
        const count = total === 1 ? '1 home matches' : total + ' homes match';
        render(results.slice(0, 3), count + (total > 3 ? ' \u2014 showing the first three.' : '.'));
      } else {
        render([], 'No exact matches.');
      }
    });

    fillPriceBands();
    render(featured('buy'));
  }

  /* ------------------------------------------------------------------
     Widget 2 — Mortgage calculator (Executive Office)
     ------------------------------------------------------------------ */
  function monthlyPayment(principal, annualPct, years, type) {
    const r = annualPct / 100 / 12; const n = years * 12;
    if (type === 'interest') return principal * r;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function mortgageInit() {
    const form = $('#mortgage-calc');
    if (!form) return;
    const price = $('#m-price'); const dep = $('#m-deposit'); const rate = $('#m-rate'); const term = $('#m-term');
    const typeBtns = $$('[data-mtype]', form);
    const products = $$('[data-product]', form);
    let mtype = 'repayment';

    function update() {
      const P = Number(price.value); const d = Number(dep.value); const R = Number(rate.value); const Y = Number(term.value);
      const loan = P * (1 - d / 100);
      const m = monthlyPayment(loan, R, Y, mtype);
      const totalPaid = mtype === 'interest' ? m * Y * 12 + loan : m * Y * 12;
      setText('m-price-out', fmtGBP(P));
      setText('m-deposit-out', d + '% · ' + fmtGBP(P * d / 100));
      setText('m-rate-out', fmtPct(R));
      setText('m-term-out', Y + ' years');
      setText('m-monthly', fmtGBP(m));
      setText('m-loan', fmtGBP(loan));
      setText('m-ltv', Math.round(100 - d) + '%');
      setText('m-interest', fmtGBP(totalPaid - loan));
      setText('m-total', fmtGBP(totalPaid));
      setText('m-stress', fmtGBP(monthlyPayment(loan, R + 3, Y, mtype)));
      products.forEach((row) => {
        const pr = Number(row.dataset.rate);
        $('.product-monthly', row).textContent = fmtGBP(monthlyPayment(loan, pr, Y, mtype));
      });
    }
    [price, dep, rate, term].forEach((el) => el.addEventListener('input', update));
    typeBtns.forEach((b) => b.addEventListener('click', () => {
      mtype = b.dataset.mtype;
      typeBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      update();
    }));
    products.forEach((row) => {
      const btn = $('[data-use-rate]', row);
      if (btn) btn.addEventListener('click', () => { rate.value = row.dataset.rate; update(); });
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    update();
  }

  /* ------------------------------------------------------------------
     Widget 3 — Survey comparison chart (Architectural Study)
     Horizontal bars with direct value labels; each bar is a button that
     drives the "what's inspected" breakdown. A table view backs it up.
     ------------------------------------------------------------------ */
  const SURVEYS = [
    { id: 'l1', name: 'Level 1', sub: 'Condition Report', fee: 450, depth: 35, days: 3,
      blurb: 'A traffic-light snapshot for a conventional, newer home in good order. No advice on repairs and no valuation.',
      inspects: { roof: 'visual', walls: 'visual', floors: 'none', services: 'visual', drainage: 'none', loft: 'none', outbuildings: 'none', costs: 'none' } },
    { id: 'l2', name: 'Level 2', sub: 'HomeBuyer Survey', fee: 700, depth: 65, days: 5,
      blurb: 'The most-chosen survey for conventional properties under about 100 years old. Flags the defects that affect value and tells you what to do next.',
      inspects: { roof: 'visual', walls: 'full', floors: 'visual', services: 'visual', drainage: 'visual', loft: 'visual', outbuildings: 'visual', costs: 'none' } },
    { id: 'l3', name: 'Level 3', sub: 'Building Survey', fee: 1250, depth: 95, days: 7,
      blurb: 'A full structural inspection for older, listed, unusual or heavily altered homes, and anything you plan to renovate. Includes repair options and indicative costs.',
      inspects: { roof: 'full', walls: 'full', floors: 'full', services: 'full', drainage: 'full', loft: 'full', outbuildings: 'full', costs: 'full' } },
    { id: 'defect', name: 'Defect report', sub: 'Single issue', fee: 400, depth: 25, days: 4,
      blurb: 'One issue investigated properly: damp, cracking, roof movement or timber decay, with a clear remedial plan and cost band.',
      inspects: { roof: 'visual', walls: 'full', floors: 'visual', services: 'none', drainage: 'none', loft: 'none', outbuildings: 'none', costs: 'full' } },
  ];
  const INSPECT_ITEMS = [
    ['roof', 'Roof structure & coverings'], ['walls', 'Walls, damp & movement'], ['floors', 'Floors & timbers'],
    ['services', 'Electrics, gas & plumbing'], ['drainage', 'Drainage'], ['loft', 'Loft & roof void'],
    ['outbuildings', 'Outbuildings & grounds'], ['costs', 'Repair cost estimates'],
  ];
  const LEVELS = { full: ['Full', 'i-check'], visual: ['Visual', 'i-half'], none: ['Not included', 'i-dash'] };
  const METRICS = {
    fee: { label: 'typical fee', max: 1400, fmt: (v) => fmtGBP(v) },
    depth: { label: 'inspection depth', max: 100, fmt: (v) => v + ' / 100' },
    days: { label: 'turnaround', max: 8, fmt: (v) => v + ' working days' },
  };

  function surveyInit() {
    const bars = $('#survey-bars'); const metricBtns = $$('#survey-metrics [data-metric]');
    const tbody = $('#survey-table tbody'); const list = $('#inspect-list');
    if (!bars) return;
    let metric = 'fee'; let selected = 'l2';

    bars.innerHTML = SURVEYS.map((s) =>
      '<button type="button" class="bar-row" data-survey="' + s.id + '" aria-pressed="' + (s.id === selected) + '">' +
        '<span class="bar-label">' + s.name + '<small>' + s.sub + '</small></span>' +
        '<span class="bar-track" aria-hidden="true"><span class="bar-fill"></span></span>' +
        '<span class="bar-value"></span>' +
      '</button>').join('');
    if (tbody) {
      tbody.innerHTML = SURVEYS.map((s) => '<tr><th scope="row">' + s.name + ' · ' + s.sub + '</th><td>' + METRICS.fee.fmt(s.fee) + '</td><td>' + METRICS.depth.fmt(s.depth) + '</td><td>' + METRICS.days.fmt(s.days) + '</td></tr>').join('');
    }

    function paintBars() {
      const m = METRICS[metric];
      $$('.bar-row', bars).forEach((row) => {
        const s = SURVEYS.find((x) => x.id === row.dataset.survey);
        const v = s[metric];
        $('.bar-fill', row).style.width = Math.round((v / m.max) * 100) + '%';
        $('.bar-value', row).textContent = m.fmt(v);
        row.setAttribute('aria-label', s.name + ' ' + s.sub + ': ' + m.label + ' ' + m.fmt(v));
      });
      setText('survey-metric-label', m.label);
    }
    function paintBreakdown() {
      const s = SURVEYS.find((x) => x.id === selected);
      setText('survey-selected-name', s.name + ' · ' + s.sub);
      setText('survey-selected-blurb', s.blurb);
      if (list) {
        list.innerHTML = INSPECT_ITEMS.map((item) => {
          const lvl = s.inspects[item[0]]; const meta = LEVELS[lvl];
          return '<li><span>' + item[1] + '</span><span class="inspect-level level-' + lvl + '"><svg class="icon" aria-hidden="true"><use href="#' + meta[1] + '"/></svg>' + meta[0] + '</span></li>';
        }).join('');
      }
      $$('.bar-row', bars).forEach((row) => row.setAttribute('aria-pressed', String(row.dataset.survey === selected)));
    }

    metricBtns.forEach((b) => b.addEventListener('click', () => {
      metric = b.dataset.metric;
      metricBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      paintBars();
    }));
    bars.addEventListener('click', (e) => {
      const row = e.target.closest('.bar-row');
      if (!row) return;
      selected = row.dataset.survey;
      paintBreakdown();
    });
    paintBars();
    paintBreakdown();
  }

  /* ------------------------------------------------------------------
     Widget 4 — Bridging calculator (The Vault)
     ------------------------------------------------------------------ */
  function bridgingInit() {
    const form = $('#bridging-calc');
    if (!form) return;
    const gross = $('#b-gross'); const months = $('#b-term'); const mrate = $('#b-rate');
    const methodBtns = $$('[data-method]', form);
    const FEE = 0.02;
    let method = 'retained';

    function update() {
      const G = Number(gross.value); const n = Number(months.value); const r = Number(mrate.value) / 100;
      const monthly = G * r; const interest = monthly * n; const fee = G * FEE;
      const net = method === 'retained' ? G - fee - interest : G - fee;
      setText('b-gross-out', fmtGBP(G));
      setText('b-term-out', n + (n === 1 ? ' month' : ' months'));
      setText('b-rate-out', fmtPct(Number(mrate.value)));
      setText('b-net', fmtGBP(net));
      setText('b-monthly', method === 'retained' ? fmtGBP(monthly) + ' (retained)' : fmtGBP(monthly));
      setText('b-interest', fmtGBP(interest));
      setText('b-fee', fmtGBP(fee));
      setText('b-cost', fmtGBP(interest + fee));
      setText('b-repay', fmtGBP(G));
      setText('b-note', method === 'retained'
        ? 'Retained interest is deducted from the advance, so there are no monthly payments during the term.'
        : 'Serviced interest is paid monthly, so more of the gross loan reaches you on day one.');
    }
    [gross, months, mrate].forEach((el) => el.addEventListener('input', update));
    methodBtns.forEach((b) => b.addEventListener('click', () => {
      method = b.dataset.method;
      methodBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      update();
    }));
    form.addEventListener('submit', (e) => e.preventDefault());
    update();
  }

  /* ------------------------------------------------------------------
     Widget 5 — Enquiry form (Garden Terrace)
     Validates on blur, inline errors linked by aria-describedby, and a
     focusable error summary on submit. No backend: success is simulated.
     ------------------------------------------------------------------ */
  const VALIDATORS = {
    name: (v) => v.trim().length >= 2 || 'Enter your full name',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter an email address we can reply to',
    phone: (v) => !v.trim() || /^[+\d][\d\s().-]{6,}$/.test(v.trim()) || 'Enter a phone number, or leave this blank',
    service: (v) => !!v || 'Choose the service you’re enquiring about',
    message: (v) => v.trim().length >= 10 || 'Tell us a little about what you need (at least 10 characters)',
    consent: (v, el) => el.checked || 'Confirm you’re happy for us to contact you',
  };

  function validateField(el) {
    const fn = VALIDATORS[el.name];
    if (!fn) return true;
    const result = fn(el.value, el);
    const err = document.getElementById(el.id + '-error');
    if (result === true) {
      el.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
      return true;
    }
    el.setAttribute('aria-invalid', 'true');
    if (err) { err.textContent = result; err.hidden = false; }
    return result;
  }

  function contactInit() {
    const form = $('#enquiry-form');
    if (!form) return;
    const summary = $('#form-errors'); const list = $('#form-errors-list'); const success = $('#form-success');
    const fields = $$('input, select, textarea', form);

    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') validateField(el); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validateField(el); });
      el.addEventListener('change', () => { if (el.getAttribute('aria-invalid') === 'true') validateField(el); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errors = [];
      fields.forEach((el) => { const r = validateField(el); if (r !== true) errors.push({ el: el, msg: r }); });
      if (errors.length) {
        list.innerHTML = '';
        errors.forEach((item) => {
          const li = document.createElement('li'); const a = document.createElement('a');
          a.href = '#' + item.el.id; a.textContent = item.msg;
          a.addEventListener('click', (ev) => { ev.preventDefault(); item.el.focus(); });
          li.appendChild(a); list.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true; btn.textContent = 'Sending…';
      window.setTimeout(() => {
        const first = ($('#c-name').value || '').trim().split(/\s+/)[0];
        $('[data-name]', success).textContent = first || 'there';
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }, 600);
    });
  }

  function prefillEnquiry(service, message) {
    const sel = $('#c-service');
    if (sel && Array.from(sel.options).some((o) => o.value === service)) {
      sel.value = service;
      if (sel.getAttribute('aria-invalid') === 'true') validateField(sel);
    }
    const msg = $('#c-message');
    if (msg && message && !msg.value.trim()) msg.value = message;
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function init() {
    wireNavigation();
    wireMotionToggle();
    propertyInit();
    mortgageInit();
    surveyInit();
    bridgingInit();
    contactInit();

    const hashIdx = panels.findIndex((p) => '#' + p.id === window.location.hash);
    state.currentRoom = hashIdx > 0 ? hashIdx : 0;
    applyMode({ force: true, keepRoom: hashIdx > 0 });
    setActiveRoom(state.currentRoom);

    onMedia(mqWide, () => applyMode({ keepRoom: true }));
    onMedia(mqReduce, () => { updateToggle(); applyMode({ keepRoom: true }); });

    const refresh = () => { if (state.mode === 'cinematic' && hasGsap()) window.ScrollTrigger.refresh(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', () => {
      refresh();
      // The browser performs its own jump to the hash element on load, which in
      // cinematic mode is the pinned container's top; re-apply the room target.
      if (hashIdx > 0) window.setTimeout(() => goToRoom(hashIdx, { instant: true, silent: true }), 60);
    });
  }

  // Public hooks for debugging / tests
  window.Norvex = {
    goToRoom: goToRoom,
    mode: () => state.mode,
    room: () => state.currentRoom,
    roomTarget: () => state.roomTarget.slice(),
    progress: () => (state.trigger ? state.trigger.progress : null),
    applyMode: applyMode,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
