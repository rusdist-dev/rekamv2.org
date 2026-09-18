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
    lede: 'Kawasan konservasi laut, pemberdayaan masyarakat, dan produksi pengetahuan — capaian tahun 2025, dengan cakupan kumulatif sejak 2022.',
    note: 'Sumber: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'Pengumpulan data IKAN',
        items: [
          { label: 'Data trip penangkapan ikan' },
          { label: 'Data panjang ikan' },
        ],
      },
      {
        heading: 'Cakupan',
        items: [
          { label: 'Kawasan Konservasi Perairan' },
          { label: 'Pengelolaan Berbasis Kawasan' },
          { label: 'Wilayah Pengelolaan Perikanan' },
        ],
      },
      {
        heading: 'Publikasi',
        items: [
          { label: 'Jurnal' },
          { label: 'Ringkasan kebijakan' },
          { label: 'Produk pengetahuan' },
          { label: 'Buku' },
        ],
      },
      {
        heading: 'Orang yang terlibat',
        items: [
          { label: 'Kelompok masyarakat' },
          { label: 'Enumerator lapangan' },
          { label: 'Relawan' },
          { label: 'Penerima beasiswa' },
          { label: 'Peserta magang' },
        ],
      },
      {
        heading: 'Kelompok masyarakat pesisir',
        items: [
          { label: 'Jawa Tengah', chips: ['120 anggota', '15 pelatihan'] },
          { label: 'Liukang Tangaya', chips: ['107 anggota', '12 pelatihan'] },
        ],
      },
      {
        heading: 'Konservasi spesies – hiu & pari',
        items: [
          { label: 'Orang yang dilatih' },
          { label: 'Modul dan panduan' },
          { label: 'Sesi lokakarya' },
        ],
      },
      {
        heading: 'Ocean Accounts',
        items: [
          { label: 'Kegiatan peningkatan kesadaran' },
          { label: 'Produk pengetahuan' },
        ],
      },
      {
        heading: 'Rehabilitasi mangrove',
        items: [
          { label: 'Bibit ditanam' },
          { label: 'Luas area yang direhabilitasi' },
        ],
      },
      {
        heading: 'Rehabilitasi lamun',
        items: [
          { label: 'Bibit ditanam' },
          { label: 'Luas area yang direhabilitasi' },
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
    lede: 'Marine conservation areas, community empowerment, and knowledge production — 2025 achievements, with cumulative coverage since 2022.',
    note: 'Source: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'IKAN data collection',
        items: [
          { label: 'Fishing trip data' },
          { label: 'Fish length data' },
        ],
      },
      {
        heading: 'Coverage',
        items: [
          { label: 'Marine Protected Areas' },
          { label: 'Area-Based Management' },
          { label: 'Fisheries Management Areas' },
        ],
      },
      {
        heading: 'Publications',
        items: [
          { label: 'Journals' },
          { label: 'Policy briefs' },
          { label: 'Knowledge products' },
          { label: 'Books' },
        ],
      },
      {
        heading: 'People involved',
        items: [
          { label: 'Community groups' },
          { label: 'Field Enumerators' },
          { label: 'Volunteers' },
          { label: 'Scholarship fellows' },
          { label: 'Interns' },
        ],
      },
      {
        heading: 'Coastal community groups',
        items: [
          { label: 'Central Java', chips: ['120 members', '15 trainings'] },
          { label: 'Liukang Tangaya', chips: ['107 members', '12 trainings'] },
        ],
      },
      {
        heading: 'Species conservation – sharks & rays',
        items: [
          { label: 'People trained' },
          { label: 'Modules and guides' },
          { label: 'Workshop sessions' },
        ],
      },
      {
        heading: 'Ocean Accounts',
        items: [
          { label: 'Awareness-raising activities' },
          { label: 'Knowledge products' },
        ],
      },
      {
        heading: 'Mangrove rehabilitation',
        items: [
          { label: 'Seedlings planted' },
          { label: 'Area rehabilitated' },
        ],
      },
      {
        heading: 'Seagrass rehabilitation',
        items: [
          { label: 'Seedlings planted' },
          { label: 'Area rehabilitated' },
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
