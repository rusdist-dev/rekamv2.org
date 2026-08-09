/* One-off: lift the news records out of the six files that carried copies of
 * them into a single JSON collection.
 *
 *   node scripts/extract-news.mjs
 *
 * The same article was retyped in up to three places — berita.html, a
 * programme page's "From Forest/Sea/City" rail, and berita-detail.html's
 * "Baca juga". 33 blocks in all, for roughly 18 distinct articles. Cross-file
 * duplication is how the data drifts, so this collapses them and uses the
 * duplication for something useful instead: which programme rails an article
 * appeared in becomes its `programs` tag.
 *
 * Slug: the only identifier that exists anywhere today is the stem of the
 * article's image filename. All 34 detail links point at the bare string
 * "berita-detail.html", so there is nothing else to recover.
 *
 * PROVENANCE. This reads site/, which was removed at cutover. To re-run it,
 * restore the original first:
 *
 *     git checkout baseline -- site/
 *
 * The tag `baseline` is the untouched static site as imported.
 */

import fs from 'node:fs';
import path from 'node:path';
import { decodeEntities } from './extract-text.mjs';

const SITE = 'site';
const OUT = 'src/data/news.json';

/* Which programme each page's post rail belongs to. berita.html and the two
   detail pages contribute records but no tag. */
const PROGRAM_OF = {
  'program-forest.html': 'forest',
  'program-ocean.html': 'ocean',
  'program-urban.html': 'urban',
};

const clean = (s) => decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const slugOf = (src) => path.basename(src, path.extname(src));

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** "24 July 2026" -> "2026-07-24". Free text in the source; a real date here. */
function isoDate(text) {
  const m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(text);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return `${m[3]}-${String(month).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
}

/** id -> record, merged across files. */
const posts = new Map();

function add(slug, fields, program) {
  const existing = posts.get(slug);
  if (!existing) {
    posts.set(slug, { ...fields, programs: program ? [program] : [] });
    return;
  }
  // Prefer the richest copy: the programme rails omit the excerpt entirely.
  for (const [k, v] of Object.entries(fields)) {
    if (v && (!existing[k] || String(existing[k]).length < String(v).length)) existing[k] = v;
  }
  if (program && !existing.programs.includes(program)) existing.programs.push(program);
}

for (const file of fs.readdirSync(SITE).filter((f) => f.endsWith('.html')).sort()) {
  const html = fs.readFileSync(path.join(SITE, file), 'utf8');
  const program = PROGRAM_OF[file];

  // ---- the lead post on berita.html ----
  const lead = /<a class="lead-post__link"[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?class="post__date">([\s\S]*?)<\/p>[\s\S]*?class="lead-post__title">([\s\S]*?)<\/h2>[\s\S]*?class="lead-post__excerpt">([\s\S]*?)<\/p>/.exec(html);
  if (lead) {
    const [, src, dateRaw, title, excerpt] = lead;
    const dateText = clean(dateRaw);
    add(slugOf(src), {
      title: clean(title),
      date: isoDate(dateText),
      // The lead carries a category merged into its date line: "29 July 2026 / Sorotan"
      category: dateText.split('/').slice(1).join('/').trim() || undefined,
      excerpt: clean(excerpt),
      cover: `berita/${path.basename(src)}`,
      featured: true,
    });
  }

  // ---- ordinary .post cards, on every page that carries a rail ----
  for (const m of html.matchAll(
    /<article class="post">[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?class="post__date">([\s\S]*?)<\/span>\s*<span class="post__title">([\s\S]*?)<\/span>([\s\S]*?)<\/a>/g
  )) {
    const [, src, dateRaw, title, tail] = m;
    const excerptMatch = /class="post__excerpt">([\s\S]*?)<\/span>/.exec(tail);
    add(
      slugOf(src),
      {
        title: clean(title),
        date: isoDate(clean(dateRaw)),
        excerpt: excerptMatch ? clean(excerptMatch[1]) : undefined,
        cover: `berita/${path.basename(src)}`,
      },
      program
    );
  }
}

/* ---- the one full article the site ever wrote ----
   berita-detail.html is a single hardcoded article, not a template. It carries
   the only real body text on the site, plus a category and a figure caption
   that never made it onto the archive card.

   Its last three paragraphs are dropped on purpose: they are truncated
   excerpts of OTHER articles, pasted in by whatever scraped this content, and
   still carrying double-escaped entities (&amp;#39;, &amp;nbsp;). Ending mid-word
   with "..." is the tell. */
{
  const html = fs.readFileSync(path.join(SITE, 'berita-detail.html'), 'utf8');
  const src = /<figure class="article__figure">[\s\S]*?src="([^"]+)"/.exec(html)?.[1];
  const meta = clean(/class="article__meta">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '');
  const caption = clean(/<figcaption>([\s\S]*?)<\/figcaption>/.exec(html)?.[1] ?? '');
  const bodyHtml = /<div class="wrap article__body">([\s\S]*?)<\/div>/.exec(html)?.[1] ?? '';

  const paras = [...bodyHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => clean(m[1]))
    .filter((p) => !/&#3\d;|&nbsp;/.test(p) && !p.endsWith('...'));

  if (src) {
    const slug = slugOf(src);
    const existing = posts.get(slug);
    if (existing) {
      existing.category = meta.split('/').slice(1).join('/').trim() || existing.category;
      existing.caption = caption;
      existing.body = paras.map((p) => `<p>${p}</p>`).join('\n');
    }
  }
}

/* Which cover files actually exist. Five are referenced but absent, so `cover`
   has to be optional in the schema — a strict image() would stop the build on
   art nobody can produce today. */
const assetDir = 'src/assets';
const records = [...posts.entries()]
  .map(([slug, r]) => ({
    slug,
    title: r.title,
    date: r.date,
    ...(r.category ? { category: r.category } : {}),
    excerpt: r.excerpt ?? '',
    ...(fs.existsSync(path.join(assetDir, r.cover)) ? { cover: r.cover } : {}),
    ...(r.caption ? { coverAlt: r.caption } : {}),
    ...(r.body ? { body: r.body } : {}),
    programs: r.programs.sort(),
    ...(r.featured ? { featured: true } : {}),
  }))
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(records, null, 2) + '\n');

/* Cover images are referenced by path in the data, but next/image wants a
   static import to get intrinsic dimensions and build-time optimisation. This
   map bridges the two. When covers start arriving from the CMS as absolute
   URLs, resolveCover() in src/lib/content/index.ts falls through to a plain
   {src,width,height} object instead — the component signature does not change. */
const withCover = records.filter((r) => r.cover);
const ident = (p) => 'img_' + p.replace(/[^a-z0-9]/gi, '_');
fs.writeFileSync(
  'src/assets/berita/covers.ts',
  `/* GENERATED by scripts/extract-news.mjs — do not edit by hand. */
${withCover.map((r) => `import ${ident(r.slug)} from './${path.basename(r.cover)}';`).join('\n')}
import type { StaticImageData } from 'next/image';

export const COVERS: Record<string, StaticImageData> = {
${withCover.map((r) => `  '${r.cover}': ${ident(r.slug)},`).join('\n')}
};
`
);

const missingCover = records.filter((r) => !r.cover);
const noExcerpt = records.filter((r) => !r.excerpt);
const noDate = records.filter((r) => !r.date);

console.log(`${records.length} artikel unik -> ${OUT}`);
console.log(`  bertag program : ${records.filter((r) => r.programs.length).length}`);
console.log(`  tanpa sampul   : ${missingCover.length}${missingCover.length ? ' (' + missingCover.map((r) => r.slug.slice(0, 34)).join(', ') + ')' : ''}`);
console.log(`  tanpa excerpt  : ${noExcerpt.length}`);
console.log(`  tanpa tanggal  : ${noDate.length}`);
