import { Star } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import { STORES } from '@/content/business';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * GOOGLE REVIEWS
 * ==============
 * ⚠️  NO REVIEW IS EVER INVENTED HERE.
 *
 * Three states, in strict order:
 *
 *  1. googlePlaceId verified + reviews fetched → render the real reviews
 *  2. not connected, development                → render a clearly-labelled
 *                                                 skeleton so the layout can be
 *                                                 designed and reviewed
 *  3. not connected, production                 → render NOTHING
 *
 * State 3 is the important one. Fabricated testimonials on a local business
 * site are both a Google policy violation and, in Quebec, a consumer-protection
 * problem. The section deleting itself in production is the only safe default.
 *
 * TO CONNECT: set BUSINESS.googlePlaceId, then fetch via the Google Places API
 * (Place Details → `reviews`) in a cached server component, or sync nightly
 * into your CMS. Pass the results in as `reviews`.
 */

export interface GoogleReview {
  authorFirstName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  relativeTime: string;
}

export function Reviews({
  dict,
  reviews = [],
}: {
  dict: Dictionary;
  reviews?: GoogleReview[];
}) {
  const connected = STORES.some((st) => st.googlePlaceId.verified) && reviews.length > 0;
  const isDev = process.env.NODE_ENV === 'development';

  // State 3 — nothing to show, and we are live. Render nothing at all.
  if (!connected && !isDev) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader eyebrow={dict.reviews.eyebrow} title={dict.reviews.title} />

        {connected ? (
          <div className="mt-12 grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={i} delay={(i % 3) * 80} className="bg-canvas">
                <figure className="flex h-full flex-col gap-4 py-8 pr-6 sm:py-10">
                  <Stars rating={review.rating} />
                  <blockquote className="flex-1 text-sm leading-relaxed text-ink-2">
                    {review.text}
                  </blockquote>
                  <figcaption className="text-xs text-ink-3">
                    {review.authorFirstName} · {review.relativeTime} · {dict.reviews.onGoogle}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        ) : (
          /* State 2 — development skeleton. Explicitly labelled, no fake words. */
          <div className="mt-12">
            <p className="mb-6 border-l-2 border-signal bg-signal-soft px-4 py-3 text-xs leading-relaxed text-ink-2">
              {dict.reviews.devOnly}
            </p>
            <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-4 bg-canvas py-8 pr-6 sm:py-10">
                  <div className="flex gap-1" aria-hidden>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <span key={s} className="size-3.5 rounded-[2px] bg-surface-3" />
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col gap-2" aria-hidden>
                    <span className="h-3 w-full rounded-[2px] bg-surface-2" />
                    <span className="h-3 w-[92%] rounded-[2px] bg-surface-2" />
                    <span className="h-3 w-[68%] rounded-[2px] bg-surface-2" />
                  </div>
                  <span aria-hidden className="h-3 w-28 rounded-[2px] bg-surface-2" />
                  <span className="sr-only">{dict.reviews.empty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={n <= rating ? 'size-3.5 fill-signal text-signal' : 'size-3.5 text-line-strong'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
