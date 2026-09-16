/* ==========================================================================
   NORVEX GAMING — product catalog (demo data)
   --------------------------------------------------------------------------
   Everything the storefront renders comes from this file. Replace `products`
   with your live inventory (or fetch it from Shopify / Medusa / your API and
   assign it to window.NORVEX_DATA.products before norvex.js runs).

   Product shape:
     id          unique slug (used in URLs: product.html?id=<id>)
     name        full product title
     set         set / expansion name printed on the packaging art
     game        key from `games` below ('norvex' for own-brand accessories)
     type        key from `types` below
     price       number, in config.currency
     compareAt   optional "was" price
     stock       units on hand (0 = sold out unless preorder is true)
     preorder    true = accepts pre-orders, ships on release
     badge       'new' | 'hot' | null
     featured    true = eligible for the home page "New arrivals" grid
     rating      0–5, reviews = count (shown on product page)
     description one paragraph
     contents    bullet list shown under "What's inside"
     specs       key/value pairs shown as a spec grid
     image       optional path to a real product photo; when null the
                 storefront renders a stylised CSS packaging mock instead
     grade       graded singles only: { grader, grade, label, cert }
     artLabel    graded singles only: card name printed on the slab art
   ========================================================================== */
window.NORVEX_DATA = {
  config: {
    storeName: 'Norvex Gaming',
    currency: 'USD',
    locale: 'en-US',
    freeShippingThreshold: 150,
    supportEmail: 'hello@norvexgaming.com'
  },

  games: {
    pokemon:    { name: 'Pokémon TCG',                 short: 'Pokémon',     a: '#ffcb05', b: '#c8102e', c: '#2a75bb' },
    magic:      { name: 'Magic: The Gathering',        short: 'Magic',       a: '#d4a92a', b: '#17171c', c: '#7c2d12' },
    onepiece:   { name: 'One Piece Card Game',         short: 'One Piece',   a: '#e63946', b: '#1d3557', c: '#f4a261' },
    yugioh:     { name: 'Yu-Gi-Oh!',                   short: 'Yu-Gi-Oh!',   a: '#8b45b6', b: '#1d1235', c: '#e9b44c' },
    lorcana:    { name: 'Disney Lorcana',              short: 'Lorcana',     a: '#2a4a9a', b: '#0b1230', c: '#d4af37' },
    swu:        { name: 'Star Wars: Unlimited',        short: 'Star Wars',   a: '#3a3a44', b: '#0a0a0d', c: '#f0c24b' },
    riftbound:  { name: 'Riftbound',                   short: 'Riftbound',   a: '#0ac8b9', b: '#091428', c: '#c89b3c' },
    digimon:    { name: 'Digimon Card Game',           short: 'Digimon',     a: '#ff7a00', b: '#0a2540', c: '#ffd166' },
    dragonball: { name: 'Dragon Ball Super Fusion World', short: 'Dragon Ball', a: '#f28c28', b: '#1e3a8a', c: '#fde047' },
    norvex:     { name: 'Norvex Vault',                short: 'Norvex',      a: '#d9b75b', b: '#1a1a1f', c: '#8c6f2a' }
  },

  types: {
    etb:        { name: 'Elite Trainer Boxes',  singular: 'Elite Trainer Box',  art: 'etb' },
    bundle:     { name: 'Booster Bundles',      singular: 'Booster Bundle',     art: 'bundle' },
    box:        { name: 'Booster Boxes',        singular: 'Booster Box',        art: 'box' },
    collection: { name: 'Premium Collections',  singular: 'Premium Collection', art: 'etb' },
    single:     { name: 'Graded Singles',       singular: 'Graded Single',      art: 'slab' },
    accessory:  { name: 'Accessories',          singular: 'Accessory',          art: 'accessory' }
  },

  products: [
    /* ---------------------------------------------------------- Pokémon */
    {
      id: 'pk-prismatic-etb', name: 'Prismatic Evolutions Elite Trainer Box', set: 'Prismatic Evolutions', game: 'pokemon', type: 'etb',
      price: 89.99, compareAt: 109.99, stock: 6, preorder: false, badge: 'hot', featured: true, rating: 4.9, reviews: 212,
      description: 'The Eeveelution set that defined the Scarlet & Violet era. Factory-sealed Elite Trainer Box with nine booster packs, the exclusive Sylveon promo and a full suite of premium accessories.',
      contents: ['9 Prismatic Evolutions booster packs', '1 full-art foil promo card', '65 card sleeves', '45 Energy cards', '6 damage-counter dice, 1 coin-flip die, 2 condition markers', "Player's guide and collector's box"],
      specs: { Language: 'English', Format: 'Elite Trainer Box', Packs: '9', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-prismatic-bundle', name: 'Prismatic Evolutions Booster Bundle', set: 'Prismatic Evolutions', game: 'pokemon', type: 'bundle',
      price: 44.99, compareAt: null, stock: 22, preorder: false, badge: null, featured: true, rating: 4.8, reviews: 96,
      description: 'Six sealed Prismatic Evolutions booster packs in the official display bundle. The most efficient way into the chase for Special Illustration Rare Eeveelutions.',
      contents: ['6 Prismatic Evolutions booster packs'],
      specs: { Language: 'English', Format: 'Booster Bundle', Packs: '6', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-surging-sparks-box', name: 'Surging Sparks Booster Box', set: 'Surging Sparks', game: 'pokemon', type: 'box',
      price: 169.99, compareAt: null, stock: 9, preorder: false, badge: null, featured: false, rating: 4.9, reviews: 143,
      description: 'A full 36-pack booster box of Surging Sparks, home of Pikachu ex Special Illustration Rare. Sealed display box, never opened, never resealed.',
      contents: ['36 Surging Sparks booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '36', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-151-upc', name: 'Pokémon 151 Ultra-Premium Collection', set: 'Pokémon 151', game: 'pokemon', type: 'collection',
      price: 179.99, compareAt: 199.99, stock: 3, preorder: false, badge: null, featured: true, rating: 5, reviews: 88,
      description: 'The original 151 in the most premium format Pokémon has produced. Sixteen booster packs, three etched foil promos and a full-metal Poké Ball display.',
      contents: ['16 Pokémon 151 booster packs', '3 etched foil promo cards (Mew ex, Mewtwo ex, Charizard ex)', 'Metal Poké Ball, playmat and deck box', '65 card sleeves and 65 Energy cards'],
      specs: { Language: 'English', Format: 'Ultra-Premium Collection', Packs: '16', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-destined-rivals-etb', name: 'Destined Rivals Elite Trainer Box', set: 'Destined Rivals', game: 'pokemon', type: 'etb',
      price: 64.99, compareAt: null, stock: 31, preorder: false, badge: 'new', featured: true, rating: 4.8, reviews: 61,
      description: "Team Rocket returns. Trainer's Pokémon, full-art villains and the most collectible set of 2025, sealed in its Elite Trainer Box.",
      contents: ['9 Destined Rivals booster packs', '1 full-art foil promo card', '65 card sleeves, 45 Energy cards', 'Dice, condition markers and player guide'],
      specs: { Language: 'English', Format: 'Elite Trainer Box', Packs: '9', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-journey-together-box', name: 'Journey Together Booster Box', set: 'Journey Together', game: 'pokemon', type: 'box',
      price: 159.99, compareAt: null, stock: 12, preorder: false, badge: null, featured: false, rating: 4.7, reviews: 54,
      description: "Thirty-six packs of Journey Together, the set that introduced Trainer's Pokémon ex to Scarlet & Violet.",
      contents: ['36 Journey Together booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '36', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-mega-evolution-etb', name: 'Mega Evolution Elite Trainer Box', set: 'Mega Evolution', game: 'pokemon', type: 'etb',
      price: 59.99, compareAt: null, stock: 40, preorder: false, badge: 'new', featured: true, rating: 4.8, reviews: 37,
      description: 'The first set of the Mega Evolution era. Mega Pokémon ex return with chase-worthy Special Illustration Rares, sealed in the Elite Trainer Box.',
      contents: ['9 Mega Evolution booster packs', '1 full-art foil promo card', '65 card sleeves, 45 Energy cards', 'Dice, condition markers and player guide'],
      specs: { Language: 'English', Format: 'Elite Trainer Box', Packs: '9', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-black-bolt-etb', name: 'Black Bolt Elite Trainer Box', set: 'Black Bolt', game: 'pokemon', type: 'etb',
      price: 62.99, compareAt: null, stock: 18, preorder: false, badge: null, featured: false, rating: 4.7, reviews: 42,
      description: 'Unova returns in the Black Bolt half of the Black Bolt / White Flare pair. Complete Unova Pokédex chase with Black White Rares.',
      contents: ['9 Black Bolt booster packs', '1 full-art foil promo card', '65 card sleeves, 45 Energy cards', 'Dice, condition markers and player guide'],
      specs: { Language: 'English', Format: 'Elite Trainer Box', Packs: '9', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-white-flare-bundle', name: 'White Flare Booster Bundle', set: 'White Flare', game: 'pokemon', type: 'bundle',
      price: 29.99, compareAt: null, stock: 44, preorder: false, badge: null, featured: false, rating: 4.6, reviews: 29,
      description: 'Six sealed White Flare booster packs. The Reshiram half of the Unova pair, with a full Unova Pokédex to chase.',
      contents: ['6 White Flare booster packs'],
      specs: { Language: 'English', Format: 'Booster Bundle', Packs: '6', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'pk-phantasmal-flames-etb', name: 'Phantasmal Flames Elite Trainer Box', set: 'Phantasmal Flames', game: 'pokemon', type: 'etb',
      price: 59.99, compareAt: null, stock: 0, preorder: true, badge: null, featured: true, rating: 0, reviews: 0,
      description: 'Reserve the next Mega Evolution expansion at retail price. Pre-order protection applies: your allocation is locked the moment you check out, and we never cancel confirmed orders.',
      contents: ['9 Phantasmal Flames booster packs', '1 full-art foil promo card', '65 card sleeves, 45 Energy cards', 'Dice, condition markers and player guide'],
      specs: { Language: 'English', Format: 'Elite Trainer Box', Packs: '9', Ships: 'On release day' }, image: null
    },

    /* ------------------------------------------------------------ Magic */
    {
      id: 'mtg-ff-collector-box', name: 'Final Fantasy Collector Booster Box', set: 'Final Fantasy', game: 'magic', type: 'box',
      price: 549.99, compareAt: null, stock: 4, preorder: false, badge: 'hot', featured: true, rating: 5, reviews: 33,
      description: "Magic's best-selling set of all time, in its rarest format. Twelve Collector Boosters with guaranteed foils, borderless art and serialized chase cards.",
      contents: ['12 Final Fantasy Collector Booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Collector Booster Box', Packs: '12', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-ff-play-box', name: 'Final Fantasy Play Booster Box', set: 'Final Fantasy', game: 'magic', type: 'box',
      price: 219.99, compareAt: null, stock: 15, preorder: false, badge: null, featured: true, rating: 4.9, reviews: 71,
      description: 'Thirty-six Play Boosters from the Final Fantasy Universes Beyond set. The draft-ready box for players and the value box for collectors.',
      contents: ['36 Final Fantasy Play Booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Play Booster Box', Packs: '36', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-avatar-play-box', name: 'Avatar: The Last Airbender Play Booster Box', set: 'Avatar: The Last Airbender', game: 'magic', type: 'box',
      price: 159.99, compareAt: null, stock: 20, preorder: false, badge: 'new', featured: false, rating: 4.7, reviews: 18,
      description: 'Bend all four elements. Thirty Play Boosters from the Avatar: The Last Airbender Universes Beyond release.',
      contents: ['30 Avatar: The Last Airbender Play Booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Play Booster Box', Packs: '30', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-eoe-collector', name: 'Edge of Eternities Collector Booster Box', set: 'Edge of Eternities', game: 'magic', type: 'box',
      price: 299.99, compareAt: 329.99, stock: 7, preorder: false, badge: null, featured: false, rating: 4.8, reviews: 26,
      description: "Magic goes to space. Twelve Collector Boosters from Edge of Eternities, with Stellar Sights lands and extended-art rares.",
      contents: ['12 Edge of Eternities Collector Booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Collector Booster Box', Packs: '12', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-tarkir-bundle', name: 'Tarkir: Dragonstorm Bundle', set: 'Tarkir: Dragonstorm', game: 'magic', type: 'bundle',
      price: 54.99, compareAt: null, stock: 25, preorder: false, badge: null, featured: false, rating: 4.6, reviews: 40,
      description: 'Nine Play Boosters, a foil promo dragon, full-art lands and an oversized spindown in the official Tarkir: Dragonstorm Bundle.',
      contents: ['9 Tarkir: Dragonstorm Play Booster packs', '1 traditional foil promo card', '40 basic lands (20 foil, 20 non-foil)', 'Oversized spindown die and storage box'],
      specs: { Language: 'English', Format: 'Bundle', Packs: '9', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-spiderman-play-box', name: "Marvel's Spider-Man Play Booster Box", set: "Marvel's Spider-Man", game: 'magic', type: 'box',
      price: 149.99, compareAt: null, stock: 11, preorder: false, badge: null, featured: false, rating: 4.5, reviews: 22,
      description: "Thirty Play Boosters from Magic's first Marvel set, with the Spider-Verse, comic-book borderless treatments and Web-Slinger chase cards.",
      contents: ["30 Marvel's Spider-Man Play Booster packs", 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Play Booster Box', Packs: '30', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'mtg-lorwyn-play-box', name: 'Lorwyn Eclipsed Play Booster Box', set: 'Lorwyn Eclipsed', game: 'magic', type: 'box',
      price: 149.99, compareAt: null, stock: 0, preorder: true, badge: null, featured: false, rating: 0, reviews: 0,
      description: 'Return to Lorwyn. Reserve a full Play Booster box at retail price with pre-order protection.',
      contents: ['30 Lorwyn Eclipsed Play Booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Play Booster Box', Packs: '30', Ships: 'On release day' }, image: null
    },

    /* -------------------------------------------------------- One Piece */
    {
      id: 'op-op11-box', name: 'OP-11 A Fist of Divine Speed Booster Box', set: 'A Fist of Divine Speed', game: 'onepiece', type: 'box',
      price: 119.99, compareAt: null, stock: 10, preorder: false, badge: null, featured: true, rating: 4.9, reviews: 58,
      description: 'Twenty-four sealed OP-11 booster packs. Manga Rares, Alternate Arts and the strongest Leader lineup in the game.',
      contents: ['24 OP-11 booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'op-op10-box', name: 'OP-10 Royal Blood Booster Box', set: 'Royal Blood', game: 'onepiece', type: 'box',
      price: 109.99, compareAt: null, stock: 16, preorder: false, badge: null, featured: false, rating: 4.8, reviews: 47,
      description: 'Twenty-four sealed OP-10 Royal Blood booster packs, featuring the Kuja Pirates and the Roger Pirates.',
      contents: ['24 OP-10 booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'op-op12-box', name: 'OP-12 Legacy of the Master Booster Box', set: 'Legacy of the Master', game: 'onepiece', type: 'box',
      price: 124.99, compareAt: null, stock: 0, preorder: true, badge: null, featured: true, rating: 0, reviews: 0,
      description: 'Reserve OP-12 at retail. Allocation locked at checkout, shipped insured on release day.',
      contents: ['24 OP-12 booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Ships: 'On release day' }, image: null
    },

    /* --------------------------------------------------------- Yu-Gi-Oh! */
    {
      id: 'ygo-alliance-insight-box', name: 'Alliance Insight Booster Box', set: 'Alliance Insight', game: 'yugioh', type: 'box',
      price: 84.99, compareAt: null, stock: 13, preorder: false, badge: null, featured: false, rating: 4.6, reviews: 31,
      description: 'Twenty-four first-edition Alliance Insight booster packs, sealed. Quarter Century Secret Rares in every box.',
      contents: ['24 Alliance Insight booster packs (1st Edition)', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'ygo-rarity-collection-2', name: '25th Anniversary Rarity Collection II Booster Box', set: 'Rarity Collection II', game: 'yugioh', type: 'box',
      price: 99.99, compareAt: null, stock: 8, preorder: false, badge: null, featured: false, rating: 4.9, reviews: 64,
      description: 'Every card in every rarity. Twenty-four packs of the most reprint-dense product Konami has released, sealed.',
      contents: ['24 Rarity Collection II booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'ygo-justice-hunters-box', name: 'Justice Hunters Booster Box', set: 'Justice Hunters', game: 'yugioh', type: 'box',
      price: 84.99, compareAt: null, stock: 21, preorder: false, badge: 'new', featured: false, rating: 4.5, reviews: 12,
      description: 'Twenty-four first-edition Justice Hunters booster packs, sealed and ready for the next format.',
      contents: ['24 Justice Hunters booster packs (1st Edition)', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },

    /* ----------------------------------------------------------- Lorcana */
    {
      id: 'lor-fabled-trove', name: "Fabled Illumineer's Trove", set: 'Fabled', game: 'lorcana', type: 'collection',
      price: 54.99, compareAt: null, stock: 17, preorder: false, badge: null, featured: true, rating: 4.8, reviews: 39,
      description: "Eight Fabled booster packs, a full-art playmat, two deck boxes and a collector's box. Lorcana's flagship sealed product.",
      contents: ['8 Fabled booster packs', '1 full-art playmat', '2 deck boxes', 'Damage counters and storage box'],
      specs: { Language: 'English', Format: "Illumineer's Trove", Packs: '8', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'lor-reign-of-jafar-box', name: 'Reign of Jafar Booster Box', set: 'Reign of Jafar', game: 'lorcana', type: 'box',
      price: 129.99, compareAt: null, stock: 9, preorder: false, badge: null, featured: false, rating: 4.7, reviews: 21,
      description: 'Twenty-four sealed Reign of Jafar booster packs with Enchanted chase cards.',
      contents: ['24 Reign of Jafar booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'lor-whispers-trove', name: "Whispers in the Well Illumineer's Trove", set: 'Whispers in the Well', game: 'lorcana', type: 'collection',
      price: 54.99, compareAt: null, stock: 0, preorder: true, badge: null, featured: false, rating: 0, reviews: 0,
      description: "Reserve the next Illumineer's Trove at retail price. Ships insured on release day.",
      contents: ['8 Whispers in the Well booster packs', '1 full-art playmat', '2 deck boxes', 'Damage counters and storage box'],
      specs: { Language: 'English', Format: "Illumineer's Trove", Packs: '8', Ships: 'On release day' }, image: null
    },

    /* --------------------------------------------- Star Wars / Riftbound */
    {
      id: 'swu-legends-force-box', name: 'Legends of the Force Booster Box', set: 'Legends of the Force', game: 'swu', type: 'box',
      price: 109.99, compareAt: null, stock: 14, preorder: false, badge: null, featured: false, rating: 4.7, reviews: 25,
      description: 'Twenty-four sealed Legends of the Force booster packs, with Showcase and Hyperspace variants.',
      contents: ['24 Legends of the Force booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },
    {
      id: 'rb-origins-box', name: 'Riftbound Origins Booster Box', set: 'Origins', game: 'riftbound', type: 'box',
      price: 139.99, compareAt: null, stock: 6, preorder: false, badge: 'new', featured: true, rating: 4.8, reviews: 17,
      description: 'The League of Legends trading card game, first set. Twenty-four sealed Origins booster packs with alternate-art Legends.',
      contents: ['24 Origins booster packs', 'Official sealed display box'],
      specs: { Language: 'English', Format: 'Booster Box', Packs: '24', Condition: 'Factory sealed' }, image: null
    },

    /* --------------------------------------------------- Graded singles */
    {
      id: 'gs-charizard-151', name: 'Charizard ex 199/165 Special Illustration Rare · PSA 10', set: 'Pokémon 151', game: 'pokemon', type: 'single',
      price: 1650, compareAt: null, stock: 1, preorder: false, badge: null, featured: true, rating: 5, reviews: 4, artLabel: 'Charizard ex',
      grade: { grader: 'PSA', grade: 10, label: 'Gem Mint', cert: '92 431 067' },
      description: 'The definitive modern Charizard. PSA 10 Gem Mint, centered, with a verifiable certification number. Ships in a sealed slab sleeve inside a padded, insured box.',
      contents: ['1 graded card in tamper-evident PSA slab', 'Certification verifiable on the PSA registry', 'Norvex authenticity certificate'],
      specs: { Grader: 'PSA', Grade: '10 Gem Mint', Set: 'Pokémon 151', Number: '199/165' }, image: null
    },
    {
      id: 'gs-umbreon-vmax', name: 'Umbreon VMAX 215/203 Alternate Art · PSA 10', set: 'Evolving Skies', game: 'pokemon', type: 'single',
      price: 2950, compareAt: null, stock: 1, preorder: false, badge: null, featured: true, rating: 5, reviews: 3, artLabel: 'Umbreon VMAX',
      grade: { grader: 'PSA', grade: 10, label: 'Gem Mint', cert: '88 120 554' },
      description: '"Moonbreon." The most sought-after modern alternate art in the hobby, in PSA 10. Sealed slab, verifiable cert, insured shipping included.',
      contents: ['1 graded card in tamper-evident PSA slab', 'Certification verifiable on the PSA registry', 'Norvex authenticity certificate'],
      specs: { Grader: 'PSA', Grade: '10 Gem Mint', Set: 'Evolving Skies', Number: '215/203' }, image: null
    },
    {
      id: 'gs-pikachu-felt', name: 'Pikachu with Grey Felt Hat 085 Promo · PSA 10', set: 'Van Gogh Museum', game: 'pokemon', type: 'single',
      price: 460, compareAt: null, stock: 2, preorder: false, badge: null, featured: false, rating: 5, reviews: 6, artLabel: 'Pikachu',
      grade: { grader: 'PSA', grade: 10, label: 'Gem Mint', cert: '79 905 210' },
      description: 'The Van Gogh Museum collaboration promo in PSA 10. A modern cultural artefact as much as a card.',
      contents: ['1 graded card in tamper-evident PSA slab', 'Certification verifiable on the PSA registry', 'Norvex authenticity certificate'],
      specs: { Grader: 'PSA', Grade: '10 Gem Mint', Set: 'SVP Black Star Promos', Number: '085' }, image: null
    },
    {
      id: 'gs-luffy-manga', name: 'Monkey.D.Luffy OP05-119 Manga Rare · PSA 10', set: 'Awakening of the New Era', game: 'onepiece', type: 'single',
      price: 2100, compareAt: null, stock: 1, preorder: false, badge: null, featured: true, rating: 5, reviews: 2, artLabel: 'Monkey.D.Luffy',
      grade: { grader: 'PSA', grade: 10, label: 'Gem Mint', cert: '90 776 318' },
      description: 'The Gear 5 Manga Rare that made One Piece a blue-chip TCG. PSA 10, verifiable cert, insured shipping included.',
      contents: ['1 graded card in tamper-evident PSA slab', 'Certification verifiable on the PSA registry', 'Norvex authenticity certificate'],
      specs: { Grader: 'PSA', Grade: '10 Gem Mint', Set: 'OP-05', Number: 'OP05-119' }, image: null
    },
    {
      id: 'gs-ragavan', name: 'Ragavan, Nimble Pilferer Showcase · PSA 10', set: 'Modern Horizons 2', game: 'magic', type: 'single',
      price: 380, compareAt: null, stock: 3, preorder: false, badge: null, featured: false, rating: 5, reviews: 5, artLabel: 'Ragavan',
      grade: { grader: 'PSA', grade: 10, label: 'Gem Mint', cert: '85 302 991' },
      description: 'The best one-drop in Modern, in its sketch-showcase frame, graded PSA 10.',
      contents: ['1 graded card in tamper-evident PSA slab', 'Certification verifiable on the PSA registry', 'Norvex authenticity certificate'],
      specs: { Grader: 'PSA', Grade: '10 Gem Mint', Set: 'Modern Horizons 2', Number: '338' }, image: null
    },

    /* ------------------------------------------------------ Accessories */
    {
      id: 'acc-vault-sleeves', name: 'Norvex Vault Sleeves · 100 pack', set: 'Vault Sleeves', game: 'norvex', type: 'accessory',
      price: 12.99, compareAt: null, stock: 200, preorder: false, badge: null, featured: false, rating: 4.9, reviews: 318,
      description: 'Archival-grade, acid-free matte sleeves sized for every major TCG. Zero PVC, zero glare, perfect shuffle feel.',
      contents: ['100 standard-size matte sleeves (66 × 91 mm)'],
      specs: { Size: 'Standard (66 × 91 mm)', Finish: 'Matte', Material: 'Acid-free polypropylene', Quantity: '100' }, image: null
    },
    {
      id: 'acc-zip-binder', name: 'Norvex 9-Pocket Zip Binder', set: 'Zip Binder', game: 'norvex', type: 'accessory',
      price: 39.99, compareAt: null, stock: 60, preorder: false, badge: null, featured: false, rating: 4.8, reviews: 142,
      description: 'Side-loading, 360-page capacity, vegan leather with a gold-embossed Norvex mark. Built to protect a collection for decades.',
      contents: ['1 zip binder, 20 side-loading 9-pocket pages (360 cards)'],
      specs: { Capacity: '360 cards', Pages: '20 side-loading', Material: 'Vegan leather', Finish: 'Gold emboss' }, image: null
    },
    {
      id: 'acc-playmat', name: 'Norvex Signature Playmat', set: 'Signature Playmat', game: 'norvex', type: 'accessory',
      price: 34.99, compareAt: null, stock: 80, preorder: false, badge: null, featured: false, rating: 4.9, reviews: 97,
      description: 'Stitched-edge, 3 mm rubber base, sublimation-printed obsidian and gold artwork. Tournament size.',
      contents: ['1 playmat (61 × 35 cm) with carrying tube'],
      specs: { Size: '61 × 35 cm', Thickness: '3 mm', Edge: 'Stitched', Base: 'Non-slip rubber' }, image: null
    },
    {
      id: 'acc-toploaders', name: 'Premium Toploaders · 25 pack', set: 'Toploaders', game: 'norvex', type: 'accessory',
      price: 9.99, compareAt: null, stock: 300, preorder: false, badge: null, featured: false, rating: 4.7, reviews: 210,
      description: 'Crystal-clear, 35 pt rigid toploaders with UV protection. The last stop before a card goes to grading.',
      contents: ['25 rigid toploaders (35 pt)'],
      specs: { Thickness: '35 pt', Size: 'Standard', Protection: 'UV', Quantity: '25' }, image: null
    }
  ]
};
