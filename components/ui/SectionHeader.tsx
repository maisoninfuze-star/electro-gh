import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, RevealLines } from './Reveal';
import { cx } from '@/lib/format';

/**
 * One heading treatment used by every section, so the page reads as a single
 * editorial system rather than a stack of unrelated blocks.
 *
 * eyebrow — small caps, wide tracking, the category label
 * title   — masked line reveal, the display voice
 * body    — optional supporting line
 * link    — optional "view all", right-aligned on desktop, below on mobile
 */
export function SectionHeader({
  eyebrow,
  title,
  body,
  href,
  linkLabel,
  className,
  align = 'start',
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  align?: 'start' | 'center';
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cx('max-w-2xl', align === 'center' && 'sm:mx-auto')}>
        {eyebrow && (
          <Reveal>
            <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
              {eyebrow}
            </p>
          </Reveal>
        )}

        <h2 className="font-display text-display-3 font-medium text-ink">
          <RevealLines lines={[title]} />
        </h2>

        {body && (
          <Reveal delay={120}>
            <p className="mt-5 max-w-xl text-lead text-ink-2">{body}</p>
          </Reveal>
        )}
      </div>

      {href && linkLabel && (
        <Reveal delay={160} className="shrink-0">
          <Link
            href={href}
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink transition-colors duration-300 hover:text-accent"
          >
            {linkLabel}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </Link>
        </Reveal>
      )}
    </div>
  );
}
