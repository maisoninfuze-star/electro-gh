import type { ProductStatus } from '@/lib/catalog/types';
import { LABELS } from '@/lib/admin/product-form';
import { cx } from '@/lib/format';

const STYLE: Record<ProductStatus, string> = {
  published: 'bg-[#e7f1ec] text-instock',
  draft: 'bg-signal-soft text-signal',
  sold: 'bg-surface-3 text-ink-2',
};

export function StatusChip({ status }: { status: ProductStatus }) {
  return (
    <span className={cx('inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.1em]', STYLE[status])}>
      {LABELS.status[status]}
    </span>
  );
}
