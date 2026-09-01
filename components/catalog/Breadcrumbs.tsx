import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumbs. Visible trail plus the JSON-LD emitted separately by
 * BreadcrumbSchema, so the crawler and the visitor see the same hierarchy.
 */
export function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-3">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-1">
              {i > 0 && <ChevronRight aria-hidden className="size-3" strokeWidth={2} />}
              {last ? (
                <span aria-current="page" className="text-ink-2">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  /* -my-3.5/py-3.5 gives a 44px tap target while the crumb row
                     keeps its compact 16px visual height. */
                  className="-my-3.5 inline-flex items-center py-3.5 transition-colors hover:text-ink"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
