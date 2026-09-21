import type { InventoryStore } from './adapter';
import { localStore } from './local';

export type { InventoryStore } from './adapter';
export { StoreUnavailableError } from './adapter';

/**
 * Picks the backend from the environment. Blob when its token exists (Vercel
 * injects it once storage is attached), local file otherwise.
 *
 * The blob module is imported lazily so a local dev run never loads the SDK.
 */
export async function getStore(): Promise<InventoryStore> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobStore } = await import('./blob');
    return blobStore;
  }
  return localStore;
}

/** Sync variant for places that only need to know which backend is active. */
export const storeKind = (): 'local' | 'blob' =>
  process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local';
