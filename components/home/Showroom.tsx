'use client';

import { MapPin, Phone } from 'lucide-react';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { BUSINESS, directionsUrl, mapEmbedUrl } from '@/content/business';
import { telHref, hasHours } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

/**
 * SHOWROOM
 * ========
 * Address, phone, directions and a live map — the four things a local visitor
 * actually came for.
 *
 * OPENING HOURS: rendered only when BUSINESS.hours is verified. Directory
 * listings for appliance shops are frequently months out of date, and a wrong
 * Saturday closing time means a wasted drive and a one-star review. Until the
 * owner confirms, this says "call to confirm" — which is honest and still
 * produces a phone call, the outcome we want anyway.
 *
 * PHOTOGRAPH: the brief asks for a real photograph of the store. None was
 * supplied, so the panel leads with the map rather than a stock storefront that
 * would misrepresent the premises. Drop a real image in at /media/showroom.webp
 * and render it above the map.
 */
export function Showroom({ dict }: { dict: Dictionary; locale: Locale }) {
  const showHours = hasHours();

  return (
    <section className="border-t border-line bg-surface py-20 sm:py-28">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                {dict.showroom.eyebrow}
              </p>
            </Reveal>

            <h2 className="font-display text-display-3 font-medium text-ink">
              <RevealLines lines={[dict.showroom.title]} />
            </h2>

            <Reveal delay={120}>
              <p className="mt-5 max-w-md text-lead text-ink-2">{dict.showroom.body}</p>
            </Reveal>

            <Reveal delay={200}>
              <address className="mt-9 flex flex-col gap-5 not-italic">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-ink-3" strokeWidth={1.6} />
                  <p className="text-[0.9375rem] leading-relaxed text-ink">
                    <span className="font-medium">{BUSINESS.legalName}</span>
                    <br />
                    {BUSINESS.address.street}
                    <br />
                    {BUSINESS.address.city}, {BUSINESS.address.region}{' '}
                    {BUSINESS.address.postalCode}
                  </p>
                </div>

                <a
                  href={telHref()}
                  onClick={() => track({ event: 'call_click', source: 'showroom' })}
                  className="tnum -my-1 inline-flex min-h-11 items-center gap-3 py-1 font-display text-2xl font-medium tracking-[-0.02em] text-ink transition-colors duration-300 hover:text-accent"
                >
                  <Phone aria-hidden className="size-5 shrink-0 text-ink-3" strokeWidth={1.6} />
                  {BUSINESS.phone.display}
                </a>
              </address>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-8 rounded-[3px] border border-line bg-canvas p-5">
                <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
                  {dict.showroom.hoursTitle}
                </h3>
                {showHours ? (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {BUSINESS.hours.value!.map((h) => (
                      <li
                        key={h.day}
                        className="tnum flex justify-between gap-6 text-sm text-ink-2"
                      >
                        <span>{h.day}</span>
                        <span>
                          {h.opens} – {h.closes}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">
                    {dict.showroom.hoursUnknown}
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href={directionsUrl()}
                  external
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  onClick={() => track({ event: 'directions_click', source: 'showroom' })}
                >
                  {dict.common.getDirections}
                </ButtonLink>
                <ButtonLink
                  href={telHref()}
                  external
                  variant="secondary"
                  size="lg"
                  onClick={() => track({ event: 'call_click', source: 'showroom_cta' })}
                >
                  {dict.common.call}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160} className="lg:col-span-7">
            <div className="h-full min-h-[22rem] overflow-hidden border border-line bg-surface-2 lg:min-h-[30rem]">
              <iframe
                title={dict.showroom.mapLabel}
                src={mapEmbedUrl()}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full min-h-[22rem] border-0 lg:min-h-[30rem]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
