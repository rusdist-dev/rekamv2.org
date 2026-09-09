import type { Locale } from '@/i18n/config';

/* Page-level copy for /publication. Nearly all of this page's static chrome
 * was already written in English only (hero, achievement cards, buttons);
 * the one straggler is the Impact Report cover's image alt, which existed
 * only in Indonesian. That's the only string this file carries — the rest
 * of the page's data (achievements, PDF links) is not locale-dependent, and
 * the achievement list itself is a display placeholder, not CMS content, so
 * it's out of scope the same way an actual publication/document listing
 * would be. */

type PublicationContent = {
  impactReportCoverAlt: string;
};

const id: PublicationContent = {
  impactReportCoverAlt: 'Sampul Impact Report 2025 Rekam Nusantara Foundation',
};

const en: PublicationContent = {
  impactReportCoverAlt: 'Cover of the Rekam Nusantara Foundation 2025 Impact Report',
};

const CONTENT: Record<Locale, PublicationContent> = { id, en };

export function publicationContent(locale: Locale): PublicationContent {
  return CONTENT[locale];
}

export type { PublicationContent };
