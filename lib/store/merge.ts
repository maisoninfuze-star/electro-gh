import type { Product } from '@/lib/catalog/types';

/**
 * TWO WRITERS, ONE CATALOGUE
 * ==========================
 * The owner edits products in the admin, which persists the whole catalogue
 * as one document in Blob. The developer edits products in the committed
 * seed (data/inventory.json) and deploys. Neither may silently undo the
 * other.
 *
 * This is a THREE-WAY MERGE. The document remembers `seedBase` — the seed as
 * it stood the last time it was folded in. Comparing the new seed with that
 * base says exactly what the developer changed; everything else in the
 * document is the owner's and is left alone.
 *
 *  seed vs base            document                 result
 *  ----------------------  -----------------------  -----------------------------
 *  new product             (absent)                 added
 *  field changed           has the product          ONLY the changed fields are
 *                                                   taken from the seed — a new
 *                                                   photo cannot undo the owner's
 *                                                   price, nor put a unit he
 *                                                   marked sold back on sale
 *  unchanged               anything                 untouched
 *  anything                owner deleted it         stays deleted
 *  product removed         owner never touched it   removed
 *  product removed         owner edited it          kept (his edit wins)
 *  (not in seed or base)   created in the admin     untouched
 *
 * When both sides changed the SAME field, the seed's value wins and
 * `updatedAt` is bumped: the developer's edit is the deliberate, reviewed
 * one, and the owner can change it back in the admin, where it then sticks.
 *
 * LEGACY DOCUMENTS (no `seedBase`). The base is rebuilt from the seed itself:
 * every seed product whose `updatedAt` is not after the document's watermark
 * (`seedSyncedAt`, or the newest `updatedAt` the document holds) was already
 * folded in, so it is its own base. Seed products stamped later have no base
 * and fall back to "newer whole record wins". Removals cannot be detected in
 * that first pass — deploy the merge before removing anything from the seed.
 */
export interface InventoryDoc {
  products: Product[];
  /** The seed as last folded in, by id. Absent on documents written before the three-way merge. */
  seedBase?: Record<string, Product>;
  /** ISO time of the newest seed stamp folded in. Informational once `seedBase` exists. */
  seedSyncedAt?: string;
}

const ms = (iso: string | undefined): number => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : 0;
};

/** Order-insensitive structural equality for JSON values. */
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((v, i) => same(v, bb[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  for (const k of keys) if (!same(ao[k], bo[k])) return false;
  return true;
}

/** Bookkeeping fields: never a reason to merge on their own, never copied field-wise. */
const META = new Set(['updatedAt', 'createdAt']);

export function mergeSeed(
  doc: InventoryDoc,
  seed: Product[],
  now: string = new Date().toISOString(),
): InventoryDoc & { changed: boolean } {
  const seedById = new Map(seed.map((p) => [p.id, p]));
  const byId = new Map(doc.products.map((p) => [p.id, p]));
  let changed = false;

  // ── Base: what the seed said last time ────────────────────────────────
  let base: Map<string, Product>;
  const legacy = !doc.seedBase;
  if (doc.seedBase) {
    base = new Map(Object.entries(doc.seedBase));
  } else {
    const watermark = doc.seedSyncedAt
      ? ms(doc.seedSyncedAt)
      : doc.products.reduce((m, p) => Math.max(m, ms(p.updatedAt)), 0);
    base = new Map(seed.filter((p) => ms(p.updatedAt) <= watermark).map((p) => [p.id, p]));
    changed = true; // persist the rebuilt base
  }

  for (const s of seed) {
    const b = base.get(s.id);
    const mine = byId.get(s.id);

    if (!b) {
      // New in the seed since the last sync (or stamped after a legacy watermark).
      if (!mine) {
        byId.set(s.id, s);
        changed = true;
      } else if (legacy && ms(s.updatedAt) > ms(mine.updatedAt) && !same(s, mine)) {
        byId.set(s.id, s); // no base to diff against: the newer whole record wins
        changed = true;
      }
      continue;
    }

    if (!mine) continue; // the owner deleted it — it stays deleted
    if (same(s, b)) continue; // the seed did not touch it

    // Field-level: take only what the seed actually changed.
    const next: Record<string, unknown> = { ...mine };
    let touched = false;
    const keys = new Set([...Object.keys(s), ...Object.keys(b)]);
    for (const k of keys) {
      if (META.has(k)) continue;
      const sv = (s as unknown as Record<string, unknown>)[k];
      const bv = (b as unknown as Record<string, unknown>)[k];
      if (same(sv, bv)) continue; // unchanged in the seed
      if (same(next[k], sv)) continue; // the document already has it
      if (sv === undefined) delete next[k];
      else next[k] = sv;
      touched = true;
    }
    if (touched) {
      next.updatedAt = now;
      byId.set(s.id, next as unknown as Product);
      changed = true;
    }
  }

  // ── Removed from the seed ─────────────────────────────────────────────
  for (const [id, b] of base) {
    if (seedById.has(id)) continue;
    const mine = byId.get(id);
    if (mine && same(mine, b)) {
      byId.delete(id); // never touched in the admin: the removal goes through
      changed = true;
    }
  }

  // ── New base = the seed as it stands ──────────────────────────────────
  const seedBase = Object.fromEntries(seed.map((p) => [p.id, p]));
  if (!legacy && !same(doc.seedBase, seedBase)) changed = true;

  const newest = seed.reduce((m, p) => Math.max(m, ms(p.updatedAt)), 0);
  const seedSyncedAt = new Date(newest).toISOString();

  return { products: [...byId.values()], seedBase, seedSyncedAt, changed };
}
