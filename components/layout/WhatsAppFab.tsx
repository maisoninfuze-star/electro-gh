'use client';

import { MessageCircle } from 'lucide-react';
import { whatsappHref, whatsappEnabled } from '@/lib/contact';
import { track } from '@/lib/analytics/events';

/**
 * Floating WhatsApp button — desktop only, because on mobile the persistent
 * action bar already carries WhatsApp and two floating chat affordances on one
 * small screen is clutter, not convenience.
 *
 * Renders nothing until a WhatsApp number is verified in content/business.ts.
 */
export function WhatsAppFab({ label }: { label: string }) {
  const wa = whatsappHref();
  if (!whatsappEnabled() || !wa) return null;

  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ event: 'whatsapp_click', source: 'fab' })}
      aria-label={label}
      className="fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-105 lg:flex"
    >
      <MessageCircle className="size-6" strokeWidth={1.9} />
    </a>
  );
}
