'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, Search, X, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { LocaleSwitch } from './LocaleSwitch';
import { SearchOverlay } from './SearchOverlay';
import { ButtonLink } from '@/components/ui/Button';
import { href, isLive, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { SearchItem } from '@/lib/catalog/search';
import { BUSINESS } from '@/content/business';
import { telHref } from '@/lib/contact';
import { track } from '@/lib/analytics/events';
import { cx } from '@/lib/format';

/**
 * Sticky navigation.
 *
 * Design decisions
 * ----------------
 * · Solid warm-white with a backdrop blur, never transparent-over-hero. A
 *   transparent bar looks good on one hero image and becomes illegible on the
 *   next one the owner uploads. Legibility beats the trick.
 * · The bar gains a hairline rule and a deeper blur once the page scrolls,
 *   which is enough motion to feel alive without a layout shift.
 * · Two grouped dropdowns (Buanderie, Cuisson) keep seven categories in a bar
 *   that still reads as six items. Dropdowns open on hover AND on focus, and
 *   the trigger is itself a link, so keyboard and touch users are never
 *   trapped behind a hover-only affordance.
 */
export function Header({
  locale,
  dict,
  searchIndex,
}: {
  locale: Locale;
  dict: Dictionary;
  searchIndex: SearchItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Any navigation closes the drawer — otherwise the menu survives a route
  // change and covers the page the visitor just asked for.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock the page behind the drawer without losing scroll position.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const laundry = [
    { label: dict.nav.laundryGroup.washers, href: href(locale, 'washers') },
    { label: dict.nav.laundryGroup.dryers, href: href(locale, 'dryers') },
    { label: dict.nav.laundryGroup.sets, href: href(locale, 'laundrySets') },
  ];
  const cooking = [
    { label: dict.nav.cookingGroup.ranges, href: href(locale, 'ranges') },
    { label: dict.nav.cookingGroup.freezers, href: href(locale, 'freezers') },
  ];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-canvas"
      >
        {dict.common.skipToContent}
      </a>

      <header
        className={cx(
          'sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)]',
          'bg-canvas/85 backdrop-blur-xl backdrop-saturate-150',
          scrolled ? 'border-b border-line' : 'border-b border-transparent',
        )}
      >
        <div className="container-page flex h-[var(--nav-h)] items-center gap-4">
          <Logo locale={locale} className="shrink-0" />

          {/* ── Desktop navigation ───────────────────────────────────────── */}
          {/* The bar reveals items as width allows rather than shrinking type or
              wrapping. Between 1024 and 1360 the two dropdowns already reach every
              category, so nothing is unreachable at any width — only fewer
              shortcuts are visible. */}
          <nav
            aria-label={dict.common.menu}
            className="ml-5 hidden items-center gap-0.5 lg:flex min-[1600px]:ml-9"
          >
            <NavLink href={href(locale, 'shop')}>{dict.nav.shop}</NavLink>
            <NavLink href={href(locale, 'refrigerators')}>{dict.nav.refrigerators}</NavLink>
            <NavDropdown label={dict.nav.laundry} href={href(locale, 'washers')} items={laundry} />
            <NavDropdown label={dict.nav.cooking} href={href(locale, 'ranges')} items={cooking} />
            <span className="hidden min-[1360px]:block">
              <NavLink href={href(locale, 'dishwashers')}>{dict.nav.dishwashers}</NavLink>
            </span>
            <NavLink href={href(locale, 'deals')} accent>
              {dict.nav.deals}
            </NavLink>

            {(isLive('services') || isLive('about')) && (
              <span
                aria-hidden
                className="mx-3 hidden h-4 w-px bg-line-strong min-[1360px]:block"
              />
            )}

            {isLive('services') && (
              <span className="hidden min-[1360px]:block">
                <NavLink href={href(locale, 'services')}>{dict.nav.services}</NavLink>
              </span>
            )}
            {isLive('about') && (
              <span className="hidden min-[1360px]:block">
                <NavLink href={href(locale, 'about')}>{dict.nav.about}</NavLink>
              </span>
            )}
          </nav>

          {/* ── Right cluster ────────────────────────────────────────────── */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={dict.common.search}
              className="inline-flex size-11 items-center justify-center text-ink-2 transition-colors duration-300 hover:text-ink"
            >
              <Search className="size-[1.15rem]" strokeWidth={1.6} />
            </button>

            <span className="hidden sm:block">
              <LocaleSwitch locale={locale} label={dict.meta.switchToShort} />
            </span>

            <a
              href={telHref()}
              onClick={() => track({ event: 'call_click', source: 'header' })}
              className="hidden min-h-11 items-center gap-2 whitespace-nowrap px-2 text-sm font-medium text-ink transition-colors duration-300 hover:text-accent min-[1600px]:inline-flex"
            >
              <Phone className="size-4 shrink-0" strokeWidth={1.6} />
              <span className="tnum">{BUSINESS.phone.display}</span>
            </a>

            {/* Wrapper, not `hidden` on the button itself: ButtonLink's base
                class sets `inline-flex`, and Tailwind resolves display
                utilities by stylesheet order, so `hidden` on the same element
                loses and the CTA leaks onto mobile. */}
            <span className="ml-2 hidden lg:block">
              <ButtonLink href={href(locale, 'shop')} size="md" className="whitespace-nowrap">
                {dict.nav.cta}
              </ButtonLink>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={dict.common.menu}
              aria-expanded={menuOpen}
              className="-mr-2 inline-flex size-11 items-center justify-center text-ink lg:hidden"
            >
              <Menu className="size-[1.35rem]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────────
          Deliberately a short, flat list. Seven categories plus three pages,
          all one tap away, no accordions to expand. On a phone the fastest
          menu is the one with no interaction before the destination.        */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={dict.common.menu}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-canvas shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex h-[var(--nav-h)] items-center justify-between border-b border-line px-5">
                <Logo locale={locale} />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={dict.common.close}
                  className="-mr-2 inline-flex size-11 items-center justify-center text-ink"
                >
                  <X className="size-5" strokeWidth={1.6} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                <ul className="flex flex-col">
                  {[
                    { label: dict.nav.shop, href: href(locale, 'shop') },
                    { label: dict.nav.refrigerators, href: href(locale, 'refrigerators') },
                    { label: dict.nav.laundryGroup.washers, href: href(locale, 'washers') },
                    { label: dict.nav.laundryGroup.dryers, href: href(locale, 'dryers') },
                    { label: dict.nav.laundryGroup.sets, href: href(locale, 'laundrySets') },
                    { label: dict.nav.cookingGroup.ranges, href: href(locale, 'ranges') },
                    { label: dict.nav.dishwashers, href: href(locale, 'dishwashers') },
                    { label: dict.nav.cookingGroup.freezers, href: href(locale, 'freezers') },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex min-h-14 items-center border-b border-line font-display text-[1.35rem] tracking-[-0.02em] text-ink"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={href(locale, 'deals')}
                      className="flex min-h-14 items-center border-b border-line font-display text-[1.35rem] tracking-[-0.02em] text-signal"
                    >
                      {dict.nav.deals}
                    </Link>
                  </li>
                </ul>

                <ul className="mt-7 flex flex-col gap-1">
                  {(
                    [
                      { id: 'services' as const, label: dict.nav.services },
                      { id: 'about' as const, label: dict.nav.about },
                      { id: 'contact' as const, label: dict.nav.contact },
                    ]
                      .filter((x) => isLive(x.id))
                      .map((x) => ({ label: x.label, href: href(locale, x.id) }))
                  ).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex min-h-12 items-center text-[0.9375rem] text-ink-2"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-line px-5 py-5">
                <LocaleSwitch
                  locale={locale}
                  label={dict.meta.switchTo}
                  className="-ml-2 mb-3"
                />
                <a
                  href={telHref()}
                  onClick={() => track({ event: 'call_click', source: 'mobile_menu' })}
                  className="tnum flex items-center gap-2 font-display text-lg font-medium text-ink"
                >
                  <Phone className="size-4" strokeWidth={1.75} />
                  {BUSINESS.phone.display}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchIndex}
        dict={dict}
        locale={locale}
      />
    </>
  );
}

function NavLink({
  href: url,
  children,
  accent = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={url}
      className={cx(
        'relative inline-flex min-h-11 items-center whitespace-nowrap px-2.5 text-[0.875rem] transition-colors duration-300',
        // The underline grows from the left on hover — one small, consistent
        // gesture repeated across the bar.
        'after:absolute after:bottom-2.5 after:left-2.5 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-500 after:ease-[var(--ease-out-expo)] hover:after:w-[calc(100%-1.25rem)]',
        accent ? 'font-medium text-signal' : 'text-ink-2 hover:text-ink',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function NavDropdown({
  label,
  href: url,
  items,
}: {
  label: string;
  href: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A short close delay stops the panel vanishing when the pointer crosses the
  // gap between the trigger and the menu.
  const openNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={closeSoon}
    >
      <Link
        href={url}
        aria-expanded={open}
        className="relative inline-flex min-h-11 items-center gap-1 whitespace-nowrap px-2.5 text-[0.875rem] text-ink-2 transition-colors duration-300 hover:text-ink"
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cx(
            'size-3.5 transition-transform duration-300',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute left-1 top-full min-w-56 border border-line bg-canvas p-2 shadow-[0_18px_48px_-18px_rgba(22,24,26,0.28)]"
          >
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-[2px] px-3 text-[0.875rem] text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
