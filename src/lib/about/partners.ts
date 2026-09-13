import type { StaticImageData } from 'next/image';
import { PARTNER_LOGOS } from '@/assets/partners/logos';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { cmsConfigured, cmsList } from '@/lib/cms/client';

/* The partner wall on /tentang, wired to the CMS's `partners` module
 * (docs/api-public.md) on the same terms as units.ts: live data when
 * BASE_URL_CMS and X_API_KEY are set, otherwise the bundled marks in
 * src/assets/partners/logos.ts.
 *
 * Confirmed against a live /api/v1/partners response (2026-09-13): a row
 * carries exactly id, name, title, logo_url, url. 92 partners are published
 * against the 47 logos that were hand-imported here — that gap is the reason
 * this section is worth moving to the CMS at all.
 *
 * `url` is deliberately unused: two thirds of the rows point at
 * rekam.org/kolaborasi (this very section) rather than the partner's own
 * site, and the wall has never been a set of links.
 */

type CmsPartnerRow = {
  id: number;
  name: string;
  title: string | null;
  logo_url: string | null;
  url: string | null;
};

/** One mark as the wall renders it. `logo` is a bundled import in the
 *  fallback path, an absolute CMS URL otherwise. */
export type PartnerEntry = {
  name: string;
  logo: StaticImageData | string;
};

const PARTNERS_PAGE_SIZE = 100;

export async function listPartners(locale: Locale = DEFAULT_LOCALE): Promise<PartnerEntry[]> {
  if (cmsConfigured()) {
    const rows: CmsPartnerRow[] = [];
    for (let page = 1; ; page++) {
      const result = await cmsList<CmsPartnerRow>('/partners', {
        tag: `partners:${locale}`,
        params: { lang: locale, per_page: PARTNERS_PAGE_SIZE, page },
      });
      // null = module disabled for this tenant; fall through to the bundled set.
      if (!result) break;
      rows.push(...result.data);
      if (!result.meta || page >= result.meta.last_page) break;
    }

    /* A row is only worth a cell if it has a mark: the wall is logos, and a
     * partner with no logo_url would render as an empty 56px gap in the
     * grid. Every one of today's 92 rows has one. */
    const entries = rows
      .filter((row): row is CmsPartnerRow & { logo_url: string } => Boolean(row.logo_url))
      .map((row) => ({ name: row.name, logo: row.logo_url }));
    if (entries.length) return entries;
  }

  return PARTNER_LOGOS;
}
