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

/* Both locales, because the failure this cannot be allowed to miss is an
   internal link that forgot its /en prefix. Such a link still answers 200 — it
   just silently drops an English reader onto the Indonesian page — so status
   codes alone would pass it. checkPrefix() below is what actually catches it.

   The sitemap lists only Indonesian URLs by design (one entry per page, with
   hreflang alternates), so the /en article and event pages are derived here
   rather than read from it. */
const LOCALE_PREFIXES = ['', '/en'];

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

const indonesian = [...new Set([...pages, ...(await routedUrls())])];
const all = LOCALE_PREFIXES.flatMap((prefix) =>
  indonesian.map((path) => (prefix && path === '/' ? prefix : prefix + path))
);
console.log(`memeriksa ${all.length} halaman (${LOCALE_PREFIXES.length} locale)…\n`);

/* An internal link on an /en page must stay on /en. Two exceptions, both
   deliberate: the language switcher's own link out to Indonesian, which carries
   hrefLang="id", and /icon.svg, which has no locale. */
function checkPrefix(page, ref, html) {
  if (!page.startsWith('/en')) return;
  if (!ref.startsWith('/') || ref.startsWith('//')) return;
  // /en, /en/berita, /en#kontak and /en?q= are all correctly prefixed. The
  // boundary matters: /english would not be.
  if (/^\/en(?=$|[/#?])/.test(ref)) return;
  /* Only page paths carry a locale. Anything with a file extension is an asset
     and is served from one place for both locales — the same rule the
     middleware matcher uses, and for the same reason: enumerating the exempt
     files by name is what let /logo-rekam.svg slip through in the first place. */
  if (/^\/_next\//.test(ref) || /\.[a-z0-9]+($|[?#])/i.test(ref)) return;
  // The switcher advertises the Indonesian URL on purpose.
  if (html.includes(`hrefLang="id"`) && html.includes(`href="${ref}"`)) {
    const tag = html.slice(Math.max(0, html.indexOf(`href="${ref}"`) - 200), html.indexOf(`href="${ref}"`));
    if (tag.includes('hrefLang="id"')) return;
  }
  problems.push(`${page} -> ${ref} (tautan internal kehilangan prefiks /en)`);
}

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
  /* CSS url(), from both inline style attributes and <style> blocks. Added
     because this checker missed a real one: the brand mark is painted as a
     background and an alpha mask in Brand.tsx, so its only reference anywhere
     in the HTML is a url() inside a style attribute. When the middleware
     matcher started rewriting /logo-rekam.svg, every page 404'd the logo and
     this script still reported everything alive — an <img> would have been
     caught, a background was not. Anything the browser fetches counts. */
  for (const m of html.matchAll(/url\(\s*([^)]+?)\s*\)/g)) {
    /* Decode BEFORE stripping the quotes, not after. In built HTML a style
       attribute is entity-escaped, so the source reads url(&quot;/x.svg&quot;)
       — matching quotes first finds none and leaves them in the path, which
       then 404s for the wrong reason and would report a false failure the day
       the real one is fixed. */
    refs.add(decodeEntities(m[1]).replace(/^['"]|['"]$/g, ''));
  }

  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('data:')) continue;
    if (/^(mailto:|tel:)/.test(ref)) continue;
    // External links are not this script's business: it verifies the build,
    // not the rest of the internet.
    if (/^https?:\/\//.test(ref) && !ref.startsWith(BASE)) continue;
    if (KNOWN_MISSING.some((k) => ref.includes(k))) continue;

    checkPrefix(path, ref, html);

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
