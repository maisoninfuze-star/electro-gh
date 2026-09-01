import type { Metadata, Viewport } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { DemoRibbon } from '@/components/layout/DemoRibbon';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { LOCALES, HTML_LANG, dirFor, isLocale, SITE_URL, type Locale } from '@/lib/i18n/config';
import { getAllProducts } from '@/lib/catalog/provider';
import { toSearchItems } from '@/lib/catalog/search';
import { BUSINESS } from '@/content/business';

/**
 * Typography
 * ----------
 * Manrope for display — a geometric grotesque with enough warmth to sit beside
 * oak and off-white without feeling like a bank. Inter for body, for its
 * legibility at 14–16px on the phones this site is actually read on.
 *
 * Both self-hosted by next/font: no render-blocking request to Google, no
 * layout shift, and `display: swap` with a matched fallback metric.
 */
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#faf8f5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const fr = locale === 'fr';
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: fr
        ? 'Electro GH | Électroménagers à Laval — réfrigérateurs, laveuses, sécheuses'
        : 'Electro GH | Appliance store in Laval — refrigerators, washers, dryers',
      template: '%s | Electro GH',
    },
    description: fr
      ? 'Électroménagers neufs et reconditionnés à Laval. Réfrigérateurs, laveuses, sécheuses, cuisinières, lave-vaisselle et congélateurs. Service local, livraison disponible.'
      : 'New and refurbished home appliances in Laval. Refrigerators, washers, dryers, ranges, dishwashers and freezers. Local service, delivery available.',
    applicationName: BUSINESS.shortName,
    /* The demo build must never be indexed. Flip NEXT_PUBLIC_ALLOW_INDEXING
       to "true" only once the client has signed off on the live content. */
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? { index: true, follow: true }
        : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      siteName: BUSINESS.shortName,
      locale: HTML_LANG[locale],
    },
    formatDetection: { telephone: true, address: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const dict = getDictionary(locale);
  // Built once per request on the server; shipped to the client as a compact
  // array so search results appear on the first keystroke.
  const searchIndex = toSearchItems(await getAllProducts(), locale);

  return (
    <html
      lang={HTML_LANG[locale]}
      dir={dirFor(locale)}
      className={`${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <DemoRibbon dict={dict} />
        <Header locale={locale} dict={dict} searchIndex={searchIndex} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} />
        <MobileActionBar dict={dict} />
        <WhatsAppFab label={dict.common.whatsapp} />
        <LocalBusinessSchema locale={locale} />
      </body>
    </html>
  );
}
