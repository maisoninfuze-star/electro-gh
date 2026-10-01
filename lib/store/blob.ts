import {
  put,
  del,
  get,
  head,
  list as listBlobs,
  BlobNotFoundError,
  BlobPreconditionFailedError,
} from '@vercel/blob';
import type { Product } from '@/lib/catalog/types';
import { StoreUnavailableError, type InventoryStore, type StoreInfo } from './adapter';
import { readSeed } from './local';
import { mergeSeed, type InventoryDoc } from './merge';

const DOC = 'inventory/inventory.json';
const IMG_PREFIX = 'inventory/images/';

type Access = 'public' | 'private';

/**
 * Vercel Blob backend.
 *
 * One `inventory.json` document at a stable path, plus one blob per uploaded
 * image.
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
 *            straight from the Blob CDN. (The CDN may serve a document up to
 *            a minute stale; conditional writes keep that from losing data.)
 *   private  the document is read through the SDK with the cache bypassed,
 *            and images are stored under a name we choose and streamed
 *            through /uploads/<name> by app/uploads/[name]/route.ts — the
 *            same URL shape the local backend uses.
 *
 * THE SEED IS STILL A WRITER
 * --------------------------
 * data/inventory.json keeps changing through deploys after the admin has
 * started saving. Every read folds seed changes into the document with a
 * three-way merge (merge.ts) and persists the result, so neither writer
 * silently undoes the other.
 *
 * READS NEVER THROW. A storage hiccup must not take the storefront down:
 * not-found → seed (expected before the first save); anything else,
 * including a read that takes too long → log and serve the seed. The SDK's
 * error classes do not set `name`, so they are matched with instanceof or by
 * message.
 *
 * WRITES NEVER GUESS, AND NEVER RACE.
 *  · "Not found" and "could not read" are different answers. A save after a
 *    failed read would rebuild the document from the seed plus one change
 *    and overwrite everything the owner had saved — so it refuses instead.
 *  · Every write is conditional on the ETag it read (`ifMatch`), or on the
 *    document still not existing. Serverless instances share the store but
 *    not memory; without this, a page view persisting a merge on one
 *    instance could overwrite an admin save made on another. A lost race
 *    re-reads and retries (admin saves) or simply drops (merge persists —
 *    the next read will redo it).
 */
let access: Access | null = null;

/** Last storage failure on this instance, surfaced by /api/health — the runtime logs are not reachable. */
let lastError: string | null = null;
const note = (where: string, e: unknown) => {
  lastError = `${new Date().toISOString()} ${where}: ${e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e)}`.slice(0, 300);
};

const READ_TIMEOUT_MS = 6000;
const timeout = () => AbortSignal.timeout(READ_TIMEOUT_MS);

const isPrivateStoreError = (e: unknown): boolean =>
  e instanceof Error && /private store|private access/i.test(e.message);

const isConflict = (e: unknown): boolean =>
  e instanceof BlobPreconditionFailedError ||
  (e instanceof Error && /already exists|precondition/i.test(e.message));

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
  return {
    products: d.products,
    seedBase: d.seedBase && typeof d.seedBase === 'object' ? d.seedBase : undefined,
    seedSyncedAt: typeof d.seedSyncedAt === 'string' ? d.seedSyncedAt : undefined,
  };
};

type ReadResult =
  // `etag` is null only if the store returned none; writes then fall back to unconditional.
  | { status: 'ok'; doc: InventoryDoc; etag: string | null }
  | { status: 'missing' } // nothing saved yet — the seed is the catalogue
  | { status: 'error' }; // storage did not answer, or the document is unreadable

/**
 * The ETag for `ifMatch` must come from the Blob API's own metadata
 * (`head`), not from the download response's header: the first deployment of
 * conditional writes used the header and the store rejected every write.
 * `head` is called BEFORE the download on purpose — if someone writes in
 * between, our tag is the older one and our write fails safely; the other
 * order could pair a fresh tag with stale content.
 */
async function readPrivate(knownEtag?: string | null): Promise<ReadResult> {
  let etag = knownEtag;
  if (etag === undefined) {
    try {
      etag = (await head(DOC, { abortSignal: timeout() })).etag || null;
    } catch (e) {
      if (e instanceof BlobNotFoundError) return { status: 'missing' };
      throw e;
    }
  }
  const r = await get(DOC, { access: 'private', useCache: false, abortSignal: timeout() });
  if (!r) return { status: 'missing' };
  if (r.statusCode !== 200) return { status: 'error' };
  access = 'private';
  const doc = parseDoc(JSON.parse(await new Response(r.stream).text()));
  return doc ? { status: 'ok', doc, etag } : { status: 'error' };
}

async function readDoc(): Promise<ReadResult> {
  try {
    if (access === 'private') return await readPrivate();

    let meta: Awaited<ReturnType<typeof head>>;
    try {
      meta = await head(DOC, { abortSignal: timeout() });
    } catch (e) {
      if (e instanceof BlobNotFoundError) return { status: 'missing' };
      throw e;
    }
    const res = await fetch(meta.url, { cache: 'no-store', signal: timeout() });
    if (res.ok) {
      access ??= 'public';
      const doc = parseDoc(await res.json());
      return doc ? { status: 'ok', doc, etag: meta.etag || null } : { status: 'error' };
    }
    // A private store refuses the plain URL: read through the SDK instead.
    return await readPrivate(meta.etag || null);
  } catch (e) {
    note('read', e);
    console.error('[store] inventory.json in Blob unreadable — serving the committed seed.', e);
    return { status: 'error' };
  }
}

/**
 * Conditional write: only if the document is still the one we read
 * (`ifMatch`), or still absent (`allowOverwrite: false`). If the store gave
 * no ETag for an existing document, the write is unconditional — losing the
 * race protection is better than refusing every save.
 */
async function writeDoc(doc: InventoryDoc, prior: { exists: boolean; etag: string | null }): Promise<void> {
  const body = JSON.stringify(doc);
  const guard = prior.etag ? { ifMatch: prior.etag } : { allowOverwrite: prior.exists };
  await withAccess((mode) =>
    put(DOC, body, {
      access: mode,
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
      ...guard,
    }),
  );
}

const NOT_SAVED =
  'Le stockage n’a pas répondu : la modification n’a PAS été enregistrée, pour ne pas écraser le catalogue sauvegardé. Réessayez dans un instant.';
const BUSY =
  'Le catalogue a été modifié au même moment depuis un autre appareil : la modification n’a PAS été enregistrée. Réessayez.';

interface Current {
  doc: InventoryDoc;
  source: ReadResult['status'];
  etag: string | null;
  changed: boolean;
}

/**
 * The catalogue as it should be right now: the stored document with seed
 * changes folded in, or the seed alone before the first save.
 */
async function current(): Promise<Current> {
  const seed = await readSeed();
  const stored = await readDoc();
  if (stored.status !== 'ok') {
    const m = mergeSeed({ products: [] }, seed);
    return {
      doc: { products: m.products, seedBase: m.seedBase, seedSyncedAt: m.seedSyncedAt },
      source: stored.status,
      etag: null,
      changed: false,
    };
  }
  const m = mergeSeed(stored.doc, seed);
  return {
    doc: { products: m.products, seedBase: m.seedBase, seedSyncedAt: m.seedSyncedAt },
    source: 'ok',
    etag: stored.etag,
    changed: m.changed,
  };
}

let queue: Promise<unknown> = Promise.resolve();
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
};

/**
 * Persist a merged document after a read. Never throws. Losing the race to
 * another writer is fine — the next read merges again on top of their
 * version. A real failure backs off for a minute so a broken store does not
 * add a failing write to every page view.
 */
let persistBlockedUntil = 0;
async function persistMerged(cur: Current): Promise<void> {
  if (Date.now() < persistBlockedUntil) return;
  try {
    await serial(() => writeDoc(cur.doc, { exists: true, etag: cur.etag }));
  } catch (e) {
    note('persist', e);
    if (isConflict(e)) return;
    persistBlockedUntil = Date.now() + 60_000;
    console.error('[store] could not persist the merged catalogue — serving it unsaved.', e);
  }
}

async function readAll(): Promise<Product[]> {
  const cur = await current();
  if (cur.source === 'ok' && cur.changed) await persistMerged(cur);
  return cur.doc.products;
}

/**
 * Read–modify–write with retries on a lost race. Refuses after a failed read.
 *
 * A real race changes the document's ETag between attempts. If the store
 * rejects the SAME tag twice, the precondition itself is not usable here —
 * and an owner who cannot save at all is worse off than one who might, very
 * rarely, lose a simultaneous edit — so the write then goes through
 * unconditionally.
 */
function mutate(apply: (doc: InventoryDoc) => void): Promise<void> {
  return serial(async () => {
    let rejected: string | null | undefined;
    for (let attempt = 0; attempt < 4; attempt++) {
      const cur = await current();
      if (cur.source === 'error') throw new StoreUnavailableError(NOT_SAVED);
      apply(cur.doc);
      const exists = cur.source === 'ok';
      const sameTagRejected = exists && rejected !== undefined && rejected === cur.etag;
      try {
        await writeDoc(cur.doc, { exists, etag: sameTagRejected ? null : cur.etag });
        return;
      } catch (e) {
        note('save', e);
        if (!isConflict(e)) throw e;
        rejected = cur.etag;
      }
    }
    throw new StoreUnavailableError(BUSY);
  });
}

export const blobStore: InventoryStore = {
  kind: 'blob',

  list: readAll,

  async get(id) {
    return (await readAll()).find((p) => p.id === id) ?? null;
  },

  async upsert(product) {
    await mutate((doc) => {
      const i = doc.products.findIndex((p) => p.id === product.id);
      if (i >= 0) doc.products[i] = product;
      else doc.products.push(product);
    });
    return product;
  },

  remove(id) {
    return mutate((doc) => {
      doc.products = doc.products.filter((p) => p.id !== id);
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
    const stored = await readDoc();
    return {
      kind: 'blob',
      source: stored.status === 'ok' ? 'document' : stored.status === 'error' ? 'seed-fallback' : 'seed',
      access,
      seedSyncedAt: stored.status === 'ok' ? (stored.doc.seedSyncedAt ?? null) : null,
      seedBase: stored.status === 'ok' ? Boolean(stored.doc.seedBase) : false,
      lastError,
    };
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
