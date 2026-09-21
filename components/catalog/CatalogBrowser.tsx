'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StoreActionButton } from '@/components/layout/StoreChooser';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

import { ProductCard } from './ProductCard';
import { FilterGroup, type FacetOption } from './FilterGroup';
import { Button, ButtonLink } from '@/components/ui/Button';
import {
  EMPTY_FILTERS,
  PRICE_BUCKETS,
  WIDTH_BUCKETS,
  FINISH_LABELS,
  CONDITION_ORDER,
  AVAILABILITY_ORDER,
  applyFilters,
  activeFilterCount,
  facetCounts,
  bucketCounts,
  filtersFromParams,
  filtersToQuery,
  toggle,
  type FilterState,
  type SortKey,
} from '@/lib/catalog/filters';
import { CATEGORIES, CATEGORY_LIST } from '@/lib/catalog/categories';
import type { Product, CategoryId } from '@/lib/catalog/types';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { track } from '@/lib/analytics/events';
import { cx } from '@/lib/format';

/**
 * CATALOG BROWSER
 * ===============
 * Filtering is instant and client-side; state lives in the URL.
 *
 * Mobile strategy (the brief is emphatic, and it is right): never show the
 * facet list inline on a phone. A single sticky "Filtrer" button opens a bottom
 * sheet, the grid stays two-up and visible, and the sheet has a persistent
 * "Voir les résultats (12)" action so the shopper always knows what they'll get
 * before dismissing it.
 *
 * `lockedCategory` is passed on a single-category page (e.g. /laveuses), which
 * hides the category facet — filtering by category on a category page is noise.
 */
export function CatalogBrowser({
  products,
  locale,
  dict,
  lockedCategory,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  lockedCategory?: CategoryId;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const hydrated = useRef(false);

  // Read state out of the URL on mount and on back/forward.
  useEffect(() => {
    setFilters(filtersFromParams(new URLSearchParams(searchParams.toString())));
    hydrated.current = true;
  }, [searchParams]);

  const update = useCallback(
    (next: FilterState, changed?: { facet: string; value: string }) => {
      setFilters(next);
      // `scroll: false` keeps the shopper's place in the grid — re-anchoring to
      // the top of the page on every checkbox is disorienting.
      router.replace(pathname + filtersToQuery(next), { scroll: false });
      if (changed) track({ event: 'filter_used', facet: changed.facet, value: changed.value });
    },
    [pathname, router],
  );

  const onToggle = useCallback(
    (facet: keyof Omit<FilterState, 'sort'>, value: string) =>
      update(toggle(filters, facet, value), { facet, value }),
    [filters, update],
  );

  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const activeCount = activeFilterCount(filters);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  /* ── Facet options, each counted against the other facets ──────────────── */

  const brandCounts = facetCounts(products, filters, 'brands', (p) => p.brand);
  const conditionCounts = facetCounts(products, filters, 'conditions', (p) => p.condition);
  const availabilityCounts = facetCounts(products, filters, 'availability', (p) => p.inventoryStatus);
  const finishCounts = facetCounts(products, filters, 'finishes', (p) => p.finish);
  const categoryCounts = facetCounts(products, filters, 'categories', (p) => p.category);
  const priceCounts = bucketCounts(products, filters, 'priceBuckets', PRICE_BUCKETS, (p) => p.price);
  const widthCounts = bucketCounts(
    products, filters, 'widthBuckets', WIDTH_BUCKETS, (p) => p.dimensions?.width,
  );

  const opt = (value: string, label: string, counts: Record<string, number>): FacetOption => ({
    value, label, count: counts[value] ?? 0,
  });

  const categoryOptions = CATEGORY_LIST
    .map((c) => opt(c.id, c.label[locale], categoryCounts))
    .filter((o) => o.count > 0 || filters.categories.includes(o.value as CategoryId));

  const brandOptions = [...new Set(products.map((p) => p.brand))]
    .sort((a, b) => a.localeCompare(b, locale))
    .map((b) => opt(b, b, brandCounts));

  const conditionOptions = CONDITION_ORDER
    .map((c) => opt(c, dict.condition[
      c === 'open-box' ? 'openBox' : (c as 'new' | 'used' | 'refurbished' | 'clearance')
    ], conditionCounts))
    .filter((o) => o.count > 0 || filters.conditions.includes(o.value as never));

  const availabilityOptions = AVAILABILITY_ORDER.map((a) =>
    opt(a, dict.availability[
      a === 'in-stock' ? 'inStock' : a === 'low-stock' ? 'lowStock' : 'onRequest'
    ], availabilityCounts),
  );

  const finishOptions = [...new Set(products.map((p) => p.finish).filter(Boolean))]
    .map((f) => opt(f as string, FINISH_LABELS[f as string]?.[locale] ?? (f as string), finishCounts));

  const priceOptions = PRICE_BUCKETS.map((b) => opt(b.id, b.label[locale], priceCounts));
  const widthOptions = WIDTH_BUCKETS.map((b) => opt(b.id, b.label[locale], widthCounts));

  const panel = (
    <>
      {!lockedCategory && (
        <FilterGroup
          title={dict.catalog.facets.category}
          options={categoryOptions}
          selected={filters.categories}
          onToggle={(v) => onToggle('categories', v)}
        />
      )}
      <FilterGroup
        title={dict.catalog.facets.price}
        options={priceOptions}
        selected={filters.priceBuckets}
        onToggle={(v) => onToggle('priceBuckets', v)}
      />
      <FilterGroup
        title={dict.catalog.facets.brand}
        options={brandOptions}
        selected={filters.brands}
        onToggle={(v) => onToggle('brands', v)}
      />
      <FilterGroup
        title={dict.catalog.facets.condition}
        options={conditionOptions}
        selected={filters.conditions}
        onToggle={(v) => onToggle('conditions', v)}
      />
      <FilterGroup
        title={dict.catalog.facets.availability}
        options={availabilityOptions}
        selected={filters.availability}
        onToggle={(v) => onToggle('availability', v)}
      />
      <FilterGroup
        title={dict.catalog.facets.width}
        options={widthOptions}
        selected={filters.widthBuckets}
        onToggle={(v) => onToggle('widthBuckets', v)}
        defaultOpen={false}
      />
      <FilterGroup
        title={dict.catalog.facets.colour}
        options={finishOptions}
        selected={filters.finishes}
        onToggle={(v) => onToggle('finishes', v)}
        defaultOpen={false}
      />
    </>
  );

  return (
    <div className="container-page pb-24 pt-8 sm:pt-10">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-[var(--nav-h)] z-30 -mx-5 mb-8 border-y border-line bg-canvas/90 px-5 backdrop-blur-xl sm:-mx-10 sm:px-10 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <div className="flex h-14 items-center justify-between gap-4 lg:h-auto lg:pb-6">
          <p className="tnum text-sm text-ink-2">
            <span className="font-medium text-ink">{results.length}</span>{' '}
            {results.length === 1 ? dict.catalog.resultsOne : dict.catalog.resultsMany}
          </p>

          <div className="flex items-center gap-2">
            <label className="hidden items-center gap-2 lg:flex">
              <span className="text-xs uppercase tracking-[0.1em] text-ink-3">
                {dict.catalog.sort}
              </span>
              <select
                value={filters.sort}
                onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}
                className="min-h-11 rounded-[2px] border border-line bg-surface px-3 text-sm text-ink"
              >
                {(Object.keys(dict.catalog.sortOptions) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {dict.catalog.sortOptions[k]}
                  </option>
                ))}
              </select>
            </label>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
                className="hidden min-h-11 items-center px-2 text-sm text-ink-2 underline underline-offset-4 hover:text-ink lg:inline-flex"
              >
                {dict.catalog.clearAll}
              </button>
            )}

            {/* Mobile: one button, never an inline facet list. */}
            <Button
              type="button"
              onClick={() => setSheetOpen(true)}
              variant="secondary"
              className="lg:hidden"
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.75} />
              {dict.catalog.filter}
              {activeCount > 0 && (
                <span className="tnum inline-flex size-5 items-center justify-center rounded-full bg-accent text-[0.625rem] font-semibold text-accent-ink">
                  {activeCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12 xl:grid-cols-[17rem_1fr]">
        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)]">
            <h2 className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
              {dict.catalog.filters}
            </h2>
            <div className="border-t border-line">{panel}</div>
          </div>
        </aside>

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        <div>
          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-5 border border-line bg-surface p-8 sm:p-12">
              <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink">
                {dict.catalog.empty.title}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-ink-2">
                {dict.catalog.empty.body}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
                >
                  {dict.catalog.empty.cta}
                </Button>
                <StoreActionButton mode="call" source="catalog_empty" dict={dict} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] border border-line-strong px-6 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink hover:bg-surface">
                  {dict.common.callUs}
                </StoreActionButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
              {results.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  dict={dict}
                  priority={i < 4}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile bottom sheet ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[65] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-ink/30" onClick={() => setSheetOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={dict.catalog.filters}
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl bg-canvas"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-medium text-ink">
                  {dict.catalog.filters}
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label={dict.common.close}
                  className="-mr-2 inline-flex size-11 items-center justify-center text-ink"
                >
                  <X className="size-5" strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5">
                <div className="py-1">
                  <label className="flex flex-col gap-2 border-b border-line py-4">
                    <span className="text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink">
                      {dict.catalog.sort}
                    </span>
                    <select
                      value={filters.sort}
                      onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}
                      className="min-h-12 rounded-[2px] border border-line bg-surface px-3 text-sm text-ink"
                    >
                      {(Object.keys(dict.catalog.sortOptions) as SortKey[]).map((k) => (
                        <option key={k} value={k}>
                          {dict.catalog.sortOptions[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {panel}
                </div>
              </div>

              <div
                className="flex items-center gap-3 border-t border-line px-5 py-4"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
                  className="shrink-0"
                >
                  {dict.catalog.clear}
                </Button>
                <Button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  size="lg"
                  className="flex-1"
                >
                  {dict.catalog.apply} ({results.length})
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
