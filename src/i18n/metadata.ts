import type { Metadata } from 'next';
import { DEFAULT_LOCALE, LOCALES, OG_LOCALE, isLocale, type Locale } from './config';
import { withLocale } from './routing';

/* Per-page hreflang.
 *
 * The root layout can only speak for the home page — `canonical: '/'` and
 * `languages: { id: '/', en: '/en' }` are literally the home page's URLs. Every
 * other route has to declare its own, or /en/berita would advertise /berita as
 * its canonical and ask Google to drop it.
 *
 * Pages therefore export generateMetadata rather than a static `metadata`
 * object: the canonical depends on the locale, and a static object cannot see
 * params. This helper keeps that from becoming nine hand-maintained copies of
 * the same alternates block, each a chance to paste the wrong path.
 */

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Resolve the locale param, falling back rather than throwing — the layout
 *  already calls notFound() for an unknown one, and metadata runs first. */
export async function readLocale(params: LocaleParams['params']): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Metadata for one page in one locale.
 *
 * @param path app-relative and locale-free, e.g. `/program/forest`
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  meta: Omit<Metadata, 'alternates'> & { title: string; description: string }
): Metadata {
  const url = withLocale(locale, path);

  return {
    ...meta,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, withLocale(l, path)])),
        /* Indonesian is the default and the unprefixed URLs are the ones that
           already exist, so it is also x-default. */
        'x-default': withLocale(DEFAULT_LOCALE, path),
      },
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale],
      title: meta.title,
      description: meta.description,
      url,
      ...meta.openGraph,
    },
  };
}
