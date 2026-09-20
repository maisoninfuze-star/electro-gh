import { Suspense } from 'react';
import { StoreActionButton } from '@/components/layout/StoreChooser';
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
import { ServicePage, type ServiceKind } from '@/components/pages/ServicePage';
import { StoresPage } from '@/components/pages/StoresPage';
import { ContactPage } from '@/components/pages/ContactPage';
import { getAllProducts, getDeals, getProductsByCategory, categoryIdFromRoute } from '@/lib/catalog/provider';
import type { CategoryId } from '@/lib/catalog/types';

/**
 * ONE ROUTE FOR EVERY SINGLE-SEGMENT PAGE
 * =======================================
 * Listings:  /magasiner (everything)  /aubaines (deals)  /laveuses (a category)
 * Pages:     /reparation  /pieces  /livraison  /nos-magasins  /nous-joindre
 *
 * The listings are one page with a different product set and heading, so the
 * filter behaviour, the empty states and the SEO markup can never drift apart
 * between them. The informational pages — the sections the owner asked for by
 * name — dispatch to their own components below.
 */

const LISTING_ROUTES: RouteId[] = [
  'shop',
  'deals',
  ...CATEGORY_LIST.map((c) => c.route),
];

const INFO_ROUTES: RouteId[] = ['repair', 'parts', 'delivery', 'stores', 'contact'];

const ALL_ROUTES = [...LISTING_ROUTES, ...INFO_ROUTES];

export async function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    ALL_ROUTES.map((route) => ({ locale, category: ROUTE_SLUGS[route][locale] })),
  );
}

/** Metadata for the informational pages — title and description per page. */
function infoMeta(locale: Locale, routeId: RouteId): Metadata {
  const dict = getDictionary(locale);
  const fr = locale === 'fr';
  const cities = fr ? 'Montréal et Laval' : 'Montréal and Laval';
  const p = dict.pages[routeId as keyof typeof dict.pages];
  const title = fr ? `${p.eyebrow} — Électroménagers GH, ${cities}` : `${p.eyebrow} — Électroménagers GH, ${cities}`;
  return {
    title,
    description: p.lead,
    alternates: {
      canonical: SITE_URL + href(locale, routeId),
      languages: alternates(routeId),
    },
  };
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
  if (!routeId) return {};
  if (INFO_ROUTES.includes(routeId)) return infoMeta(locale, routeId);
  if (!LISTING_ROUTES.includes(routeId)) return {};

  const data = await resolve(locale, slug);
  if (!data) return {};

  const fr = locale === 'fr';
  const cities = fr ? 'Montréal et Laval' : 'Montréal and Laval';

  /* Titles are written per category rather than templated, so each page has a
     genuinely unique <title> that reads like a sentence a person would search.
     No keyword stuffing — the cities appear once. */
  const title = fr
    ? `${data.title} à ${cities}`
    : `${data.title} in ${cities}`;

  const description = fr
    ? `${data.intro} Électroménagers neufs et reconditionnés chez Électroménagers GH, ${cities}. Achat & revente, livraison disponible.`
    : `${data.intro} New and refurbished appliances at Électroménagers GH, ${cities}. We buy & sell, delivery available.`;

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
  const dict = getDictionary(locale);

  const routeId = routeIdFromSlug(locale, slug);
  if (routeId === 'repair' || routeId === 'parts' || routeId === 'delivery') {
    return <ServicePage kind={routeId as ServiceKind} locale={locale} dict={dict} />;
  }
  if (routeId === 'stores') return <StoresPage locale={locale} dict={dict} />;
  if (routeId === 'contact') return <ContactPage locale={locale} dict={dict} />;

  const data = await resolve(locale, slug);
  if (!data) notFound();

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
              <StoreActionButton mode="call" source="category_empty" dict={dict} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[3px] bg-accent px-8 text-[0.9375rem] font-medium text-accent-ink transition-colors hover:bg-accent-hover">
                {dict.common.callUs}
              </StoreActionButton>
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
