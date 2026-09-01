import { Manrope, Inter } from 'next/font/google';
import './globals.css';

import { NotFoundContent } from '@/components/layout/NotFoundContent';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';
import { DemoRibbon } from '@/components/layout/DemoRibbon';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { DEFAULT_LOCALE, HTML_LANG, dirFor } from '@/lib/i18n/config';
import { getAllProducts } from '@/lib/catalog/provider';
import { toSearchItems } from '@/lib/catalog/search';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter', display: 'swap' });

/**
 * Root 404 — for URLs that match no route at all (/a/b/c, a stale deep link).
 *
 * It renders its own <html>/<body> because the root layout is a pass-through:
 * the locale layout owns the document for every real page so that `lang` is
 * correct per language. This boundary is what makes the 404 server-render as
 * actual HTML rather than living only in the RSC payload — which matters
 * because these URLs are reached by crawlers and by people following months-old
 * social posts to units that have since sold.
 */
export default async function RootNotFound() {
  const locale = DEFAULT_LOCALE;
  const dict = getDictionary(locale);
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
        <main id="main">
          <NotFoundContent locale={locale} />
        </main>
        <Footer locale={locale} dict={dict} />
        <MobileActionBar dict={dict} />
      </body>
    </html>
  );
}
