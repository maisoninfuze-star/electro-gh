/**
 * ELECTRO GH — SINGLE SOURCE OF TRUTH FOR BUSINESS FACTS
 * =====================================================
 * Everything the site says about the business comes from this file.
 *
 * RULE: a field is either a VERIFIED fact supplied by the owner, or it is
 * `null`. Never fill a null with a guess. Any component reading a null must
 * hide the surrounding UI rather than invent a value.
 *
 * `verified: false` blocks are rendered nowhere until the owner confirms them.
 * This is what keeps warranty terms, delivery pricing, financing and opening
 * hours honest.
 */

export type Verified<T> = { value: T; verified: true } | { value: null; verified: false };

export const v = <T,>(value: T): Verified<T> => ({ value, verified: true });
export const unverified = <T,>(): Verified<T> => ({ value: null, verified: false });

export const BUSINESS = {
  /** Legal / display names. Supplied by owner. */
  legalName: 'Électroménagers GH',
  shortName: 'Electro GH',

  /** Confirmed from the public listing supplied in the brief. */
  address: {
    street: '3570 Chemin du Souvenir',
    city: 'Laval',
    region: 'QC',
    regionName: 'Québec',
    postalCode: 'H7V 1X2',
    country: 'CA',
    countryName: 'Canada',
  },

  /** Confirmed. `raw` is E.164 for tel: links, `display` is what humans read. */
  phone: {
    display: '450-681-2848',
    raw: '+14506812848',
  },

  /**
   * WhatsApp. UNVERIFIED — the brief asks for deep WhatsApp integration but no
   * WhatsApp number was supplied. Until `verified` is true the floating button
   * and all WhatsApp CTAs are hidden site-wide (see lib/contact.ts).
   * To switch WhatsApp on: replace with v('14506812848') — digits only, no +.
   */
  whatsapp: unverified<string>(),

  /** UNVERIFIED — no email address was supplied. */
  email: unverified<string>(),

  /**
   * Opening hours. UNVERIFIED and intentionally empty.
   * Third-party directories carry stale appliance-store hours; publishing them
   * unchecked creates wasted trips and one-star reviews. The showroom section
   * renders a "call to confirm" line instead until these are filled in.
   *
   * Shape when filled, e.g.:
   *   hours: v([{ day: 1, opens: '09:00', closes: '18:00' }, ...])
   */
  hours: unverified<OpeningHour[]>(),

  /** Languages spoken in store. Confirmed in the brief. */
  languages: ['fr', 'en', 'ar'] as const,

  /**
   * Service claims. Only `true` claims are rendered. `details` stays null until
   * the owner supplies exact terms — the UI shows the claim without the terms.
   */
  services: {
    delivery: { offered: true, details: unverified<string>(), pricing: unverified<string>() },
    warranty: { offered: true, durationMonths: unverified<number>(), details: unverified<string>() },
    repair: { offered: true, details: unverified<string>() },
    financing: { offered: false, details: unverified<string>() },
    installation: { offered: false, details: unverified<string>() },
  },

  /** Social. Fill in when the real handles are supplied. */
  social: {
    facebook: unverified<string>(),
    instagram: unverified<string>(),
  },

  /**
   * Google Business Profile place id — powers the map embed and, later, live
   * reviews. Until supplied the map falls back to an address-based embed and
   * the reviews section does not render in production.
   */
  googlePlaceId: unverified<string>(),

  /** Company history / founding year — NOT supplied. Never invent one. */
  foundedYear: unverified<number>(),

  /** Brands carried. "Multiple brands" is confirmed; the LIST is not. */
  brands: unverified<string[]>(),
} as const;

export type OpeningHour = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; opens: string; closes: string };

/** Single formatted address line, used in schema.org output and the footer. */
export const addressLine = () =>
  `${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.region} ${BUSINESS.address.postalCode}`;

/** Google Maps directions deep-link, built from the verified address. */
export const directionsUrl = () =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${BUSINESS.legalName}, ${addressLine()}`,
  )}`;

/** Map embed. Uses the place id when supplied, otherwise a plain address query. */
export const mapEmbedUrl = () =>
  `https://maps.google.com/maps?q=${encodeURIComponent(addressLine())}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
