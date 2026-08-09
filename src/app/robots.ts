import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* Both carry robots: noindex in their own metadata too. Listing them
         here as well keeps a crawler from spending budget on a cart it cannot
         see and a token reference page. */
      disallow: ['/checkout', '/design'],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).href,
  };
}
