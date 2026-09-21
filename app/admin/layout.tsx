import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import '@/app/globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

/** Never indexed, never in the sitemap, French only. */
export const metadata: Metadata = {
  title: 'Admin — Électroménagers GH',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

/**
 * ADMIN ROOT
 * ==========
 * A separate root layout: no public header, no mobile action bar, no
 * analytics, none of the storefront chrome. The session gate lives one level
 * down in (app)/layout.tsx so /admin/login can render without it.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas text-ink" style={{ paddingBottom: 0 }}>
        {children}
      </body>
    </html>
  );
}
