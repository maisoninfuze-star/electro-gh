import { Phone } from 'lucide-react';
import { InfoPageHeader } from './InfoPageHeader';
import { StoreCard } from '@/components/layout/StoreCard';
import { StoreActionButton } from '@/components/layout/StoreChooser';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { STORES } from '@/content/business';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export type ServiceKind = 'repair' | 'parts' | 'delivery';

/**
 * RÉPARATION · PIÈCES · LIVRAISON
 * ===============================
 * One template, three services, because the honest content for each is the
 * same shape: the service exists (business card), here is how to use it in
 * three steps, here is the one thing to have ready, and here are the two
 * stores to call.
 *
 * What these pages deliberately do NOT say: which brands are serviced, how
 * long a repair takes, what a delivery costs, which parts are stocked. None
 * of that has been supplied. Each page carries a `detailsPending` line that
 * says so plainly and sends the reader to the phone — which is what the owner
 * actually wants to happen. When real terms arrive they go in
 * content/business.ts under services.<kind>.details and can be rendered here.
 */
export function ServicePage({
  kind,
  locale,
  dict,
}: {
  kind: ServiceKind;
  locale: Locale;
  dict: Dictionary;
}) {
  const page = dict.pages[kind];
  const source = `${kind}_page`;

  const primaryBtn =
    'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[3px] bg-accent px-8 text-[0.9375rem] font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.985] sm:w-auto';

  return (
    <>
      <InfoPageHeader
        locale={locale}
        routeId={kind}
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
      >
        <StoreActionButton mode="call" source={`${source}_hero`} dict={dict} className={primaryBtn}>
          <Phone className="size-4" strokeWidth={1.75} />
          {page.cta}
        </StoreActionButton>
      </InfoPageHeader>

        {/* Steps */}
        <section className="py-16 sm:py-24">
          <div className="container-page">
            <ol className="grid gap-10 sm:gap-8 lg:grid-cols-3">
              {page.steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 100} as="li" className="relative">
                  <div className="flex flex-col gap-4 border-t border-ink pt-6">
                    <span className="tnum font-display text-4xl font-light leading-none tracking-[-0.03em] text-ink sm:text-5xl">
                      {step.n}
                    </span>
                    <h2 className="font-display text-lg font-medium uppercase tracking-[0.06em] text-ink">
                      {step.title}
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-ink-2">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <div className="mt-14 grid gap-6 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <div className="h-full border-l-2 border-accent bg-accent-soft px-6 py-6 sm:px-8 sm:py-7">
                  <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                    {page.tipTitle}
                  </h2>
                  <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink-2">
                    {page.tip}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100} className="lg:col-span-5">
                <div className="flex h-full flex-col justify-between gap-6 border border-line bg-surface px-6 py-6 sm:px-8 sm:py-7">
                  <p className="text-[0.9375rem] leading-relaxed text-ink-2">{page.detailsPending}</p>
                  <StoreActionButton mode="call" source={`${source}_panel`} dict={dict} className={primaryBtn}>
                    <Phone className="size-4" strokeWidth={1.75} />
                    {page.cta}
                  </StoreActionButton>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Both stores */}
        <section className="border-t border-line bg-surface py-16 sm:py-24">
          <div className="container-page">
            <Reveal>
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                {dict.pages.stores.eyebrow}
              </p>
              <h2 className="font-display text-display-3 font-medium text-ink">
                {dict.pages.stores.title}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
              {STORES.map((s, i) => (
                <Reveal key={s.id} delay={120 + i * 90}>
                  <StoreCard store={s} dict={dict} source={source} className="h-full" />
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={href(locale, 'shop')} variant="secondary" size="lg">
                  {dict.nav.cta}
                </ButtonLink>
                <ButtonLink href={href(locale, 'contact')} variant="ghost" size="lg">
                  {dict.nav.contact}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
    </>
  );
}
