import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * SITE NOTICE — Black Friday banner
 * =================================
 * Above the header on every page; it scrolls away with the page and the
 * header below stays sticky, so --nav-h offsets are unaffected.
 *
 * Owner (11 Nov 2026): up to 50% off, in store only, no per-product figures.
 * So the banner says exactly that and sends people to the stores page; no
 * product is marked as discounted.
 *
 * Loud on purpose, within the system: near-black ground, the brand red as a
 * glowing bar and on the "50 %" figure, display type for "Black Friday", one
 * solid red button. The figure's red (#ff3b45) is lighter than the accent
 * token so it clears AA on the dark ground at display size.
 */
export function NoticeBar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const n = dict.notice;
  return (
    <div className="relative overflow-hidden bg-ink text-canvas">
      {/* red glow behind the figure, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[48rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(211,18,28,0.42)_0%,rgba(211,18,28,0)_65%)]"
      />
      <div className="container-page relative flex flex-col items-center gap-x-8 gap-y-3 py-4 text-center sm:flex-row sm:justify-center sm:py-3 sm:text-left">
        <div className="flex flex-col items-center gap-x-5 gap-y-1 sm:flex-row">
          <div className="leading-none">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-canvas/70">{n.eyebrow}</p>
            <p className="mt-1 whitespace-nowrap font-display text-[1.5rem] font-semibold uppercase tracking-[-0.02em] sm:text-[1.75rem]">{n.title}</p>
          </div>
          <div className="flex items-baseline gap-2 whitespace-nowrap leading-none">
            <span className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-canvas/80">{n.figureLabel}</span>
            <span className="tnum font-display text-[2.5rem] font-semibold tracking-[-0.03em] text-[#ff3b45] sm:text-[3rem]">{n.figure}</span>
            <span className="text-[0.9375rem] font-medium">{n.after}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[0.9375rem] text-canvas/85 sm:inline">{n.tail}</span>
          <Link
            href={href(locale, 'stores')}
            className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-accent px-5 text-[0.875rem] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            {n.cta}
            <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
