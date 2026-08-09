/* Visible-text extractor, used for the content-parity check.
 *
 * The point is not perfect HTML parsing — it is running the SAME function over
 * the old static pages and the new build output, so anything that survives one
 * side and not the other is a real content loss. Consistency beats correctness
 * here, which is why this is dependency-free regex work rather than parse5.
 *
 * Entity decoding is not optional. The corpus is full of &#x27; and &middot;,
 * and berita-detail.html carries double-escaped &amp;#39; from a scrape. React
 * escapes expression output, so a stored &#x27; renders as literal text — the
 * baseline has to be decoded or every one of those reads as a diff.
 *
 *   node scripts/extract-text.mjs <dir-of-html> > baseline.json
 */

import fs from 'node:fs';
import path from 'node:path';

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  middot: '·', ndash: '–', mdash: '—', hellip: '…',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  laquo: '«', raquo: '»', times: '×', minus: '−',
  darr: '↓', uarr: '↑', larr: '←', rarr: '→',
  copy: '©', reg: '®', trade: '™', deg: '°',
  eacute: 'é', egrave: 'è', hearts: '♥', bull: '•',
};

/* Decode repeatedly: berita-detail.html:121-124 has &amp;#39;, which needs two
   passes to reach an apostrophe. Bounded so malformed input cannot spin. */
export function decodeEntities(s) {
  let out = s;
  for (let pass = 0; pass < 3; pass++) {
    const next = out
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
    if (next === out) break;
    out = next;
  }
  return out;
}

/* Block-level tags become separators so words either side never fuse into one
   token ("HutanOcean"), which would defeat the parity comparison. */
const BLOCK = /<\/?(?:p|div|section|article|header|footer|main|nav|ul|ol|li|h[1-6]|br|hr|tr|td|th|dt|dd|figure|figcaption|blockquote|details|summary|option|label|button|a|span|time|small|strong|em|sup|sub)\b[^>]*>/gi;

/* Elements carrying the `hidden` attribute. The old site used it liberally for
   copy that was written but deliberately not shown — program-forest.html's
   hero lede, the "Dampak dalam angka" eyebrow, the "Berita terkait" eyebrow,
   index.html's volunteer lede. rekam.css:69 made it stick with
   [hidden]{display:none!important}, so none of it was ever visible, and
   counting it as content would demand the rewrite reproduce text no reader
   has seen. Non-greedy same-tag match, which is enough for the flat
   single-element cases the corpus actually contains. */
/* Note: [hidden] elements are NOT stripped here.
 *
 * The old site used the attribute for copy that was written but deliberately
 * not shown — program-forest.html's hero lede, the "Dampak dalam angka" and
 * "Berita terkait" eyebrows, index.html's volunteer lede. Removing them would
 * be more correct in principle, but doing it needs real tag balancing: a
 * regex over <tag …>…</tag> lets an outer <div> match first and swallow the
 * hidden child, and a looser /\bhidden\b/ test matches aria-hidden and
 * Tailwind's class="hidden" too. A subtle bug in the tool that verifies the
 * migration is worse than a short list, so the handful of affected blocks are
 * named individually in scripts/check-parity.mjs instead. */

export function visibleText(html) {
  return decodeEntities(
    html
      // Comments carry authoring notes, not page content.
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // Script and style bodies are code. SVG is kept: the strategy diagram in
      // tentang.html puts real words inside <textPath>.
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(BLOCK, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// Only run the CLI when this file IS the entry point. Comparing resolved paths
// rather than URL-vs-argv strings, which differ on Windows.
if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  const dir = process.argv[2];
  const out = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html')).sort()) {
    out[file] = visibleText(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
  process.stdout.write(JSON.stringify(out, null, 2));
}
