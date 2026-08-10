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

export const LOCALE_LABEL: Record<Locale, string> = { id: 'ID', en: 'EN' };

/** BCP 47 tags, for <html lang> and og:locale. */
export const LOCALE_TAG: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };
export const OG_LOCALE: Record<Locale, string> = { id: 'id_ID', en: 'en_US' };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
