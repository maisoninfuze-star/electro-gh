'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Phone, X } from 'lucide-react';
import { STORES, directionsUrl, type Store } from '@/content/business';
import { telHref } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { cx } from '@/lib/format';

type Mode = 'call' | 'directions';

/**
 * STORE CHOOSER
 * =============
 * Two stores means "Appeler" can no longer be a plain tel: link — dialling
 * one store by default sends half the callers to the wrong city. Any call or
 * directions action that is not already tied to a specific store opens this
 * sheet instead: two big rows, one per store, each a real link.
 *
 * It is a bottom sheet on phones (thumb reach, where the mobile bar lives) and
 * a compact centred dialog from `lg` up. One extra tap, and the customer
 * reaches the store they actually meant.
 *
 * Analytics: the row click carries `store`, so the funnel can attribute calls
 * per location — with two stores that split is the most useful number in the
 * whole dataLayer.
 */
export function StoreChooser({
  mode,
  open,
  onClose,
  dict,
  source,
}: {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  dict: Dictionary;
  source: string;
}) {
  const firstRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const title = mode === 'call' ? dict.storeChooser.callTitle : dict.storeChooser.directionsTitle;

  const rowHref = (s: Store) => (mode === 'call' ? telHref(s) : directionsUrl(s));
  const onRow = (s: Store) => {
    track(
      mode === 'call'
        ? { event: 'call_click', source, store: s.id }
        : { event: 'directions_click', source, store: s.id },
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-chooser-title"
            className={cx(
              'absolute inset-x-0 bottom-0 rounded-t-[10px] bg-canvas shadow-2xl',
              'lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[26rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[6px]',
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-5 pt-4 lg:px-6 lg:pt-5">
              <h2 id="store-chooser-title" className="font-display text-[1.0625rem] font-semibold text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.common.close}
                className="-mr-2 flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2"
              >
                <X className="size-5" strokeWidth={1.6} />
              </button>
            </div>

            <ul className="mt-2 divide-y divide-line border-t border-line">
              {STORES.map((s, i) => (
                <li key={s.id}>
                  <a
                    ref={i === 0 ? firstRef : undefined}
                    href={rowHref(s)}
                    target={mode === 'directions' ? '_blank' : undefined}
                    rel={mode === 'directions' ? 'noopener noreferrer' : undefined}
                    onClick={() => onRow(s)}
                    className="flex min-h-[4.5rem] items-center gap-4 px-5 py-3 active:bg-surface-2 hover:bg-surface-2 lg:px-6"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      {mode === 'call' ? (
                        <Phone className="size-[1.1rem]" strokeWidth={1.7} />
                      ) : (
                        <MapPin className="size-[1.1rem]" strokeWidth={1.7} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.0625rem] font-semibold text-ink">
                        {s.city}
                      </span>
                      <span className="tnum block truncate text-[0.875rem] text-ink-2">
                        {mode === 'call' ? s.phone.display : s.address.street}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A trigger that opens the chooser. Renders a <button> styled by the caller,
 * so it drops into the mobile bar, the header, and the product buy box without
 * each of them re-implementing the open/close state.
 */
export function StoreActionButton({
  mode,
  source,
  dict,
  className,
  children,
  ...rest
}: {
  mode: Mode;
  source: string;
  dict: Dictionary;
  className?: string;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'className' | 'children'>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} {...rest}>
        {children}
      </button>
      <StoreChooser mode={mode} open={open} onClose={() => setOpen(false)} dict={dict} source={source} />
    </>
  );
}
