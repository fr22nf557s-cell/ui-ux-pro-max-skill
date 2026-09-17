/* ==========================================================================
   NORVEX GAMING — shared naming rules for gallery-derived products
   --------------------------------------------------------------------------
   Used by catalog-from-galleries.mjs (when products are first built from a
   publisher gallery) and tidy-catalog.mjs (when an existing catalogue is
   cleaned up). Keeping them in one place means a re-run of the fetch never
   re-introduces a title the tidy pass already learned to drop or rename.
   ========================================================================== */
import { slug } from './catalog-io.mjs';

/* Titles that are articles, navigation, key art or marketing rather than a product. */
export const JUNK = new RegExp([
  'select display language', 'error 404', 'latest releases', 'what will you discover', 'getting started', 'catch up on', 'coolest swag',
  'learn more', 'cookie', 'privacy', '^products?$', '^booster packs$', '^structure decks$', '^tins$', '^starter decks$', '^others$', 'tournament packs',
  'key art', '^shop$', 'logo', 'wallpaper', 'banner', '\\btips?\\b', '\\bannounced\\b', "what'?s next", '\\bbuild a\\b', '\\bquests? in\\b',
  'deck building', 'product packaging image', '\\bassemble\\b', '\\bhow to\\b', '\\bguide\\b', '\\brules\\b', '\\bevents?\\b', '\\btournament\\b',
  'championship', 'release notes', '\\bfaq\\b', '\\bnews\\b', '\\bpreview\\b', '\\bspoilers?\\b', '\\brevealed?\\b', '\\bcoming soon\\b', '\\bpower up your\\b', 'related information', '\\brelated\\b', '\\bwhat is\\b', '\\blearn to play\\b',
  '^point ?\\d', '\\bpoint ?\\d\\b', '\\brecipe', '\\bstrategy\\b', '\\bwhat are\\b', '\\byour\\b', '\\bcontents include', '\\bphoto of\\b', '\\bintroducing\\b',
  'must-see', 'bonus pack', '\\bpurchase\\b', '^close$', '^package$', '^details$', '^premium bandai$', '^booster pack$', '^booster box$', '^booster$', '^deck$', '^starter deck$', '^advanced deck$',
  '\\bglimmer\\b', '\\bpals\\b', '\\bshred\\b', 'last, but not least', '…', '\\bcards that\\b', '\\bdecks that\\b', '\\bthis set\\b', '\\balone\\b', '\\bcard image\\b', '\\bupgrading\\b', '\\bincluded\\b', '\\bfeaturing\\b', '\\bfeatured\\b', '\\bappear\\b', '\\bdebut\\b',
  '\\b[a-z]{1,3}\\d{0,2}-\\d{3}\\b'                              // BT13-095, P-036, LM-033: card numbers, not products
].join('|'), 'i');

/* Images this small are logos, gradients or "coming soon" placeholders, never a packshot. */
export const MIN_IMAGE_BYTES = 8000;

/* Product codes that identify a set/deck across differently-worded titles (OP-11, ST-28, EB-03, PRB-02, SD-01, BT-20, FB-04, RA05…). */
const CODE = /\b(OP|EB|ST|SD|PRB|BT|FB|FS|SB|RA|EX|AD|PB|PD|RB)-?(\d{1,2})\b(?!-\d)/i;
export const productCode = (s) => { const m = CODE.exec(String(s)); return m ? `${m[1].toUpperCase()}-${m[2].padStart(2, '0')}` : null; };

/* ---- format detection: [format, catalogue type, regex], most specific first ---- */
export const FORMATS = [
  ['etb', 'etb', /\belite trainer box\b/i], ['collector box', 'box', /\bcollector booster (box|display)\b/i], ['play box', 'box', /\bplay booster (box|display)\b/i],
  ['jumpstart box', 'box', /\bjumpstart booster box\b/i], ['box', 'box', /\bbooster (box|display)\b|\bdisplay box\b|\bbooster display\b/i], ['bundle', 'bundle', /\bbooster bundle\b/i],
  ['pack', 'pack', /\bbooster pack\b|\bplay booster\b(?! box)|\bbooster$|\bextra booster\b|\bsleeved booster\b|\bpremium booster\b/i], ['commander', 'deck', /\bcommander deck\b/i],
  ['starter', 'deck', /\bstarter deck\b|\bstarter kit\b|\btwo-player starter\b|\bstarter collection\b|\bstarter set\b/i], ['structure', 'deck', /\bstructure deck\b/i],
  ['battle deck', 'deck', /\bbattle decks?\b|\bleague battle deck\b|\btheme deck\b|\bspotlight deck\b/i], ['upc', 'collection', /\bultra[- ]premium collection/i], ['spc', 'collection', /\bsuper[- ]premium collection/i],
  ['premium collection', 'collection', /\bpremium (card )?collection/i], ['trove', 'collection', /\btrove\b/i], ['tin', 'collection', /\btins?\b/i], ['gift set', 'collection', /\bgift set\b/i],
  ['poster', 'collection', /\bposter collection\b/i], ['binder', 'collection', /\bbinder collection\b/i], ['sticker', 'collection', /\bsticker collection\b/i],
  ['ex box', 'collection', /\bex box\b|\bV box\b|\bbox and\b/i], ['codex', 'bundle', /\bcodex bundle\b/i], ['bundle', 'bundle', /\bbundle\b/i], ['collection', 'collection', /\bcollections?\b|\bbox set\b|\bpremium\b/i], ['deck', 'deck', /\bdecks?\b/i]
];
export const ACCESSORY = /\bgame mat\b|\bplaymat\b|\bportfolio\b|\bsleeves?\b|\bdeck box\b|\bdeck case\b|\bbinder\b|\bcard case\b|\bdice\b|\bcoin\b/i;
export const detectFormat = (title) => (ACCESSORY.test(title) ? ['accessory', 'accessory', ACCESSORY] : FORMATS.find(([, , re]) => re.test(title)) || null);

/* ---- casing helpers ------------------------------------------------------ */
const SMALL = new Set(['a', 'an', 'and', 'the', 'of', 'on', 'in', 'at', 'to', 'for', 'vs']);
const KEEP_CAPS = /^(OP|EB|ST|SD|PRB|EX|TCG|DX|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)(-?\d+)?$|^[A-Z]{1,4}-?\d{1,4}[A-Z]?$/;
/* Turn ALL-CAPS words into Title Case, leaving mixed-case words and product codes alone. */
export function titleCaps(s) {
  return String(s).split(' ').map((w, i) => {
    const core = w.replace(/[^A-Za-z0-9]/g, '');
    if (core.length < 2 || core !== core.toUpperCase() || KEEP_CAPS.test(core) || !/[A-Z]/.test(core)) return w;
    const lower = w.toLowerCase();
    if (i > 0 && SMALL.has(lower.replace(/[^a-z]/g, ''))) return lower;
    return lower.replace(/(^|[\/\-("])([a-z])/g, (m, p, c) => p + c.toUpperCase());
  }).join(' ');
}
const tidyPunct = (s) => s
  .replace(/(\w)"(\w[^"]*)"(\w)/g, '$1 "$2" $3')                       // Eustass"Captain"Kid → Eustass "Captain" Kid
  .replace(/\b([A-Z][a-z]+)\.([A-Z])\.([A-Z][a-z]+)\b/g, '$1 $2. $3')  // Monkey.D.Luffy → Monkey D. Luffy
  .replace(/\bvol\.?\s*(\d+)/gi, 'Vol. $1')
  .replace(/\b(?=[ivx]{2,5}\b)(x{0,3}(?:ix|iv|v?i{0,3}))\b/gi, (m) => m.toUpperCase())   // Xiii → XIII
  .replace(/\s+/g, ' ').trim();

/* ---- One Piece: "BOOSTER PACK -THE TIME OF BATTLE- OP-16" → "OP-16 The Time of Battle Booster Pack" ---- */
const OP_FORMATS = [
  [/^BOOSTER PACK$/i, (x, c) => `${c} ${x} Booster Pack`], [/^EXTRA BOOSTER$/i, (x, c) => `${c} ${x} Extra Booster Pack`],
  [/^PREMIUM BOOSTER$/i, (x, c) => `${c} ${x} Premium Booster Pack`], [/^STARTER DECK EX$/i, (x, c) => `${c} ${x} Starter Deck EX`],
  [/^STARTER DECK$/i, (x, c) => `${c} ${x} Starter Deck`], [/^ULTRA DECK$/i, (x, c) => `${c} ${x} Ultra Deck`],
  [/^PREMIUM CARD COLLECTION$/i, (x) => `Premium Card Collection: ${x}`], [/^DOUBLE PACK$/i, (x, c) => `${c} ${x} Double Pack`]
];
function onePieceName(s) {
  s = s.replace(/\[\s*([A-Z]+)-?(\d+)(?:-[A-Z0-9-]+)?\s*\]/gi, (m, a, n) => `${a.toUpperCase()}-${n}`); // [OP15-EB04] → OP-15
  const m = /^([A-Z ]+?)\s*-\s*(.+?)\s*-?\s*((?:OP|EB|ST|SD|PRB|EX|FB|FS|SB|BT|AD|PB|PD|RB)-?\d+)?\s*$/i.exec(s);
  if (!m) return s;
  const fmt = OP_FORMATS.find(([re]) => re.test(m[1].trim())); if (!fmt) return s;
  const inner = tidyPunct(titleCaps(m[2].replace(/-\s*$/, '').trim()));
  const code = m[3] ? productCode(m[3]) : '';
  return fmt[1](inner, code).replace(/^\s+/, '').replace(/\s+/g, ' ');
}

/* ---- Bandai (Digimon, Dragon Ball): "Booster Pack Timeless Bonds BT-26" → "BT-26 Timeless Bonds Booster Pack",
        "Amethyst Mandala ST-22 Deck" → "ST-22 Amethyst Mandala Starter Deck" ---- */
function bandaiName(s) {
  s = s.replace(/\[\s*([A-Z]+)-?(\d+)\s*\]/gi, (m, a, n) => `${a.toUpperCase()}-${n.padStart(2, '0')}`).replace(/\s+/g, ' ').trim();
  let m = /^(Extra Booster|Advanced Booster|Theme Booster|Booster Pack|Booster)\s+(.+?)\s+((?:BT|EX|AD|RB|FB|SB)-\d{1,2})$/i.exec(s);
  if (m) { const kind = /extra/i.test(m[1]) ? 'Extra Booster Pack' : /advanced/i.test(m[1]) ? 'Advanced Booster Pack' : /theme/i.test(m[1]) ? 'Theme Booster Pack' : 'Booster Pack'; return `${m[3].toUpperCase()} ${m[2]} ${kind}`; }
  m = /^(Extra Booster|Advanced Booster|Theme Booster)\s+(.+?)\s+((?:BT|EX|AD|RB|FB|SB)-\d{1,2})\s+Booster (Pack|Box)$/i.exec(s);
  if (m) return `${m[3].toUpperCase()} ${m[2]} ${m[1].replace(/booster/i, 'Booster')} ${m[4]}`;
  m = /^(Extra Booster|Advanced Booster|Theme Booster|Booster Pack|Booster)\s+((?:BT|EX|AD|RB|FB|SB)-\d{1,2})\s+(.+)$/i.exec(s);
  if (m) { const kind = /extra/i.test(m[1]) ? 'Extra Booster Pack' : /advanced/i.test(m[1]) ? 'Advanced Booster Pack' : /theme/i.test(m[1]) ? 'Theme Booster Pack' : 'Booster Pack'; return `${m[2].toUpperCase()} ${m[3]} ${kind}`; }
  m = /^(?:Starter Deck\s+)?(EX\s+)?(.+?)\s+((?:ST|FS|PD|SD)-\d{1,2})(?:\s+(?:Starter )?Deck)?$/i.exec(s);
  if (m && !/\bdeck\b|\bset\b/i.test(m[2])) { const x = m[2].charAt(0).toUpperCase() + m[2].slice(1); return `${m[3].toUpperCase()} ${x} Starter Deck${m[1] ? ' EX' : ''}`; }
  m = /^(.+?)\s+((?:PB|EX|BT|SB|FB|AD|RB)-\d{1,2})(\s+.+)?$/i.exec(s);                      // "Premium Heroines Set PB-23", "Manga Booster 01 SB-01 Booster Pack"
  if (m) return `${m[2].toUpperCase()} ${m[1]}${m[3] || ''}`;
  return s;
}

/* ---- Pokémon: "X—A | X—B" and "X—A & X—B" → "X: A & B" ----------------- */
function mergeCombined(s) {
  for (const sep of [' | ', ' & ']) {
    const parts = s.split(sep); if (parts.length < 2) continue;
    let prefix = parts[0];
    for (const p of parts.slice(1)) { let i = 0; while (i < prefix.length && i < p.length && prefix[i] === p[i]) i++; prefix = prefix.slice(0, i); }
    const cut = Math.max(prefix.lastIndexOf('—'), prefix.lastIndexOf('–'), prefix.lastIndexOf(': '));
    if (cut < 10) continue;
    const head = prefix.slice(0, cut).replace(/[\s—–:-]+$/, '');
    const tails = parts.map((p) => p.slice(cut).replace(/^[\s—–:-]+/, '').trim()).filter(Boolean);
    if (tails.length === parts.length) return `${head}: ${tails.join(' & ')}`;
  }
  return s;
}

/* ---- public: clean a gallery title into a product name -------------------- */
export function cleanName(raw, game) {
  let s = String(raw).replace(/<[^>]*>/g, ' ').replace(/[\u2010\u2011\u2012]/g, '-').replace(/\s+/g, ' ').trim()
    .replace(/^pok[eé]mon tcg:\s*/i, '').replace(/^scarlet\s*&\s*violet\s*[—–-]\s*/i, '').replace(/^sword\s*&\s*shield\s*[—–-]\s*/i, '')
    .replace(/^magic:\s*the gathering\s*[—–:-]?\s*/i, '').replace(/^one piece card game\s*/i, '').replace(/^disney lorcana\s*/i, '').replace(/^yu-?gi-?oh!?\s*(tcg|trading card game)?\s*/i, '')
    .replace(/\s*\[(OP|EB|ST|SD|PRB)-?(\d+)\]\s*/gi, (m, a, n) => ` ${a.toUpperCase()}-${n} `).replace(/\s+/g, ' ').trim();
  s = s.replace(/\b(booster|game|deck|set|pack)([a-z])(?=[a-z]{2,})/gi, (m, w, c) => `${w} ${c.toUpperCase()}`)   // "Card Gameofficial", "Boosterclassic": glued headings
    .replace(/(\d)([a-z])(?=[a-z]{2,})/g, (m, d, c) => `${d} ${c.toUpperCase()}`)                                   // "Set 2floral" → "Set 2 Floral"
    .replace(/\bver\.(?=[A-Za-z])/gi, 'Ver. ').replace(/\bbooster packs? and boxes\b/gi, 'Booster Pack')
    .replace(/\bdigimon card game\s*/gi, '').replace(/\bdragon ball super card game\s*/gi, '').replace(/\bfusion world\s*/gi, '').trim();
  if (game === 'onepiece' || game === 'digimon' || game === 'dragonball') s = bandaiName(onePieceName(s));
  s = mergeCombined(s);                         // "X—A | X—B" and "X—A & X—B" → "X: A & B" (Pokémon and Konami list pairs this way)
  s = tidyPunct(titleCaps(s)).replace(/\s+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---- public: does this title name a product at all? --------------------------
   Bandai's product pages illustrate every set with card images and "Point 1…" blurbs, so for
   those games a title must carry a set code, be an accessory, or be a named premium/collection set. */
export function looksLikeProduct(name, game) {
  if (game !== 'digimon' && game !== 'dragonball') return true;
  if (productCode(name) || ACCESSORY.test(name)) return true;
  return /\bpremium\b|\bcollection\b|\bgift\b|\bset\b/i.test(name) && !/^(booster|starter|advanced)/i.test(name);
}

/* ---- public: the set/line a product belongs to ---------------------------- */
const SET_STRIP = {
  pokemon: /\s*(Pokémon Center\s+)?(\S+ ex Box\b.*|Elite Trainer Box|Booster Bundle|Booster Box|Booster Pack|Tech Sticker Collection|Poster Collection|Binder Collection|Figure Collection|First Partners Deluxe Pin Collection|Deluxe Pin Collection|Mini Tins?|Tins?|Ultra-Premium Collections?|Super-Premium Collection|Premium Collection|League Battle Deck|Battle Decks?|Collections?|Box)\b.*$/i,
  magic: /\s*((Play|Collector|Jumpstart|Set|Draft)\s+)?(Booster (Box|Pack|Display)|Codex Bundle|Gift Bundle|Bundle|Commander Deck|Starter Collection|Starter Kit|Beginner Box|Prerelease Pack)\b.*$/i,
  lorcana: /\s*(Booster Display Box|Booster Display|Booster Pack|Illumineer[’']s Trove|Illumineer[’']s Quest|Starter Deck|Gift Set|Starter Set|Collection).*$/i,
  swu: /\s*(Two-Player Starter|Booster Display|Booster Pack|Spotlight Deck:?|Prerelease Box|Carbonite Edition).*$/i,
  yugioh: /\s*(Booster Box|Booster Pack|Structure Deck:?|Starter Deck:?|Mega Tin|Tin:?|Collection Box|Special Edition).*$/i
};
export function setName(name, game, fmtRe) {
  let s = name;
  if (game === 'onepiece') {
    const m = /^(?:OP|EB|ST|SD|PRB|EX)-\d+\s+(.+?)\s+(Booster Pack|Extra Booster Pack|Premium Booster Pack|Starter Deck EX|Starter Deck|Ultra Deck|Double Pack)$/i.exec(name) || /^Premium Card Collection:\s*(.+)$/i.exec(name);
    s = m ? m[1] : name;
  } else if (SET_STRIP[game]) {
    s = name.replace(SET_STRIP[game], '');
    if (!s.trim() && fmtRe) s = name.replace(fmtRe, '');
  } else if (fmtRe) s = name.replace(fmtRe, '');
  s = s.replace(/\s*[—–-]\s*$/, '').replace(/^\s*[—–-]\s*/, '').replace(/[:\s]+$/, '').replace(/\s*[—–]\s*/g, ' — ').replace(/\s+/g, ' ').trim();
  return s || name;
}

/* ---- public: key that identifies the same product under two titles -------- */
const GENERIC = new Set(['booster', 'boosters', 'box', 'display', 'pack', 'packs', 'deck', 'decks', 'collection', 'bundle', 'edition', 'elite', 'trainer', 'premium', 'ultra', 'super', 'commander', 'starter', 'structure', 'kit', 'set', 'tin', 'trove', 'gift', 'poster', 'battle', 'play', 'collector', 'jumpstart', 'two', 'player', 'the', 'of', 'and', 'a', 'an', 'in', 'x', 'card', 'cards', 'game', 'tcg', 'en', 'ex', 'extra']);
export function dedupeKey(game, name) {
  const fmt = (detectFormat(name) || ['?'])[0];
  const code = productCode(name);
  if (code) return `${game}:${fmt}:${code}`;
  const toks = slug(name).split('-').filter((t) => t && !GENERIC.has(t)).sort();
  return `${game}:${fmt}:${toks.join('-')}`;
}

/* ---- public: estimated UK RRP by game + format (GBP) — review before launch ---- */
export const PRICE = {
  pokemon: { etb: 49.99, 'collector box': 149.99, 'play box': 149.99, box: 149.99, bundle: 26.99, pack: 4.49, commander: 14.99, starter: 14.99, structure: 14.99, 'battle deck': 14.99, deck: 14.99, upc: 119.99, spc: 84.99, 'premium collection': 39.99, trove: 49.99, tin: 24.99, 'gift set': 29.99, poster: 19.99, binder: 24.99, sticker: 19.99, 'ex box': 22.99, collection: 29.99, accessory: 12.99 },
  magic: { etb: 49.99, 'collector box': 249.99, 'play box': 129.99, 'jumpstart box': 109.99, box: 129.99, bundle: 49.99, pack: 4.99, commander: 44.99, starter: 24.99, structure: 24.99, deck: 34.99, 'gift set': 59.99, collection: 39.99, accessory: 12.99 },
  onepiece: { box: 109.99, pack: 4.99, starter: 14.99, deck: 14.99, 'premium collection': 39.99, collection: 39.99, bundle: 29.99, accessory: 12.99 },
  yugioh: { box: 79.99, pack: 3.49, structure: 12.99, starter: 12.99, deck: 12.99, tin: 22.99, collection: 24.99, bundle: 24.99, accessory: 14.99 },
  lorcana: { box: 119.99, pack: 4.99, starter: 16.99, deck: 16.99, trove: 49.99, 'gift set': 29.99, collection: 29.99, bundle: 29.99, accessory: 12.99 },
  swu: { box: 99.99, pack: 4.49, starter: 29.99, deck: 29.99, collection: 29.99, bundle: 29.99, accessory: 12.99 },
  fab: { box: 89.99, pack: 4.49, starter: 14.99, deck: 14.99, collection: 29.99, bundle: 29.99, accessory: 12.99 },
  digimon: { box: 74.99, pack: 3.99, starter: 12.99, deck: 12.99, collection: 29.99, bundle: 29.99, accessory: 12.99 },
  dragonball: { box: 79.99, pack: 3.99, starter: 12.99, deck: 12.99, collection: 29.99, bundle: 29.99, accessory: 12.99 },
  riftbound: { box: 139.99, pack: 5.99, starter: 19.99, deck: 19.99, collection: 29.99, bundle: 29.99, accessory: 12.99 }
};
export const priceFor = (game, fmt, type) => (PRICE[game] && (PRICE[game][fmt] ?? PRICE[game][type])) ?? ({ etb: 49.99, box: 119.99, bundle: 29.99, pack: 4.99, deck: 14.99, collection: 29.99, accessory: 14.99 })[type];
/* Games whose booster display is simply N packs: the box is listed next to the pack, pictured with the pack art. */
export const BOX_SIBLING = { yugioh: 24, onepiece: 24, digimon: 24, dragonball: 24, lorcana: 24 };
export function boxSibling(p, types) {
  const n = BOX_SIBLING[p.game]; if (!n || p.type !== 'pack') return null;
  const name = p.name.replace(/\b(Extra Booster|Premium Booster|Advanced Booster|Theme Booster|Booster) Pack$/i, '$1 Box'); if (name === p.name) return null;
  return { ...p, id: slug(`${p.game}-${name}`), name, type: 'box', price: priceFor(p.game, 'box', 'box'), featured: false, description: describe('box', p.set, name),
    contents: [`${n} ${p.set} booster packs`, 'Pictured: booster pack artwork'], specs: { ...(p.specs || {}), Format: (types && types.box && types.box.singular) || 'Booster Box' } };
}

/* ---- public: template copy for gallery-derived products ------------------- */
export function describe(type, set, name) {
  return {
    etb: `Factory-sealed ${set} Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.`,
    box: `A full sealed ${set} booster display, never opened and never resealed. Sourced direct from the distributor and tamper-checked before it enters the vault.`,
    bundle: `Sealed ${set} booster packs in the official bundle. The efficient way into the chase without committing to a box.`,
    pack: `A single factory-sealed ${set} booster pack, straight from an unopened display. Sold loose, never weighed.`,
    deck: `Ready to play out of the box. A complete ${set} deck with everything you need for your first games.`,
    collection: `${name}: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.`
  }[type] || `${name}, factory sealed.`;
}
export const isTemplateCopy = (d) => /tamper-checked before it enters the vault|efficient way into the chase|Sold loose, never weighed|Ready to play out of the box|exactly as the publisher shipped it/.test(String(d || ''));
