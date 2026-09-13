import type { Locale } from '@/i18n/config';

/* Page-level copy for /publication. Nearly all of this page's static chrome
 * was already written in English only (hero, achievement cards, buttons);
 * the one straggler is the cover image's alt text.
 *
 * It takes the document's title because the documents themselves now come
 * from the CMS — one fixed string could only ever have described the Impact
 * Report. /tentang's featured-publication band reads the same function, so
 * the two bands describe their cover identically. */

type PublicationContent = {
  coverAlt: (title: string) => string;
};

const id: PublicationContent = {
  coverAlt: (title) => `Sampul ${title}`,
};

const en: PublicationContent = {
  coverAlt: (title) => `${title} cover`,
};

const CONTENT: Record<Locale, PublicationContent> = { id, en };

export function publicationContent(locale: Locale): PublicationContent {
  return CONTENT[locale];
}

export type { PublicationContent };
