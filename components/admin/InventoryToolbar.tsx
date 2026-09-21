'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { CATEGORY_IDS, LABELS } from '@/lib/admin/product-form';
import { cx } from '@/lib/format';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'published', label: 'En ligne' },
  { id: 'draft', label: 'Brouillons' },
  { id: 'sold', label: 'Vendus' },
] as const;

export function InventoryToolbar({
  q, status, cat, counts,
}: { q: string; status: string; cat: string; counts: Record<string, number> }) {
  const router = useRouter();
  const path = usePathname();

  const go = (next: Partial<{ q: string; status: string; cat: string }>) => {
    const params = new URLSearchParams();
    const v = { q, status, cat, ...next };
    if (v.q) params.set('q', v.q);
    if (v.status && v.status !== 'all') params.set('status', v.status);
    if (v.cat) params.set('cat', v.cat);
    router.replace(`${path}?${params.toString()}`);
  };

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go({ status: t.id })}
            className={cx(
              'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors',
              status === t.id
                ? 'border-ink bg-ink text-canvas'
                : 'border-line text-ink-2 hover:border-ink hover:text-ink',
            )}
          >
            {t.label}
            <span className={cx('tnum text-xs', status === t.id ? 'text-canvas/70' : 'text-ink-3')}>
              {counts[t.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.8} />
          <input
            type="search"
            defaultValue={q}
            placeholder="Marque, nom, code…"
            onChange={(e) => go({ q: e.target.value })}
            className="min-h-11 w-full rounded-[3px] border border-line bg-surface pl-9 pr-3 text-[0.9375rem] outline-none focus:border-accent"
          />
        </label>
        <select
          value={cat}
          onChange={(e) => go({ cat: e.target.value })}
          className="min-h-11 rounded-[3px] border border-line bg-surface px-3 text-sm"
        >
          <option value="">Toutes catégories</option>
          {CATEGORY_IDS.map((c) => (
            <option key={c} value={c}>{LABELS.category[c]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
