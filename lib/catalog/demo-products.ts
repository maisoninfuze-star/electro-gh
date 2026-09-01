import type { Product, CategoryId, Condition, InventoryStatus, ProductImage } from './types';
import { CATEGORIES } from './categories';

/* ============================================================================
 *  ⚠️  DEMO DATASET — NOT REAL ELECTRO GH INVENTORY  ⚠️
 * ============================================================================
 *
 *  Every product below is FABRICATED for design and development purposes.
 *  Model numbers, prices, dimensions and stock levels are illustrative and do
 *  NOT describe any unit that Électroménagers GH has ever had in stock.
 *
 *  The brands named are real manufacturers and are used only to demonstrate
 *  the brand facet. Product photography here is GENERIC, UNBRANDED category
 *  imagery (`kind: 'placeholder'`) — it is not a photograph of a specific unit,
 *  which is why no product below carries a manufacturer badge.
 *
 *  Guarded at runtime by IS_DEMO_DATA: the site renders a visible demo ribbon
 *  while this flag is true. Replace this module with a real provider (see
 *  ./provider.ts) and set the flag false before the site goes live.
 *
 *  What is deliberately ABSENT and must never be back-filled by guesswork:
 *    · warranty terms      · delivery pricing     · financing
 *    · energy ratings      · manufacturer specs   · business history
 * ========================================================================== */

export const IS_DEMO_DATA = true;

/** Generic category imagery, reused as demo product photography. */
const img = (cat: CategoryId): ProductImage[] => [CATEGORIES[cat].image];

type Seed = {
  slug: string;
  sku: string;
  brand: string;
  model?: string;
  fr: string;
  en: string;
  cat: CategoryId;
  price: number;
  was?: number;
  cond: Condition;
  stock: InventoryStatus;
  finish?: Product['finish'];
  colourFr?: string;
  colourEn?: string;
  w?: number;
  h?: number;
  d?: number;
  descFr?: string;
  descEn?: string;
  notesFr?: string;
  notesEn?: string;
  featured?: boolean;
  deal?: boolean;
  /** days ago — drives the "new arrivals" ordering deterministically */
  age: number;
  /** set true to exercise the honest "photo à venir" empty state */
  noPhoto?: boolean;
};

const FINISH_LABEL: Record<NonNullable<Product['finish']>, { fr: string; en: string }> = {
  stainless: { fr: 'Acier inoxydable', en: 'Stainless steel' },
  white: { fr: 'Blanc', en: 'White' },
  black: { fr: 'Noir', en: 'Black' },
  'black-stainless': { fr: 'Acier inoxydable noir', en: 'Black stainless' },
  slate: { fr: 'Ardoise', en: 'Slate' },
  other: { fr: 'Autre', en: 'Other' },
};

/** Fixed epoch so `createdAt` is deterministic across builds. */
const EPOCH = Date.parse('2026-08-25T12:00:00Z');

function build(s: Seed): Product {
  const finish = s.finish;
  return {
    id: s.sku.toLowerCase(),
    slug: s.slug,
    sku: s.sku,
    brand: s.brand,
    model: s.model,
    name: { fr: s.fr, en: s.en },
    description: s.descFr && s.descEn ? { fr: s.descFr, en: s.descEn } : undefined,
    category: s.cat,
    price: s.price,
    compareAtPrice: s.was,
    condition: s.cond,
    inventoryStatus: s.stock,
    finish,
    colour: finish
      ? { fr: s.colourFr ?? FINISH_LABEL[finish].fr, en: s.colourEn ?? FINISH_LABEL[finish].en }
      : undefined,
    dimensions: s.w || s.h || s.d ? { width: s.w, height: s.h, depth: s.d } : undefined,
    conditionNotes:
      s.notesFr && s.notesEn ? { fr: s.notesFr, en: s.notesEn } : undefined,
    images: s.noPhoto ? [] : img(s.cat),
    featured: s.featured,
    deal: s.deal,
    createdAt: new Date(EPOCH - s.age * 86_400_000).toISOString(),
  };
}

const SEEDS: Seed[] = [
  // ── Réfrigérateurs ───────────────────────────────────────────────────────
  {
    slug: 'refrigerateur-portes-francaises-36-acier-inoxydable',
    sku: 'GH-RF-1041', brand: 'Samsung', model: 'RF263BEAESR',
    fr: 'Réfrigérateur à portes françaises 36 po', en: '36" French door refrigerator',
    cat: 'refrigerators', price: 1195, was: 1595, cond: 'refurbished', stock: 'in-stock',
    finish: 'stainless', w: 35.75, h: 70, d: 33, featured: true, deal: true, age: 3,
    descFr: 'Grand format à portes françaises avec tiroir congélateur en bas. Intérieur propre, joints en bon état, testé en magasin avant la mise en vente.',
    descEn: 'Large french-door layout with a bottom freezer drawer. Clean interior, gaskets in good shape, tested in store before going on the floor.',
    notesFr: 'Reconditionné. Quelques marques légères sur le côté gauche, invisibles une fois installé.',
    notesEn: 'Refurbished. A few light marks on the left side panel, hidden once installed.',
  },
  {
    slug: 'refrigerateur-deux-portes-30-blanc',
    sku: 'GH-RF-1042', brand: 'Whirlpool', model: 'WRT318FZDW',
    fr: 'Réfrigérateur deux portes 30 po', en: '30" Top freezer refrigerator',
    cat: 'refrigerators', price: 649, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 29.75, h: 66, d: 31, age: 9,
    descFr: 'Format classique deux portes, congélateur en haut. Un choix simple et fiable pour un appartement ou une cuisine compacte.',
    descEn: 'Classic two-door layout with the freezer on top. A simple, dependable fit for an apartment or a compact kitchen.',
  },
  {
    slug: 'refrigerateur-cote-a-cote-36-acier-inoxydable',
    sku: 'GH-RF-1043', brand: 'LG', model: 'LRSXS2706S',
    fr: 'Réfrigérateur côte à côte 36 po', en: '36" Side-by-side refrigerator',
    cat: 'refrigerators', price: 1450, was: 1799, cond: 'open-box', stock: 'low-stock',
    finish: 'stainless', w: 35.75, h: 69.75, d: 31.5, deal: true, featured: true, age: 1,
    descFr: 'Côte à côte avec distributeur d’eau et de glace sur la porte. Boîte ouverte, jamais installé.',
    descEn: 'Side-by-side with a through-the-door water and ice dispenser. Open box, never installed.',
    notesFr: 'Boîte ouverte. Appareil neuf, emballage abîmé à la livraison.',
    notesEn: 'Open box. Unit is new; the packaging was damaged in transit.',
  },
  {
    slug: 'refrigerateur-compact-24-noir',
    sku: 'GH-RF-1044', brand: 'Danby', model: 'DAR044A6BDB',
    fr: 'Réfrigérateur compact 24 po', en: '24" Compact refrigerator',
    cat: 'refrigerators', price: 199, cond: 'refurbished', stock: 'in-stock',
    finish: 'black', w: 20.75, h: 33, d: 22, age: 14,
  },
  {
    slug: 'refrigerateur-portes-francaises-33-acier-noir',
    sku: 'GH-RF-1045', brand: 'GE', model: 'GNE25JBLTS',
    fr: 'Réfrigérateur à portes françaises 33 po', en: '33" French door refrigerator',
    cat: 'refrigerators', price: 1690, cond: 'new', stock: 'on-request',
    finish: 'black-stainless', w: 32.75, h: 69.5, d: 33.5, age: 6,
  },

  // ── Laveuses ─────────────────────────────────────────────────────────────
  {
    slug: 'laveuse-frontale-27-blanche',
    sku: 'GH-WA-2051', brand: 'Maytag', model: 'MHW5630HW',
    fr: 'Laveuse frontale 27 po', en: '27" Front load washer',
    cat: 'washers', price: 749, was: 949, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 27, h: 38.5, d: 31, deal: true, featured: true, age: 2,
    descFr: 'Laveuse frontale grande capacité. Tambour et joint de porte nettoyés à fond, cycle complet testé.',
    descEn: 'High-capacity front load washer. Drum and door gasket deep-cleaned, full cycle tested.',
  },
  {
    slug: 'laveuse-chargement-vertical-27-blanche',
    sku: 'GH-WA-2052', brand: 'Whirlpool', model: 'WTW4816FW',
    fr: 'Laveuse à chargement vertical 27 po', en: '27" Top load washer',
    cat: 'washers', price: 429, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 27.5, h: 42, d: 27, age: 11,
    descFr: 'Chargement vertical sans agitateur central, ce qui laisse plus de place pour les grosses brassées.',
    descEn: 'Top load with no centre agitator, which leaves more room for bulky loads.',
  },
  {
    slug: 'laveuse-frontale-27-acier-inoxydable',
    sku: 'GH-WA-2053', brand: 'LG', model: 'WM3600HVA',
    fr: 'Laveuse frontale 27 po', en: '27" Front load washer',
    cat: 'washers', price: 1099, was: 1299, cond: 'open-box', stock: 'low-stock',
    finish: 'slate', w: 27, h: 39, d: 30.25, deal: true, age: 4,
  },
  {
    slug: 'laveuse-compacte-24-blanche',
    sku: 'GH-WA-2054', brand: 'Bosch',
    fr: 'Laveuse compacte 24 po', en: '24" Compact washer',
    cat: 'washers', price: 899, cond: 'new', stock: 'on-request',
    finish: 'white', w: 23.5, h: 33.25, d: 25, age: 8, noPhoto: true,
  },

  // ── Sécheuses ────────────────────────────────────────────────────────────
  {
    slug: 'secheuse-electrique-27-blanche',
    sku: 'GH-DR-3061', brand: 'Maytag', model: 'MED5630HW',
    fr: 'Sécheuse électrique 27 po', en: '27" Electric dryer',
    cat: 'dryers', price: 699, was: 879, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 27, h: 38.5, d: 31, deal: true, age: 2,
    descFr: 'Sécheuse électrique assortie à la laveuse frontale du même modèle. Conduit et filtre nettoyés.',
    descEn: 'Electric dryer matched to the front load washer in the same line. Vent and lint filter cleaned.',
  },
  {
    slug: 'secheuse-electrique-29-blanche',
    sku: 'GH-DR-3062', brand: 'Whirlpool', model: 'WED4815EW',
    fr: 'Sécheuse électrique 29 po', en: '29" Electric dryer',
    cat: 'dryers', price: 379, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 29, h: 42, d: 28, age: 12,
  },
  {
    slug: 'secheuse-au-gaz-27-blanche',
    sku: 'GH-DR-3063', brand: 'Samsung', model: 'DVG45T3400W',
    fr: 'Sécheuse au gaz 27 po', en: '27" Gas dryer',
    cat: 'dryers', price: 649, cond: 'refurbished', stock: 'low-stock',
    finish: 'white', w: 27, h: 38.75, d: 31.5, age: 7,
    descFr: 'Sécheuse au gaz. Le raccordement au gaz doit être fait par un technicien qualifié.',
    descEn: 'Gas dryer. The gas connection must be made by a qualified technician.',
  },
  {
    slug: 'secheuse-compacte-24-blanche',
    sku: 'GH-DR-3064', brand: 'Bosch',
    fr: 'Sécheuse compacte 24 po', en: '24" Compact dryer',
    cat: 'dryers', price: 949, cond: 'new', stock: 'on-request',
    finish: 'white', w: 23.5, h: 33.25, d: 25, age: 8, noPhoto: true,
  },

  // ── Ensembles laveuse-sécheuse ───────────────────────────────────────────
  {
    slug: 'ensemble-laveuse-secheuse-frontal-27-blanc',
    sku: 'GH-SET-4071', brand: 'Maytag',
    fr: 'Ensemble laveuse-sécheuse frontal 27 po', en: '27" Front load washer & dryer set',
    cat: 'laundry-sets', price: 1349, was: 1828, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 54, h: 38.5, d: 31, deal: true, featured: true, age: 2,
    descFr: 'La laveuse et la sécheuse frontales assorties, vendues ensemble. Les deux appareils sont testés et prêts à installer. Empilables avec la trousse appropriée.',
    descEn: 'The matching front load washer and dryer, sold as a pair. Both units tested and ready to install. Stackable with the correct kit.',
    notesFr: 'Prix de l’ensemble. Les deux appareils sont reconditionnés.',
    notesEn: 'Set price. Both units are refurbished.',
  },
  {
    slug: 'ensemble-laveuse-secheuse-vertical-27-blanc',
    sku: 'GH-SET-4072', brand: 'Whirlpool',
    fr: 'Ensemble laveuse-sécheuse chargement vertical', en: 'Top load washer & dryer set',
    cat: 'laundry-sets', price: 799, was: 999, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 56, h: 42, d: 28, deal: true, age: 5,
    descFr: 'Ensemble à chargement vertical, le choix le plus économique pour équiper une buanderie au complet d’un coup.',
    descEn: 'Top load pair — the most affordable way to outfit a whole laundry room at once.',
  },
  {
    slug: 'ensemble-laveuse-secheuse-frontal-27-graphite',
    sku: 'GH-SET-4073', brand: 'LG',
    fr: 'Ensemble laveuse-sécheuse frontal 27 po', en: '27" Front load washer & dryer set',
    cat: 'laundry-sets', price: 2099, cond: 'new', stock: 'low-stock',
    finish: 'slate', w: 54, h: 39, d: 30.25, featured: true, age: 4,
  },

  // ── Cuisinières ──────────────────────────────────────────────────────────
  {
    slug: 'cuisiniere-electrique-30-acier-inoxydable',
    sku: 'GH-RA-5081', brand: 'Frigidaire', model: 'FCRE3052AS',
    fr: 'Cuisinière électrique 30 po', en: '30" Electric range',
    cat: 'ranges', price: 749, was: 949, cond: 'open-box', stock: 'in-stock',
    finish: 'stainless', w: 29.9, h: 47, d: 28.6, deal: true, featured: true, age: 3,
    descFr: 'Surface de cuisson vitrocéramique lisse et four à convection. Boîte ouverte, appareil jamais utilisé.',
    descEn: 'Smooth glass ceramic cooktop with a convection oven. Open box, never used.',
    notesFr: 'Boîte ouverte. Pellicule protectrice encore en place sur la façade.',
    notesEn: 'Open box. Protective film still on the front panel.',
  },
  {
    slug: 'cuisiniere-au-gaz-30-acier-inoxydable',
    sku: 'GH-RA-5082', brand: 'Samsung', model: 'NX60T8111SS',
    fr: 'Cuisinière au gaz 30 po', en: '30" Gas range',
    cat: 'ranges', price: 1099, cond: 'refurbished', stock: 'in-stock',
    finish: 'stainless', w: 29.9, h: 46.9, d: 28.5, age: 10,
    descFr: 'Cuisinière au gaz cinq brûleurs, avec grille centrale pour la plaque à mijoter.',
    descEn: 'Five-burner gas range with a centre grate for the griddle.',
  },
  {
    slug: 'cuisiniere-electrique-30-blanche',
    sku: 'GH-RA-5083', brand: 'GE', model: 'JCB630DKWW',
    fr: 'Cuisinière électrique 30 po', en: '30" Electric range',
    cat: 'ranges', price: 549, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 29.9, h: 47, d: 28, age: 13,
  },
  {
    slug: 'cuisiniere-induction-30-acier-inoxydable',
    sku: 'GH-RA-5084', brand: 'KitchenAid',
    fr: 'Cuisinière à induction 30 po', en: '30" Induction range',
    cat: 'ranges', price: 2299, cond: 'new', stock: 'on-request',
    finish: 'stainless', w: 29.9, h: 47, d: 28.9, age: 6,
  },
  {
    slug: 'cuisiniere-electrique-24-blanche',
    sku: 'GH-RA-5085', brand: 'Danby',
    fr: 'Cuisinière électrique 24 po', en: '24" Electric range',
    cat: 'ranges', price: 449, cond: 'refurbished', stock: 'low-stock',
    finish: 'white', w: 24, h: 45, d: 26, age: 15,
    descFr: 'Format 24 po, pratique quand l’ouverture standard de 30 po n’entre pas.',
    descEn: 'A 24" width, useful when the standard 30" opening simply isn’t there.',
  },

  // ── Lave-vaisselle ───────────────────────────────────────────────────────
  {
    slug: 'lave-vaisselle-encastre-24-acier-inoxydable',
    sku: 'GH-DW-6091', brand: 'Bosch', model: 'SHXM4AY55N',
    fr: 'Lave-vaisselle encastré 24 po', en: '24" Built-in dishwasher',
    cat: 'dishwashers', price: 799, was: 999, cond: 'open-box', stock: 'in-stock',
    finish: 'stainless', w: 23.6, h: 33.9, d: 23.8, deal: true, featured: true, age: 1,
    descFr: 'Lave-vaisselle encastré avec cuve en acier inoxydable et commandes sur la façade. Réputé pour son fonctionnement silencieux.',
    descEn: 'Built-in dishwasher with a stainless tub and front controls. Known for how quietly it runs.',
  },
  {
    slug: 'lave-vaisselle-encastre-24-blanc',
    sku: 'GH-DW-6092', brand: 'Whirlpool', model: 'WDF520PADW',
    fr: 'Lave-vaisselle encastré 24 po', en: '24" Built-in dishwasher',
    cat: 'dishwashers', price: 399, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 23.9, h: 34, d: 24.5, age: 9,
  },
  {
    slug: 'lave-vaisselle-portatif-24-acier-inoxydable',
    sku: 'GH-DW-6093', brand: 'Danby',
    fr: 'Lave-vaisselle portatif 24 po', en: '24" Portable dishwasher',
    cat: 'dishwashers', price: 549, cond: 'refurbished', stock: 'low-stock',
    finish: 'stainless', w: 23.6, h: 36, d: 25, age: 12,
    descFr: 'Sur roulettes, se branche au robinet. Une solution quand la plomberie ne permet pas un encastré.',
    descEn: 'On casters, connects to the faucet. A solution when the plumbing won’t allow a built-in.',
  },
  {
    slug: 'lave-vaisselle-encastre-24-acier-noir',
    sku: 'GH-DW-6094', brand: 'Samsung',
    fr: 'Lave-vaisselle encastré 24 po', en: '24" Built-in dishwasher',
    cat: 'dishwashers', price: 949, cond: 'new', stock: 'on-request',
    finish: 'black-stainless', w: 23.75, h: 33.9, d: 24.5, age: 7,
  },

  // ── Congélateurs ─────────────────────────────────────────────────────────
  {
    slug: 'congelateur-vertical-28-blanc',
    sku: 'GH-FZ-7101', brand: 'Frigidaire', model: 'FFFU16F2VW',
    fr: 'Congélateur vertical 28 po', en: '28" Upright freezer',
    cat: 'freezers', price: 649, was: 799, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 27.6, h: 64, d: 29.6, deal: true, age: 5,
    descFr: 'Congélateur vertical avec tablettes fixes. Plus facile à organiser qu’un coffre, et il prend moins de plancher.',
    descEn: 'Upright freezer with fixed shelves. Easier to organise than a chest, and it takes less floor space.',
  },
  {
    slug: 'congelateur-coffre-blanc',
    sku: 'GH-FZ-7102', brand: 'Danby', model: 'DCF070A5WDB',
    fr: 'Congélateur coffre 7 pi³', en: '7 cu. ft. Chest freezer',
    cat: 'freezers', price: 299, cond: 'refurbished', stock: 'in-stock',
    finish: 'white', w: 37.5, h: 33.5, d: 22.5, age: 10,
  },
  {
    slug: 'congelateur-vertical-24-blanc',
    sku: 'GH-FZ-7103', brand: 'GE',
    fr: 'Congélateur vertical 24 po', en: '24" Upright freezer',
    cat: 'freezers', price: 749, cond: 'new', stock: 'low-stock',
    finish: 'white', w: 23.75, h: 59.9, d: 26.5, age: 6,
  },
  {
    slug: 'congelateur-coffre-15-pi3-blanc',
    sku: 'GH-FZ-7104', brand: 'Whirlpool',
    fr: 'Congélateur coffre 15 pi³', en: '15 cu. ft. Chest freezer',
    cat: 'freezers', price: 549, was: 679, cond: 'clearance', stock: 'low-stock',
    finish: 'white', w: 52.9, h: 33.5, d: 27.9, deal: true, age: 16,
    notesFr: 'Liquidation. Bosselure sur le panneau arrière, sans effet sur le fonctionnement.',
    notesEn: 'Clearance. Dent on the rear panel, no effect on operation.',
  },
];

export const DEMO_PRODUCTS: Product[] = SEEDS.map(build);
