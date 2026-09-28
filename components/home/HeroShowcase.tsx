'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/catalog/types';
import { CATEGORIES } from '@/lib/catalog/categories';
import { href, type Locale } from '@/lib/i18n/config';
import { formatPrice, cx } from '@/lib/format';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * HERO SHOWCASE — real stock, rotating.
 *
 * The hero used to be a stock kitchen. This puts the shop's actual machines
 * above the fold with their real prices, which is the single strongest thing
 * this page can say: these exist, here is what they cost, they change.
 *
 * Every product photograph in this catalogue sits on PURE WHITE, so the stage
 * is white where the photograph is and warms only below it. The appliance
 * therefore appears to stand on a lit backdrop with no card and no visible
 * rectangle, without compositing tricks.
 *
 * An earlier version used `mix-blend-multiply` to punch the white out over a
 * warm gradient. It looked the same and cost more than it was worth: blending
 * only applies within a stacking context (the slide's own transform made one,
 * so the gradient had to be duplicated per slide), and it reliably killed the
 * renderer in headless Chrome under --disable-gpu, which meant losing
 * responsive QA coverage of the home page. Matching the backdrop to the
 * photograph achieves the same picture with plain paint.
 *
 * Motion discipline
 * -----------------
 * · one slide at a time, crossfade plus a 14px rise — no sliding carousel
 * · pauses on hover, on keyboard focus, and whenever the tab is hidden, so it
 *   never animates to nobody
 * · prefers-reduced-motion: no auto-advance and no transition; the dots still
 *   work, so the content stays reachable
 * · the frame is a fixed aspect box and every slide is absolutely positioned,
 *   so rotation can never shift the page
 *
 * Only a WINDOW of slides is mounted — the active one and its two neighbours.
 * Mounting all six meant six full-size photographs decoding on first paint,
 * which costs mobile LCP for five images nobody has seen yet (an
 * opacity-0 <img> is still fetched and decoded). Three keeps the crossfade
 * seamless and the incoming slide warm.
 */
const INTERVAL = 5000;

export function HeroShowcase({
  products,
  locale,
  dict,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Don't animate to an empty room: pause while the tab is in the background.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (reduced || paused || products.length < 2) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % products.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced, paused, products.length]);

  const go = useCallback((n: number) => setI(((n % products.length) + products.length) % products.length), [products.length]);

  if (!products.length) return null;

  return (
    <div
      className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-surface-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={dict.hero.showcaseLabel}
    >
      {products.map((p, n) => {
        const cat = CATEGORIES[p.category];
        const url = href(locale, cat.route, p.slug);
        const active = n === i;
        const last = products.length - 1;
        const near =
          n === i ||
          n === (i + 1) % products.length ||
          n === (i + last) % products.length;
        if (!near) return null;
        return (
          <div
            key={p.id}
            className={cx(
              'absolute inset-0 flex flex-col',
              'bg-white',
              reduced ? '' : 'transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)]',
              active ? 'z-10 translate-y-0 opacity-100' : 'pointer-events-none z-0 translate-y-3.5 opacity-0',
            )}
            aria-hidden={!active}
          >
            <Link href={url} className="group flex h-full w-full flex-col" tabIndex={active ? 0 : -1}>
              {/* Pure white behind the photograph, which is itself on pure
                  white — so the photo's own rectangle has no edge to show. */}
              <div className="relative min-h-0 flex-1 bg-white">
                <Image
                  src={p.images[0].src}
                  alt={p.images[0].alt}
                  fill
                  priority={n === 0}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-contain object-bottom p-5 pb-1 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] sm:p-8 sm:pb-2 lg:p-10 lg:pb-2"
                />
              </div>

              {/* Caption rail — brand, name, price. The commercial payload. */}
              {/* The warm band starts only where the picture ends, reading as a
                  floor the appliance stands on rather than a seam. */}
              <div className="relative shrink-0 bg-[linear-gradient(to_bottom,#ffffff_0%,#faf7f3_38%,#efeae3_100%)] px-5 pb-12 pt-3 sm:px-8 sm:pb-14 lg:px-12">
                <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                  {[p.brand, cat.label[locale]].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-[1.0625rem] font-medium leading-snug text-ink sm:text-[1.1875rem]">
                    {p.name[locale]}
                  </h2>
                  <span className="tnum font-display text-[1.25rem] font-semibold text-accent sm:text-[1.375rem]">
                    {formatPrice(p.price, locale)}
                  </span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors group-hover:text-accent">
                  {dict.common.viewProduct}
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                    strokeWidth={1.9}
                  />
                </span>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Dots — the only control, and a live progress cue */}
      {products.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 px-5 pb-5 sm:px-8 lg:px-12">
          {products.map((p, n) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(n)}
              aria-label={`${dict.hero.showcaseGoTo} ${n + 1}`}
              aria-current={n === i}
              // 44px tap target without changing how a 3px bar looks.
              className="group/dot -my-5 flex h-11 items-center py-5"
            >
              <span
                className={cx(
                  'block h-[3px] rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
                  n === i ? 'w-8 bg-accent' : 'w-3 bg-line-strong group-hover/dot:bg-ink-3',
                )}
              />
            </button>
          ))}
          <span className="tnum ml-auto text-[0.6875rem] tabular-nums text-ink-3">
            {String(i + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
