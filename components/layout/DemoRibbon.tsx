import { IS_DEMO_DATA } from '@/lib/catalog/provider';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * A visible, unmissable statement that the catalogue is fabricated.
 *
 * The brief is explicit: demo products must never be presented as real Electro
 * GH inventory. A comment in a data file protects the developer; this protects
 * the customer and the client. It disappears the moment IS_DEMO_DATA is false.
 */
export function DemoRibbon({ dict }: { dict: Dictionary }) {
  if (!IS_DEMO_DATA) return null;

  return (
    <div className="bg-ink px-4 py-2 text-center">
      <p className="text-[0.6875rem] leading-snug tracking-[0.06em] text-canvas/80">
        <span className="font-medium uppercase tracking-[0.14em] text-canvas">
          {dict.common.demoNotice}
        </span>
        {/* The full sentence is always in the DOM for screen readers; only its
            visual presentation collapses on narrow screens. */}
        <span aria-hidden className="mx-2 hidden text-canvas/40 sm:inline">
          ·
        </span>
        <span className="sr-only sm:not-sr-only">{dict.common.demoNoticeLong}</span>
      </p>
    </div>
  );
}
