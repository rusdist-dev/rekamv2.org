import type { StaticImageData } from 'next/image';
import impactReportCover from '@/assets/banner/impact-report.png';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { ourStoryContent } from '@/i18n/content/our-story';
import { cmsConfigured, cmsList } from '@/lib/cms/client';

/* Publications, wired to the CMS's `publications` module (docs/api-public.md)
 * on the same terms as units.ts and partners.ts: live data when BASE_URL_CMS
 * and X_API_KEY are set, otherwise the one document that was hard-coded into
 * both pages before this — so a dev machine without keys still shows the same
 * Impact Report it always did.
 *
 * Confirmed against a live /api/v1/publications response (2026-09-13): a row
 * carries exactly id, title, description, category, file_url, file_name,
 * file_size, cover_url, is_featured. Note what is NOT there: any kind of date.
 * Both pages used to print a hard-coded "29 July 2026" next to the category,
 * and there is nothing in the API to keep that honest, so the line now carries
 * the category and the file size instead.
 */

/* Served from public/, not imported as a module — Next has no bundler loader
   for arbitrary binary files like a 9MB PDF, only for the image formats
   next/image knows. A plain absolute path also sidesteps AppLink/ButtonLink:
   both prefix "/"-rooted hrefs with the current locale for routed pages,
   which would turn this into "/en/assets/..." and 404 on a file public/
   serves unprefixed.

   Now only the offline fallback below — the live document comes from the CMS. */
export const IMPACT_REPORT_PDF = '/assets/publication/impact_rekam2025.pdf';

type CmsPublicationRow = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  cover_url: string | null;
  is_featured: boolean;
};

export type Publication = {
  id: string;
  title: string;
  description: string;
  /** Free-form taxonomy from the CMS, e.g. "report". */
  category?: string;
  cover?: StaticImageData | string;
  /** Opened inline — the dialog's iframe and "buka di tab baru". */
  viewUrl: string;
  /** Always same-origin, so `download` is actually honoured. See
   *  src/app/api/publication/download/route.ts. */
  downloadUrl: string;
  /** Already formatted, e.g. "9.4 MB". Absent when the CMS reported no size. */
  size?: string;
  featured: boolean;
};

function formatSize(bytes: number | null): string | undefined {
  if (!bytes || bytes <= 0) return undefined;
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/* The browser ignores the `download` attribute on a cross-origin href, and the
 * CMS serves its media without Content-Disposition, so a direct link to
 * file_url turns "Unduh" into "open the PDF in this tab". Routing the download
 * through our own origin is what keeps the button doing what it says. */
function downloadUrlFor(fileUrl: string, fileName: string | null): string {
  const params = new URLSearchParams({ url: fileUrl });
  if (fileName) params.set('name', fileName);
  return `/api/publication/download?${params}`;
}

function fromCms(row: CmsPublicationRow): Publication | undefined {
  // A publication with no file is not a publication — both pages are built
  // entirely around downloading or reading the document.
  if (!row.file_url) return undefined;

  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? undefined,
    cover: row.cover_url ?? undefined,
    viewUrl: row.file_url,
    downloadUrl: downloadUrlFor(row.file_url, row.file_name),
    size: formatSize(row.file_size),
    featured: row.is_featured,
  };
}

const PUBLICATIONS_PAGE_SIZE = 100;

export async function listPublications(locale: Locale = DEFAULT_LOCALE): Promise<Publication[]> {
  if (cmsConfigured()) {
    const rows: CmsPublicationRow[] = [];
    for (let page = 1; ; page++) {
      const result = await cmsList<CmsPublicationRow>('/publications', {
        tag: `publications:${locale}`,
        params: { lang: locale, per_page: PUBLICATIONS_PAGE_SIZE, page },
      });
      // null = module disabled for this tenant; fall through to the bundled one.
      if (!result) break;
      rows.push(...result.data);
      if (!result.meta || page >= result.meta.last_page) break;
    }

    const entries = rows.map(fromCms).filter((p): p is Publication => p !== undefined);
    if (entries.length) return entries;
  }

  const copy = ourStoryContent(locale).impactReport;
  return [
    {
      id: 'impact-report-2025',
      title: copy.heading,
      description: copy.paragraph,
      category: copy.dateLabel,
      cover: impactReportCover,
      viewUrl: IMPACT_REPORT_PDF,
      downloadUrl: IMPACT_REPORT_PDF,
      featured: true,
    },
  ];
}

/** The one document both /publication and /tentang lead with. */
export async function featuredPublication(locale: Locale = DEFAULT_LOCALE): Promise<Publication | undefined> {
  const all = await listPublications(locale);
  return all.find((p) => p.featured) ?? all[0];
}
