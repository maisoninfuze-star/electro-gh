import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductBuyBox } from '@/components/product/ProductBuyBox';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { BreadcrumbSchema, ProductSchema } from '@/components/seo/StructuredData';

import { getDictionary } from '@/lib/i18n/dictionaries';
import {
  LOCALES, ROUTE_SLUGS, alternates, href, isLocale, routeIdFromSlug, SITE_URL, type Locale,
} from '@/lib/i18n/config';
import { CATEGORIES } from '@/lib/catalog/categories';
import { getProductBySlug, getRelated, categoryIdFromRoute, getAllProducts } from '@/lib/catalog/provider';
import { SITE_CONFIG } from '@/content/site-config';
import { formatPrice } from '@/lib/format';
import { hasDiscount } from '@/lib/catalog/types';

/**
 * PRODUCT PAGE
 * ============
 * URL: /<category>/<product-slug> — e.g. /laveuses/laveuse-frontale-27-blanche
 *
 * Nesting products under their category gives a URL that reads as a hierarchy,
 * matches the visible breadcrumb, and produces clean BreadcrumbList markup
 * without a synthetic /produit/ segment.
 */

export async function generateStaticParams() {
  const products = await getAllProducts();
  // `category` must be the LOCALISED SLUG that appears in the URL
  // (ensembles-laveuse-secheuse), not the internal route id (laundrySets).
  return LOCALES.flatMap((locale) =>
    products.map((p) => ({
      locale,
      category: ROUTE_SLUGS[CATEGORIES[p.category].route][locale],
      product: p.slug,
    })),
  );
}

async function load(locale: Locale, categorySlug: string, productSlug: string) {
  const routeId = routeIdFromSlug(locale, categorySlug);
  if (!routeId) return null;
  const categoryId = categoryIdFromRoute(routeId);
  if (!categoryId) return null;
  const product = await getProductBySlug(categoryId, productSlug);
  return product ? { product, categoryId, routeId } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; product: string }>;
}): Promise<Metadata> {
  const { locale: raw, category, product: slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;

  const data = await load(locale, category, slug);
  if (!data) return {};
  const { product, routeId } = data;

  const fr = locale === 'fr';
  const conditionWord = fr
    ? { new: 'neuf', refurbished: 'reconditionné', 'open-box': 'boîte ouverte', clearance: 'liquidation' }[product.condition]
    : { new: 'new', refurbished: 'refurbished', 'open-box': 'open box', clearance: 'clearance' }[product.condition];

  const price = formatPrice(product.price, locale);

  return {
    title: `${product.brand} ${product.name[locale]}${product.model ? ` — ${product.model}` : ''}`,
    description: fr
      ? `${product.brand} ${product.name[locale]} (${conditionWord}) à ${price} chez Électroménagers GH, Montréal et Laval. ${
          hasDiscount(product) ? 'En aubaine. ' : ''
        }Appelez-nous pour confirmer la disponibilité.`
      : `${product.brand} ${product.name[locale]} (${conditionWord}) at ${price} from Électroménagers GH, Montréal and Laval. ${
          hasDiscount(product) ? 'On sale. ' : ''
        }Call us to confirm availability.`,
    alternates: {
      canonical: SITE_URL + href(locale, routeId, product.slug),
      languages: alternates(routeId, product.slug),
    },
    openGraph: {
      type: 'website',
      images: product.images.length ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; product: string }>;
}) {
  const { locale: raw, category, product: slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const data = await load(locale, category, slug);
  if (!data) notFound();

  const { product, routeId } = data;
  const dict = getDictionary(locale);
  const categoryDef = CATEGORIES[product.category];
  const related = await getRelated(product, SITE_CONFIG.relatedCount);

  const crumbs = [
    { name: 'Electro GH', url: href(locale, 'home') },
    { name: dict.nav.shop, url: href(locale, 'shop') },
    { name: categoryDef.label[locale], url: href(locale, routeId) },
    { name: product.name[locale], url: href(locale, routeId, product.slug) },
  ];

  return (
    <>
      <ProductSchema product={product} locale={locale} />
      <BreadcrumbSchema items={crumbs} />

      <div className="container-page pt-6 sm:pt-8">
        <Breadcrumbs items={crumbs} />
      </div>

      <article className="container-page pb-20 pt-8 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <ProductGallery
            images={product.images}
            label={dict.product.gallery}
            pendingLabel={dict.product.imagePending}
          />

          <div className="lg:pt-2">
            <ProductBuyBox product={product} locale={locale} dict={dict} />
            <div className="mt-12">
              <ProductDetails product={product} locale={locale} dict={dict} />
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-16 sm:py-20">
          <div className="container-page">
            <h2 className="font-display text-display-3 font-medium text-ink">
              <RevealLines lines={[dict.product.related]} />
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 70}>
                  <ProductCard product={item} locale={locale} dict={dict} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
