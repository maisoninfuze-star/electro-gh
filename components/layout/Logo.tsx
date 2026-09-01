import Link from 'next/link';
import { href } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { cx } from '@/lib/format';

/**
 * WORDMARK
 * ========
 * Typographic lockup drawn from the storefront sign
 * (brand/storefront-sign.jpg): the name set in the shop's red, with "GH"
 * carrying the weight. The sign sets the whole name in red on white; this keeps
 * that, adds a hairline to separate the two halves, and holds the red a few
 * steps deeper so it passes contrast at nav size.
 *
 * WHEN A REAL LOGO FILE ARRIVES: replace the inner markup with an <Image> (or
 * inline SVG) and keep the same outer <Link> and sizing props. Nothing else in
 * the codebase references the wordmark, so this is a one-file swap.
 */
export function Logo({
  locale,
  className,
  onDark = false,
}: {
  locale: Locale;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href={href(locale, 'home')}
      aria-label="Electro GH"
      className={cx(
        // py-3.5 gives the 17px wordmark a 44px tap target without changing
        // how it looks. -my-3.5 keeps it from growing the header's height.
        'group -my-3.5 inline-flex items-baseline gap-[0.45rem] py-3.5 font-display leading-none',
        onDark ? 'text-canvas' : 'text-accent',
        className,
      )}
    >
      <span className="text-[1.0625rem] font-light uppercase tracking-[0.22em] sm:text-[1.125rem]">
        Electro
      </span>
      <span
        aria-hidden
        className={cx(
          'h-[0.9em] w-px self-center transition-colors duration-500',
          onDark ? 'bg-canvas/35' : 'bg-accent/35 group-hover:bg-accent',
        )}
      />
      <span className="text-[1.0625rem] font-semibold uppercase tracking-[0.14em] sm:text-[1.125rem]">
        GH
      </span>
    </Link>
  );
}
