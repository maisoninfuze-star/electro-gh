import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark';
type Size = 'md' | 'lg';

/**
 * All CTAs share one geometry so the site reads as a system.
 * Minimum height is 48px at `md` and 56px at `lg` — comfortably above the 44px
 * touch-target floor, because mobile is the primary buying surface here.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-[3px] font-medium tracking-[0.01em] ' +
  'transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-out-soft)] ' +
  'active:scale-[0.985] select-none text-center';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line-strong text-ink hover:border-ink hover:bg-surface',
  ghost: 'text-ink hover:bg-surface-2',
  onDark: 'bg-canvas text-ink hover:bg-white',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 text-[0.875rem]',
  lg: 'min-h-14 px-8 text-[0.9375rem]',
};

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  external,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>) {
  const cls = cx(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}
