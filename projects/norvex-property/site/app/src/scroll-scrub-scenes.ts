import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "./components/scroll-scrub/scroll-scrub";

/**
 * Norvex Property: the manor film.
 *
 * ONE continuous 24-second take (no cuts): a dawn aerial above the ridge at
 * Spring Creek Ranch, a descending orbit around the glass-and-cedar manor, a
 * low glide along the entry path, through the front door into the
 * double-height living room, and a hold on the framed Teton view.
 *
 * The take is cut into six consecutive segments at exact frame boundaries so
 * every chapter owns its own stretch of the film. Segment N's last frame and
 * segment N+1's first frame are consecutive frames of the same take, so the
 * seams are invisible in either scroll direction. Every poster is the first
 * frame of the encoded clip beside it.
 */

export const theme: ScrollScrubTheme = {
  background: "#0B0C10",
  ink: "#F3EEE4",
  muted: "#B4AE9F",
  accent: "#E9D6AE",
};

export const brand = {
  name: "Norvex Property",
  tagline: "Buy. Let. Sell. Finance. Survey.",
  phone: "+44 (0)20 7946 0810",
  email: "hello@norvexproperty.co.uk",
  address: "14 Bruton Place, Mayfair, London W1J 6LX",
};

const seg = (n: number) => ({
  clip: `/assets/world/manor-0${n}.mp4`,
  poster: `/assets/world/manor-0${n}-poster.jpg`,
  mobileClip: `/assets/world/manor-0${n}-mobile.mp4`,
  mobilePoster: `/assets/world/manor-0${n}-mobile-poster.jpg`,
});

export const scenes: ScrollScrubScene[] = [
  {
    id: "arrival",
    label: "Arrival",
    kicker: "Norvex Property",
    title: "Arrive above the ridge.",
    body: "Buy, let, sell, finance and survey with one quiet, exact team.",
    ...seg(1),
    align: "left",
    scroll: 1.8,
    linger: 0.1,
  },
  {
    id: "properties",
    label: "Properties",
    kicker: "Buy · Let · Sell",
    title: "Homes chosen the way we'd choose our own.",
    body: "Curated sales and lettings across the Cotswolds, London and the Alps.",
    tags: ["Sales", "Lettings", "Valuations"],
    ...seg(2),
    align: "left",
    scroll: 2.6,
  },
  {
    id: "mortgages",
    label: "Mortgages",
    kicker: "Mortgages",
    title: "Finance that arrives before the keys do.",
    body: "Whole-of-market advice, rate comparison and a decision in principle in days.",
    tags: ["Residential", "Buy-to-let", "Remortgage"],
    ...seg(3),
    align: "right",
    scroll: 2.2,
  },
  {
    id: "surveying",
    label: "Surveying",
    kicker: "Surveying",
    title: "Know the building before you own it.",
    body: "RICS Level 2 and 3 surveys, defect analysis and structural reports.",
    tags: ["Level 2", "Level 3", "Defect"],
    ...seg(4),
    align: "left",
    scroll: 2.2,
  },
  {
    id: "bridging",
    label: "Bridging",
    kicker: "Bridging Finance",
    title: "Liquidity for the gap between two doors.",
    body: "Short-term secured lending from £150k, terms of 1 to 24 months.",
    tags: ["From 0.55% pm", "75% LTV"],
    ...seg(5),
    align: "right",
    scroll: 1.5,
  },
  {
    id: "contact",
    label: "Contact",
    kicker: "Contact",
    title: "Speak to an advisor today.",
    body: "Enquire and we reply within one working day.",
    ...seg(6),
    align: "left",
    scroll: 1.6,
    linger: 0.3,
  },
];

/** Segment cut points in seconds of the source take (must match the encode). */
export const SEGMENT_CUTS = [0, 4, 10, 15, 20, 22.5, 24];
