'use client';

/**
 * CONVERSION TRACKING
 * ===================
 * One typed funnel for every commercially meaningful action, pushed to a
 * `dataLayer`. Nothing is loaded, no pixel fires, and no network request is
 * made until a tag manager is actually installed — so this costs zero bytes
 * of third-party JS today while making the wiring a one-line change later.
 *
 * To go live, add ONE of:
 *   · Google Tag Manager container   → reads window.dataLayer as-is
 *   · GA4 via gtag.js                → map each event name in GTM
 *   · Meta Pixel + Conversions API   → map call/whatsapp/inquiry to Lead
 *   · Google Ads                     → import call_click + product_inquiry
 *   · Google Merchant Center         → uses the Product/Offer schema already
 *                                      emitted on every product page
 *   · GoHighLevel CRM                → post lead_submit server-side
 *
 * Event names are snake_case and stable. Do not rename them once ads are
 * running against them.
 */

export type AnalyticsEvent =
  | { event: 'call_click'; source: string }
  | { event: 'whatsapp_click'; source: string; product_id?: string }
  | { event: 'directions_click'; source: string }
  | { event: 'product_view'; product_id: string; brand: string; category: string; price: number }
  | { event: 'product_inquiry'; product_id: string; method: 'call' | 'whatsapp' | 'form' }
  | { event: 'category_view'; category: string; result_count: number }
  | { event: 'search'; query: string; result_count: number }
  | { event: 'filter_used'; facet: string; value: string }
  | { event: 'lead_submit'; form: string };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(payload: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ ...payload, ts: Date.now() });

  if (process.env.NODE_ENV === 'development') {
    // Visible in dev so the funnel can be verified before any tag is installed.
    console.debug('[analytics]', payload.event, payload);
  }
}
