import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CATEGORY_LIST } from '@/lib/catalog/categories';
import type { CategoryDef } from '@/lib/catalog/types';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cx } from '@/lib/format';

/**
 * CATEGORY DISCOVERY
 * ==================
 * The most important navigational moment on the page: seven large editorial
 * tiles, not a row of icon chips.
 *
 * Desktop uses a deliberately asymmetric 12-column grid — refrigerators take a
 * double-height hero tile, laundry pairs sit beside it, and the remaining
 * kitchen categories form an even bottom band. The irregularity is what stops
 * it reading as a template.
 *
 * Mobile becomes a snap-scrolling rail, because seven stacked full-width tiles
 * is a very long scroll before a visitor reaches anything else.
 */

/** Desktop span per category, by position in the grid. */
const SPANS: Record<string, string> = {
  refrigerators: 'lg:col-span-6 lg:row-span-2',
  washers: 'lg:col-span-3',
  dryers: 'lg:col-span-3',
  'laundry-sets': 'lg:col-span-6',
  ranges: 'lg:col-span-4',
  dishwashers: 'lg:col-span-4',
  freezers: 'lg:col-span-4',
};

export function CategoryDiscovery({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow={dict.categories.eyebrow}
          title={dict.categories.title}
          href={href(locale, 'shop')}
          linkLabel={dict.common.viewAll}
        />
      </div>

      {/* Mobile: swipe rail, edge-to-edge so the next card peeks in. */}
      <div className="mt-10 lg:hidden">
        <div className="rail gap-3 px-5 pb-2 sm:px-10">
          {CATEGORY_LIST.map((c, i) => (
            <CategoryTile
              key={c.id}
              category={c}
              locale={locale}
              cta={dict.categories.cta}
              priority={i === 0}
              className="w-[72vw] max-w-[20rem]"
              ratio="aspect-[4/5]"
            />
          ))}
          <span aria-hidden className="w-2 shrink-0" />
        </div>
      </div>

      {/* Desktop: asymmetric editorial grid. */}
      <div className="container-page mt-12 hidden lg:block">
        <div className="grid auto-rows-[minmax(0,18.5rem)] grid-cols-12 gap-3">
          {CATEGORY_LIST.map((c, i) => (
            <Reveal key={c.id} delay={i * 60} className={cx('min-h-0', SPANS[c.id])}>
              <CategoryTile
                category={c}
                locale={locale}
                cta={dict.categories.cta}
                className="h-full"
                ratio="h-full"
                large={c.id === 'refrigerators'}
                wide={c.id === 'laundry-sets'}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  locale,
  cta,
  className,
  ratio,
  priority = false,
  large = false,
  wide = false,
}: {
  category: CategoryDef;
  locale: Locale;
  cta: string;
  className?: string;
  ratio: string;
  priority?: boolean;
  large?: boolean;
  /** Double-width tile: appliance right, type left. */
  wide?: boolean;
}) {
  return (
    <Link
      href={href(locale, category.route)}
      className={cx(
        'group relative isolate flex shrink-0 flex-col justify-end overflow-hidden bg-surface-2',
        ratio,
        className,
      )}
    >
      <Image
        src={category.image.src}
        alt=""
        fill
        priority={priority}
        sizes={
          large || wide ? '(max-width: 1023px) 72vw, 44vw' : '(max-width: 1023px) 72vw, 30vw'
        }
        /* Extra bottom padding lifts the appliance clear of the type zone, so
           the scrim never cuts across the product itself. */
        className={cx(
          'product-shadow transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]',
          wide
            ? 'object-contain object-right p-6 pr-10 lg:pr-16'
            : large
              ? 'object-contain p-8 pb-28'
              : 'object-contain p-5 pb-20',
        )}
      />

      {/* A soft scrim only where the type sits, so the appliance stays clean. */}
      <div
        aria-hidden
        className={cx(
          'pointer-events-none absolute',
          wide
            ? 'inset-y-0 left-0 w-3/5 bg-gradient-to-r from-canvas via-canvas/75 to-transparent'
            : 'inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-canvas via-canvas/70 to-transparent',
        )}
      />

      <div
        className={cx(
          'relative z-10 flex gap-4 p-5 sm:p-6',
          wide ? 'mt-auto items-end justify-between lg:mt-0 lg:h-full lg:items-center' : 'items-end justify-between',
        )}
      >
        <div className={cx(wide && 'lg:max-w-[18rem]')}>
          <h3
            className={cx(
              'font-display font-medium tracking-[-0.02em] text-ink',
              large ? 'text-2xl sm:text-3xl' : wide ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {category.label[locale]}
          </h3>
          <p className={cx('mt-1 text-xs leading-snug text-ink-2', large || wide ? 'max-w-[30ch]' : 'max-w-[22ch]')}>
            {category.tagline[locale]}
          </p>
        </div>

        <span
          aria-hidden
          className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:border-ink group-hover:bg-ink group-hover:text-canvas"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.75} />
        </span>
      </div>

      <span className="sr-only">{cta}</span>
    </Link>
  );
}
