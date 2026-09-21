'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, RotateCcw, Tag } from 'lucide-react';
import { setStatusAction } from '@/app/admin/actions';
import type { ProductStatus } from '@/lib/catalog/types';

/**
 * The one-tap action per status. Sold is the action that happens most, on the
 * shop floor, the moment a customer pays — so it is a single button, no
 * confirmation, and reversible from the "Vendus" tab.
 */
export function QuickActions({ id, status, canPublish }: { id: string; status: ProductStatus; canPublish: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const set = (next: ProductStatus) =>
    start(async () => {
      setErr(null);
      const r = await setStatusAction(id, next);
      if (!r.ok) setErr(r.message ?? 'Erreur');
      else router.refresh();
    });

  const btn = 'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-[3px] border px-3 text-sm font-medium transition-colors disabled:opacity-50';

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      {status === 'published' && (
        <button type="button" disabled={pending} onClick={() => set('sold')} className={`${btn} border-line-strong text-ink hover:border-ink`}>
          <Tag className="size-3.5" strokeWidth={2} /> Vendu
        </button>
      )}
      {status === 'draft' && (
        <button
          type="button"
          disabled={pending || !canPublish}
          onClick={() => set('published')}
          title={canPublish ? undefined : 'Il manque un prix ou une photo'}
          className={`${btn} border-accent bg-accent text-accent-ink hover:bg-accent-hover`}
        >
          <Check className="size-3.5" strokeWidth={2.2} /> Publier
        </button>
      )}
      {status === 'sold' && (
        <button type="button" disabled={pending} onClick={() => set('published')} className={`${btn} border-line-strong text-ink hover:border-ink`}>
          <RotateCcw className="size-3.5" strokeWidth={2} /> Remettre
        </button>
      )}
      {err && <span className="max-w-[10rem] text-right text-xs text-accent">{err}</span>}
    </div>
  );
}
