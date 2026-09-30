import type { Product } from '@/lib/catalog/types';

/**
 * TWO WRITERS, ONE CATALOGUE
 * ==========================
 * The owner edits products in the admin, which persists the whole catalogue
 * as one document in Blob. The developer edits products in the committed
 * seed (data/inventory.json) and deploys. Before this merge, the first admin
 * save froze the catalogue to that document and every later seed change was
 * silently ignored — the site kept serving the document.
 *
 * Rule: a seed product lands in the document when it changed since the seed
 * was last folded in, and it replaces the document's copy only when it is
 * the more recent of the two. Last write wins, per product, by `updatedAt`
 * — the admin stamps `updatedAt` on every save and the seed scripts do too.
 *
 *  · new in the seed              → added
 *  · edited in the seed, untouched in admin → replaced
 *  · edited in both               → the later edit wins
 *  · created in the admin only    → untouched (the seed never had it)
 *  · deleted in the admin, unchanged in the seed → stays deleted
 *  · deleted in the admin, then edited in the seed → comes back (deliberate)
 *
 * `seedSyncedAt` is the watermark. A document written before this merge
 * existed has none; its baseline is then the newest `updatedAt` it holds,
 * which is the moment of the save that created it — every seed product
 * older than that was already in it.
 */
export interface InventoryDoc {
  products: Product[];
  /** ISO time up to which seed products have been folded in. */
  seedSyncedAt?: string;
}

const ms = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : 0;
};

export function mergeSeed(doc: InventoryDoc, seed: Product[]): InventoryDoc & { changed: boolean } {
  const baseline = doc.seedSyncedAt
    ? ms(doc.seedSyncedAt)
    : doc.products.reduce((m, p) => Math.max(m, ms(p.updatedAt)), 0);

  const byId = new Map(doc.products.map((p) => [p.id, p]));
  let changed = false;
  let newest = baseline;

  for (const s of seed) {
    const t = ms(s.updatedAt);
    newest = Math.max(newest, t);
    if (t <= baseline) continue; // already folded in (or deleted since — stays deleted)
    const existing = byId.get(s.id);
    if (existing && ms(existing.updatedAt) >= t) continue; // the admin edited it later
    byId.set(s.id, s);
    changed = true;
  }

  const seedSyncedAt = new Date(newest).toISOString();
  // Persist the watermark the first time too, so the baseline stops depending
  // on the document's contents.
  if (doc.seedSyncedAt !== seedSyncedAt) changed = true;

  return { products: [...byId.values()], seedSyncedAt, changed };
}
