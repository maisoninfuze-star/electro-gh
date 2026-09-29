import { Phone } from 'lucide-react';
import { StoreActionButton } from '@/components/layout/StoreChooser';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * SITE NOTICE
 * ===========
 * One line above the header, on every page. It scrolls away with the page;
 * the header below stays sticky, so --nav-h offsets are unaffected.
 *
 * Current message (owner, 29 Sept 2026): Fisher & Paykel appliances are
 * coming in — call to check what is in store. No models, no prices: those are
 * confirmed on the phone. The call goes through the two-store chooser because
 * the arrivals aren't tied to one store.
 */
export function NoticeBar({ dict }: { dict: Dictionary }) {
  return (
    <div className="bg-ink text-canvas">
      <div className="container-page py-1 text-center text-[0.8125rem] leading-snug sm:text-sm">
        {dict.notice.before}
        <strong className="font-semibold">{dict.notice.brand}</strong>
        {dict.notice.after}{' '}
        <StoreActionButton
          mode="call"
          source="notice_bar"
          dict={dict}
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap align-middle font-medium underline decoration-canvas/50 underline-offset-4 hover:decoration-canvas"
        >
          <Phone className="size-3.5" strokeWidth={2} aria-hidden />
          {dict.notice.cta}
        </StoreActionButton>
      </div>
    </div>
  );
}
