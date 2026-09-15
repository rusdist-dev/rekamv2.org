import type { Locale } from '@/i18n/config';

/* Page-level copy for /initiative (Bangga Papua). Chrome-wide strings (nav,
 * footer, "read more") stay in `dictionary.ts`; this is the body content that
 * is specific to this one page, split out per src/i18n/dictionary.ts's own
 * convention (a `Content` type, an `id` and `en` object, a `content(locale)`
 * getter).
 *
 * The three HIGHLIGHTS captions are left identical across locales on
 * purpose — there is no matching article to translate them against yet (see
 * the HIGHLIGHTS comment in page.tsx). Real people's names and the YouTube
 * video titles in GalleryFilm are also left unchanged across locales — they
 * are proper names, not language-dependent copy. "Bangga Papua" is translated
 * to "Papua Pride" in English — matching the existing news article slug
 * "bangga-papua-..." whose English title is "Papua Pride: ..." (see
 * src/data/news.json) — in hero.title and about.heading, same as "Back to
 * the Roots" alongside it (also true of the same pairing on /program/forest
 * — see forest.ts). metaDescription and hero.alt keep the Indonesian name
 * since they're descriptive copy about the initiative, not the title itself.
 *
 * currentActivity IS translated despite page.tsx's note that its English
 * copy reads like it strayed in from the Ocean programme rather than Bangga
 * Papua — that is a content accuracy question for whoever owns the copy, not
 * a reason to leave an entire section unreadable in Indonesian. */

type InitiativeContent = {
  metaDescription: string;
  /** title: ["Bangga Papua"/"Papua Pride", "Back to the Roots"] — the hero
   * heading. Both words translate, same as about.heading's copy of it. */
  hero: { alt: string; lede: string; title: [string, string] };
  about: { eyebrow: string; heading: string; paragraphs: [string, string] };
  currentActivity: { eyebrow: string; items: [string, string, string, string] };
  documentation: { eyebrow: string; heading: string };
  /** Label under each hero stat figure (STATS in page.tsx). */
  stats: { participants: string };
  gallery: {
    label: string;
    back: string;
    next: string;
    play: (title: string) => string;
    watchOnYoutube: string;
    share: string;
    videoOf: (index: number, total: number) => string;
  };
};

const id: InitiativeContent = {
  metaDescription: 'Inisiatif Bangga Papua: kembali ke akar budaya dan hutan Papua bersama REKAM Nusantara.',
  hero: {
    alt: 'Warga Papua duduk memandang laut, mewakili semangat inisiatif Bangga Papua',
    lede: 'Diskusi dan pemutaran film tentang masa depan laut Indonesia, bersama generasi muda yang akan menjaganya.',
    title: ['Bangga Papua', 'Kembali ke Akar'],
  },
  about: {
    eyebrow: 'Tentang acara',
    heading: 'Bangga Papua: Kembali ke Akar',
    paragraphs: [
      'Laut Indonesia menyimpan data yang belum banyak dibaca publik: stok perikanan, kondisi terumbu, dan kawasan konservasi yang terus berubah. Cerita Laut Nusantara mengambil temuan-temuan itu dan mengembalikannya dalam bentuk yang bisa dinikmati — film, percakapan, dan lokakarya.',
      'Rangkaian ini dirancang untuk pelajar dan mahasiswa, komunitas pesisir, serta siapa pun yang ingin memahami mengapa neraca sumber daya laut penting bagi keputusan sehari-hari.',
    ],
  },
  currentActivity: {
    eyebrow: 'Kegiatan terkini',
    items: [
      'Komitmen ini tercermin dalam partisipasi Rekam Nusantara Foundation pada Simposium Terumbu Karang Internasional (ICRS) ke-16, yang diselenggarakan di Auckland, Selandia Baru, pada 19–24 Juli 2026. Simposium ini mempertemukan lebih dari 2.100 peserta dari 93 negara, menjadikannya salah satu forum ilmiah terkemuka dunia yang didedikasikan untuk penelitian dan konservasi terumbu karang.',
      'Mewakili REKAM, Manajer Program Ocean Accounts kami Annisya Rosdiana dan Koordinator Nasional Lailatul Rokhmah mempresentasikan penelitian Indonesia mengenai valuasi terumbu karang dan Ocean Accounts kepada komunitas ilmiah internasional.',
      'Dalam sesi mengenai pariwisata terumbu karang dan ketahanan keanekaragaman hayati, Lailatul Rokhmah memaparkan penelitian tentang nilai ekonomi jasa ekosistem terumbu karang di Kawasan Konservasi Perairan Gili Matra. Studi ini menunjukkan bahwa jasa-jasa tersebut tetap bertahan, bahkan meningkat nilai ekonominya, meski terjadi perubahan alami pada kondisi terumbu.',
      'Inisiatif Ocean Accounts Indonesia merupakan hasil kolaborasi erat antara Kementerian Kelautan dan Perikanan, Bappenas, Kementerian Keuangan, Badan Pusat Statistik (BPS), Badan Informasi Geospasial (BIG), dan Rekam Nusantara Foundation, dengan dukungan dari Global Ocean Accounts Partnership (GOAP).',
    ],
  },
  documentation: {
    eyebrow: 'Dokumentasi',
    heading: 'Dari kegiatan sebelumnya',
  },
  stats: { participants: 'Peserta' },
  gallery: {
    label: 'Galeri film',
    back: 'Kembali',
    next: 'Berikutnya',
    play: (title) => `Putar "${title}"`,
    watchOnYoutube: 'Tonton video ini di YouTube',
    share: 'Bagikan video ini',
    videoOf: (index, total) => `Video ke-${index} dari ${total}`,
  },
};

const en: InitiativeContent = {
  metaDescription: 'Bangga Papua: a return to Papua’s cultural and forest roots with REKAM Nusantara.',
  hero: {
    alt: 'A Papuan resident sitting and looking out at the sea, representing the spirit of the Bangga Papua initiative',
    lede: 'Discussions and film screenings on the future of Indonesia’s seas, with the young generation who will safeguard them.',
    title: ['Papua Pride', 'Back to the Roots'],
  },
  about: {
    eyebrow: 'About the event',
    heading: 'Papua Pride: Back to the roots',
    paragraphs: [
      'Indonesia’s seas hold data the public rarely gets to read: fish stocks, reef condition, and conservation areas that keep changing. Cerita Laut Nusantara takes those findings and returns them in a form people can actually engage with — film, conversation, and workshops.',
      'The series is designed for students, coastal communities, and anyone who wants to understand why an ocean resource balance sheet matters for everyday decisions.',
    ],
  },
  currentActivity: {
    eyebrow: 'Current activity',
    items: [
      "This commitment was reflected in Rekam Nusantara Foundation's participation in the 16th International Coral Reef Symposium (ICRS), held in Auckland, New Zealand, from 19 to 24 July 2026. The symposium brought together more than 2,100 participants from 93 countries, making it one of the world's leading scientific forums dedicated to coral reef research and conservation.",
      "Representing REKAM, our Ocean Accounts Program Manager Annisya Rosdiana and National Coordinator Lailatul Rokhmah presented Indonesia's research on coral reef valuation and Ocean Accounts to the international scientific community.",
      'During the session on reef tourism and biodiversity resilience, Lailatul Rokhmah presented research on the economic value of coral reef ecosystem services in the Gili Matra Marine Protected Area. The study demonstrated that these services continue to retain and even increase their economic value despite natural changes in reef conditions.',
      "Indonesia's Ocean Accounts initiative is the result of strong collaboration among the Ministry of Marine Affairs and Fisheries, Bappenas, the Ministry of Finance, Statistics Indonesia (BPS), the Geospatial Information Agency (BIG), and Rekam Nusantara Foundation, with support from the Global Ocean Accounts Partnership (GOAP).",
    ],
  },
  documentation: {
    eyebrow: 'Documentation',
    heading: 'From past activities',
  },
  stats: { participants: 'Participants' },
  gallery: {
    label: 'Gallery film',
    back: 'Back',
    next: 'Next',
    play: (title) => `Play "${title}"`,
    watchOnYoutube: 'Watch this video on YouTube',
    share: 'Share this video',
    videoOf: (index, total) => `Video ${index} of ${total}`,
  },
};

const CONTENT: Record<Locale, InitiativeContent> = { id, en };

export function initiativeContent(locale: Locale): InitiativeContent {
  return CONTENT[locale];
}

export type { InitiativeContent };
