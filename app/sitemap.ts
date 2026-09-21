import type { MetadataRoute } from 'next';
import {
  LOCALES, ROUTE_SLUGS, href, isLive, SITE_URL, HTML_LANG, type RouteId,
} from '@/lib/i18n/config';
import { CATEGORIES, CATEGORY_LIST } from '@/lib/catalog/categories';
import { getAllProducts } from '@/lib/catalog/provider';

/**
 * Generated per request, not at build: the sitemap must list what is in
 * stock NOW, and it must never be the reason a deploy fails because the
 * inventory store was unreachable for a moment during the build.
 */
export const dynamic = 'force-dynamic';

/**
 * Sitemap with hreflang alternates on every entry, so Google serves the French
 * URL to a Montréal or Laval searcher and the English one to an English query.
 *
 * Only routes that actually exist are listed — the future pages declared in
 * FUTURE_ROUTES stay out until they have content, because a sitemap entry for a
 * 404 is a crawl-budget leak.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const now = new Date();

  const alt = (route: RouteId, sub?: string) => ({
    languages: Object.fromEntries(
      LOCALES.map((l) => [HTML_LANG[l].split('-')[0], SITE_URL + href(l, route, sub)]),
    ),
  });

  // isLive keeps unbuilt pages out of the sitemap — a sitemap entry that 404s
  // is a crawl-budget leak and a Search Console error.
  const staticRoutes: RouteId[] = (
    ['home', 'shop', 'deals', 'repair', 'parts', 'delivery', 'stores', 'contact',
     ...CATEGORY_LIST.map((c) => c.route)] as RouteId[]
  ).filter(isLive);

  const pages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: SITE_URL + href(locale, route),
      lastModified: now,
      changeFrequency: route === 'home' || route === 'deals' ? ('daily' as const) : ('weekly' as const),
      priority: route === 'home' ? 1 : route === 'shop' || route === 'deals' ? 0.9 : 0.8,
      alternates: alt(route),
    })),
  );

  const productPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    products.map((p) => {
      const route = CATEGORIES[p.category].route;
      return {
        url: SITE_URL + href(locale, route, p.slug),
        lastModified: new Date(p.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: alt(route, p.slug),
      };
    }),
  );

  // Referenced so the slug map is exercised at build time.
  void ROUTE_SLUGS;

  return [...pages, ...productPages];
}
