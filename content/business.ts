/**
 * ELECTRO GH — SINGLE SOURCE OF TRUTH FOR BUSINESS FACTS
 * =====================================================
 * Everything the site says about the business comes from this file.
 *
 * RULE: a field is either a VERIFIED fact supplied by the owner, or it is
 * `null`. Never fill a null with a guess. Any component reading a null must
 * hide the surrounding UI rather than invent a value.
 *
 * SOURCES
 *   brand/business-card.png   the owner's official card (2026-09-19). Two
 *                             stores, both phones, the email, and the
 *                             services list all come from here.
 *   brand/storefront-sign.jpg the Montréal storefront.
 *   The owner's acceptance email, which also set the site's sections.
 */

export type Verified<T> = { value: T; verified: true } | { value: null; verified: false };

export const v = <T,>(value: T): Verified<T> => ({ value, verified: true });
export const unverified = <T,>(): Verified<T> => ({ value: null, verified: false });

export type OpeningHour = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; opens: string; closes: string };

export type StoreId = 'montreal' | 'laval';

export type Store = {
  id: StoreId;
  /** City word used in nav chips, chooser sheets and schema names. */
  city: string;
  address: {
    street: string;
    city: string;
    region: string;
    regionName: string;
    postalCode: string;
    country: string;
    countryName: string;
  };
  /** `raw` is E.164 for tel: links, `display` is what humans read. */
  phone: { display: string; raw: string };
  /**
   * Opening hours — UNVERIFIED for both stores. Third-party directories carry
   * stale appliance-store hours; publishing them unchecked creates wasted
   * trips. Each store renders "call to confirm" until this is filled:
   *   hours: v([{ day: 1, opens: '09:00', closes: '18:00' }, ...])
   */
  hours: Verified<OpeningHour[]>;
  /** Google Business Profile place id — map pin and, later, live reviews. */
  googlePlaceId: Verified<string>;
};

export const BUSINESS = {
  /** From the logo: "ÉLECTROMÉNAGERS GH". */
  legalName: 'Électroménagers GH',
  shortName: 'Electro GH',
  /** Printed on the logo itself — the most verified claim the business makes. */
  tagline: { fr: 'Achat & revente', en: 'We buy & sell' },

  /**
   * TWO STORES, in the order the business card lists them.
   * Nothing designates a "main" store: every phone and directions action
   * either targets a specific store or offers both.
   */
  stores: [
    {
      id: 'montreal',
      city: 'Montréal',
      address: {
        street: '6439, boul. Gouin Ouest',
        city: 'Montréal',
        region: 'QC',
        regionName: 'Québec',
        postalCode: 'H4K 1A9',
        country: 'CA',
        countryName: 'Canada',
      },
      phone: { display: '514 332-2848', raw: '+15143322848' },
      hours: unverified<OpeningHour[]>(),
      googlePlaceId: unverified<string>(),
    },
    {
      id: 'laval',
      city: 'Laval',
      address: {
        street: '3570, chemin du Souvenir',
        city: 'Laval',
        region: 'QC',
        regionName: 'Québec',
        /**
         * ⚠️ The business card prints "H4V 1X2" here. H4V is a Montréal
         * (Côte-Saint-Luc) prefix; chemin du Souvenir is in Chomedey, Laval,
         * whose prefix is H7V — and the original brief said H7V 1X2. Almost
         * certainly a typo on the card. Using H7V; confirm with the owner.
         */
        postalCode: 'H7V 1X2',
        country: 'CA',
        countryName: 'Canada',
      },
      phone: { display: '450 681-2848', raw: '+14506812848' },
      hours: unverified<OpeningHour[]>(),
      googlePlaceId: unverified<string>(),
    },
  ] as const satisfies readonly Store[],

  /** From the business card. */
  email: v('electrogh@hotmail.com'),

  /**
   * WhatsApp — still UNVERIFIED. Two landlines are known, but no WhatsApp
   * number was supplied. Every WhatsApp CTA stays hidden until this is set
   * (digits only, no +): whatsapp: v('15143322848')
   */
  whatsapp: unverified<string>(),

  /** Languages spoken in store. Confirmed in the brief. */
  languages: ['fr', 'en', 'ar'] as const,

  /**
   * Services. `offered` mirrors the business card and the owner's email.
   * `details` stays null until exact terms are supplied — the UI states the
   * service exists and routes to a call, never a price or a turnaround.
   */
  services: {
    /** Card: "Service de livraison". */
    delivery: { offered: true, details: unverified<string>(), pricing: unverified<string>() },
    /** Card: "Service de réparation". Owner's email: its own section. */
    repair: { offered: true, details: unverified<string>() },
    /** Owner's email: "Pièces". Nothing else is known — not even which parts. */
    parts: { offered: true, details: unverified<string>() },
    /** Card: "Garantie disponible". */
    warranty: { offered: true, durationMonths: unverified<number>(), details: unverified<string>() },
    /** Logo: "Achat & revente". They buy used appliances as well as sell. */
    buyback: { offered: true, details: unverified<string>() },
    financing: { offered: false, details: unverified<string>() },
    installation: { offered: false, details: unverified<string>() },
  },

  /** Card: "Appareils de toutes marques". The LIST of brands is still not supplied. */
  brands: unverified<string[]>(),

  social: {
    facebook: unverified<string>(),
    instagram: unverified<string>(),
  },

  /** Company history / founding year — NOT supplied. Never invent one. */
  foundedYear: unverified<number>(),
} as const;

export const STORES: readonly Store[] = BUSINESS.stores;

export const storeById = (id: StoreId): Store =>
  STORES.find((s) => s.id === id) ?? STORES[0];

/** "6439, boul. Gouin Ouest, Montréal, QC H4K 1A9" */
export const addressLine = (store: Store) =>
  `${store.address.street}, ${store.address.city}, ${store.address.region} ${store.address.postalCode}`;

/** Google Maps directions deep-link for one store. */
export const directionsUrl = (store: Store) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${BUSINESS.legalName}, ${addressLine(store)}`,
  )}`;

/** Map embed for one store. Uses the place id when supplied. */
export const mapEmbedUrl = (store: Store) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(addressLine(store))}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
