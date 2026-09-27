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
    eyebrow: 'Program Ocean',
    title: 'Kehidupan di bawah sana, dan kehidupan yang bergantung padanya.',
  },
  overview: {
    body: [
      'Wilayah laut Indonesia lebih luas daripada daratannya. Nyaris tak ada yang benar-benar terhitung dengan baik. Hasil tangkapannya sangat besar, namun para nelayanlah yang menerima bagian paling kecil darinya. Stok ikan kian menipis, habitat kian rusak, dan kebijakan yang seharusnya mengelola semua itu disusun dari perkiraan, asumsi, dan angka yang tak pernah diperiksa.',
      'Fisheries Resource Center of Indonesia (FRCI) adalah program laut kami, digagas oleh para ilmuwan dan penggerak yang berulang kali sampai pada kesimpulan yang sama: laut tidak sedang gagal karena kekurangan aturan, melainkan karena kekurangan data. FRCI membangun data itu — tangkapan, stok, habitat, penghidupan — dan menghadirkannya di depan para pengambil keputusan. Kami bekerja menuju dua hal yang harus hadir bersamaan: keberlanjutan, agar laut masih tersisa untuk ditangkap, dan keadilan, agar mereka yang menangkapnya tidak menjadi pihak terakhir yang menikmati manfaatnya.',
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
    eyebrow: 'Program Ocean',
    title: 'The life below, and the lives that depend on it.',
  },
  overview: {
    body: [
      'Indonesia has more sea than land. Almost none of it is properly counted. The catch is enormous and the fishers see the least of it. Stocks are thinning, habitats are breaking down, and the policies meant to manage all of it are written from estimates, assumptions, and numbers nobody checked.',
      'Fisheries Resource Center of Indonesia (FRCI) is our ocean program, started by scientists and organisers who kept arriving at the same conclusion: the sea is not failing because it is unregulated, but because it is undocumented. FRCI builds the data — catch, stock, habitat, livelihood — and puts it in front of the people who decide. We work toward two things that have to arrive together: sustainability, so there is a sea left to fish, and justice, so the people who fish it are not the last to benefit from it.',
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
  postsTitle: 'From Ocean',
};

const CONTENT: Record<Locale, OceanContent> = { id, en };

export function oceanContent(locale: Locale): OceanContent {
  return CONTENT[locale];
}

export type { OceanContent, NumberGroupContent };
