"use strict";
/**
 * BILINGUAL ARCHITECTURE (FR default, EN, Arabic-ready)
 * ====================================================
 * French is the default locale and is served WITHOUT a path prefix, so the
 * primary Montréal/Laval audience gets clean canonical URLs:
 *
 *   FR  /                      /refrigerateurs        /aubaines
 *   EN  /en                    /en/refrigerators      /en/deals
 *
 * Adding Arabic later is a three-step change with no rebuild:
 *   1. add 'ar' to LOCALES
 *   2. add an `ar` entry to ROUTE_SLUGS and to the dictionaries
 *   3. add 'ar' to RTL_LOCALES — `dir` is already wired through the layout
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SITE_URL = exports.PRODUCT_PARENT = exports.FUTURE_ROUTES = exports.isLive = exports.LIVE_ROUTES = exports.ROUTE_SLUGS = exports.HTML_LANG = exports.dirFor = exports.isLocale = exports.RTL_LOCALES = exports.DEFAULT_LOCALE = exports.LOCALES = void 0;
exports.href = href;
exports.productHref = productHref;
exports.routeIdFromSlug = routeIdFromSlug;
exports.alternates = alternates;
exports.LOCALES = ['fr', 'en'];
exports.DEFAULT_LOCALE = 'fr';
/** Locales written right-to-left. `ar` goes here when it is added. */
exports.RTL_LOCALES = [];
const isLocale = (x) => exports.LOCALES.includes(x);
exports.isLocale = isLocale;
const dirFor = (locale) => (exports.RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr');
exports.dirFor = dirFor;
/** BCP-47 tags for <html lang> and hreflang. */
exports.HTML_LANG = { fr: 'fr-CA', en: 'en-CA' };
/**
 * Every page in the site, keyed by a stable route id. The id never changes;
 * only the per-locale slug does. This is what lets FR and EN have genuinely
 * localised, SEO-clean URLs instead of one language's slugs with a prefix.
 */
exports.ROUTE_SLUGS = {
    home: { fr: '', en: '' },
    // Catalog
    shop: { fr: 'magasiner', en: 'shop' },
    refrigerators: { fr: 'refrigerateurs', en: 'refrigerators' },
    washers: { fr: 'laveuses', en: 'washers' },
    dryers: { fr: 'secheuses', en: 'dryers' },
    laundrySets: { fr: 'ensembles-laveuse-secheuse', en: 'washer-dryer-sets' },
    ranges: { fr: 'cuisinieres', en: 'ranges' },
    dishwashers: { fr: 'lave-vaisselle', en: 'dishwashers' },
    freezers: { fr: 'congelateurs', en: 'freezers' },
    deals: { fr: 'aubaines', en: 'deals' },
    // Services & company — the sections the owner asked for, by name, in the
    // acceptance email: Vente d'électroménagers (= shop above), Service de
    // réparation, Pièces, Livraison, Nos magasins, Nous joindre.
    repair: { fr: 'reparation', en: 'repair' },
    parts: { fr: 'pieces', en: 'parts' },
    delivery: { fr: 'livraison', en: 'delivery' },
    stores: { fr: 'nos-magasins', en: 'our-stores' },
    contact: { fr: 'nous-joindre', en: 'contact' },
};
/**
 * Routes that actually have a page today.
 *
 * ROUTE_SLUGS defines the URL for every page in the information architecture,
 * including ones not yet built. LIVE_ROUTES is what navigation, the footer and
 * the sitemap are allowed to link to.
 *
 * This is the brief's "do not expose future pages until content is available"
 * rule, enforced in one place: a link to a page that does not exist is a 404
 * for a real customer and a crawl error for Google, and neither is worth the
 * appearance of a fuller menu.
 *
 * TO SHIP A PAGE: create its route, then add its id here. Nothing else changes.
 */
exports.LIVE_ROUTES = new Set([
    'home',
    'shop',
    'refrigerators',
    'washers',
    'dryers',
    'laundrySets',
    'ranges',
    'dishwashers',
    'freezers',
    'deals',
    'repair',
    'parts',
    'delivery',
    'stores',
    'contact',
]);
const isLive = (route) => exports.LIVE_ROUTES.has(route);
exports.isLive = isLive;
/**
 * Future pages. Declared so the information architecture is settled, but NOT
 * routed and NOT linked anywhere until the content exists. Promote one by
 * moving its entry up into ROUTE_SLUGS.
 */
exports.FUTURE_ROUTES = {
    brands: { fr: 'marques', en: 'brands' },
    financing: { fr: 'financement', en: 'financing' },
    compare: { fr: 'comparer', en: 'compare' },
};
/** The product detail segment sits under its category: /refrigerateurs/<sku-slug> */
exports.PRODUCT_PARENT = 'shop';
/**
 * Build an href for a route id in a given locale.
 * FR (default) gets no prefix; every other locale is prefixed.
 */
function href(locale, route, sub) {
    const slug = exports.ROUTE_SLUGS[route][locale];
    const parts = [locale === exports.DEFAULT_LOCALE ? '' : locale, slug, sub].filter(Boolean);
    return '/' + parts.join('/');
}
/** Href for a product, nested under its category for breadcrumb-clean URLs. */
function productHref(locale, categoryRoute, slug) {
    return href(locale, categoryRoute, slug);
}
/** Resolve a locale-specific slug back to its route id (used by the router). */
function routeIdFromSlug(locale, slug) {
    const entry = Object.keys(exports.ROUTE_SLUGS).find((id) => exports.ROUTE_SLUGS[id][locale] === slug);
    return entry ?? null;
}
/** All locale variants of one page — powers hreflang alternates. */
function alternates(route, sub) {
    return Object.fromEntries(exports.LOCALES.map((l) => [exports.HTML_LANG[l], href(l, route, sub)]));
}
/**
 * The site's own address: canonical links, sitemap, structured data.
 * The owner bought electromenagersgh.com (Sept 2026) and set www as the
 * primary host in Vercel (the bare domain redirects to it).
 */
exports.SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://www.electromenagersgh.com';
