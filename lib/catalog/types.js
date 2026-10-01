"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savingsPercent = exports.savings = exports.hasDiscount = exports.canPublish = exports.hasPrice = exports.productLabel = void 0;
/**
 * "Brand + name" for titles and structured data. Many names already carry
 * the brand ("Ensemble laveuse et sécheuse Samsung"), so prefix it only when
 * it isn't there; a blank brand adds nothing.
 */
const productLabel = (p, locale) => {
    const name = p.name[locale];
    return !p.brand || name.toLowerCase().includes(p.brand.toLowerCase()) ? name : `${p.brand} ${name}`;
};
exports.productLabel = productLabel;
/** A real amount to show. False for "Prix sur demande" units (price 0). */
const hasPrice = (p) => p.price > 0;
exports.hasPrice = hasPrice;
/**
 * The publishing bar: a photo, and either a real price or the owner's
 * explicit "Prix sur demande". A 0 $ unit without that flag stays a draft.
 */
const canPublish = (p) => (p.price > 0 || p.priceOnRequest === true) && p.images.length > 0;
exports.canPublish = canPublish;
/** True only when there is a real, larger prior price. */
const hasDiscount = (p) => p.price > 0 && typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price;
exports.hasDiscount = hasDiscount;
/** Dollar savings, or 0. Never negative, never invented. */
const savings = (p) => (0, exports.hasDiscount)(p) ? Math.round(p.compareAtPrice - p.price) : 0;
exports.savings = savings;
const savingsPercent = (p) => (0, exports.hasDiscount)(p) ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;
exports.savingsPercent = savingsPercent;
