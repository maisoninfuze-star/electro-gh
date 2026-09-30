import { put, del, get, head, list as listBlobs, BlobNotFoundError } from '@vercel/blob';
import type { Product } from '@/lib/catalog/types';
import type { InventoryStore, StoreInfo } from './adapter';
import { readSeed } from './local';
import { mergeSeed, type InventoryDoc } from './merge';

const DOC = 'inventory/inventory.json';
const IMG_PREFIX = 'inventory/images/';

type Access = 'public' | 'private';

/**
 * Vercel Blob backend.
 *
 * One `inventory.json` document at a stable path (`addRandomSuffix: false`,
 * `allowOverwrite: true` — since @vercel/blob 1.0 a put over an existing
 * pathname throws without it), plus one blob per uploaded image.
 *
 * PUBLIC OR PRIVATE STORE
 * -----------------------
 * A Blob store is created as either public or private and the SDK refuses
 * the other access mode ("Cannot use public access on a private store").
 * The owner's store turned out to be private (30 Sept 2026), which had
 * rejected every admin save. Rather than ask him to recreate it, this module
 * learns the mode on first contact and works with either:
 *
 *   public   the document and images are fetched by URL; images are served
 *            straight from the Blob CDN.
 *   private  the document is read through the SDK (`get`), and images are
 *            stored under a name we choose and streamed through
 *            /uploads/<name> by app/uploads/[name]/route.ts — the same URL
 *            shape the local backend uses.
 *
 * THE SEED IS STILL A WRITER
 * --------------------------
 * data/inventory.json keeps changing through deploys (new units, corrected
 * prices) after the admin has started saving. Every read folds seed changes
 * into the document with mergeSeed() — see merge.ts for the rule — and
 * persists the result once per change, so neither writer silently loses
 * work.
 *
 * READS NEVER THROW. A storage hiccup of any kind must not take the
 * storefront down: not-found → seed (expected before the first save);
 * anything else → log loudly and serve the seed too. The SDK's error classes
 * do not set `name`, so they are matched with instanceof or by message.
 */
let access: Access | null = null;

const isPrivateStoreError = (e: unknown): boolean =>
  e instanceof Error && /private store|private access/i.test(e.message);

/** Runs a write in the learned mode; on a private-store rejection, learns and retries. */
async function withAccess<T>(fn: (mode: Access) => Promise<T>): Promise<T> {
  const first = access ?? 'public';
  try {
    const out = await fn(first);
    access ??= first;
    return out;
  } catch (e) {
    if (first === 'public' && isPrivateStoreError(e)) {
      const out = await fn('private');
      access = 'private';
      return out;
    }
    throw e;
  }
}

const parseDoc = (raw: unknown): InventoryDoc | null => {
  const d = raw as Partial<InventoryDoc> | null;
  if (!d || !Array.isArray(d.products)) return null;
  return { products: d.products, seedSyncedAt: typeof d.seedSyncedAt === 'string' ? d.seedSyncedAt : undefined };
};

async function readDoc(): Promise<InventoryDoc | null> {
  let url: string;
  try {
    url = (await head(DOC)).url;
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null; // nothing saved yet
    console.error('[store] Blob head() failed — serving the committed seed.', e);
    return null;
  }
  try {
    if (access !== 'private') {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        access ??= 'public';
        return parseDoc(await res.json());
      }
      // A private store refuses the plain URL; fall through to the SDK read.
    }
    const r = await get(DOC, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200) return null;
    access = 'private';
    return parseDoc(JSON.parse(await new Response(r.stream).text()));
  } catch (e) {
    console.error('[store] inventory.json in Blob unreadable — serving the committed seed.', e);
    return null;
  }
}

async function writeDoc(doc: InventoryDoc): Promise<void> {
  const body = JSON.stringify(doc, null, 2);
  await withAccess((mode) =>
    put(DOC, body, {
      access: mode,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
    }),
  );
}

/**
 * The catalogue as it should be right now: the stored document with any
 * newer seed changes folded in, or the seed alone before the first save.
 */
async function current(): Promise<{ doc: InventoryDoc; exists: boolean; changed: boolean }> {
  const seed = await readSeed();
  const stored = await readDoc();
  if (!stored) {
    const m = mergeSeed({ products: [] }, seed);
    return { doc: { products: m.products, seedSyncedAt: m.seedSyncedAt }, exists: false, changed: false };
  }
  const m = mergeSeed(stored, seed);
  return { doc: { products: m.products, seedSyncedAt: m.seedSyncedAt }, exists: true, changed: m.changed };
}

let queue: Promise<unknown> = Promise.resolve();
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
};

/** Persist a merged document at most once per watermark per instance, never throwing. */
let persistedFor: string | undefined;
async function persistMerged(doc: InventoryDoc): Promise<void> {
  if (persistedFor === doc.seedSyncedAt) return;
  persistedFor = doc.seedSyncedAt;
  try {
    await serial(() => writeDoc(doc));
  } catch (e) {
    console.error('[store] could not persist the merged catalogue — serving it unsaved.', e);
  }
}

async function readAll(): Promise<Product[]> {
  const { doc, exists, changed } = await current();
  if (exists && changed) await persistMerged(doc);
  return doc.products;
}

export const blobStore: InventoryStore = {
  kind: 'blob',

  list: readAll,

  async get(id) {
    return (await readAll()).find((p) => p.id === id) ?? null;
  },

  upsert(product) {
    return serial(async () => {
      const { doc } = await current();
      const i = doc.products.findIndex((p) => p.id === product.id);
      if (i >= 0) doc.products[i] = product;
      else doc.products.push(product);
      await writeDoc(doc);
      persistedFor = doc.seedSyncedAt;
      return product;
    });
  },

  remove(id) {
    return serial(async () => {
      const { doc } = await current();
      doc.products = doc.products.filter((p) => p.id !== id);
      await writeDoc(doc);
      persistedFor = doc.seedSyncedAt;
    });
  },

  async putImage(name, bytes, contentType) {
    return withAccess(async (mode) => {
      if (mode === 'public') {
        const blob = await put(IMG_PREFIX + name, bytes, { access: 'public', contentType, addRandomSuffix: true });
        return blob.url;
      }
      // Private: keep our own (already unique) name so /uploads/<name> can find it.
      await put(IMG_PREFIX + name, bytes, { access: 'private', contentType, addRandomSuffix: false });
      return `/uploads/${name}`;
    });
  },

  async deleteImage(url) {
    try {
      if (url.startsWith('/uploads/')) await del(IMG_PREFIX + url.slice('/uploads/'.length));
      else if (url.includes('blob.vercel-storage.com')) await del(url);
    } catch {
      /* already gone */
    }
  },

  async info(): Promise<StoreInfo> {
    const { doc, exists } = await current();
    return { kind: 'blob', source: exists ? 'document' : 'seed', access, seedSyncedAt: doc.seedSyncedAt ?? null };
  },
};

/** Streams a privately stored image for /uploads/<name>. Null when absent. */
export async function readImage(name: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  try {
    const r = await get(IMG_PREFIX + name, { access: 'private' });
    if (!r || r.statusCode !== 200) return null;
    return { stream: r.stream, contentType: r.blob.contentType || 'image/webp' };
  } catch (e) {
    if (!(e instanceof BlobNotFoundError)) console.error('[store] image read failed', e);
    return null;
  }
}

/** Exposed for the admin "storage" panel: how many image blobs exist. */
export async function countImageBlobs(): Promise<number> {
  const r = await listBlobs({ prefix: IMG_PREFIX, limit: 1000 });
  return r.blobs.length;
}
