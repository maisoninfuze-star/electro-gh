import { Mail } from 'lucide-react';
import { InfoPageHeader } from './InfoPageHeader';
import { StoreCard } from '@/components/layout/StoreCard';
import { Reveal } from '@/components/ui/Reveal';
import { BUSINESS, STORES } from '@/content/business';
import { mailtoHref } from '@/lib/contact';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * NOS MAGASINS
 * ============
 * Two complete store cards with larger maps than the home section, and the
 * email underneath. Every fact on this page is from the business card.
 */
export function StoresPage({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const page = dict.pages.stores;
  const mail = mailtoHref();

  return (
    <>
      <InfoPageHeader
        locale={locale}
        routeId="stores"
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
      />
        <section className="py-12 sm:py-20">
          <div className="container-page">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {STORES.map((s, i) => (
                <Reveal key={s.id} delay={i * 100}>
                  <StoreCard store={s} dict={dict} source="stores_page" mapHeight="lg" className="h-full" />
                </Reveal>
              ))}
            </div>

            {mail && (
              <Reveal delay={240}>
                <div className="mt-10 flex flex-col gap-2 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-ink-2">{dict.footer.langs}</p>
                  <a
                    href={mail}
                    className="inline-flex min-h-11 items-center gap-2.5 text-[0.9375rem] font-medium text-ink transition-colors hover:text-accent"
                  >
                    <Mail className="size-4" strokeWidth={1.6} />
                    {BUSINESS.email.value}
                  </a>
                </div>
              </Reveal>
            )}
          </div>
        </section>
    </>
  );
}
