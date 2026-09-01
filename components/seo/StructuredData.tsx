import { BUSINESS, addressLine } from '@/content/business';
import { CATEGORIES } from '@/lib/catalog/categories';
import { hasDiscount, type Product } from '@/lib/catalog/types';
import { SITE_URL, href, type Locale } from '@/lib/i18n/config';

/**
 * STRUCTURED DATA
 * ===============
 * Emitted as JSON-LD. Every field is drawn from verified business data or the
 * product feed — nothing here is composed for SEO's benefit.
 *
 * Notably ABSENT and intentionally so:
 *   · openingHoursSpecification — hours are unverified (content/business.ts)
 *   · priceRange                — would be a guess across a changing catalogue
 *   · aggregateRating           — no review data is connected; fabricating one
 *                                 is a manual-action-level violation
 *   · foundingDate              — company history was never supplied
 *
 * These appear automatically the moment the corresponding field is verified.
 */

function Json({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from typed, first-party data — no user input reaches here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessSchema({ locale }: { locale: Locale }) {
  const hours = BUSINESS.hours.verified ? BUSINESS.hours.value : null;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    // HomeGoodsStore is the closest Schema.org type to an appliance retailer
    // and inherits from both Store and LocalBusiness.
    '@type': ['HomeGoodsStore', 'Store'],
    '@id': `${SITE_URL}/#store`,
    name: BUSINESS.legalName,
    alternateName: BUSINESS.shortName,
    url: SITE_URL + href(locale, 'home'),
    telephone: BUSINESS.phone.raw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    areaServed: [
      { '@type': 'City', name: 'Laval' },
      { '@type': 'City', name: 'Montréal' },
    ],
    availableLanguage: [
      { '@type': 'Language', name: 'French' },
      { '@type': 'Language', name: 'English' },
      { '@type': 'Language', name: 'Arabic' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Électroménagers',
      itemListElement: Object.values(CATEGORIES).map((c, i) => ({
        '@type': 'OfferCatalog',
        position: i + 1,
        name: c.label[locale],
        url: SITE_URL + href(locale, c.route),
      })),
    },
  };

  if (hours?.length) {
    const DAYS = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    data.openingHoursSpecification = hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAYS[h.day]}`,
      opens: h.opens,
      closes: h.closes,
    }));
  }

  const sameAs = [BUSINESS.social.facebook, BUSINESS.social.instagram]
    .filter((s) => s.verified)
    .map((s) => s.value);
  if (sameAs.length) data.sameAs = sameAs;

  return <Json data={data} />;
}

/**
 * Product + Offer schema — the feed Google Merchant Center reads.
 *
 * `itemCondition` maps the store's own condition vocabulary onto Schema.org's.
 * "clearance" is a commercial label, not a physical condition, so it maps to
 * UsedCondition rather than inventing a new one.
 */
const CONDITION_URL: Record<Product['condition'], string> = {
  new: 'https://schema.org/NewCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
  'open-box': 'https://schema.org/NewCondition',
  clearance: 'https://schema.org/UsedCondition',
};

const AVAILABILITY_URL: Record<Product['inventoryStatus'], string> = {
  'in-stock': 'https://schema.org/InStock',
  'low-stock': 'https://schema.org/LimitedAvailability',
  'on-request': 'https://schema.org/PreOrder',
};

export function ProductSchema({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const cat = CATEGORIES[product.category];
  const url = SITE_URL + href(locale, cat.route, product.slug);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${product.brand} ${product.name[locale]}`,
    sku: product.sku,
    category: cat.label[locale],
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'CAD',
      price: product.price,
      itemCondition: CONDITION_URL[product.condition],
      availability: AVAILABILITY_URL[product.inventoryStatus],
      seller: { '@type': 'Organization', '@id': `${SITE_URL}/#store` },
    },
  };

  if (product.model) data.mpn = product.model;
  if (product.description) data.description = product.description[locale];
  if (product.colour) data.color = product.colour[locale];
  if (product.images.length) {
    data.image = product.images.map((i) => SITE_URL + i.src);
  }
  if (product.dimensions?.width) {
    data.width = {
      '@type': 'QuantitativeValue',
      value: product.dimensions.width,
      unitCode: 'INH',
    };
  }
  if (product.dimensions?.height) {
    data.height = {
      '@type': 'QuantitativeValue',
      value: product.dimensions.height,
      unitCode: 'INH',
    };
  }
  if (product.dimensions?.depth) {
    data.depth = {
      '@type': 'QuantitativeValue',
      value: product.dimensions.depth,
      unitCode: 'INH',
    };
  }

  return <Json data={data} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: SITE_URL + item.url,
        })),
      }}
    />
  );
}

/** Item list for a category page — helps Google understand the grid. */
export function ItemListSchema({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  if (!products.length) return null;
  return (
    <Json
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 30).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: SITE_URL + href(locale, CATEGORIES[p.category].route, p.slug),
          name: `${p.brand} ${p.name[locale]}`,
        })),
      }}
    />
  );
}

export { addressLine };
