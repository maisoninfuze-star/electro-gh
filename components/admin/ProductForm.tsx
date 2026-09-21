'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { saveProductAction, deleteProductAction, type ActionState } from '@/app/admin/actions';
import { ImageUploader } from './ImageUploader';
import {
  AVAILABILITY, CATEGORY_IDS, CONDITIONS, FINISHES, LABELS, STATUSES, STORE_IDS,
} from '@/lib/admin/product-form';
import type { Product } from '@/lib/catalog/types';
import { cx } from '@/lib/format';

/**
 * PRODUCT FORM
 * ============
 * One form for create and edit. Fields are ordered the way the owner fills
 * them in on the floor: photos, then what it is, then the price, then the
 * rest. Nothing below "Détails" is required.
 *
 * Validation runs twice — here for instant feedback, and again in the server
 * action, which is the one that counts.
 */
export function ProductForm({ product, brands }: { product?: Product; brands: string[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProductAction, { ok: false });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const e = state.errors ?? {};

  // After a successful create, go to the list; after an edit, stay.
  useEffect(() => {
    if (state.ok && !product) router.replace('/admin');
  }, [state.ok, product, router]);

  const input = 'min-h-11 w-full rounded-[3px] border border-line-strong bg-surface px-3 text-[0.9375rem] outline-none focus:border-accent';
  const label = 'mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3';
  const err = (k: string) => e[k] && <p className="mt-1 text-sm text-accent">{e[k]}</p>;

  return (
    <form id="product-form" action={action} className="flex flex-col gap-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      {/* ── Photos ─────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-semibold">Photos</h2>
        <p className="mb-3 mt-0.5 text-sm text-ink-2">La première photo est celle affichée sur le site.</p>
        <ImageUploader initial={product?.images ?? []} />
        {err('images')}
      </section>

      {/* ── Identity ──────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="brand">Marque *</label>
          <input id="brand" name="brand" list="brands" defaultValue={product?.brand ?? ''} required className={input} />
          <datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          {err('brand')}
        </div>
        <div>
          <label className={label} htmlFor="category">Catégorie *</label>
          <select id="category" name="category" defaultValue={product?.category ?? 'washers'} className={input}>
            {CATEGORY_IDS.map((c) => <option key={c} value={c}>{LABELS.category[c]}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="nameFr">Nom (français) *</label>
          <input id="nameFr" name="nameFr" defaultValue={product?.name.fr ?? ''} required placeholder="Ex. : Laveuse frontale Samsung, blanc" className={input} />
          {err('nameFr')}
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="nameEn">Nom (anglais) <span className="normal-case tracking-normal text-ink-3">— facultatif, sinon le français est réutilisé</span></label>
          <input id="nameEn" name="nameEn" defaultValue={product?.name.en === product?.name.fr ? '' : product?.name.en ?? ''} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="model">Numéro de modèle</label>
          <input id="model" name="model" defaultValue={product?.model ?? ''} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="storeId">Magasin</label>
          <select id="storeId" name="storeId" defaultValue={product?.storeId ?? ''} className={input}>
            <option value="">Non précisé</option>
            {STORE_IDS.map((s) => <option key={s} value={s}>{LABELS.store[s]}</option>)}
          </select>
        </div>
      </section>

      {/* ── Price & state ─────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={label} htmlFor="price">Prix ($) *</label>
          <input id="price" name="price" inputMode="decimal" defaultValue={product?.price ? String(product.price) : ''} placeholder="0" className={cx(input, 'tnum text-lg font-medium')} />
          {err('price')}
        </div>
        <div>
          <label className={label} htmlFor="compareAtPrice">Ancien prix ($)</label>
          <input id="compareAtPrice" name="compareAtPrice" inputMode="decimal" defaultValue={product?.compareAtPrice ? String(product.compareAtPrice) : ''} className={cx(input, 'tnum')} />
          {err('compareAtPrice')}
        </div>
        <div>
          <label className={label} htmlFor="condition">État</label>
          <select id="condition" name="condition" defaultValue={product?.condition ?? 'used'} className={input}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{LABELS.condition[c]}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="inventoryStatus">Disponibilité</label>
          <select id="inventoryStatus" name="inventoryStatus" defaultValue={product?.inventoryStatus ?? 'in-stock'} className={input}>
            {AVAILABILITY.map((a) => <option key={a} value={a}>{LABELS.availability[a]}</option>)}
          </select>
        </div>
      </section>

      <section className="border-y border-line py-5">
        <label className={label}>Statut</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <label key={s} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[3px] border border-line-strong px-4 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-canvas">
              <input type="radio" name="status" value={s} defaultChecked={(product?.status ?? 'draft') === s} className="sr-only" />
              {LABELS.status[s]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-2">Seuls les produits <strong>publiés</strong> apparaissent sur le site. Publier exige un prix et au moins une photo.</p>
        <div className="mt-4 flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} className="size-4 accent-[var(--color-accent)]" /> En vedette (accueil)</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="deal" defaultChecked={product?.deal} className="size-4 accent-[var(--color-accent)]" /> Aubaine</label>
        </div>
      </section>

      {/* ── Details ───────────────────────────────────────────── */}
      <details className="group" open={Boolean(product?.description || product?.dimensions)}>
        <summary className="cursor-pointer list-none font-display text-lg font-semibold">
          Détails <span className="ml-2 text-sm font-normal text-ink-3">(facultatif)</span>
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="finish">Fini / couleur</label>
            <select id="finish" name="finish" defaultValue={product?.finish ?? ''} className={input}>
              <option value="">—</option>
              {FINISHES.map((f) => <option key={f} value={f}>{LABELS.finish[f]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['width', 'height', 'depth'] as const).map((k) => (
              <div key={k}>
                <label className={label} htmlFor={k}>{k === 'width' ? 'Largeur' : k === 'height' ? 'Hauteur' : 'Profondeur'} (po)</label>
                <input id={k} name={k} inputMode="decimal" defaultValue={product?.dimensions?.[k] ?? ''} className={cx(input, 'tnum')} />
              </div>
            ))}
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="descFr">Description (français)</label>
            <textarea id="descFr" name="descFr" rows={3} defaultValue={product?.description?.fr ?? ''} className={cx(input, 'py-2.5')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="descEn">Description (anglais)</label>
            <textarea id="descEn" name="descEn" rows={3} defaultValue={product?.description?.en === product?.description?.fr ? '' : product?.description?.en ?? ''} className={cx(input, 'py-2.5')} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="notes">Notes internes <span className="normal-case tracking-normal text-ink-3">— jamais affichées sur le site</span></label>
            <textarea id="notes" name="notes" rows={2} defaultValue={product?.notes ?? ''} className={cx(input, 'py-2.5')} />
          </div>
        </div>
      </details>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-[3px] bg-accent px-6 text-[0.9375rem] font-medium text-accent-ink hover:bg-accent-hover disabled:opacity-60">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <Link href="/admin" className="inline-flex min-h-12 items-center px-3 text-sm text-ink-2 hover:text-ink">Annuler</Link>
        {state.message && (
          <span role="status" className={cx('text-sm', state.ok ? 'text-instock' : 'text-accent')}>{state.message}</span>
        )}
        {product && (
          <span className="ml-auto">
            {confirmDelete ? (
              <span className="inline-flex items-center gap-2 text-sm">
                Supprimer définitivement ?
                <button type="button" onClick={async () => { const r = await deleteProductAction(product.id); if (r.ok) router.replace('/admin'); }} className="font-medium text-accent">Oui</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-ink-2">Non</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-3 hover:text-accent">
                <Trash2 className="size-4" strokeWidth={1.8} /> Supprimer
              </button>
            )}
          </span>
        )}
      </div>
    </form>
  );
}
