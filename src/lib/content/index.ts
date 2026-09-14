import type { StaticImageData } from 'next/image';
import { COVERS } from '@/assets/berita/covers';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { eventContent } from '@/i18n/content/event';
import { eventSchema, newsSchema, type EventRecord, type Localized, type News, type Program, type ResolvedEvent } from './schema';
import { cmsEventDetail, cmsEvents, rawEvents, rawNews, rawNewsDetail, type CmsEventRow, type CmsRundownRow } from './source';

/* The data facade. Pages import from here and never touch source.ts or a
 * schema directly, so swapping local JSON for the CMS — or later promoting one
 * route to render per-request — is a change in one layer rather than in every
 * template. */

function parseNews(row: unknown, where: string): News {
  const result = newsSchema.safeParse(row);
  if (!result.success) {
    // Name the record and the field. A CMS that changes shape should fail
    // loudly, not render "Invalid Date" to a reader.
    throw new Error(`news "${where}" tidak valid: ${result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`);
  }
  return result.data;
}

/* No module-level cache here: news now comes from a live CMS (source.ts),
 * and Next's own fetch cache — the `tags`/`revalidate` on that call — is
 * what's supposed to own freshness. A hand-rolled cache on top of it would
 * keep serving the first request's list forever within a running server
 * instance, defeating revalidateTag() and the CMS's own "diperbarui begitu
 * konten disimpan" contract (docs/api-public.md). Re-validating this array on
 * every call is cheap; the local-JSON fallback is a small synchronous import. */
async function all(locale: Locale): Promise<News[]> {
  const raw = await rawNews(locale);
  const parsed = raw.map((row, i) => parseNews(row, (row as { slug?: string })?.slug ?? `index ${i}`));
  parsed.sort((a, b) => +b.date - +a.date);
  return parsed;
}

export async function listNews(
  opts: { program?: Program; exclude?: string; limit?: number; locale?: Locale } = {}
): Promise<News[]> {
  const { program, exclude, limit, locale = DEFAULT_LOCALE } = opts;
  let posts = (await all(locale)).filter((p) => p.lang === locale);

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

/** A single article. Goes through the CMS's own /news/{slug} rather than
 *  filtering the list — the list endpoint isn't guaranteed to include the
 *  full body (see source.ts's rawNewsDetail). Falls back to the local-JSON
 *  list when the CMS isn't configured. */
export async function getNews(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<News | undefined> {
  const detail = await rawNewsDetail(slug, locale);
  if (detail === undefined) return (await all(locale)).find((p) => p.slug === slug);
  return detail === null ? undefined : parseNews(detail, slug);
}

export async function featuredNews(locale: Locale = DEFAULT_LOCALE): Promise<News | undefined> {
  const posts = await listNews({ locale });
  return posts.find((p) => p.featured) ?? posts[0];
}

/** The three-up rail under an article and on each programme page. */
export function relatedNews(program: Program | undefined, exclude?: string, locale: Locale = DEFAULT_LOCALE) {
  return listNews({ program, exclude, limit: 3, locale });
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

async function allEvents(): Promise<EventRecord[]> {
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

const pick = (value: Localized, locale: Locale): string => value[locale];

/** Flatten every `{ id, en }` pair on an EventRecord down to the one locale
 *  a page actually renders. */
function resolveEvent(event: EventRecord, locale: Locale): ResolvedEvent {
  return {
    slug: event.slug,
    title: pick(event.title, locale),
    lede: pick(event.lede, locale),
    cover: event.cover,
    coverAlt: pick(event.coverAlt, locale),
    notice: event.notice && pick(event.notice, locale),
    facts: event.facts.map((f) => ({ label: pick(f.label, locale), value: pick(f.value, locale) })),
    about: event.about && {
      eyebrow: pick(event.about.eyebrow, locale),
      title: pick(event.about.title, locale),
      body: event.about.body.map((p) => pick(p, locale)),
    },
    agenda: event.agenda.map((row) => ({
      time: row.time,
      title: pick(row.title, locale),
      detail: pick(row.detail, locale),
    })),
    gains: event.gains.map((g) => pick(g, locale)),
    documentation: event.documentation,
    cta: event.cta && {
      title: pick(event.cta.title, locale),
      lede: pick(event.cta.lede, locale),
      note: event.cta.note && pick(event.cta.note, locale),
    },
  };
}

/** `locale` defaults to `DEFAULT_LOCALE` for call sites (generateStaticParams)
 *  that only need the slug and don't care which language the prose comes
 *  back in. */
export async function listEvents(locale: Locale = DEFAULT_LOCALE): Promise<ResolvedEvent[]> {
  const rows = await cmsEvents(locale);
  if (rows) return sortRows(rows).map((row) => toResolvedEvent(row, locale));

  const events = await allEvents();
  return events.map((e) => resolveEvent(e, locale));
}

/** One event. Goes through the CMS's own /events/{slug}: only the detail
 *  endpoint carries `rundowns`, so the list rows can't answer this. */
export async function getEvent(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<ResolvedEvent | undefined> {
  const row = await cmsEventDetail(slug, locale);
  if (row !== undefined) return row === null ? undefined : toResolvedEvent(row, locale);

  const events = await allEvents();
  const found = events.find((e) => e.slug === slug);
  return found && resolveEvent(found, locale);
}

/* ---- CMS events ----
 *
 * A CMS row is already one locale's worth of text (`?lang=`), so it maps
 * straight to ResolvedEvent without passing through eventSchema's bilingual
 * `{ id, en }` shape — the same call source.ts makes for news.
 */

/** The CMS returns +07:00 timestamps and the foundation's events are run on
 *  Jakarta time, so both the formatting and the "WIB" label below are fixed to
 *  that zone rather than to whatever zone the server happens to run in. */
const EVENT_TZ = 'Asia/Jakarta';
const TZ_LABEL = 'WIB';

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(+date) ? undefined : date;
}

function fmtDate(date: Date, locale: Locale, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', { timeZone: EVENT_TZ, ...opts }).format(date);
}

/** "30 Juli 2026", or "30–31 Juli 2026" when a range shares its month. */
function dateRange(start: Date, end: Date | undefined, locale: Locale): string {
  const full: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  if (!end || fmtDate(start, locale, full) === fmtDate(end, locale, full)) {
    return fmtDate(start, locale, full);
  }

  const sameMonth =
    fmtDate(start, locale, { month: 'long', year: 'numeric' }) ===
    fmtDate(end, locale, { month: 'long', year: 'numeric' });
  return sameMonth
    ? `${fmtDate(start, locale, { day: 'numeric' })}–${fmtDate(end, locale, full)}`
    : `${fmtDate(start, locale, full)} – ${fmtDate(end, locale, full)}`;
}

function timeRange(start: Date, end: Date | undefined, locale: Locale): string {
  const time: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const from = fmtDate(start, locale, time);
  // An end time only reads as a range on a single-day event; across two days
  // "13.00–15.00" would say the wrong thing entirely.
  const sameDay =
    end &&
    fmtDate(start, locale, { day: 'numeric', month: 'long', year: 'numeric' }) ===
      fmtDate(end, locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const to = sameDay && end ? fmtDate(end, locale, time) : undefined;
  return `${to ? `${from}–${to}` : from} ${TZ_LABEL}`;
}

function fee(row: CmsEventRow, locale: Locale): string | undefined {
  const copy = eventContent(locale).facts;
  if (row.is_free) return row.fee_note ?? copy.free;

  const amount = typeof row.fee === 'string' ? Number(row.fee) : row.fee;
  if (amount === null || amount === undefined || Number.isNaN(amount)) return row.fee_note ?? undefined;

  const money = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
  return row.fee_note ? `${money} (${row.fee_note})` : money;
}

/* Date / Waktu / Lokasi / Biaya / Kuota, in that order and skipping whatever
 * the row leaves empty. Order matters beyond the detail page: the list card
 * shows the first two, so date and location come before the rest. */
function toFacts(row: CmsEventRow, locale: Locale): { label: string; value: string }[] {
  const copy = eventContent(locale).facts;
  const start = parseDate(row.start_at);
  const end = parseDate(row.end_at);
  const facts: { label: string; value: string }[] = [];

  if (start) facts.push({ label: copy.date, value: dateRange(start, end, locale) });
  if (row.location) facts.push({ label: copy.location, value: row.location });
  if (start && !row.is_all_day) facts.push({ label: copy.time, value: timeRange(start, end, locale) });

  const cost = fee(row, locale);
  if (cost) facts.push({ label: copy.cost, value: cost });
  if (row.quota) facts.push({ label: copy.quota, value: copy.quotaValue(row.quota) });

  return facts;
}

/* The rundown row shape is unverified (see CmsRundownRow) — a row whose title
 * can't be found is dropped, so a shape that doesn't match leaves the section
 * hidden rather than printing a column of blanks. */
function toAgenda(rundowns: CmsRundownRow[] | undefined, locale: Locale): ResolvedEvent['agenda'] {
  return (rundowns ?? [])
    .map((row) => {
      const title = row.title?.trim();
      if (!title) return undefined;

      const raw = row.time ?? row.start_time ?? row.start_at ?? '';
      const asDate = parseDate(raw);
      const time = asDate
        ? fmtDate(asDate, locale, { hour: '2-digit', minute: '2-digit', hour12: false })
        : raw.trim();
      return { time, title, detail: (row.detail ?? row.description ?? '').trim() };
    })
    .filter((row): row is ResolvedEvent['agenda'][number] => row !== undefined);
}

/** First paragraph of the rich-text description as plain text — the hero's
 *  lede, the list card's blurb, and the page's meta description all need one
 *  sentence rather than markup. */
function firstParagraph(html: string): string {
  const text = html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  const paragraph = text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
  if (paragraph.length <= 240) return paragraph;
  return `${paragraph.slice(0, 240).replace(/\s+\S*$/, '')}…`;
}

function toResolvedEvent(row: CmsEventRow, locale: Locale): ResolvedEvent {
  const copy = eventContent(locale).detail;
  const description = row.description ?? '';

  return {
    slug: row.slug,
    title: row.title,
    lede: row.meta_description ?? firstParagraph(description),
    cover: row.cover_url ?? undefined,
    coverAlt: row.title,
    facts: toFacts(row, locale),
    about: description
      ? { eyebrow: row.category ?? 'Event', title: copy.aboutEvent, body: [], html: description }
      : undefined,
    agenda: toAgenda(row.rundowns, locale),
    /* No CMS field answers either of these: the numbered takeaway cards and
       the curated documentation rail are events.json's alone, so both
       sections stay closed for a CMS event. */
    gains: [],
    documentation: [],
    registerUrl: row.registration_url ?? undefined,
    cta: row.registration_url
      ? { title: copy.register.title(row.title), lede: copy.register.lede }
      : undefined,
  };
}

/* Upcoming first, soonest to furthest, then everything past, most recent
 * first — an agenda page answers "what's next" before "what happened". Sorted
 * on the rows rather than on ResolvedEvent because the resolved shape carries
 * its dates as display strings ("30–31 Juli 2026"), which don't sort. */
function sortRows(rows: CmsEventRow[]): CmsEventRow[] {
  const now = Date.now();
  const startOf = (row: CmsEventRow) => parseDate(row.start_at)?.getTime() ?? 0;

  return [...rows].sort((a, b) => {
    const [x, y] = [startOf(a), startOf(b)];
    const [xUpcoming, yUpcoming] = [x >= now, y >= now];
    if (xUpcoming !== yUpcoming) return xUpcoming ? -1 : 1;
    return xUpcoming ? x - y : y - x;
  });
}

/** Resolve an event's curated documentation list to real articles, in order. */
export async function eventDocumentation(slugs: string[], locale: Locale = DEFAULT_LOCALE): Promise<News[]> {
  const posts = await all(locale);
  return slugs.map((s) => posts.find((p) => p.slug === s)).filter((p): p is News => Boolean(p));
}

export type { News, Program, EventRecord, ResolvedEvent };
