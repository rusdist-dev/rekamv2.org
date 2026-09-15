import type { Locale } from '@/i18n/config';

/* Page-level chrome copy for /berita (the archive) and /berita/[slug] (an
 * article). Both pages were explicitly excluded from the earlier bilingual
 * pass because news ARTICLE content (title, excerpt, body, cover alt,
 * category — everything read from getNews()/listNews()) comes from a CMS
 * and is out of scope for a code migration. This file covers only the
 * template chrome wrapped around that content: the archive's item count,
 * and the article page's breadcrumb, share label, "no full body yet"
 * notice, and related-posts rail.
 *
 * The shared "Be Part of the Story" CTA band both pages also render lives in
 * `dictionary.ts`'s `common.storyBand` instead — it is identical chrome
 * across five pages, not berita-specific.
 *
 * Indonesian is the original text throughout; English is a new, faithful
 * translation. */

type BeritaContent = {
  hero: { eyebrow: string; title: string; lede: string };
  list: {
    /** Eyebrow above the archive grid, below the featured lead. */
    eyebrow: string;
    count: (from: number, to: number, total: number) => string;
    pagination: { ariaLabel: string; prev: string; next: string };
  };
  detail: {
    breadcrumb: { ariaLabel: string; home: string; berita: string; article: string };
    share: string;
    noBody: string;
    related: { eyebrow: string; heading: string; viewAll: string };
  };
};

const id: BeritaContent = {
  hero: {
    eyebrow: 'Catatan lapangan',
    title: 'Catatan terbaru',
    lede: 'Catatan lapangan, publikasi, dan kabar acara dari seluruh program REKAM.',
  },
  list: {
    eyebrow: 'Kisah kami',
    count: (from, to, total) => (total === 0 ? 'Belum ada tulisan.' : `Menampilkan ${from}–${to} dari ${total} tulisan.`),
    pagination: { ariaLabel: 'Navigasi halaman', prev: 'Sebelumnya', next: 'Berikutnya' },
  },
  detail: {
    breadcrumb: {
      ariaLabel: 'Remah roti',
      home: 'Beranda',
      berita: 'Berita',
      article: 'Artikel',
    },
    share: 'Bagikan',
    noBody:
      'Naskah lengkap tulisan ini belum tersedia di situs. Isinya menyusul begitu arsip redaksi tersambung ke CMS.',
    related: {
      eyebrow: 'Baca juga',
      heading: 'Tulisan lain',
      viewAll: 'Lihat semua berita',
    },
  },
};

const en: BeritaContent = {
  hero: {
    eyebrow: 'Field notes',
    title: 'Latest noted',
    lede: 'Field notes, publications, and news events from all REKAM programs.',
  },
  list: {
    eyebrow: 'Our story',
    count: (from, to, total) => (total === 0 ? 'No articles yet.' : `Showing ${from}–${to} of ${total} articles.`),
    pagination: { ariaLabel: 'Page navigation', prev: 'Previous', next: 'Next' },
  },
  detail: {
    breadcrumb: {
      ariaLabel: 'Breadcrumb',
      home: 'Home',
      berita: 'Field Notes',
      article: 'Article',
    },
    share: 'Share',
    noBody:
      'The full text of this article is not yet available on the site. It will follow once the editorial archive connects to the CMS.',
    related: {
      eyebrow: 'Read also',
      heading: 'More stories',
      viewAll: 'See all news',
    },
  },
};

const CONTENT: Record<Locale, BeritaContent> = { id, en };

export function beritaContent(locale: Locale): BeritaContent {
  return CONTENT[locale];
}

export type { BeritaContent };
