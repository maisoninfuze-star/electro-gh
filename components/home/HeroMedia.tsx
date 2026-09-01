'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

/**
 * Hero imagery with two restrained motions:
 *
 *  1. a slow settle — the image lands at 1.06× and eases to 1.0 over ~2s, so
 *     the first frame has life without anything sliding around the layout
 *  2. a shallow scroll parallax — the image drifts at ~12% of scroll speed
 *
 * Both are transform-only (compositor thread, no layout, no paint), driven by a
 * single rAF-throttled scroll listener rather than a per-frame handler, and
 * both are disabled entirely under prefers-reduced-motion.
 *
 * NOTE: parallax is scroll-driven, so it cannot be observed in a static
 * screenshot — verify in a real browser.
 */
export function HeroMedia({ src, alt }: { src: string; alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    img.style.animation = 'hero-drift 2200ms var(--ease-out-expo) both';

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      // Only while the hero is anywhere near the viewport.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const shift = Math.round(-rect.top * 0.12);
      img.style.setProperty('--parallax', `${shift}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-surface-2">
      <div
        ref={imgRef}
        className="absolute inset-0 will-change-transform"
        style={{ translate: '0 var(--parallax, 0px)' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 1023px) 100vw, 58vw"
          className="scale-[1.06] object-cover"
        />
      </div>
    </div>
  );
}
