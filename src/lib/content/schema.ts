import { z } from 'zod';

/* Content schemas.
 *
 * These do double duty. Today they validate hand-extracted JSON, which is
 * mostly a spell-check. Their real job starts when the CMS lands: the same
 * schemas run against the API response, so a backend that starts sending
 * `date` as a timestamp or `price` as a string fails the build naming the
 * field, instead of rendering "Invalid Date" to a visitor.
 *
 * Optionality here is evidence about the source data, not laziness — each
 * loose field is annotated with why.
 */

export const PROGRAMS = ['forest', 'urban', 'ocean'] as const;
export const programSchema = z.enum(PROGRAMS);
export type Program = (typeof PROGRAMS)[number];

export const newsSchema = z.object({
  /* The only identifier that exists in the source: the stem of the article's
     image filename. Every one of the 34 detail links pointed at the bare
     string "berita-detail.html", so there was nothing else to recover. */
  slug: z.string().min(1),

  title: z.string().min(1),

  /* The source stored free text ("24 July 2026"). Coerced to a real date so
     sorting and <time datetime> work, and so a CMS sending ISO or a timestamp
     both land correctly. */
  date: z.coerce.date(),

  /* Only the lead post carried one, merged into its date line as
     "29 July 2026 / Sorotan". */
  category: z.string().optional(),

  /* Several excerpts in the source are truncated mid-word — they were scraped.
     Left as-is rather than silently repaired; the CMS will replace them. */
  excerpt: z.string(),

  /* Optional because five of the eighteen articles reference a cover image
     that is not on disk. A required image() would stop the build over art
     nobody can produce today, so PostCard renders a tinted placeholder and
     scripts/check-links.mjs reports the gap instead. */
  cover: z.string().optional(),
  coverAlt: z.string().default(''),

  /* Derived from which programme rails the article appeared in. Nine of
     eighteen were tagged this way; the rest appeared only in the main archive. */
  programs: z.array(programSchema).default([]),

  featured: z.boolean().default(false),

  /* Absent for seventeen of eighteen articles: the source only ever wrote one
     full article body, in berita-detail.html. The CMS fills these in. Until
     then the detail page shows the excerpt and says so. */
  body: z.string().optional(),

  lang: z.enum(['id', 'en']).default('id'),
});

export type News = z.infer<typeof newsSchema>;

/* Events.
 *
 * Only one event has any content. "Bangga Papua" existed solely as a second
 * nav link that pointed at the SAME event-detail.html file as the first — a
 * link that showed you a different event than it named. There is nothing to
 * migrate for it, so it is not invented here; the nav is derived from this
 * collection instead, which makes that class of lie impossible to reintroduce.
 *
 * Bilingual shape: every field a reader sees is `{ id, en }` rather than a
 * bare string, Indonesian being the canonical/original text with a faithful
 * English translation alongside it — same spirit as src/i18n/content, just
 * inlined onto the data because this collection *is* the copy. `localized`
 * below is that pair; `documentation` (slugs into the news collection, out of
 * scope for this pass) and structural bits (`slug`, `cover`, `agenda[].time`)
 * stay plain strings.
 *
 * One exception: `title` currently carries the same text in both languages.
 * "Cerita Laut Nusantara" is this event's proper name, not a description —
 * the same call the /initiative page makes for "Bangga Papua: Back to the
 * roots" (see src/i18n/content/initiative.ts). A future event with a
 * genuinely different English name can simply set title.en to something else.
 */
const localized = z.object({ id: z.string(), en: z.string() });
export type Localized = z.infer<typeof localized>;

export const eventSchema = z.object({
  slug: z.string().min(1),
  title: localized,
  lede: localized,
  cover: z.string().optional(),
  coverAlt: localized.default({ id: '', en: '' }),

  /* The source shipped a yellow warning strip saying the details below are
     placeholders. Keeping it as a field rather than hardcoding it means a real
     event simply omits it. */
  notice: localized.optional(),

  /* Tanggal / Lokasi / Biaya / Kuota. Free-form label+value pairs because two
     of the four currently read "Menyusul" — typing them as a real date would
     mean inventing one. */
  facts: z.array(z.object({ label: localized, value: localized })).default([]),

  about: z
    .object({
      eyebrow: localized,
      title: localized,
      body: z.array(localized),
    })
    .optional(),

  agenda: z
    .array(z.object({ time: z.string(), title: localized, detail: localized }))
    .default([]),

  /* Rendered as the 01/02/03 cards. Capped at three because the source styles
     colour them by position — .numbers__grid .numcard:nth-child(1|2|3) — so a
     fourth would render unstyled. */
  gains: z.array(localized).max(3).default([]),

  /* Explicit article slugs, not a derived query. The source's rail mixed two
     ocean-tagged articles with the event's own namesake piece, which no simple
     rule reproduces — it was curated. Left as plain slugs, not localized: the
     news collection itself carries the language split (`News.lang`), and
     translating berita content is explicitly out of scope here. */
  documentation: z.array(z.string()).default([]),

  cta: z
    .object({
      title: localized,
      lede: localized,
      note: localized.optional(),
    })
    .optional(),
});

export type EventRecord = z.infer<typeof eventSchema>;

/** An EventRecord with every `localized` field resolved to one locale's
 *  plain string — what the pages actually render. */
export type ResolvedEvent = {
  slug: string;
  title: string;
  lede: string;
  cover?: string;
  coverAlt: string;
  notice?: string;
  facts: { label: string; value: string }[];
  about?: { eyebrow: string; title: string; body: string[] };
  agenda: { time: string; title: string; detail: string }[];
  gains: string[];
  documentation: string[];
  cta?: { title: string; lede: string; note?: string };
};
