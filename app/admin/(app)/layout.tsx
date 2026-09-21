import Link from 'next/link';
import { LogOut, Plus, ExternalLink, Package } from 'lucide-react';
import { requireAdminPage, adminEnabled } from '@/lib/admin/auth';
import { storeKind } from '@/lib/store';
import { logoutAction } from '../actions';

/**
 * GATED SHELL
 * ===========
 * Every page in this group calls requireAdminPage() through this layout, so a
 * missing or expired cookie redirects to /admin/login before any inventory is
 * read. Server actions re-check on their own — the layout is the door, not
 * the only lock.
 */
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  if (!adminEnabled()) return <Disabled />;
  await requireAdminPage();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display font-semibold text-ink">
            <Package className="size-[1.1rem] text-accent" strokeWidth={1.8} />
            <span>Inventaire</span>
          </Link>
          <span className="ml-1 hidden rounded-full border border-line px-2 py-0.5 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 sm:inline">
            {storeKind() === 'blob' ? 'Vercel Blob' : 'Fichier local'}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden min-h-10 items-center gap-1.5 px-3 text-sm text-ink-2 hover:text-ink sm:inline-flex"
            >
              Voir le site <ExternalLink className="size-3.5" strokeWidth={1.8} />
            </Link>
            <Link
              href="/admin/produits/nouveau"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-[3px] bg-accent px-3.5 text-sm font-medium text-accent-ink hover:bg-accent-hover"
            >
              <Plus className="size-4" strokeWidth={2} /> Ajouter
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Déconnexion"
                className="inline-flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-ink"
              >
                <LogOut className="size-[1.05rem]" strokeWidth={1.8} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}

function Disabled() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="border border-line bg-surface p-8">
        <h1 className="font-display text-xl font-semibold">Admin désactivé</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          La variable d’environnement <code className="rounded bg-surface-2 px-1">ADMIN_PASSWORD</code>{' '}
          n’est pas définie sur ce déploiement. Ajoutez-la dans Vercel → Settings → Environment
          Variables, puis redéployez.
        </p>
      </div>
    </main>
  );
}
