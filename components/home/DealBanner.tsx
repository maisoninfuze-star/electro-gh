import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * LIQUIDATION BANNER
 * ==================
 * High impact without a single screaming graphic.
 *
 * The whole effect comes from three restrained choices: near-black ground,
 * very large light-weight display type, and one warm bronze rule. No red, no
 * starbursts, no percentage explosions. Savings read as considered value —
 * which is precisely the repositioning the brief is asking for.
 */
export function DealBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-ink py-24 text-canvas sm:py-32">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <span
                aria-hidden
                className="mb-8 block h-px w-16 bg-signal"
              />
            </Reveal>

            <h2 className="font-display text-display-2 font-light text-canvas">
              <RevealLines lines={[dict.dealBanner.headlineTop]} lineClassName="font-light" />
              <RevealLines
                lines={[dict.dealBanner.headlineBottom]}
                delay={90}
                lineClassName="font-semibold"
              />
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={200}>
              <p className="max-w-md text-lead text-canvas/70">{dict.dealBanner.body}</p>
            </Reveal>
            <Reveal delay={300}>
              <ButtonLink
                href={href(locale, 'deals')}
                variant="onDark"
                size="lg"
                className="mt-8"
              >
                {dict.dealBanner.cta}
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
