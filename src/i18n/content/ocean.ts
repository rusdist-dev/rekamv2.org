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
  overview: { body: string[]; artAlt: string };
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
      'Sebagai negara kepulauan, Indonesia memiliki hubungan yang sangat erat dengan laut. Laut menjadi sumber kehidupan, mata pencaharian, dan identitas bagi jutaan masyarakat pesisir. Namun, hingga saat ini banyak informasi mengenai keanekaragaman hayati laut, sumber daya perikanan, dan kehidupan masyarakat pesisir yang masih terbatas. Di tengah menurunnya stok ikan, meningkatnya tekanan terhadap ekosistem laut, dan berbagai tantangan yang dihadapi masyarakat pesisir, pengambilan keputusan sering kali belum didukung oleh data dan informasi yang memadai.',
      'Melalui Fisheries Resource Center of Indonesia (FRCI), Yayasan Rekam Nusantara menghasilkan pengetahuan dan bukti ilmiah yang diperlukan untuk mendukung pengelolaan laut yang lebih baik. Kami menghubungkan penelitian lapangan, pemantauan, serta inovasi dengan kebutuhan kebijakan dan praktik pengelolaan, sehingga keputusan yang diambil dapat lebih efektif, berkelanjutan, dan memberikan manfaat nyata bagi masyarakat maupun lingkungan.',
      'Program Kelautan REKAM Nusantara berfokus pada enam bidang utama: Ocean Accounts, Perikanan Berkelanjutan (Sustainable Fisheries), Konservasi Ekosistem, Konservasi Spesies, Blue Carbon, serta Riset dan Inovasi (Research and Innovation). Melalui bidang-bidang tersebut, kami berupaya memperkuat dasar ilmiah untuk pengelolaan sumber daya laut, melindungi keanekaragaman hayati, mendukung ketahanan masyarakat pesisir, serta mendorong terwujudnya laut yang sehat dan produktif bagi generasi sekarang dan mendatang.',
      'Kami percaya bahwa masa depan laut Indonesia bergantung pada data yang baik, ilmu pengetahuan yang kuat, dan kolaborasi yang efektif. Ketiga hal tersebut menjadi fondasi untuk mewujudkan laut yang sehat, perikanan yang berkelanjutan, dan masyarakat pesisir yang sejahtera.'
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
      'As an archipelagic nation, Indonesia shares a deep connection with the ocean. The ocean provides livelihoods, food security, and cultural identity for millions of people across the country. Yet much of Indonesia\'s marine biodiversity, fisheries resources, and coastal livelihoods remain insufficiently documented. As fish stocks decline, ecosystems face increasing pressure, and coastal communities confront growing challenges, critical decisions are often made without adequate data and evidence.',
      'Through the Fisheries Resource Center of Indonesia (FRCI), REKAM Nusantara Foundation generates the knowledge and evidence needed to support better ocean governance. We connect field research, monitoring, and innovation with policy and management needs, helping ensure that decisions are informed, effective, and beneficial for both people and nature.',
      'Our Ocean Program focuses on six key areas: Ocean Accounts, Sustainable Fisheries, Ecosystem Conservation, Species Conservation, Blue Carbon, and Research & Innovation. Through these interconnected areas, we strengthen the scientific foundation for managing marine resources, protecting biodiversity, supporting the resilience of coastal communities, and promoting healthy and productive oceans for present and future generations.',
      'We believe that the future of Indonesia\'s oceans depends on reliable data, strong science, and meaningful collaboration. By turning knowledge into action, we aim to help create healthy oceans, sustainable fisheries, and prosperous coastal communities for generations to come.'
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
