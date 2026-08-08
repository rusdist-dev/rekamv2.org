/* Switch the site between navbar layouts.
 *
 *   node tools/switch-nav.mjs card     → floating card, pinned top-left
 *   node tools/switch-nav.mjs bar      → full-width horizontal bar
 *   node tools/switch-nav.mjs overlay  → full-screen overlay menu
 *   node tools/switch-nav.mjs station  → centred mark, lowercase rail, cursor
 *   node tools/switch-nav.mjs          → report which variant is active
 *
 * All variants drive the same markup and the same rekam.js, so switching is
 * only a matter of which stylesheet each page links.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const VARIANTS = {
  card: 'nav-card.css',        // floating panel, pinned top-left
  bar: 'nav-bar.css',          // full-width horizontal bar
  overlay: 'nav-overlay.css',  // mark + toggle, opening to a full-screen menu
  station: 'nav-station.css',  // centred mark, lowercase rail, follower cursor
};
const LINK_RE = /[ \t]*<link rel="stylesheet" href="nav-(?:card|bar|overlay|station)\.css">\n/;

const pages = fs.readdirSync(SITE).filter((f) => f.endsWith('.html'));
const wanted = process.argv[2];

if (!wanted) {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(SITE, page), 'utf8');
    const found = Object.entries(VARIANTS).find(([, file]) => html.includes(`href="${file}"`));
    console.log(`${page.padEnd(24)} ${found ? found[0] : 'none'}`);
  }
  process.exit(0);
}

if (!VARIANTS[wanted]) {
  console.error(`unknown variant "${wanted}" — expected: ${Object.keys(VARIANTS).join(' | ')}`);
  process.exit(1);
}

const file = VARIANTS[wanted];
const link = `<link rel="stylesheet" href="${file}">`;
let changed = 0;

for (const page of pages) {
  const full = path.join(SITE, page);
  const before = fs.readFileSync(full, 'utf8');
  let after;

  if (LINK_RE.test(before)) {
    after = before.replace(LINK_RE, `${link}\n`);
  } else {
    // First run: insert straight after the shared stylesheet.
    after = before.replace(
      /([ \t]*<link rel="stylesheet" href="rekam\.css">\n)/,
      `$1${link}\n`
    );
  }

  if (after === before) {
    console.warn(`! ${page}: could not place the nav stylesheet link`);
    continue;
  }
  fs.writeFileSync(full, after);
  changed++;
}

console.log(`nav variant → ${wanted} (${file}) across ${changed}/${pages.length} pages`);
