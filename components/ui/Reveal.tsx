'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type ElementType,
} from 'react';
import { cx } from '@/lib/format';

/**
 * useLayoutEffect logs a warning when a client component is pre-rendered on the
 * server. These effects only ever do anything in the browser, so fall back to
 * useEffect during SSR to keep the console clean.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Scroll-triggered entrance.
 *
 * Uses an IntersectionObserver plus a CSS keyframe rather than a motion library
 * so that a page with forty product cards ships no per-element JS animation
 * state. Observers disconnect after firing — nothing keeps running once an
 * element has appeared.
 *
 * `prefers-reduced-motion` short-circuits to the visible state on first paint,
 * so reduced-motion users never see a blank region.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 14,
  className,
  once = true,
  immediate = false,
}: {
  children: ReactNode;
  as?: ElementType;
  /** ms */
  delay?: number;
  /** px travel */
  y?: number;
  className?: string;
  once?: boolean;
  /**
   * Play on mount instead of waiting for an intersection.
   *
   * Use for anything above the fold. Content that is already on screen at load
   * has nothing to "scroll into", and making it wait on an observer callback
   * needlessly delays the most important pixels on the page.
   */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  /**
   * Starts TRUE, not false.
   *
   * If this component's JS never runs — a bundle that fails to load, a
   * hydration error, a browser that chokes on something upstream — an
   * opacity-0 default would leave the section permanently invisible while the
   * markup sat there in the DOM. Starting visible and hiding in a layout effect
   * (which runs before paint, so there is no flash) makes the animation an
   * enhancement rather than a prerequisite for seeing the page.
   */
  const [shown, setShown] = useState(true);
  const [armed, setArmed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true);
    setShown(false);
  }, []);

  useEffect(() => {
    if (!armed) return;

    if (immediate) {
      const t = setTimeout(() => setShown(true), 30);
      return () => clearTimeout(t);
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      // Fire slightly before the element reaches the viewport so the motion
      // finishes as it arrives, rather than starting late.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, armed, immediate]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translate3d(0, ${y}px, 0)`,
        transition: armed
          ? `opacity 700ms var(--ease-out-soft) ${delay}ms, transform 700ms var(--ease-out-expo) ${delay}ms`
          : undefined,
        willChange: shown ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Masked line reveal for editorial headlines: each line sits in its own
 * overflow-hidden box and slides up out of nothing.
 * Pass an array of lines — one box per line, staggered.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  stagger = 90,
  delay = 0,
  immediate = false,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
  /** Hero use: play on load instead of waiting for scroll. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  /* Headlines especially must never depend on JS to be readable. */
  const [shown, setShown] = useState(true);
  const [armed, setArmed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setArmed(true);
    setShown(false);
  }, []);

  useEffect(() => {
    if (!armed) return;
    if (immediate) {
      const t = setTimeout(() => setShown(true), 30);
      return () => clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate, armed]);

  return (
    <span ref={ref} className={cx('block', className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            className="block"
            style={{
              transform: shown ? 'translate3d(0,0,0)' : 'translate3d(0,105%,0)',
              transition: armed
                ? `transform 900ms var(--ease-out-expo) ${delay + i * stagger}ms`
                : undefined,
            }}
          >
            <span className={lineClassName}>{line}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
