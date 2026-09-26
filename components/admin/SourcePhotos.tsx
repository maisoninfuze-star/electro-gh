'use client';

import { useState } from 'react';
import { X, Camera } from 'lucide-react';

/**
 * THE ORIGINAL PHONE PHOTOGRAPHS — ADMIN ONLY.
 *
 * Shown so the owner can check a record against what was actually
 * photographed: is this the right machine, is that price sticker really for
 * this unit, do these two machines really belong together as a set.
 *
 * Served by /admin/source/[name], which refuses without a session. Clicking
 * one opens it full-size, because the whole point is reading a handwritten
 * sticker.
 */
export function SourcePhotos({ photos, compact = false }: { photos: string[]; compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!photos?.length) return null;

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(photos[0])}
          title="Voir la photo d’origine"
          className="relative size-10 shrink-0 overflow-hidden rounded-[2px] border border-line bg-surface-2 sm:size-12"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/admin/source/${photos[0]}`} alt="" className="size-full object-cover" loading="lazy" />
          <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-px text-center text-[0.5rem] font-medium uppercase tracking-[0.06em] text-canvas">
            Origine
          </span>
        </button>
        <Lightbox photos={photos} open={open} setOpen={setOpen} />
      </>
    );
  }

  return (
    <section className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start gap-2">
        <Camera className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.7} />
        <div>
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Photos d’origine (téléphone)
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            Les photos prises en magasin, d’où proviennent ce produit, son prix et son
            jumelage. Visibles ici seulement — jamais sur le site. Cliquez pour agrandir
            et lire les étiquettes.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setOpen(p)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[2px] border border-line bg-surface-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/admin/source/${p}`}
              alt={`Photo d’origine ${p}`}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-1 py-0.5 text-[0.5625rem] text-canvas">
              {p.replace('.webp', '')}
            </span>
          </button>
        ))}
      </div>

      <Lightbox photos={photos} open={open} setOpen={setOpen} />
    </section>
  );
}

function Lightbox({
  photos, open, setOpen,
}: { photos: string[]; open: string | null; setOpen: (v: string | null) => void }) {
  if (!open) return null;
  const i = photos.indexOf(open);
  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-ink/90 p-4"
      onClick={() => setOpen(null)}
      role="dialog"
      aria-modal="true"
      aria-label="Photo d’origine"
    >
      <div className="flex shrink-0 items-center justify-between text-canvas">
        <span className="text-sm">
          {open.replace('.webp', '')}
          {photos.length > 1 && <span className="ml-2 text-canvas/60">{i + 1} / {photos.length}</span>}
        </span>
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => setOpen(null)}
          className="flex size-10 items-center justify-center rounded-full hover:bg-canvas/10"
        >
          <X className="size-5" strokeWidth={1.8} />
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/admin/source/${open}`}
        alt=""
        className="mx-auto min-h-0 flex-1 object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <div className="mt-3 flex shrink-0 justify-center gap-2 overflow-x-auto">
          {photos.map((p) => (
            <button
              key={p}
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(p); }}
              className={`size-14 shrink-0 overflow-hidden rounded-[2px] ring-1 ${p === open ? 'ring-canvas' : 'ring-canvas/30'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/admin/source/${p}`} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
