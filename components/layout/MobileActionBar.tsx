'use client';

import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS, directionsUrl } from '@/content/business';
import { telHref, whatsappHref, whatsappEnabled } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * PERSISTENT MOBILE ACTION BAR
 * ============================
 * The single highest-value element on this site.
 *
 * Most traffic will arrive from Facebook, Instagram, Google and paid social —
 * a visitor who is already half-decided and holding a phone. This bar means the
 * distance from "any page" to "talking to the store" is one thumb-reach, always,
 * with no scrolling back to a header.
 *
 * Sits above the iOS home indicator via env(safe-area-inset-bottom), and the
 * body reserves --mobile-bar-h so it never covers page content.
 *
 * WhatsApp renders only when a number has been verified in content/business.ts.
 * A dead WhatsApp button on a bar like this loses a real lead every time it is
 * tapped, so the bar adapts to two actions rather than shipping one.
 */
export function MobileActionBar({ dict }: { dict: Dictionary }) {
  const wa = whatsappHref();
  const showWhatsApp = whatsappEnabled() && wa;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] divide-x divide-line">
        <a
          href={telHref()}
          onClick={() => track({ event: 'call_click', source: 'mobile_bar' })}
          className="flex h-[4.25rem] flex-col items-center justify-center gap-1 text-ink active:bg-surface-2"
        >
          <Phone className="size-[1.15rem]" strokeWidth={1.6} />
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em]">
            {dict.mobileBar.call}
          </span>
        </a>

        {showWhatsApp && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track({ event: 'whatsapp_click', source: 'mobile_bar' })}
            className="flex h-[4.25rem] flex-col items-center justify-center gap-1 text-ink active:bg-surface-2"
          >
            <MessageCircle className="size-[1.15rem]" strokeWidth={1.6} />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em]">
              {dict.mobileBar.whatsapp}
            </span>
          </a>
        )}

        <a
          href={directionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track({ event: 'directions_click', source: 'mobile_bar' })}
          className="flex h-[4.25rem] flex-col items-center justify-center gap-1 text-ink active:bg-surface-2"
        >
          <MapPin className="size-[1.15rem]" strokeWidth={1.6} />
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em]">
            {dict.mobileBar.directions}
          </span>
        </a>
      </div>
      <span className="sr-only">{BUSINESS.phone.display}</span>
    </div>
  );
}
