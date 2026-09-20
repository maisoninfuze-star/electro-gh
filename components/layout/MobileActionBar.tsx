'use client';

import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { whatsappHref, whatsappEnabled } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { StoreActionButton } from './StoreChooser';

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
 * With two stores, APPELER and ITINÉRAIRE open the <StoreChooser> rather than
 * dialling or routing to a default location: one extra tap, and the customer
 * reaches the store they meant instead of the one that happened to be first.
 *
 * WhatsApp renders only when a number has been verified in content/business.ts.
 * A dead WhatsApp button on a bar like this loses a real lead every time it is
 * tapped, so the bar adapts to two actions rather than shipping one.
 */
const cell =
  'flex h-[4.25rem] w-full flex-col items-center justify-center gap-1 text-ink active:bg-surface-2';
const label = 'text-[0.6875rem] font-medium uppercase tracking-[0.1em]';

export function MobileActionBar({ dict }: { dict: Dictionary }) {
  const wa = whatsappHref();
  const showWhatsApp = whatsappEnabled() && wa;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] divide-x divide-line">
        <StoreActionButton mode="call" source="mobile_bar" dict={dict} className={cell}>
          <Phone className="size-[1.15rem]" strokeWidth={1.6} />
          <span className={label}>{dict.mobileBar.call}</span>
        </StoreActionButton>

        {showWhatsApp && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track({ event: 'whatsapp_click', source: 'mobile_bar' })}
            className={cell}
          >
            <MessageCircle className="size-[1.15rem]" strokeWidth={1.6} />
            <span className={label}>{dict.mobileBar.whatsapp}</span>
          </a>
        )}

        <StoreActionButton mode="directions" source="mobile_bar" dict={dict} className={cell}>
          <MapPin className="size-[1.15rem]" strokeWidth={1.6} />
          <span className={label}>{dict.mobileBar.directions}</span>
        </StoreActionButton>
      </div>
    </div>
  );
}
