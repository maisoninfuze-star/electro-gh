import type { CategoryId, Condition, InventoryStatus, Product, ProductStatus } from '@/lib/catalog/types';
import type { StoreId } from '@/content/business';

/**
 * Form ↔ Product mapping and validation, shared by the server action (which
 * must never trust the browser) and the client form (which shows the same
 * messages before a round-trip).
 */

export const CATEGORY_IDS: CategoryId[] = [
  'refrigerators', 'washers', 'dryers', 'laundry-sets', 'ranges', 'dishwashers', 'freezers',
];
export const CONDITIONS: Condition[] = ['used', 'refurbished', 'open-box', 'new', 'clearance'];
export const AVAILABILITY: InventoryStatus[] = ['in-stock', 'low-stock', 'on-request'];
export const STATUSES: ProductStatus[] = ['draft', 'published', 'sold'];
export const FINISHES: NonNullable<Product['finish']>[] = [
  'white', 'stainless', 'black', 'black-stainless', 'slate', 'other',
];
export const STORE_IDS: StoreId[] = ['montreal', 'laval'];

/** French labels for the admin UI. */
export const LABELS = {
  category: {
    refrigerators: 'Réfrigérateur', washers: 'Laveuse', dryers: 'Sécheuse',
    'laundry-sets': 'Ensemble laveuse-sécheuse', ranges: 'Cuisinière',
    dishwashers: 'Lave-vaisselle', freezers: 'Congélateur',
  } satisfies Record<CategoryId, string>,
  condition: {
    used: 'Usagé', refurbished: 'Reconditionné', 'open-box': 'Boîte ouverte',
    new: 'Neuf', clearance: 'Liquidation',
  } satisfies Record<Condition, string>,
  availability: {
    'in-stock': 'En stock', 'low-stock': 'Faible stock', 'on-request': 'Sur demande',
  } satisfies Record<InventoryStatus, string>,
  status: { draft: 'Brouillon', published: 'Publié', sold: 'Vendu' } satisfies Record<ProductStatus, string>,
  finish: {
    white: 'Blanc', stainless: 'Acier inoxydable', black: 'Noir',
    'black-stainless': 'Inox noir', slate: 'Gris / platine', other: 'Autre',
  } satisfies Record<NonNullable<Product['finish']>, string>,
  store: { montreal: 'Montréal', laval: 'Laval' } satisfies Record<StoreId, string>,
};

/** The colour word shown to customers, derived from the finish key. */
const FINISH_COLOUR: Record<NonNullable<Product['finish']>, { fr: string; en: string }> = {
  white: { fr: 'Blanc', en: 'White' },
  stainless: { fr: 'Acier inoxydable', en: 'Stainless steel' },
  black: { fr: 'Noir', en: 'Black' },
  'black-stainless': { fr: 'Inox noir', en: 'Black stainless' },
  slate: { fr: 'Gris', en: 'Grey' },
  other: { fr: 'Autre', en: 'Other' },
};

export type FormErrors = Partial<Record<string, string>>;

export type ParsedForm = {
  values: Omit<Product, 'id' | 'slug' | 'sku' | 'createdAt' | 'updatedAt' | 'images'> & {
    images: Product['images'];
  };
  errors: FormErrors;
};

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const num = (fd: FormData, k: string): number | undefined => {
  const v = str(fd, k).replace(',', '.').replace(/[^\d.]/g, '');
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const oneOf = <T extends string>(v: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(v) ? (v as T) : fallback;

export function parseProductForm(fd: FormData): ParsedForm {
  const errors: FormErrors = {};

  const brand = str(fd, 'brand');
  const nameFr = str(fd, 'nameFr');
  const nameEn = str(fd, 'nameEn') || nameFr;
  const category = oneOf(str(fd, 'category'), CATEGORY_IDS, 'washers');
  const price = num(fd, 'price') ?? 0;
  const compareAtPrice = num(fd, 'compareAtPrice');
  const condition = oneOf(str(fd, 'condition'), CONDITIONS, 'used');
  const inventoryStatus = oneOf(str(fd, 'inventoryStatus'), AVAILABILITY, 'in-stock');
  const status = oneOf(str(fd, 'status'), STATUSES, 'draft');
  const finishRaw = str(fd, 'finish');
  const finish = finishRaw ? oneOf(finishRaw, FINISHES, 'other') : undefined;
  const storeRaw = str(fd, 'storeId');
  const storeId = storeRaw ? oneOf(storeRaw, STORE_IDS, 'montreal') : undefined;

  let images: Product['images'] = [];
  try {
    const raw = JSON.parse(str(fd, 'images') || '[]') as Product['images'];
    images = raw
      .filter((i) => i && typeof i.src === 'string' && i.src)
      .map((i) => ({
        src: i.src,
        alt: (typeof i.alt === 'string' && i.alt) || nameFr,
        width: Number(i.width) || 1600,
        height: Number(i.height) || 2000,
        kind: i.kind === 'studio' || i.kind === 'placeholder' || i.kind === 'reference' ? i.kind : 'original',
      }));
  } catch {
    errors.images = 'Liste de photos invalide.';
  }

  if (!brand) errors.brand = 'La marque est obligatoire.';
  if (!nameFr) errors.nameFr = 'Le nom (français) est obligatoire.';
  if (price < 0) errors.price = 'Le prix ne peut pas être négatif.';
  if (compareAtPrice !== undefined && compareAtPrice <= price) {
    errors.compareAtPrice = 'L’ancien prix doit être plus élevé que le prix actuel.';
  }
  // Publishing has a higher bar than saving: a live unit needs a real price
  // and at least one photo. A draft can be anything.
  if (status === 'published') {
    if (!(price > 0)) errors.price = 'Un prix est requis pour publier.';
    if (images.length === 0) errors.images = 'Au moins une photo est requise pour publier.';
  }

  const descFr = str(fd, 'descFr');
  const descEn = str(fd, 'descEn');
  const width = num(fd, 'width');
  const height = num(fd, 'height');
  const depth = num(fd, 'depth');
  const dims = { width, height, depth };
  const hasDims = Object.values(dims).some((v) => v !== undefined);

  return {
    errors,
    values: {
      brand,
      model: str(fd, 'model') || undefined,
      name: { fr: nameFr, en: nameEn },
      description: descFr || descEn ? { fr: descFr || descEn, en: descEn || descFr } : undefined,
      category,
      price,
      compareAtPrice,
      condition,
      inventoryStatus,
      finish,
      colour: finish ? FINISH_COLOUR[finish] : undefined,
      dimensions: hasDims ? dims : undefined,
      images,
      featured: fd.get('featured') === 'on',
      deal: fd.get('deal') === 'on',
      storeId,
      status,
      notes: str(fd, 'notes') || undefined,
      soldAt: undefined,
    },
  };
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
