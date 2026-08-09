/* One place for the facts every page's metadata needs.
 *
 * The old site had none of this: no canonical, no Open Graph, no Twitter card,
 * no favicon, no sitemap, no robots.txt — on all eleven pages. For a
 * foundation that depends on its work being shared, a link that previews as a
 * bare URL is a real cost, and it is the cheapest thing on the whole list to
 * fix. */

/** Set NEXT_PUBLIC_SITE_URL in the deploy environment. The fallback keeps
 *  local builds working and is never correct in production. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rekam.or.id';

export const SITE = {
  name: 'REKAM Nusantara Foundation',
  shortName: 'REKAM',
  tagline: 'Documenting knowledge, preserving life',
  description:
    'Dari puncak hutan hingga dasar laut, dari sungai kota hingga layar bioskop — REKAM bekerja di seluruh lanskap kehidupan Indonesia.',
  locale: 'id_ID',
  /* Brand green, used for the browser chrome on mobile. --green-800 rather
     than --green-900 for the same reason the footer moved: it is the darker,
     more legible half of the pair. */
  themeColor: '#00522c',
};
