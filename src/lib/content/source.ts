import eventsJson from '@/data/events.json';
import newsJson from '@/data/news.json';
import { cmsConfigured, cmsGet, cmsList } from '@/lib/cms/client';
import type { Locale } from '@/i18n/config';
import { PROGRAMS, type Program } from './schema';

/* THE SEAM.
 *
 * Everything above this file works with validated domain objects and never
 * knows where they came from. Everything below is "how do we get the bytes".
 *
 * News is wired to the CMS (docs/api-public.md) whenever BASE_URL_CMS and
 * X_API_KEY are set (see .env.example); otherwise it falls back to the local
 * JSON, same as before — a dev machine without keys still runs. Events stay
 * on local JSON regardless: that page hasn't been migrated yet.
 *
 * The CMS resolves translatable fields to a single string per `?lang=`, so —
 * unlike the local JSON, which holds one row per language — a fetch here is
 * already locale-specific. `toNewsInput` stamps the requested locale onto the
 * result rather than trusting a `lang` field to come back from the API.
 */

/* Confirmed against a live /api/v1/news response (2026-09-10) — a record
 * carries exactly: id, slug, title, excerpt, body, meta_title,
 * meta_description, category, related_programs, cover_url, published_at,
 * author_name. Two things worth knowing about that shape:
 *
 *  - There is no cover alt-text field and no "featured" flag at all. Alt
 *    falls back to the title (a real image tied to the article's own content
 *    beats an empty alt=""); "featured" is always false here, which is fine —
 *    featuredNews() already falls back to the newest post when nothing is
 *    flagged, so the lead article is just always "whatever's newest" today.
 *  - `excerpt` and `category` are null on every one of the 161 live articles,
 *    and `related_programs` is `[]` on all of them — this tenant hasn't
 *    tagged either yet. `excerpt` falls back to `meta_description`, which the
 *    CMS does populate, so PostCard/SEO descriptions aren't blank; `category`
 *    and programme tags just render as absent, which the UI already handles
 *    (PostCard hides an empty category line, ProgramPage falls back to the
 *    newest posts when nothing matches a programme).
 */
type CmsCategory = string | { slug?: string; value?: string; label?: string; name?: string } | null;
type CmsProgramTag = string | { value?: string; slug?: string };

type CmsNewsRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  meta_description: string | null;
  body: string | null;
  cover_url: string | null;
  category: CmsCategory;
  related_programs: CmsProgramTag[];
  published_at: string;
};

function categoryLabel(category: CmsCategory): string | undefined {
  if (!category) return undefined;
  if (typeof category === 'string') return category;
  return category.label ?? category.name ?? category.value ?? category.slug;
}

/* The `news_programs` module is tenant-configurable — nothing guarantees the
 * CMS only ever sends 'forest' | 'urban' | 'ocean'. Dropping an unrecognised
 * tag here (rather than letting newsSchema's z.enum reject the whole record)
 * keeps one surprising value from taking down the entire news list. */
function normalizePrograms(programs: CmsProgramTag[]): Program[] {
  return programs
    .map((p) => (typeof p === 'string' ? p : (p.value ?? p.slug)))
    .filter((p): p is Program => (PROGRAMS as readonly string[]).includes(p ?? ''));
}

/** Raw CMS row -> the shape newsSchema.safeParse expects (see index.ts's
 *  `all()`), same contract the local-JSON rows already satisfy. */
function toNewsInput(row: CmsNewsRow, locale: Locale) {
  return {
    slug: row.slug,
    title: row.title,
    date: row.published_at,
    category: categoryLabel(row.category),
    excerpt: row.excerpt ?? row.meta_description ?? '',
    cover: row.cover_url ?? undefined,
    coverAlt: row.title,
    programs: normalizePrograms(row.related_programs ?? []),
    featured: false,
    body: row.body ?? undefined,
    lang: locale,
  };
}

/* No pagination UI exists yet, so the archive page needs every article in one
 * go. per_page is bounded server-side by cms.max_per_page (161 live articles
 * already come back as 2 pages at per_page=100), so this walks every page
 * rather than trusting one request to cover the whole list. */
const NEWS_PAGE_SIZE = 100;

/** Raw, unvalidated news records for one locale — every page of them. */
export async function rawNews(locale: Locale): Promise<unknown[]> {
  if (!cmsConfigured()) return newsJson;

  const rows: CmsNewsRow[] = [];
  for (let page = 1; ; page++) {
    const result = await cmsList<CmsNewsRow>('/news', {
      tag: `news:${locale}`,
      params: { lang: locale, per_page: NEWS_PAGE_SIZE, page },
    });
    if (!result) break;
    rows.push(...result.data);
    if (!result.meta || page >= result.meta.last_page) break;
  }
  return rows.map((row) => toNewsInput(row, locale));
}

/** One article by slug, via the CMS's own /news/{slug} rather than a lookup
 *  in `rawNews`'s already-fetched list — docs/api-public.md treats list and
 *  detail as separate amplop, and today's list happens to carry the full
 *  `body` too, but that's not a contract worth relying on. Returns
 *  `undefined` to fall back to the local-JSON path (which has every field
 *  inline), `null` when the CMS itself has nothing for this slug. */
export async function rawNewsDetail(slug: string, locale: Locale): Promise<unknown | null | undefined> {
  if (!cmsConfigured()) return undefined;

  const row = await cmsGet<CmsNewsRow>(`/news/${encodeURIComponent(slug)}`, {
    tag: [`news:${locale}`, `news:${locale}:${slug}`],
    params: { lang: locale },
  });
  return row ? toNewsInput(row, locale) : null;
}

/** Raw, unvalidated event records. Unchanged: events still read local JSON. */
export async function rawEvents(): Promise<unknown[]> {
  return eventsJson;
}
