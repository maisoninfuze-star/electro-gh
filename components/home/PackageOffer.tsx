import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import { RevealLines, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { storeById, directionsUrl } from '@/content/business';
import { telHref } from '@/lib/contact';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * FORFAIT EN MAGASIN (home)
 * =========================
 * The owner's photo of four machines lined up outside the Laval store: an LG
 * French-door fridge, a double-oven range, a washer and a dryer. The offer is
 * his: buy them together and he beats the separate prices — in store.
 *
 * Deliberately NO price and NO discount figure: the stickers in the photo are
 * not readable, and the bundle price is negotiated at the counter. The only
 * brand named is LG, the one badge legible in the photo.
 *
 * The photo was taken at Laval, so both actions go to the Laval store rather
 * than through the store chooser.
 */
export function PackageOffer({ dict }: { dict: Dictionary }) {
  const laval = storeById('laval');
  const t = dict.packageOffer;

  return (
    <section className="border-t border-line bg-canvas py-20 sm:py-28">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <Reveal className="lg:col-span-7">
            <figure className="overflow-hidden rounded-[3px] bg-surface-2">
              <Image
                src="/promo/forfait-laval.webp"
                alt={t.imageAlt}
                width={1402}
                height={1122}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="h-auto w-full"
              />
            </figure>
          </Reveal>

          <div className="lg:col-span-5">
            <Reveal>
              <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
                {t.eyebrow}
              </p>
            </Reveal>
            <h2 className="font-display text-display-3 font-medium text-ink">
              <RevealLines lines={[t.title]} />
            </h2>
            <Reveal delay={120}>
              <p className="mt-5 text-lead text-ink-2">{t.body}</p>
            </Reveal>
            <Reveal delay={180}>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9375rem] text-ink">
                {t.items.map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span aria-hidden className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={telHref(laval)} external size="lg">
                  <Phone className="size-4" strokeWidth={2} aria-hidden />
                  {t.call} · {laval.phone.display}
                </ButtonLink>
                <ButtonLink
                  href={directionsUrl(laval)}
                  external
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  <MapPin className="size-4" strokeWidth={2} aria-hidden />
                  {t.directions}
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-ink-3">{t.note}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
