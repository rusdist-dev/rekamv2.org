import type { Locale } from '@/i18n/config';

/* Page-level copy for /program/urban — see src/i18n/content/forest.ts for the
 * full explanation of the pattern shared by all three programme content
 * files. `programs.json` stays the source of non-textual data (icons,
 * numeric values, image refs); this file carries only the prose and labels.
 *
 * `en` is the existing English copy from programs.json, unchanged. `id` is a
 * new Indonesian translation. Brand/place names — "Program Urban &
 * Sustainability" (matches nav_items.urban, never translated) and the
 * distributor names in the "Products distributed to" group (EIGER Adventure
 * Land, Aqua Mekarsari, Cafe Aranya) — are kept identical across locales. */

type NumberGroupContent = {
  heading: string;
  when?: string;
  items: { label: string; chips?: string[] }[];
};

type UrbanContent = {
  metaDescription: string;
  hero: { eyebrow: string; title: string };
  overview: { body: [string, string, string]; artAlt: string };
  numbers: {
    title: string;
    lede: string;
    note: string;
    groups: NumberGroupContent[];
  };
  postsTitle: string;
};

const id: UrbanContent = {
  metaDescription: 'Ketika kota memberi ruang bagi yang hidup di dalamnya.',
  hero: {
    eyebrow: 'Program Urban & Sustainability',
    title: 'Yang disimpan kota, dan yang ditinggalkannya.',
  },
  overview: {
    body: [
      'Setiap rumah tangga di Bogor menghasilkan catatan rinci tentang dirinya sendiri setiap hari, dan meletakkannya di jalan begitu pagi tiba. Tak ada yang membacanya. Sampah rumah tangga di kota-kota Indonesia dikumpulkan tanpa dihitung, dipindahkan tanpa dipilah, dan ditimbun tanpa ada yang tahu apa isinya.',
      'Urban menangani persoalan lingkungan yang diciptakan sebuah kota di rumahnya sendiri. Kami memulai dari Bogor, bersama pemerintah kota, asosiasi warga, dan pelaku usaha lokal: membangun sistem pengelolaan sampah yang benar-benar akan digunakan warga.',
      'Satu kota, dengan sengaja. Persoalan sampah tidak selesai hanya dengan regulasi — ia diselesaikan jalan demi jalan, dan harus terbukti berhasil di satu tempat nyata sebelum bisa dipercaya di tempat lain.',
    ],
    artAlt: 'Ilustrasi ukir permukiman padat dengan latar gunung',
  },
  numbers: {
    title: 'Dalam angka',
    lede: 'Pengelolaan sampah plastik dan upcycling menuju ekonomi sirkular — capaian sepanjang tahun 2025.',
    note: 'Sumber: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'Pengelolaan sampah plastik & upcycling',
        when: '35 Unit Lingkungan',
        items: [
          { label: 'Total sampah terkumpul' },
          { label: 'Plastik terolah' },
          { label: 'Produk dihasilkan' },
        ],
      },
      {
        heading: 'Produk didistribusikan ke',
        items: [
          { label: 'EIGER Adventure Land' },
          { label: 'Aqua Mekarsari' },
          { label: 'Cafe Aranya' },
        ],
      },
      {
        heading: 'Capaian',
        items: [
          { label: 'Nilai produk upcycling' },
        ],
      },
    ],
  },
  postsTitle: 'Dari Urban',
};

const en: UrbanContent = {
  metaDescription: 'When a city makes room for those who live within it.',
  hero: {
    eyebrow: 'Program Urban & Sustainability',
    title: 'What a city keeps, and what it leaves behind.',
  },
  overview: {
    body: [
      'Every household in Bogor produces a detailed record of itself each day, and puts it out on the street by morning. Nobody reads it. Household waste in Indonesian cities is collected without being counted, moved without being sorted, and buried without anyone knowing what went in.',
      'Urban works on the environmental problems a city makes at home. We started in Bogor, with the city government, neighbourhood associations, and local businesses: building waste systems residents will actually use.',
      'One city, on purpose. Waste is not solved by regulation alone — it is solved street by street, and it has to work somewhere real before it can be honest anywhere else.',
    ],
    artAlt: 'Engraved illustration of a dense settlement with mountains in the background',
  },
  numbers: {
    title: 'By the numbers',
    lede: 'Plastic waste management and upcycling toward a circular economy — achievements throughout 2025.',
    note: 'Source: REKAM by the Numbers — Impact Highlights 2025.',
    groups: [
      {
        heading: 'Plastic waste management & upcycling',
        when: '35 Neighborhood units',
        items: [
          { label: 'Total waste collected' },
          { label: 'Plastic processed' },
          { label: 'Product produced' },
        ],
      },
      {
        heading: 'Products distributed to',
        items: [
          { label: 'EIGER Adventure Land' },
          { label: 'Aqua Mekarsari' },
          { label: 'Cafe Aranya' },
        ],
      },
      {
        heading: 'Achievements',
        items: [
          { label: 'Upcycled products value' },
        ],
      },
    ],
  },
  postsTitle: 'From Urban',
};

const CONTENT: Record<Locale, UrbanContent> = { id, en };

export function urbanContent(locale: Locale): UrbanContent {
  return CONTENT[locale];
}

export type { UrbanContent, NumberGroupContent };
