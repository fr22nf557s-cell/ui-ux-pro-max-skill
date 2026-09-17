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
    "supportEmail": "hello@norvexgaming.com",
    "checkout": {
      "provider": "stripe",
      "endpoint": ""
    }
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
      "featured": false,
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
      "featured": true,
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
      "featured": true,
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
      "featured": true,
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
      "image": "assets/img/products/magic-aetherdrift-play-booster-box.webp"
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
      "image": "assets/img/products/magic-duskmourn-house-of-horror-play-booster-box.webp"
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
      "image": "assets/img/products/magic-bloomburrow-play-booster-box.webp"
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
      "image": null
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
      "image": "assets/img/products/magic-bloomburrow-collector-booster-box.webp"
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
      "description": "Sealed Final Fantasy booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Final Fantasy Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
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
      "description": "Sealed Edge of Eternities booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Edge of Eternities Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
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
      "description": "Sealed Avatar: The Last Airbender booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Avatar: The Last Airbender Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": null
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
      "description": "Sealed Tarkir: Dragonstorm booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Tarkir: Dragonstorm Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
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
      "description": "Sealed Bloomburrow booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "9 Bloomburrow Play Booster packs",
        "1 traditional foil promo card",
        "40 basic lands (20 foil, 20 non-foil)",
        "Oversized spindown die and storage box"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Packs": "9",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-bloomburrow-bundle.webp"
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
      "description": "Ready to play out of the box. A complete Foundations deck with everything you need for your first games.",
      "contents": [
        "Over 350 cards including 2 pre-built decks",
        "Deck boxes, dice and learn-to-play guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
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
        "Format": "Booster Pack",
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
        "Format": "Booster Pack",
        "Packs": "1",
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
      "featured": true,
      "rating": 4.8,
      "reviews": 24,
      "description": "Ready to play out of the box. A complete Yamato deck with everything you need for your first games.",
      "contents": [
        "51-card ready-to-play deck",
        "Leader card, DON!! cards and play sheet"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-28-yamato-starter-deck.webp"
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
      "image": "assets/img/products/onepiece-op-11-a-fist-of-divine-speed-booster-pack.webp"
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
      "image": "assets/img/products/onepiece-op-12-legacy-of-the-master-booster-pack.webp"
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
      "set": ": Blue-Eyes White Destiny",
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
      "description": "Ready to play out of the box. A complete : Blue-Eyes White Destiny deck with everything you need for your first games.",
      "contents": [
        "46-card pre-built deck",
        "Deluxe game mat and dueling guide"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
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
      "featured": false,
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
      "set": "Riftbound Origins",
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
      "description": "A single factory-sealed Riftbound Origins booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Riftbound Origins booster pack"
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
    },
    {
      "id": "lorcana-curator-s-collection-heroines-edition",
      "name": "Curator’s Collection: Heroines Edition",
      "set": "Curator’s Collection",
      "game": "lorcana",
      "type": "collection",
      "price": 99.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Curator’s Collection: Heroines Edition: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/lorcana-curator-s-collection-heroines-edition.webp"
    },
    {
      "id": "lorcana-hyperia-city-illumineer-s-trove",
      "name": "Hyperia City Illumineer’s Trove",
      "set": "Hyperia City",
      "game": "lorcana",
      "type": "collection",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Hyperia City Illumineer’s Trove: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/lorcana-hyperia-city-illumineer-s-trove.webp"
    },
    {
      "id": "lorcana-hyperia-city-booster-display-box",
      "name": "Hyperia City Booster Display Box",
      "set": "Hyperia City",
      "game": "lorcana",
      "type": "box",
      "price": 119.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "A full sealed Hyperia City booster display, never opened and never resealed. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/lorcana-hyperia-city-booster-display-box.webp"
    },
    {
      "id": "onepiece-premium-card-collection-ace-sabo-luffy",
      "name": "Premium Card Collection: Ace & Sabo & Luffy",
      "set": "Ace & Sabo & Luffy",
      "game": "onepiece",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Premium Card Collection: Ace & Sabo & Luffy: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-premium-card-collection-ace-sabo-luffy.webp"
    },
    {
      "id": "onepiece-premium-card-collection-6-assort-vol-2",
      "name": "Premium Card Collection: 6 Assort Vol. 2",
      "set": "6 Assort Vol. 2",
      "game": "onepiece",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Premium Card Collection: 6 Assort Vol. 2: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-premium-card-collection-6-assort-vol-2.webp"
    },
    {
      "id": "onepiece-premium-card-collection-live-action-edition-vol-2-baroque-works",
      "name": "Premium Card Collection: Live Action Edition Vol. 2 Baroque Works",
      "set": "Live Action Edition Vol. 2 Baroque Works",
      "game": "onepiece",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Premium Card Collection: Live Action Edition Vol. 2 Baroque Works: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-premium-card-collection-live-action-edition-vol-2-baroque-works.webp"
    },
    {
      "id": "onepiece-premium-card-collection-live-action-edition-vol-2-straw-hat-crew",
      "name": "Premium Card Collection: Live Action Edition Vol. 2 Straw Hat Crew",
      "set": "Live Action Edition Vol. 2 Straw Hat Crew",
      "game": "onepiece",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Premium Card Collection: Live Action Edition Vol. 2 Straw Hat Crew: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-premium-card-collection-live-action-edition-vol-2-straw-hat-crew.webp"
    },
    {
      "id": "onepiece-sd-01-set-sail-deck-set",
      "name": "SD-01 Set Sail Deck Set",
      "set": "Set Sail",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Set Sail deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-sd-01-set-sail-deck-set.webp"
    },
    {
      "id": "onepiece-st-36-yellow-eustass-captain-kid-starter-deck",
      "name": "ST-36 Yellow Eustass \"Captain\" Kid Starter Deck",
      "set": "Yellow Eustass \"Captain\" Kid",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Yellow Eustass \"Captain\" Kid deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-36-yellow-eustass-captain-kid-starter-deck.webp"
    },
    {
      "id": "onepiece-st-35-red-black-sabo-starter-deck",
      "name": "ST-35 Red/Black Sabo Starter Deck",
      "set": "Red/Black Sabo",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Red/Black Sabo deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-35-red-black-sabo-starter-deck.webp"
    },
    {
      "id": "onepiece-st-34-purple-charlotte-katakuri-starter-deck",
      "name": "ST-34 Purple Charlotte Katakuri Starter Deck",
      "set": "Purple Charlotte Katakuri",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Purple Charlotte Katakuri deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-34-purple-charlotte-katakuri-starter-deck.webp"
    },
    {
      "id": "onepiece-st-33-blue-kuzan-starter-deck",
      "name": "ST-33 Blue Kuzan Starter Deck",
      "set": "Blue Kuzan",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Blue Kuzan deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-33-blue-kuzan-starter-deck.webp"
    },
    {
      "id": "onepiece-st-32-green-roronoa-zoro-starter-deck",
      "name": "ST-32 Green Roronoa Zoro Starter Deck",
      "set": "Green Roronoa Zoro",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Green Roronoa Zoro deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-32-green-roronoa-zoro-starter-deck.webp"
    },
    {
      "id": "onepiece-st-31-red-monkey-d-luffy-starter-deck",
      "name": "ST-31 Red Monkey D. Luffy Starter Deck",
      "set": "Red Monkey D. Luffy",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Red Monkey D. Luffy deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-31-red-monkey-d-luffy-starter-deck.webp"
    },
    {
      "id": "onepiece-st-30-luffy-ace-starter-deck-ex",
      "name": "ST-30 Luffy & Ace Starter Deck EX",
      "set": "Luffy & Ace",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Luffy & Ace deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-30-luffy-ace-starter-deck-ex.webp"
    },
    {
      "id": "onepiece-st-29-egghead-starter-deck",
      "name": "ST-29 Egghead Starter Deck",
      "set": "Egghead",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Egghead deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-29-egghead-starter-deck.webp"
    },
    {
      "id": "onepiece-learn-together-deck-set",
      "name": "Learn Together Deck Set",
      "set": "Learn Together",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Learn Together deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-learn-together-deck-set.webp"
    },
    {
      "id": "onepiece-st-22-ace-newgate-starter-deck",
      "name": "ST-22 Ace & Newgate Starter Deck",
      "set": "Ace & Newgate",
      "game": "onepiece",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Ace & Newgate deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-st-22-ace-newgate-starter-deck.webp"
    },
    {
      "id": "onepiece-op-17-the-world-s-strongest-warriors-booster-pack",
      "name": "OP-17 The World’s Strongest Warriors Booster Pack",
      "set": "The World’s Strongest Warriors",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed The World’s Strongest Warriors booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 The World’s Strongest Warriors booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-17-the-world-s-strongest-warriors-booster-pack.webp"
    },
    {
      "id": "onepiece-op-16-the-time-of-battle-booster-pack",
      "name": "OP-16 The Time of Battle Booster Pack",
      "set": "The Time of Battle",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed The Time of Battle booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 The Time of Battle booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-16-the-time-of-battle-booster-pack.webp"
    },
    {
      "id": "onepiece-op-15-adventure-on-kami-s-island-booster-pack",
      "name": "OP-15 Adventure on Kami’s Island Booster Pack",
      "set": "Adventure on Kami’s Island",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed Adventure on Kami’s Island booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Adventure on Kami’s Island booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-15-adventure-on-kami-s-island-booster-pack.webp"
    },
    {
      "id": "onepiece-eb-03-one-piece-heroines-edition-extra-booster-pack",
      "name": "EB-03 One Piece Heroines Edition Extra Booster Pack",
      "set": "One Piece Heroines Edition",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed One Piece Heroines Edition booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 One Piece Heroines Edition booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-eb-03-one-piece-heroines-edition-extra-booster-pack.webp"
    },
    {
      "id": "onepiece-op-14-the-azure-sea-s-seven-booster-pack",
      "name": "OP-14 The Azure Sea’s Seven Booster Pack",
      "set": "The Azure Sea’s Seven",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed The Azure Sea’s Seven booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 The Azure Sea’s Seven booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-14-the-azure-sea-s-seven-booster-pack.webp"
    },
    {
      "id": "onepiece-op-13-carrying-on-his-will-booster-pack",
      "name": "OP-13 Carrying on His Will Booster Pack",
      "set": "Carrying on His Will",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed Carrying on His Will booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Carrying on His Will booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-13-carrying-on-his-will-booster-pack.webp"
    },
    {
      "id": "onepiece-prb-02-one-piece-card-the-best-vol-2-premium-booster-pack",
      "name": "PRB-02 One Piece Card The Best Vol. 2 Premium Booster Pack",
      "set": "One Piece Card The Best Vol. 2",
      "game": "onepiece",
      "type": "pack",
      "price": 8.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed One Piece Card The Best Vol. 2 booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 One Piece Card The Best Vol. 2 booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-prb-02-one-piece-card-the-best-vol-2-premium-booster-pack.webp"
    },
    {
      "id": "onepiece-eb-02-anime-25th-collection-extra-booster-pack",
      "name": "EB-02 Anime 25th Collection Extra Booster Pack",
      "set": "Anime 25th Collection",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed Anime 25th Collection booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Anime 25th Collection booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-eb-02-anime-25th-collection-extra-booster-pack.webp"
    },
    {
      "id": "onepiece-op-10-royal-blood-booster-pack",
      "name": "OP-10 Royal Blood Booster Pack",
      "set": "Royal Blood",
      "game": "onepiece",
      "type": "pack",
      "price": 4.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed Royal Blood booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Royal Blood booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-op-10-royal-blood-booster-pack.webp"
    },
    {
      "id": "onepiece-premium-card-collection-flame-flame-fruit-coliseum-edition",
      "name": "Premium Card Collection: Flame-Flame Fruit Coliseum Edition",
      "set": "Flame-Flame Fruit Coliseum Edition",
      "game": "onepiece",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Premium Card Collection: Flame-Flame Fruit Coliseum Edition: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/onepiece-premium-card-collection-flame-flame-fruit-coliseum-edition.webp"
    },
    {
      "id": "magic-silverquill-influence-commander-deck",
      "name": "Silverquill Influence Commander Deck",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Secrets of Strixhaven deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-silverquill-influence-commander-deck.webp"
    },
    {
      "id": "magic-prismari-artistry-commander-deck",
      "name": "Prismari Artistry Commander Deck",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Secrets of Strixhaven deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-prismari-artistry-commander-deck.webp"
    },
    {
      "id": "magic-witherbloom-pestilence-commander-deck",
      "name": "Witherbloom Pestilence Commander Deck",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Secrets of Strixhaven deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-witherbloom-pestilence-commander-deck.webp"
    },
    {
      "id": "magic-lorehold-spirit-commander-deck",
      "name": "Lorehold Spirit Commander Deck",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Secrets of Strixhaven deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-lorehold-spirit-commander-deck.webp"
    },
    {
      "id": "magic-quandrix-unlimited-commander-deck",
      "name": "Quandrix Unlimited Commander Deck",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "deck",
      "price": 44.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Secrets of Strixhaven deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-quandrix-unlimited-commander-deck.webp"
    },
    {
      "id": "magic-secrets-of-strixhaven-bundle",
      "name": "Secrets of Strixhaven Bundle",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "bundle",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Secrets of Strixhaven booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-secrets-of-strixhaven-bundle.webp"
    },
    {
      "id": "magic-secrets-of-strixhaven-codex-bundle",
      "name": "Secrets of Strixhaven Codex Bundle",
      "set": "Secrets of Strixhaven",
      "game": "magic",
      "type": "bundle",
      "price": 79.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Secrets of Strixhaven booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/magic-secrets-of-strixhaven-codex-bundle.webp"
    },
    {
      "id": "pokemon-mega-evolution-pitch-black-elite-trainer-box",
      "name": "Mega Evolution—Pitch Black Elite Trainer Box",
      "set": "Mega Evolution — Pitch Black",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Pitch Black Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-pitch-black-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-pitch-black-pokemon-center-elite-trainer-box",
      "name": "Mega Evolution—Pitch Black Pokémon Center Elite Trainer Box",
      "set": "Mega Evolution — Pitch Black",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Pitch Black Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-pitch-black-pokemon-center-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-pitch-black-booster-bundle",
      "name": "Mega Evolution—Pitch Black Booster Bundle",
      "set": "Mega Evolution — Pitch Black",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Mega Evolution — Pitch Black booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-pitch-black-booster-bundle.webp"
    },
    {
      "id": "pokemon-mega-forces-tin",
      "name": "Mega Forces Tin",
      "set": "Mega Forces",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Forces Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-forces-tin.webp"
    },
    {
      "id": "pokemon-30th-celebration-tech-sticker-collection",
      "name": "30th Celebration Tech Sticker Collection",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 19.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Tech Sticker Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-tech-sticker-collection.webp"
    },
    {
      "id": "pokemon-30th-celebration-poster-collection",
      "name": "30th Celebration Poster Collection",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 19.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Poster Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-poster-collection.webp"
    },
    {
      "id": "pokemon-30th-celebration-sylveon-ex-box-greninja-ex-box",
      "name": "30th Celebration Sylveon ex Box & Greninja ex Box",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 22.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Sylveon ex Box & Greninja ex Box: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-sylveon-ex-box-greninja-ex-box.webp"
    },
    {
      "id": "pokemon-30th-celebration-elite-trainer-box",
      "name": "30th Celebration Elite Trainer Box",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed 30th Celebration Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-30th-celebration-pokemon-center-elite-trainer-box",
      "name": "30th Celebration Pokémon Center Elite Trainer Box",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed 30th Celebration Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-pokemon-center-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-30th-celebration-binder-collection",
      "name": "30th Celebration Binder Collection",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Binder Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-binder-collection.webp"
    },
    {
      "id": "pokemon-30th-celebration-battle-deck-espeon-ex-umbreon-ex",
      "name": "30th Celebration Battle Deck: Espeon ex & Umbreon ex",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete 30th Celebration deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-battle-deck-espeon-ex-umbreon-ex.webp"
    },
    {
      "id": "pokemon-30th-celebration-ultra-premium-collection-day-night",
      "name": "30th Celebration Ultra-Premium Collection: Day & Night",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 119.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Ultra-Premium Collection: Day & Night: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-ultra-premium-collection-day-night.webp"
    },
    {
      "id": "pokemon-30th-celebration-figure-collection",
      "name": "30th Celebration Figure Collection",
      "set": "30th Celebration",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "30th Celebration Figure Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-30th-celebration-figure-collection.webp"
    },
    {
      "id": "pokemon-first-partner-illustration-collection-series-3",
      "name": "First Partner Illustration Collection—Series 3",
      "set": "First Partner Illustration",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "First Partner Illustration Collection—Series 3: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-first-partner-illustration-collection-series-3.webp"
    },
    {
      "id": "pokemon-mega-greninja-ex-premium-collection",
      "name": "Mega Greninja ex Premium Collection",
      "set": "Mega Greninja ex",
      "game": "pokemon",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Greninja ex Premium Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-greninja-ex-premium-collection.webp"
    },
    {
      "id": "pokemon-first-partner-illustration-collection-series-2",
      "name": "First Partner Illustration Collection—Series 2",
      "set": "First Partner Illustration",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "First Partner Illustration Collection—Series 2: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-first-partner-illustration-collection-series-2.webp"
    },
    {
      "id": "pokemon-mega-moonlit-tin",
      "name": "Mega Moonlit Tin",
      "set": "Mega Moonlit",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Moonlit Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-moonlit-tin.webp"
    },
    {
      "id": "pokemon-lumiose-city-mini-tin",
      "name": "Lumiose City Mini Tin",
      "set": "Lumiose City",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Lumiose City Mini Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-lumiose-city-mini-tin.webp"
    },
    {
      "id": "pokemon-mega-evolution-chaos-rising-elite-trainer-box",
      "name": "Mega Evolution—Chaos Rising Elite Trainer Box",
      "set": "Mega Evolution — Chaos Rising",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Chaos Rising Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-chaos-rising-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-chaos-rising-pokemon-center-elite-trainer-box",
      "name": "Mega Evolution—Chaos Rising Pokémon Center Elite Trainer Box",
      "set": "Mega Evolution — Chaos Rising",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Chaos Rising Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-chaos-rising-pokemon-center-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-chaos-rising-booster-bundle",
      "name": "Mega Evolution—Chaos Rising Booster Bundle",
      "set": "Mega Evolution — Chaos Rising",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Mega Evolution — Chaos Rising booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-chaos-rising-booster-bundle.webp"
    },
    {
      "id": "pokemon-mega-lucario-ex-league-battle-deck",
      "name": "Mega Lucario ex League Battle Deck",
      "set": "Mega Lucario ex",
      "game": "pokemon",
      "type": "deck",
      "price": 14.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Mega Lucario ex deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-lucario-ex-league-battle-deck.webp"
    },
    {
      "id": "pokemon-mega-zygarde-ex-premium-collection",
      "name": "Mega Zygarde ex Premium Collection",
      "set": "Mega Zygarde ex",
      "game": "pokemon",
      "type": "collection",
      "price": 39.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Zygarde ex Premium Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-zygarde-ex-premium-collection.webp"
    },
    {
      "id": "pokemon-mega-evolution-perfect-order-elite-trainer-box",
      "name": "Mega Evolution—Perfect Order Elite Trainer Box",
      "set": "Mega Evolution — Perfect Order",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Perfect Order Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-perfect-order-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-perfect-order-pokemon-center-elite-trainer-box",
      "name": "Mega Evolution—Perfect Order Pokémon Center Elite Trainer Box",
      "set": "Mega Evolution — Perfect Order",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Perfect Order Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-perfect-order-pokemon-center-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-perfect-order-booster-bundle",
      "name": "Mega Evolution—Perfect Order Booster Bundle",
      "set": "Mega Evolution — Perfect Order",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Mega Evolution — Perfect Order booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-perfect-order-booster-bundle.webp"
    },
    {
      "id": "pokemon-first-partner-illustration-collection-series-1",
      "name": "First Partner Illustration Collection—Series 1",
      "set": "First Partner Illustration",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "First Partner Illustration Collection—Series 1: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-first-partner-illustration-collection-series-1.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-collection-erika-larry",
      "name": "Mega Evolution—Ascended Heroes Collection: Erika & Larry",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Evolution—Ascended Heroes Collection: Erika & Larry: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-collection-erika-larry.webp"
    },
    {
      "id": "pokemon-mega-charizard-tin",
      "name": "Mega Charizard Tin",
      "set": "Mega Charizard",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Charizard Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-charizard-tin.webp"
    },
    {
      "id": "pokemon-pokemon-day-2026-collection",
      "name": "Pokémon Day 2026 Collection",
      "set": "Pokémon Day 2026",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Pokémon Day 2026 Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-pokemon-day-2026-collection.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-first-partners-deluxe-pin-collection",
      "name": "Mega Evolution—Ascended Heroes First Partners Deluxe Pin Collection",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "collection",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Evolution—Ascended Heroes First Partners Deluxe Pin Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-first-partners-deluxe-pin-collection.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-elite-trainer-box",
      "name": "Mega Evolution—Ascended Heroes Elite Trainer Box",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Ascended Heroes Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-pokemon-center-elite-trainer-box",
      "name": "Mega Evolution—Ascended Heroes Pokémon Center Elite Trainer Box",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "etb",
      "price": 49.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Factory-sealed Mega Evolution — Ascended Heroes Elite Trainer Box: booster packs, an exclusive promo, sleeves, dice and the collector's box. Sourced direct from the distributor and tamper-checked before it enters the vault.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Elite Trainer Box",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-pokemon-center-elite-trainer-box.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-tech-sticker-collection",
      "name": "Mega Evolution—Ascended Heroes Tech Sticker Collection",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "collection",
      "price": 19.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Evolution—Ascended Heroes Tech Sticker Collection: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-tech-sticker-collection.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-mini-tin",
      "name": "Mega Evolution—Ascended Heroes Mini Tin",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Evolution—Ascended Heroes Mini Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-mini-tin.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-booster-bundle",
      "name": "Mega Evolution—Ascended Heroes Booster Bundle",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "bundle",
      "price": 26.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Sealed Mega Evolution — Ascended Heroes booster packs in the official bundle. The efficient way into the chase without committing to a box.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Bundle",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-booster-bundle.webp"
    },
    {
      "id": "pokemon-mega-evolution-ascended-heroes-tin",
      "name": "Mega Evolution—Ascended Heroes Tin",
      "set": "Mega Evolution — Ascended Heroes",
      "game": "pokemon",
      "type": "collection",
      "price": 24.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Mega Evolution—Ascended Heroes Tin: a sealed collection with exclusive promos and accessories, exactly as the publisher shipped it.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Premium Collection",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/pokemon-mega-evolution-ascended-heroes-tin.webp"
    },
    {
      "id": "swu-spotlight-deck-leia-organa",
      "name": "Spotlight Deck: Leia Organa",
      "set": ": Leia Organa",
      "game": "swu",
      "type": "deck",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete : Leia Organa deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/swu-spotlight-deck-leia-organa.webp"
    },
    {
      "id": "swu-spotlight-deck-jabba-the-hutt",
      "name": "Spotlight Deck: Jabba the Hutt",
      "set": ": Jabba the Hutt",
      "game": "swu",
      "type": "deck",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete : Jabba the Hutt deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/swu-spotlight-deck-jabba-the-hutt.webp"
    },
    {
      "id": "swu-spark-of-rebellion-two-player-starter",
      "name": "Spark of Rebellion Two-Player Starter",
      "set": "Spark of Rebellion",
      "game": "swu",
      "type": "deck",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Spark of Rebellion deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/swu-spark-of-rebellion-two-player-starter.webp"
    },
    {
      "id": "swu-shadows-of-the-galaxy-two-player-starter",
      "name": "Shadows of the Galaxy Two-Player Starter",
      "set": "Shadows of the Galaxy",
      "game": "swu",
      "type": "deck",
      "price": 29.99,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": false,
      "rating": 4.8,
      "reviews": 18,
      "description": "Ready to play out of the box. A complete Shadows of the Galaxy deck with everything you need for your first games.",
      "contents": [
        "Factory-sealed product",
        "Contents as listed by the publisher"
      ],
      "specs": {
        "Language": "English",
        "Format": "Deck",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/swu-shadows-of-the-galaxy-two-player-starter.webp"
    },
    {
      "id": "yugioh-rarity-collection-v-booster-pack",
      "name": "Rarity Collection V Booster Pack",
      "set": "Rarity Collection V",
      "game": "yugioh",
      "type": "pack",
      "price": 5.49,
      "compareAt": null,
      "stock": 12,
      "preorder": false,
      "badge": null,
      "featured": true,
      "rating": 4.8,
      "reviews": 18,
      "description": "A single factory-sealed Rarity Collection V booster pack, straight from an unopened display. Sold loose, never weighed.",
      "contents": [
        "1 Rarity Collection V booster pack"
      ],
      "specs": {
        "Language": "English",
        "Format": "Booster Pack",
        "Condition": "Factory sealed"
      },
      "image": "assets/img/products/yugioh-rarity-collection-v-booster-pack.webp"
    }
  ]
};
