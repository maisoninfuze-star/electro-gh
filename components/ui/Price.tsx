import type { Product } from '@/lib/catalog/types';
import { hasDiscount, savings } from '@/lib/catalog/types';
import { formatPrice, cx } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * Price block.
 *
 * The struck-through "before" price and the savings figure render ONLY when
 * `compareAtPrice` is genuinely higher than `price` — see hasDiscount(). A feed
 * that sets compareAtPrice equal to (or below) price cannot produce a fake
 * discount on this site.
 *
 * Savings are set in the warm bronze `signal` token, never red. That single
 * choice is most of what separates "premium value" from "liquidation flyer".
 */
export function Price({
  product,
  locale,
  dict,
  size = 'md',
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  size?: 'md' | 'lg';
}) {
  const discounted = hasDiscount(product);

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span
        className={cx(
          'tnum font-display font-semibold tracking-[-0.02em] text-ink',
          size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-lg',
        )}
      >
        {formatPrice(product.price, locale)}
      </span>

      {discounted && (
        <>
          <span
            className={cx(
              'tnum text-ink-3 line-through decoration-ink-3/50',
              size === 'lg' ? 'text-lg' : 'text-sm',
            )}
          >
            <span className="sr-only">{dict.deals.was} </span>
            {formatPrice(product.compareAtPrice!, locale)}
          </span>
          <span
            className={cx(
              'tnum font-medium text-signal',
              size === 'lg' ? 'text-sm' : 'text-xs',
            )}
          >
            {dict.deals.save} {formatPrice(savings(product), locale)}
          </span>
        </>
      )}
    </div>
  );
}
