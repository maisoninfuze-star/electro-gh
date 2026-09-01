import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalog/types';
import { CATEGORIES } from '@/lib/catalog/categories';
import { Price } from '@/components/ui/Price';
import { ConditionBadge, AvailabilityTag } from '@/components/ui/Badges';
import { ImagePending } from '@/components/ui/ImagePending';
import { href } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cx } from '@/lib/format';

/**
 * The product card is the workhorse of the whole site, so it is deliberately
 * quiet: image, brand, name, price. Everything else is secondary type.
 *
 * Interaction notes
 * -----------------
 * · The whole card is one link (a stretched pseudo-element over the article),
 *   so the tap target on mobile is the entire card, not just the title.
 * · Hover motion lives behind `@media (hover: hover)` via Tailwind's `group-hover`
 *   on a transform — touch devices never get a stuck hover state.
 * · The image sits on a warm surface tile with generous padding so an appliance
 *   shot on white doesn't dissolve into the page.
 */
export function ProductCard({
  product,
  locale,
  dict,
  priority = false,
  className,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
  className?: string;
}) {
  const category = CATEGORIES[product.category];
  const url = href(locale, category.route, product.slug);
  const image = product.images[0];

  return (
    <article
      className={cx(
        'group relative flex flex-col',
        // Elevation on hover, done with border + shadow rather than translate so
        // neighbouring cards never reflow.
        'transition-shadow duration-500 ease-[var(--ease-out-soft)]',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 24vw"
            priority={priority}
            className="product-shadow object-contain p-6 pb-8 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] sm:p-8 sm:pb-10"
          />
        ) : (
          <ImagePending label={dict.product.imagePending} />
        )}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          <ConditionBadge condition={product.condition} dict={dict} />
        </div>

        {/* Desktop affordance only — never relied upon for meaning. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-3 hidden size-9 items-center justify-center rounded-full bg-ink text-canvas opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:opacity-100 lg:flex"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.75} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3">
          {product.brand}
        </p>

        <h3 className="text-[0.9375rem] font-medium leading-snug text-ink">
          <Link href={url} className="after:absolute after:inset-0 after:content-['']">
            {product.name[locale]}
          </Link>
        </h3>

        {product.model && (
          <p className="tnum text-xs text-ink-3">
            {dict.product.model} {product.model}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Price product={product} locale={locale} dict={dict} />
          <AvailabilityTag status={product.inventoryStatus} dict={dict} />
        </div>
      </div>
    </article>
  );
}
