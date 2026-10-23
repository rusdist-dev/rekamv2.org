import type { Locale } from '@/i18n/config';

/* Page-level copy for /program/urban — see src/i18n/content/forest.ts for the
 * full explanation of the pattern shared by all three programme content
 * files. `programs.json` stays the source of non-textual data (icons,
 * numeric values, image refs); this file carries only the prose and labels.
 *
 * `en` is the existing English copy from programs.json, unchanged. `id` is a
 * new Indonesian translation. Brand/place names — "Program Urban &
 * Sustainability" (matches nav_items.urban, never translated) and the
 * distributor names in the "Outcome" group (EIGER Adventure Land, Aqua
 * Mekarsari, Cafe Aranya) — are kept identical across locales. */

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
    eyebrow: 'Urban',
    title: 'Yang disimpan kota, dan yang ditinggalkannya.',
  },
  overview: {
    body: [
      'Setiap hari, sebuah kota menunjukkan jati dirinya lewat apa yang dibuangnya. Namun, sebagian besar sampah rumah tangga di Indonesia dikumpulkan, dicampur, dan dibuang tanpa diukur maupun dipahami dengan baik.',
      'Program Urban Rekam Nusantara bekerja sama dengan Kota Bogor, komunitas lokal, dan pelaku usaha untuk membangun sistem pengelolaan sampah yang lebih baik, mengubah material buangan menjadi sumber daya, dan menjadikan gaya hidup sirkular bagian dari keseharian.',
      'Perubahan dimulai dari jalanan, satu lingkungan demi satu lingkungan. Kami memulainya di Bogor untuk membangun solusi yang berhasil di dunia nyata, dan dapat menginspirasi perubahan di tempat lain.',
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
        items: [
          { label: 'Total sampah terkumpul' },
          { label: 'Plastik terolah' },
          { label: 'Produk dihasilkan' },
          { label: 'Lingkungan' },
        ],
      },
      {
        heading: 'Hasil',
        items: [
          { label: 'EIGER Adventure Land' },
          { label: 'Aqua Mekarsari' },
          { label: 'Cafe Aranya' },
          { label: 'Nilai Produk' },
        ],
      },
    ],
  },
  postsTitle: 'Dari Urban',
};

const en: UrbanContent = {
  metaDescription: 'When a city makes room for those who live within it.',
  hero: {
    eyebrow: 'Urban',
    title: 'What Cities Keep. What They Leave Behind.',
  },
  overview: {
    body: [
      'Every day, a city reveals itself through what it throws away. Yet much of Indonesia’s household waste is collected, mixed, and discarded without being properly measured or understood.',
      'Rekam Nusantara’s Urban Program works with the city of Bogor, local communities, and businesses to build better waste systems, turn discarded materials into resources, and make circular living part of everyday life.',
      'Change begins on the streets, one neighbourhood at a time. We start in Bogor to build solutions that work in the real world — and can inspire change beyond it.',
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
        items: [
          { label: 'Total waste collected' },
          { label: 'Plastic processed' },
          { label: 'Product produced' },
          { label: 'Neighborhoods' },
        ],
      },
      {
        heading: 'Outcome',
        items: [
          { label: 'EIGER Adventure Land' },
          { label: 'Aqua Mekarsari' },
          { label: 'Cafe Aranya' },
          { label: 'Product Value' },
        ],
      },
    ],
  },
  postsTitle: 'From the City',
};

const CONTENT: Record<Locale, UrbanContent> = { id, en };

export function urbanContent(locale: Locale): UrbanContent {
  return CONTENT[locale];
}

export type { UrbanContent, NumberGroupContent };
