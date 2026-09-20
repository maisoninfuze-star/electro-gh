'use client';

import { useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { ConditionBadge, AvailabilityTag } from '@/components/ui/Badges';
import type { Product } from '@/lib/catalog/types';
import { CATEGORIES } from '@/lib/catalog/categories';
import { telHref, whatsappHref, whatsappEnabled } from '@/lib/contact';
import { storeById } from '@/content/business';
import { StoreActionButton } from '@/components/layout/StoreChooser';
import { SITE_CONFIG } from '@/content/site-config';
import { track } from '@/lib/analytics/events';
import { t } from '@/lib/i18n/interpolate';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * BUY BOX
 * =======
 * The conversion surface. Brand, title, model, condition, price, availability,
 * then one unmistakable primary action.
 *
 * WHATSAPP PREFILL
 * ----------------
 * The message names the exact product and model, so a visitor arriving from an
 * Instagram post lands in a conversation the store can answer immediately
 * instead of "hi, is the fridge still there?". This is the whole point of the
 * WhatsApp integration and it only works if the prefill is specific.
 *
 * The button renders only when a WhatsApp number is verified.
 *
 * TWO STORES
 * ----------
 * A used appliance is one physical object in one place. When the feed says
 * which store holds it (`product.storeId`), the call button dials that store
 * and shows its city and number. When it doesn't, the button opens the
 * two-store chooser rather than dialling a default — the wrong store cannot
 * confirm availability of a unit it does not have.
 */
export function ProductBuyBox({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const category = CATEGORIES[product.category];

  const productLabel = [product.brand, product.name[locale], product.model]
    .filter(Boolean)
    .join(' ');

  const waMessage = t(dict.product.inquirePrefill, { product: productLabel });
  const wa = whatsappHref(waMessage);

  // Fires once per product view — the top of the funnel for retargeting.
  useEffect(() => {
    track({
      event: 'product_view',
      product_id: product.id,
      brand: product.brand,
      category: product.category,
      price: product.price,
    });
  }, [product.id, product.brand, product.category, product.price]);

  return (
    <div className="flex flex-col">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
        {product.brand} · {category.label[locale]}
      </p>

      <h1 className="mt-3 font-display text-display-3 font-medium text-ink">
        {product.name[locale]}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <ConditionBadge condition={product.condition} dict={dict} />
        <AvailabilityTag status={product.inventoryStatus} dict={dict} />
        {product.model && (
          <span className="tnum text-xs text-ink-3">
            {dict.product.model} {product.model}
          </span>
        )}
        <span className="tnum text-xs text-ink-3">
          {dict.product.sku} {product.sku}
        </span>
      </div>

      <div className="mt-7 border-y border-line py-6">
        <Price product={product} locale={locale} dict={dict} size="lg" />
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {(() => {
          const label =
            SITE_CONFIG.primaryProductAction === 'reserve'
              ? dict.product.ctaReserve
              : dict.product.ctaCall;
          const store = product.storeId ? storeById(product.storeId) : null;
          const onInquiry = () =>
            track({ event: 'product_inquiry', product_id: product.id, method: 'call' });

          if (store) {
            return (
              <ButtonLink
                href={telHref(store)}
                external
                size="lg"
                onClick={() => {
                  onInquiry();
                  track({ event: 'call_click', source: 'product', store: store.id });
                }}
              >
                <Phone className="size-4" strokeWidth={1.75} />
                {label}
                <span className="tnum ml-1 opacity-80">
                  {store.city} · {store.phone.display}
                </span>
              </ButtonLink>
            );
          }
          return (
            <StoreActionButton
              mode="call"
              source="product"
              dict={dict}
              onClickCapture={onInquiry}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[3px] bg-accent px-8 text-[0.9375rem] font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.985]"
            >
              <Phone className="size-4" strokeWidth={1.75} />
              {label}
            </StoreActionButton>
          );
        })()}

        {whatsappEnabled() && wa && (
          <ButtonLink
            href={wa}
            external
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
            onClick={() => {
              track({ event: 'whatsapp_click', source: 'product', product_id: product.id });
              track({ event: 'product_inquiry', product_id: product.id, method: 'whatsapp' });
            }}
          >
            <MessageCircle className="size-4" strokeWidth={1.75} />
            {dict.product.ctaWhatsapp}
          </ButtonLink>
        )}
      </div>

      <div className="mt-6 border-l-2 border-accent bg-accent-soft px-4 py-4">
        <p className="text-sm font-medium text-ink">{dict.product.reassuranceTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          {dict.product.reassuranceBody}
        </p>
      </div>
    </div>
  );
}
