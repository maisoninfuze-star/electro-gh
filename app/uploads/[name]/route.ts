import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIR = path.join(process.cwd(), 'data', 'uploads');

/**
 * Serves photos uploaded through the admin when the LOCAL store is active.
 *
 * Why not write them into /public? Next snapshots /public at build time, so a
 * file added by a running `next start` is a 404 — a quiet, confusing failure
 * that only shows up in production mode. Streaming from data/uploads through a
 * handler works identically in dev and in `next start`.
 *
 * In production the blob store returns CDN URLs and this route is never hit.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // Only our own generated names: no traversal, no surprises.
  if (!/^gh-[a-z0-9-]+\.webp$/.test(name)) return new NextResponse(null, { status: 404 });
  try {
    const buf = await fs.readFile(path.join(DIR, name));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
