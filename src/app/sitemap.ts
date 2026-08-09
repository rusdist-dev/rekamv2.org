import type { MetadataRoute } from 'next';
import { listEvents, listNews } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

/* Derived from the collections, not typed by hand — so a new article is in the
 * sitemap the moment it exists, and a removed one leaves. That matters more
 * here than usual: the source's whole news section pointed at a single URL, so
 * there was nothing to submit even if a sitemap had existed. */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, events] = await Promise.all([listNews(), listEvents()]);
  const newest = news[0]?.date ?? new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: '/', changeFrequency: 'weekly', priority: 1, lastModified: newest },
    { url: '/tentang', changeFrequency: 'yearly', priority: 0.8 },
    { url: '/program/forest', changeFrequency: 'monthly', priority: 0.9 },
    { url: '/program/urban', changeFrequency: 'monthly', priority: 0.9 },
    { url: '/program/ocean', changeFrequency: 'monthly', priority: 0.9 },
    { url: '/berita', changeFrequency: 'weekly', priority: 0.9, lastModified: newest },
    { url: '/event', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/donasi', changeFrequency: 'yearly', priority: 0.8 },
    { url: '/merch', changeFrequency: 'monthly', priority: 0.6 },
    /* /checkout and /design are deliberately absent — both are noindex. */
  ];

  return [
    ...staticPages,
    ...news.map((post) => ({
      url: `/berita/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `/event/${event.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ].map((entry) => ({ ...entry, url: new URL(entry.url, SITE_URL).href }));
}
