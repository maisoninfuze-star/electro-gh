import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getStore } from '@/lib/store';
import { ProductForm } from '@/components/admin/ProductForm';
import { StatusChip } from '@/components/admin/StatusChip';
import { CATEGORIES } from '@/lib/catalog/categories';
import { href } from '@/lib/i18n/config';
import { formatDate } from '@/lib/format';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getStore();
  const [product, all] = await Promise.all([store.get(id), store.list()]);
  if (!product) notFound();
  const brands = [...new Set(all.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'fr'));
  const publicUrl = href('fr', CATEGORIES[product.category].route, product.slug);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusChip status={product.status} />
            <span className="text-xs text-ink-3">{product.sku} · modifié le {formatDate(product.updatedAt, 'fr')}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{product.name.fr}</h1>
        </div>
        {product.status === 'published' && (
          <Link href={publicUrl} target="_blank" className="inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
            Voir sur le site <ExternalLink className="size-3.5" strokeWidth={1.8} />
          </Link>
        )}
      </div>
      <ProductForm product={product} brands={brands} />
    </>
  );
}
