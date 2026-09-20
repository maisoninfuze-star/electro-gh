'use client';

import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { InfoPageHeader } from './InfoPageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { BUSINESS, STORES } from '@/content/business';
import { mailtoHref, telHref, whatsappEnabled, whatsappHref } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * NOUS JOINDRE
 * ============
 * Every channel the business actually has, each one a real link: both store
 * phones, the email, WhatsApp when verified, and the two addresses.
 *
 * There is deliberately no contact FORM here yet. A form needs somewhere to
 * send its submissions; without an email relay or the GoHighLevel webhook
 * configured, a form is a box that swallows leads. When that integration
 * exists, add the form as a fourth block and fire `lead_submit` from it — the
 * event is already typed in lib/analytics/events.ts.
 */
export function ContactPage({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const page = dict.pages.contact;
  const mail = mailtoHref();
  const wa = whatsappHref();

  const block = 'flex flex-col border border-line bg-surface p-6 sm:p-8';
  const h2 = 'text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3';

  return (
    <>
      <InfoPageHeader
        locale={locale}
        routeId="contact"
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
      />
        <section className="py-12 sm:py-20">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Phones — the primary channel, so it takes the width */}
              <Reveal className="lg:col-span-7">
                <div className={block}>
                  <h2 className={h2}>{page.phones}</h2>
                  <ul className="mt-5 divide-y divide-line">
                    {STORES.map((s) => (
                      <li key={s.id}>
                        <a
                          href={telHref(s)}
                          onClick={() => track({ event: 'call_click', source: 'contact_page', store: s.id })}
                          className="group flex min-h-[4.5rem] items-center gap-4 py-3 transition-colors hover:text-accent"
                        >
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                            <Phone className="size-[1.15rem]" strokeWidth={1.7} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[1.125rem] font-semibold text-ink group-hover:text-accent">
                              {s.city}
                            </span>
                            <span className="block truncate text-sm text-ink-2">{s.address.street}</span>
                          </span>
                          <span className="tnum shrink-0 font-display text-[1.25rem] font-medium tracking-[-0.02em] text-ink group-hover:text-accent">
                            {s.phone.display}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {whatsappEnabled() && wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track({ event: 'whatsapp_click', source: 'contact_page' })}
                      className="mt-4 inline-flex min-h-12 items-center gap-2.5 self-start rounded-[3px] border border-line-strong px-5 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink"
                    >
                      <MessageCircle className="size-4" strokeWidth={1.7} />
                      {dict.common.whatsapp}
                    </a>
                  )}
                </div>
              </Reveal>

              <div className="grid gap-6 lg:col-span-5">
                {/* Email */}
                {mail && (
                  <Reveal delay={100}>
                    <div className={block}>
                      <h2 className={h2}>{page.emailTitle}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-ink-2">{page.emailBody}</p>
                      <a
                        href={mail}
                        onClick={() => track({ event: 'email_click', source: 'contact_page' })}
                        className="mt-4 inline-flex min-h-11 items-center gap-2.5 self-start font-display text-[1.0625rem] font-medium text-ink transition-colors hover:text-accent"
                      >
                        <Mail className="size-[1.1rem]" strokeWidth={1.6} />
                        {BUSINESS.email.value}
                      </a>
                    </div>
                  </Reveal>
                )}

                {/* Visit */}
                <Reveal delay={180}>
                  <div className={block}>
                    <h2 className={h2}>{page.visit}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-2">{page.visitBody}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {STORES.map((s) => (
                        <li key={s.id} className="flex items-start gap-2.5 text-sm text-ink">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.6} />
                          <span>
                            <span className="font-medium">{s.city}</span> · {s.address.street}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={href(locale, 'stores')}
                      className="group mt-5 inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-medium text-ink transition-colors hover:text-accent"
                    >
                      {page.visitCta}
                      <ArrowRight
                        className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Buyback — printed on the logo, so it earns a line here */}
            {BUSINESS.services.buyback.offered && (
              <Reveal delay={260}>
                <div className="mt-6 border-l-2 border-accent bg-accent-soft px-6 py-6 sm:px-8">
                  <h2 className="font-display text-[1.0625rem] font-semibold text-ink">{page.buybackTitle}</h2>
                  <p className="mt-1.5 max-w-prose text-[0.9375rem] leading-relaxed text-ink-2">{page.buybackBody}</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
    </>
  );
}
