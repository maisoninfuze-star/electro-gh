import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Defaults to `.next` so hosted builds (Vercel) find the output where they
   * expect it — pointing `npm run build` at another directory makes the deploy
   * fail with "no build output found".
   *
   * `npm run build:local` sets NEXT_DIST_DIR=.next-build to build without
   * clobbering a running `next dev`, which otherwise corrupts it silently.
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
