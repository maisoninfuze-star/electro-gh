import { NotFoundContent } from '@/components/layout/NotFoundContent';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

/**
 * 404 for a path that matched a route shape but not a real category or product
 * — e.g. /laveuses/un-modele-vendu.
 *
 * Rendered in the default locale: the segment that would carry the locale is
 * exactly the one that failed to resolve.
 */
export default function LocaleNotFound() {
  return <NotFoundContent locale={DEFAULT_LOCALE} />;
}
