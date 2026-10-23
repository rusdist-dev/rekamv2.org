import type { Locale } from '@/i18n/config';

/* Page-level copy for the home page (`src/app/[locale]/page.tsx`). Chrome-wide
 * strings (nav, footer, "read more") stay in `dictionary.ts`; the "Be Part of
 * the Story" band is shared verbatim across five pages and lives in
 * `dictionary.ts`'s `common.storyBand` for that reason, not here.
 *
 * The home page's copy was a mix on arrival: most of the body prose was
 * already written in English only (this file's `en` below reproduces that
 * original text unchanged), while a handful of UI strings — the card link,
 * the Instagram/YouTube buttons and aria-labels, the gallery aria-label, and
 * the three programme-card image alts — existed only in Indonesian (this
 * file's `id` below reproduces THAT original text unchanged). Only the
 * missing half of each pair was written new.
 *
 * Left untouched, on purpose: the HIGHLIGHTS/IG_TILES/YT_VIDEOS data, and the
 * "Forest / Urban / Ocean" section heading — proper names outside this
 * pass's scope. The CARDS array's `kicker`/`body` copy was English-only on
 * arrival; `cardKickers`/`cardBodies` below carry both languages now. */

type HomeContent = {
  hero: { eyebrow: string; title: [string, string] };
  lanskap: { eyebrow: string; quote: string };
  program: { eyebrow: string; cardCta: string };
  cardAlts: { forest: string; urban: string; ocean: string };
  cardKickers: { forest: string; urban: string; ocean: string };
  cardBodies: { forest: string; urban: string; ocean: string };
  stats: { forest: string; urban: string; ocean: string };
  /* Most figures are plain numbers in the page, punctuated per locale there;
     this covers the two parts that aren't: the scale word next to one of
     them, and Forest's figure, which is written out per language because the
     separators it uses are the ones the programme asked for, not the ones
     id/en punctuation rules would produce. */
  statScale: { million: string };
  statValues: { forest: string };
  impact: { heading: string[]; paragraph: [string, string] };
  featuredVideo: { eyebrow: string };
  instagram: { eyebrow: string; followCta: string; postAriaLabel: string };
  youtube: { channelCta: string; watchAriaLabel: (title: string) => string; watchOnYoutube: string };
  gallery: { ariaLabel: string };
  closingQuote: string[];
};

const id: HomeContent = {
  hero: {
    eyebrow: 'Apa yang kami lestarikan?',
    title: ['Mendokumentasikan pengetahuan', 'Menjaga kehidupan'],
  },
  lanskap: {
    eyebrow: 'Siapa kami',
    quote:
      'Merekam kehidupan Indonesia: di hutan, di laut, di kota. Setiap kisah menjadi alasan untuk menjaganya, hari ini dan selamanya.',
  },
  program: {
    eyebrow: 'Program kami',
    cardCta: 'Pelajari selengkapnya',
  },
  cardAlts: {
    forest: 'Ilustrasi sketsa lembah hutan dengan sungai berkelok',
    urban: 'Ilustrasi sketsa desa dan permukiman di lereng gunung',
    ocean: 'Ilustrasi sketsa terumbu karang dengan lumba-lumba, hiu, dan ikan',
  },
  cardKickers: {
    forest: 'Hutan',
    urban: 'Kota dan keberlanjutan',
    ocean: 'Laut',
  },
  cardBodies: {
    forest: 'Memetakan yang tersisa, berdiri bersama mereka yang menjaganya.',
    urban: 'Menata kota, memulihkan kehidupan.',
    ocean: 'Menghitung kekayaan yang diberikan laut, dan kehidupan yang ditopangnya.',
  },
  stats: {
    forest: 'Hutan Adat yang Ditetapkan',
    urban: 'Total sampah terkumpul',
    ocean: 'Kawasan Konservasi Laut',
  },
  statScale: { million: 'Juta' },
  statValues: { forest: '19,000' },
  impact: {
    heading: ['Dampak'],
    paragraph: [
      'Setiap angka menyimpan cerita. Setiap catatan membangun bukti.',
      'Bersama, keduanya menjadi pijakan untuk mengambil keputusan dan mengubah pengetahuan menjadi aksi konservasi yang berkelanjutan.',
    ],
  },
  featuredVideo: { eyebrow: 'Video Pilihan' },
  instagram: {
    eyebrow: 'Cerita Terkini',
    followCta: 'Ikuti kami',
    postAriaLabel: 'Buka postingan Instagram REKAM Nusantara',
  },
  youtube: {
    channelCta: 'Kunjungi channel',
    watchAriaLabel: (title) => `Tonton "${title}" di YouTube`,
    watchOnYoutube: 'Tonton di YouTube',
  },
  gallery: { ariaLabel: 'Galeri kegiatan' },
  closingQuote: [
    'Hutan menyimpan ingatannya, laut menyimpan kisahnya, dan setiap masyarakat mewarisi kearifan yang jauh lebih tua dari kita.',
    'Sains memperdalam pemahaman. Cerita menumbuhkan kepedulian. Teknologi memperluas jangkauan. Tradisi mengingatkan kita akan apa yang patut dijaga.',
    'Apa yang gagal kita rawat hari ini, bisa jadi hilang esok hari. Rekamlah dengan tujuan, agar kisah kehidupan terus lestari.',
  ],
};

const en: HomeContent = {
  hero: {
    eyebrow: 'What we conserve?',
    title: ['Documenting knowledge', 'Preserving life'],
  },
  lanskap: {
    eyebrow: 'Who we are',
    quote:
      'Documenting Indonesia’s living stories — where life grows, flows, and unfolds: in its forests, across its seas, and within its cities. Every story we gather plants a seed for conservation and a living future.',
  },
  program: {
    eyebrow: 'Our program',
    cardCta: 'Learn more',
  },
  cardAlts: {
    forest: 'Sketch illustration of a forest valley with a winding river',
    urban: 'Sketch illustration of a village and settlement on a mountainside',
    ocean: 'Sketch illustration of a coral reef with dolphins, sharks, and fish',
  },
  cardKickers: {
    forest: 'Forest',
    urban: 'Urban and sustainability',
    ocean: 'Ocean',
  },
  cardBodies: {
    forest:'Mapping what remains. Standing with those who protect it.',
    urban: 'Building a city that gives back.',
    ocean: 'Counting what the sea gives, sustaining the lives that depend on it.',
  },
  stats: {
    forest: 'Customary Forest Established',
    urban: 'Total waste collected',
    ocean: 'Marine Protected Area',
  },
  statScale: { million: 'Mio' },
  statValues: { forest: '19.000' },
  impact: {
    heading: ['Our', 'Impact'],
    paragraph: [
      'Every number tells a story. Every record builds evidence.',
      'Together, they help guide decisions and turn knowledge into lasting conservation.',
    ],
  },
  featuredVideo: { eyebrow: 'Featured Video' },
  instagram: {
    eyebrow: 'Latest Stories',
    followCta: 'Follow us',
    postAriaLabel: 'Open REKAM Nusantara’s Instagram post',
  },
  youtube: {
    channelCta: 'Visit channel',
    watchAriaLabel: (title) => `Watch "${title}" on YouTube`,
    watchOnYoutube: 'Watch on YouTube',
  },
  gallery: { ariaLabel: 'Activity gallery' },
  closingQuote: [
    'The forest holds its memories, the ocean its stories, and every community carries wisdom older than us.',
    'Science deepens our understanding. Storytelling awakens our care. Technology carries our reach further. Tradition reminds us what is worth protecting.',
    'For what we fail to preserve today, we may lose tomorrow. Document with purpose, so the stories of life may endure.',
  ],
};

const CONTENT: Record<Locale, HomeContent> = { id, en };

export function homeContent(locale: Locale): HomeContent {
  return CONTENT[locale];
}

export type { HomeContent };
