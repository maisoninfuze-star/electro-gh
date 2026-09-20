'use client';

import { MapPin, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { directionsUrl, mapEmbedUrl, type Store } from '@/content/business';
import { telHref, hasHours } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cx } from '@/lib/format';
import { t } from '@/lib/i18n/interpolate';

/**
 * ONE STORE, COMPLETE
 * ===================
 * Map, address, phone, hours, directions — everything a local visitor needs
 * for one location, so the two-store layout is just this twice.
 *
 * OPENING HOURS render only when that store's `hours` is verified. Directory
 * listings for appliance shops are frequently months out of date, and a wrong
 * Saturday closing time means a wasted drive and a one-star review. Until the
 * owner confirms, this says "call to confirm" — honest, and it still produces
 * a phone call, which is the outcome we want anyway.
 *
 * Both actions are store-specific, so they are plain links here — no chooser
 * needed when the card already says which store it is.
 */
export function StoreCard({
  store,
  dict,
  source,
  mapHeight = 'md',
  className,
}: {
  store: Store;
  dict: Dictionary;
  source: string;
  mapHeight?: 'md' | 'lg';
  className?: string;
}) {
  const showHours = hasHours(store);
  const days = dict.pages.stores;

  return (
    <article className={cx('flex flex-col overflow-hidden border border-line bg-canvas', className)}>
      <div
        className={cx(
          'relative w-full bg-surface-2',
          mapHeight === 'lg' ? 'aspect-[4/3] lg:aspect-[16/10]' : 'aspect-[16/10]',
        )}
      >
        <iframe
          title={t(days.mapLabel, { city: store.city })}
          src={mapEmbedUrl(store)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">
          {store.city}
        </h3>

        <address className="mt-4 flex flex-col gap-3 not-italic">
          <div className="flex items-start gap-3">
            <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-ink-3" strokeWidth={1.6} />
            <p className="text-[0.9375rem] leading-relaxed text-ink">
              {store.address.street}
              <br />
              {store.address.city}, {store.address.region} {store.address.postalCode}
            </p>
          </div>
          <a
            href={telHref(store)}
            onClick={() => track({ event: 'call_click', source, store: store.id })}
            className="tnum -my-1 inline-flex min-h-11 items-center gap-3 py-1 font-display text-[1.375rem] font-medium tracking-[-0.02em] text-ink transition-colors duration-300 hover:text-accent"
          >
            <Phone aria-hidden className="size-[1.1rem] shrink-0 text-ink-3" strokeWidth={1.6} />
            {store.phone.display}
          </a>
        </address>

        <div className="mt-5 border-t border-line pt-4">
          <h4 className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
            {days.hoursTitle}
          </h4>
          {showHours ? (
            <ul className="mt-2 flex flex-col gap-1">
              {store.hours.value!.map((h) => (
                <li key={h.day} className="tnum flex justify-between gap-6 text-sm text-ink-2">
                  <span>{h.day}</span>
                  <span>
                    {h.opens} – {h.closes}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{days.hoursUnknown}</p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <ButtonLink
            href={directionsUrl(store)}
            external
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
            onClick={() => track({ event: 'directions_click', source, store: store.id })}
          >
            {days.directions}
          </ButtonLink>
          <ButtonLink
            href={telHref(store)}
            external
            variant="secondary"
            className="flex-1"
            onClick={() => track({ event: 'call_click', source: `${source}_cta`, store: store.id })}
          >
            {dict.common.call}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
