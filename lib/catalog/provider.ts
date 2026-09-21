import type { Product, CategoryId } from './types';
import { CATEGORIES } from './categories';
import { getStore } from '@/lib/store';
import type { Locale, RouteId } from '@/lib/i18n/config';
import { normalise } from './text';

export { normalise };

/**
 * CATALOG PROVIDER
 * ================
 * The only module the public UI is allowed to read products from.
 *
 * It reads the inventory store (lib/store) and exposes ONLY `published`
 * units. Drafts and sold units exist in the store for the admin, and never
 * reach a public page through any of these functions.
 *
 * The demo dataset that used to live here is gone: the seed in
 * data/inventory.json is real Électroménagers GH stock, photographed in the
 * two stores, priced from the tags on the machines.
 */

/** The catalogue is real inventory now. Kept as a constant so nothing that
 *  imported it breaks; the demo ribbon it drove no longer renders. */
export const IS_DEMO_DATA = false;

async function loadAll(): Promise<Product[]> {
  const store = await getStore();
  return (await store.list()).filter((p) => p.status === 'published');
}

export async function getAllProducts(): Promise<Product[]> {
  return loadAll();
}

export async function getProductsByCategory(category: CategoryId): Promise<Product[]> {
  return (await loadAll()).filter((p) => p.category === category);
}

export async function getProductBySlug(
  category: CategoryId,
  slug: string,
): Promise<Product | null> {
  return (
    (await loadAll()).find((p) => p.category === category && p.slug === slug) ?? null
  );
}

/** Deals surface: anything explicitly flagged, or genuinely marked down. */
export async function getDeals(): Promise<Product[]> {
  const all = await loadAll();
  return all
    .filter((p) => p.deal || (p.compareAtPrice && p.compareAtPrice > p.price))
    .sort((a, b) => savingsOf(b) - savingsOf(a));
}

export async function getFeatured(limit = 4): Promise<Product[]> {
  const all = await loadAll();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Newest first — powers the "Nouvel arrivage" rail. */
export async function getNewArrivals(limit = 10): Promise<Product[]> {
  const all = await loadAll();
  return [...all]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

/**
 * Related products: same category first, then the same room, never the item
 * itself. Falls back gracefully when a category holds only one unit.
 */
export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = (await loadAll()).filter((p) => p.id !== product.id);
  const room = CATEGORIES[product.category].room;
  const sameCategory = all.filter((p) => p.category === product.category);
  const sameRoom = all.filter(
    (p) => p.category !== product.category && CATEGORIES[p.category].room === room,
  );
  return [...sameCategory, ...sameRoom].slice(0, limit);
}

/** Which categories actually have stock — used to avoid linking to dead ends. */
export async function getCategoryCounts(): Promise<Record<CategoryId, number>> {
  const all = await loadAll();
  const counts = {} as Record<CategoryId, number>;
  for (const id of Object.keys(CATEGORIES) as CategoryId[]) {
    counts[id] = all.filter((p) => p.category === id).length;
  }
  return counts;
}

/** Route id → category id, for the [category] dynamic segment. */
export function categoryIdFromRoute(route: RouteId): CategoryId | null {
  const entry = (Object.values(CATEGORIES) as (typeof CATEGORIES)[CategoryId][]).find(
    (c) => c.route === route,
  );
  return entry?.id ?? null;
}

const savingsOf = (p: Product) =>
  p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice - p.price : 0;

/** Distinct brands across the live catalogue, alphabetical. */
export async function getBrands(): Promise<string[]> {
  const all = await loadAll();
  return [...new Set(all.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Search index rows, precomputed on the server so the client filter is instant. */
export type SearchRow = {
  id: string;
  /** Lower-cased, accent-stripped haystack: brand + name + model + category. */
  haystack: string;
};

export function buildSearchIndex(products: Product[], locale: Locale): SearchRow[] {
  return products.map((p) => ({
    id: p.id,
    haystack: normalise(
      [
        p.brand,
        p.name.fr,
        p.name.en,
        p.model ?? '',
        p.sku,
        CATEGORIES[p.category].label.fr,
        CATEGORIES[p.category].label.en,
        p.colour?.[locale] ?? '',
        p.finish ?? '',
      ].join(' '),
    ),
  }));
}

