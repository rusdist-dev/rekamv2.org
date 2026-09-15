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
  impact: { heading: [string, string]; paragraph: [string, string] };
  featuredVideo: { eyebrow: string };
  instagram: { eyebrow: string; followCta: string; postAriaLabel: string };
  youtube: { channelCta: string; watchAriaLabel: (title: string) => string };
  gallery: { ariaLabel: string };
  closingQuote: string;
};

const id: HomeContent = {
  hero: {
    eyebrow: 'Apa yang kami lestarikan?',
    title: ['Mendokumentasikan pengetahuan', 'Menjaga kehidupan'],
  },
  lanskap: {
    eyebrow: 'Siapa kami',
    quote:
      'Mendokumentasikan Indonesia yang hidup: di hutan, di laut, di kota. Apa yang kami himpun menjadi konservasi yang bertahan lama.',
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
    forest: 'Memetakan yang masih berdiri, bersama masyarakat yang menjaganya.',
    urban: 'Tempat kota memberi ruang bagi kehidupan di dalamnya.',
    ocean: 'Menghitung apa yang diberikan laut, dan kepada siapa itu diberikan.',
  },
  stats: {
    forest: 'Hutan Adat yang Ditetapkan',
    urban: 'Total sampah terkumpul',
    ocean: 'Kawasan Konservasi Laut',
  },
  impact: {
    heading: ['Dampak', 'Kami'],
    paragraph: [
      'Kami menghitung karena keputusan dibuat berdasarkan hitungan. Setiap angka di bawah ini berasal dari seseorang yang berdiri di suatu tempat dan mencatatnya.',
      'Inilah catatan yang berlaku hari ini.',
    ],
  },
  featuredVideo: { eyebrow: 'Video Pilihan' },
  instagram: {
    eyebrow: 'Terkini',
    followCta: 'Ikuti kami',
    postAriaLabel: 'Buka postingan Instagram REKAM Nusantara',
  },
  youtube: {
    channelCta: 'Kunjungi channel',
    watchAriaLabel: (title) => `Tonton "${title}" di YouTube`,
  },
  gallery: { ariaLabel: 'Galeri kegiatan' },
  closingQuote:
    'Hutan mengingat, laut mengenang, dan setiap komunitas membawa cerita yang lebih tua dari kita semua. Sains membantu kita memahami, bertutur membantu kita peduli, teknologi membantu kita menjangkau, dan tradisi mengingatkan kita akan alasannya. Sebab pengetahuan yang tak terjaga adalah masa depan yang tak terwujud; dokumentasikan dengan tujuan hari ini, agar kehidupan dapat terus berlanjut.',
};

const en: HomeContent = {
  hero: {
    eyebrow: 'What we conserve?',
    title: ['Documenting knowledge', 'Preserving life'],
  },
  lanskap: {
    eyebrow: 'Who we are',
    quote:
      'Documenting living Indonesia: in forests, in seas, in cities. What we gather becomes conservation that lasts.',
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
    forest: 'Mapping what still stands, with the people who keep it standing.',
    urban: 'Where the city makes room for what lives in it.',
    ocean: 'Counting what the sea gives, and who it gives it to.',
  },
  stats: {
    forest: 'Customary Forest Established',
    urban: 'Total waste collected',
    ocean: 'Marine Protected Area',
  },
  impact: {
    heading: ['Our', 'Impact'],
    paragraph: [
      'We count because decisions are made from counts. Every number below came from someone standing in a place, writing it down.',
      'This is where the record stands today.',
    ],
  },
  featuredVideo: { eyebrow: 'Featured Video' },
  instagram: {
    eyebrow: 'Lately',
    followCta: 'Follow us',
    postAriaLabel: 'Open REKAM Nusantara’s Instagram post',
  },
  youtube: {
    channelCta: 'Visit channel',
    watchAriaLabel: (title) => `Watch "${title}" on YouTube`,
  },
  gallery: { ariaLabel: 'Activity gallery' },
  closingQuote:
    'The forest remembers, the ocean recalls, and every community carries stories older than us all. Science helps us understand, storytelling helps us care, technology helps us reach, and tradition reminds us why. For knowledge left unkept is a future undone; document with purpose today, so life may carry on.',
};

const CONTENT: Record<Locale, HomeContent> = { id, en };

export function homeContent(locale: Locale): HomeContent {
  return CONTENT[locale];
}

export type { HomeContent };
