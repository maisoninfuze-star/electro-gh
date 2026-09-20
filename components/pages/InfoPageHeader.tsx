import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import { href, type Locale, type RouteId } from '@/lib/i18n/config';

/**
 * The header every informational page shares: breadcrumb, eyebrow, an H1 in
 * the display voice, and a lead paragraph. Same geometry as the catalogue
 * listing header, so moving from /laveuses to /reparation feels like turning a
 * page in one document rather than landing on a different site.
 */
export function InfoPageHeader({
  locale,
  routeId,
  eyebrow,
  title,
  lead,
  children,
}: {
  locale: Locale;
  routeId: RouteId;
  eyebrow: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
}) {
  // The crumb is the section's name (the eyebrow), not the editorial H1 —
  // "Nous joindre", not "Parlez-nous."
  const crumbs = [
    { name: 'Electro GH', url: href(locale, 'home') },
    { name: eyebrow, url: href(locale, routeId) },
  ];
  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <header className="border-b border-line bg-surface">
        <div className="container-page py-8 sm:py-14">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="max-w-2xl lg:col-span-8">
              <Reveal>
                <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                  {eyebrow}
                </p>
              </Reveal>
              <h1 className="font-display text-display-2 font-medium text-ink">
                <RevealLines lines={[title]} immediate />
              </h1>
              <Reveal delay={140}>
                <p className="mt-5 max-w-xl text-lead text-ink-2">{lead}</p>
              </Reveal>
            </div>
            {children && (
              <Reveal delay={220} className="lg:col-span-4 lg:justify-self-end">
                {children}
              </Reveal>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
