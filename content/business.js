"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEmbedUrl = exports.directionsUrl = exports.addressLine = exports.storeById = exports.STORES = exports.BUSINESS = exports.unverified = exports.v = void 0;
const v = (value) => ({ value, verified: true });
exports.v = v;
const unverified = () => ({ value: null, verified: false });
exports.unverified = unverified;
exports.BUSINESS = {
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
            hours: (0, exports.unverified)(),
            googlePlaceId: (0, exports.unverified)(),
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
            hours: (0, exports.unverified)(),
            googlePlaceId: (0, exports.unverified)(),
        },
    ],
    /** From the business card. */
    email: (0, exports.v)('electrogh@hotmail.com'),
    /**
     * WhatsApp — still UNVERIFIED. Two landlines are known, but no WhatsApp
     * number was supplied. Every WhatsApp CTA stays hidden until this is set
     * (digits only, no +): whatsapp: v('15143322848')
     */
    whatsapp: (0, exports.unverified)(),
    /** Languages spoken in store. Confirmed in the brief. */
    languages: ['fr', 'en', 'ar'],
    /**
     * Services. `offered` mirrors the business card and the owner's email.
     * `details` stays null until exact terms are supplied — the UI states the
     * service exists and routes to a call, never a price or a turnaround.
     */
    services: {
        /** Card: "Service de livraison". */
        delivery: { offered: true, details: (0, exports.unverified)(), pricing: (0, exports.unverified)() },
        /**
         * Card: "Service de réparation". Owner's email: its own section.
         * Owner, 29 Sept 2026: the repair line is 514 577-2847 (main), plus the
         * Laval store. The Montréal store number is NOT given for repairs.
         */
        repair: {
            offered: true,
            details: (0, exports.unverified)(),
            phone: (0, exports.v)({ display: '514 577-2847', raw: '+15145772847' }),
            alsoStore: 'laval',
        },
        /** Owner's email: "Pièces". Nothing else is known — not even which parts. */
        parts: { offered: true, details: (0, exports.unverified)() },
        /** Card: "Garantie disponible". */
        warranty: { offered: true, durationMonths: (0, exports.unverified)(), details: (0, exports.unverified)() },
        /** Logo: "Achat & revente". They buy used appliances as well as sell. */
        buyback: { offered: true, details: (0, exports.unverified)() },
        financing: { offered: false, details: (0, exports.unverified)() },
        installation: { offered: false, details: (0, exports.unverified)() },
    },
    /** Card: "Appareils de toutes marques". The LIST of brands is still not supplied. */
    brands: (0, exports.unverified)(),
    social: {
        facebook: (0, exports.unverified)(),
        instagram: (0, exports.unverified)(),
    },
    /** Company history / founding year — NOT supplied. Never invent one. */
    foundedYear: (0, exports.unverified)(),
};
exports.STORES = exports.BUSINESS.stores;
const storeById = (id) => exports.STORES.find((s) => s.id === id) ?? exports.STORES[0];
exports.storeById = storeById;
/** "6439, boul. Gouin Ouest, Montréal, QC H4K 1A9" */
const addressLine = (store) => `${store.address.street}, ${store.address.city}, ${store.address.region} ${store.address.postalCode}`;
exports.addressLine = addressLine;
/** Google Maps directions deep-link for one store. */
const directionsUrl = (store) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${exports.BUSINESS.legalName}, ${(0, exports.addressLine)(store)}`)}`;
exports.directionsUrl = directionsUrl;
/** Map embed for one store. Uses the place id when supplied. */
const mapEmbedUrl = (store) => `https://maps.google.com/maps?q=${encodeURIComponent((0, exports.addressLine)(store))}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
exports.mapEmbedUrl = mapEmbedUrl;
