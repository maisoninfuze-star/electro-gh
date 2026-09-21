import { getStore } from '@/lib/store';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const all = await (await getStore()).list();
  const brands = [...new Set(all.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'fr'));
  return (
    <>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Nouveau produit</h1>
      <ProductForm brands={brands} />
    </>
  );
}
