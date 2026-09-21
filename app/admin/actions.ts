'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getStore, StoreUnavailableError } from '@/lib/store';
import { checkPassword, createSession, destroySession, requireAdmin, adminEnabled } from '@/lib/admin/auth';
import { parseProductForm, slugify, type FormErrors } from '@/lib/admin/product-form';
import type { Product, ProductStatus } from '@/lib/catalog/types';

/**
 * ADMIN SERVER ACTIONS
 * ====================
 * Every write goes through here. Each one re-checks the session (the cookie
 * is the only credential), validates on the server regardless of what the
 * form did, and revalidates the public site so the change is visible on the
 * next request.
 */

export type ActionState = { ok: boolean; errors?: FormErrors; message?: string };

// ── Session ───────────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!adminEnabled()) {
    return { ok: false, message: 'ADMIN_PASSWORD n’est pas configuré sur ce déploiement.' };
  }
  const password = String(fd.get('password') ?? '');
  // A fixed small delay blunts online guessing without a rate-limit store.
  await new Promise((r) => setTimeout(r, 350));
  if (!(await checkPassword(password))) {
    return { ok: false, message: 'Mot de passe incorrect.' };
  }
  await createSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

// ── Products ──────────────────────────────────────────────────────────────

function nextSku(all: Product[]): string {
  const max = all.reduce((m, p) => {
    const n = Number((p.sku.match(/(\d+)$/) ?? [])[1]);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `GH-${max + 1}`;
}

function uniqueSlug(base: string, all: Product[], category: string, selfId?: string): string {
  const taken = new Set(
    all.filter((p) => p.category === category && p.id !== selfId).map((p) => p.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now().toString(36)}`;
}

const newId = () =>
  `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function revalidateSite() {
  // Pages are force-dynamic, so this is belt-and-braces for any cached layer
  // (the sitemap, for one) rather than the thing correctness depends on.
  revalidatePath('/', 'layout');
}

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(fd.get('id') ?? '').trim();
  const { values, errors } = parseProductForm(fd);
  if (Object.keys(errors).length) {
    return { ok: false, errors, message: 'Corrigez les champs indiqués.' };
  }

  try {
    const store = await getStore();
    const all = await store.list();
    const existing = id ? all.find((p) => p.id === id) ?? null : null;
    const now = new Date().toISOString();

    // Photos the owner removed in the form: delete the files too, so storage
    // does not fill with orphans nobody can see.
    if (existing) {
      const keep = new Set(values.images.map((i) => i.src));
      for (const img of existing.images) {
        if (!keep.has(img.src)) await store.deleteImage(img.src);
      }
    }

    const product: Product = {
      ...values,
      id: existing?.id ?? newId(),
      sku: existing?.sku ?? nextSku(all),
      // Slug is set once: a unit's URL must not change because its name was
      // tidied — that is a broken link from every Facebook post that named it.
      slug:
        existing?.slug ??
        uniqueSlug(slugify(`${values.brand} ${values.name.fr}`) || 'produit', all, values.category),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      soldAt:
        values.status === 'sold' ? existing?.soldAt ?? now : undefined,
    };

    await store.upsert(product);
    revalidateSite();
    return { ok: true, message: existing ? 'Enregistré.' : 'Produit créé.' };
  } catch (e) {
    return { ok: false, message: describeError(e) };
  }
}

export async function setStatusAction(id: string, status: ProductStatus): Promise<ActionState> {
  await requireAdmin();
  try {
    const store = await getStore();
    const p = await store.get(id);
    if (!p) return { ok: false, message: 'Produit introuvable.' };
    if (status === 'published' && (!(p.price > 0) || p.images.length === 0)) {
      return {
        ok: false,
        message: 'Pour publier, il faut un prix et au moins une photo. Ouvrez la fiche pour compléter.',
      };
    }
    const now = new Date().toISOString();
    await store.upsert({
      ...p,
      status,
      updatedAt: now,
      soldAt: status === 'sold' ? p.soldAt ?? now : undefined,
    });
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: describeError(e) };
  }
}

export async function deleteProductAction(id: string): Promise<ActionState> {
  await requireAdmin();
  try {
    const store = await getStore();
    const p = await store.get(id);
    if (!p) return { ok: false, message: 'Produit introuvable.' };
    for (const img of p.images) await store.deleteImage(img.src);
    await store.remove(id);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: describeError(e) };
  }
}

function describeError(e: unknown): string {
  if (e instanceof StoreUnavailableError) return e.message;
  if (e instanceof Error && e.message === 'UNAUTHORIZED') return 'Session expirée. Reconnectez-vous.';
  console.error('[admin]', e);
  return 'Une erreur est survenue. Réessayez.';
}
