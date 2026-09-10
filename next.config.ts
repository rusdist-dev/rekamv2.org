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

    /* News covers can now be absolute URLs from the CMS (see
       src/lib/content/index.ts's resolveCover) — next/image refuses to
       optimise a remote host it hasn't been told about. */
    remotePatterns: [{ protocol: 'https', hostname: 'cms.rekam.org' }],
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

  /* The CMS falls over under concurrent load (src/lib/cms/client.ts has the
     measurements: 100 concurrent detail requests -> 72 failures, mixing 429
     and plain 500). Real concurrent CMS load during `next build` is
     numWorkers x staticGenerationMaxConcurrency, and both defaults are
     generous — with ~357 pages the default split alone gives ~15 workers,
     each rendering up to 8 pages at once (the default maxConcurrency), i.e.
     ~120 simultaneous CMS requests. Both are turned down:
       - minPagesPerWorker above the page count collapses the batch split to
         one real worker. Note: the "Generating static pages using N
         workers" progress line does NOT reflect this — that label is the
         pre-reduction worker count and stays put regardless.
       - maxConcurrency caps how many pages that one worker renders (and
         thus how many CMS calls it fires) at once.
     staticGenerationRetryCount is a second line of defence behind the
     client's own short, capped retry for whatever 429/500 still gets
     through. */
  experimental: {
    staticGenerationRetryCount: 2,
    staticGenerationMinPagesPerWorker: 1000,
    staticGenerationMaxConcurrency: 4,
  },
};

export default nextConfig;
