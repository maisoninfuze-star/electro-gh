'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { searchItems, type SearchItem } from '@/lib/catalog/search';
import { formatPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { track } from '@/lib/analytics/events';

/**
 * Instant search.
 *
 * Filters an in-memory index on every keystroke — no request, no spinner, no
 * empty flash. The analytics event is debounced to 600ms so the funnel records
 * intent ("samsung fridge"), not every prefix on the way there.
 */
export function SearchOverlay({
  open,
  onClose,
  items,
  dict,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  items: SearchItem[];
  dict: Dictionary;
  locale: Locale;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchItems(items, query, 8), [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    // Focus after the entrance transition so iOS doesn't scroll the page.
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(
      () => track({ event: 'search', query: query.trim(), result_count: results.length }),
      600,
    );
    return () => clearTimeout(t);
  }, [query, results.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={dict.common.search}
            className="absolute inset-x-0 top-0 bg-canvas shadow-2xl"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="container-page">
              <div className="flex h-[var(--nav-h)] items-center gap-3 border-b border-line">
                <Search aria-hidden className="size-5 shrink-0 text-ink-3" strokeWidth={1.6} />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.common.searchPlaceholder}
                  aria-label={dict.common.search}
                  className="h-full flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-ink-3 sm:text-xl"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={dict.common.close}
                  className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center text-ink-2 hover:text-ink"
                >
                  <X className="size-5" strokeWidth={1.6} />
                </button>
              </div>

              {query.trim().length > 0 && (
                <div className="max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain py-3">
                  {results.length === 0 ? (
                    <p className="px-1 py-8 text-sm text-ink-2">{dict.catalog.empty.body}</p>
                  ) : (
                    <ul className="flex flex-col">
                      {results.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={r.url}
                            onClick={onClose}
                            className="flex items-center gap-4 rounded-[2px] px-1 py-3 transition-colors duration-200 hover:bg-surface-2"
                          >
                            <span className="relative size-14 shrink-0 overflow-hidden bg-surface-2">
                              {r.image && (
                                <Image
                                  src={r.image}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-contain p-1.5"
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
                                {r.brand} · {r.category}
                              </span>
                              <span className="block truncate text-[0.9375rem] text-ink">
                                {r.name}
                              </span>
                            </span>
                            <span className="tnum shrink-0 text-sm font-medium text-ink">
                              {formatPrice(r.price, locale)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
