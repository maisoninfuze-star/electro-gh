import Link from 'next/link';
import { href } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { cx } from '@/lib/format';

/**
 * WORDMARK — PLACEHOLDER IDENTITY
 * ===============================
 * No logo file has been supplied. Rather than a grey box, this is a considered
 * typographic lockup: "ELECTRO" in light weight, "GH" in semibold, separated by
 * a hairline rule. It reads as a deliberate identity at any size and prints.
 *
 * WHEN THE REAL LOGO ARRIVES: replace the inner markup with an <Image> (or
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
        // py-3 gives the 17px wordmark a 44px tap target without changing
        // how it looks. -my-3 keeps it from growing the header's height.
        'group -my-3.5 inline-flex items-baseline gap-[0.45rem] py-3.5 font-display leading-none',
        onDark ? 'text-canvas' : 'text-ink',
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
          onDark ? 'bg-canvas/35' : 'bg-line-strong group-hover:bg-accent',
        )}
      />
      <span className="text-[1.0625rem] font-semibold uppercase tracking-[0.14em] sm:text-[1.125rem]">
        GH
      </span>
    </Link>
  );
}
