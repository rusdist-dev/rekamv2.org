import type { Locale } from '@/i18n/config';

/* Page-level copy for /program/ocean — see src/i18n/content/forest.ts for the
 * full explanation of the pattern shared by all three programme content
 * files. `programs.json` stays the source of non-textual data (icons,
 * numeric values, image refs, and the date-range "when" pills, which read the
 * same in either locale); this file carries only the prose and labels.
 *
 * `en` is the existing English copy from programs.json, unchanged. `id` is a
 * new Indonesian translation. A few established REKAM/FRCI terms are kept
 * identical across locales because they are proper/programme names rather
 * than language-dependent copy: "Program Ocean" (matches nav_items.ocean),
 * "Fisheries Resource Center of Indonesia (FRCI)", "Ocean Accounts" (used
 * untranslated elsewhere on the site, e.g. the "Mgr. for Ocean Accounts" role
 * in about.json), and "IKAN" (REKAM's data-collection system, an acronym
 * rather than the Indonesian word for fish). "Liukang Tangaya" is a place
 * name; "Central Java" is translated to its standard Indonesian form, Jawa
 * Tengah. */

type NumberGroupContent = {
  heading: string;
  when?: string;
  items: { label: string; chips?: string[] }[];
};

type OceanContent = {
  metaDescription: string;
  hero: { eyebrow: string; title: string };
  overview: { body: [string, string]; artAlt: string };
  numbers: {
    title: string;
    lede: string;
    note: string;
    groups: NumberGroupContent[];
  };
  postsTitle: string;
};

const id: OceanContent = {
  metaDescription: 'Menghitung apa yang diberikan laut, dan kepada siapa ia memberikannya.',
  hero: {
    eyebrow: 'Ocean',
    title: 'Kehidupan di bawah sana, dan kehidupan yang bergantung padanya.',
  },
  overview: {
    body: [
      'Indonesia adalah negara kepulauan yang dibentuk oleh laut, tetapi sebagian besar kehidupan lautnya, perikanannya, dan mata pencaharian pesisirnya masih belum terdokumentasi dengan baik. Ketika stok ikan menurun dan habitat menghadapi tekanan yang kian besar, keputusan terlalu sering diambil tanpa data yang andal.',
      'Melalui Fisheries Resource Center of Indonesia (FRCI), Rekam Nusantara mengubah riset lapangan menjadi bukti untuk keputusan yang lebih baik. Kami mendokumentasikan perikanan, ekosistem laut, dan mata pencaharian pesisir demi mewujudkan dua tujuan: laut yang sehat yang menopang kehidupan, dan perikanan yang lebih adil yang menopang masyarakat yang bergantung padanya.',
    ],
    artAlt: 'Ilustrasi ukir gerombolan ikan di laut',
  },
  numbers: {
    title: 'Dalam angka',
    lede: 'Kawasan konservasi laut, pemberdayaan masyarakat, dan produksi pengetahuan — capaian kumulatif 2022–2026.',
    note: 'Sumber: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'Capaian kumulatif',
        items: [
          { label: 'Percontohan Ocean Accounts' },
          { label: 'Kawasan Konservasi Perairan' },
          { label: 'Pengelolaan Berbasis Kawasan' },
          { label: 'Wilayah Pengelolaan Perikanan (WPP)' },
          { label: 'Kelompok masyarakat' },
          { label: 'Enumerator lapangan' },
          { label: 'Publikasi jurnal' },
          { label: 'Produk pengetahuan' },
          { label: 'Buku' },
          { label: 'Publikasi kebijakan' },
          { label: 'Penerima beasiswa' },
          { label: 'Peserta magang' },
          { label: 'Relawan' },
          { label: 'Luas area rehabilitasi mangrove' },
          { label: 'Luas area rehabilitasi lamun' },
          { label: 'Data panjang ikan' },
        ],
      },
    ],
  },
  postsTitle: 'Dari Ocean',
};

const en: OceanContent = {
  metaDescription: 'Counting what the sea gives, and to whom it gives it.',
  hero: {
    eyebrow: 'Ocean',
    title: 'The Life Beneath. The Lives It Sustains.',
  },
  overview: {
    body: [
      'Indonesia is an archipelago shaped by the sea, yet much of its marine life, fisheries, and coastal livelihoods remain poorly documented. As fish stocks decline and habitats face growing pressure, decisions are too often made without reliable data.',
      'Through the Fisheries Resource Center of Indonesia (FRCI), Rekam Nusantara turns field research into evidence for better decisions. We document fisheries, marine ecosystems, and coastal livelihoods to advance two goals: healthy seas that sustain life, and fairer fisheries that sustain the people who depend on them.',
    ],
    artAlt: 'Engraved illustration of a school of fish in the sea',
  },
  numbers: {
    title: 'By the numbers',
    lede: 'Marine conservation areas, community empowerment, and knowledge production — cumulative achievements, 2022–2026.',
    note: 'Source: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'Cumulative highlights',
        items: [
          { label: 'Ocean Accounts Pilot' },
          { label: 'Marine Protected Area' },
          { label: 'Area-Based Management' },
          { label: 'Fisheries Management Areas (FMAs)' },
          { label: 'Community Groups' },
          { label: 'Field Enumerators' },
          { label: 'Journal Publications' },
          { label: 'Knowledge Production' },
          { label: 'Books' },
          { label: 'Policy Publications' },
          { label: 'Scholarship Awardees' },
          { label: 'Student Internships' },
          { label: 'Volunteers' },
          { label: 'Mangrove Rehabilitation Area' },
          { label: 'Seagrass Rehabilitation Area' },
          { label: 'Fish Length Data' },
        ],
      },
    ],
  },
  postsTitle: 'From the Sea',
};

const CONTENT: Record<Locale, OceanContent> = { id, en };

export function oceanContent(locale: Locale): OceanContent {
  return CONTENT[locale];
}

export type { OceanContent, NumberGroupContent };
