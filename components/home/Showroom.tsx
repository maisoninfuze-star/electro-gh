'use client';

import { ArrowRight } from 'lucide-react';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { StoreCard } from '@/components/layout/StoreCard';
import { STORES } from '@/content/business';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import Link from 'next/link';

/**
 * NOS MAGASINS (home)
 * ===================
 * Two stores, two cards, each complete: map, address, phone, hours, directions.
 * A local visitor arriving from an ad wants exactly these four things for the
 * store nearest them, and with two locations the honest answer is to show
 * both rather than guess.
 *
 * PHOTOGRAPHS: brand/storefront-sign.jpg is the Montréal store, but no Laval
 * photograph exists yet. Rather than pair one real photo with one placeholder
 * — which would read as "the real store and the other one" — both cards lead
 * with the map until both photographs are in hand.
 */
export function Showroom({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="border-t border-line bg-surface py-20 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <Reveal>
            <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
              {dict.showroom.eyebrow}
            </p>
          </Reveal>
          <h2 className="font-display text-display-3 font-medium text-ink">
            <RevealLines lines={[dict.showroom.title]} />
          </h2>
          <Reveal delay={120}>
            <p className="mt-5 max-w-xl text-lead text-ink-2">{dict.showroom.body}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {STORES.map((s, i) => (
            <Reveal key={s.id} delay={160 + i * 90}>
              <StoreCard store={s} dict={dict} source="showroom" className="h-full" />
            </Reveal>
          ))}
        </div>

        <Reveal delay={320}>
          <Link
            href={href(locale, 'stores')}
            className="group mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-ink transition-colors hover:text-accent"
          >
            {dict.showroom.allStores}
            <ArrowRight
              className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
