import { DEFAULT_LOCALE, isLocale, type Locale } from './config';

/* URL shape helpers. One rule, applied in one place:
 *
 *     id  ->  /berita          (no prefix, so existing URLs are untouched)
 *     en  ->  /en/berita
 */

/** Prefix an app-relative href with the locale. Hashes and query survive. */
export function withLocale(locale: Locale, href: string): string {
  if (!href.startsWith('/')) return href; // external, mailto:, tel:, #anchor
  if (locale === DEFAULT_LOCALE) return href;
  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

/** Read the locale out of a pathname. Unknown or absent means the default. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** Strip the locale segment, giving the shared path both locales share. */
export function stripLocale(pathname: string): string {
  const first = pathname.split('/')[1] ?? '';
  if (!isLocale(first)) return pathname || '/';
  const rest = pathname.slice(first.length + 1);
  return rest || '/';
}

/** The same page in the other locale, for the switcher and for hreflang. */
export function alternatePath(pathname: string, target: Locale): string {
  return withLocale(target, stripLocale(pathname));
}
