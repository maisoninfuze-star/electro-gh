import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Product } from '@/lib/catalog/types';
import { InventoryStore, StoreUnavailableError } from './adapter';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data', 'inventory.json');
/**
 * Uploads go to data/uploads and are served by app/uploads/[name]/route.ts —
 * NOT to /public, which Next snapshots at build time (a file added later is a
 * 404 under `next start`). The committed seed photos in public/inventory are
 * different: they exist at build time, so they are served statically.
 */
const IMG_DIR = path.join(ROOT, 'data', 'uploads');

/**
 * Local file backend. `data/inventory.json` is also the SEED the blob backend
 * falls back to before the owner has saved anything in production, so the
 * committed file is what a fresh deploy shows.
 *
 * Writes are serialised through a promise chain: two admin tabs saving at
 * once would otherwise race on read-modify-write of one file.
 */
let queue: Promise<unknown> = Promise.resolve();
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
};

async function readAll(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA, 'utf8');
    const parsed = JSON.parse(raw) as { products: Product[] };
    return parsed.products ?? [];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

async function writeAll(products: Product[]): Promise<void> {
  const tmp = DATA + '.tmp';
  await fs.mkdir(path.dirname(DATA), { recursive: true });
  await fs.writeFile(tmp, JSON.stringify({ products }, null, 2) + '\n', 'utf8');
  await fs.rename(tmp, DATA); // atomic on POSIX
}

export const localStore: InventoryStore = {
  kind: 'local',

  list: readAll,

  async get(id) {
    return (await readAll()).find((p) => p.id === id) ?? null;
  },

  upsert(product) {
    return serial(async () => {
      assertWritable();
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
      assertWritable();
      const all = await readAll();
      await writeAll(all.filter((p) => p.id !== id));
    });
  },

  async putImage(name, bytes) {
    assertWritable();
    await fs.mkdir(IMG_DIR, { recursive: true });
    await fs.writeFile(path.join(IMG_DIR, name), bytes);
    return `/uploads/${name}`;
  },

  async deleteImage(url) {
    if (!url.startsWith('/uploads/')) return;
    const file = path.join(IMG_DIR, path.basename(url));
    await fs.rm(file, { force: true });
  },
};

/** Seed reader used by the blob backend before its first write. */
export const readSeed = readAll;

function assertWritable() {
  if (process.env.VERCEL) {
    throw new StoreUnavailableError(
      'Le stockage n’est pas configuré. Dans Vercel : Storage → Create → Blob, ' +
        'puis connectez-le au projet. La variable BLOB_READ_WRITE_TOKEN sera ajoutée automatiquement.',
    );
  }
}
