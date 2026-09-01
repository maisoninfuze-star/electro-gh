/**
 * Pass-through root layout.
 *
 * `<html>` and `<body>` live in app/[locale]/layout.tsx, because that is the
 * only layout that knows the locale and can therefore set `lang` and `dir`
 * correctly for SEO — and it keeps all 80+ pages statically generated, which
 * reading headers() in a root layout would prevent.
 *
 * This file exists purely so that app/not-found.tsx has a root to render into,
 * which is what makes the 404 page server-render as real HTML instead of
 * appearing only in the RSC payload.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
