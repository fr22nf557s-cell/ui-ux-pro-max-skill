/* ==========================================================================
   NORVEX GAMING — product catalog
   --------------------------------------------------------------------------
   Everything the storefront renders comes from this file. The range below is
   modelled on a full UK TCG retailer's assortment (every major game, sealed
   product in every format, graded singles, accessory brands). Names follow the
   publishers' real product lines; PRICES ARE ESTIMATED UK RRP / MARKET PRICES
   and stock levels are placeholders — verify both against your live inventory
   before launch (or regenerate the file with scripts/import-catalog.mjs).

   Product shape:
     id          unique slug (used in URLs: product.html?id=<id>)
     name        full product title
     set         set / expansion / range name printed on the packaging art
     game        key from `games` below ('norvex' groups accessories)
     type        key from `types` below
     brand       optional: manufacturer shown instead of the game (accessories)
     price       number, in config.currency
     compareAt   optional "was" price
     stock       units on hand (0 = sold out unless preorder is true)
     preorder    true = accepts pre-orders, ships on release
     badge       'new' | 'hot' | null
     featured    true = eligible for the home page "New arrivals" grid
     rating      0–5, reviews = count (shown on product page)
     description one paragraph (your own copy)
     contents    bullet list shown under "What's inside"
     specs       key/value pairs shown as a spec grid
     image       optional path or URL to a product photo; when null the
                 storefront renders a stylised CSS packaging mock. If a URL
                 fails to load, the mock is shown automatically.
     grade       graded singles only: { grader, grade, label, cert }
     artLabel    graded singles only: card name printed on the slab art
   ========================================================================== */
window.NORVEX_DATA = {
  config: {
    "storeName": "Norvex Gaming",
    "currency": "GBP",
    "locale": "en-GB",
    "freeShippingThreshold": 100,
    "supportEmail": "hello@norvexgaming.com"
  },

  games: {
    "pokemon": {
      "name": "Pokémon TCG",
      "short": "Pokémon",
      "a": "#ffcb05",
      "b": "#c8102e",
      "c": "#2a75bb"
    },
    "magic": {
      "name": "Magic: The Gathering",
      "short": "Magic",
      "a": "#d4a92a",
      "b": "#17171c",
      "c": "#7c2d12"
    },
    "onepiece": {
      "name": "One Piece Card Game",
      "short": "One Piece",
      "a": "#e63946",
      "b": "#1d3557",
      "c": "#f4a261"
    },
    "yugioh": {
      "name": "Yu-Gi-Oh!",
      "short": "Yu-Gi-Oh!",
      "a": "#8b45b6",
      "b": "#1d1235",
      "c": "#e9b44c"
    },
    "lorcana": {
      "name": "Disney Lorcana",
      "short": "Lorcana",
      "a": "#2a4a9a",
      "b": "#0b1230",
      "c": "#d4af37"
    },
    "swu": {
      "name": "Star Wars: Unlimited",
      "short": "Star Wars",
      "a": "#3a3a44",
      "b": "#0a0a0d",
      "c": "#f0c24b"
    },
    "fab": {
      "name": "Flesh and Blood",
      "short": "Flesh and Blood",
      "a": "#b91c1c",
      "b": "#1c1917",
      "c": "#f59e0b"
    },
    "riftbound": {
      "name": "Riftbound",
      "short": "Riftbound",
      "a": "#0ac8b9",
      "b": "#091428",
      "c": "#c89b3c"
    },
    "digimon": {
      "name": "Digimon Card Game",
      "short": "Digimon",
      "a": "#ff7a00",
      "b": "#0a2540",
      "c": "#ffd166"
    },
    "dragonball": {
      "name": "Dragon Ball Super Fusion World",
      "short": "Dragon Ball",
      "a": "#f28c28",
      "b": "#1e3a8a",
      "c": "#fde047"
    },
    "norvex": {
      "name": "Accessories",
      "short": "Accessories",
      "a": "#d9b75b",
      "b": "#1a1a1f",
      "c": "#8c6f2a"
    }
  },

  types: {
    "etb": {
      "name": "Elite Trainer Boxes",
      "singular": "Elite Trainer Box",
      "art": "etb"
    },
    "box": {
      "name": "Booster Boxes",
      "singular": "Booster Box",
      "art": "box"
    },
    "bundle": {
      "name": "Booster Bundles",
      "singular": "Booster Bundle",
      "art": "bundle"
    },
    "pack": {
      "name": "Booster Packs",
      "singular": "Booster Pack",
      "art": "pack"
    },
    "deck": {
      "name": "Decks & Starters",
      "singular": "Deck",
      "art": "deck"
    },
    "collection": {
      "name": "Premium Collections",
      "singular": "Premium Collection",
      "art": "etb"
    },
    "single": {
      "name": "Graded Singles",
      "singular": "Graded Single",
      "art": "slab"
    },
    "accessory": {
      "name": "Accessories",
      "singular": "Accessory",
      "art": "accessory"
    }
  },

  products: [
    {
      "id": "pokemon-prismatic-evolutions-elite-trainer-box",
      "name": "Prismatic Evolutions Elite Trainer Box",
      "set": "Prismatic Evolutions",
      "game": "pokemon",
      "type": "etb",
      "price": 89.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": "hot",
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Prismatic Evolutions Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Prismatic Evolutions booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-mega-evolution-elite-trainer-box",
      "name": "Mega Evolution Elite Trainer Box",
      "set": "Mega Evolution",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 40,
      "preorder": false,
      "badge": "new",
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Mega Evolution Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Mega Evolution booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-destined-rivals-elite-trainer-box",
      "name": "Destined Rivals Elite Trainer Box",
      "set": "Destined Rivals",
      "game": "pokemon",
      "type": "etb",
      "price": 54.99,
      "compareAt": null,
      "stock": 31,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Destined Rivals Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Destined Rivals booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-journey-together-elite-trainer-box",
      "name": "Journey Together Elite Trainer Box",
      "set": "Journey Together",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 22,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Journey Together Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Journey Together booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-surging-sparks-elite-trainer-box",
      "name": "Surging Sparks Elite Trainer Box",
      "set": "Surging Sparks",
      "game": "pokemon",
      "type": "etb",
      "price": 52.99,
      "compareAt": null,
      "stock": 14,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Surging Sparks Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Surging Sparks booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-stellar-crown-elite-trainer-box",
      "name": "Stellar Crown Elite Trainer Box",
      "set": "Stellar Crown",
      "game": "pokemon",
      "type": "etb",
      "price": 47.99,
      "compareAt": null,
      "stock": 18,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Stellar Crown Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Stellar Crown booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-shrouded-fable-elite-trainer-box",
      "name": "Shrouded Fable Elite Trainer Box",
      "set": "Shrouded Fable",
      "game": "pokemon",
      "type": "etb",
      "price": 59.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Shrouded Fable Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Shrouded Fable booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-twilight-masquerade-elite-trainer-box",
      "name": "Twilight Masquerade Elite Trainer Box",
      "set": "Twilight Masquerade",
      "game": "pokemon",
      "type": "etb",
      "price": 47.99,
      "compareAt": null,
      "stock": 11,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Twilight Masquerade Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Twilight Masquerade booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-temporal-forces-elite-trainer-box",
      "name": "Temporal Forces Elite Trainer Box",
      "set": "Temporal Forces",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Temporal Forces Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Temporal Forces booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-black-bolt-elite-trainer-box",
      "name": "Black Bolt Elite Trainer Box",
      "set": "Black Bolt",
      "game": "pokemon",
      "type": "etb",
      "price": 54.99,
      "compareAt": null,
      "stock": 18,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Black Bolt Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Black Bolt booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-white-flare-elite-trainer-box",
      "name": "White Flare Elite Trainer Box",
      "set": "White Flare",
      "game": "pokemon",
      "type": "etb",
      "price": 54.99,
      "compareAt": null,
      "stock": 16,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed White Flare Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 White Flare booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-crown-zenith-elite-trainer-box",
      "name": "Crown Zenith Elite Trainer Box",
      "set": "Crown Zenith",
      "game": "pokemon",
      "type": "etb",
      "price": 74.99,
      "compareAt": null,
      "stock": 4,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Factory-sealed Crown Zenith Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Crown Zenith booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-phantasmal-flames-elite-trainer-box",
      "name": "Phantasmal Flames Elite Trainer Box",
      "set": "Phantasmal Flames",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": true,
      "rating": 0,
      "reviews": 0,
      "description": "Factory-sealed Phantasmal Flames Elite Trainer Box: nine booster packs, an exclusive full-art promo, sleeves, dice and the collector's box. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "9 Phantasmal Flames booster packs",
        "1 full-art foil promo card",
        "65 card sleeves, 45 Energy cards",
        "Dice, condition markers and player guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Packs": "9",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "pokemon-destined-rivals-booster-box",
      "name": "Destined Rivals Booster Box",
      "set": "Destined Rivals",
      "game": "pokemon",
      "type": "box",
      "price": 164.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Destined Rivals booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Destined Rivals booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-surging-sparks-booster-box",
      "name": "Surging Sparks Booster Box",
      "set": "Surging Sparks",
      "game": "pokemon",
      "type": "box",
      "price": 169.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Surging Sparks booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Surging Sparks booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-journey-together-booster-box",
      "name": "Journey Together Booster Box",
      "set": "Journey Together",
      "game": "pokemon",
      "type": "box",
      "price": 159.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Journey Together booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Journey Together booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-mega-evolution-booster-box",
      "name": "Mega Evolution Booster Box",
      "set": "Mega Evolution",
      "game": "pokemon",
      "type": "box",
      "price": 154.99,
      "compareAt": null,
      "stock": 20,
      "preorder": false,
      "badge": "new",
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Mega Evolution booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Mega Evolution booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-stellar-crown-booster-box",
      "name": "Stellar Crown Booster Box",
      "set": "Stellar Crown",
      "game": "pokemon",
      "type": "box",
      "price": 149.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Stellar Crown booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Stellar Crown booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-twilight-masquerade-booster-box",
      "name": "Twilight Masquerade Booster Box",
      "set": "Twilight Masquerade",
      "game": "pokemon",
      "type": "box",
      "price": 154.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Twilight Masquerade booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Twilight Masquerade booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-temporal-forces-booster-box",
      "name": "Temporal Forces Booster Box",
      "set": "Temporal Forces",
      "game": "pokemon",
      "type": "box",
      "price": 159.99,
      "compareAt": null,
      "stock": 5,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Temporal Forces booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Temporal Forces booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-evolving-skies-booster-box",
      "name": "Evolving Skies Booster Box",
      "set": "Evolving Skies",
      "game": "pokemon",
      "type": "box",
      "price": 649.99,
      "compareAt": null,
      "stock": 2,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Evolving Skies booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Evolving Skies booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-phantasmal-flames-booster-box",
      "name": "Phantasmal Flames Booster Box",
      "set": "Phantasmal Flames",
      "game": "pokemon",
      "type": "box",
      "price": 149.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "A full sealed Phantasmal Flames booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Phantasmal Flames booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "36",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "pokemon-prismatic-evolutions-booster-bundle",
      "name": "Prismatic Evolutions Booster Bundle",
      "set": "Prismatic Evolutions",
      "game": "pokemon",
      "type": "bundle",
      "price": 44.99,
      "compareAt": null,
      "stock": 22,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Prismatic Evolutions booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Prismatic Evolutions booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-mega-evolution-booster-bundle",
      "name": "Mega Evolution Booster Bundle",
      "set": "Mega Evolution",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 45,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Mega Evolution booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Mega Evolution booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-booster-bundle.webp"
    },
    {
      "id": "pokemon-destined-rivals-booster-bundle",
      "name": "Destined Rivals Booster Bundle",
      "set": "Destined Rivals",
      "game": "pokemon",
      "type": "bundle",
      "price": 27.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Destined Rivals booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Destined Rivals booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-journey-together-booster-bundle",
      "name": "Journey Together Booster Bundle",
      "set": "Journey Together",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 25,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Journey Together booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Journey Together booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-surging-sparks-booster-bundle",
      "name": "Surging Sparks Booster Bundle",
      "set": "Surging Sparks",
      "game": "pokemon",
      "type": "bundle",
      "price": 27.99,
      "compareAt": null,
      "stock": 19,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Surging Sparks booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Surging Sparks booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-shrouded-fable-booster-bundle",
      "name": "Shrouded Fable Booster Bundle",
      "set": "Shrouded Fable",
      "game": "pokemon",
      "type": "bundle",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Shrouded Fable booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Shrouded Fable booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-black-bolt-booster-bundle",
      "name": "Black Bolt Booster Bundle",
      "set": "Black Bolt",
      "game": "pokemon",
      "type": "bundle",
      "price": 27.99,
      "compareAt": null,
      "stock": 28,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Black Bolt booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 Black Bolt booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-white-flare-booster-bundle",
      "name": "White Flare Booster Bundle",
      "set": "White Flare",
      "game": "pokemon",
      "type": "bundle",
      "price": 27.99,
      "compareAt": null,
      "stock": 26,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed White Flare booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "6 White Flare booster packs"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "6",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-prismatic-evolutions-booster-pack",
      "name": "Prismatic Evolutions Booster Pack",
      "set": "Prismatic Evolutions",
      "game": "pokemon",
      "type": "pack",
      "price": 7.99,
      "compareAt": null,
      "stock": 120,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Prismatic Evolutions booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Prismatic Evolutions booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-mega-evolution-booster-pack",
      "name": "Mega Evolution Booster Pack",
      "set": "Mega Evolution",
      "game": "pokemon",
      "type": "pack",
      "price": 4.49,
      "compareAt": null,
      "stock": 400,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Mega Evolution booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Mega Evolution booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-destined-rivals-booster-pack",
      "name": "Destined Rivals Booster Pack",
      "set": "Destined Rivals",
      "game": "pokemon",
      "type": "pack",
      "price": 4.49,
      "compareAt": null,
      "stock": 300,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Destined Rivals booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Destined Rivals booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-surging-sparks-booster-pack",
      "name": "Surging Sparks Booster Pack",
      "set": "Surging Sparks",
      "game": "pokemon",
      "type": "pack",
      "price": 4.49,
      "compareAt": null,
      "stock": 250,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Surging Sparks booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Surging Sparks booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-pokemon-151-ultra-premium-collection",
      "name": "Pokémon 151 Ultra-Premium Collection",
      "set": "Pokémon 151",
      "game": "pokemon",
      "type": "collection",
      "price": 179.99,
      "compareAt": 199.99,
      "stock": 3,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 5,
      "reviews": 88,
      "description": "The original 151 in the most premium format Pokémon has produced. Sixteen booster packs, three etched foil promos and a full-metal Poké Ball display.",
      "contents": [
        "16 Pokémon 151 booster packs",
        "3 etched foil promo cards (Mew ex, Mewtwo ex, Charizard ex)",
        "Metal Poké Ball, playmat and deck box",
        "65 card sleeves and 65 Energy cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Ultra-Premium Collection",
        "Packs": "16",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-charizard-ex-super-premium-collection",
      "name": "Charizard ex Super-Premium Collection",
      "set": "Charizard ex",
      "game": "pokemon",
      "type": "collection",
      "price": 84.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Charizard ex Super-Premium Collection: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "10 booster packs",
        "3 foil promo cards (Charizard ex, Charmander, Charmeleon)",
        "Charizard ex playmat, deck box and dice"
      ],
      "specs": {
        "Language": "English",
        "Format": "Super-Premium Collection",
        "Packs": "10",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-prismatic-evolutions-super-premium-collection",
      "name": "Prismatic Evolutions Super-Premium Collection",
      "set": "Prismatic Evolutions",
      "game": "pokemon",
      "type": "collection",
      "price": 109.99,
      "compareAt": null,
      "stock": 5,
      "preorder": false,
      "badge": "hot",
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Prismatic Evolutions Super-Premium Collection: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "11 Prismatic Evolutions booster packs",
        "Etched foil Eevee ex promo",
        "Eeveelution deck box, playmat and dice"
      ],
      "specs": {
        "Language": "English",
        "Format": "Super-Premium Collection",
        "Packs": "11",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-mega-evolution-battle-deck",
      "name": "Mega Evolution Battle Deck",
      "set": "Mega Evolution",
      "game": "pokemon",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 40,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Mega Evolution deck with everything you need for your first games.",
      "contents": [
        "1 pre-built deck",
        "Play guide and tokens"
      ],
      "specs": {
        "Language": "English",
        "Format": "Battle Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-play-booster-box",
      "name": "Final Fantasy Play Booster Box",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "box",
      "price": 219.99,
      "compareAt": null,
      "stock": 15,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Final Fantasy booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Final Fantasy booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-avatar-the-last-airbender-play-booster-box",
      "name": "Avatar: The Last Airbender Play Booster Box",
      "set": "Avatar: The Last Airbender",
      "game": "magic",
      "type": "box",
      "price": 159.99,
      "compareAt": null,
      "stock": 20,
      "preorder": false,
      "badge": "new",
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Avatar: The Last Airbender booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "30 Avatar: The Last Airbender booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "30",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-avatar-the-last-airbender-play-booster-box.webp"
    },
    {
      "id": "magic-marvel-s-spider-man-play-booster-box",
      "name": "Marvel's Spider-Man Play Booster Box",
      "set": "Marvel's Spider-Man",
      "game": "magic",
      "type": "box",
      "price": 149.99,
      "compareAt": null,
      "stock": 11,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Marvel's Spider-Man booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "30 Marvel's Spider-Man booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "30",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-play-booster-box",
      "name": "Edge of Eternities Play Booster Box",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "box",
      "price": 129.99,
      "compareAt": null,
      "stock": 18,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Edge of Eternities booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Edge of Eternities booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-edge-of-eternities-play-booster-box.webp"
    },
    {
      "id": "magic-tarkir-dragonstorm-play-booster-box",
      "name": "Tarkir: Dragonstorm Play Booster Box",
      "set": "Tarkir: Dragonstorm",
      "game": "magic",
      "type": "box",
      "price": 129.99,
      "compareAt": null,
      "stock": 14,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Tarkir: Dragonstorm booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Tarkir: Dragonstorm booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-tarkir-dragonstorm-play-booster-box.webp"
    },
    {
      "id": "magic-aetherdrift-play-booster-box",
      "name": "Aetherdrift Play Booster Box",
      "set": "Aetherdrift",
      "game": "magic",
      "type": "box",
      "price": 114.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Aetherdrift booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Aetherdrift booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-foundations-play-booster-box",
      "name": "Foundations Play Booster Box",
      "set": "Foundations",
      "game": "magic",
      "type": "box",
      "price": 129.99,
      "compareAt": null,
      "stock": 16,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Foundations booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Foundations booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-duskmourn-house-of-horror-play-booster-box",
      "name": "Duskmourn: House of Horror Play Booster Box",
      "set": "Duskmourn: House of Horror",
      "game": "magic",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Duskmourn: House of Horror booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Duskmourn: House of Horror booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-bloomburrow-play-booster-box",
      "name": "Bloomburrow Play Booster Box",
      "set": "Bloomburrow",
      "game": "magic",
      "type": "box",
      "price": 124.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Bloomburrow booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Bloomburrow booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-lorwyn-eclipsed-play-booster-box",
      "name": "Lorwyn Eclipsed Play Booster Box",
      "set": "Lorwyn Eclipsed",
      "game": "magic",
      "type": "box",
      "price": 139.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "A full sealed Lorwyn Eclipsed booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "36 Lorwyn Eclipsed booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster Box",
        "Packs": "36",
        "Ships": "On release day"
      },
      "image": "assets/img/products/magic-lorwyn-eclipsed-play-booster-box.webp"
    },
    {
      "id": "magic-final-fantasy-collector-booster-box",
      "name": "Final Fantasy Collector Booster Box",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "box",
      "price": 549.99,
      "compareAt": null,
      "stock": 4,
      "preorder": false,
      "badge": "hot",
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "Twelve Final Fantasy Collector Boosters with guaranteed foils, borderless and extended-art treatments and the set's serialized chase cards. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "12 Final Fantasy booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector Booster Box",
        "Packs": "12",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-collector-booster-box",
      "name": "Edge of Eternities Collector Booster Box",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "box",
      "price": 299.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Twelve Edge of Eternities Collector Boosters with guaranteed foils, borderless and extended-art treatments and the set's serialized chase cards. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "12 Edge of Eternities booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector Booster Box",
        "Packs": "12",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-edge-of-eternities-collector-booster-box.webp"
    },
    {
      "id": "magic-avatar-the-last-airbender-collector-booster-box",
      "name": "Avatar: The Last Airbender Collector Booster Box",
      "set": "Avatar: The Last Airbender",
      "game": "magic",
      "type": "box",
      "price": 279.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": "new",
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Twelve Avatar: The Last Airbender Collector Boosters with guaranteed foils, borderless and extended-art treatments and the set's serialized chase cards. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "12 Avatar: The Last Airbender booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector Booster Box",
        "Packs": "12",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-avatar-the-last-airbender-collector-booster-box.webp"
    },
    {
      "id": "magic-tarkir-dragonstorm-collector-booster-box",
      "name": "Tarkir: Dragonstorm Collector Booster Box",
      "set": "Tarkir: Dragonstorm",
      "game": "magic",
      "type": "box",
      "price": 229.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Twelve Tarkir: Dragonstorm Collector Boosters with guaranteed foils, borderless and extended-art treatments and the set's serialized chase cards. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "12 Tarkir: Dragonstorm booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector Booster Box",
        "Packs": "12",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-tarkir-dragonstorm-collector-booster-box.webp"
    },
    {
      "id": "magic-bloomburrow-collector-booster-box",
      "name": "Bloomburrow Collector Booster Box",
      "set": "Bloomburrow",
      "game": "magic",
      "type": "box",
      "price": 239.99,
      "compareAt": null,
      "stock": 5,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Twelve Bloomburrow Collector Boosters with guaranteed foils, borderless and extended-art treatments and the set's serialized chase cards. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "12 Bloomburrow booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector Booster Box",
        "Packs": "12",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-bundle",
      "name": "Final Fantasy Bundle",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "bundle",
      "price": 69.99,
      "compareAt": null,
      "stock": 14,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Final Fantasy booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Final Fantasy Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-bundle",
      "name": "Edge of Eternities Bundle",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "bundle",
      "price": 49.99,
      "compareAt": null,
      "stock": 20,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Edge of Eternities booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Edge of Eternities Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-edge-of-eternities-bundle.webp"
    },
    {
      "id": "magic-avatar-the-last-airbender-bundle",
      "name": "Avatar: The Last Airbender Bundle",
      "set": "Avatar: The Last Airbender",
      "game": "magic",
      "type": "bundle",
      "price": 49.99,
      "compareAt": null,
      "stock": 22,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Avatar: The Last Airbender booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Avatar: The Last Airbender Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-avatar-the-last-airbender-bundle.webp"
    },
    {
      "id": "magic-tarkir-dragonstorm-bundle",
      "name": "Tarkir: Dragonstorm Bundle",
      "set": "Tarkir: Dragonstorm",
      "game": "magic",
      "type": "bundle",
      "price": 54.99,
      "compareAt": null,
      "stock": 25,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Tarkir: Dragonstorm booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Tarkir: Dragonstorm Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-tarkir-dragonstorm-bundle.webp"
    },
    {
      "id": "magic-bloomburrow-bundle",
      "name": "Bloomburrow Bundle",
      "set": "Bloomburrow",
      "game": "magic",
      "type": "bundle",
      "price": 44.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Six sealed Bloomburrow booster packs in the official display bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Bloomburrow Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-commander-deck-counter-blitz",
      "name": "Final Fantasy Commander Deck: Counter Blitz",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "deck",
      "price": 59.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Final Fantasy deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-commander-deck-revival-trance",
      "name": "Final Fantasy Commander Deck: Revival Trance",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "deck",
      "price": 59.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Final Fantasy deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-commander-deck-scions-spellcraft",
      "name": "Final Fantasy Commander Deck: Scions & Spellcraft",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "deck",
      "price": 59.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Final Fantasy deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-commander-deck-limit-break",
      "name": "Final Fantasy Commander Deck: Limit Break",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "deck",
      "price": 59.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Final Fantasy deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-commander-deck-world-shaper",
      "name": "Edge of Eternities Commander Deck: World Shaper",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Edge of Eternities deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-commander-deck-counter-intelligence",
      "name": "Edge of Eternities Commander Deck: Counter Intelligence",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Edge of Eternities deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-tarkir-dragonstorm-commander-deck-temur-roar",
      "name": "Tarkir: Dragonstorm Commander Deck: Temur Roar",
      "set": "Tarkir: Dragonstorm",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Tarkir: Dragonstorm deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-tarkir-dragonstorm-commander-deck-mardu-surge",
      "name": "Tarkir: Dragonstorm Commander Deck: Mardu Surge",
      "set": "Tarkir: Dragonstorm",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Tarkir: Dragonstorm deck with everything you need for your first games.",
      "contents": [
        "100-card ready-to-play Commander deck",
        "Foil-etched display commander",
        "10 double-sided tokens",
        "Deck box and reference cards"
      ],
      "specs": {
        "Language": "English",
        "Format": "Commander Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-foundations-starter-collection",
      "name": "Foundations Starter Collection",
      "set": "Foundations",
      "game": "magic",
      "type": "deck",
      "price": 49.99,
      "compareAt": null,
      "stock": 15,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Foundations deck with everything you need for your first games.",
      "contents": [
        "Over 350 cards including 2 pre-built decks",
        "Deck boxes, dice and learn-to-play guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Starter Collection",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-foundations-jumpstart-booster-box",
      "name": "Foundations Jumpstart Booster Box",
      "set": "Foundations",
      "game": "magic",
      "type": "box",
      "price": 109.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Foundations booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "18 Foundations booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Jumpstart Booster Box",
        "Packs": "18",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-final-fantasy-play-booster-pack",
      "name": "Final Fantasy Play Booster Pack",
      "set": "Final Fantasy",
      "game": "magic",
      "type": "pack",
      "price": 6.99,
      "compareAt": null,
      "stock": 150,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Final Fantasy booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Final Fantasy booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "magic-edge-of-eternities-play-booster-pack",
      "name": "Edge of Eternities Play Booster Pack",
      "set": "Edge of Eternities",
      "game": "magic",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 200,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Edge of Eternities booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Edge of Eternities booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-edge-of-eternities-play-booster-pack.webp"
    },
    {
      "id": "magic-avatar-the-last-airbender-play-booster-pack",
      "name": "Avatar: The Last Airbender Play Booster Pack",
      "set": "Avatar: The Last Airbender",
      "game": "magic",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 220,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Avatar: The Last Airbender booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Avatar: The Last Airbender booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Play Booster",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-avatar-the-last-airbender-play-booster-pack.webp"
    },
    {
      "id": "onepiece-op-11-a-fist-of-divine-speed-booster-box",
      "name": "OP-11 A Fist of Divine Speed Booster Box",
      "set": "A Fist of Divine Speed",
      "game": "onepiece",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed A Fist of Divine Speed booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 A Fist of Divine Speed booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-10-royal-blood-booster-box",
      "name": "OP-10 Royal Blood Booster Box",
      "set": "Royal Blood",
      "game": "onepiece",
      "type": "box",
      "price": 109.99,
      "compareAt": null,
      "stock": 16,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Royal Blood booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Royal Blood booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-09-emperors-in-the-new-world-booster-box",
      "name": "OP-09 Emperors in the New World Booster Box",
      "set": "Emperors in the New World",
      "game": "onepiece",
      "type": "box",
      "price": 109.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Emperors in the New World booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Emperors in the New World booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-08-two-legends-booster-box",
      "name": "OP-08 Two Legends Booster Box",
      "set": "Two Legends",
      "game": "onepiece",
      "type": "box",
      "price": 104.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Two Legends booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Two Legends booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-eb-02-anime-25th-collection-booster-box",
      "name": "EB-02 Anime 25th Collection Booster Box",
      "set": "Anime 25th Collection",
      "game": "onepiece",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Anime 25th Collection booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Anime 25th Collection booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-12-legacy-of-the-master-booster-box",
      "name": "OP-12 Legacy of the Master Booster Box",
      "set": "Legacy of the Master",
      "game": "onepiece",
      "type": "box",
      "price": 124.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": true,
      "rating": 0,
      "reviews": 0,
      "description": "A full sealed Legacy of the Master booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Legacy of the Master booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "onepiece-st-21-ex-gear-5-starter-deck",
      "name": "ST-21 EX Gear 5 Starter Deck",
      "set": "EX Gear 5",
      "game": "onepiece",
      "type": "deck",
      "price": 24.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal EX Gear 5 deck with everything you need for your first games.",
      "contents": [
        "51-card ready-to-play deck",
        "Leader card, DON!! cards and play sheet"
      ],
      "specs": {
        "Language": "English",
        "Format": "Starter Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-st-23-shanks-starter-deck",
      "name": "ST-23 Shanks Starter Deck",
      "set": "Shanks",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Shanks deck with everything you need for your first games.",
      "contents": [
        "51-card ready-to-play deck",
        "Leader card, DON!! cards and play sheet"
      ],
      "specs": {
        "Language": "English",
        "Format": "Starter Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-st-27-marshall-d-teach-starter-deck",
      "name": "ST-27 Marshall.D.Teach Starter Deck",
      "set": "Marshall.D.Teach",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Marshall.D.Teach deck with everything you need for your first games.",
      "contents": [
        "51-card ready-to-play deck",
        "Leader card, DON!! cards and play sheet"
      ],
      "specs": {
        "Language": "English",
        "Format": "Starter Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-st-28-yamato-starter-deck",
      "name": "ST-28 Yamato Starter Deck",
      "set": "Yamato",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Yamato deck with everything you need for your first games.",
      "contents": [
        "51-card ready-to-play deck",
        "Leader card, DON!! cards and play sheet"
      ],
      "specs": {
        "Language": "English",
        "Format": "Starter Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-11-a-fist-of-divine-speed-booster-pack",
      "name": "OP-11 A Fist of Divine Speed Booster Pack",
      "set": "A Fist of Divine Speed",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 180,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed A Fist of Divine Speed booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 A Fist of Divine Speed booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "onepiece-op-12-legacy-of-the-master-booster-pack",
      "name": "OP-12 Legacy of the Master Booster Pack",
      "set": "Legacy of the Master",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "A single factory-sealed Legacy of the Master booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Legacy of the Master booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "yugioh-justice-hunters-booster-box",
      "name": "Justice Hunters Booster Box",
      "set": "Justice Hunters",
      "game": "yugioh",
      "type": "box",
      "price": 84.99,
      "compareAt": null,
      "stock": 21,
      "preorder": false,
      "badge": "new",
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Justice Hunters booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Justice Hunters booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-doom-of-dimensions-booster-box",
      "name": "Doom of Dimensions Booster Box",
      "set": "Doom of Dimensions",
      "game": "yugioh",
      "type": "box",
      "price": 79.99,
      "compareAt": null,
      "stock": 15,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Doom of Dimensions booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Doom of Dimensions booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-alliance-insight-booster-box",
      "name": "Alliance Insight Booster Box",
      "set": "Alliance Insight",
      "game": "yugioh",
      "type": "box",
      "price": 84.99,
      "compareAt": null,
      "stock": 13,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Alliance Insight booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Alliance Insight booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-duelist-s-advance-booster-box",
      "name": "Duelist's Advance Booster Box",
      "set": "Duelist's Advance",
      "game": "yugioh",
      "type": "box",
      "price": 79.99,
      "compareAt": null,
      "stock": 11,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Duelist's Advance booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Duelist's Advance booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-supreme-darkness-booster-box",
      "name": "Supreme Darkness Booster Box",
      "set": "Supreme Darkness",
      "game": "yugioh",
      "type": "box",
      "price": 79.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Supreme Darkness booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Supreme Darkness booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-25th-anniversary-rarity-collection-ii-booster-box",
      "name": "25th Anniversary Rarity Collection II Booster Box",
      "set": "25th Anniversary Rarity Collection II",
      "game": "yugioh",
      "type": "box",
      "price": 99.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed 25th Anniversary Rarity Collection II booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 25th Anniversary Rarity Collection II booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-quarter-century-bonanza-booster-box",
      "name": "Quarter Century Bonanza Booster Box",
      "set": "Quarter Century Bonanza",
      "game": "yugioh",
      "type": "box",
      "price": 89.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Quarter Century Bonanza booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Quarter Century Bonanza booster packs (1st Edition)",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-structure-deck-blue-eyes-white-destiny",
      "name": "Structure Deck: Blue-Eyes White Destiny",
      "set": "Blue-Eyes White Destiny",
      "game": "yugioh",
      "type": "deck",
      "price": 12.99,
      "compareAt": null,
      "stock": 35,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Blue-Eyes White Destiny deck with everything you need for your first games.",
      "contents": [
        "46-card pre-built deck",
        "Deluxe game mat and dueling guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Structure Deck",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-25th-anniversary-tin-dueling-mirrors",
      "name": "25th Anniversary Tin: Dueling Mirrors",
      "set": "Dueling Mirrors",
      "game": "yugioh",
      "type": "collection",
      "price": 22.99,
      "compareAt": null,
      "stock": 25,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "25th Anniversary Tin: Dueling Mirrors: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "3 Dueling Mirrors mega-packs",
        "Collector's tin with 25th Anniversary artwork"
      ],
      "specs": {
        "Language": "English",
        "Format": "Collector's Tin",
        "Packs": "3",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-justice-hunters-booster-pack",
      "name": "Justice Hunters Booster Pack",
      "set": "Justice Hunters",
      "game": "yugioh",
      "type": "pack",
      "price": 3.49,
      "compareAt": null,
      "stock": 300,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Justice Hunters booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Justice Hunters booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "yugioh-alliance-insight-booster-pack",
      "name": "Alliance Insight Booster Pack",
      "set": "Alliance Insight",
      "game": "yugioh",
      "type": "pack",
      "price": 3.49,
      "compareAt": null,
      "stock": 300,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Alliance Insight booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Alliance Insight booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-fabled-booster-box",
      "name": "Fabled Booster Box",
      "set": "Fabled",
      "game": "lorcana",
      "type": "box",
      "price": 129.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Fabled booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Fabled booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-reign-of-jafar-booster-box",
      "name": "Reign of Jafar Booster Box",
      "set": "Reign of Jafar",
      "game": "lorcana",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 11,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Reign of Jafar booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Reign of Jafar booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-archazia-s-island-booster-box",
      "name": "Archazia's Island Booster Box",
      "set": "Archazia's Island",
      "game": "lorcana",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Archazia's Island booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Archazia's Island booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-azurite-sea-booster-box",
      "name": "Azurite Sea Booster Box",
      "set": "Azurite Sea",
      "game": "lorcana",
      "type": "box",
      "price": 109.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Azurite Sea booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Azurite Sea booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-whispers-in-the-well-booster-box",
      "name": "Whispers in the Well Booster Box",
      "set": "Whispers in the Well",
      "game": "lorcana",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "A full sealed Whispers in the Well booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Whispers in the Well booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "lorcana-fabled-illumineer-s-trove",
      "name": "Fabled Illumineer's Trove",
      "set": "Fabled",
      "game": "lorcana",
      "type": "collection",
      "price": 54.99,
      "compareAt": null,
      "stock": 17,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "Fabled Illumineer's Trove: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "8 Fabled booster packs",
        "1 full-art playmat",
        "2 deck boxes",
        "Damage counters and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Illumineer's Trove",
        "Packs": "8",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-reign-of-jafar-illumineer-s-trove",
      "name": "Reign of Jafar Illumineer's Trove",
      "set": "Reign of Jafar",
      "game": "lorcana",
      "type": "collection",
      "price": 49.99,
      "compareAt": null,
      "stock": 14,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Reign of Jafar Illumineer's Trove: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "8 Reign of Jafar booster packs",
        "1 full-art playmat",
        "2 deck boxes",
        "Damage counters and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Illumineer's Trove",
        "Packs": "8",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-archazia-s-island-illumineer-s-trove",
      "name": "Archazia's Island Illumineer's Trove",
      "set": "Archazia's Island",
      "game": "lorcana",
      "type": "collection",
      "price": 49.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Archazia's Island Illumineer's Trove: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "8 Archazia's Island booster packs",
        "1 full-art playmat",
        "2 deck boxes",
        "Damage counters and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Illumineer's Trove",
        "Packs": "8",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-whispers-in-the-well-illumineer-s-trove",
      "name": "Whispers in the Well Illumineer's Trove",
      "set": "Whispers in the Well",
      "game": "lorcana",
      "type": "collection",
      "price": 49.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "Whispers in the Well Illumineer's Trove: a premium sealed collection with exclusive promos and accessories, sealed at the factory. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "8 Whispers in the Well booster packs",
        "1 full-art playmat",
        "2 deck boxes",
        "Damage counters and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Illumineer's Trove",
        "Packs": "8",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "lorcana-fabled-booster-pack",
      "name": "Fabled Booster Pack",
      "set": "Fabled",
      "game": "lorcana",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 200,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Fabled booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Fabled booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "lorcana-reign-of-jafar-booster-pack",
      "name": "Reign of Jafar Booster Pack",
      "set": "Reign of Jafar",
      "game": "lorcana",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 200,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Reign of Jafar booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Reign of Jafar booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "swu-legends-of-the-force-booster-box",
      "name": "Legends of the Force Booster Box",
      "set": "Legends of the Force",
      "game": "swu",
      "type": "box",
      "price": 109.99,
      "compareAt": null,
      "stock": 14,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Legends of the Force booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Legends of the Force booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "swu-jump-to-lightspeed-booster-box",
      "name": "Jump to Lightspeed Booster Box",
      "set": "Jump to Lightspeed",
      "game": "swu",
      "type": "box",
      "price": 99.99,
      "compareAt": null,
      "stock": 10,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Jump to Lightspeed booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Jump to Lightspeed booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "swu-twilight-of-the-republic-booster-box",
      "name": "Twilight of the Republic Booster Box",
      "set": "Twilight of the Republic",
      "game": "swu",
      "type": "box",
      "price": 94.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Twilight of the Republic booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Twilight of the Republic booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "swu-secrets-of-power-booster-box",
      "name": "Secrets of Power Booster Box",
      "set": "Secrets of Power",
      "game": "swu",
      "type": "box",
      "price": 104.99,
      "compareAt": null,
      "stock": 0,
      "preorder": true,
      "badge": null,
      "featured": false,
      "rating": 0,
      "reviews": 0,
      "description": "A full sealed Secrets of Power booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Secrets of Power booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Ships": "On release day"
      },
      "image": null
    },
    {
      "id": "swu-legends-of-the-force-two-player-starter",
      "name": "Legends of the Force Two-Player Starter",
      "set": "Legends of the Force",
      "game": "swu",
      "type": "deck",
      "price": 29.99,
      "compareAt": null,
      "stock": 20,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete, tournament-legal Legends of the Force deck with everything you need for your first games.",
      "contents": [
        "2 ready-to-play 50-card decks",
        "Leader and base cards, tokens and rules reference"
      ],
      "specs": {
        "Language": "English",
        "Format": "Two-Player Starter",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "fab-super-slam-booster-box",
      "name": "Super Slam Booster Box",
      "set": "Super Slam",
      "game": "fab",
      "type": "box",
      "price": 89.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Super Slam booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Super Slam booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "fab-high-seas-booster-box",
      "name": "High Seas Booster Box",
      "set": "High Seas",
      "game": "fab",
      "type": "box",
      "price": 89.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed High Seas booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 High Seas booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "fab-hunted-booster-box",
      "name": "Hunted Booster Box",
      "set": "Hunted",
      "game": "fab",
      "type": "box",
      "price": 89.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Hunted booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Hunted booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "fab-rosetta-booster-box",
      "name": "Rosetta Booster Box",
      "set": "Rosetta",
      "game": "fab",
      "type": "box",
      "price": 84.99,
      "compareAt": null,
      "stock": 5,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Rosetta booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Rosetta booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "riftbound-riftbound-origins-booster-box",
      "name": "Riftbound Origins Booster Box",
      "set": "Origins",
      "game": "riftbound",
      "type": "box",
      "price": 139.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": "new",
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "The League of Legends trading card game, first set. Twenty-four sealed Origins booster packs with alternate-art Legends. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Origins booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "riftbound-riftbound-origins-booster-pack",
      "name": "Riftbound Origins Booster Pack",
      "set": "Origins",
      "game": "riftbound",
      "type": "pack",
      "price": 5.99,
      "compareAt": null,
      "stock": 160,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A single factory-sealed Origins booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Origins booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Packs": "1",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "digimon-bt-20-over-the-x-booster-box",
      "name": "BT-20 Over the X Booster Box",
      "set": "Over the X",
      "game": "digimon",
      "type": "box",
      "price": 74.99,
      "compareAt": null,
      "stock": 8,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Over the X booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Over the X booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "digimon-bt-19-xros-evolution-booster-box",
      "name": "BT-19 Xros Evolution Booster Box",
      "set": "Xros Evolution",
      "game": "digimon",
      "type": "box",
      "price": 69.99,
      "compareAt": null,
      "stock": 6,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Xros Evolution booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Xros Evolution booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "dragonball-fb-04-ultra-limit-booster-box",
      "name": "FB-04 Ultra Limit Booster Box",
      "set": "Ultra Limit",
      "game": "dragonball",
      "type": "box",
      "price": 79.99,
      "compareAt": null,
      "stock": 9,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Ultra Limit booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Ultra Limit booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "dragonball-fb-05-divine-might-booster-box",
      "name": "FB-05 Divine Might Booster Box",
      "set": "Divine Might",
      "game": "dragonball",
      "type": "box",
      "price": 79.99,
      "compareAt": null,
      "stock": 7,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 24,
      "description": "A full sealed Divine Might booster display box, never opened and never resealed. Sourced direct from the distributor, tamper-checked and logged before it enters the vault.",
      "contents": [
        "24 Divine Might booster packs",
        "Official sealed display box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Packs": "24",
        "Condition": "Factory sealed"
      },
      "image": null
    },
    {
      "id": "pokemon-charizard-ex-199-165-special-illustration-rare-psa-10",
      "name": "Charizard ex 199/165 Special Illustration Rare · PSA 10",
      "set": "Pokémon 151",
      "game": "pokemon",
      "type": "single",
      "price": 1350,
      "compareAt": null,
      "stock": 1,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 5,
      "reviews": 3,
      "description": "Charizard ex from Pokémon 151, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Pokémon 151",
        "Number": "199/165"
      },
      "image": "https://images.pokemontcg.io/sv3pt5/199_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "92 431 067"
      },
      "artLabel": "Charizard ex"
    },
    {
      "id": "pokemon-umbreon-vmax-215-203-alternate-art-psa-10",
      "name": "Umbreon VMAX 215/203 Alternate Art · PSA 10",
      "set": "Evolving Skies",
      "game": "pokemon",
      "type": "single",
      "price": 2400,
      "compareAt": null,
      "stock": 1,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 5,
      "reviews": 3,
      "description": "Umbreon VMAX from Evolving Skies, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Evolving Skies",
        "Number": "215/203"
      },
      "image": "https://images.pokemontcg.io/swsh7/215_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "88 120 554"
      },
      "artLabel": "Umbreon VMAX"
    },
    {
      "id": "pokemon-umbreon-ex-161-131-special-illustration-rare-psa-10",
      "name": "Umbreon ex 161/131 Special Illustration Rare · PSA 10",
      "set": "Prismatic Evolutions",
      "game": "pokemon",
      "type": "single",
      "price": 1100,
      "compareAt": null,
      "stock": 2,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 5,
      "reviews": 3,
      "description": "Umbreon ex from Prismatic Evolutions, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Prismatic Evolutions",
        "Number": "161/131"
      },
      "image": "https://images.pokemontcg.io/sv8pt5/161_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "95 018 442"
      },
      "artLabel": "Umbreon ex"
    },
    {
      "id": "pokemon-pikachu-ex-238-191-special-illustration-rare-psa-10",
      "name": "Pikachu ex 238/191 Special Illustration Rare · PSA 10",
      "set": "Surging Sparks",
      "game": "pokemon",
      "type": "single",
      "price": 450,
      "compareAt": null,
      "stock": 3,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 5,
      "reviews": 3,
      "description": "Pikachu ex from Surging Sparks, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Surging Sparks",
        "Number": "238/191"
      },
      "image": "https://images.pokemontcg.io/sv8/238_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "93 776 210"
      },
      "artLabel": "Pikachu ex"
    },
    {
      "id": "pokemon-pikachu-with-grey-felt-hat-085-promo-psa-10",
      "name": "Pikachu with Grey Felt Hat 085 Promo · PSA 10",
      "set": "SVP Black Star Promos",
      "game": "pokemon",
      "type": "single",
      "price": 380,
      "compareAt": null,
      "stock": 2,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 5,
      "reviews": 3,
      "description": "Pikachu from SVP Black Star Promos, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "SVP Black Star Promos",
        "Number": "085"
      },
      "image": "https://images.pokemontcg.io/svp/85_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "79 905 210"
      },
      "artLabel": "Pikachu"
    },
    {
      "id": "pokemon-iono-269-193-special-illustration-rare-psa-10",
      "name": "Iono 269/193 Special Illustration Rare · PSA 10",
      "set": "Paldea Evolved",
      "game": "pokemon",
      "type": "single",
      "price": 240,
      "compareAt": null,
      "stock": 2,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 5,
      "reviews": 3,
      "description": "Iono from Paldea Evolved, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Paldea Evolved",
        "Number": "269/193"
      },
      "image": "https://images.pokemontcg.io/sv2/269_hires.png",
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "90 122 087"
      },
      "artLabel": "Iono"
    },
    {
      "id": "onepiece-monkey-d-luffy-op05-119-manga-rare-psa-10",
      "name": "Monkey.D.Luffy OP05-119 Manga Rare · PSA 10",
      "set": "Awakening of the New Era",
      "game": "onepiece",
      "type": "single",
      "price": 1700,
      "compareAt": null,
      "stock": 1,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 5,
      "reviews": 3,
      "description": "Monkey.D.Luffy from Awakening of the New Era, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Awakening of the New Era",
        "Number": "OP05-119"
      },
      "image": null,
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "90 776 318"
      },
      "artLabel": "Monkey.D.Luffy"
    },
    {
      "id": "magic-ragavan-nimble-pilferer-showcase-psa-10",
      "name": "Ragavan, Nimble Pilferer Showcase · PSA 10",
      "set": "Modern Horizons 2",
      "game": "magic",
      "type": "single",
      "price": 320,
      "compareAt": null,
      "stock": 3,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 5,
      "reviews": 3,
      "description": "Ragavan from Modern Horizons 2, graded PSA 10 Gem Mint. Certification number verifiable before you buy. Ships in a sealed slab sleeve inside a padded, insured box.",
      "contents": [
        "1 graded card in tamper-evident PSA slab",
        "Certification verifiable on the PSA registry",
        "Norvex authenticity certificate"
      ],
      "specs": {
        "Grader": "PSA",
        "Grade": "10 Gem Mint",
        "Set": "Modern Horizons 2",
        "Number": "338"
      },
      "image": null,
      "grade": {
        "grader": "PSA",
        "grade": 10,
        "label": "Gem Mint",
        "cert": "85 302 991"
      },
      "artLabel": "Ragavan"
    },
    {
      "id": "norvex-dragon-shield-matte-sleeves-black-100",
      "name": "Dragon Shield Matte Sleeves · Black (100)",
      "set": "Matte Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 11.99,
      "compareAt": null,
      "stock": 120,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "The tournament standard. Textured matte back, glare-free front, built to survive a thousand shuffles.",
      "contents": [
        "100 standard-size matte sleeves (63 × 88 mm)"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Quantity": "100",
        "Colour": "Black"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-dragon-shield-matte-sleeves-red-100",
      "name": "Dragon Shield Matte Sleeves · Red (100)",
      "set": "Matte Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 11.99,
      "compareAt": null,
      "stock": 120,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "The tournament standard. Textured matte back, glare-free front, built to survive a thousand shuffles.",
      "contents": [
        "100 standard-size matte sleeves (63 × 88 mm)"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Quantity": "100",
        "Colour": "Red"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-dragon-shield-matte-sleeves-blue-100",
      "name": "Dragon Shield Matte Sleeves · Blue (100)",
      "set": "Matte Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 11.99,
      "compareAt": null,
      "stock": 120,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "The tournament standard. Textured matte back, glare-free front, built to survive a thousand shuffles.",
      "contents": [
        "100 standard-size matte sleeves (63 × 88 mm)"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Quantity": "100",
        "Colour": "Blue"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-dragon-shield-matte-sleeves-white-100",
      "name": "Dragon Shield Matte Sleeves · White (100)",
      "set": "Matte Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 11.99,
      "compareAt": null,
      "stock": 120,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "The tournament standard. Textured matte back, glare-free front, built to survive a thousand shuffles.",
      "contents": [
        "100 standard-size matte sleeves (63 × 88 mm)"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Quantity": "100",
        "Colour": "White"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-dragon-shield-matte-japanese-size-sleeves-black-60",
      "name": "Dragon Shield Matte Japanese Size Sleeves · Black (60)",
      "set": "Matte Japanese Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 7.99,
      "compareAt": null,
      "stock": 80,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Dragon Shield protection sized for Yu-Gi-Oh! and other small-format cards.",
      "contents": [
        "60 Japanese-size matte sleeves (59 × 86 mm)"
      ],
      "specs": {
        "Size": "Japanese (Yu-Gi-Oh!)",
        "Finish": "Matte",
        "Quantity": "60"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-dragon-shield-card-codex-zipster-binder-xl-black",
      "name": "Dragon Shield Card Codex Zipster Binder XL · Black",
      "set": "Card Codex Zipster",
      "game": "norvex",
      "type": "accessory",
      "price": 34.99,
      "compareAt": null,
      "stock": 25,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Side-loading, zip-closed and padded. The binder serious collectors graduate to.",
      "contents": [
        "Zip binder with 20 side-loading 9-pocket pages (360 cards)"
      ],
      "specs": {
        "Capacity": "360 cards",
        "Pages": "20 side-loading",
        "Closure": "Zip"
      },
      "image": null,
      "brand": "Dragon Shield"
    },
    {
      "id": "norvex-ultra-pro-9-pocket-pro-binder-black",
      "name": "Ultra Pro 9-Pocket PRO-Binder · Black",
      "set": "PRO-Binder",
      "game": "norvex",
      "type": "accessory",
      "price": 24.99,
      "compareAt": null,
      "stock": 40,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Ultra Pro 9-Pocket PRO-Binder · Black. Archival-grade protection chosen by our own vault team.",
      "contents": [
        "Elastic-strap binder with 20 side-loading 9-pocket pages (360 cards)"
      ],
      "specs": {
        "Capacity": "360 cards",
        "Pages": "20 side-loading",
        "Closure": "Elastic strap"
      },
      "image": null,
      "brand": "Ultra Pro"
    },
    {
      "id": "norvex-ultra-pro-regular-toploaders-25",
      "name": "Ultra Pro Regular Toploaders (25)",
      "set": "Toploaders",
      "game": "norvex",
      "type": "accessory",
      "price": 4.49,
      "compareAt": null,
      "stock": 300,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Crystal-clear rigid toploaders. The last stop before a card goes to grading.",
      "contents": [
        "25 rigid toploaders (35 pt)"
      ],
      "specs": {
        "Thickness": "35 pt",
        "Quantity": "25"
      },
      "image": null,
      "brand": "Ultra Pro"
    },
    {
      "id": "norvex-ultra-pro-pokemon-pikachu-deck-protector-sleeves-65",
      "name": "Ultra Pro Pokémon Pikachu Deck Protector Sleeves (65)",
      "set": "Pokémon Deck Protectors",
      "game": "norvex",
      "type": "accessory",
      "price": 8.99,
      "compareAt": null,
      "stock": 90,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Ultra Pro Pokémon Pikachu Deck Protector Sleeves (65). Archival-grade protection chosen by our own vault team.",
      "contents": [
        "65 standard-size sleeves with official Pikachu artwork"
      ],
      "specs": {
        "Size": "Standard",
        "Quantity": "65",
        "Licence": "Official Pokémon"
      },
      "image": null,
      "brand": "Ultra Pro"
    },
    {
      "id": "norvex-ultra-pro-eclipse-gloss-sleeves-jet-black-100",
      "name": "Ultra Pro Eclipse Gloss Sleeves · Jet Black (100)",
      "set": "Eclipse Gloss Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 12.99,
      "compareAt": null,
      "stock": 70,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Ultra Pro Eclipse Gloss Sleeves · Jet Black (100). Archival-grade protection chosen by our own vault team.",
      "contents": [
        "100 standard-size gloss sleeves"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Gloss",
        "Quantity": "100"
      },
      "image": null,
      "brand": "Ultra Pro"
    },
    {
      "id": "norvex-gamegenic-squire-100-xl-convertible-deck-box-black",
      "name": "Gamegenic Squire 100+ XL Convertible Deck Box · Black",
      "set": "Squire 100+ XL",
      "game": "norvex",
      "type": "accessory",
      "price": 9.99,
      "compareAt": null,
      "stock": 60,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Gamegenic Squire 100+ XL Convertible Deck Box · Black. Archival-grade protection chosen by our own vault team.",
      "contents": [
        "Convertible deck box for 100+ double-sleeved cards"
      ],
      "specs": {
        "Capacity": "100+ double-sleeved",
        "Closure": "Magnetic"
      },
      "image": null,
      "brand": "Gamegenic"
    },
    {
      "id": "norvex-gamegenic-watchtower-100-xl-convertible-black",
      "name": "Gamegenic Watchtower 100+ XL Convertible · Black",
      "set": "Watchtower 100+ XL",
      "game": "norvex",
      "type": "accessory",
      "price": 21.99,
      "compareAt": null,
      "stock": 30,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Gamegenic Watchtower 100+ XL Convertible · Black. Archival-grade protection chosen by our own vault team.",
      "contents": [
        "Premium convertible deck box with card compartment and dice tray"
      ],
      "specs": {
        "Capacity": "100+ double-sleeved",
        "Closure": "Magnetic"
      },
      "image": null,
      "brand": "Gamegenic"
    },
    {
      "id": "norvex-ultimate-guard-boulder-100-deck-case-onyx",
      "name": "Ultimate Guard Boulder 100+ Deck Case · Onyx",
      "set": "Boulder 100+",
      "game": "norvex",
      "type": "accessory",
      "price": 6.99,
      "compareAt": null,
      "stock": 80,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Ultimate Guard Boulder 100+ Deck Case · Onyx. Archival-grade protection chosen by our own vault team.",
      "contents": [
        "Deck case for 100+ double-sleeved cards"
      ],
      "specs": {
        "Capacity": "100+ double-sleeved",
        "Material": "Polypropylene"
      },
      "image": null,
      "brand": "Ultimate Guard"
    },
    {
      "id": "norvex-ultimate-guard-katana-sleeves-black-100",
      "name": "Ultimate Guard Katana Sleeves · Black (100)",
      "set": "Katana Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 9.99,
      "compareAt": null,
      "stock": 75,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Ultimate Guard Katana Sleeves · Black (100). Archival-grade protection chosen by our own vault team.",
      "contents": [
        "100 standard-size sleeves"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Quantity": "100"
      },
      "image": null,
      "brand": "Ultimate Guard"
    },
    {
      "id": "norvex-norvex-vault-sleeves-100-pack",
      "name": "Norvex Vault Sleeves · 100 pack",
      "set": "Vault Sleeves",
      "game": "norvex",
      "type": "accessory",
      "price": 12.99,
      "compareAt": null,
      "stock": 200,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Our own archival-grade, acid-free matte sleeves. Zero PVC, zero glare, perfect shuffle feel.",
      "contents": [
        "100 standard-size matte sleeves (66 × 91 mm)"
      ],
      "specs": {
        "Size": "Standard",
        "Finish": "Matte",
        "Material": "Acid-free polypropylene",
        "Quantity": "100"
      },
      "image": null,
      "brand": "Norvex"
    },
    {
      "id": "norvex-norvex-signature-playmat",
      "name": "Norvex Signature Playmat",
      "set": "Signature Playmat",
      "game": "norvex",
      "type": "accessory",
      "price": 34.99,
      "compareAt": null,
      "stock": 80,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.9,
      "reviews": 140,
      "description": "Stitched-edge, 3 mm rubber base, sublimation-printed obsidian and gold artwork. Tournament size.",
      "contents": [
        "1 playmat (61 × 35 cm) with carrying tube"
      ],
      "specs": {
        "Size": "61 × 35 cm",
        "Thickness": "3 mm",
        "Edge": "Stitched",
        "Base": "Non-slip rubber"
      },
      "image": null,
      "brand": "Norvex"
    }
  ]
};
