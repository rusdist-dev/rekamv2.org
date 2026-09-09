import type { Locale } from '@/i18n/config';

/* Page-level copy for /donasi. Chrome-wide strings (nav, footer, "read more")
 * stay in `dictionary.ts`; this is the body content specific to this one
 * page, split out per that file's own convention (a `Content` type, an `id`
 * and `en` object, a `xContent(locale)` getter — see
 * src/i18n/content/initiative.ts for the reference implementation).
 *
 * Anchor ids (`adopsi`, `produk`, `form-donasi`), hrefs, the `current="donasi"`
 * SiteShell prop, and the #MerekamNusantara campaign tag are left unchanged
 * across locales — they are not language-dependent. */

type DonasiContent = {
  metaDescription: string;
  hero: { eyebrow: string; title: string; lede: string };
  adopsi: {
    eyebrow: string;
    title: string;
    lede: string;
    items: [string, string, string];
    cta: string;
    alt: string;
  };
  produk: {
    eyebrow: string;
    title: string;
    lede: string;
    items: [string, string, string];
    cta: string;
    alt: string;
  };
  closing: {
    eyebrow: string;
    title: string;
    lede: string;
    note: string;
    cta: string;
  };
};

const id: DonasiContent = {
  metaDescription:
    'Setiap kontribusi menopang riset, patroli, dan dokumentasi di lanskap yang kami dampingi.',
  hero: {
    eyebrow: 'Donasi',
    title: 'Dukung kami',
    lede: 'Setiap kontribusi menopang riset, patroli, dan dokumentasi di lanskap yang kami dampingi.',
  },
  adopsi: {
    eyebrow: 'Cara pertama',
    title: 'Adopsi Pohon Pakan',
    lede: 'Rangkong bergantung pada pohon berbuah tertentu sepanjang musim. Dengan mengadopsi satu pohon pakan, Anda membiayai penandaan, pemantauan berkala, dan perlindungannya bersama masyarakat adat di sekitar kawasan.',
    items: [
      'Penandaan dan pendataan pohon di lokasi',
      'Pemantauan berkala oleh tim patroli',
      'Laporan kondisi pohon untuk setiap pengadopsi',
    ],
    cta: 'Adopsi satu pohon',
    alt: 'Ilustrasi ukir lembah hutan dengan sungai berkelok',
  },
  produk: {
    eyebrow: 'Cara kedua',
    title: 'Fundraising Product',
    lede: 'Produk cetak dan merchandise bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi.',
    items: [
      'Cetak ilustrasi ukir seri Forest, Ocean, Urban',
      'Buku dan publikasi hasil riset',
      'Merchandise kampanye #MerekamNusantara',
    ],
    cta: 'Lihat katalog',
    alt: 'Ilustrasi ukir gerombolan ikan di laut',
  },
  closing: {
    eyebrow: 'Langkah berikutnya',
    title: 'Siap berdonasi?',
    lede: 'Kanal pembayaran belum tersambung ke halaman ini. Untuk sementara, hubungi kami lebih dulu dan tim akan memandu prosesnya.',
    note: 'Catatan teknis: sambungkan tombol di atas ke payment gateway atau halaman donasi resmi sebelum halaman ini dipublikasikan.',
    cta: 'Hubungi kami',
  },
};

const en: DonasiContent = {
  metaDescription:
    'Every contribution sustains research, patrols, and documentation across the landscapes we support.',
  hero: {
    eyebrow: 'Donate',
    title: 'Support us',
    lede: 'Every contribution sustains research, patrols, and documentation across the landscapes we support.',
  },
  adopsi: {
    eyebrow: 'First way',
    title: 'Adopt a Feeding Tree',
    lede: 'Hornbills depend on specific fruiting trees throughout the year. By adopting a feeding tree, you fund its tagging, regular monitoring, and protection alongside the indigenous communities living around the area.',
    items: [
      'Tagging and recording trees on site',
      'Regular monitoring by the patrol team',
      'A tree condition report for each adopter',
    ],
    cta: 'Adopt a tree',
    alt: 'Engraved illustration of a forest valley with a winding river',
  },
  produk: {
    eyebrow: 'Second way',
    title: 'Fundraising Products',
    lede: 'Printed items and merchandise celebrating the biodiversity of the Nusantara archipelago. All sales proceeds go directly into the conservation program fund.',
    items: [
      'Engraved illustration prints from the Forest, Ocean, and Urban series',
      'Books and publications from our research',
      'Merchandise from the #MerekamNusantara campaign',
    ],
    cta: 'View catalog',
    alt: 'Engraved illustration of a school of fish in the sea',
  },
  closing: {
    eyebrow: 'Next step',
    title: 'Ready to donate?',
    lede: 'The payment channel is not yet connected to this page. For now, please contact us first and our team will guide you through the process.',
    note: 'Technical note: connect the button above to a payment gateway or the official donation page before this page is published.',
    cta: 'Contact us',
  },
};

const CONTENT: Record<Locale, DonasiContent> = { id, en };

export function donasiContent(locale: Locale): DonasiContent {
  return CONTENT[locale];
}

export type { DonasiContent };
