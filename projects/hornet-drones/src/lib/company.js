/*
 * STATUTORY COMPANY IDENTITY — one source of truth.
 *
 * The Company, Limited Liability Partnership and Business (Names and Trading
 * Disclosures) Regulations 2015 require a limited company's website to state
 * its registered name, its registered number, the part of the UK it is
 * registered in, and the address of its registered office. Those four facts
 * therefore live here rather than being retyped into each component, so the
 * footer and /compliance can never disagree with each other.
 *
 * REGISTERED OFFICE is the one field still outstanding. It is deliberately
 * left as the same bracketed token used in /privacy and /terms, so that
 * filling it in is a single search-and-replace across the project:
 *
 *   grep -rl '\[REGISTERED OFFICE ADDRESS\]' src public
 *
 * Copy it from the company's own Companies House record, exactly as that
 * record prints it — not from memory, and not from letterhead, which often
 * carries a trading address instead.
 *
 * Until it is filled in, the site footer omits the line entirely rather than
 * printing a bracketed placeholder at a real visitor. /compliance does show
 * the token, behind the same draft banner /privacy and /terms already use, so
 * the gap stays visible to us instead of being quietly forgotten.
 */
export const COMPANY = {
  name: 'Hornet Drones Limited',
  number: '17463533',
  jurisdiction: 'England and Wales',
  registeredOffice: '[REGISTERED OFFICE ADDRESS]',
}

// True while the address above is still the placeholder token.
export const OFFICE_PENDING = COMPANY.registeredOffice.startsWith('[')
