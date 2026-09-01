import type { Product, CategoryId, Condition, InventoryStatus } from './types';
import type { Locale } from '@/lib/i18n/config';

/**
 * FILTER MODEL
 * ============
 * Filter state lives entirely in the URL query string. That is what makes a
 * filtered view shareable, back-button-correct, and indexable — and it means a
 * salesperson can text a customer "here's every 30-inch stainless range under
 * $800" as a link.
 *
 * Filtering runs on the client over the already-loaded product array, so
 * changing a facet is instant with no request and no full-page reload.
 */

export type SortKey = 'featured' | 'priceAsc' | 'priceDesc' | 'newest' | 'savings';

export interface FilterState {
  categories: CategoryId[];
  brands: string[];
  conditions: Condition[];
  availability: InventoryStatus[];
  finishes: string[];
  priceBuckets: string[];
  widthBuckets: string[];
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  brands: [],
  conditions: [],
  availability: [],
  finishes: [],
  priceBuckets: [],
  widthBuckets: [],
  sort: 'featured',
};

/**
 * Price bands in CAD. Chosen around how appliance shoppers actually budget —
 * "under $500" is a different customer from "$1,500+", and the bands sit either
 * side of those decision points rather than on arbitrary round numbers.
 */
export const PRICE_BUCKETS = [
  { id: 'p0', min: 0, max: 499, label: { fr: 'Moins de 500 $', en: 'Under $500' } },
  { id: 'p1', min: 500, max: 999, label: { fr: '500 $ – 999 $', en: '$500 – $999' } },
  { id: 'p2', min: 1000, max: 1499, label: { fr: '1 000 $ – 1 499 $', en: '$1,000 – $1,499' } },
  { id: 'p3', min: 1500, max: Infinity, label: { fr: '1 500 $ et plus', en: '$1,500 and up' } },
] as const;

/**
 * Width bands in inches, matching the standard cut-outs in Quebec kitchens and
 * laundry rooms. "Will it fit?" is the single most common in-store question, so
 * width is a first-class facet rather than a buried spec.
 */
export const WIDTH_BUCKETS = [
  { id: 'w0', min: 0, max: 24.99, label: { fr: '24 po et moins', en: '24" and under' } },
  { id: 'w1', min: 25, max: 29.99, label: { fr: '25 – 29 po', en: '25" – 29"' } },
  { id: 'w2', min: 30, max: 33.99, label: { fr: '30 – 33 po', en: '30" – 33"' } },
  { id: 'w3', min: 34, max: Infinity, label: { fr: '34 po et plus', en: '34" and up' } },
] as const;

export const FINISH_LABELS: Record<string, Record<Locale, string>> = {
  stainless: { fr: 'Acier inoxydable', en: 'Stainless steel' },
  white: { fr: 'Blanc', en: 'White' },
  black: { fr: 'Noir', en: 'Black' },
  'black-stainless': { fr: 'Acier inoxydable noir', en: 'Black stainless' },
  slate: { fr: 'Ardoise', en: 'Slate' },
  other: { fr: 'Autre', en: 'Other' },
};

export const CONDITION_ORDER: Condition[] = ['new', 'open-box', 'refurbished', 'clearance'];
export const AVAILABILITY_ORDER: InventoryStatus[] = ['in-stock', 'low-stock', 'on-request'];

const inBucket = (
  value: number | undefined,
  ids: string[],
  buckets: readonly { id: string; min: number; max: number }[],
) => {
  if (!ids.length) return true;
  if (value === undefined) return false;
  return ids.some((id) => {
    const b = buckets.find((x) => x.id === id);
    return b ? value >= b.min && value <= b.max : false;
  });
};

export function applyFilters(products: Product[], f: FilterState): Product[] {
  const filtered = products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.conditions.length && !f.conditions.includes(p.condition)) return false;
    if (f.availability.length && !f.availability.includes(p.inventoryStatus)) return false;
    if (f.finishes.length && !(p.finish && f.finishes.includes(p.finish))) return false;
    if (!inBucket(p.price, f.priceBuckets, PRICE_BUCKETS)) return false;
    if (!inBucket(p.dimensions?.width, f.widthBuckets, WIDTH_BUCKETS)) return false;
    return true;
  });

  return sortProducts(filtered, f.sort);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const out = [...products];
  const savings = (p: Product) =>
    p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice - p.price : 0;

  switch (sort) {
    case 'priceAsc':
      return out.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return out.sort((a, b) => b.price - a.price);
    case 'newest':
      return out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case 'savings':
      return out.sort((a, b) => savings(b) - savings(a));
    case 'featured':
    default:
      // Featured first, then in-stock ahead of on-request, then newest. A unit
      // the customer can actually walk in and buy today outranks one that has
      // to be ordered.
      return out.sort((a, b) => {
        const rank = (p: Product) =>
          (p.featured ? -4 : 0) +
          (p.inventoryStatus === 'in-stock' ? -2 : p.inventoryStatus === 'low-stock' ? -1 : 0);
        return rank(a) - rank(b) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }
}

/** Count of active facet selections — drives the "Filtres (3)" badge. */
export const activeFilterCount = (f: FilterState): number =>
  f.categories.length +
  f.brands.length +
  f.conditions.length +
  f.availability.length +
  f.finishes.length +
  f.priceBuckets.length +
  f.widthBuckets.length;

/**
 * How many products each facet option WOULD yield, computed with that facet's
 * own selections removed. Without this, ticking "Samsung" makes every other
 * brand show "0" and the filter panel becomes unusable.
 */
export function facetCounts<K extends keyof FilterState>(
  products: Product[],
  filters: FilterState,
  facet: K,
  valueOf: (p: Product) => string | undefined,
): Record<string, number> {
  const withoutThisFacet = { ...filters, [facet]: [] } as FilterState;
  const base = applyFilters(products, withoutThisFacet);

  const counts: Record<string, number> = {};
  for (const p of base) {
    const v = valueOf(p);
    if (v === undefined) continue;
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

/** Bucket-aware variant of facetCounts, for price and width. */
export function bucketCounts(
  products: Product[],
  filters: FilterState,
  facet: 'priceBuckets' | 'widthBuckets',
  buckets: readonly { id: string; min: number; max: number }[],
  valueOf: (p: Product) => number | undefined,
): Record<string, number> {
  const base = applyFilters(products, { ...filters, [facet]: [] });
  const counts: Record<string, number> = {};
  for (const b of buckets) {
    counts[b.id] = base.filter((p) => {
      const v = valueOf(p);
      return v !== undefined && v >= b.min && v <= b.max;
    }).length;
  }
  return counts;
}

/* ── URL serialisation ───────────────────────────────────────────────────── */

const PARAM: Record<keyof Omit<FilterState, 'sort'>, string> = {
  categories: 'c',
  brands: 'b',
  conditions: 'e',
  availability: 'a',
  finishes: 'f',
  priceBuckets: 'p',
  widthBuckets: 'w',
};

export function filtersFromParams(params: URLSearchParams): FilterState {
  const read = (key: string): string[] => {
    const raw = params.get(key);
    return raw ? raw.split(',').filter(Boolean) : [];
  };

  const sort = params.get('s');
  const validSort: SortKey[] = ['featured', 'priceAsc', 'priceDesc', 'newest', 'savings'];

  return {
    categories: read(PARAM.categories) as CategoryId[],
    brands: read(PARAM.brands),
    conditions: read(PARAM.conditions) as Condition[],
    availability: read(PARAM.availability) as InventoryStatus[],
    finishes: read(PARAM.finishes),
    priceBuckets: read(PARAM.priceBuckets),
    widthBuckets: read(PARAM.widthBuckets),
    sort: sort && (validSort as string[]).includes(sort) ? (sort as SortKey) : 'featured',
  };
}

export function filtersToQuery(f: FilterState): string {
  const params = new URLSearchParams();
  (Object.keys(PARAM) as (keyof typeof PARAM)[]).forEach((key) => {
    const values = f[key];
    if (values.length) params.set(PARAM[key], values.join(','));
  });
  if (f.sort !== 'featured') params.set('s', f.sort);
  const q = params.toString();
  return q ? `?${q}` : '';
}

/** Immutable toggle of one value in one array facet. */
export function toggle<K extends keyof Omit<FilterState, 'sort'>>(
  f: FilterState,
  facet: K,
  value: string,
): FilterState {
  const current = f[facet] as string[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return { ...f, [facet]: next } as FilterState;
}
