import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config';

/* Keeps Indonesian unprefixed.
 *
 * Routes live under app/[locale], so /berita has no file to match. This
 * REWRITES it to /id/berita internally — a rewrite, not a redirect, so the
 * address bar keeps showing /berita and every URL the site already publishes
 * stays exactly as it is. That matters here: this rewrite has just given
 * eighteen articles their first real URLs, and prefixing the default locale
 * would have moved them again.
 *
 * /en/... is left alone; it already matches.
 */

const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already carries a non-default locale: nothing to do.
  if (PREFIXED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  /* Belt and braces against the address bar ever showing the default prefix.
     Someone linking /id/berita gets redirected to the canonical /berita rather
     than the site serving the same page at two URLs. */
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /* Pages only. Anything with a file extension is skipped, and that is the
     whole point of the rule: the previous version named the excluded files one
     by one — sitemap.xml, robots.txt, icon.svg, favicon.ico, assets/ — and so
     it silently rewrote /logo-rekam.svg to /id/logo-rekam.svg and 404'd it. The
     brand mark is referenced from a CSS url() in Brand.tsx rather than an <img>,
     so nothing on screen said "broken image"; the logo was simply absent.

     Matching on the extension covers every file public/ holds today and every
     one added later. Route slugs never contain a dot, so nothing real is lost.

     Kept out separately: _next/ (build output) and api/ (route handlers), which
     have no extension. */
  matcher: ['/((?!_next/|api/|.*\\.).*)'],
};
