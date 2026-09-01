import { ImageOff } from 'lucide-react';
import { cx } from '@/lib/format';

/**
 * Honest empty state for a product with no photograph yet.
 *
 * The alternative — a stock photo of a similar appliance — would be a small lie
 * that costs a return when the customer sees the real unit. This says plainly
 * that the photo is coming, and keeps the grid rhythm intact.
 */
export function ImagePending({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cx(
        'flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2 text-ink-3',
        className,
      )}
    >
      <ImageOff aria-hidden className="size-5" strokeWidth={1.5} />
      <span className="text-[0.6875rem] uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}
