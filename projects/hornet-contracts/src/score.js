/*
 * MATCHING AND SCORING — pure functions, no platform APIs.
 *
 * Everything here is deliberately rule-based and auditable. A contract's score
 * always carries the list of reasons that produced it, so a human can see why
 * something surfaced and can argue with the rule rather than with a black box.
 *
 * These functions are imported by the Worker and by test/run.mjs, which is why
 * they must not touch fetch, D1 or any global.
 */

/*
 * CPV is the Common Procurement Vocabulary — the classification every UK and EU
 * buyer stamps on a notice. Matching on CPV is far more reliable than keywords,
 * because a buyer who codes a notice 34711200 means an unmanned aircraft, while
 * "drone" in free text catches drone strikes, drone music and dronework.
 *
 * Codes carry a check digit after a hyphen (34711200-6). We compare on the
 * eight-digit stem so a missing or differing check digit never loses a match.
 */
export const CPV_DRONE = {
  '34711200': 'Unmanned aerial vehicles',
  '35613000': 'Unmanned aerial vehicles (defence/security)',
}

/*
 * Adjacent codes. A drone contract is often filed under the capability it
 * delivers rather than the airframe, so these are worth surfacing — but at a
 * lower weight, because most notices under them are not drone work at all.
 */
export const CPV_RELATED = {
  '35125000': 'Surveillance system',
  '79714000': 'Surveillance services',
  '79711000': 'Alarm-monitoring services',
  '34711100': 'Aeroplanes',
  '35611800': 'Reconnaissance equipment',
  '38651600': 'Digital cameras',
  '73000000': 'Research and development services',
}

/*
 * Word-boundary patterns. "uas" and "rpas" in particular must not match inside
 * longer words, so every term is anchored rather than used as a substring.
 */
export const TERMS_STRONG = [
  /\bdrones?\b/i,
  /\buavs?\b/i,
  /\buas\b/i,
  /\brpas\b/i,
  /\bunmanned\s+(aerial|aircraft|air)\b/i,
  /\bremotely\s+piloted\b/i,
  /\bbvlos\b/i,
  /\bcounter[-\s]?(uas|drone)\b/i,
  /\bquadcopters?\b/i,
  /\bmulti[-\s]?rotors?\b/i,
]

export const TERMS_CAPABILITY = [
  /\baerial\s+(surveillance|survey|inspection|imagery)\b/i,
  /\bthermal\s+(imaging|camera)\b/i,
  /\bperimeter\s+(security|surveillance|protection)\b/i,
  /\bpersistent\s+surveillance\b/i,
  /\bisr\b/i,
  /\bautonomous\s+(patrol|security|system)\b/i,
  /\bsite\s+security\b/i,
]

/* Notices that mention drones only to ban them. Cheap, high-value exclusion. */
export const TERMS_NEGATIVE = [
  /\bdrone\s+(strike|warfare|music)\b/i,
  /\bno\s+drones?\b/i,
  /\bdrone\s+detection\s+only\b/i,
]

/** Eight-digit stem of a CPV code, or null if it does not look like one. */
export function cpvStem(code) {
  if (!code) return null
  const m = String(code).match(/(\d{8})/)
  return m ? m[1] : null
}

/**
 * Does this notice concern drones at all? Runs before scoring so that the
 * database only ever holds relevant notices, rather than everything published.
 *
 * Returns null for "not relevant", or the evidence for why it is.
 */
export function classify({ title = '', description = '', cpv = [] }) {
  const text = `${title}\n${description}`
  const stems = cpv.map(cpvStem).filter(Boolean)

  const cpvDrone = stems.filter((s) => CPV_DRONE[s])
  const cpvRelated = stems.filter((s) => CPV_RELATED[s])
  const strong = TERMS_STRONG.filter((r) => r.test(text))
  const capability = TERMS_CAPABILITY.filter((r) => r.test(text))
  const negative = TERMS_NEGATIVE.filter((r) => r.test(text))

  /*
   * A drone CPV code is on its own enough. Otherwise we need an explicit drone
   * term — a related CPV code plus a capability phrase is not, because that
   * describes most CCTV contracts in the country.
   */
  const relevant = cpvDrone.length > 0 || strong.length > 0
  if (!relevant) return null
  if (negative.length > 0 && cpvDrone.length === 0 && strong.length < 2) return null

  return { cpvDrone, cpvRelated, strong: strong.length, capability: capability.length }
}

/**
 * Score a classified notice 0-100 for how worth-a-look it is, from the point of
 * view of a small UK drone company that can bid or partner.
 *
 * The weights are opinions, not measurements. They are all in this one function
 * so they can be argued with and changed in one place.
 */
export function score(notice, evidence, now = new Date()) {
  let points = 0
  const reasons = []
  /*
   * Reasons that cut the score are kept apart and returned first. The dashboard
   * shows only the first few chips, and a notice whose deadline has passed must
   * not read as "Open tender, biddable" simply because that reason was recorded
   * earlier. The decisive fact goes first.
   */
  const blockers = []

  if (evidence.cpvDrone.length > 0) {
    points += 40
    reasons.push(`Classified under a drone CPV code (${evidence.cpvDrone.join(', ')})`)
  }
  if (evidence.strong > 0) {
    const p = Math.min(25, 15 + evidence.strong * 5)
    points += p
    reasons.push(`Names drones or unmanned aircraft directly (${evidence.strong} term${evidence.strong === 1 ? '' : 's'})`)
  }
  if (evidence.capability > 0) {
    const p = Math.min(12, evidence.capability * 6)
    points += p
    reasons.push(`Describes capabilities Hornet builds (${evidence.capability} match${evidence.capability === 1 ? '' : 'es'})`)
  }
  if (evidence.cpvRelated.length > 0 && evidence.cpvDrone.length === 0) {
    points += 5
    reasons.push(`Adjacent CPV code (${evidence.cpvRelated.join(', ')})`)
  }

  /*
   * Worked out before stage, because the stage wording below depends on it.
   * null means the notice carries no usable deadline at all, which is not the
   * same as a deadline that has passed.
   */
  let deadlineDays = null
  if (notice.deadline_at) {
    const deadline = new Date(notice.deadline_at)
    if (!Number.isNaN(deadline.getTime())) deadlineDays = Math.round((deadline - now) / 86400000)
  }

  /*
   * Stage matters more than almost anything. An open tender can be bid; an
   * award notice is a contract somebody else has already won, and is useful
   * only as intelligence about who and for how much.
   */
  if (notice.stage === 'tender' || notice.stage === 'planning') {
    points += 12
    /*
     * Do not call a tender "biddable" once its deadline has gone. The stage
     * field and the deadline can disagree — publishers leave the stage at
     * "tender" long after closing — and the deadline is the one that decides
     * whether anything can be done about it.
     */
    reasons.push(
      notice.stage === 'planning'
        ? 'Early notice — pipeline, not yet open'
        : deadlineDays !== null && deadlineDays < 0
          ? 'Tender stage, but the window has closed'
          : 'Open tender, biddable',
    )
  } else if (notice.stage === 'award' || notice.stage === 'contract') {
    points -= 5
    blockers.push('Already awarded — intelligence only')
  }

  /* A deadline that has passed cannot be bid, whatever else is true of it. */
  if (deadlineDays !== null) {
    const days = deadlineDays
    if (days < 0) {
      points -= 25
      blockers.push(`Deadline passed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`)
    } else if (days <= 7) {
      points += 4
      reasons.push(`Closes in ${days} day${days === 1 ? '' : 's'} — urgent`)
    } else {
      points += 10
      reasons.push(`Open for another ${days} days`)
    }
  }

  /*
   * Contract size, judged for a company of two. A very large contract is not a
   * bad contract, but it is almost certainly prime-contractor-only, so it is
   * ranked as a partnering target rather than a bid.
   */
  const v = Number(notice.value_amount)
  if (Number.isFinite(v) && v > 0) {
    if (v > 10_000_000) {
      points -= 15
      blockers.push('Over £10M — realistically a prime contractor bid, or a subcontract route')
    } else if (v >= 50_000 && v <= 2_000_000) {
      points += 10
      reasons.push('Value in range a small supplier can deliver')
    } else if (v < 10_000) {
      points -= 5
      blockers.push('Very low value')
    }
  }

  return { score: Math.max(0, Math.min(100, points)), reasons: [...blockers, ...reasons] }
}

/**
 * Normalise a supplier name into a stable key, so "BAE Systems plc",
 * "BAE SYSTEMS PLC" and "BAE Systems PLC." collapse to one supplier.
 *
 * This is deliberately conservative. It does not try to merge genuinely
 * different legal entities in the same group, because that would silently
 * overstate one company's share of the market.
 */
export function supplierSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(limited|ltd|plc|llp|inc|incorporated|corporation|corp|company|co|gmbh|bv|sa|as|holdings|group|uk)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}
