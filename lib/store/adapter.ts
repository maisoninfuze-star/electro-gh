import type { Product } from '@/lib/catalog/types';

/**
 * INVENTORY STORE
 * ===============
 * The one interface the admin writes through and the catalogue reads through.
 *
 * Two backends, chosen at runtime by `getStore()`:
 *
 *   local   data/inventory.json + public/inventory/   — development only.
 *           Vercel's filesystem is read-only, so writes there throw.
 *
 *   blob    Vercel Blob: one `inventory.json` document plus one blob per
 *           image. Selected automatically when BLOB_READ_WRITE_TOKEN is set,
 *           which Vercel injects the moment Blob storage is attached to the
 *           project in the dashboard. No other configuration.
 *
 * One JSON document, not a table, on purpose: a single owner editing a few
 * dozen units from a phone does not need a database, and a document the
 * owner can open and read is one fewer thing to explain. The interface is
 * narrow enough that a Postgres/Supabase backend is a third file, not a
 * rewrite.
 */
export interface InventoryStore {
  readonly kind: 'local' | 'blob';
  /** Every product, every status. The catalogue filters to `published`. */
  list(): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  /** Insert or replace by id. Returns the stored product. */
  upsert(product: Product): Promise<Product>;
  remove(id: string): Promise<void>;
  /**
   * Store an already-processed image and return its public URL.
   * `name` is a safe filename (`gh-1a2b-1.webp`); the backend decides the path.
   */
  putImage(name: string, bytes: Buffer, contentType: string): Promise<string>;
  /** Best-effort. A missing image is not an error. */
  deleteImage(url: string): Promise<void>;
}

export class StoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreUnavailableError';
  }
}
