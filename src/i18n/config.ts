/* Locale configuration.
 *
 * Indonesian stays unprefixed at `/`, English lives at `/en`. That is a
 * deliberate choice against Next's `prefixDefaultLocale`: prefixing the default
 * would relocate every URL the site already has to /id/… for no benefit, and
 * this rewrite has just finished giving those URLs to eighteen articles that
 * previously had none. middleware.ts is what keeps `/` serving Indonesian
 * without an /id segment appearing in the address bar.
 */

export const LOCALES = ['id', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'id';

/* Remembers a visitor's locale choice so middleware.ts's root-entry redirect
 * (first-time and returning visitors land on /en) only fires until someone
 * has actually picked a language — read there, and written here by the
 * switcher itself (see LangSwitch in SiteHeader.tsx) so the choice takes
 * effect on the very next request rather than the one after. */
export const LOCALE_COOKIE = 'nu_locale';

export const LOCALE_LABEL: Record<Locale, string> = { id: 'ID', en: 'EN' };

/** BCP 47 tags, for <html lang> and og:locale. */
export const LOCALE_TAG: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };
export const OG_LOCALE: Record<Locale, string> = { id: 'id_ID', en: 'en_US' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
