import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProductCard } from '@/components/catalog/ProductCard';
import type { Product } from '@/lib/catalog/types';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * NEW ARRIVALS
 * ============
 * A horizontal rail of the most recently added units.
 *
 * This is the section that makes the site feel alive: an appliance store's real
 * advantage over a big-box chain is that its floor changes every week, and a
 * static site hides that. Ordering is purely `createdAt` from the feed, so the
 * rail refreshes itself as stock is entered — nobody has to curate it.
 *
 * FUTURE: the same rail is the natural home for a Facebook/Instagram feed. Map
 * posts onto the same card shape and interleave, or swap the source entirely.
 */
export function NewArrivals({
  products,
  locale,
  dict,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (!products.length) {
    return (
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow={dict.arrivals.eyebrow}
            title={dict.arrivals.title}
            body={dict.arrivals.empty}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow={dict.arrivals.eyebrow}
          title={dict.arrivals.title}
          body={dict.arrivals.body}
          href={href(locale, 'shop')}
          linkLabel={dict.arrivals.cta}
        />
      </div>

      {/* Edge-to-edge rail: cards run off the right edge so the scroll
          affordance is obvious without an arrow button. */}
      <div className="rail mt-12 gap-4 px-5 pb-4 sm:px-10 lg:px-12 min-[1600px]:px-16">
        {products.map((product, i) => (
          <div key={product.id} className="w-[62vw] max-w-[17rem] sm:w-[36vw] lg:w-[19rem]">
            <ProductCard product={product} locale={locale} dict={dict} priority={i < 2} />
          </div>
        ))}
        <span aria-hidden className="w-2 shrink-0" />
      </div>
    </section>
  );
}
