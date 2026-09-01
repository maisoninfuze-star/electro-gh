import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { BreadcrumbSchema, ItemListSchema } from '@/components/seo/StructuredData';

import { getDictionary } from '@/lib/i18n/dictionaries';
import {
  LOCALES, ROUTE_SLUGS, alternates, href, isLocale, routeIdFromSlug, SITE_URL,
  type Locale, type RouteId,
} from '@/lib/i18n/config';
import { CATEGORIES, CATEGORY_LIST } from '@/lib/catalog/categories';
import { getAllProducts, getDeals, getProductsByCategory, categoryIdFromRoute } from '@/lib/catalog/provider';
import { telHref } from '@/lib/contact';
import type { CategoryId } from '@/lib/catalog/types';

/**
 * ONE ROUTE FOR EVERY LISTING SURFACE
 * ===================================
 * /magasiner  (shop, everything)   /aubaines (deals)   /laveuses (one category)
 *
 * All three are the same page with a different product set and heading, which
 * means the filter behaviour, the empty states and the SEO markup can never
 * drift apart between them.
 */

const LISTING_ROUTES: RouteId[] = [
  'shop',
  'deals',
  ...CATEGORY_LIST.map((c) => c.route),
];

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    LISTING_ROUTES.map((route) => ({ locale, category: ROUTE_SLUGS[route][locale] })),
  );
}

/** Resolve the URL segment into a listing definition, or null for a 404. */
async function resolve(locale: Locale, slug: string) {
  const routeId = routeIdFromSlug(locale, slug);
  if (!routeId || !LISTING_ROUTES.includes(routeId)) return null;

  const dict = getDictionary(locale);

  if (routeId === 'shop') {
    return {
      routeId,
      categoryId: undefined as CategoryId | undefined,
      products: await getAllProducts(),
      title: dict.nav.shop,
      eyebrow: dict.categories.eyebrow,
      intro: locale === 'fr'
        ? 'Tout notre inventaire, en un seul endroit. Filtrez par catégorie, marque, prix, état et dimensions.'
        : 'Our full inventory in one place. Filter by category, brand, price, condition and size.',
    };
  }

  if (routeId === 'deals') {
    return {
      routeId,
      categoryId: undefined as CategoryId | undefined,
      products: await getDeals(),
      title: dict.deals.title.replace(/\.$/, ''),
      eyebrow: dict.deals.eyebrow,
      intro: dict.dealBanner.body,
    };
  }

  const categoryId = categoryIdFromRoute(routeId);
  if (!categoryId) return null;
  const category = CATEGORIES[categoryId];

  return {
    routeId,
    categoryId,
    products: await getProductsByCategory(categoryId),
    title: category.label[locale],
    eyebrow: dict.categories.eyebrow,
    intro: category.tagline[locale],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale: raw, category: slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;

  const routeId = routeIdFromSlug(locale, slug);
  if (!routeId || !LISTING_ROUTES.includes(routeId)) return {};

  const data = await resolve(locale, slug);
  if (!data) return {};

  const fr = locale === 'fr';
  const city = 'Laval';

  /* Titles are written per category rather than templated, so each page has a
     genuinely unique <title> that reads like a sentence a person would search.
     No keyword stuffing — the city appears once. */
  const title = fr
    ? `${data.title} à ${city}`
    : `${data.title} in ${city}`;

  const description = fr
    ? `${data.intro} Électroménagers neufs et reconditionnés chez Electro GH, ${city}. Service local, livraison disponible.`
    : `${data.intro} New and refurbished appliances at Electro GH, ${city}. Local service, delivery available.`;

  return {
    title,
    description,
    alternates: {
      canonical: SITE_URL + href(locale, routeId),
      languages: alternates(routeId),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale: raw, category: slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const data = await resolve(locale, slug);
  if (!data) notFound();

  const dict = getDictionary(locale);

  const crumbs = [
    { name: 'Electro GH', url: href(locale, 'home') },
    ...(data.routeId === 'shop' || data.routeId === 'deals'
      ? []
      : [{ name: dict.nav.shop, url: href(locale, 'shop') }]),
    { name: data.title, url: href(locale, data.routeId) },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <ItemListSchema products={data.products} locale={locale} />

      <header className="border-b border-line bg-surface">
        <div className="container-page py-8 sm:py-12">
          <Breadcrumbs items={crumbs} />

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Reveal>
                <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                  {data.eyebrow}
                </p>
              </Reveal>
              <h1 className="font-display text-display-3 font-medium text-ink">
                <RevealLines lines={[data.title]} immediate />
              </h1>
              <Reveal delay={140}>
                <p className="mt-4 max-w-xl text-lead text-ink-2">{data.intro}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      {data.products.length === 0 ? (
        /* Honest empty-category state. An appliance store legitimately runs out
           of a whole category; saying so beats an empty grid. */
        <div className="container-page py-20">
          <div className="flex max-w-xl flex-col items-start gap-5">
            <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink">
              {dict.catalog.emptyStock.title}
            </h2>
            <p className="text-lead text-ink-2">{dict.catalog.emptyStock.body}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={telHref()} external size="lg">
                {dict.common.callUs}
              </ButtonLink>
              <ButtonLink href={href(locale, 'shop')} variant="secondary" size="lg">
                {dict.common.viewAll}
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        /* useSearchParams needs a Suspense boundary so the shell can stream. */
        <Suspense fallback={<div className="container-page py-20 text-sm text-ink-3">{dict.common.loading}</div>}>
          <CatalogBrowser
            products={data.products}
            locale={locale}
            dict={dict}
            lockedCategory={data.categoryId}
          />
        </Suspense>
      )}
    </>
  );
}
