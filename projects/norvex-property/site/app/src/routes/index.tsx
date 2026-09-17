import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { ScrollScrub } from "../components/scroll-scrub/scroll-scrub";
import type { ScrollScrubScene } from "../components/scroll-scrub/scroll-scrub";
import { brand, scenes, theme } from "../scroll-scrub-scenes";
import "../norvex.css";

const OG_IMAGE =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3JSm3zkWdJl0vDJbWVyyAb7NnDy/8945142b-e935-4985-af64-7b8c2de51e52.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Norvex Property: Buy, let, sell, finance and survey" },
      {
        name: "description",
        content:
          "Norvex Property is an estate agency for people who want one quiet, exact team: sales and lettings, whole-of-market mortgages, bridging finance and RICS surveys.",
      },
      { property: "og:title", content: "Norvex Property" },
      {
        property: "og:description",
        content: "Buy, let, sell, finance and survey with one quiet, exact team.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Norvex Property" },
      {
        name: "twitter:description",
        content: "Buy, let, sell, finance and survey with one quiet, exact team.",
      },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "theme-color", content: "#0B0C10" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Page,
});

/* ------------------------------------------------------------------ */
/* Chapter CTAs: attached at module scope so the scenes array keeps a  */
/* stable identity (the engine rebuilds its controller on a new array). */
/* ------------------------------------------------------------------ */

const CTA: Record<
  string,
  { primary: [string, string, string]; secondary?: [string, string, string] }
> = {
  arrival: {
    primary: ["Book a valuation", "#enquire", "nx-cta-valuation"],
    secondary: ["Begin the tour", "#properties", "nx-cta-tour"],
  },
  properties: {
    primary: ["Book a valuation", "#enquire", "nx-cta-valuation"],
    secondary: ["View listings", "#listings", "nx-cta-listings"],
  },
  mortgages: {
    primary: ["Talk to an advisor", "#enquire", "nx-cta-advisor"],
    secondary: ["Compare rates", "#calculators", "nx-cta-rates"],
  },
  surveying: {
    primary: ["Get a survey quote", "#enquire", "nx-cta-survey"],
    secondary: ["See what's inspected", "#surveys", "nx-cta-inspected"],
  },
  bridging: {
    primary: ["Check facility size", "#bridging-calc", "nx-cta-facility"],
  },
  contact: {
    primary: ["Send enquiry", "#enquire", "nx-cta-send"],
  },
};

const SCENES: ScrollScrubScene[] = scenes.map((scene) => {
  const cta = CTA[scene.id];
  if (!cta) {
    return scene;
  }
  return {
    ...scene,
    actions: (
      <>
        <a className={cta.primary[2]} href={cta.primary[1]}>
          {cta.primary[0]}
        </a>
        {cta.secondary ? (
          <a className={cta.secondary[2]} href={cta.secondary[1]}>
            {cta.secondary[0]}
          </a>
        ) : null}
      </>
    ),
  };
});

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const fmtGBP = (v: number) => gbp.format(Math.round(v));
const fmtPct = (v: number) => `${v.toFixed(2)}%`;

function monthlyPayment(
  principal: number,
  annualPct: number,
  years: number,
  type: "repayment" | "interest"
) {
  const r = annualPct / 100 / 12;
  const n = years * 12;
  if (type === "interest") return principal * r;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function Page() {
  return (
    <div className="nx">
      <SiteHeader />
      <main>
        <ScrollScrub scenes={SCENES} theme={theme} />
        <Listings />
        <Calculators />
        <Surveys />
        <Enquire />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="nx-nav">
      <a className="nx-brand" href="#arrival">
        <span className="nx-brand__mark" aria-hidden="true" />
        {brand.name}
      </a>
      <nav aria-label="Sections" className="nx-nav__links">
        <a href="#properties">Properties</a>
        <a href="#mortgages">Mortgages</a>
        <a href="#surveying">Surveying</a>
        <a href="#bridging">Bridging</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="nx-cta-enquire-nav" href="#enquire">
        Enquire
      </a>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Listings                                                             */
/* ------------------------------------------------------------------ */

type Intent = "buy" | "let";

interface Listing {
  id: number;
  name: string;
  area: string;
  region: string;
  intent: Intent;
  type: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  tone: string;
}

const LISTINGS: Listing[] = [
  { id: 1, name: "Hawthorne House", area: "Hampstead", region: "London", intent: "buy", type: "house", price: 4250000, beds: 5, baths: 4, sqft: 4820, tone: "a" },
  { id: 2, name: "The Penthouse, Albion Wharf", area: "Richmond", region: "London", intent: "buy", type: "penthouse", price: 2750000, beds: 3, baths: 3, sqft: 2150, tone: "b" },
  { id: 3, name: "Orchard Lodge", area: "Chipping Campden", region: "Cotswolds", intent: "buy", type: "house", price: 1650000, beds: 4, baths: 3, sqft: 2900, tone: "c" },
  { id: 4, name: "Wexcombe Park", area: "Surrey Hills", region: "Surrey", intent: "buy", type: "estate", price: 7900000, beds: 8, baths: 7, sqft: 11200, tone: "d" },
  { id: 5, name: "Marlow riverside apartment", area: "Marlow", region: "Buckinghamshire", intent: "buy", type: "apartment", price: 985000, beds: 2, baths: 2, sqft: 1180, tone: "b" },
  { id: 6, name: "Eaton Terrace apartment", area: "Belgravia", region: "London", intent: "let", type: "apartment", price: 5200, beds: 2, baths: 2, sqft: 1240, tone: "c" },
  { id: 7, name: "Mill House", area: "Bath", region: "Somerset", intent: "let", type: "house", price: 6900, beds: 4, baths: 3, sqft: 3100, tone: "a" },
  { id: 8, name: "Kensington Gate townhouse", area: "Kensington", region: "London", intent: "let", type: "house", price: 14500, beds: 5, baths: 4, sqft: 3800, tone: "d" },
];

const PRICE_BANDS: Record<Intent, [string, string][]> = {
  buy: [
    ["any", "Any price"],
    ["0-1000000", "Up to £1m"],
    ["1000000-2500000", "£1m to £2.5m"],
    ["2500000-5000000", "£2.5m to £5m"],
    ["5000000-", "£5m and above"],
  ],
  let: [
    ["any", "Any rent"],
    ["0-5000", "Up to £5,000 pcm"],
    ["5000-10000", "£5,000 to £10,000 pcm"],
    ["10000-", "£10,000 pcm and above"],
  ],
};

function Listings() {
  const [intent, setIntent] = useState<Intent>("buy");
  const [band, setBand] = useState("any");
  const [beds, setBeds] = useState(0);

  const results = useMemo(() => {
    const [lo, hi] = band === "any" ? [0, Infinity] : band.split("-").map((s) => (s === "" ? Infinity : Number(s)));
    return LISTINGS.filter(
      (l) => l.intent === intent && l.price >= lo && l.price <= hi && l.beds >= beds
    );
  }, [intent, band, beds]);

  const switchIntent = (next: Intent) => {
    setIntent(next);
    setBand("any");
  };

  return (
    <section className="nx-section" id="listings" aria-labelledby="listings-h">
      <div className="nx-section__head">
        <p className="nx-eyebrow">Buy · Let · Sell</p>
        <h2 className="nx-h2" id="listings-h">Current instructions</h2>
        <p className="nx-lead">
          A short list, on purpose. Every home here has been walked by one of our
          partners before it was listed.
        </p>
      </div>

      <form className="nx-card nx-search" onSubmit={(e) => e.preventDefault()}>
        <div className="nx-seg" role="group" aria-label="I want to">
          {(["buy", "let"] as Intent[]).map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={intent === i}
              onClick={() => switchIntent(i)}
            >
              {i === "buy" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
        <label className="nx-field">
          <span>{intent === "buy" ? "Price" : "Rent"}</span>
          <select value={band} onChange={(e) => setBand(e.target.value)}>
            {PRICE_BANDS[intent].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        <label className="nx-field">
          <span>Bedrooms</span>
          <select value={beds} onChange={(e) => setBeds(Number(e.target.value))}>
            <option value={0}>Any</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5+</option>
          </select>
        </label>
        <p className="nx-search__status" aria-live="polite">
          {results.length === 1 ? "1 home matches" : `${results.length} homes match`}
        </p>
      </form>

      <ul className="nx-grid nx-grid--listings">
        {results.map((l) => (
          <li key={l.id} className="nx-listing">
            <div className={`nx-listing__media nx-listing__media--${l.tone}`}>
              <span className="nx-badge">{l.intent === "let" ? "To let" : "For sale"}</span>
            </div>
            <div className="nx-listing__body">
              <p className="nx-listing__price">
                {fmtGBP(l.price)}
                {l.intent === "let" ? <small> pcm</small> : null}
              </p>
              <h3 className="nx-listing__name">{l.name}</h3>
              <p className="nx-listing__where">{l.area}, {l.region}</p>
              <p className="nx-listing__meta">
                {l.beds} bed · {l.baths} bath · {l.sqft.toLocaleString("en-GB")} sq ft
              </p>
              <a className="nx-cta-viewing" href="#enquire">Arrange a viewing</a>
            </div>
          </li>
        ))}
        {results.length === 0 ? (
          <li className="nx-empty">Nothing in that band today. Widen the search or ask us to look off-market.</li>
        ) : null}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Calculators                                                          */
/* ------------------------------------------------------------------ */

const PRODUCTS: [string, number][] = [
  ["2-year fixed", 4.19],
  ["5-year fixed", 4.02],
  ["Lifetime tracker", 4.7],
];

function Calculators() {
  return (
    <section className="nx-section nx-section--tint" id="calculators" aria-labelledby="calc-h">
      <div className="nx-section__head">
        <h2 className="nx-h2" id="calc-h">Run the numbers before the viewing</h2>
        <p className="nx-lead">
          Indicative only. An advisor confirms the figures against your circumstances and the live market.
        </p>
      </div>
      <div className="nx-grid nx-grid--two">
        <MortgageCalculator />
        <BridgingCalculator />
      </div>
    </section>
  );
}

function MortgageCalculator() {
  const [price, setPrice] = useState(850000);
  const [deposit, setDeposit] = useState(25);
  const [rate, setRate] = useState(4.19);
  const [term, setTerm] = useState(25);
  const [type, setType] = useState<"repayment" | "interest">("repayment");

  const loan = price * (1 - deposit / 100);
  const monthly = monthlyPayment(loan, rate, term, type);
  const stressed = monthlyPayment(loan, rate + 3, term, type);
  const totalPaid = type === "interest" ? monthly * term * 12 + loan : monthly * term * 12;

  return (
    <form className="nx-card nx-calc" id="mortgage-calc" onSubmit={(e) => e.preventDefault()}>
      <h3 className="nx-h3">Mortgage calculator</h3>
      <div className="nx-seg" role="group" aria-label="Repayment type">
        <button type="button" aria-pressed={type === "repayment"} onClick={() => setType("repayment")}>Repayment</button>
        <button type="button" aria-pressed={type === "interest"} onClick={() => setType("interest")}>Interest only</button>
      </div>
      <Range label="Property price" value={price} out={fmtGBP(price)} min={150000} max={5000000} step={5000} onChange={setPrice} />
      <Range label="Deposit" value={deposit} out={`${deposit}% · ${fmtGBP((price * deposit) / 100)}`} min={5} max={60} step={1} onChange={setDeposit} />
      <Range label="Interest rate" value={rate} out={fmtPct(rate)} min={1} max={9} step={0.01} onChange={setRate} />
      <Range label="Term" value={term} out={`${term} years`} min={5} max={40} step={1} onChange={setTerm} />

      <dl className="nx-stats">
        <div className="nx-stat nx-stat--hero"><dt>Monthly payment</dt><dd>{fmtGBP(monthly)}</dd></div>
        <div className="nx-stat"><dt>Loan</dt><dd>{fmtGBP(loan)}</dd></div>
        <div className="nx-stat"><dt>Loan to value</dt><dd>{Math.round(100 - deposit)}%</dd></div>
        <div className="nx-stat"><dt>Total repaid</dt><dd>{fmtGBP(totalPaid)}</dd></div>
        <div className="nx-stat"><dt>Stress test at +3%</dt><dd>{fmtGBP(stressed)}</dd></div>
      </dl>

      <h4 className="nx-h4">Compare today's products</h4>
      <ul className="nx-products">
        {PRODUCTS.map(([name, r]) => (
          <li key={name} className="nx-product">
            <span className="nx-product__name">{name}</span>
            <span className="nx-product__rate">{fmtPct(r)}</span>
            <span className="nx-product__monthly">{fmtGBP(monthlyPayment(loan, r, term, type))}</span>
            <button type="button" className="nx-rate-use" onClick={() => setRate(r)}>Use rate</button>
          </li>
        ))}
      </ul>
      <a className="nx-cta-advisor" href="#enquire">Talk to an advisor</a>
    </form>
  );
}

function BridgingCalculator() {
  const [gross, setGross] = useState(750000);
  const [months, setMonths] = useState(9);
  const [rate, setRate] = useState(0.75);
  const [method, setMethod] = useState<"retained" | "serviced">("retained");

  const FEE = 0.02;
  const monthly = gross * (rate / 100);
  const interest = monthly * months;
  const fee = gross * FEE;
  const net = method === "retained" ? gross - fee - interest : gross - fee;

  return (
    <form className="nx-card nx-calc" id="bridging-calc" onSubmit={(e) => e.preventDefault()}>
      <h3 className="nx-h3">Bridging calculator</h3>
      <div className="nx-seg" role="group" aria-label="Interest method">
        <button type="button" aria-pressed={method === "retained"} onClick={() => setMethod("retained")}>Retained</button>
        <button type="button" aria-pressed={method === "serviced"} onClick={() => setMethod("serviced")}>Serviced</button>
      </div>
      <Range label="Gross loan" value={gross} out={fmtGBP(gross)} min={150000} max={5000000} step={10000} onChange={setGross} />
      <Range label="Term" value={months} out={`${months} ${months === 1 ? "month" : "months"}`} min={1} max={24} step={1} onChange={setMonths} />
      <Range label="Monthly rate" value={rate} out={fmtPct(rate)} min={0.45} max={1.5} step={0.01} onChange={setRate} />

      <dl className="nx-stats">
        <div className="nx-stat nx-stat--hero"><dt>Net advance on day one</dt><dd>{fmtGBP(net)}</dd></div>
        <div className="nx-stat"><dt>Monthly interest</dt><dd>{fmtGBP(monthly)}{method === "retained" ? " (retained)" : ""}</dd></div>
        <div className="nx-stat"><dt>Total interest</dt><dd>{fmtGBP(interest)}</dd></div>
        <div className="nx-stat"><dt>Arrangement fee (2%)</dt><dd>{fmtGBP(fee)}</dd></div>
        <div className="nx-stat"><dt>Repay at exit</dt><dd>{fmtGBP(gross)}</dd></div>
      </dl>
      <p className="nx-note">
        {method === "retained"
          ? "Retained interest is deducted from the advance, so there are no monthly payments during the term."
          : "Serviced interest is paid monthly, so more of the gross loan reaches you on day one."}
      </p>
      <a className="nx-cta-terms" href="#enquire">Request terms</a>
    </form>
  );
}

function Range(props: {
  label: string;
  value: number;
  out: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = `r-${props.label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="nx-range">
      <label htmlFor={id}>
        <span>{props.label}</span>
        <output htmlFor={id}>{props.out}</output>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surveys                                                              */
/* ------------------------------------------------------------------ */

type Level = "full" | "visual" | "none";

interface Survey {
  id: string;
  name: string;
  sub: string;
  fee: number;
  depth: number;
  days: number;
  blurb: string;
  inspects: Record<string, Level>;
}

const SURVEYS: Survey[] = [
  { id: "l1", name: "Level 1", sub: "Condition Report", fee: 450, depth: 35, days: 3,
    blurb: "A traffic-light snapshot for a conventional, newer home in good order. No advice on repairs and no valuation.",
    inspects: { roof: "visual", walls: "visual", floors: "none", services: "visual", drainage: "none", loft: "none", outbuildings: "none", costs: "none" } },
  { id: "l2", name: "Level 2", sub: "HomeBuyer Survey", fee: 700, depth: 65, days: 5,
    blurb: "The most-chosen survey for conventional properties under about 100 years old. Flags the defects that affect value and tells you what to do next.",
    inspects: { roof: "visual", walls: "full", floors: "visual", services: "visual", drainage: "visual", loft: "visual", outbuildings: "visual", costs: "none" } },
  { id: "l3", name: "Level 3", sub: "Building Survey", fee: 1250, depth: 95, days: 7,
    blurb: "A full structural inspection for older, listed, unusual or heavily altered homes, and anything you plan to renovate. Includes repair options and indicative costs.",
    inspects: { roof: "full", walls: "full", floors: "full", services: "full", drainage: "full", loft: "full", outbuildings: "full", costs: "full" } },
  { id: "defect", name: "Defect report", sub: "Single issue", fee: 400, depth: 25, days: 4,
    blurb: "One issue investigated properly: damp, cracking, roof movement or timber decay, with a clear remedial plan and cost band.",
    inspects: { roof: "visual", walls: "full", floors: "visual", services: "none", drainage: "none", loft: "none", outbuildings: "none", costs: "full" } },
];

const INSPECT_ITEMS: [string, string][] = [
  ["roof", "Roof structure & coverings"], ["walls", "Walls, damp & movement"], ["floors", "Floors & timbers"],
  ["services", "Electrics, gas & plumbing"], ["drainage", "Drainage"], ["loft", "Loft & roof void"],
  ["outbuildings", "Outbuildings & grounds"], ["costs", "Repair cost estimates"],
];

const LEVEL_LABEL: Record<Level, string> = { full: "Full", visual: "Visual", none: "Not included" };

type Metric = "fee" | "depth" | "days";
const METRICS: Record<Metric, { label: string; max: number; fmt: (v: number) => string }> = {
  fee: { label: "Typical fee", max: 1400, fmt: (v) => fmtGBP(v) },
  depth: { label: "Inspection depth", max: 100, fmt: (v) => `${v} / 100` },
  days: { label: "Turnaround", max: 8, fmt: (v) => `${v} working days` },
};

function Surveys() {
  const [metric, setMetric] = useState<Metric>("fee");
  const [selected, setSelected] = useState("l2");
  const survey = SURVEYS.find((s) => s.id === selected) ?? SURVEYS[1];

  return (
    <section className="nx-section" id="surveys" aria-labelledby="surveys-h">
      <div className="nx-section__head">
        <h2 className="nx-h2" id="surveys-h">Which survey, and what it actually inspects</h2>
        <p className="nx-lead">
          Choose a metric to compare the four reports, then pick one to see the room-by-room scope.
        </p>
      </div>

      <div className="nx-grid nx-grid--two">
        <div className="nx-card">
          <div className="nx-seg" role="group" aria-label="Compare by">
            {(Object.keys(METRICS) as Metric[]).map((m) => (
              <button key={m} type="button" aria-pressed={metric === m} onClick={() => setMetric(m)}>
                {METRICS[m].label}
              </button>
            ))}
          </div>
          <div className="nx-bars" role="list">
            {SURVEYS.map((s) => {
              const v = s[metric];
              const pct = Math.round((v / METRICS[metric].max) * 100);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="listitem"
                  className="nx-bar"
                  aria-pressed={selected === s.id}
                  onClick={() => setSelected(s.id)}
                >
                  <span className="nx-bar__label">{s.name}<small>{s.sub}</small></span>
                  <span className="nx-bar__track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                  <span className="nx-bar__value">{METRICS[metric].fmt(v)}</span>
                </button>
              );
            })}
          </div>
          <table className="nx-table">
            <caption>All four reports at a glance</caption>
            <thead>
              <tr><th scope="col">Report</th><th scope="col">Fee</th><th scope="col">Depth</th><th scope="col">Turnaround</th></tr>
            </thead>
            <tbody>
              {SURVEYS.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.name} · {s.sub}</th>
                  <td>{METRICS.fee.fmt(s.fee)}</td>
                  <td>{METRICS.depth.fmt(s.depth)}</td>
                  <td>{METRICS.days.fmt(s.days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="nx-card" aria-live="polite">
          <h3 className="nx-h3">{survey.name} · {survey.sub}</h3>
          <p className="nx-body">{survey.blurb}</p>
          <ul className="nx-inspect">
            {INSPECT_ITEMS.map(([key, label]) => {
              const level = survey.inspects[key];
              return (
                <li key={key} data-level={level}>
                  <span>{label}</span>
                  <b>{LEVEL_LABEL[level]}</b>
                </li>
              );
            })}
          </ul>
          <a className="nx-cta-survey" href="#enquire">Get a survey quote</a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enquiry                                                              */
/* ------------------------------------------------------------------ */

type Fields = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  consent: boolean;
};

const EMPTY: Fields = { name: "", email: "", phone: "", service: "", message: "", consent: false };

const VALIDATORS: { [K in keyof Fields]: (v: Fields[K]) => true | string } = {
  name: (v) => v.trim().length >= 2 || "Enter your full name",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter an email address we can reply to",
  phone: (v) => !v.trim() || /^[+\d][\d\s().-]{6,}$/.test(v.trim()) || "Enter a phone number, or leave this blank",
  service: (v) => !!v || "Choose the service you're enquiring about",
  message: (v) => v.trim().length >= 10 || "Tell us a little about what you need (at least 10 characters)",
  consent: (v) => v || "Confirm you're happy for us to contact you",
};

function Enquire() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sent, setSent] = useState(false);

  const set = <K extends keyof Fields>(key: K, v: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) {
      const r = VALIDATORS[key](v);
      setErrors((prev) => ({ ...prev, [key]: r === true ? undefined : r }));
    }
  };

  const validateAll = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    (Object.keys(VALIDATORS) as (keyof Fields)[]).forEach((k) => {
      const r = (VALIDATORS[k] as (v: Fields[typeof k]) => true | string)(values[k]);
      if (r !== true) next[k] = r;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (validateAll()) {
      setSent(true);
    } else {
      document.getElementById("form-errors")?.focus();
    }
  };

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <section className="nx-section nx-section--tint" id="enquire" aria-labelledby="enquire-h">
      <div className="nx-grid nx-grid--two nx-grid--enquire">
        <div>
          <p className="nx-eyebrow">Contact</p>
          <h2 className="nx-h2" id="enquire-h">Speak to an advisor</h2>
          <p className="nx-lead">One message reaches the right partner. We reply within one working day.</p>
          <address className="nx-address">
            <a href={`tel:${brand.phone.replace(/[^\d+]/g, "")}`}>{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <span>{brand.address}</span>
          </address>
        </div>

        {sent ? (
          <div className="nx-card nx-success" role="status">
            <h3 className="nx-h3">Thank you, {values.name.trim().split(" ")[0]}.</h3>
            <p className="nx-body">Your enquiry is with our {values.service} team. Expect a reply within one working day.</p>
          </div>
        ) : (
          <form className="nx-card nx-form" noValidate onSubmit={submit}>
            {errorList.length ? (
              <div className="nx-form__errors" id="form-errors" tabIndex={-1} role="alert">
                <p>Please fix the following:</p>
                <ul>
                  {errorList.map(([k, v]) => (
                    <li key={k}><a href={`#c-${k}`}>{v}</a></li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Field id="c-name" label="Full name" error={errors.name}>
              <input id="c-name" name="name" autoComplete="name" value={values.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-error" : undefined} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field id="c-email" label="Email" error={errors.email}>
              <input id="c-email" name="email" type="email" autoComplete="email" value={values.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-error" : undefined} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field id="c-phone" label="Phone (optional)" error={errors.phone}>
              <input id="c-phone" name="phone" type="tel" autoComplete="tel" value={values.phone} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "c-phone-error" : undefined} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field id="c-service" label="Service" error={errors.service}>
              <select id="c-service" name="service" value={values.service} aria-invalid={!!errors.service} aria-describedby={errors.service ? "c-service-error" : undefined} onChange={(e) => set("service", e.target.value)}>
                <option value="">Choose…</option>
                <option value="buying">Buying</option>
                <option value="selling">Selling</option>
                <option value="letting">Letting</option>
                <option value="mortgages">Mortgages</option>
                <option value="bridging">Bridging finance</option>
                <option value="surveying">Surveying</option>
              </select>
            </Field>
            <Field id="c-message" label="How can we help?" error={errors.message}>
              <textarea id="c-message" name="message" rows={4} value={values.message} aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-error" : undefined} onChange={(e) => set("message", e.target.value)} />
            </Field>
            <div className={`nx-check${errors.consent ? " is-invalid" : ""}`}>
              <input id="c-consent" name="consent" type="checkbox" checked={values.consent} aria-describedby={errors.consent ? "c-consent-error" : undefined} onChange={(e) => set("consent", e.target.checked)} />
              <label htmlFor="c-consent">I'm happy for Norvex Property to contact me about this enquiry.</label>
              {errors.consent ? <p className="nx-error" id="c-consent-error">{errors.consent}</p> : null}
            </div>
            <button className="nx-cta-send" type="submit">Send enquiry</button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field(props: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`nx-field nx-field--stack${props.error ? " is-invalid" : ""}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {props.children}
      {props.error ? <p className="nx-error" id={`${props.id}-error`}>{props.error}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer className="nx-footer">
      <div>
        <p className="nx-brand">{brand.name}</p>
        <p className="nx-footer__tag">{brand.tagline}</p>
      </div>
      <ul className="nx-footer__links">
        <li><a href="#properties">Properties</a></li>
        <li><a href="#mortgages">Mortgages</a></li>
        <li><a href="#surveying">Surveying</a></li>
        <li><a href="#bridging">Bridging</a></li>
        <li><a href="#enquire">Contact</a></li>
      </ul>
      <p className="nx-footer__legal">
        Norvex Property Ltd is registered in England and Wales. Mortgage and bridging advice is provided by our
        FCA-authorised partners. Your home may be repossessed if you do not keep up repayments on a mortgage or any
        other debt secured on it.
      </p>
    </footer>
  );
}
