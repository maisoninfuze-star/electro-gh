'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  LOCALES,
  ROUTE_SLUGS,
  isLocale,
  routeIdFromSlug,
  type Locale,
} from '@/lib/i18n/config';
import { cx } from '@/lib/format';

/**
 * FR / EN switch.
 *
 * Translates the CURRENT url rather than dumping the visitor on the homepage —
 * if you are looking at /refrigerateurs you land on /en/refrigerators, which is
 * the difference between a language toggle people use and one they don't.
 *
 * Product slugs are shared across locales (one canonical slug per unit), so the
 * trailing segment is carried through untouched. That keeps a single URL per
 * product for Merchant Center and avoids 404s when inventory copy is edited.
 */
export function LocaleSwitch({
  locale,
  label,
  onDark = false,
  className,
}: {
  locale: Locale;
  label: string;
  onDark?: boolean;
  className?: string;
}) {
  const pathname = usePathname() || '/';
  const other = LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE;

  return (
    <Link
      href={translatePath(pathname, locale, other)}
      hrefLang={other}
      lang={other}
      /**
       * No prefetch. On an unknown URL the translated path is passed through
       * verbatim (see translatePath), so prefetching would fire a request for a
       * page we already know 404s — on the 404 page itself, every time. The
       * toggle is a single deliberate click; it does not need the head start.
       */
      prefetch={false}
      className={cx(
        'inline-flex min-h-11 items-center px-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors duration-300',
        onDark ? 'text-canvas/70 hover:text-canvas' : 'text-ink-2 hover:text-ink',
        className,
      )}
    >
      {label}
    </Link>
  );
}

/** Exported for tests: /refrigerateurs + fr→en  ⇒  /en/refrigerators */
export function translatePath(pathname: string, from: Locale, to: Locale): string {
  const segments = pathname.split('/').filter(Boolean);

  // Drop an explicit locale prefix if present.
  if (segments.length && isLocale(segments[0])) segments.shift();

  const [sectionSlug, ...rest] = segments;

  let translatedSection = '';
  if (sectionSlug) {
    const routeId = routeIdFromSlug(from, sectionSlug);
    // An unknown segment is passed through verbatim rather than silently
    // dropped — better a 404 in the target language than a wrong page.
    translatedSection = routeId ? ROUTE_SLUGS[routeId][to] : sectionSlug;
  }

  const parts = [to === DEFAULT_LOCALE ? '' : to, translatedSection, ...rest].filter(Boolean);
  return '/' + parts.join('/');
}
