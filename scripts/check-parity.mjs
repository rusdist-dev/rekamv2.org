/* Content parity: every visible text block on an old page must still appear on
 * its replacement.
 *
 * This is the cheapest high-value check in the rewrite. Visual regression can
 * only tell you something moved; it cannot tell you a paragraph was dropped
 * while being lifted out of markup and into data. That is the likeliest way to
 * lose something here, and it is silent.
 *
 *   node scripts/check-parity.mjs <old-page.html> <new-url> [more pairs...]
 *
 * Comparison is on normalised text, so wrapping and entity spelling do not
 * matter — only whether the words survived.
 */

import fs from 'node:fs';
import { visibleText } from './extract-text.mjs';

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

/* Blocks that are gone on purpose. Each needs a reason; this list is read in
   review, so "we changed it" is not enough. */
const INTENTIONAL = [
  { text: 'who we are', why: 'nav label unified to Indonesian (index.html was the only English one)' },
  { text: 'field notes', why: 'nav label unified to Indonesian' },
  { text: 'whats on', why: 'nav label unified to Indonesian' },
  { text: 'take part', why: 'nav label unified to Indonesian' },

  /* Nav submenu contents. The old markup kept these in the DOM at all times and
     hid them with opacity/visibility; Radix renders menu content only while the
     menu is open. Nothing becomes unreachable — /event and /donasi both list
     their own children — but it IS a real difference: these two links now need
     JavaScript, where before they were plain anchors. Accepted because the
     destinations are reachable without them. */
  { text: 'cerita laut nusantara', why: 'nav submenu; rendered on open by Radix. Reachable from /event.' },
  { text: 'bangga papua', why: 'nav submenu; rendered on open by Radix. Reachable from /event.' },
  { text: 'adopsi pohon pakan', why: 'nav submenu; the section itself still exists at /donasi#adopsi' },
  { text: 'fundraising product', why: 'nav submenu; the section itself still exists on /donasi' },

  /* Group headings. The rail hid these with display:none and only showed them
     in the drawer; they now carry the same meaning as the nav's aria-label,
     which is what assistive tech actually announces. */
  { text: 'jelajahi', why: 'rail group heading, now the aria-label on <nav>' },
  { text: 'program', why: 'rail group heading, now the aria-label on <nav>' },
];

const baseline = JSON.parse(fs.readFileSync('baseline/content.json', 'utf8'));
const pairs = process.argv.slice(2);
if (pairs.length % 2) {
  console.error('usage: node scripts/check-parity.mjs <old-page.html> <new-url> [...]');
  process.exit(1);
}

let failed = 0;

for (let i = 0; i < pairs.length; i += 2) {
  const [oldPage, newUrl] = [pairs[i], pairs[i + 1]];
  const oldBlocks = baseline[oldPage];
  if (!oldBlocks) {
    console.error(`  ! ${oldPage} tidak ada di baseline/content.json`);
    failed++;
    continue;
  }

  const html = await fetch(newUrl).then((r) => r.text());
  const haystack = norm(visibleText(html).join(' \n '));

  const missing = [];
  for (const block of oldBlocks) {
    const needle = norm(block);
    if (!needle || needle.length < 3) continue;
    if (haystack.includes(needle)) continue;
    const excused = INTENTIONAL.find((x) => needle.includes(x.text));
    if (excused) continue;
    missing.push(block);
  }

  const status = missing.length ? 'GAGAL' : 'ok';
  console.log(`${status.padEnd(6)} ${oldPage} -> ${newUrl}   ${oldBlocks.length - missing.length}/${oldBlocks.length} blok`);
  for (const m of missing) console.log(`         hilang: ${m.slice(0, 110)}`);
  if (missing.length) failed++;
}

// process.exitCode rather than process.exit(): an immediate exit while fetch's
// keep-alive sockets are still open trips a libuv assertion on Windows.
process.exitCode = failed ? 1 : 0;
