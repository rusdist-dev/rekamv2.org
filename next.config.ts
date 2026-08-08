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

  /* typedRoutes is deliberately OFF.
     It types a dynamic route as Route<T> where T must be the literal path, so
     it cannot check links built from data — every news slug, every event slug,
     every nav entry read from a config array. This migration is data-driven
     throughout, so the guard would be fought constantly and eventually cast
     away, which is worse than not having it.
     Its job is done instead by scripts/check-links.mjs, which walks the built
     HTML and fails on any href or src pointing at something that does not
     exist. That catches strictly more: broken internal links AND missing
     assets, of which the old site has 16. */
  typedRoutes: false,
};

export default nextConfig;
