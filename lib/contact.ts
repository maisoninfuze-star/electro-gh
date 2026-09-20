import { BUSINESS, type Store } from '@/content/business';

/**
 * Contact channels, gated on verification.
 *
 * With two stores there is no single "the phone number". Every call and
 * directions action is either for a specific store (a store card, a product
 * known to be at one location) or goes through <StoreChooser>, which offers
 * both. Nothing on the site dials a default store silently.
 *
 * WhatsApp is central to the brief, but no WhatsApp number was supplied. Rather
 * than shipping a dead button that loses a lead every time someone taps it,
 * every WhatsApp surface asks `whatsappEnabled()` first and simply doesn't
 * render. Set BUSINESS.whatsapp to v('1514…') to switch the whole site on.
 */

export const telHref = (store: Store) => `tel:${store.phone.raw}`;

export const emailEnabled = (): boolean => BUSINESS.email.verified;
export const mailtoHref = (subject?: string): string | null => {
  if (!BUSINESS.email.verified) return null;
  const base = `mailto:${BUSINESS.email.value}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
};

export const whatsappEnabled = (): boolean => BUSINESS.whatsapp.verified;

/** wa.me deep link with a prefilled message. Returns null when unverified. */
export function whatsappHref(message?: string): string | null {
  if (!BUSINESS.whatsapp.verified) return null;
  const base = `https://wa.me/${BUSINESS.whatsapp.value}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const hasHours = (store: Store): boolean =>
  store.hours.verified && (store.hours.value?.length ?? 0) > 0;
