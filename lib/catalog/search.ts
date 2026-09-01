import type { CategoryId, Product } from './types';
import { CATEGORIES } from './categories';
import { href, type Locale } from '@/lib/i18n/config';
import { normalise } from './provider';

/**
 * A deliberately small payload for client-side instant search.
 *
 * The whole catalogue is serialised into the page as ~120 bytes per product.
 * At the scale of an independent appliance store (hundreds, not millions of
 * SKUs) that is far cheaper and far faster than a search API round trip, and
 * it means results appear on the first keystroke with no spinner.
 *
 * If the catalogue ever passes ~2,000 units, move this behind a route handler
 * and debounce — the component contract stays identical.
 */
export interface SearchItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryId: string;
  price: number;
  url: string;
  image: string | null;
  /** Pre-normalised search haystack — built once on the server. */
  q: string;
}

/**
 * COLLOQUIAL SEARCH TERMS
 * =======================
 * People do not type "réfrigérateur à portes françaises". They type "fridge",
 * "frigo", "stove", "poêle", "washer dryer". The catalogue's own wording is
 * formal retail French and English, so without these the brief's own example
 * query — "Samsung fridge" — returns nothing.
 *
 * Terms are folded into each product's search haystack, never displayed, so
 * they change what is findable without changing what anyone reads.
 *
 * Deliberately NOT included: manufacturer names used generically ("frigidaire"
 * for any fridge). Frigidaire is a real brand in the catalogue, and blurring it
 * into a category alias would break the brand facet's precision.
 */
const CATEGORY_ALIASES: Record<CategoryId, string[]> = {
  refrigerators: [
    'fridge', 'fridges', 'frigo', 'frigos', 'refrigerator', 'refrigerateur',
    'french door', 'portes francaises', 'side by side', 'cote a cote',
    'top freezer', 'bottom freezer', 'congelateur en haut', 'congelateur en bas',
  ],
  washers: [
    'washer', 'washers', 'washing machine', 'laveuse', 'laveuses',
    'front load', 'top load', 'frontale', 'chargement vertical',
  ],
  dryers: ['dryer', 'dryers', 'secheuse', 'secheuses', 'gas dryer', 'secheuse au gaz'],
  'laundry-sets': [
    'set', 'sets', 'ensemble', 'ensembles', 'pair', 'paire', 'combo',
    'washer dryer', 'washer and dryer', 'laveuse secheuse', 'laundry set',
    'duo', 'buanderie', 'laundry',
  ],
  ranges: [
    'stove', 'stoves', 'range', 'ranges', 'cuisiniere', 'cuisinieres', 'poele',
    'oven', 'four', 'cooktop', 'induction', 'gas range', 'cuisiniere au gaz',
  ],
  dishwashers: [
    'dishwasher', 'dishwashers', 'lave vaisselle', 'lave-vaisselle',
    'laveuse a vaisselle', 'built in', 'encastre', 'portable', 'portatif',
  ],
  freezers: [
    'freezer', 'freezers', 'congelateur', 'congelateurs', 'congelo',
    'chest freezer', 'congelateur coffre', 'upright', 'vertical',
  ],
};

export function toSearchItems(products: Product[], locale: Locale): SearchItem[] {
  return products.map((p) => {
    const cat = CATEGORIES[p.category];
    return {
      id: p.id,
      name: p.name[locale],
      brand: p.brand,
      category: cat.label[locale],
      categoryId: p.category,
      price: p.price,
      url: href(locale, cat.route, p.slug),
      image: p.images[0]?.src ?? null,
      q: normalise(
        [
          p.brand,
          p.name.fr,
          p.name.en,
          p.model ?? '',
          p.sku,
          cat.label.fr,
          cat.label.en,
          p.colour?.fr ?? '',
          p.colour?.en ?? '',
          ...CATEGORY_ALIASES[p.category],
        ].join(' '),
      ),
    };
  });
}

/**
 * Every term must match somewhere in the haystack (AND, not OR), so
 * "samsung fridge" narrows instead of widening. Ranking puts brand-prefix and
 * name-prefix hits first, which is what makes typing "lg" feel correct.
 */
export function searchItems(items: SearchItem[], query: string, limit = 8): SearchItem[] {
  const terms = normalise(query).split(' ').filter(Boolean);
  if (!terms.length) return [];

  const scored: { item: SearchItem; score: number }[] = [];

  for (const item of items) {
    if (!terms.every((t) => item.q.includes(t))) continue;

    let score = 0;
    for (const t of terms) {
      if (normalise(item.brand).startsWith(t)) score += 6;
      if (normalise(item.name).startsWith(t)) score += 4;
      if (normalise(item.category).includes(t)) score += 2;
      score += 1;
    }
    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
    .slice(0, limit)
    .map((s) => s.item);
}
