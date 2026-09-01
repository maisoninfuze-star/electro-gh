import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import type { Product } from '@/lib/catalog/types';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { BUSINESS } from '@/content/business';
import { telHref } from '@/lib/contact';

/**
 * CURRENT DEALS
 * =============
 * Four products, chosen by the feed, never padded out. If the store only has
 * two marked-down units this week, this section shows two — an appliance store
 * that always has exactly four "deals" is obviously running a template.
 *
 * The whole section disappears when there is nothing on offer, rather than
 * rendering a headline over an empty grid.
 */
export function Deals({
  products,
  locale,
  dict,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (!products.length) return null;

  return (
    <section className="border-y border-line bg-surface py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow={dict.deals.eyebrow}
          title={dict.deals.title}
          body={dict.deals.body}
          href={href(locale, 'deals')}
          linkLabel={dict.deals.viewAll}
        />

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 70}>
              <ProductCard product={product} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-14 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-2">{dict.product.reassuranceBody}</p>
            <ButtonLink href={telHref()} external variant="secondary" className="shrink-0">
              {dict.deals.secondaryCta}
              <span className="tnum ml-1 text-ink-3">{BUSINESS.phone.display}</span>
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
