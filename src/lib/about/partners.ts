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
 * The endpoint takes a `category` query (2026-10-01). The wall is grouped by
 * it, one request per category in PARTNER_CATEGORIES order; the group names
 * themselves are never shown — only the gap between groups marks them.
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
  url?: string;
};

/** Display order of the groups on the wall. */
export const PARTNER_CATEGORIES = ['Pemerintahan', 'Universitas', 'Swasta', 'NGO', 'Donor'] as const;
export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export type PartnerGroup = {
  category: PartnerCategory | null;
  partners: PartnerEntry[];
};

const PARTNERS_PAGE_SIZE = 100;

async function listCategory(locale: Locale, category: PartnerCategory): Promise<PartnerEntry[] | null> {
  const rows: CmsPartnerRow[] = [];
  for (let page = 1; ; page++) {
    const result = await cmsList<CmsPartnerRow>('/partners', {
      tag: `partners:${locale}`,
      params: { lang: locale, category, per_page: PARTNERS_PAGE_SIZE, page },
    });
    // null = module disabled for this tenant.
    if (!result) return page === 1 ? null : rows.map(toEntry).filter(isEntry);
    rows.push(...result.data);
    if (!result.meta || page >= result.meta.last_page) break;
  }
  return rows.map(toEntry).filter(isEntry);
}

/* A row is only worth a cell if it has a mark: the wall is logos, and a
 * partner with no logo_url would render as an empty 56px gap in the grid. */
function toEntry(row: CmsPartnerRow): PartnerEntry | null {
  if (!row.logo_url) return null;
  return { name: row.name, logo: row.logo_url, url: row.url || undefined };
}

function isEntry(entry: PartnerEntry | null): entry is PartnerEntry {
  return entry !== null;
}

export async function listPartnerGroups(locale: Locale = DEFAULT_LOCALE): Promise<PartnerGroup[]> {
  if (cmsConfigured()) {
    const results = await Promise.all(PARTNER_CATEGORIES.map((category) => listCategory(locale, category)));
    const groups = PARTNER_CATEGORIES.map((category, i) => ({ category, partners: results[i] ?? [] })).filter(
      (group) => group.partners.length > 0,
    );
    if (groups.length) return groups;
  }

  // The bundled set carries no categories or links: one ungrouped wall.
  return [{ category: null, partners: PARTNER_LOGOS }];
}
