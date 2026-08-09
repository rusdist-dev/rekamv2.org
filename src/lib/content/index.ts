import type { StaticImageData } from 'next/image';
import { COVERS } from '@/assets/berita/covers';
import { eventSchema, newsSchema, type EventRecord, type News, type Program } from './schema';
import { rawEvents, rawNews } from './source';

/* The data facade. Pages import from here and never touch source.ts or a
 * schema directly, so swapping local JSON for the CMS — or later promoting one
 * route to render per-request — is a change in one layer rather than in every
 * template. */

let cache: News[] | null = null;

async function all(): Promise<News[]> {
  if (cache) return cache;
  const raw = await rawNews();
  const parsed = raw.map((row, i) => {
    const result = newsSchema.safeParse(row);
    if (!result.success) {
      // Name the record and the field. A CMS that changes shape should fail
      // loudly at build time, not render "Invalid Date" to a reader.
      const where = (row as { slug?: string })?.slug ?? `index ${i}`;
      throw new Error(`news "${where}" tidak valid: ${result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
    }
    return result.data;
  });
  parsed.sort((a, b) => +b.date - +a.date);
  cache = parsed;
  return parsed;
}

export async function listNews(
  opts: { program?: Program; exclude?: string; limit?: number; lang?: 'id' | 'en' } = {}
): Promise<News[]> {
  const { program, exclude, limit, lang = 'id' } = opts;
  let posts = (await all()).filter((p) => p.lang === lang);

  if (program) {
    const tagged = posts.filter((p) => p.programs.includes(program));
    // Only nine of eighteen articles carry a tag. Falling back to the newest
    // overall keeps a programme page's rail full rather than empty, which is
    // what the hand-written markup did anyway.
    posts = tagged.length ? tagged : posts;
  }
  if (exclude) posts = posts.filter((p) => p.slug !== exclude);
  return limit ? posts.slice(0, limit) : posts;
}

export async function getNews(slug: string): Promise<News | undefined> {
  return (await all()).find((p) => p.slug === slug);
}

export async function featuredNews(lang: 'id' | 'en' = 'id'): Promise<News | undefined> {
  const posts = await listNews({ lang });
  return posts.find((p) => p.featured) ?? posts[0];
}

/** The three-up rail under an article and on each programme page. */
export function relatedNews(program: Program | undefined, exclude?: string) {
  return listNews({ program, exclude, limit: 3 });
}

/* Cover resolution is the one place the local/remote difference leaks, and it
 * is contained to this function. A local path maps to a static import, giving
 * next/image intrinsic dimensions and build-time optimisation; an absolute URL
 * from the CMS passes straight through. Both satisfy next/image's src. */
export function resolveCover(cover: string | undefined): StaticImageData | string | undefined {
  if (!cover) return undefined;
  if (/^https?:\/\//.test(cover)) return cover;
  return COVERS[cover];
}

/* ---- events ---- */

let eventCache: EventRecord[] | null = null;

export async function listEvents(): Promise<EventRecord[]> {
  if (eventCache) return eventCache;
  const raw = await rawEvents();
  eventCache = raw.map((row, i) => {
    const result = eventSchema.safeParse(row);
    if (!result.success) {
      const where = (row as { slug?: string })?.slug ?? `index ${i}`;
      throw new Error(
        `event "${where}" tidak valid: ${result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`
      );
    }
    return result.data;
  });
  return eventCache;
}

export async function getEvent(slug: string): Promise<EventRecord | undefined> {
  return (await listEvents()).find((e) => e.slug === slug);
}

/** Resolve an event's curated documentation list to real articles, in order. */
export async function eventDocumentation(slugs: string[]): Promise<News[]> {
  const posts = await all();
  return slugs.map((s) => posts.find((p) => p.slug === s)).filter((p): p is News => Boolean(p));
}

export type { News, Program, EventRecord };
