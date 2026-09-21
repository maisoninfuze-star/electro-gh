'use client';

import { useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import type { ProductImage } from '@/lib/catalog/types';

/**
 * PHOTOS
 * ======
 * Multi-file input with `capture="environment"`, so on a phone the owner taps
 * once and the rear camera opens — photograph the machine, done. Files go to
 * /api/admin/upload immediately (resized to WebP there), and the returned
 * URLs are kept in a hidden `images` field the form submits as JSON.
 *
 * Order matters: the first photo is the card image everywhere. ◀ ▶ move a
 * photo; the trash removes it from the list, and the server deletes the file
 * on save.
 */
export function ImageUploader({ initial, name = 'images' }: { initial: ProductImage[]; name?: string }) {
  const [images, setImages] = useState<ProductImage[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /** Manufacturer photo by URL → re-hosted, stored as `reference`, put FIRST. */
  async function addByUrl() {
    const u = url.trim();
    if (!u) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: u }),
      });
      const json = (await res.json()) as { images?: ProductImage[]; error?: string };
      if (!res.ok || !json.images) throw new Error(json.error ?? 'Import impossible.');
      setImages((cur) => [...json.images!.map((i) => ({ ...i, alt: '' })), ...cur]);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import impossible.');
    } finally {
      setBusy(false);
    }
  }

  const toggleReference = (i: number) =>
    setImages((cur) => cur.map((img, k) => (k === i ? { ...img, kind: img.kind === 'reference' ? 'original' : 'reference' } : img)));

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append('files', f);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const json = (await res.json()) as { images?: ProductImage[]; error?: string };
      if (!res.ok || !json.images) throw new Error(json.error ?? 'Téléversement impossible.');
      setImages((cur) => [...cur, ...json.images!.map((i) => ({ ...i, alt: '' }))]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléversement impossible.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const move = (i: number, dir: -1 | 1) =>
    setImages((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {images.map((img, i) => (
          <figure key={img.src} className="group relative aspect-[4/5] overflow-hidden bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="size-full object-cover" />
            {i === 0 && (
              <figcaption className="absolute left-1.5 top-1.5 rounded-[2px] bg-ink/80 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-canvas">
                Principale
              </figcaption>
            )}
            <button
              type="button"
              onClick={() => toggleReference(i)}
              title="Photo de référence du fabricant (pas l’appareil réel)"
              className={`absolute right-1.5 top-1.5 rounded-[2px] px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.1em] ${
                img.kind === 'reference' ? 'bg-ink text-canvas' : img.kind === 'original' ? 'bg-signal-soft text-signal' : 'bg-canvas/80 text-ink-2'
              }`}
            >
              {img.kind === 'reference' ? 'Réf.' : img.kind === 'original' ? 'Brute' : 'Studio'}
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink/70 to-transparent p-1">
              <button type="button" aria-label="Déplacer à gauche" onClick={() => move(i, -1)} disabled={i === 0}
                className="flex size-8 items-center justify-center rounded-full text-canvas disabled:opacity-30">
                <ChevronLeft className="size-4" strokeWidth={2.2} />
              </button>
              <button type="button" aria-label="Retirer la photo" onClick={() => setImages((c) => c.filter((_, k) => k !== i))}
                className="flex size-8 items-center justify-center rounded-full text-canvas hover:text-brand">
                <Trash2 className="size-4" strokeWidth={2} />
              </button>
              <button type="button" aria-label="Déplacer à droite" onClick={() => move(i, 1)} disabled={i === images.length - 1}
                className="flex size-8 items-center justify-center rounded-full text-canvas disabled:opacity-30">
                <ChevronRight className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          </figure>
        ))}

        <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong text-ink-2 hover:border-ink hover:text-ink">
          {busy ? <Loader2 className="size-6 animate-spin" strokeWidth={1.8} /> : <Camera className="size-6" strokeWidth={1.6} />}
          <span className="text-xs font-medium">{busy ? 'Envoi…' : 'Photo'}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={(e) => upload(e.target.files)}
            disabled={busy}
          />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <Upload className="size-4" strokeWidth={1.8} /> Choisir des fichiers
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={busy} />
        </label>
        {error && <span role="alert" className="text-sm text-accent">{error}</span>}
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
        <label className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3" htmlFor="ref-url">
          Photo de référence du fabricant (par adresse web)
        </label>
        <div className="flex gap-2">
          <input
            id="ref-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addByUrl(); } }}
            placeholder="https://…/image-du-modele.jpg"
            className="min-h-11 flex-1 rounded-[3px] border border-line-strong bg-surface px-3 text-sm outline-none focus:border-accent"
            disabled={busy}
          />
          <button type="button" onClick={addByUrl} disabled={busy || !url.trim()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] border border-line-strong px-3.5 text-sm font-medium text-ink hover:border-ink disabled:opacity-50">
            <Link2 className="size-4" strokeWidth={1.8} /> Ajouter
          </button>
        </div>
        <p className="text-xs leading-relaxed text-ink-3">
          Placée en premier et affichée avec la mention « Photo de référence » — la photo réelle de l’appareil reste obligatoire à côté.
        </p>
      </div>
    </div>
  );
}
