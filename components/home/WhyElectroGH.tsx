import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import { BUSINESS } from '@/content/business';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * WHY ELECTRO GH
 * ==============
 * A horizontal band of numbered claims, not a row of icon cards.
 *
 * Every point is gated on a VERIFIED business fact. "Garantie disponible" only
 * appears because BUSINESS.services.warranty.offered is true — and it says
 * "available", never a duration, because the duration is unverified. Set
 * `financing.offered` to true and a seventh point appears with no code change.
 */
export function WhyElectroGH({ dict }: { dict: Dictionary }) {
  const s = BUSINESS.services;
  const p = dict.why.points;

  // Order matters: price and brand breadth lead, because that is the objection
  // an appliance shopper arrives with.
  const points = [
    { key: 'budget', show: true, ...p.budget },
    { key: 'brands', show: true, ...p.brands },
    { key: 'delivery', show: s.delivery.offered, ...p.delivery },
    { key: 'local', show: true, ...p.local },
    { key: 'guidance', show: true, ...p.guidance },
    { key: 'warranty', show: s.warranty.offered, ...p.warranty },
  ].filter((x) => x.show);

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow={dict.why.eyebrow}
          title={dict.why.title}
          body={dict.why.body}
        />

        <div className="mt-14 grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => (
            <Reveal key={point.key} delay={(i % 3) * 80} className="bg-canvas">
              <div className="flex h-full flex-col gap-3 py-8 pr-6 sm:py-10">
                <span className="tnum font-display text-xs font-medium tracking-[0.14em] text-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-lg font-medium leading-snug tracking-[-0.015em] text-ink sm:text-xl">
                  {point.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-ink-2">{point.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
