import type { Locale } from '@/i18n/config';

/* Page-level copy for /program/forest, split out of src/data/programs.json
 * following the same convention as src/i18n/content/initiative.ts: a typed
 * `Content` shape, an `id` and `en` object, and a `forestContent(locale)`
 * getter. `programs.json` stays the source of non-textual data (icons,
 * numeric values, image refs); this file carries only the prose and labels
 * that actually change between locales — hero copy, overview paragraphs, the
 * "by the numbers" headings/labels, and the page's metaDescription.
 *
 * `en` is the existing English copy from programs.json, carried over
 * unchanged. `id` is a new, faithful Indonesian translation. A few terms are
 * kept identical across locales on purpose because they are proper/brand
 * names rather than language-dependent copy: "Program Forest" (matches
 * nav_items.forest, which is never translated) and business/place names that
 * appear as figure labels elsewhere on the site. */

type NumberGroupContent = {
  heading: string;
  when?: string;
  items: { label: string; chips?: string[] }[];
};

type ForestContent = {
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
  /* The "Bangga Papua" closing banner. "Bangga Papua" is translated to
   * "Papua Pride" in English — matching the existing news article slug
   * "bangga-papua-..." whose English title is "Papua Pride: ..." (see
   * src/data/news.json) — and so is "Back to the roots", here and in
   * initiative.ts's matching heading, same as any other UI copy. */
  storyBanner: { eyebrow: string; title: string; ctaLabel: string };
};

const id: ForestContent = {
  metaDescription: 'Memetakan apa yang masih berdiri, bersama orang-orang yang menjaganya tetap berdiri.',
  hero: {
    eyebrow: 'Forest',
    title: 'Memetakan yang tersisa, berdiri bersama mereka yang menjaganya',
  },
  overview: {
    body: [
      'Hutan tropis Indonesia menopang keanekaragaman hayati yang luar biasa, tetapi banyak spesies dan peran ekologisnya masih belum terdokumentasi. Ketika hutan menghadapi tekanan yang kian besar akibat eksploitasi jangka pendek, ilmu pengetahuan dan pengetahuan masyarakat adat menjadi kunci untuk memahami dan melindungi apa yang masih tersisa.',
      'Program Hutan Rekam Nusantara mendokumentasikan spesies yang kurang mendapat perhatian, menerapkan teknologi konservasi, memberdayakan peneliti muda, serta bekerja bersama masyarakat lokal dan masyarakat adat untuk mendukung konservasi hutan yang berkelanjutan.',
    ],
    artAlt: 'Ilustrasi ukir lembah hutan dengan sungai berkelok',
  },
  numbers: {
    title: 'Dalam angka',
    lede: 'Konservasi hutan adat berbasis masyarakat di Kalimantan Barat — capaian sepanjang tahun 2025.',
    note: 'Sumber: REKAM by the Numbers — Impact Highlights 2025. Nama-nama spesies burung dan satwa liar ditulis sebagaimana tercantum dalam dokumen aslinya.',
    groups: [
      {
        heading: 'Konservasi Rangkong',
        items: [
          { label: 'Patroli' },
          { label: 'Perjumpaan dengan rangkong di Kalimantan' },
          { label: 'Cakupan area kerja' },
          { label: 'Jam pengamatan' },
          { label: 'Hari pengamatan' },
          { label: 'Titik pemantauan' },
          { label: 'Masyarakat yang terlibat' },
          { label: 'Publikasi' },
          { label: 'Beasiswa mahasiswa' },
        ],
      },
      {
        heading: 'Pengelolaan Hutan Adat',
        items: [
          { label: 'Hutan adat' },
          { label: 'Usulan hutan adat' },
        ],
      },
      {
        heading: 'Pelatihan Bioekologi Rangkong',
        items: [
          { label: 'UPT KSDAE' },
          { label: 'Masyarakat terlibat' },
        ],
      },
      {
        heading: 'Keanekaragaman Hayati',
        items: [
          { label: 'Tipe habitat survei' },
          { label: 'Hutan yang disurvei' },
          { label: 'Masyarakat adat yang terlibat' },
          { label: 'Peneliti muda' },
          { label: 'Wilayah survei' },
          { label: 'Jam pengamatan' },
          { label: 'Spesies yang tercatat' },
        ],
      },
      {
        heading: 'Perekaman PAM (Bioacoustic)',
        items: [
          { label: 'Hari pemantauan' },
          { label: 'Rekaman' },
          { label: 'Burung teridentifikasi' },
        ],
      },
      {
        heading: 'Pemantauan Kamera Jebak',
        items: [
          { label: 'Hari pengamatan' },
          { label: 'Lokasi pengamatan' },
          { label: 'Jenis satwa liar terdokumentasi' },
        ],
      },
    ],
  },
  postsTitle: 'Dari Forest',
  storyBanner: { eyebrow: 'Bangga Papua', title: 'Kembali ke Akar', ctaLabel: 'Pelajari selengkapnya' },
};

const en: ForestContent = {
  metaDescription: 'Mapping what is still standing, together with the people keeping it that way.',
  hero: {
    eyebrow: 'Forest',
    title: 'Protecting What Remains. Discovering What Lies Beyond.',
  },
  overview: {
    body: [
      'Indonesia’s tropical forests sustain extraordinary biodiversity, yet many species and their ecological roles remain undocumented. As forests face growing pressure from short-term exploitation, science and Indigenous knowledge are essential to understanding and protecting what remains.',
      'Rekam Nusantara’s Forest Program documents overlooked species, applies conservation technology, empowers young researchers, and works alongside local and Indigenous communities to support lasting forest conservation.',
    ],
    artAlt: 'Engraved illustration of a forest valley with a winding river',
  },
  numbers: {
    title: 'By the numbers',
    lede: 'Community-based customary forest conservation in West Kalimantan — achievements throughout 2025.',
    note: 'Source: REKAM by the Numbers — Impact Highlights 2025. Bird and wildlife species names are written as they appear in the original document.',
    groups: [
      {
        heading: 'Hornbill Conservation',
        items: [
          { label: 'Patrol route' },
          { label: 'Hornbill encounters in Kalimantan' },
          { label: 'Working area coverage' },
          { label: 'Observation hours' },
          { label: 'Observation days' },
          { label: 'Monitoring points' },
          { label: 'Community members involved' },
          { label: 'Publications' },
          { label: 'Student scholarships' },
        ],
      },
      {
        heading: 'Customary Forest Management',
        items: [
          { label: 'Customary forest' },
          { label: 'Proposed customary forest' },
        ],
      },
      {
        heading: 'Hornbill Bioecology Training',
        items: [
          { label: 'KSDAE technical units' },
          { label: 'Community members involved' },
        ],
      },
      {
        heading: 'Biodiversity',
        items: [
          { label: 'Habitat types surveyed' },
          { label: 'Forest surveyed' },
          { label: 'Indigenous community members involved' },
          { label: 'Young researchers' },
          { label: 'Survey coverage' },
          { label: 'Observation hours' },
          { label: 'Species recorded' },
        ],
      },
      {
        heading: 'PAM Recording (Bioacoustic)',
        items: [
          { label: 'Monitoring days' },
          { label: 'Recordings' },
          { label: 'Birds identified' },
        ],
      },
      {
        heading: 'Camera Trap Monitoring',
        items: [
          { label: 'Observation days' },
          { label: 'Observation sites' },
          { label: 'Wildlife species documented' },
        ],
      },
    ],
  },
  postsTitle: 'From the Forest',
  storyBanner: { eyebrow: 'Papua Pride', title: 'Back to Our Roots', ctaLabel: 'Learn more' },
};

const CONTENT: Record<Locale, ForestContent> = { id, en };

export function forestContent(locale: Locale): ForestContent {
  return CONTENT[locale];
}

export type { ForestContent, NumberGroupContent };
