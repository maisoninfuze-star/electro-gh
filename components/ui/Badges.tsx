import type { Condition, InventoryStatus } from '@/lib/catalog/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cx } from '@/lib/format';

/**
 * Condition badge.
 * The union type means only the four statuses the business actually uses can
 * ever reach here — a feed cannot invent a fifth badge.
 */
const CONDITION_STYLE: Record<Condition, string> = {
  new: 'bg-accent-soft text-accent',
  refurbished: 'bg-surface-2 text-ink-2',
  'open-box': 'bg-surface-2 text-ink-2',
  clearance: 'bg-signal-soft text-signal',
};

const CONDITION_KEY: Record<Condition, keyof Dictionary['condition']> = {
  new: 'new',
  refurbished: 'refurbished',
  'open-box': 'openBox',
  clearance: 'clearance',
};

export function ConditionBadge({
  condition,
  dict,
  className,
}: {
  condition: Condition;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-[2px] px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.09em]',
        CONDITION_STYLE[condition],
        className,
      )}
    >
      {dict.condition[CONDITION_KEY[condition]]}
    </span>
  );
}

const STATUS_KEY: Record<InventoryStatus, keyof Dictionary['availability']> = {
  'in-stock': 'inStock',
  'low-stock': 'lowStock',
  'on-request': 'onRequest',
};

const STATUS_DOT: Record<InventoryStatus, string> = {
  'in-stock': 'bg-instock',
  'low-stock': 'bg-lowstock',
  'on-request': 'bg-ink-3',
};

const STATUS_TEXT: Record<InventoryStatus, string> = {
  'in-stock': 'text-instock',
  'low-stock': 'text-lowstock',
  'on-request': 'text-ink-3',
};

/**
 * Availability. Deliberately shows a qualitative state, never a unit count —
 * the business does not run a live stock system and a hard number would go
 * stale within a day.
 */
export function AvailabilityTag({
  status,
  dict,
  className,
}: {
  status: InventoryStatus;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-xs font-medium', STATUS_TEXT[status], className)}>
      <span aria-hidden className={cx('size-1.5 rounded-full', STATUS_DOT[status])} />
      {dict.availability[STATUS_KEY[status]]}
    </span>
  );
}
