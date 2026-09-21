'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/lib/catalog/types';
import { ImagePending } from '@/components/ui/ImagePending';
import { cx } from '@/lib/format';

/**
 * Product gallery.
 *
 * Mobile is a native snap-scroll rail with dot indicators — swiping is what
 * people's thumbs already do, and it needs no JS to feel right. Desktop gets a
 * main frame plus thumbnails.
 *
 * A product with no photograph shows the honest "photo à venir" plate rather
 * than a stock image of a similar appliance.
 */
export function ProductGallery({
  images,
  label,
  pendingLabel,
  referenceLabel,
}: {
  images: ProductImage[];
  label: string;
  pendingLabel: string;
  referenceLabel?: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square w-full bg-surface-2">
        <ImagePending label={pendingLabel} />
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div aria-label={label}>
      {/* Mobile: swipeable rail */}
      <div className="lg:hidden">
        <div
          className="rail no-scrollbar -mx-5 px-5 sm:-mx-10 sm:px-10"
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth;
            if (w > 0) setActive(Math.round(el.scrollLeft / w));
          }}
        >
          {images.map((image, i) => (
            <div key={image.src + i} className="relative aspect-square w-full bg-surface-2">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="product-shadow object-contain p-8 pb-12"
              />
              {image.kind === 'reference' && referenceLabel && <ReferenceNote text={referenceLabel} />}
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span
                key={i}
                className={cx(
                  'h-1 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-ink' : 'w-1.5 bg-line-strong',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: main frame + thumbnails */}
      <div className="hidden lg:block">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 1279px) 50vw, 44vw"
            className="product-shadow object-contain p-12 pb-16"
          />
          {current.kind === 'reference' && referenceLabel && <ReferenceNote text={referenceLabel} />}
        </div>

        {images.length > 1 && (
          <ul className="mt-3 flex gap-3">
            {images.map((image, i) => (
              <li key={image.src + i}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`${label} ${i + 1}`}
                  aria-current={i === active}
                  className={cx(
                    'relative size-20 overflow-hidden bg-surface-2 transition-colors duration-200',
                    i === active ? 'ring-1 ring-ink' : 'ring-1 ring-transparent hover:ring-line-strong',
                  )}
                >
                  <Image src={image.src} alt="" fill sizes="80px" className="object-contain p-2" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * The honesty label for a manufacturer image. Sits inside the frame, always
 * visible, never a tooltip: the whole point is that a customer cannot look at
 * a stock photo and take it for the unit they will receive.
 */
function ReferenceNote({ text }: { text: string }) {
  return (
    <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-2.5 text-center text-[0.75rem] leading-snug text-canvas backdrop-blur-sm">
      {text}
    </p>
  );
}
