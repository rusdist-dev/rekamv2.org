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
    title: 'Yang masih berdiri, dan yang belum punya nama.',
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
        heading: 'Pengelolaan hutan adat',
        items: [
          { label: 'Tanda batas terpasang' },
          { label: 'Batas wilayah yang dipetakan' },
          { label: 'Komunitas yang terlibat' },
          { label: 'Anggota tim teknis yang terlibat' },
          { label: 'Peserta' },
          { label: 'Stasiun pemantauan keanekaragaman hayati' },
          { label: 'Hukum adat yang direvisi' },
          { label: 'Kelompok pemantau rangkong yang dipimpin perempuan' },
        ],
      },
      {
        heading: 'Pemantauan akustik pasif',
        items: [
          { label: 'Spesies burung terdokumentasi' },
          { label: 'Spesies kunci lainnya' },
        ],
      },
      {
        heading: 'Pengakuan hak masyarakat adat',
        items: [
          { label: 'Anggota yang terlibat' },
          { label: 'Peta zonasi kawasan' },
        ],
      },
      {
        heading: 'Pemantauan sarang & adopsi pohon',
        items: [
          { label: 'Sarang rangkong yang dipantau' },
          { label: 'Sarang aktif teridentifikasi' },
          { label: 'Pohon sarang yang diadopsi' },
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
        heading: 'Customary forest management',
        items: [
          { label: 'Boundary markers installed' },
          { label: 'Boundary delineated' },
          { label: 'Community involved' },
          { label: 'Technical team members involved' },
          { label: 'Participants' },
          { label: 'Biodiversity monitoring stations' },
          { label: 'Customary law revised' },
          { label: 'Women-led hornbill monitoring group' },
        ],
      },
      {
        heading: 'Passive acoustic monitoring',
        items: [
          { label: 'Bird species documented' },
          { label: 'Other key species' },
        ],
      },
      {
        heading: 'Recognition of indigenous community rights',
        items: [
          { label: 'Members involved' },
          { label: 'Sites zonation maps' },
        ],
      },
      {
        heading: 'Nest monitoring & tree adoption',
        items: [
          { label: 'Hornbill nests monitored' },
          { label: 'Active nests identified' },
          { label: 'Nest tree adopted' },
        ],
      },
    ],
  },
  postsTitle: 'From the Forest',
  storyBanner: { eyebrow: 'Papua Pride', title: 'Back to the roots', ctaLabel: 'Learn more' },
};

const CONTENT: Record<Locale, ForestContent> = { id, en };

export function forestContent(locale: Locale): ForestContent {
  return CONTENT[locale];
}

export type { ForestContent, NumberGroupContent };
