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

  /* Dates. The source printed English month names ("24 July 2026") on pages
     served as lang="id". They are now formatted with Intl in id-ID, so the
     same date reads "24 Juli 2026" and carries a machine-readable
     <time datetime>. Matched loosely below by month name. */
  ...['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].map(
    (m) => ({ text: m, why: 'date now formatted in id-ID rather than English' })
  ),

  /* The archive footnote. The source hardcoded "Menampilkan 18 dari 155
     tulisan"; the count is derived now, so it cannot go stale. */
  { text: 'menampilkan 18 dari 155 tulisan', why: 'count is derived from the collection' },

  /* berita-detail.html:122-124. Three paragraphs appended to the ICRS article
     that are truncated excerpts of three OTHER articles, still carrying
     double-escaped &amp;#39; and &amp;nbsp;. Scrape debris, dropped on purpose —
     each one still exists as its own article's excerpt. */
  { text: 'following its screenings at the wild coast film festival', why: 'scrape artefact in berita-detail.html:122' },
  { text: 'the last place on earth, an investigative documentary', why: 'scrape artefact in berita-detail.html:124' },
  /* :123 is a truncated copy of the ICRS article's OWN opening paragraph, so it
     has to be matched on the ellipsis rather than the prefix — the full version
     of that sentence is legitimately on the page. */
  { text: 'tourism, coastal...', why: 'scrape artefact in berita-detail.html:123; the full paragraph is present' },

  /* Copy the source wrote but marked [hidden], so no reader has ever seen it.
     rekam.css:69 made that stick with [hidden]{display:none!important}. */
  { text: 'dukungan anda menopang riset', why: 'index.html volunteer lede, [hidden] in source' },
  { text: 'dampak dalam angka', why: 'programme numbers eyebrow, [hidden] in source' },
  { text: 'berita terkait', why: 'programme news eyebrow, [hidden] in source' },
  { text: 'pemantauan tutupan hutan', why: 'program-forest hero lede, [hidden] in source' },
  { text: 'edukasi publik dan dorongan kebijakan', why: 'program-urban hero lede, [hidden] in source' },
  { text: 'kajian stok perikanan dan pengelolaan', why: 'program-ocean hero lede, [hidden] in source' },
  { text: 'kami dampingi — dari puncak hutan', why: 'second line of index.html volunteer lede, [hidden] in source' },

  /* Hero controls for footage that does not exist. The source shipped the
     play and mute buttons on every hero and hid them at runtime when there was
     no video; they are simply not rendered now. Same outcome, less DOM. */
  { text: 'jeda', why: 'play control, only rendered when footage is in use' },
  { text: 'suara', why: 'mute control, only rendered when footage is in use' },

  /* The cart bar. Same pattern: the source shipped it on every visit with
     [hidden] and a "Rp 0" placeholder; it now mounts only once there is
     something in the cart. Covered instead by tests/shop.spec.ts, which drives
     a real cart rather than reading an empty page. */
  { text: 'keranjang', why: 'cart bar mounts only when the cart is non-empty' },
  { text: 'rp 0', why: 'cart bar placeholder total; no bar, no placeholder' },
  { text: 'lanjut ke pembayaran', why: 'cart bar CTA; mounts with the bar' },

  /* The config file moved. Pointing readers at shop-config.js would send them
     to a file that no longer exists. */
  { text: 'lihat shop-config.js', why: 'config is now src/lib/shop/config.ts, and the notice says so' },
];

/* The eleven pages, paired with what replaced them. Kept here rather than in
   the npm script because passing no arguments used to make this exit 0 without
   comparing anything — a parity check that reports success while checking
   nothing is worse than no check at all. Pairs can still be given on the
   command line to test one page.

   Only the Indonesian URLs appear, deliberately: the baseline is an Indonesian
   site, so it is the Indonesian build that owes it parity. /en is held to
   tests/i18n.spec.ts instead. */
const DEFAULT_PAIRS = [
  'index.html', '/',
  'tentang.html', '/tentang',
  'berita.html', '/berita',
  // The one article the source actually wrote a body for.
  'berita-detail.html', '/berita/rekam-di-icrs-2026-membawa-neraca-sumber-daya-laut-indonesia-ke-panggung-global',
  'event-detail.html', '/event/cerita-laut-nusantara',
  'donasi.html', '/donasi',
  'merch.html', '/merch',
  /* checkout.html is deliberately absent — the eleventh page and the only one
     whose content does not exist before hydration. It renders from cart state,
     so a JS-less fetch gets "Memuat keranjang…" and nothing else; asserting
     against that would mean either 52 false failures or 52 exemptions that
     hide real ones. It is covered by tests/shop.spec.ts, which drives a real
     cart through a real browser — a stronger check for this page, not a
     weaker one. */
  'program-forest.html', '/program/forest',
  'program-urban.html', '/program/urban',
  'program-ocean.html', '/program/ocean',
];

const BASE = process.env.PARITY_BASE ?? 'http://localhost:3100';

const baseline = JSON.parse(fs.readFileSync('baseline/content.json', 'utf8'));
const args = process.argv.slice(2);
if (args.length % 2) {
  console.error('usage: node scripts/check-parity.mjs [<old-page.html> <new-url> ...]');
  process.exit(1);
}
const pairs = (args.length ? args : DEFAULT_PAIRS).map((v, i) =>
  i % 2 === 1 && v.startsWith('/') ? new URL(v, BASE).href : v
);

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
    // norm() on both sides. Without it any exemption containing an em-dash or
    // curly quote silently never matches, because the page text has already
    // had those folded away.
    const excused = INTENTIONAL.find((x) => needle.includes(norm(x.text)));
    if (excused) continue;
    missing.push(block);
  }

  const status = missing.length ? 'GAGAL' : 'ok';
  console.log(`${status.padEnd(6)} ${oldPage} -> ${newUrl}   ${oldBlocks.length - missing.length}/${oldBlocks.length} blok`);
  for (const m of missing) console.log(`         hilang: ${m.slice(0, 110)}`);
  if (missing.length) failed++;
}

if (!pairs.length) {
  console.error('tidak ada halaman yang dibandingkan — ini kegagalan, bukan keberhasilan.');
  failed++;
}

// process.exitCode rather than process.exit(): an immediate exit while fetch's
// keep-alive sockets are still open trips a libuv assertion on Windows.
process.exitCode = failed ? 1 : 0;
