import type { Locale } from '@/i18n/config';

/* Page-level copy for /merch. Chrome-wide strings (nav, footer, "read more")
 * stay in `dictionary.ts`; this is the body content — and the Shop UI copy —
 * that is specific to this one page, split out per src/i18n/content/
 * initiative.ts's own convention (a `Content` type, an `id` and `en` object,
 * a `content(locale)` getter).
 *
 * Left unchanged across locales on purpose:
 * - `title: 'Merchandise'` (page.tsx) and the PageHero `eyebrow="Fundraising
 *   Product"` — short brand/category labels, same pattern as the untranslated
 *   `eyebrow="Initiative"` on /initiative.
 * - `src/data/products.json` in full — product names, descriptions, category
 *   labels, and option labels/values. The page says outright that this is a
 *   dummy catalogue pending real pricing, shipping, and payment setup (see
 *   the notice strip); translating placeholder product copy now would just
 *   give the wrong catalogue two languages instead of one. Real product copy
 *   should get its own locale treatment once the catalogue is real.
 * - Cart line announcements in `src/lib/shop/cart.tsx` (the aria-live "added
 *   to cart" text) — that file is shared with /checkout, which is being
 *   localized separately; left as-is here to avoid stepping on that work.
 */

type MerchContent = {
  metaDescription: string;
  hero: { lede: string };
  /** The dummy-catalogue notice strip wraps a `<code>` snippet, so the
   *  sentence is split around it rather than kept as one string. */
  dummyNotice: { before: string; codeNote: string; after: string };
  catalogueSection: { eyebrow: string; heading: string; note: string };
  whereMoney: { eyebrow: string; heading: string; body: string; cta: string };
  why: { title: string; body: string }[];
  shop: {
    countOf: (shown: number, total: number) => string;
    qtyDecrease: string;
    qtyIncrease: string;
    qtyInput: string;
    qtyLabelFor: (name: string) => string;
    add: string;
    addAriaLabel: (name: string) => string;
    removeAriaLabel: (name: string) => string;
    cart: string;
    checkout: string;
  };
};

const id: MerchContent = {
  metaDescription:
    'Produk bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi.',
  hero: {
    lede: 'Produk bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi.',
  },
  dummyNotice: {
    before:
      'Katalog contoh — nama produk, harga, dan tarif kirim masih dummy, dan kanal pembayaran belum diisi. Lihat',
    codeNote: 'src/lib/shop/config.ts',
    after: 'sebelum dipublikasikan.',
  },
  catalogueSection: {
    eyebrow: 'Katalog',
    heading: 'Pilih dukunganmu',
    note: 'Harga sudah termasuk pajak. Pengiriman dari Bogor, 1–3 hari kerja setelah pembayaran terverifikasi.',
  },
  whereMoney: {
    eyebrow: 'Ke mana uangnya',
    heading: 'Margin masuk ke lapangan',
    body: 'Setelah biaya produksi dan kirim, sisa penjualan dialokasikan ke tiga program: patroli dan pemantauan pohon pakan, riset perikanan skala kecil, serta pendidikan lingkungan di sekolah.',
    cta: 'Cara dukungan lainnya',
  },
  why: [
    { title: 'Produksi lokal', body: 'Dikerjakan perajin dan penyablon di Bogor dan sekitarnya.' },
    { title: 'Bahan bertanggung jawab', body: 'Kanvas dan kertas bersertifikat daur ulang bila tersedia.' },
    { title: 'Kemasan minim plastik', body: 'Kertas kraft dan tali rami, tanpa bubble wrap.' },
    { title: 'Laporan terbuka', body: 'Rekap alokasi dana penjualan diterbitkan tiap semester.' },
  ],
  shop: {
    countOf: (shown, total) => `${shown} dari ${total} produk`,
    qtyDecrease: 'Kurangi jumlah',
    qtyIncrease: 'Tambah jumlah',
    qtyInput: 'Jumlah',
    qtyLabelFor: (name) => `Jumlah ${name}`,
    add: 'Tambah',
    addAriaLabel: (name) => `Tambah ${name} ke keranjang`,
    removeAriaLabel: (name) => `Hapus ${name}`,
    cart: 'Keranjang',
    checkout: 'Lanjut ke pembayaran',
  },
};

const en: MerchContent = {
  metaDescription:
    'Products themed around the biodiversity of the Indonesian archipelago. Every margin from sales goes back into conservation programmes.',
  hero: {
    lede: 'Products themed around the biodiversity of the Indonesian archipelago. Every margin from sales goes back into conservation programmes.',
  },
  dummyNotice: {
    before:
      'Sample catalogue — product names, prices, and shipping rates are still placeholders, and payment channels have not been set up. See',
    codeNote: 'src/lib/shop/config.ts',
    after: 'before publishing.',
  },
  catalogueSection: {
    eyebrow: 'Catalogue',
    heading: 'Choose your support',
    note: 'Prices already include tax. Shipped from Bogor, 1–3 business days after payment is verified.',
  },
  whereMoney: {
    eyebrow: 'Where the money goes',
    heading: 'Margins go straight to the field',
    body: 'After production and shipping costs, the remaining proceeds are allocated to three programmes: patrol and feeding-tree monitoring, small-scale fisheries research, and environmental education in schools.',
    cta: 'Other ways to support',
  },
  why: [
    { title: 'Local production', body: 'Made by artisans and screen printers in and around Bogor.' },
    { title: 'Responsible materials', body: 'Certified recycled canvas and paper wherever available.' },
    { title: 'Low-plastic packaging', body: 'Kraft paper and hemp twine, no bubble wrap.' },
    { title: 'Open reporting', body: 'A summary of sales fund allocation is published every semester.' },
  ],
  shop: {
    countOf: (shown, total) => `${shown} of ${total} products`,
    qtyDecrease: 'Decrease quantity',
    qtyIncrease: 'Increase quantity',
    qtyInput: 'Quantity',
    qtyLabelFor: (name) => `Quantity for ${name}`,
    add: 'Add',
    addAriaLabel: (name) => `Add ${name} to cart`,
    removeAriaLabel: (name) => `Remove ${name}`,
    cart: 'Cart',
    checkout: 'Proceed to checkout',
  },
};

const CONTENT: Record<Locale, MerchContent> = { id, en };

export function merchContent(locale: Locale): MerchContent {
  return CONTENT[locale];
}

export type { MerchContent };
