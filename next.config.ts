import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* The old site is kept alongside the rewrite as the visual and content
     oracle. It is plain .html under site/, which Next never routes, so it
     needs no exclusion — but it must not be deleted until cutover. */

  images: {
    /* The source markup already carries explicit width/height on every image
       (berita 1200x675, team 600x750), so layout shift is zero without any
       measuring work. Formats ordered cheapest-decoding first. */
    formats: ['image/avif', 'image/webp'],
  },

  typedRoutes: true,
};

export default nextConfig;
