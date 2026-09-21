import type { Locale, RouteId } from '@/lib/i18n/config';
import type { StoreId } from '@/content/business';

/**
 * PRODUCT DATA MODEL
 * ==================
 * Deliberately source-agnostic. Nothing in the UI imports the demo array —
 * everything goes through lib/catalog/provider.ts, so swapping in Supabase,
 * Shopify, Airtable, Google Sheets or a custom inventory API is one file.
 *
 * Honesty rules encoded in the types:
 *  - `specifications`, `dimensions`, `warranty` and `delivery` are OPTIONAL.
 *    A missing value renders a "call us to confirm" line, never a guess.
 *  - `condition` and `inventoryStatus` are closed unions. A feed can only
 *    surface a badge the business actually uses.
 *  - `compareAtPrice` is only meaningful when it is strictly greater than
 *    `price`; `savings()` enforces that so no card can show a fake discount.
 */

export type CategoryId =
  | 'refrigerators'
  | 'washers'
  | 'dryers'
  | 'laundry-sets'
  | 'ranges'
  | 'dishwashers'
  | 'freezers';

/**
 * `used` is the honest default for this store — the sign says "achat &
 * revente". `refurbished` implies work was done on the unit; only the owner
 * can say that, per unit, in the admin.
 */
export type Condition = 'new' | 'used' | 'refurbished' | 'open-box' | 'clearance';

/**
 * Publication state. ONLY `published` units appear on the public site.
 *   draft      imported or half-entered — needs a price/photo/confirmation
 *   published  live
 *   sold       gone; kept for the record, hidden everywhere public
 */
export type ProductStatus = 'draft' | 'published' | 'sold';

export type InventoryStatus = 'in-stock' | 'low-stock' | 'on-request';

export type Room = 'kitchen' | 'laundry';

export interface ProductImage {
  /** Path under /public or an absolute CDN url. */
  src: string;
  /** Alt text is required — describe the appliance, never the brand claim. */
  alt: string;
  width: number;
  height: number;
  /**
   * How this image was produced. Drives the fal.ai enhancement queue and lets
   * us show an honest "photo à venir" state instead of a broken frame.
   *   'original'  straight from the store, background not cleaned
   *   'studio'    background removed / normalised, e-commerce ready
   *   'placeholder' generic category imagery — NOT this exact unit
   *   'reference'   the manufacturer's photo of the same model. Shown with a
   *                 visible "photo de référence" label and NEVER without the
   *                 real unit's own photo alongside it — a pristine stock
   *                 image standing alone for a used machine would be a
   *                 misleading representation.
   */
  kind: 'original' | 'studio' | 'placeholder' | 'reference';
}

/** Free-form spec rows. Localised so EN and FR both read naturally. */
export interface SpecRow {
  label: Record<Locale, string>;
  value: Record<Locale, string>;
}

export interface Dimensions {
  /** Inches. `width` doubles as the catalog width facet. */
  width?: number;
  height?: number;
  depth?: number;
  depthWithDoorOpen?: number;
  weightLb?: number;
}

export interface Product {
  id: string;
  /** URL segment, unique within its category. */
  slug: string;
  sku: string;
  brand: string;
  /** Model number as printed on the unit. Optional — some used units lack one. */
  model?: string;

  name: Record<Locale, string>;
  description?: Record<Locale, string>;

  category: CategoryId;
  subcategory?: string;

  /** CAD, tax excluded. */
  price: number;
  /** Prior/regular price. Ignored unless strictly greater than `price`. */
  compareAtPrice?: number;

  condition: Condition;
  inventoryStatus: InventoryStatus;

  colour?: Record<Locale, string>;
  /** Normalised finish key for the colour facet. */
  finish?: 'stainless' | 'white' | 'black' | 'black-stainless' | 'slate' | 'other';

  specifications?: SpecRow[];
  dimensions?: Dimensions;

  /**
   * Per-product overrides. Left undefined the product page falls back to the
   * business-level copy, which itself says "call us" while unverified.
   * NEVER populate these from a manufacturer sheet without owner sign-off.
   */
  warranty?: Record<Locale, string>;
  delivery?: Record<Locale, string>;
  /** Condition notes for used/open-box units — scratches, missing shelf, etc. */
  conditionNotes?: Record<Locale, string>;

  images: ProductImage[];

  featured?: boolean;
  /** Marks the unit for the Deals / Liquidation surfaces. */
  deal?: boolean;

  /**
   * Which store physically holds this unit. When set, the product page's call
   * button dials that store directly; when absent, it opens the two-store
   * chooser. A used appliance is one physical object in one place, so a real
   * inventory feed should always fill this in.
   */
  storeId?: StoreId;

  status: ProductStatus;
  /** Admin-only. Never rendered publicly. "Sticker says $500 and $800 — confirm." */
  notes?: string;

  /** ISO 8601. Drives "new arrivals" ordering. */
  createdAt: string;
  updatedAt: string;
  soldAt?: string;
}

/** True only when there is a real, larger prior price. */
export const hasDiscount = (p: Product): boolean =>
  typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price;

/** Dollar savings, or 0. Never negative, never invented. */
export const savings = (p: Product): number =>
  hasDiscount(p) ? Math.round(p.compareAtPrice! - p.price) : 0;

export const savingsPercent = (p: Product): number =>
  hasDiscount(p) ? Math.round(((p.compareAtPrice! - p.price) / p.compareAtPrice!) * 100) : 0;

/** Category → the route it lives under, its room, and its display copy. */
export interface CategoryDef {
  id: CategoryId;
  route: RouteId;
  room: Room;
  label: Record<Locale, string>;
  /** Short line used on the large discovery tiles. */
  tagline: Record<Locale, string>;
  image: ProductImage;
  /** Ordering weight on the homepage grid. */
  order: number;
}
