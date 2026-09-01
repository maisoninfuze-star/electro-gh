import { BUSINESS } from '@/content/business';

/**
 * Contact channels, gated on verification.
 *
 * WhatsApp is central to the brief, but no WhatsApp number was supplied. Rather
 * than shipping a dead button that loses a lead every time someone taps it,
 * every WhatsApp surface asks `whatsappEnabled()` first and simply doesn't
 * render. Set BUSINESS.whatsapp to v('1450…') to switch the whole site on.
 */

export const whatsappEnabled = (): boolean => BUSINESS.whatsapp.verified;

export const telHref = () => `tel:${BUSINESS.phone.raw}`;

/** wa.me deep link with a prefilled message. Returns null when unverified. */
export function whatsappHref(message?: string): string | null {
  if (!BUSINESS.whatsapp.verified) return null;
  const base = `https://wa.me/${BUSINESS.whatsapp.value}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const hasHours = (): boolean =>
  BUSINESS.hours.verified && (BUSINESS.hours.value?.length ?? 0) > 0;
