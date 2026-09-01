import type { Locale } from './i18n/config';

/**
 * Prices are formatted per locale but always in CAD.
 * fr-CA renders "1 195 $", en-CA renders "$1,195" — matching what each
 * audience expects to see on a Quebec price tag.
 *
 * Cents are dropped when the amount is whole, because appliance pricing is
 * quoted in dollars and ".00" adds visual noise to a large display price.
 */
export function formatPrice(amount: number, locale: Locale): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })
    .format(amount)
    // fr-CA emits a narrow no-break space before "$"; keep it non-breaking but
    // make it a regular NBSP so it renders in every font we ship.
    .replace(/ /g, ' ');
}

/** Inches, in the local convention: 27 po (fr) / 27" (en). */
export function formatInches(value: number, locale: Locale): string {
  const n = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    maximumFractionDigits: 2,
  }).format(value);
  return locale === 'fr' ? `${n} po` : `${n}"`;
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Tailwind class joiner. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');
