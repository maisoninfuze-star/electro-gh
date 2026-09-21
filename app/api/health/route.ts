import { NextResponse } from 'next/server';
import { adminEnabled } from '@/lib/admin/auth';
import { getStore, storeKind } from '@/lib/store';

export const dynamic = 'force-dynamic';

/**
 * OPS HEALTH — safe to expose, no secrets, no inventory detail.
 *
 *   store         'blob' in production once Blob storage is attached and the
 *                 deployment was built AFTER it was attached; 'local' means
 *                 the token is missing from this deployment's environment.
 *   adminEnabled  ADMIN_PASSWORD is present in this deployment's environment.
 *   storeOk       the backend could be read.
 *
 * Vercel applies environment variables only to deployments built after they
 * were added, so the usual reason for 'local' or false here is simply that
 * nobody has redeployed since setting them.
 */
export async function GET() {
  let storeOk = false;
  let published = 0;
  try {
    const store = await getStore();
    const all = await store.list();
    storeOk = true;
    published = all.filter((p) => p.status === 'published').length;
  } catch {
    storeOk = false;
  }
  return NextResponse.json(
    { ok: storeOk, store: storeKind(), storeOk, adminEnabled: adminEnabled(), published },
    { headers: { 'cache-control': 'no-store' } },
  );
}
