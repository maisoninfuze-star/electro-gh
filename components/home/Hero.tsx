import { MapPin } from 'lucide-react';
import { HeroStage, type HeroPhoto } from './HeroStage';
import type { Product } from '@/lib/catalog/types';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * HERO
 * ====
 * The owner's own photographs of the showroom floor fill the whole hero and
 * rotate; a compact card rotates through REAL stock with real prices. Both
 * are self-evidently the shop: rows of actual machines, and what they cost.
 *
 * Desktop puts the headline over the photograph, on a scrim that keeps it
 * legible whatever the photograph (see HeroStage). On a phone the photograph
 * is a full-width band above the text instead — covering it with a scrim dark
 * enough for body copy would hide the very thing the owner wants shown.
 *
 * The headline block is rendered here, on the server, and passed into the
 * client stage as children: it needs no JavaScript to appear.
 */

/**
 * The owner's showroom photographs (30 Sept 2026). Brightened only — one tone
 * curve on every channel, nothing redrawn — except the first, where the
 * photographer's own reflection in a glass partition (about 50px) was painted
 * out. Alt text lives in the dictionary under hero.shopPhotos, in this order.
 *
 * `focus` picks the horizontal band that survives: the desktop hero is about
 * twice as wide as it is tall, and these are 4:3.
 */
const SHOP_PHOTOS = [
  // The owner picked this one to lead (30 Sept): the wall of front-loaders,
  // the red set at centre-right.
  { src: '/media/shop-laveuses.webp', focus: '58% 48%' },
  { src: '/media/shop-vue-ensemble.webp', focus: '60% 42%' },
  { src: '/media/shop-cuisinieres.webp', focus: '50% 35%' },
  { src: '/media/shop-refrigerateurs.webp', focus: '50% 45%' },
] as const;

export function Hero({
  locale,
  dict,
  showcase = [],
}: {
  locale: Locale;
  dict: Dictionary;
  showcase?: Product[];
}) {
  const photos: HeroPhoto[] = SHOP_PHOTOS.map((p, i) => ({ ...p, alt: dict.hero.shopPhotos[i] }));

  return (
    <HeroStage photos={photos} products={showcase} locale={locale} dict={dict}>
      <h1 className="font-display text-hero font-light text-ink lg:text-canvas">
        <RevealLines lines={[dict.hero.headlineTop]} immediate delay={80} lineClassName="font-light" />
        <RevealLines lines={[dict.hero.headlineBottom]} immediate delay={200} lineClassName="font-semibold" />
      </h1>

      <Reveal delay={380} y={10} immediate>
        <p className="mt-7 max-w-md text-lead text-ink-2 lg:text-canvas">{dict.hero.body}</p>
      </Reveal>

      <Reveal delay={470} y={10} immediate>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={href(locale, 'shop')} size="lg">
            {dict.hero.ctaPrimary}
          </ButtonLink>
          <ButtonLink
            href={href(locale, 'deals')}
            variant="secondary"
            size="lg"
            // Over the photograph the outlined button becomes a solid light one.
            className="lg:border-transparent lg:bg-canvas lg:text-ink lg:hover:border-transparent lg:hover:bg-white"
          >
            {dict.hero.ctaSecondary}
          </ButtonLink>
        </div>
      </Reveal>

      <Reveal delay={560} y={8} immediate>
        <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] uppercase tracking-[0.12em] text-ink-3 lg:text-canvas">
          <MapPin aria-hidden className="size-3.5" strokeWidth={1.75} />
          {dict.hero.trust.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden>·</span>}
              {item}
            </span>
          ))}
        </p>
      </Reveal>
    </HeroStage>
  );
}
