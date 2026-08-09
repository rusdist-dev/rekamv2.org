/* Link and asset checker over the running build.
 *
 *   node scripts/check-links.mjs [base-url]
 *
 * This is what replaced typedRoutes. That feature types a dynamic route as
 * Route<T> where T must be the literal path, so it cannot check links built
 * from data — every news slug, every nav entry read from a config array. It
 * would have been fought and eventually cast away.
 *
 * Walking the built pages catches strictly more: broken internal links AND
 * missing assets, both of which the source had plenty of. It also catches the
 * specific failure this migration was most exposed to — a slug that exists in
 * the data but was never routed.
 */

import { decodeEntities } from './extract-text.mjs';

const BASE = process.argv[2] ?? 'http://localhost:3100';

/* Assets the source referenced but never delivered. Each is a real gap, and
   they are listed so a NEW one still fails: see scripts/extract-*.mjs, which
   drop these from the data rather than emitting broken <img> tags. */
const KNOWN_MISSING = [
  'assets/pano-forest.mp4',
  'assets/pano-forest.webm',
  'assets/pano-urban.mp4',
  'assets/pano-urban.webm',
];

const pages = [
  '/',
  '/tentang',
  '/program/forest',
  '/program/urban',
  '/program/ocean',
  '/berita',
  '/event',
  '/donasi',
  '/merch',
  '/checkout',
];

const seen = new Map(); // url -> status
const problems = [];

async function head(url) {
  if (seen.has(url)) return seen.get(url);
  let status = 0;
  try {
    // Some static hosts do not answer HEAD for hashed assets; fall back to a
    // ranged GET rather than downloading whole images.
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { headers: { Range: 'bytes=0-0' }, redirect: 'follow' });
    }
    status = res.status;
  } catch {
    status = 0;
  }
  seen.set(url, status);
  return status;
}

/** Collect the news and event slugs the site claims to have, from the sitemap. */
async function routedUrls() {
  const xml = await (await fetch(new URL('/sitemap.xml', BASE))).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

const all = [...new Set([...pages, ...(await routedUrls())])];
console.log(`memeriksa ${all.length} halaman…\n`);

for (const path of all) {
  const url = new URL(path, BASE).href;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    problems.push(`${path} -> HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();

  /* Attribute values are HTML-encoded, so a next/image URL arrives as
     ...&amp;w=3840. Requesting that literally sends a parameter named "amp;w"
     and the optimiser answers 400 — which looks exactly like a broken asset. */
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.add(decodeEntities(m[1]));
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of decodeEntities(m[1]).split(',')) refs.add(part.trim().split(/\s+/)[0]);
  }

  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('data:')) continue;
    if (/^(mailto:|tel:)/.test(ref)) continue;
    // External links are not this script's business: it verifies the build,
    // not the rest of the internet.
    if (/^https?:\/\//.test(ref) && !ref.startsWith(BASE)) continue;
    if (KNOWN_MISSING.some((k) => ref.includes(k))) continue;

    const target = new URL(ref, url).href;
    const status = await head(target);
    if (status >= 400 || status === 0) {
      problems.push(`${path} -> ${ref} (HTTP ${status || 'gagal'})`);
    }
  }
}

if (problems.length) {
  console.log(`${problems.length} masalah:`);
  for (const p of [...new Set(problems)]) console.log('  ' + p);
} else {
  console.log(`ok — ${seen.size} tautan & aset unik diperiksa, semuanya hidup.`);
}
process.exitCode = problems.length ? 1 : 0;
