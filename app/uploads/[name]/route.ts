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
 * In production with a PUBLIC Blob store, images have CDN URLs and this route
 * is never hit. With a PRIVATE store (the owner's, as it turned out) the SDK
 * is the only way to read a blob, so the same /uploads/<name> URLs are
 * streamed from Blob here instead of from disk.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // Only our own generated names: no traversal, no surprises.
  if (!/^gh-[a-z0-9-]+\.webp$/.test(name)) return new NextResponse(null, { status: 404 });
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { readImage } = await import('@/lib/store/blob');
    const img = await readImage(name);
    if (!img) return new NextResponse(null, { status: 404 });
    return new NextResponse(img.stream, {
      headers: {
        'Content-Type': img.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
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
