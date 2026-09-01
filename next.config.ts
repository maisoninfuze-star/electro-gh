import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * NO `distDir` HERE, DELIBERATELY.
   *
   * Vercel only needs an "Output Directory" setting when a project overrides
   * distDir, and its detection is happier with the default. An earlier version
   * of this file set `distDir: process.env.NEXT_DIST_DIR || '.next'` so local
   * builds could avoid clobbering a running `next dev`; that convenience is not
   * worth any risk to the client's production deploy. Stop the dev server
   * before running `npm run build`.
   */

  images: {
    // Product photography is shot on light backgrounds and is mostly flat
    // colour, so AVIF wins meaningfully over WebP here.
    formats: ['image/avif', 'image/webp'],
    // Widths matched to the actual layout breakpoints rather than the defaults.
    deviceSizes: [375, 430, 640, 828, 1080, 1280, 1440, 1920, 2560],
    imageSizes: [56, 80, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  poweredByHeader: false,
};

export default nextConfig;
