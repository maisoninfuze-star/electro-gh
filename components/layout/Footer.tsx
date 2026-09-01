import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { BUSINESS, addressLine, directionsUrl } from '@/content/business';
import { telHref } from '@/lib/contact';
import { CATEGORY_LIST } from '@/lib/catalog/categories';
import { href, isLive, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { IS_DEMO_DATA } from '@/lib/catalog/provider';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-surface sm:mt-32">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Identity + address */}
          <div className="md:col-span-4">
            <Logo locale={locale} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-2">
              {dict.footer.tagline}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-ink-2">{dict.footer.langs}</p>
          </div>

          {/* Categories */}
          <nav className="md:col-span-3" aria-label={dict.footer.shop}>
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
              {dict.footer.shop}
            </h2>
            <ul className="mt-4 flex flex-col">
              {CATEGORY_LIST.map((c) => (
                <li key={c.id}>
                  <Link
                    href={href(locale, c.route)}
                    className="inline-flex min-h-11 items-center text-sm text-ink-2 transition-colors duration-300 hover:text-ink"
                  >
                    {c.label[locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={href(locale, 'deals')}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-signal transition-colors duration-300 hover:text-ink"
                >
                  {dict.nav.deals}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav className="md:col-span-2" aria-label={dict.footer.company}>
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
              {dict.footer.company}
            </h2>
            <ul className="mt-4 flex flex-col">
              {(['services', 'about', 'contact'] as const).filter(isLive).map((r) => (
                <li key={r}>
                  <Link
                    href={href(locale, r)}
                    className="inline-flex min-h-11 items-center text-sm text-ink-2 transition-colors duration-300 hover:text-ink"
                  >
                    {dict.nav[r]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-3">
            <h2 className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-3">
              {dict.footer.contact}
            </h2>
            <address className="mt-5 flex flex-col gap-4 not-italic">
              <a
                href={telHref()}
                className="tnum -my-1 inline-flex min-h-11 items-center gap-2.5 py-1 font-display text-lg font-medium text-ink transition-colors duration-300 hover:text-accent"
              >
                <Phone className="size-4 shrink-0" strokeWidth={1.6} />
                {BUSINESS.phone.display}
              </a>
              <a
                href={directionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2.5 py-1 text-sm leading-relaxed text-ink-2 transition-colors duration-300 hover:text-ink"
              >
                <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
                <span>
                  {BUSINESS.legalName}
                  <br />
                  {BUSINESS.address.street}
                  <br />
                  {BUSINESS.address.city}, {BUSINESS.address.region} {BUSINESS.address.postalCode}
                </span>
              </a>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-3">
            © {year} {BUSINESS.legalName}. {dict.footer.rights}
          </p>
          <p className="text-xs text-ink-3">{addressLine()}</p>
        </div>

        {IS_DEMO_DATA && (
          <p className="mt-4 text-xs text-ink-3">{dict.footer.demoBuild}</p>
        )}
      </div>
    </footer>
  );
}
