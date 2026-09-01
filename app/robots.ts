import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n/config';

/**
 * The demo build is blocked from indexing entirely.
 *
 * Set NEXT_PUBLIC_ALLOW_INDEXING=true in the production environment — and only
 * once the client has signed off on real inventory, real hours and real
 * warranty terms. Indexing a demo catalogue would put fabricated products and
 * prices into Google under the client's name.
 */
export default function robots(): MetadataRoute.Robots {
  const allowed = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

  return {
    rules: allowed
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: allowed ? `${SITE_URL}/sitemap.xml` : undefined,
    host: SITE_URL,
  };
}
