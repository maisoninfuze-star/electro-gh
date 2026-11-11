import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * SITE NOTICE
 * ===========
 * One line above the header, on every page. It scrolls away with the page;
 * the header below stays sticky, so --nav-h offsets are unaffected.
 *
 * Current message (owner, 11 Nov 2026): Black Friday sale, up to 50% off in
 * store. The discount is in-store only and the owner gave no per-product
 * figures, so the bar says exactly that and sends people to the stores page
 * — it does not mark any product as discounted. The brand red (the accent
 * token, AA on white text) is the loudest the site gets; no starbursts.
 *
 * Previous message (29 Sept – 11 Nov): Fisher & Paykel arrivals, call to check.
 */
export function NoticeBar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <div className="bg-accent text-accent-ink">
      <div className="container-page py-1 text-center text-[0.8125rem] leading-snug sm:text-sm">
        {dict.notice.before}
        <strong className="font-semibold">{dict.notice.brand}</strong>
        {dict.notice.after}{' '}
        <Link
          href={href(locale, 'stores')}
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap align-middle font-medium underline decoration-accent-ink/60 underline-offset-4 hover:decoration-accent-ink"
        >
          <MapPin className="size-3.5" strokeWidth={2} aria-hidden />
          {dict.notice.cta}
        </Link>
      </div>
    </div>
  );
}
