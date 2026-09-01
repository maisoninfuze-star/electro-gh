import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Keep production builds out of the dev server's working directory.
   * `next build` writing into a live `next dev` .next silently corrupts the
   * running dev server, which is a genuinely confusing failure to debug.
   * `npm run build` sets NEXT_DIST_DIR=.next-build.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',

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
