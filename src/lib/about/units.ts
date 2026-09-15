import type { StaticImageData } from 'next/image';
import { UNIT_LOGOS } from '@/assets/unit/logos';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { cmsConfigured, cmsList } from '@/lib/cms/client';
import { SITE_URL } from '@/lib/site';
import { ABOUT, pick } from './types';

/* The unit rail on /tentang, wired to the CMS's `units` module
 * (docs/api-public.md) the same way news is wired in src/lib/content/source.ts:
 * live data whenever BASE_URL_CMS and X_API_KEY are set, otherwise the bundled
 * about.json — so a dev machine without keys, or a tenant with the module
 * switched off (a 404 on the endpoint, which cmsList reports as null), still
 * renders the section instead of an empty band.
 *
 * Confirmed against a live /api/v1/units response (2026-09-13): a row carries
 * exactly id, name, description, url, domain, logo_url.
 */

type CmsUnitRow = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  domain: string | null;
  logo_url: string | null;
};

/** One unit as the page renders it: copy already resolved to a single locale,
 *  the logo either a bundled import or an absolute CMS URL. */
export type UnitEntry = {
  name: string;
  text: string;
  /** The unit's own site. Absent when it doesn't have one. */
  href?: string;
  /** Absent when the CMS row has no logo and no bundled asset matches. */
  logo?: StaticImageData | string;
};

function hostOf(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/* Three of the six live units answer `url: "https://rekam.org"` — the
 * foundation's own site — because the CMS field wants something, not because
 * the unit has a site of its own. about.json simply left `href` off those
 * three, and a link back to the page the reader is already on is noise, so a
 * URL on the foundation's own domain is dropped rather than rendered.
 *
 * "Own domain" is NEXT_PUBLIC_SITE_URL's host plus the CMS host with its
 * `cms.` prefix removed — the latter is what this tenant's rows actually carry
 * (cms.rekam.org -> rekam.org) and stays correct for any tenant whose CMS
 * lives on a `cms.` subdomain of its main site. */
const OWN_HOSTS = new Set(
  [hostOf(SITE_URL), hostOf(process.env.BASE_URL_CMS)?.replace(/^cms\./, '')].filter(
    (host): host is string => Boolean(host)
  )
);

/** Bundled fallback art, keyed by the unit name the CMS also uses — covers a
 *  row whose `logo_url` is null (one of the six today). */
const LOCAL_LOGOS = new Map(ABOUT.units.map((unit) => [unit.name, UNIT_LOGOS[unit.logo]]));

/* The CMS's `description` field is not locale-aware — a live row returns the
 * same English text regardless of the `lang` query param (confirmed against
 * /api/v1/units on 2026-09-16). For the six units this tenant already has a
 * hand-translated Indonesian blurb for in about.json, use that instead of the
 * CMS's row so /tentang isn't stuck in English under the id locale; a unit
 * the CMS adds later with no bundled match still falls back to whatever text
 * the CMS gives us. */
const LOCAL_TEXT = new Map(ABOUT.units.map((unit) => [unit.name, unit.text]));

function fromCms(row: CmsUnitRow, locale: Locale): UnitEntry {
  const linkHost = hostOf(row.url);
  const localText = LOCAL_TEXT.get(row.name);
  return {
    name: row.name,
    text: localText ? pick(localText, locale) : row.description ?? '',
    href: row.url && linkHost && !OWN_HOSTS.has(linkHost) ? row.url : undefined,
    logo: row.logo_url ?? LOCAL_LOGOS.get(row.name),
  };
}

const UNITS_PAGE_SIZE = 100;

export async function listUnits(locale: Locale = DEFAULT_LOCALE): Promise<UnitEntry[]> {
  if (cmsConfigured()) {
    const rows: CmsUnitRow[] = [];
    for (let page = 1; ; page++) {
      const result = await cmsList<CmsUnitRow>('/units', {
        tag: `units:${locale}`,
        params: { lang: locale, per_page: UNITS_PAGE_SIZE, page },
      });
      // null = module disabled for this tenant; fall through to about.json.
      if (!result) break;
      rows.push(...result.data);
      if (!result.meta || page >= result.meta.last_page) break;
    }
    if (rows.length) return rows.map((row) => fromCms(row, locale));
  }

  return ABOUT.units.map((unit) => ({
    name: unit.name,
    text: pick(unit.text, locale),
    href: unit.href,
    logo: UNIT_LOGOS[unit.logo],
  }));
}
