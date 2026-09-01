import type { CategoryDef, CategoryId, Room } from './types';
import type { Locale } from '@/lib/i18n/config';

/**
 * The seven categories the business actually sells, per the brief.
 * Each maps to a localised, SEO-clean route and to a room for the
 * "Shop by room" surfaces.
 *
 * `image` is generic CATEGORY imagery — an unbranded representative appliance,
 * never a specific unit in stock. Marked `kind: 'placeholder'` so it can never
 * be mistaken for product photography of a real item.
 */
export const CATEGORIES: Record<CategoryId, CategoryDef> = {
  refrigerators: {
    id: 'refrigerators',
    route: 'refrigerators',
    room: 'kitchen',
    order: 1,
    label: { fr: 'Réfrigérateurs', en: 'Refrigerators' },
    tagline: {
      fr: 'Deux portes, portes françaises, congélateur en bas.',
      en: 'Top freezer, french door, bottom freezer.',
    },
    image: {
      src: '/media/cat-refrigerators.webp',
      alt: 'Réfrigérateur en acier inoxydable à portes françaises',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  washers: {
    id: 'washers',
    route: 'washers',
    room: 'laundry',
    order: 2,
    label: { fr: 'Laveuses', en: 'Washers' },
    tagline: { fr: 'Frontales et à chargement vertical.', en: 'Front load and top load.' },
    image: {
      src: '/media/cat-washers.webp',
      alt: 'Laveuse frontale blanche',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  dryers: {
    id: 'dryers',
    route: 'dryers',
    room: 'laundry',
    order: 3,
    label: { fr: 'Sécheuses', en: 'Dryers' },
    tagline: { fr: 'Électriques et au gaz.', en: 'Electric and gas.' },
    image: {
      src: '/media/cat-dryers.webp',
      alt: 'Sécheuse frontale blanche',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  'laundry-sets': {
    id: 'laundry-sets',
    route: 'laundrySets',
    room: 'laundry',
    order: 4,
    label: { fr: 'Ensembles laveuse-sécheuse', en: 'Washer & dryer sets' },
    tagline: { fr: 'La paire assortie, à un seul prix.', en: 'The matched pair, one price.' },
    image: {
      src: '/media/cat-laundry-sets.webp',
      alt: 'Ensemble laveuse et sécheuse blanches côte à côte',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  ranges: {
    id: 'ranges',
    route: 'ranges',
    room: 'kitchen',
    order: 5,
    label: { fr: 'Cuisinières', en: 'Ranges & stoves' },
    tagline: { fr: 'Électriques, au gaz, à induction.', en: 'Electric, gas, induction.' },
    image: {
      src: '/media/cat-ranges.webp',
      alt: 'Cuisinière en acier inoxydable',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  dishwashers: {
    id: 'dishwashers',
    route: 'dishwashers',
    room: 'kitchen',
    order: 6,
    label: { fr: 'Lave-vaisselle', en: 'Dishwashers' },
    tagline: { fr: 'Encastrés et portatifs.', en: 'Built-in and portable.' },
    image: {
      src: '/media/cat-dishwashers.webp',
      alt: 'Lave-vaisselle en acier inoxydable',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
  freezers: {
    id: 'freezers',
    route: 'freezers',
    room: 'kitchen',
    order: 7,
    label: { fr: 'Congélateurs', en: 'Freezers' },
    tagline: { fr: 'Verticaux et coffres.', en: 'Upright and chest.' },
    image: {
      src: '/media/cat-freezers.webp',
      alt: 'Congélateur vertical blanc',
      width: 1400,
      height: 1800,
      kind: 'placeholder',
    },
  },
};

export const CATEGORY_LIST: CategoryDef[] = Object.values(CATEGORIES).sort(
  (a, b) => a.order - b.order,
);

export const categoriesInRoom = (room: Room): CategoryDef[] =>
  CATEGORY_LIST.filter((c) => c.room === room);

export const categoryLabel = (id: CategoryId, locale: Locale): string =>
  CATEGORIES[id].label[locale];

/** Reverse lookup: a route id back to its category, or null for shop/deals. */
export const categoryByRoute = (route: string): CategoryDef | null =>
  CATEGORY_LIST.find((c) => c.route === route) ?? null;
