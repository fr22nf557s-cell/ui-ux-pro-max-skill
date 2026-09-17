import pathlib, re
"""Generate the storefront's HTML pages from the templates below.

    python3 scripts/build-pages.py

The pages are committed, so hosting needs nothing but the output; edit the templates here, never
the generated HTML. Sections that depend on the catalogue (game list and count, the graded vault,
brand marquee) are computed from assets/js/catalog.js at build time.
"""
OUT = pathlib.Path(__file__).resolve().parent.parent
SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
I = {
 'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
 'bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
 'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
 'arrow': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
 'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
 'truck': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
 'badge': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
 'package': '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
 'headset': '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3z"/><path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3z"/><path d="M3 11v-1a9 9 0 0 1 18 0v1"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
 'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
 'check': '<path d="M20 6 9 17l-5-5"/>',
 'filter': '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
 'instagram': '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
 'youtube': '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
 'x': '<path d="M4 4l16 16"/><path d="M20 4 4 20"/>',
 'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 'refresh': '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
 'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
}
def ic(n, cls=''):
    fill = ' fill="currentColor"' if n == 'star' else ''
    s = SVG.replace('fill="none"', 'fill="currentColor"') if n == 'star' else SVG
    return f'<svg{(" class=%s" % chr(34)+cls+chr(34)) if cls else ""} {s}>{I[n]}</svg>'

BRAND_MARK = '<svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5Z" stroke="#d9b75b" stroke-width="1.6"/><path d="M13.5 27V13l13 14V13" stroke="#f3d98b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
BRAND = f'<a class="brand" href="index.html" aria-label="Norvex Gaming home">{BRAND_MARK}<span class="brand__word"><span class="brand__name">NORVEX</span><span class="brand__sub">GAMING</span></span></a>'

CANONICAL = ''
def head(title, desc, extra='', canonical=None, pre=''):
    canonical = CANONICAL if canonical is None else canonical
    return f'''<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="UTF-8">
{pre}  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#08080a">
  <link rel="canonical" href="https://norvexgaming.com/{canonical}">
  <meta property="og:url" content="https://norvexgaming.com/{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://norvexgaming.com/assets/img/products/pokemon-30th-celebration-elite-trainer-box.webp">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/norvex.css">
{extra}</head>'''

def header(solid=False):
    attr = ' data-header="solid"' if solid else ' data-header'
    return f'''  <a class="skip-link" href="#main">Skip to content</a>
  <div class="announce"><div class="container"><span>Free insured shipping on orders over <span data-free-ship>£100</span><span class="announce__more"> &nbsp;·&nbsp; <a href="shop.html?avail=preorder">Pre-orders now open</a></span></span></div></div>
  <header class="header"{attr}>
    <div class="container">
      <nav class="nav" aria-label="Primary">
        {BRAND}
        <div class="nav__links">
          <a href="shop.html">Shop</a>
          <a href="shop.html?game=pokemon">Pokémon</a>
          <a href="shop.html?game=magic">Magic</a>
          <a href="shop.html?game=onepiece">One Piece</a>
          <a href="shop.html?avail=preorder">Pre-orders</a>
{'          <a href="shop.html?type=single">Graded vault</a>' if HAS_SINGLES else '          <a href="shop.html?type=accessory">Accessories</a>'}
        </div>
        <div class="nav__actions">
          <button class="nav__btn" type="button" data-open-search aria-label="Search products" title="Search (press /)">{ic('search')}</button>
          <a class="nav__btn" href="help.html#track" aria-label="Track an order" title="Track an order">{ic('user')}</a>
          <button class="nav__btn" type="button" data-open-cart aria-label="Open cart, 0 items">{ic('bag')}<span class="nav__count" data-cart-count aria-hidden="true">0</span></button>
          <button class="nav__btn nav__menu" type="button" data-open-menu aria-label="Open menu" aria-expanded="false" aria-controls="menu">{ic('menu')}</button>
        </div>
      </nav>
    </div>
  </header>'''

_cat = pathlib.Path(OUT / 'assets/js/catalog.js').read_text()
_counts = {}
for _g in re.findall(r'"game": "([a-z]+)"', _cat): _counts[_g] = _counts.get(_g, 0) + 1
_names = dict(re.findall(r'\n    "([a-z]+)": \{\n      "name": "([^"]+)"', _cat))
GAME_COUNT = sum(1 for k in _names if _counts.get(k) and k != 'norvex')
HAS_SINGLES = '"type": "single"' in _cat
def first_id(pattern):
    m = re.search(r'"id": "(' + pattern + r')"', _cat)
    if not m: raise SystemExit(f'no product matches {pattern}')
    return m.group(1)
RANGE = 'sealed product, graded singles and pre-orders' if HAS_SINGLES else 'sealed product, pre-orders and accessories'
GAME_LINKS = '\n'.join(f'          <li><a href="shop.html?game={k}">{_names.get(k, k)}</a></li>' for k in _names if _counts.get(k) and k != 'norvex')
FOOTER = f'''  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          {BRAND}
          <p>{RANGE[0].upper() + RANGE[1:]} from every major trading card game. Independent, collector-run and obsessive about condition.</p>
          <div class="social" data-social hidden></div>
        </div>
        <div><h4>Shop</h4><ul>
          <li><a href="shop.html">New arrivals</a></li>
          <li><a href="shop.html?avail=preorder">Pre-orders</a></li>
          <li><a href="shop.html?type=box">Booster boxes</a></li>
          <li><a href="shop.html?type=etb">Elite Trainer Boxes</a></li>
          <li><a href="shop.html?type=bundle">Booster bundles</a></li>
          <li><a href="shop.html?type=pack">Booster packs</a></li>
          <li><a href="shop.html?type=deck">Decks &amp; starters</a></li>
{'          <li><a href="shop.html?type=single">Graded singles</a></li>' if HAS_SINGLES else ''}
          <li><a href="shop.html?type=accessory">Accessories</a></li>
        </ul></div>
        <div><h4>Games</h4><ul>
{GAME_LINKS}
        </ul></div>
        <div><h4>Support</h4><ul>
          <li><a href="help.html#shipping">Delivery &amp; insurance</a></li>
          <li><a href="help.html#returns">Returns &amp; refunds</a></li>
          <li><a href="help.html#authenticity">Authenticity guarantee</a></li>
          <li><a href="help.html#preorders">Pre-orders</a></li>
          <li><a href="help.html#track">Track an order</a></li>
          <li><a href="help.html#contact">Contact us</a></li>
        </ul></div>
        <div><h4>Company</h4><ul>
          <li><a href="about.html">About Norvex</a></li>
          <li><a href="about.html#vault">The vault</a></li>
          <li><a href="about.html#wholesale">Trade &amp; wholesale</a></li>
          <li><a href="about.html#consignment">Sell your cards</a></li>
          <li><a href="legal.html">Terms of sale</a></li>
          <li><a href="legal.html#privacy">Privacy &amp; cookies</a></li>
        </ul></div>
      </div>
      <div class="footer__bottom">
        <p class="footer__legal">© <span data-year>2026</span> Norvex Gaming. All rights reserved. Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece Card Game, Disney Lorcana, Star Wars: Unlimited, Digimon Card Game, Dragon Ball Super Card Game, PSA and all related names, marks and artwork are trademarks of their respective owners. Norvex Gaming is an independent retailer and is not affiliated with or endorsed by any of them.</p>
        <div class="pay" aria-label="Accepted payment methods"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>Apple Pay</span><span>Google Pay</span><span>Klarna</span></div>
      </div>
    </div>
  </footer>
  <script src="assets/js/catalog.js"></script>
  <script src="assets/js/norvex.js"></script>
</body>
</html>
'''

def tcard(cls, product_id, top, name, meta):
    return f'''        <div class="tcard__float {cls}"><div class="tcard">
          <div class="tcard__top"><span>Norvex</span><b>{top}</b></div>
          <div class="tcard__art tcard__art--photo" data-art-product="{product_id}"></div>
          <div><div class="tcard__name">{name}</div><div class="tcard__meta">{meta}</div></div>
        </div></div>'''

def guide(i, product_id, title, text, href, cta):
    return f'''          <a class="guide__card reveal" style="--i:{i}" href="{href}">
            <div class="guide__media" data-art-product="{product_id}" aria-hidden="true"></div>
            <div class="guide__body"><h3 class="h3">{title}</h3><p>{text}</p><span class="btn btn--link">{cta} {ic('arrow')}</span></div>
          </a>'''

def pillar(i, icon, title, text):
    return f'''          <div class="pillar reveal" style="--i:{i}">
            <div class="pillar__icon">{ic(icon)}</div>
            <div><div class="pillar__num">0{i+1}</div><h3 class="h4">{title}</h3><p>{text}</p></div>
          </div>'''

def testimonial(i, initials, name, quote):
    return f'''        <figure class="testimonial glass reveal" style="--i:{i}">
          <div class="testimonial__stars" role="img" aria-label="5 out of 5 stars">{ic('star')*5}</div>
          <blockquote>“{quote}”</blockquote>
          <figcaption><span class="testimonial__avatar" aria-hidden="true">{initials}</span><span>{name}<br><span class="testimonial__verified">{ic('check')} Verified buyer</span></span></figcaption>
        </figure>'''

def bento(cls, href, glow, art_id, kicker, title, desc, cta):
    return f'''        <a class="bento__item {cls} reveal" href="{href}" style="--g:{glow}">
          <div class="bento__glow"></div>
          <div class="bento__art" data-art-product="{art_id}" aria-hidden="true"></div>
          <div class="bento__text">
            <span class="bento__kicker">{kicker}</span>
            <span class="bento__title">{title}</span>
            <p class="bento__desc">{desc}</p>
            <span class="bento__cta">{cta} {ic('arrow')}</span>
          </div>
        </a>'''

marquee = ''.join(f'<span class="marquee__item">{_names[k]}</span>' for k in _names if _counts.get(k) and k != 'norvex')

VAULT = f'''    <!-- ========================================================= VAULT -->
    <section class="section vault" aria-labelledby="vault-title">
      <div class="vault__bg" aria-hidden="true"></div>
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">The vault</span>
            <h2 class="h2 reveal" id="vault-title" style="--i:1">Investment-grade singles, <em>verified.</em></h2>
            <p class="lede reveal" style="--i:2">PSA-graded slabs held in our own stock. Every certification number is checked on PSA’s registry before a card is listed, and again before it ships.</p>
          </div>
          <a class="btn btn--link reveal" href="shop.html?type=single" style="--i:3">Explore the vault {ic('arrow')}</a>
        </div>
        <div class="grid grid--products" data-products="type:single" data-limit="4"></div>
      </div>
    </section>''' if HAS_SINGLES else ''

CANONICAL = ''
INDEX = head('Norvex Gaming — Sealed TCG product, ' + ('graded singles &amp; pre-orders' if HAS_SINGLES else 'pre-orders &amp; accessories'),
             f'Norvex Gaming is the vault for serious collectors: factory-sealed booster boxes, bundles and Elite Trainer Boxes{", authenticated graded singles" if HAS_SINGLES else ""} and pre-orders across Pokémon, Magic, One Piece, Yu-Gi-Oh!, Lorcana and more. Tracked, insured UK delivery.') + f'''
<body data-page="home">
{header()}
  <main id="main">
    <!-- ============================================================ HERO -->
    <section class="hero noise" data-hero aria-labelledby="hero-title">
      <div class="hero__bg vignette" aria-hidden="true">
        <div class="aurora"><span></span><span></span><span></span></div>
        <div class="gridlines"></div>
      </div>
      <div class="container">
        <div class="hero__grid">
          <div class="hero__copy">
            <span class="eyebrow reveal" style="--i:0">Independent UK retailer · {"Sealed · Singles · Graded" if HAS_SINGLES else "Sealed · Pre-orders · Accessories"}</span>
            <h1 class="display reveal" id="hero-title" style="--i:1">The vault for <em>serious</em> collectors.</h1>
            <p class="lede reveal" style="--i:2">Every major trading card game. Factory-sealed boxes, bundles and Elite Trainer Boxes{', authenticated graded singles' if HAS_SINGLES else ''} and pre-orders on the biggest releases at a fixed price, shipped tracked and insured across the UK.</p>
            <div class="hero__cta reveal" style="--i:3">
              <a class="btn btn--primary btn--lg" href="shop.html">Shop new arrivals {ic('arrow')}</a>
              <a class="btn btn--ghost btn--lg" href="shop.html?avail=preorder">View pre-orders</a>
            </div>
            <ul class="hero__trust reveal" style="--i:4">
              <li>{ic('shield')}100% authentic, guaranteed</li>
              <li>{ic('truck')}Tracked &amp; insured delivery</li>
              <li>{ic('refresh')}14-day returns on sealed product</li>
            </ul>
          </div>
          <div class="stage reveal reveal--scale" style="--i:2" data-stage aria-hidden="true">
            <div class="stage__glow"></div>
            <div class="stage__ring"></div>
{tcard('tcard--1', 'magic-edge-of-eternities-collector-booster-box', 'Sealed', 'Edge of Eternities', 'Collector Booster Box · Magic')}
{tcard('tcard--2', 'pokemon-mega-evolution-pitch-black-elite-trainer-box', 'Sealed', 'Pitch Black ETB', 'Mega Evolution · Pokémon')}
{tcard('tcard--3', 'onepiece-op-17-the-world-s-strongest-warriors-booster-pack', 'New', 'OP-17 Booster', 'The World’s Strongest Warriors')}
            <div class="stage__slab"></div>
          </div>
        </div>
      </div>
      <div class="scroll-cue" aria-hidden="true">Scroll<span></span></div>
    </section>

    <section class="stats" aria-label="What every order gets">
      <div class="container">
        <div class="stats__grid">
          <div class="stat reveal" style="--i:0"><span class="stat__value">100<em>%</em></span><span class="stat__label">Insured delivery</span></div>
          <div class="stat reveal" style="--i:1"><span class="stat__value">48<em>h</em></span><span class="stat__label">Dispatch on in-stock orders</span></div>
          <div class="stat reveal" style="--i:2"><span class="stat__value">14<em>d</em></span><span class="stat__label">Returns on sealed product</span></div>
          <div class="stat reveal" style="--i:3"><span class="stat__value">{GAME_COUNT}</span><span class="stat__label">Games stocked</span></div>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee__track" data-marquee>{marquee}</div></div>

    <!-- ==================================================== NEW ARRIVALS -->
    <section class="section" id="new" aria-labelledby="new-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">This week's drops</span>
            <h2 class="h2 reveal" id="new-title" style="--i:1">Fresh from the <em>distributor.</em></h2>
          </div>
          <a class="btn btn--link reveal" href="shop.html" style="--i:2">View all products {ic('arrow')}</a>
        </div>
        <div class="grid grid--products" data-products="featured" data-limit="8"></div>
      </div>
    </section>

    <!-- ====================================================== CATEGORIES -->
    <section class="section section--tight" aria-labelledby="cat-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">Shop by category</span>
            <h2 class="h2 reveal" id="cat-title" style="--i:1">From a single booster to a <em>sealed case.</em></h2>
          </div>
        </div>
        <div class="bento">
{bento('bento__item--wide', 'shop.html?type=etb', 'rgba(255,203,5,.28)', 'pokemon-30th-celebration-elite-trainer-box', 'Pokémon · Lorcana · Magic', 'Elite Trainer Boxes', 'Nine packs, a promo and the full accessory kit, sealed at the factory and double-boxed by us.', 'Shop ETBs')}
{bento('bento__item--tall', 'shop.html?type=box', 'rgba(212,169,42,.28)', 'magic-edge-of-eternities-play-booster-box', 'Every game', 'Booster Boxes', 'Full sealed displays from 24 to 36 packs. Collector, Play and Set formats.', 'Shop boxes')}
{bento('', 'shop.html?type=bundle', 'rgba(42,117,187,.3)', 'pokemon-mega-evolution-chaos-rising-booster-bundle', 'Best value', 'Booster Bundles', 'Six-pack bundles and single packs for the chase without the case.', 'Shop bundles')}
{bento('bento__item--wide', 'shop.html?type=single', 'rgba(167,139,250,.3)', first_id('[a-z0-9-]*-psa-[0-9]+'), 'PSA graded', 'Graded Singles', 'Collector-grade cards in PSA slabs, cert-checked and shipped insured.', 'Enter the vault') if HAS_SINGLES else bento('bento__item--wide', 'shop.html?type=pack', 'rgba(167,139,250,.3)', first_id('pokemon-[a-z0-9-]*-booster-pack'), 'Sold loose, never weighed', 'Booster Packs', 'Single packs straight from unopened displays, for the chase without the case.', 'Shop packs')}
{bento('bento__item--md-wide', 'shop.html?type=accessory', 'rgba(217,183,91,.28)', 'yugioh-kuriboh-kollection-card-sleeves', 'Sleeves · mats · binders', 'Accessories', 'Official sleeves, game mats, card cases and portfolios from Konami and Bandai.', 'Shop accessories')}
        </div>
      </div>
    </section>

    <!-- ================================================== THE STANDARD -->
    <section class="section" aria-labelledby="std-title">
      <div class="container split">
        <div class="split__sticky stack" style="gap:1.5rem">
          <span class="eyebrow reveal" style="--i:0">The Norvex standard</span>
          <h2 class="h2 reveal" id="std-title" style="--i:1">Built like a bank. <em>Run by collectors.</em></h2>
          <p class="lede reveal" style="--i:2">We treat a £4 booster pack with the same care as a four-figure slab. Direct-from-distributor sourcing, sealed storage and a packing protocol built around one thing: corners arrive exactly as they left the factory.</p>
          <div class="reveal" style="--i:3"><a class="btn btn--outline" href="help.html#authenticity">Read our authenticity guarantee {ic('arrow')}</a></div>
        </div>
        <div class="pillars">
{pillar(0, 'shield', 'Authenticity, guaranteed', 'Sourced directly from official distributors. Every sealed product is tamper-checked, weighed and logged before it enters the vault. Every graded single ships with a certification you can verify yourself.')}
{pillar(1, 'package', 'Vault-grade packaging', 'Double-boxed, corner-protected and sleeved. Your Elite Trainer Box arrives in the condition it left the factory, or we replace it.')}
{pillar(2, 'truck', 'Insured, tracked delivery', 'In-stock orders dispatch within 48 hours, tracked and insured to your door across the UK, free over £100. Pre-orders ship on release day.')}
{pillar(3, 'headset', 'Collector concierge', 'Pre-orders at a fixed price with a full refund if the allocation falls through, straight answers by email within one working day, and 14-day returns on anything still sealed.')}
        </div>
      </div>
    </section>

{VAULT}

    <!-- ===================================================== PRE-ORDERS -->
    <section class="section" aria-labelledby="pre-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">Pre-orders</span>
            <h2 class="h2 reveal" id="pre-title" style="--i:1">Reserve the next drop at <em>retail price.</em></h2>
            <p class="lede reveal" style="--i:2">Charged once at checkout at a fixed price, dispatched tracked and insured on release day. If the publisher cuts our allocation, you get a full refund straight away.</p>
          </div>
          <a class="btn btn--link reveal" href="shop.html?avail=preorder" style="--i:3">All pre-orders {ic('arrow')}</a>
        </div>
        <div class="grid grid--products" data-products="preorder" data-limit="4"></div>
      </div>
    </section>

    <!-- ================================================== BUYING GUIDE -->
    <section class="section section--tight" aria-labelledby="guide-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">New to sealed?</span>
            <h2 class="h2 reveal" id="guide-title" style="--i:1">Pick the format that <em>fits the chase.</em></h2>
          </div>
        </div>
        <div class="guide">
{guide(0, 'pokemon-mega-evolution-chaos-rising-booster-bundle', 'Booster bundle', 'Six packs of one set in a printed sleeve. The cheapest way to open a new set on release weekend.', 'shop.html?type=bundle', 'Shop bundles')}
{guide(1, 'pokemon-30th-celebration-elite-trainer-box', 'Elite Trainer Box', 'Nine packs plus sleeves, dice, markers and a promo card. The whole set in one gift-ready box.', 'shop.html?type=etb', 'Shop ETBs')}
{guide(2, 'magic-edge-of-eternities-collector-booster-box', 'Booster box', 'A full sealed display, 24 to 36 packs. The best price per pack and the format collectors hold long term.', 'shop.html?type=box', 'Shop boxes')}
        </div>
      </div>
    </section>

    <!-- ==================================================== NEWSLETTER -->
    <section class="section section--tight" aria-labelledby="nl-title">
      <div class="container">
        <div class="newsletter glass noise reveal">
          <span class="eyebrow eyebrow--plain">The allocation list</span>
          <h2 class="h2" id="nl-title">First access. <em>Zero noise.</em></h2>
          <p class="lede" style="text-align:center">Allocation alerts, restocks and vault drops. One email a week, never more.</p>
          <form class="newsletter__form" data-newsletter novalidate>
            <div class="field">
              <label class="field__label" for="nl-email">Email address</label>
              <input class="input" id="nl-email" type="email" name="email" autocomplete="email" placeholder="you@example.com" required aria-describedby="nl-error">
            </div>
            <button class="btn btn--primary" type="submit">Join the list</button>
            <span class="field__error" id="nl-error" style="grid-column:1/-1">Enter a valid email address.</span>
          </form>
          <p class="newsletter__success" role="status">{ic('check')} Your email app should open with the request ready to send. If it doesn't, email <a href="mailto:hello@norvexgaming.com?subject=Allocation%20list">hello@norvexgaming.com</a> with the subject “Allocation list”.</p>
          <p class="newsletter__fine">One email a week at most. Unsubscribe by replying “stop”.</p>
        </div>
      </div>
    </section>
  </main>
{FOOTER}'''

CANONICAL = 'shop.html'
SHOP = head('All products · Norvex Gaming',
            f'Browse factory-sealed booster boxes, bundles and Elite Trainer Boxes{" plus authenticated graded singles" if HAS_SINGLES else ", packs, decks and accessories"} across every major TCG. Filter by game, product type, availability and price.') + f'''
<body data-page="shop">
{header(solid=True)}
  <main id="main">
    <div class="container">
      <div class="page-head">
        <ol class="crumbs" aria-label="Breadcrumb">
          <li><a href="index.html">Home</a></li>
          <li><a href="shop.html">Shop</a></li>
          <li aria-current="page" data-shop-crumb>All products</li>
        </ol>
        <h1 class="h2" data-shop-title>All products</h1>
        <p class="lede">Factory-sealed boxes, bundles and Elite Trainer Boxes{", plus authenticated graded singles" if HAS_SINGLES else ", packs, decks and official accessories"}. Every item checked before it is listed and again before it ships.</p>
      </div>
      <div class="shop">
        <aside class="filters" id="filters" data-filters aria-label="Filter products"></aside>
        <div>
          <div class="toolbar">
            <span class="toolbar__count" data-shop-count aria-live="polite"></span>
            <div class="toolbar__right">
              <button class="btn btn--ghost btn--sm lg-hidden" type="button" data-toggle-filters aria-expanded="false" aria-controls="filters">{ic('filter')} Filters</button>
              <div class="toolbar__sort">
                <label for="sort">Sort</label>
                <select class="input" id="sort" data-sort>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>
          </div>
          <div class="active-filters" data-active-filters aria-label="Active filters"></div>
          <div class="grid grid--products" data-shop-grid></div>
        </div>
      </div>
    </div>
  </main>
{FOOTER}'''

CANONICAL = 'product.html'
PRODUCT = head('Product · Norvex Gaming',
               f'Factory-sealed product{" and authenticated graded singles" if HAS_SINGLES else ""} from Norvex Gaming, shipped tracked and insured across the UK.') + f'''
<body data-page="product">
{header(solid=True)}
  <main id="main">
    <div class="container">
      <div class="page-head" style="padding-bottom:1.5rem">
        <ol class="crumbs" aria-label="Breadcrumb">
          <li><a href="index.html">Home</a></li>
          <li><a href="shop.html">Shop</a></li>
          <li><a href="shop.html" data-pdp-game>Game</a></li>
          <li aria-current="page" data-pdp-crumb>Product</li>
        </ol>
      </div>
      <div class="pdp" data-pdp>
        <!-- Rendered by assets/js/norvex.js from ?id=<product id> -->
        <div class="pdp__gallery"><div class="pdp__media" aria-busy="true"></div></div>
        <div class="pdp__info"><p class="muted">Loading product…</p></div>
      </div>
      <section class="section section--tight" aria-labelledby="rel-title" data-related-section style="padding-top:0">
        <div class="section-head">
          <div class="section-head__text">
            <span class="eyebrow reveal" style="--i:0">Complete the set</span>
            <h2 class="h2 reveal" id="rel-title" style="--i:1">You may also <em>like.</em></h2>
          </div>
          <a class="btn btn--link reveal" href="shop.html" style="--i:2">View all products {ic('arrow')}</a>
        </div>
        <div class="grid grid--products" data-related></div>
      </section>
    </div>
  </main>
{FOOTER}'''


ORDER = head('Order confirmed · Norvex Gaming', 'Your Norvex Gaming order is confirmed.', extra='  <meta name="robots" content="noindex">\n', canonical='order.html') + f'''
<body data-page="order">
{header(solid=True)}
  <main id="main">
    <div class="container">
      <div class="page-head" style="padding-bottom:1.5rem">
        <ol class="crumbs" aria-label="Breadcrumb">
          <li><a href="index.html">Home</a></li>
          <li aria-current="page">Your order</li>
        </ol>
      </div>
      <div class="order" data-order>
        <!-- Rendered by assets/js/norvex.js from ?session_id=<Stripe Checkout session> -->
        <div class="order__main"><span class="eyebrow">Order confirmed</span><h1 class="h1">Thank you.</h1><p class="lead muted">Checking your order…</p></div>
      </div>
    </div>
  </main>
{FOOTER}'''

EMAIL = '<a data-email href="mailto:hello@norvexgaming.com">hello@norvexgaming.com</a>'
def textpage(page, canonical, title, desc, crumb, eyebrow, h1, lede, toc, body, extra=''):
    global CANONICAL
    CANONICAL = canonical
    tocs = '\n'.join(f'            <li><a href="#{i}">{l}</a></li>' for i, l in toc)
    return head(title, desc, extra=extra) + f'''
<body data-page="{page}">
{header(solid=True)}
  <main id="main">
    <div class="container">
      <div class="page-head">
        <ol class="crumbs" aria-label="Breadcrumb">
          <li><a href="index.html">Home</a></li>
          <li aria-current="page">{crumb}</li>
        </ol>
        <span class="eyebrow">{eyebrow}</span>
        <h1 class="h2">{h1}</h1>
        <p class="lede">{lede}</p>
      </div>
      <div class="textpage">
        <nav class="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">On this page</h2>
          <ul>
{tocs}
          </ul>
        </nav>
        <div class="prose">
{body}
        </div>
      </div>
    </div>
  </main>
{FOOTER}'''

def sec(i, title, inner):
    return f'''          <section id="{i}" aria-labelledby="{i}-title">
            <h2 class="h3" id="{i}-title">{title}</h2>
{inner}
          </section>'''

HELP = textpage('help', 'help.html', 'Help, delivery &amp; returns · Norvex Gaming',
    'Delivery costs and times, returns and refunds, our authenticity guarantee, how pre-orders work, order tracking and how to contact Norvex Gaming.',
    'Help', 'Help centre', 'Delivery, returns and <em>straight answers.</em>',
    'Everything you need to know before and after you order. If it is not covered here, email us and a person will reply within one working day.',
    [('shipping', 'Delivery &amp; insurance'), ('returns', 'Returns &amp; refunds'), ('authenticity', 'Authenticity guarantee'), ('preorders', 'Pre-orders'), ('track', 'Track an order'), ('contact', 'Contact us')],
    sec('shipping', 'Delivery &amp; insurance', f'''            <p>Every order is sent tracked and insured for its full value. You get the tracking link by email the moment the parcel leaves us.</p>
            <table>
              <thead><tr><th scope="col">Service</th><th scope="col">Cost</th><th scope="col">Arrives</th></tr></thead>
              <tbody>
                <tr><td>Standard, tracked &amp; insured</td><td>£4.99 · free on orders over <span data-free-ship>£100</span></td><td>2 to 4 working days after dispatch</td></tr>
                <tr><td>Next working day, tracked &amp; insured</td><td>£9.99</td><td>The working day after dispatch</td></tr>
              </tbody>
            </table>
            <p>In-stock orders are dispatched within 48 hours (two working days). Pre-orders are dispatched on or around the official release date. An order that mixes in-stock and pre-order items ships together when the pre-order releases, so place two orders if you want the in-stock items sooner.</p>
            <p>We currently deliver to UK addresses only. For a delivery anywhere else, email us what you would like and where it is going and we will quote a tracked, insured rate.</p>
            <p>Sealed product is double-boxed with corner protection. Graded slabs travel in a padded sleeve inside a rigid box.</p>
            <p><b>Damaged in transit?</b> Email us within 48 hours of delivery with photos of the packaging and the item. We will replace it or refund you in full, and we deal with the insurance claim ourselves.</p>''') + '\n' +
    sec('returns', 'Returns &amp; refunds', f'''            <p><b>Changed your mind?</b> You have 14 days from the day you receive your order to tell us you want to return it, and a further 14 days to send it back. This applies to sealed product with the factory seals intact and to graded singles still in their undamaged slab.</p>
            <ul>
              <li>Email {EMAIL} with your order reference (it starts with NV-) and what you are returning. We reply with the return address.</li>
              <li>Pack the item as it came to you. Return postage is your responsibility for a change-of-mind return, and we recommend a tracked, insured service because the item is in your care until it reaches us.</li>
              <li>We refund your original payment method within 14 days of receiving the item back, including the standard delivery charge you paid.</li>
            </ul>
            <p><b>Opened product.</b> Once a booster box, bundle or pack has been opened its value has gone, so we cannot take it back unless it is faulty.</p>
            <p><b>Faulty or not as described.</b> If anything arrives faulty, damaged or not as described you are covered by the Consumer Rights Act 2015. Tell us within 30 days for a full refund, or within six months for a repair, replacement or refund. We pay the return postage.</p>
            <p><b>Pre-orders</b> can be cancelled for a full refund at any time before they are dispatched.</p>''') + '\n' +
    sec('authenticity', 'Authenticity guarantee', f'''            <p>Every sealed product we sell is bought directly from the publishers' official UK distributors. Nothing enters our stock from marketplaces, auctions or unknown sources.</p>
            <ul>
              <li>Sealed product is inspected for factory seals, shrink-wrap and tamper marks before it is listed and again before it ships.</li>
              <li>Every graded single's certification number is checked against the grader's online registry when the card arrives and once more when it is packed.</li>
              <li>We do not sell re-sealed, weighed or loose product, and we never will.</li>
            </ul>
            <p>If a product ever turns out not to be what we described, return it and we refund you in full, including your postage both ways.</p>''') + '\n' +
    sec('preorders', 'Pre-orders', f'''            <p>A pre-order reserves your allocation of an upcoming release at the price shown. You are charged at checkout, and the price you pay does not change even if the retail price does.</p>
            <ul>
              <li>Release dates are set by the publisher and can move. If yours does, we email you.</li>
              <li>Pre-orders are dispatched on or around the official release date, tracked and insured.</li>
              <li>If the publisher cuts our allocation and we cannot fulfil your order, you get a full refund straight away. We refund rather than substitute.</li>
              <li>Cancel at any time before dispatch for a full refund.</li>
            </ul>''') + '\n' +
    sec('track', 'Track an order', f'''            <p>Your order reference starts with NV- and is on your confirmation page and your receipt. When the parcel leaves us you get a second email with the courier's tracking link.</p>
            <p>Cannot find it? Email {EMAIL} from the address you ordered with and quote the reference or the date of the order. We reply within one working day.</p>
            <p>Ordered in the last few minutes and nothing has arrived? Check your spam folder. Receipts are sent by Stripe, our payment provider, on our behalf.</p>''') + '\n' +
    sec('contact', 'Contact us', f'''            <p>Email is the fastest way to reach us. Every message is answered personally, within one working day.</p>
            <address class="business" data-business></address>
            <p>Running a shop or an event, or selling a collection? See <a href="about.html#wholesale">trade &amp; wholesale</a> and <a href="about.html#consignment">sell your cards</a>.</p>'''))

ABOUT = textpage('about', 'about.html', 'About Norvex Gaming',
    f'Norvex Gaming is an independent UK trading card retailer selling {RANGE}, shipped tracked and insured.',
    'About', 'About Norvex', 'An independent UK card shop, <em>run by collectors.</em>',
    f'Norvex Gaming sells {RANGE} across {GAME_COUNT} games, and ships every order tracked and insured.',
    [('about', 'Who we are'), ('range', 'What we sell'), ('vault', 'The vault'), ('wholesale', 'Trade &amp; wholesale'), ('consignment', 'Sell your cards')],
    sec('about', 'Who we are', '''            <p>Norvex Gaming is an independent, UK-based retailer. We started as collectors, tired of corners crushed in transit, "sealed" boxes that had been re-shrunk, and pre-orders cancelled the week before release.</p>
            <p>The shop is built to fix those three things. Everything is bought from official distributors, packed as if it were ours, and priced once.</p>''') + '\n' +
    sec('range', 'What we sell', '''            <ul>
              <li><b>Sealed product:</b> booster boxes, booster bundles, Elite Trainer Boxes, single packs, decks, tins and collections, all factory-sealed.</li>
              <li><b>Graded singles:</b> PSA-graded cards in their original slabs, listed as we have them, certification verified.</li>
              <li><b>Pre-orders:</b> upcoming releases at a fixed price, charged at checkout and dispatched on release.</li>
              <li><b>Accessories:</b> official sleeves and playmats from the publishers themselves.</li>
            </ul>''') + '\n' +
    sec('vault', 'The vault', '''            <p>Graded singles are listed only when they are in our own stock, never drop-shipped. Each slab's certification number is verified on the grader's registry before it is listed and again before it is dispatched.</p>
            <p>Slabs ship in a padded sleeve inside a rigid box, insured for their full value, with the tracking link emailed to you on dispatch.</p>''') + '\n' +
    sec('wholesale', 'Trade &amp; wholesale', f'''            <p>If you run a shop, a club or an event and need sealed product in quantity, email {EMAIL} with the products and quantities you are after. We tell you within one working day whether we can supply, at what price and when.</p>''') + '\n' +
    sec('consignment', 'Sell your cards', f'''            <p>Selling a collection or a graded card? Email {EMAIL} with photos, certification numbers and what you are hoping to get. We come back within one working day with an offer or an honest "not for us". We do not deal in anything we cannot verify.</p>'''))

LEGAL = textpage('legal', 'legal.html', 'Terms of sale, privacy &amp; cookies · Norvex Gaming',
    'The terms that apply when you buy from Norvex Gaming, how we handle your personal data, and the cookies and local storage this site uses.',
    'Legal', 'Legal', 'Terms of sale, privacy <em>and cookies.</em>',
    'The plain-English version of how buying from Norvex Gaming works. Nothing here affects your statutory rights as a consumer.',
    [('terms', 'Terms of sale'), ('privacy', 'Privacy'), ('cookies', 'Cookies &amp; storage')],
    sec('terms', 'Terms of sale', f'''            <p>These terms apply to every order placed on norvexgaming.com. By placing an order you agree to them. "We" and "us" means:</p>
            <address class="business" data-business></address>
            <h3 class="h4">1. Ordering and contract</h3>
            <p>Your order is an offer to buy. We accept it, and a contract is formed, when we dispatch the goods. The confirmation page and receipt acknowledge your order; they are not acceptance. We may decline an order, for example if stock is unavailable, a price was clearly listed in error or we cannot verify payment, in which case you are refunded in full.</p>
            <h3 class="h4">2. Prices and payment</h3>
            <p>Prices are in pounds sterling and include VAT where applicable. Delivery is shown separately at checkout before you pay. Payment is taken in full at checkout, including for pre-orders, by card or digital wallet through Stripe. We never see or store your card number.</p>
            <h3 class="h4">3. Quantity limits</h3>
            <p>Some products carry a per-order limit shown on the product page so that allocations reach as many collectors as possible. We may cancel and refund orders that circumvent a limit.</p>
            <h3 class="h4">4. Delivery</h3>
            <p>Delivery services, costs and times are set out on the <a href="help.html#shipping">help page</a>. Goods are your responsibility once they have been delivered to the address you gave us. If a parcel arrives damaged, tell us within 48 hours so we can replace or refund it and claim on the insurance.</p>
            <h3 class="h4">5. Pre-orders</h3>
            <p>Pre-orders are charged at checkout at the price shown and dispatched on or around the publisher's release date, which can change. If we cannot fulfil a pre-order because our allocation is reduced, we refund you in full. You may cancel a pre-order for a full refund at any time before dispatch.</p>
            <h3 class="h4">6. Your right to cancel</h3>
            <p>Under the Consumer Contracts Regulations 2013 you may cancel an order for any reason within 14 days of receiving it by emailing {EMAIL}, and you then have 14 days to return the goods. We refund the price and the standard delivery charge within 14 days of receiving the goods back. You pay the cost of returning them. We may reduce the refund if the goods have been handled beyond what is needed to inspect them, for example if factory seals or a grading slab have been opened. Full details are on the <a href="help.html#returns">returns page</a>.</p>
            <h3 class="h4">7. Faulty goods</h3>
            <p>Under the Consumer Rights Act 2015 goods must be as described and of satisfactory quality. If they are not, you may reject them for a full refund within 30 days, or ask for a repair, replacement or refund within six months. We pay the return postage for faulty or misdescribed goods.</p>
            <h3 class="h4">8. Our liability</h3>
            <p>Nothing in these terms limits our liability for death or personal injury caused by negligence, for fraud, or for anything that cannot be limited by law. We are not liable for losses that were not foreseeable when the contract was made, or for business losses. Where a delay is caused by something outside our control, such as a courier or publisher, we keep you informed and you may cancel any undelivered order for a full refund.</p>
            <h3 class="h4">9. Complaints and governing law</h3>
            <p>If something has gone wrong, email {EMAIL} and we will do our best to put it right. These terms are governed by the law of England and Wales and disputes may be brought in its courts. If you live in Scotland or Northern Ireland you may bring proceedings in your local courts instead.</p>''') + '\n' +
    sec('privacy', 'Privacy', f'''            <p><b>What we collect and why.</b> When you order, we collect your name, email address, phone number, delivery address and the details of what you bought. Stripe collects them on our behalf at checkout. We use them to fulfil and deliver your order, send your receipt and tracking link, and handle any return or query. Order records are kept for six years because accounting rules require it.</p>
            <p><b>Payment details.</b> Your card details are entered on Stripe's secure checkout page and processed by Stripe. They never reach us. Stripe's own <a href="https://stripe.com/gb/privacy" rel="noopener" target="_blank">privacy policy</a> covers that step.</p>
            <p><b>Email.</b> If you email us we keep the correspondence for as long as needed to deal with it. If you join the allocation list we keep your email address only to send the updates you asked for. Reply "stop" and it is deleted.</p>
            <p><b>No tracking.</b> We do not run analytics, advertising or tracking pixels on this site.</p>
            <p><b>Who else sees your data.</b> Stripe (payment); the courier (your name, delivery address and phone number for delivery only); our hosting provider, which keeps standard server logs for security; and Google, whose servers deliver the fonts this site uses and therefore receive your IP address when a page loads.</p>
            <p><b>Your rights.</b> You can ask for a copy of the personal data we hold, ask us to correct or delete it, or object to how we use it, by emailing {EMAIL}. You can also complain to the Information Commissioner's Office at <a href="https://ico.org.uk" rel="noopener" target="_blank">ico.org.uk</a>.</p>''') + '\n' +
    sec('cookies', 'Cookies &amp; storage', '''            <p>This site sets no tracking cookies. Your cart is kept in your browser's local storage on this device so it survives a refresh; it is never sent to us until you check out, and clearing your browser data removes it.</p>
            <p>Stripe's checkout page sets its own strictly necessary cookies to complete payment and prevent fraud. Those are covered by Stripe's cookie policy.</p>'''))

# 404: served at whatever URL was requested, so the page first rewrites its URL to the site root
# (before any relative asset or link resolves), then behaves like every other page.
CANONICAL = '404.html'
NOTFOUND = head('Page not found · Norvex Gaming', 'That page does not exist on Norvex Gaming.', extra='  <meta name="robots" content="noindex">\n',
                pre='  <script>if (location.pathname !== "/404.html" && location.pathname !== "/404") history.replaceState(null, "", "/404?from=" + encodeURIComponent(location.pathname));</script>\n') + f'''
<body data-page="404">
{header(solid=True)}
  <main id="main">
    <div class="container">
      <section class="notfound" aria-labelledby="nf-title">
        <span class="eyebrow eyebrow--plain">404</span>
        <h1 class="h2" id="nf-title">That page has <em>sold out.</em></h1>
        <p class="lede">The link may be old or mistyped. The shop is right here.</p>
        <div class="cluster">
          <a class="btn btn--primary" href="shop.html">Browse the shop {ic('arrow')}</a>
          <button class="btn btn--ghost" type="button" data-open-search>{ic('search')} Search products</button>
          <a class="btn btn--link" href="index.html">Back to the home page</a>
        </div>
      </section>
    </div>
  </main>
{FOOTER}'''

NOTFOUND = re.sub(r'(href|src)="(assets/|index\.html|shop\.html|product\.html|help\.html|about\.html|legal\.html)', r'\1="/\2', NOTFOUND)

PAGES = {'index.html': INDEX, 'shop.html': SHOP, 'product.html': PRODUCT, 'order.html': ORDER, 'help.html': HELP, 'about.html': ABOUT, 'legal.html': LEGAL, '404.html': NOTFOUND}
for f, html in PAGES.items():
    (OUT / f).write_text(html)
    print(f, len(html.splitlines()), 'lines')
