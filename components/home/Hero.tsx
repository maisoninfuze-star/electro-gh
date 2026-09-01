import { MapPin } from 'lucide-react';
import { HeroMedia } from './HeroMedia';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * HERO
 * ====
 * Composition: an editorial split rather than text-over-photograph.
 *
 * Why not an overlay? The owner will eventually swap this image for their own
 * showroom photography, and text-on-image only stays legible for the one photo
 * it was tuned against. A dedicated type panel means any future image works,
 * contrast never degrades, and the headline keeps full AA contrast on canvas.
 *
 * On mobile the image is capped at a 4:5 crop instead of filling the screen —
 * a full-height mobile hero pushes the actual product one whole swipe away,
 * which is exactly the wrong trade for a store people arrive at from Instagram
 * ready to buy.
 */
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative border-b border-line bg-canvas">
      <div className="grid lg:grid-cols-12">
        {/* Media — first on mobile, right-hand bleed on desktop */}
        <div className="relative order-1 aspect-[4/3] w-full sm:aspect-[16/10] lg:order-2 lg:col-span-6 lg:aspect-auto lg:min-h-[min(82vh,46rem)]">
          <HeroMedia
            src="/media/hero-kitchen.webp"
            alt="Cuisine contemporaine avec électroménagers en acier inoxydable"
          />
        </div>

        {/* Type panel */}
        <div className="order-2 flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-12 lg:order-1 lg:col-span-6 lg:py-20 lg:pl-[max(2.5rem,calc((100vw-90rem)/2+4rem))] lg:pr-14">
          <h1 className="font-display text-hero font-light text-ink">
            <RevealLines
              lines={[dict.hero.headlineTop]}
              immediate
              delay={80}
              lineClassName="font-light"
            />
            <RevealLines
              lines={[dict.hero.headlineBottom]}
              immediate
              delay={200}
              lineClassName="font-semibold"
            />
          </h1>

          <Reveal delay={380} y={10} immediate>
            <p className="mt-7 max-w-md text-lead text-ink-2">{dict.hero.body}</p>
          </Reveal>

          <Reveal delay={470} y={10} immediate>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={href(locale, 'shop')} size="lg">
                {dict.hero.ctaPrimary}
              </ButtonLink>
              <ButtonLink href={href(locale, 'deals')} variant="secondary" size="lg">
                {dict.hero.ctaSecondary}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={560} y={8} immediate>
            <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] uppercase tracking-[0.12em] text-ink-3">
              <MapPin aria-hidden className="size-3.5" strokeWidth={1.75} />
              {dict.hero.trust.map((item, i) => (
                <span key={item} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="text-ink-3">·</span>}
                  {item}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
