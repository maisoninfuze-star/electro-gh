'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cx } from '@/lib/format';

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/**
 * One collapsible facet.
 *
 * Options that would return zero results are disabled rather than hidden — a
 * facet list that reshuffles as you tick boxes is disorienting, and the count
 * itself tells the shopper something useful ("no 34-inch units right now").
 */
export function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  defaultOpen = true,
}: {
  title: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!options.length) return null;

  const activeCount = options.filter((o) => selected.includes(o.value)).length;

  return (
    <div className="border-b border-line py-1">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-12 w-full items-center justify-between gap-2 text-left text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink"
        >
          <span className="flex items-center gap-2">
            {title}
            {activeCount > 0 && (
              <span className="tnum inline-flex size-5 items-center justify-center rounded-full bg-accent text-[0.625rem] font-semibold text-accent-ink">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown
            aria-hidden
            className={cx('size-4 shrink-0 text-ink-3 transition-transform duration-300', open && 'rotate-180')}
            strokeWidth={1.75}
          />
        </button>
      </h3>

      {open && (
        <ul className="flex flex-col pb-3">
          {options.map((option) => {
            const checked = selected.includes(option.value);
            const disabled = option.count === 0 && !checked;
            return (
              <li key={option.value}>
                <label
                  className={cx(
                    'flex min-h-11 cursor-pointer items-center gap-3 text-[0.875rem]',
                    disabled ? 'cursor-not-allowed text-ink-3/60' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(option.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cx(
                      'flex size-[1.125rem] shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-200',
                      checked
                        ? 'border-accent bg-accent text-accent-ink'
                        : 'border-line-strong bg-surface',
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">{option.label}</span>
                  <span className="tnum text-xs text-ink-3">{option.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
