import { ArrowRight, MapPin } from 'lucide-react';
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
    <HeroStage photos={photos} products={showcase} locale={locale} dict={dict} promo={<BlackFridayPromo locale={locale} dict={dict} />}>
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

/**
 * BLACK FRIDAY (owner, 11–12 Nov 2026): up to 50% off, in store only, no
 * per-product figures — so this names the sale and sends people to the
 * stores, and no product is marked as discounted. Sits in the hero's right
 * column above the product card; the slim top bar carries the same message
 * on inner pages. Remove both when the sale ends.
 */
function BlackFridayPromo({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const n = dict.notice;
  return (
    <div className="relative overflow-hidden rounded-[3px] bg-ink px-6 py-6 text-canvas shadow-[0_22px_48px_-20px_rgba(22,24,26,0.65)] ring-1 ring-white/10 sm:px-8 sm:py-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(211,18,28,0.55)_0%,rgba(211,18,28,0)_70%)]"
      />
      <p className="relative text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-canvas/70">{n.eyebrow}</p>
      <p className="relative mt-2 font-display text-[2rem] font-semibold uppercase leading-none tracking-[-0.03em] sm:text-[2.5rem]">
        {n.title}
      </p>
      <p className="relative mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 leading-none">
        <span className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-canvas/80">{n.figureLabel}</span>
        <span className="tnum whitespace-nowrap font-display text-[3.5rem] font-semibold tracking-[-0.04em] text-[#ff3b45] sm:text-[4.75rem]">{n.figure}</span>
        <span className="whitespace-nowrap text-[1.0625rem] font-medium">{n.after}</span>
      </p>
      <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <ButtonLink href={href(locale, 'stores')} size="lg">
          {n.cta}
          <ArrowRight className="size-4" strokeWidth={2.2} aria-hidden />
        </ButtonLink>
        <span className="text-[0.9375rem] text-canvas/85">{n.tail}</span>
      </div>
    </div>
  );
}
