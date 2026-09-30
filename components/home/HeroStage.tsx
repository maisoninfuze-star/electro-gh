'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/catalog/types';
import { CATEGORIES } from '@/lib/catalog/categories';
import { href, type Locale } from '@/lib/i18n/config';
import { formatPrice, cx } from '@/lib/format';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * HERO STAGE — the owner's showroom, edge to edge.
 *
 * The owner asked for his shop photographs across the WHOLE hero, not in a
 * side panel. So on desktop the photograph is the backdrop of the entire
 * section and the headline sits over it; on a phone the photograph already
 * spans the full width, so it stays uncovered above the text.
 *
 * Text over photographs is only legible for the photograph it was tuned
 * against — unless the scrim guarantees it. The left gradient holds 0.72 of
 * ink under the body copy and 0.56 where the headline ends: the lightest that
 * still keeps white type above AA over a wall of white refrigerators, so as
 * much of the room as possible stays visible. Contrast was measured on the
 * rendered pixels behind each text element, per photograph; the contrast
 * audit can't see an image, so the section also carries a real `bg-ink`.
 *
 * One index drives two things: the backdrop photograph and the product card
 * (real stock, real price, links to its page). One set of dots controls both,
 * so under prefers-reduced-motion — no auto-advance, no transitions — every
 * photograph and every product is still reachable.
 *
 * Motion discipline: crossfade only; pauses on hover, on keyboard focus and
 * while the tab is hidden; the frame has a fixed size so rotation can never
 * shift the page. Only the active slide and its two neighbours are mounted —
 * an opacity-0 <img> is still fetched and decoded.
 */
const INTERVAL = 5000;

export type HeroPhoto = {
  src: string;
  alt: string;
  /** CSS object-position: which band of the photo survives a wide crop. */
  focus?: string;
};

export function HeroStage({
  photos,
  products,
  locale,
  dict,
  children,
}: {
  photos: HeroPhoto[];
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  /** The headline block, rendered on the server. */
  children: ReactNode;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = Math.max(photos.length, products.length, 1);

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
    if (reduced || paused || count < 2) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % count), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced, paused, count]);

  const go = useCallback((n: number) => setI(((n % count) + count) % count), [count]);

  const near = (n: number, active: number, len: number) =>
    n === active || n === (active + 1) % len || n === (active + len - 1) % len;
  const photoIdx = photos.length ? i % photos.length : -1;
  const prodIdx = products.length ? i % products.length : -1;
  const fade = reduced ? '' : 'transition-opacity duration-[1100ms] ease-[var(--ease-out-soft)]';

  return (
    <section
      className="relative isolate overflow-hidden border-b border-line bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Backdrop: a full-width band on a phone, the whole section on desktop. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-3 sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        {photos.map((ph, n) =>
          near(n, photoIdx, photos.length) ? (
            <Image
              key={ph.src}
              src={ph.src}
              alt={n === photoIdx ? ph.alt : ''}
              aria-hidden={n !== photoIdx}
              fill
              priority={n === 0}
              sizes="100vw"
              style={{ objectPosition: ph.focus ?? '50% 50%' }}
              className={cx('object-cover', fade, n === photoIdx ? 'opacity-100' : 'opacity-0')}
            />
          ) : null,
        )}
        {/* Desktop scrim: dark under the text column, clear over the room. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(22,24,26,0.74)_0%,rgba(22,24,26,0.72)_36%,rgba(22,24,26,0.56)_54%,rgba(22,24,26,0.16)_72%,rgba(22,24,26,0)_86%)] lg:block"
        />
      </div>

      <div className="relative z-10 bg-canvas lg:bg-transparent">
        <div className="container-page grid gap-8 py-10 sm:py-12 lg:min-h-[min(84vh,50rem)] lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-16">
          <div className="lg:col-span-7">{children}</div>

          <div
            className="lg:col-span-5 lg:self-end"
            aria-roledescription="carousel"
            aria-label={dict.hero.showcaseLabel}
          >
            {prodIdx >= 0 && (
              <div className="relative h-[8.75rem] overflow-hidden rounded-[3px] bg-white shadow-[0_22px_48px_-20px_rgba(22,24,26,0.55)] ring-1 ring-line lg:ml-auto lg:max-w-[26rem]">
                {products.map((p, n) => {
                  if (!near(n, prodIdx, products.length)) return null;
                  const active = n === prodIdx;
                  const cat = CATEGORIES[p.category];
                  return (
                    <Link
                      key={p.id}
                      href={href(locale, cat.route, p.slug)}
                      tabIndex={active ? 0 : -1}
                      aria-hidden={!active}
                      className={cx(
                        'group absolute inset-0 flex items-center gap-4 bg-white p-4',
                        fade,
                        active ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0',
                      )}
                    >
                      <span className="relative block size-[6.75rem] shrink-0">
                        <Image
                          src={p.images[0].src}
                          alt={p.images[0].alt}
                          fill
                          sizes="108px"
                          className="object-contain"
                        />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                          {[p.brand, cat.label[locale]].filter(Boolean).join(' · ')}
                        </span>
                        <span className="mt-1 line-clamp-2 font-display text-[0.9375rem] font-medium leading-snug text-ink">
                          {p.name[locale]}
                        </span>
                        <span className="mt-1.5 flex items-baseline justify-between gap-3">
                          <span className="tnum font-display text-[1.25rem] font-semibold text-accent">
                            {formatPrice(p.price, locale)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-ink-2 transition-colors group-hover:text-accent">
                            {dict.common.viewProduct}
                            <ArrowRight
                              aria-hidden
                              className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                              strokeWidth={1.9}
                            />
                          </span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Dots — one control for the photograph and the product. On a
                dark pill so they read over any photograph. */}
            {count > 1 && (
              <div className="mt-3 flex lg:justify-end">
                <div className="flex items-center gap-2 rounded-full bg-ink/80 px-4">
                  {Array.from({ length: count }, (_, n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => go(n)}
                      aria-label={`${dict.hero.showcaseGoTo} ${n + 1}`}
                      aria-current={n === i}
                      // 44px tap target without changing how a 3px bar looks.
                      className="group/dot flex h-11 items-center"
                    >
                      <span
                        className={cx(
                          'block h-[3px] rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
                          n === i ? 'w-8 bg-white' : 'w-3 bg-white/45 group-hover/dot:bg-white/80',
                        )}
                      />
                    </button>
                  ))}
                  <span className="tnum ml-2 text-[0.6875rem] tabular-nums text-canvas">
                    {String(i + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
