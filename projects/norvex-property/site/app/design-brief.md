# Norvex Property — design brief

Animation mode: animated-website
Site type: standalone brand website (no Higgsfield integration, no runtime generation)
Publish to feed: no (private deploy to its URL only)

## Brand

- Name: Norvex Property. Estate agency: Buy / Let / Sell, Mortgages, Bridging Finance, Surveying.
- Voice: quiet, exact, confident. British English. Short sentences. No hype words.
- Palette (client-mandated charcoal + gold, kept restrained):
  - ink `#0B0C10` (page background), spruce-ink `#0E1412` (section surfaces)
  - ivory `#F3EEE4` (headlines), stone `#B4AE9F` (body/muted)
  - champagne `#E9D6AE` (accent: eyebrows, rules, active states), gold `#C9A96E` (CTA fill)
  - weathered cedar `#8A6B4E` pulled from the house cladding for warm tints only
- Type: Cormorant Garamond (display, 500/600, tight tracking) + Montserrat (UI/body, 400/500, uppercase eyebrows tracked +0.18em).
- Layout: chapter copy bottom-left over the film (the reference site's "big title + one line" grammar); UI cards use frosted charcoal glass `rgba(11,12,16,.68)` with a 1px champagne hairline at 18% alpha.
- Motion: the scroll owns the film. Chrome enters with transform-only fades. Reduced motion = posters + full copy, zero video fetches.

## Journey

Journey shape: single-shot (one continuous ~24s film, one generation, scrubbed end to end).

Subject: the glass-and-cedar manor on the ridge at Spring Creek Ranch, Jackson, Wyoming (the client's flagship listing). Two weathered vertical-cedar volumes joined by a central double-height glass core, dark steel roof edges, grass-covered lower roofs, glass-railed stone terraces with a square black plunge tub, concrete entry path and steps, golden sage hillside falling to the valley, the Teton range behind.

The one move (no cuts):
1. 0–4s  High aerial at dawn, the house a small dark form on the ridge, Tetons pink behind. Camera begins a slow descent.
2. 4–10s Descending orbit, clockwise, revealing the two cedar volumes and the glass core, green roofs and terraces, warm interior light in every pane.
3. 10–15s Orbit settles into a low glide along the concrete entry path toward the glass front door; hillside sage in the foreground edges.
4. 15–20s Push through the open glass front door into the double-height living room: curved white sofa, floating oak stair with glass rail, long crystal chandelier, tall dark steel fireplace column.
5. 20–24s Drift to the glass wall and hold on the framed Teton view at last light. Closing beauty state.

Chapters (HTML over the film, mapped to film moments):
| # | id | moment | eyebrow | headline | line | tags |
|---|---|---|---|---|---|---|
| 1 | arrival | 0–4s aerial | Norvex Property | Arrive above the ridge. | Buy, let, sell, finance and survey with one quiet, exact team. | — |
| 2 | properties | 4–10s orbit | Buy · Let · Sell | Homes chosen the way we'd choose our own. | Curated sales and lettings across the Cotswolds, London and the Alps. | Sales · Lettings · Valuations |
| 3 | mortgages | 10–15s glide to the door | Mortgages | Finance that arrives before the keys do. | Whole-of-market advice, rate comparison and a decision in principle in days. | Residential · Buy-to-let · Remortgage |
| 4 | surveying | 15–20s through the door | Surveying | Know the building before you own it. | RICS Level 2 and 3 surveys, defect analysis and structural reports. | Level 2 · Level 3 · Defect |
| 5 | bridging | 20–22s inside | Bridging Finance | Liquidity for the gap between two doors. | Short-term secured lending from £150k, terms of 1 to 24 months. | From 0.55% pm · 75% LTV |
| 6 | contact | 22–24s the view | Contact | Speak to an advisor today. | Enquire and we reply within one working day. | — |

Eyebrow ration: one eyebrow per chapter, none elsewhere.

World grammar (byte-identical preamble for every image/video prompt):
"Photoreal architectural film of a modern glass-and-cedar mountain residence on a golden sage ridge above Jackson, Wyoming, the Teton range behind; last-light golden hour, locked exposure, locked white balance, no flicker, slow steady camera, shallow haze, warm interior light in every window, cinematic 35mm look, no people, no text, no logos, no watermarks."

Camera architecture: n/a (single-shot).

Mobile framing: the house stays in the center-safe third at every beat; the film is `cover`-cropped, so edges are expendable. Mobile encode ≤720p, `objectPosition` 50% 50%, copy stacks bottom-left with a stronger scrim.

Delivery budget: ≤32 MiB desktop clips total, ≤16 MiB mobile clips total. If over, trim tail or raise CRF by 2 before relaxing.

## CTA inventory

- Primary: "Book a valuation" (properties), "Talk to an advisor" (mortgages), "Get a survey quote" (surveying), "Check facility size" (bridging), "Send enquiry" (contact).
- Secondary: "View listings", "Compare rates", "See what's inspected", "Bridging calculator".
- Header: brand wordmark, chapter links, "Enquire" pill.

## Assets

- Film: `app/public/assets/world/manor.mp4` (desktop) + `manor-mobile.mp4`, posters `manor-poster.png` / `manor-mobile-poster.png` generated from the encoded clips.
- OG/cover: composed from a still of the manor at last light; wordmark "Norvex Property".
