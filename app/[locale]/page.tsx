import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Hero } from '@/components/home/Hero';
import { CategoryDiscovery } from '@/components/home/CategoryDiscovery';
import { Deals } from '@/components/home/Deals';
import { WhyElectroGH } from '@/components/home/WhyElectroGH';
import { ShopByRoom } from '@/components/home/ShopByRoom';
import { DealBanner } from '@/components/home/DealBanner';
import { HowItWorks } from '@/components/home/HowItWorks';
import { NewArrivals } from '@/components/home/NewArrivals';
import { Reviews } from '@/components/home/Reviews';
import { Showroom } from '@/components/home/Showroom';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { alternates, href, isLocale, SITE_URL, type Locale } from '@/lib/i18n/config';
import { getDeals, getNewArrivals } from '@/lib/catalog/provider';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale === 'fr';

  return {
    title: fr
      ? 'Électroménagers à Montréal et Laval — réfrigérateurs, laveuses, sécheuses, cuisinières'
      : 'Appliance store in Montréal and Laval — refrigerators, washers, dryers, ranges',
    description: fr
      ? 'Électroménagers GH, deux magasins d’électroménagers à Montréal et à Laval. Réfrigérateurs, laveuses, sécheuses, ensembles, cuisinières, lave-vaisselle et congélateurs neufs et reconditionnés. Achat & revente, réparation, pièces. Service en français, anglais et arabe, livraison disponible.'
      : 'Électroménagers GH, two appliance stores in Montréal and Laval. New and refurbished refrigerators, washers, dryers, laundry sets, ranges, dishwashers and freezers. We buy & sell, repair, parts. Service in French, English and Arabic, delivery available.',
    alternates: {
      canonical: SITE_URL + href(locale as Locale, 'home'),
      languages: alternates('home'),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // Fetched in parallel — both hit the same provider, so a real network-backed
  // source resolves in one round trip rather than two sequential ones.
  const [deals, arrivals] = await Promise.all([getDeals(), getNewArrivals(8)]);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <CategoryDiscovery locale={locale} dict={dict} />
      <Deals products={deals.slice(0, 4)} locale={locale} dict={dict} />
      <WhyElectroGH dict={dict} />
      <ShopByRoom locale={locale} dict={dict} />
      <DealBanner locale={locale} dict={dict} />
      <HowItWorks dict={dict} />
      <NewArrivals products={arrivals} locale={locale} dict={dict} />
      <Reviews dict={dict} />
      <Showroom dict={dict} locale={locale} />
    </>
  );
}
