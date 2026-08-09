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
