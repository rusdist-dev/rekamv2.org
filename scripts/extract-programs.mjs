/* One-off: lift the programme pages' prose and "By the numbers" blocks out of
 * markup into data.
 *
 *   node scripts/extract-programs.mjs
 *
 * 19 stat groups and 47 figures across three pages, plus the overview prose and
 * the closing copy. Typing those by hand is how digits get transposed, so they
 * are read out of the source instead.
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
const OUT = 'src/data/programs.json';

const PAGES = {
  forest: 'program-forest.html',
  urban: 'program-urban.html',
  ocean: 'program-ocean.html',
};

const clean = (s) => decodeEntities(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const iconOf = (block) => /<use href="#([^"]+)"/.exec(block)?.[1];

const out = {};

for (const [key, file] of Object.entries(PAGES)) {
  const html = fs.readFileSync(path.join(SITE, file), 'utf8');

  /* ---- hero ---- */
  const heroEyebrow = clean(/class="eyebrow eyebrow--light">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '');
  const heroTitle = clean(/class="hero__title">([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '');
  /* Only emit <source> tags for footage that is actually on disk. Forest and
     urban both reference pano-*.mp4 / .webm files that were never delivered —
     four of the sixteen missing assets. The old page shipped the tags anyway
     and relied on the error handler to fall back, which works but costs a 404
     per source on every visit. Filtering here keeps the fallback path
     (a hero with no <source> is procedural BY DESIGN) and drops the wasted
     requests. Drop the files in and they are picked up on the next run. */
  const sources = [...html.matchAll(/<source src="([^"]+)" type="([^"]+)">/g)]
    .filter((m) => fs.existsSync(path.join('public', m[1])))
    .map((m) => ({ src: '/' + m[1], type: m[2] }));
  const scene = /data-scene="([^"]+)"/.exec(html)?.[1] ?? key;

  /* ---- overview ---- */
  const overviewBlock = /<section class="overview"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
  const overview = [...overviewBlock.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => clean(m[1])).filter(Boolean);
  const overviewArt = /class="overview__art" src="([^"]+)"/.exec(overviewBlock)?.[1];
  const overviewArtAlt = clean(/class="overview__art"[^>]*alt="([^"]*)"/.exec(overviewBlock)?.[1] ?? '');

  /* ---- numbers ---- */
  const numbersBlock = /<section class="numbers"[\s\S]*?<div class="bn">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/.exec(html);
  const numbersTitle = clean(/class="display numbers__title">([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? '');
  const numbersLede = clean(/class="numbers__lede">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '');
  const numbersNote = clean(/class="numbers__note">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '');

  const groups = [];
  for (const g of html.matchAll(/<section class="bn__group">([\s\S]*?)<\/section>/g)) {
    const body = g[1];
    const heading = clean(/class="bn__heading">([\s\S]*?)<\/h3>/.exec(body)?.[1] ?? '');
    const when = clean(/class="bn__when">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '') || undefined;
    const note = clean(/class="bn__note">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '') || undefined;

    /* A headline group is one oversized figure rather than a row of stats. */
    const headline = /class="bn__headline"/.test(body);

    const items = [];
    for (const s of body.matchAll(/<div>\s*(<svg[\s\S]*?)<\/div>/g)) {
      const cell = s[1];
      const value = clean(/class="bn__value">([\s\S]*?)<\/p>/.exec(cell)?.[1] ?? '');
      const label = clean(/class="bn__label">([\s\S]*?)<\/p>/.exec(cell)?.[1] ?? '');
      /* Some cells carry a chip list naming what the figure counts — the five
         hornbill species behind forest's "52 jenis burung", for instance. */
      const chips = [
        ...(/<ul class="bn__chips">([\s\S]*?)<\/ul>/.exec(cell)?.[1] ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g),
      ].map((c) => clean(c[1]));
      if (value || label) items.push({ icon: iconOf(cell), value, label, ...(chips.length ? { chips } : {}) });
    }

    // The headline variant puts value/label directly in the group, not in cells.
    if (!items.length) {
      const value = clean(/class="bn__value">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '');
      const label = clean(/class="bn__label">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '');
      if (value || label) items.push({ icon: iconOf(body), value, label });
    }

    /* Ocean's blue-carbon group carries a table instead of figures. Its
       <caption> is visually hidden but is the only thing describing the table
       to a screen reader, so it travels with the data. */
    const tableBlock = /<table class="bn__table">([\s\S]*?)<\/table>/.exec(body)?.[1];
    let table;
    if (tableBlock) {
      const caption = clean(/<caption[^>]*>([\s\S]*?)<\/caption>/.exec(tableBlock)?.[1] ?? '');
      const head = [...(/(<thead[\s\S]*?<\/thead>)/.exec(tableBlock)?.[1] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => clean(m[1]));
      const rows = [...(/(<tbody[\s\S]*?<\/tbody>)/.exec(tableBlock)?.[1] ?? '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) =>
        [...r[1].matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/g)].map((c) => clean(c[1]))
      );
      table = { ...(caption ? { caption } : {}), head, rows };
    }

    /* Ocean's regulation group is a status list rather than figures: a badge
       (Disahkan / Rancangan), the document's title, and its reference. */
    const policy = [
      ...(/<ul class="bn__policy">([\s\S]*?)<\/ul>/.exec(body)?.[1] ?? '').matchAll(/<li>([\s\S]*?)<\/li>/g),
    ].map((m) => ({
      status: clean(/class="bn__badge[^"]*">([\s\S]*?)<\/span>/.exec(m[1])?.[1] ?? ''),
      title: clean(/<b>([\s\S]*?)<\/b>/.exec(m[1])?.[1] ?? ''),
      ref: clean(/class="bn__ref">([\s\S]*?)<\/span>/.exec(m[1])?.[1] ?? ''),
    }));

    groups.push({
      heading,
      ...(when ? { when } : {}),
      ...(note ? { note } : {}),
      headline,
      items,
      ...(table ? { table } : {}),
      ...(policy.length ? { policy } : {}),
    });
  }

  /* ---- news rail heading: 'From Forest' / 'From City' / 'From Sea' ---- */
  const postsTitle = clean(/class="display posts__title">([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? '');

  /* ---- closing ---- */
  const closing = clean(/class="display closing__title">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '') || undefined;

  out[key] = {
    scene,
    hero: { eyebrow: heroEyebrow, title: heroTitle, sources },
    overview: { body: overview, art: overviewArt ? overviewArt.replace(/^assets\//, '') : undefined, artAlt: overviewArtAlt },
    numbers: { title: numbersTitle, lede: numbersLede, note: numbersNote, groups },
    postsTitle,
    ...(closing ? { closing } : {}),
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

for (const [key, p] of Object.entries(out)) {
  const stats = p.numbers.groups.reduce((n, g) => n + g.items.length, 0);
  const tables = p.numbers.groups.filter((g) => g.table).length;
  console.log(
    `${key.padEnd(7)} hero="${p.hero.title.slice(0, 38)}"  overview=${p.overview.body.length} paragraf  ` +
      `grup=${p.numbers.groups.length}  angka=${stats}${tables ? `  tabel=${tables}` : ''}`
  );
}
console.log(`\ntotal grup=${Object.values(out).reduce((n, p) => n + p.numbers.groups.length, 0)}  ` +
  `angka=${Object.values(out).reduce((n, p) => n + p.numbers.groups.reduce((m, g) => m + g.items.length, 0), 0)}`);
