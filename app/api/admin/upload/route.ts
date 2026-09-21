import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getStore, StoreUnavailableError } from '@/lib/store';
import { hasValidSession } from '@/lib/admin/auth';

export const runtime = 'nodejs';

/**
 * PHOTO UPLOAD
 * ============
 * Multipart form with one or more `files`. Each photo — usually a 4–12 MB
 * phone capture — is rotated by its EXIF flag, fitted inside 1600×2000, and
 * re-encoded as WebP at q82. That turns a 10 MB HEIC-sized JPEG into ~100 KB
 * the catalogue can serve to a phone on cellular.
 *
 * Nothing here cuts out the background. The studio treatment (scripts/
 * studio.py) needs macOS Vision and runs on a Mac; photos uploaded from the
 * shop floor are stored as `kind: 'original'`, which the admin flags so the
 * owner knows which units still have raw photos.
 */
export async function POST(req: Request) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const store = await getStore();
    const out: { src: string; width: number; height: number; kind: 'original' | 'reference' }[] = [];

    const process = async (input: Buffer, kind: 'original' | 'reference') => {
      const buf = await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      const meta = await sharp(buf).metadata();
      const name = `gh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.webp`;
      const src = await store.putImage(name, buf, 'image/webp');
      out.push({ src, width: meta.width ?? 1600, height: meta.height ?? 2000, kind });
    };

    const ctype = req.headers.get('content-type') ?? '';

    if (ctype.includes('application/json')) {
      // REFERENCE PHOTO BY URL — a manufacturer image of the same model.
      // Re-hosted so the listing never depends on a third-party CDN, and
      // stored as `reference` so the storefront labels it honestly.
      const { url } = (await req.json()) as { url?: string };
      if (!url || !/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: 'Adresse d’image invalide.' }, { status: 400 });
      }
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (ElectroGH admin)' } });
      if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) {
        return NextResponse.json({ error: 'Cette adresse ne renvoie pas une image.' }, { status: 400 });
      }
      await process(Buffer.from(await res.arrayBuffer()), 'reference');
      return NextResponse.json({ images: out });
    }

    const form = await req.formData();
    const files = form.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 });
    for (const file of files.slice(0, 12)) {
      if (!file.type.startsWith('image/')) continue;
      await process(Buffer.from(await file.arrayBuffer()), 'original');
    }
    return NextResponse.json({ images: out });
  } catch (e) {
    const message = e instanceof StoreUnavailableError ? e.message : 'Téléversement impossible.';
    if (!(e instanceof StoreUnavailableError)) console.error('[upload]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
