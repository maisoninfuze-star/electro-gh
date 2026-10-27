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
/**
 * `?probe=1` additionally exercises the two steps an admin photo upload needs
 * — sharp (image re-encoding) and a write to the image store — and reports
 * each step's outcome. Uploads were failing for the owner with no reachable
 * logs; this answers "which step" from the outside. The probe writes one tiny
 * blob under the images prefix and deletes it again.
 */
async function probeUpload(): Promise<{ sharp: string; store: string; serve: string }> {
  const out = { sharp: 'skipped', store: 'skipped', serve: 'skipped' };
  let bytes: Buffer | null = null;
  try {
    const sharp = (await import('sharp')).default;
    bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#d3121c' } }).webp().toBuffer();
    out.sharp = `ok (${bytes.length} B)`;
  } catch (e) {
    out.sharp = `FAIL: ${e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e)}`.slice(0, 300);
  }
  try {
    const store = await getStore();
    const name = `gh-probe-${Date.now().toString(36)}.webp`;
    const url = await store.putImage(name, bytes ?? Buffer.from('probe'), 'image/webp');
    out.store = `ok (${url})`;
    try {
      // Read it back the way /uploads/<name> does, so a broken serving path shows here too.
      if (url.startsWith('/uploads/')) {
        const { readImage } = await import('@/lib/store/blob');
        const img = await readImage(url.slice('/uploads/'.length));
        out.serve = img ? `ok (${(await new Response(img.stream).arrayBuffer()).byteLength} B, ${img.contentType})` : 'FAIL: not found when read back';
      } else {
        const res = await fetch(url);
        out.serve = res.ok ? `ok (${res.headers.get('content-length')} B)` : `FAIL: ${res.status}`;
      }
    } finally {
      await store.deleteImage(url);
    }
  } catch (e) {
    out.store = `FAIL: ${e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e)}`.slice(0, 300);
  }
  return out;
}

export async function GET(req: Request) {
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
  const probe = new URL(req.url).searchParams.get('probe') ? await probeUpload() : undefined;
  return NextResponse.json(
    { ok: storeOk, store: storeKind(), storeOk, adminEnabled: adminEnabled(), published, total, source, probe, access, seedSyncedAt, seedBase, lastError, ownerCreated },
    { headers: { 'cache-control': 'no-store' } },
  );
}
