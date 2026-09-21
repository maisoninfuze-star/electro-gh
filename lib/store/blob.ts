import { put, del, head, list as listBlobs } from '@vercel/blob';
import type { Product } from '@/lib/catalog/types';
import type { InventoryStore } from './adapter';
import { readSeed } from './local';

const DOC = 'inventory/inventory.json';
const IMG_PREFIX = 'inventory/images/';

/**
 * Vercel Blob backend.
 *
 * The inventory document is written with `addRandomSuffix: false` so it has a
 * stable path, and read back through `head()` → fetch with `cache: 'no-store'`
 * so an admin save is visible on the very next request. Images get random
 * suffixes (immutable, CDN-cacheable forever); the product record holds the
 * resulting URL.
 *
 * FIRST RUN: if the document does not exist yet, `list()` returns the
 * committed seed (data/inventory.json) so a fresh deploy shows the real
 * units, and the first admin write persists that seed plus the change.
 */
async function readDoc(): Promise<Product[] | null> {
  try {
    const meta = await head(DOC);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    const parsed = (await res.json()) as { products: Product[] };
    return parsed.products ?? [];
  } catch (e) {
    if ((e as { name?: string }).name === 'BlobNotFoundError') return null;
    throw e;
  }
}

async function readAll(): Promise<Product[]> {
  return (await readDoc()) ?? (await readSeed());
}

async function writeAll(products: Product[]): Promise<void> {
  await put(DOC, JSON.stringify({ products }, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
}

let queue: Promise<unknown> = Promise.resolve();
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
};

export const blobStore: InventoryStore = {
  kind: 'blob',

  list: readAll,

  async get(id) {
    return (await readAll()).find((p) => p.id === id) ?? null;
  },

  upsert(product) {
    return serial(async () => {
      const all = await readAll();
      const i = all.findIndex((p) => p.id === product.id);
      if (i >= 0) all[i] = product;
      else all.push(product);
      await writeAll(all);
      return product;
    });
  },

  remove(id) {
    return serial(async () => {
      const all = await readAll();
      await writeAll(all.filter((p) => p.id !== id));
    });
  },

  async putImage(name, bytes, contentType) {
    const blob = await put(IMG_PREFIX + name, bytes, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });
    return blob.url;
  },

  async deleteImage(url) {
    if (!url.includes('blob.vercel-storage.com')) return;
    try {
      await del(url);
    } catch {
      /* already gone */
    }
  },
};

/** Exposed for the admin "storage" panel: how many image blobs exist. */
export async function countImageBlobs(): Promise<number> {
  const r = await listBlobs({ prefix: IMG_PREFIX, limit: 1000 });
  return r.blobs.length;
}
