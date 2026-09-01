import type { Product } from '@/lib/catalog/types';
import { BUSINESS } from '@/content/business';
import { formatInches } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * PRODUCT DETAIL SECTIONS
 * =======================
 * Description, specifications, dimensions, condition, delivery, warranty.
 *
 * ⚠️  WARRANTY AND DELIVERY ARE NEVER INVENTED.
 *
 * Each falls back through three levels:
 *   1. a per-product override from the feed
 *   2. the business-level terms — but ONLY if marked verified
 *   3. an honest "call us to confirm what applies to this model"
 *
 * Level 3 is what renders today, because no warranty duration or delivery
 * pricing has been supplied. The moment the owner fills in
 * BUSINESS.services.warranty.details, level 2 takes over site-wide.
 *
 * Native <details> gives an accessible, keyboard-operable accordion with no JS
 * and no hydration cost — this content is below the fold on every device.
 */
export function ProductDetails({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const d = product.dimensions;
  const hasDimensions =
    d && (d.width || d.height || d.depth || d.depthWithDoorOpen || d.weightLb);

  const warranty =
    product.warranty?.[locale] ??
    (BUSINESS.services.warranty.details.verified
      ? BUSINESS.services.warranty.details.value!
      : dict.product.warrantyUnknown);

  const delivery =
    product.delivery?.[locale] ??
    (BUSINESS.services.delivery.details.verified
      ? BUSINESS.services.delivery.details.value!
      : dict.product.deliveryUnknown);

  const rows: { key: string; label: string; body: React.ReactNode }[] = [];

  if (product.description) {
    rows.push({
      key: 'description',
      label: dict.product.tabs.description,
      body: <p className="text-sm leading-relaxed text-ink-2">{product.description[locale]}</p>,
    });
  }

  rows.push({
    key: 'specs',
    label: dict.product.tabs.specs,
    body: product.specifications?.length ? (
      <dl className="grid gap-px bg-line sm:grid-cols-2">
        {product.specifications.map((spec, i) => (
          <div key={i} className="flex justify-between gap-6 bg-canvas py-3 pr-4">
            <dt className="text-sm text-ink-3">{spec.label[locale]}</dt>
            <dd className="text-sm text-ink">{spec.value[locale]}</dd>
          </div>
        ))}
      </dl>
    ) : (
      <p className="text-sm leading-relaxed text-ink-2">{dict.product.specsUnknown}</p>
    ),
  });

  if (hasDimensions) {
    const labels = dict.product.dimensionLabels;
    const dims: [string, string | null][] = [
      [labels.width, d.width ? formatInches(d.width, locale) : null],
      [labels.height, d.height ? formatInches(d.height, locale) : null],
      [labels.depth, d.depth ? formatInches(d.depth, locale) : null],
      [
        labels.depthWithDoorOpen,
        d.depthWithDoorOpen ? formatInches(d.depthWithDoorOpen, locale) : null,
      ],
      [labels.weight, d.weightLb ? `${d.weightLb} lb` : null],
    ];

    rows.push({
      key: 'dimensions',
      label: dict.product.tabs.dimensions,
      body: (
        <>
          <dl className="grid gap-px bg-line sm:grid-cols-2">
            {dims
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 bg-canvas py-3 pr-4">
                  <dt className="text-sm text-ink-3">{label}</dt>
                  <dd className="tnum text-sm text-ink">{value}</dd>
                </div>
              ))}
          </dl>
          {/* The single most expensive mistake in appliance retail is a unit
              that will not fit through the door. Say it every time. */}
          <p className="mt-4 border-l-2 border-signal bg-signal-soft px-4 py-3 text-xs leading-relaxed text-ink-2">
            {dict.product.fitWarning}
          </p>
        </>
      ),
    });
  }

  if (product.conditionNotes) {
    rows.push({
      key: 'condition',
      label: dict.product.tabs.condition,
      body: (
        <p className="text-sm leading-relaxed text-ink-2">{product.conditionNotes[locale]}</p>
      ),
    });
  }

  rows.push({
    key: 'delivery',
    label: dict.product.tabs.delivery,
    body: <p className="text-sm leading-relaxed text-ink-2">{delivery}</p>,
  });

  rows.push({
    key: 'warranty',
    label: dict.product.tabs.warranty,
    body: <p className="text-sm leading-relaxed text-ink-2">{warranty}</p>,
  });

  return (
    <div className="border-t border-line">
      {rows.map((row, i) => (
        <details key={row.key} open={i === 0} className="group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.9375rem] font-medium text-ink [&::-webkit-details-marker]:hidden">
            {row.label}
            <span
              aria-hidden
              className="relative size-4 shrink-0 text-ink-3 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:-translate-y-1/2 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:-translate-x-1/2 after:bg-current after:transition-transform after:duration-300 group-open:after:scale-y-0"
            />
          </summary>
          <div className="pb-6">{row.body}</div>
        </details>
      ))}
    </div>
  );
}
