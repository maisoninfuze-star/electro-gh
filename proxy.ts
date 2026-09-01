import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from './lib/i18n/config';

/**
 * LOCALE ROUTING (Next 16 `proxy` convention, formerly `middleware`)
 * ==============
 * French is the default and is served with NO path prefix, so the primary
 * Laval audience gets the clean canonical URLs (/refrigerateurs, /aubaines)
 * while English lives under /en.
 *
 *   /refrigerateurs      → rewrite  → /fr/refrigerateurs   (url unchanged)
 *   /en/refrigerators    → pass through
 *   /fr/refrigerateurs   → 308      → /refrigerateurs      (one canonical url)
 *
 * That last redirect matters: without it every French page is reachable at two
 * addresses, which splits ranking signals and duplicates Merchant Center rows.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split('/')[1];

  // Collapse an explicit /fr prefix onto the canonical unprefixed URL.
  if (first === DEFAULT_LOCALE) {
    const stripped = pathname.slice(DEFAULT_LOCALE.length + 1) || '/';
    return NextResponse.redirect(new URL(stripped + search, request.url), 308);
  }

  // Non-default locales are already in their canonical form.
  if ((LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  // Everything else is French: rewrite internally, leave the address bar alone.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /**
     * Skip Next internals, API routes, and ANY path that looks like a file.
     *
     * The trailing `\\..*` clause is the important one: without it, every asset
     * dropped into /public that is not explicitly whitelisted here (a logo,
     * apple-touch-icon.png, a PDF spec sheet, site.webmanifest, a verification
     * file) gets rewritten to /fr/<file> and 404s. Matching on "has a file
     * extension" means new static assets keep working without anyone having to
     * remember to update this regex.
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
