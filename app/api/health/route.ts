import { NextResponse } from 'next/server';
import { adminEnabled } from '@/lib/admin/auth';
import { getStore, storeKind } from '@/lib/store';
import { readSeed } from '@/lib/store/local';

export const dynamic = 'force-dynamic';

/**
 * OPS HEALTH — safe to expose, no secrets, no inventory detail.
 *
 *   store         'blob' in production once Blob storage is attached and the
 *                 deployment was built AFTER it was attached; 'local' means
 *                 the token is missing from this deployment's environment.
 *   adminEnabled  ADMIN_PASSWORD is present in this deployment's environment.
 *   storeOk       the backend could be read.
 *   source        'document' once an admin save exists in Blob, else 'seed'.
 *   access        the Blob store's mode ('public' | 'private'), once learned.
 *   seedSyncedAt  how far the committed seed has been folded into the document.
 *   seedBase      the document holds the baseline the three-way merge needs.
 *
 * Vercel applies environment variables only to deployments built after they
 * were added, so the usual reason for 'local' or false here is simply that
 * nobody has redeployed since setting them.
 */
export async function GET() {
  let storeOk = false;
  let published = 0;
  let total = 0;
  let source: string | null = null;
  let access: string | null = null;
  let seedSyncedAt: string | null = null;
  let seedBase = false;
  let lastError: string | null = null;
  // Products that exist only in the admin's document (created there, never in
  // the seed): what they are, so a deploy can tell whether a unit was already
  // added in the admin before the seed adds it again.
  let ownerCreated: { category: string; status: string; createdAt: string; name: string; brand: string; price: number }[] = [];
  try {
    const store = await getStore();
    const all = await store.list();
    storeOk = true;
    published = all.filter((p) => p.status === 'published').length;
    total = all.length;
    const seedIds = new Set((await readSeed()).map((p) => p.id));
    ownerCreated = all
      .filter((p) => !seedIds.has(p.id))
      .map((p) => ({ category: p.category, status: p.status, createdAt: p.createdAt, name: p.name.fr, brand: p.brand, price: p.price }));
    const info = await store.info();
    source = info.source;
    access = info.access;
    seedSyncedAt = info.seedSyncedAt;
    seedBase = info.seedBase;
    lastError = info.lastError;
  } catch {
    storeOk = false;
  }
  return NextResponse.json(
    { ok: storeOk, store: storeKind(), storeOk, adminEnabled: adminEnabled(), published, total, source, access, seedSyncedAt, seedBase, lastError, ownerCreated },
    { headers: { 'cache-control': 'no-store' } },
  );
}
