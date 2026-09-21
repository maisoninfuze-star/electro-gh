import Link from 'next/link';
import { AlertCircle, Camera } from 'lucide-react';
import { getStore } from '@/lib/store';
import { LABELS } from '@/lib/admin/product-form';
import { StatusChip } from '@/components/admin/StatusChip';
import { QuickActions } from '@/components/admin/QuickActions';
import { InventoryToolbar } from '@/components/admin/InventoryToolbar';
import { formatPrice } from '@/lib/format';
import { cx } from '@/lib/format';
import type { Product, ProductStatus } from '@/lib/catalog/types';

type Search = { q?: string; status?: string; cat?: string };

/**
 * INVENTORY LIST
 * ==============
 * The page the owner lives in. Built for a phone held in the shop:
 *   · status tabs first — "what needs my attention" (drafts) is one tap
 *   · each row is the photo, the name, the price and the one action that
 *     matters most for that status (Publier / Marquer vendu / Remettre)
 *   · a draft with no price or no photo says so in red, right on the row
 *
 * Filters live in the URL so a tab can be bookmarked or shared.
 */
export default async function InventoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { q = '', status = 'all', cat = '' } = await searchParams;
  const store = await getStore();
  const all = await store.list();

  const counts = {
    all: all.length,
    published: all.filter((p) => p.status === 'published').length,
    draft: all.filter((p) => p.status === 'draft').length,
    sold: all.filter((p) => p.status === 'sold').length,
  };

  const needle = q.trim().toLowerCase();
  const rows = all
    .filter((p) => status === 'all' || p.status === status)
    .filter((p) => !cat || p.category === cat)
    .filter(
      (p) =>
        !needle ||
        [p.brand, p.name.fr, p.name.en, p.sku, p.model ?? '', LABELS.category[p.category]]
          .join(' ')
          .toLowerCase()
          .includes(needle),
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Inventaire</h1>
          <p className="mt-1 text-sm text-ink-2">
            {counts.published} en ligne · {counts.draft} brouillon{counts.draft > 1 ? 's' : ''} · {counts.sold} vendu{counts.sold > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <InventoryToolbar q={q} status={status} cat={cat} counts={counts} />

      {rows.length === 0 ? (
        <div className="mt-8 border border-dashed border-line-strong p-10 text-center">
          <p className="font-display text-lg font-medium">Rien ici.</p>
          <p className="mt-1 text-sm text-ink-2">
            {needle ? 'Aucun produit ne correspond à la recherche.' : 'Aucun produit dans cette vue.'}
          </p>
          <Link href="/admin/produits/nouveau" className="mt-5 inline-flex min-h-11 items-center rounded-[3px] bg-accent px-5 text-sm font-medium text-accent-ink">
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {rows.map((p) => (
            <Row key={p.id} p={p} />
          ))}
        </ul>
      )}
    </>
  );
}

function Row({ p }: { p: Product }) {
  const img = p.images[0];
  const missing: string[] = [];
  if (!(p.price > 0)) missing.push('prix');
  if (p.images.length === 0) missing.push('photo');
  const rawPhotos = p.images.filter((i) => i.kind === 'original').length;

  return (
    <li className="flex items-start gap-3 py-3 sm:items-center sm:gap-4">
      <Link href={`/admin/produits/${p.id}`} className="block size-16 shrink-0 overflow-hidden bg-surface-2 sm:size-20">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.src} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="flex size-full items-center justify-center text-ink-3">
            <Camera className="size-5" strokeWidth={1.5} />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusChip status={p.status as ProductStatus} />
          <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-3">
            {LABELS.category[p.category]}{p.storeId ? ` · ${LABELS.store[p.storeId]}` : ''}
          </span>
        </div>
        <Link href={`/admin/produits/${p.id}`} className="mt-1 block font-display text-[0.9375rem] font-medium leading-snug text-ink hover:text-accent sm:text-base">
          {p.name.fr}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
          <span className={cx('tnum font-medium', p.price > 0 ? 'text-ink' : 'text-ink-3')}>
            {p.price > 0 ? formatPrice(p.price, 'fr') : 'Sans prix'}
          </span>
          <span className="text-ink-3">{p.sku}</span>
          {missing.length > 0 && p.status !== 'sold' && (
            <span className="inline-flex items-center gap-1 text-accent">
              <AlertCircle className="size-3.5" strokeWidth={2} /> Manque : {missing.join(', ')}
            </span>
          )}
          {rawPhotos > 0 && missing.length === 0 && (
            <span className="text-ink-3">{rawPhotos} photo{rawPhotos > 1 ? 's' : ''} brute{rawPhotos > 1 ? 's' : ''}</span>
          )}
        </div>
        {p.notes && p.status === 'draft' && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-2">{p.notes}</p>
        )}
      </div>

      <QuickActions id={p.id} status={p.status as ProductStatus} canPublish={missing.length === 0} />
    </li>
  );
}
