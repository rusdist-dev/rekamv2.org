import type { Locale } from '@/i18n/config';
import { t as dict } from '@/i18n/dictionary';
import { beritaContent } from '@/i18n/content/berita';
import { donasiContent } from '@/i18n/content/donasi';
import { eventContent } from '@/i18n/content/event';
import { faqContent } from '@/i18n/content/faq';
import { forestContent } from '@/i18n/content/forest';
import { homeContent } from '@/i18n/content/home';
import { initiativeContent } from '@/i18n/content/initiative';
import { merchContent } from '@/i18n/content/merch';
import { oceanContent } from '@/i18n/content/ocean';
import { ourStoryContent } from '@/i18n/content/our-story';
import { privacyPolicyContent } from '@/i18n/content/privacy-policy';
import { publicationContent } from '@/i18n/content/publication';
import { safeguardingContent } from '@/i18n/content/safeguarding';
import { termsOfServiceContent } from '@/i18n/content/terms-of-service';
import { urbanContent } from '@/i18n/content/urban';
import { listEvents, listNews } from '@/lib/content';
import { listPublications } from '@/lib/publication';

/* Site search, server side.
 *
 * The header's field used to match nav labels only — a menu finder, as the
 * comment there said. This builds the real thing: every page's own copy plus
 * the live collections (berita, event, publikasi) behind one ranked query, so
 * "rangkong" or "safeguarding" finds the article and the policy rather than
 * only a menu item whose label happens to carry the word.
 *
 * Page copy is not re-typed here. Each i18n/content module already holds one
 * page's text as a nested object, so `flatten` walks that object and takes
 * every string in it. A section added to a page becomes searchable with no
 * edit to this file — which is why it reads the modules instead of a
 * hand-kept list of headings that would drift the moment copy changes.
 */

export type SearchKind = 'page' | 'news' | 'event' | 'publication';

export type SearchHit = {
  kind: SearchKind;
  title: string;
  href: string;
  /** The line the query matched, trimmed for the dropdown. Absent when the
   *  title was the only thing that matched. */
  snippet?: string;
};

type Doc = {
  kind: SearchKind;
  title: string;
  href: string;
  /** Shown under the title when nothing more specific matched. */
  lede?: string;
  /** Everything else worth matching against, one entry per source string. */
  text: string[];
  /** Matched like `text`, but never shown: a programme tag or a CMS category
   *  is one word, and "ocean" under a headline reads as a glitch rather than
   *  as the reason the article is in the list. */
  tags?: string[];
};

/** Collects every string in a content module's nested shape. The few
 *  `(n) => …` labels in those modules, and non-strings, are skipped. */
function flatten(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    const s = value.trim();
    if (s) out.push(s);
  } else if (Array.isArray(value)) {
    for (const item of value) flatten(item, out);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) flatten(item, out);
  }
  return out;
}

/** Strips the CMS's rich text so a match lands on words, not on markup. */
function plain(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/* The static pages. `label` is what the dropdown shows: the nav dictionary
 * where the page is in the nav, spelled out per locale for the ones reachable
 * only from the footer or a CTA. `content` is the module whose strings make
 * the page findable by its text rather than by its name alone. */
type PageSource = {
  href: string;
  label: (locale: Locale) => string;
  content: (locale: Locale) => unknown;
};

const PAGES: PageSource[] = [
  { href: '/', label: (l) => dict(l).common.breadcrumb.home, content: homeContent },
  { href: '/program/forest', label: (l) => dict(l).nav_items.forest, content: forestContent },
  { href: '/program/urban', label: (l) => dict(l).nav_items.urban, content: urbanContent },
  { href: '/program/ocean', label: (l) => dict(l).nav_items.ocean, content: oceanContent },
  { href: '/tentang', label: (l) => dict(l).nav_items.tentang, content: ourStoryContent },
  { href: '/berita', label: (l) => dict(l).nav_items.berita, content: beritaContent },
  { href: '/event', label: (l) => dict(l).nav_items.event, content: eventContent },
  { href: '/donasi', label: (l) => dict(l).nav_items.donasi, content: donasiContent },
  { href: '/merch', label: (l) => dict(l).nav_items.merch, content: merchContent },
  { href: '/initiative', label: (l) => initiativeContent(l).hero.title.join(' '), content: initiativeContent },
  { href: '/publication', label: (l) => (l === 'en' ? 'Publication' : 'Publikasi'), content: publicationContent },
  { href: '/faq', label: () => 'FAQ', content: faqContent },
  /* "Safeguarding" stays English in both locales — the standing note on that
     term's spelling, same as FOOTER_EXTRA in lib/nav.ts. */
  { href: '/safeguarding', label: () => 'Safeguarding', content: safeguardingContent },
  { href: '/privacy-policy', label: (l) => (l === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'), content: privacyPolicyContent },
  { href: '/terms-of-service', label: (l) => (l === 'en' ? 'Terms of Service' : 'Syarat & Ketentuan'), content: termsOfServiceContent },
];

function pageDocs(locale: Locale): Doc[] {
  return PAGES.map((page) => {
    const [lede, ...rest] = flatten(page.content(locale));
    return { kind: 'page' as const, title: page.label(locale), href: page.href, lede, text: rest };
  });
}

/* The collections. Each failure falls back to an empty list on purpose: a CMS
 * outage should narrow what search finds, not take the header's field down
 * with it. */
async function newsDocs(locale: Locale): Promise<Doc[]> {
  const posts = await listNews({ locale }).catch(() => []);
  return posts.map((post) => ({
    kind: 'news' as const,
    title: post.title,
    href: `/berita/${post.slug}`,
    lede: post.excerpt,
    text: [plain(post.body)].filter(Boolean),
    tags: [post.category ?? '', ...post.programs].filter(Boolean),
  }));
}

async function eventDocs(locale: Locale): Promise<Doc[]> {
  const events = await listEvents(locale).catch(() => []);
  return events.map((event) => ({
    kind: 'event' as const,
    title: event.title,
    href: `/event/${event.slug}`,
    lede: event.lede,
    text: [
      ...event.facts.flatMap((f) => [f.label, f.value]),
      ...(event.about ? [event.about.eyebrow, event.about.title, ...event.about.body, plain(event.about.html)] : []),
      ...event.agenda.flatMap((a) => [a.time, a.title, a.detail]),
      ...event.gains,
    ].filter(Boolean),
    tags: [event.category ?? ''].filter(Boolean),
  }));
}

/* Publications have no page of their own — /publication opens each one in a
 * dialog — so every hit points at the listing. */
async function publicationDocs(locale: Locale): Promise<Doc[]> {
  const items = await listPublications(locale).catch(() => []);
  return items.map((item) => ({
    kind: 'publication' as const,
    title: item.title,
    href: '/publication',
    lede: item.description,
    text: [],
    tags: [item.category ?? ''].filter(Boolean),
  }));
}

export async function searchIndex(locale: Locale): Promise<Doc[]> {
  const [news, events, publications] = await Promise.all([
    newsDocs(locale),
    eventDocs(locale),
    publicationDocs(locale),
  ]);
  return [...pageDocs(locale), ...news, ...events, ...publications];
}

/* Ranking.
 *
 * Every term has to appear somewhere in the document — an AND, so "rangkong
 * papua" is not answered by a page that only says "papua". Where a term lands
 * decides the weight: title beats lede beats body, and a match starting a word
 * beats one buried inside another, which keeps a page that merely says
 * "preoccupied" from outranking the Ocean programme for "ocean".
 */
const WEIGHT = { title: 12, lede: 4, text: 2 } as const;

function fieldScore(field: string, term: string): number {
  const hay = field.toLowerCase();
  const at = hay.indexOf(term);
  if (at < 0) return 0;
  if (at === 0) return 3;
  return /[^\p{L}\p{N}]/u.test(hay[at - 1]) ? 2 : 1;
}

function scoreDoc(doc: Doc, terms: string[]): { score: number; snippet?: string } {
  let score = 0;
  let snippet: string | undefined;

  for (const term of terms) {
    const inTitle = fieldScore(doc.title, term);
    const inLede = doc.lede ? fieldScore(doc.lede, term) : 0;
    let inText = 0;
    let hitLine: string | undefined;
    for (const line of doc.text) {
      const hit = fieldScore(line, term);
      if (hit > inText) {
        inText = hit;
        hitLine = line;
      }
    }
    for (const tag of doc.tags ?? []) inText = Math.max(inText, fieldScore(tag, term));

    if (!inTitle && !inLede && !inText) return { score: 0 };
    score += inTitle * WEIGHT.title + inLede * WEIGHT.lede + inText * WEIGHT.text;
    // The lede reads better than a stray body line, so prefer it when it hit.
    if (!snippet) snippet = inLede ? doc.lede : hitLine;
  }

  // A title-only match leaves no matched line; show the lede for context
  // rather than a bare title. A line that just repeats the title is dropped —
  // it tells the reader nothing the row above it hasn't already said.
  if (!snippet) snippet = doc.lede;
  if (snippet && snippet.trim().toLowerCase() === doc.title.trim().toLowerCase()) snippet = undefined;

  // A short title that matched is a more precise answer than a long one
  // carrying the same words among many others.
  score += Math.max(0, 40 - doc.title.length) / 20;
  return { score, snippet };
}

const SNIPPET_MAX = 120;

function trimSnippet(text: string, terms: string[]): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= SNIPPET_MAX) return clean;

  // Window the snippet around the first term so the reader sees why it matched.
  const hay = clean.toLowerCase();
  const hits = terms.map((term) => hay.indexOf(term)).filter((i) => i >= 0);
  const at = hits.length ? Math.min(...hits) : 0;
  const start = at > 40 ? clean.lastIndexOf(' ', at - 40) + 1 : 0;
  const slice = clean.slice(start, start + SNIPPET_MAX).trimEnd();
  return `${start > 0 ? '…' : ''}${slice}…`;
}

export const SEARCH_LIMIT = 8;

export async function search(query: string, locale: Locale, limit = SEARCH_LIMIT): Promise<SearchHit[]> {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const docs = await searchIndex(locale);
  const ranked: { hit: SearchHit; score: number }[] = [];

  for (const doc of docs) {
    const { score, snippet } = scoreDoc(doc, terms);
    if (score <= 0) continue;
    ranked.push({
      score,
      hit: {
        kind: doc.kind,
        title: doc.title,
        href: doc.href,
        snippet: snippet && trimSnippet(snippet, terms),
      },
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((r) => r.hit);
}
