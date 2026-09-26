import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIR = path.join(process.cwd(), 'data', 'source-photos');

/**
 * ORIGINAL PHONE PHOTOGRAPHS — ADMIN ONLY.
 *
 * These show the shop floor: neighbouring machines, handwritten price
 * stickers, cardboard, the odd reflection of the photographer. They are the
 * owner's reference for checking that a studio render, a price and a
 * washer/dryer pairing match what was actually photographed — and they must
 * never appear on the storefront.
 *
 * Hence a gated route rather than a quiet corner of /public: an unlinked
 * public file is still public to anyone who guesses the path, and these are
 * predictable IMG_XXXX names. No session, no photo.
 *
 * Cache-Control is private + no-store so a shared proxy never holds one.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await hasValidSession())) {
    return new NextResponse(null, { status: 401 });
  }
  const { name } = await params;
  // Only our own generated names. No traversal, no arbitrary file reads.
  if (!/^[A-Za-z0-9_-]+\.webp$/.test(name)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const buf = await fs.readFile(path.join(DIR, name));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
