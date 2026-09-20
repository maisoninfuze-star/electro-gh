import Link from 'next/link';
import { StoreActionButton } from '@/components/layout/StoreChooser';
import { ButtonLink } from '@/components/ui/Button';
import { CATEGORY_LIST } from '@/lib/catalog/categories';
import { href, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

/**
 * Shared 404 body, used by both not-found boundaries.
 *
 * Inventory turns over constantly, so a sold unit's URL gets hit from old
 * Facebook posts and shared links for months. This treats that as the common
 * case: say the item is probably gone, then put every category and the phone
 * number one tap away instead of dead-ending the visitor.
 */
export function NotFoundContent({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const fr = locale === 'fr';

  return (
    <div className="container-page flex min-h-[60vh] flex-col justify-center py-24">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">404</p>

      <h1 className="mt-4 max-w-2xl font-display text-display-2 font-light text-ink">
        {fr ? 'Cette page n’existe plus.' : 'This page is gone.'}
      </h1>

      <p className="mt-6 max-w-lg text-lead text-ink-2">
        {fr
          ? 'L’article a peut-être été vendu — l’inventaire change chaque semaine. Voici où continuer, ou appelez-nous et on vous dira ce qui est disponible.'
          : 'The item may have sold — inventory changes every week. Here’s where to pick up, or call us and we’ll tell you what’s available.'}
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <ButtonLink href={href(locale, 'shop')} size="lg">
          {dict.nav.cta}
        </ButtonLink>
        <StoreActionButton mode="call" source="not_found" dict={dict} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[3px] border border-line-strong px-8 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink hover:bg-surface">
          {dict.common.callUs}
        </StoreActionButton>
      </div>

      <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">
        {CATEGORY_LIST.map((c) => (
          <li key={c.id}>
            <Link
              href={href(locale, c.route)}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.8125rem] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink"
            >
              {c.label[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
