import type { Locale } from '@/i18n/config';

/* Page-level copy for /checkout. Chrome-wide strings (nav, footer, "read
 * more") stay in `dictionary.ts`; this is the body content specific to this
 * one page, following that file's own convention (a `Content` type, an `id`
 * and `en` object, a `checkoutContent(locale)` getter — see
 * src/i18n/content/initiative.ts for the reference implementation).
 *
 * Product names, option labels (e.g. size/colour) and brand names come from
 * src/data/products.json and stay as-is in every locale — they are catalogue
 * data, not UI copy, and that file is shared with /merch. The shipping
 * option labels/notes and the "not yet configured" field names originate in
 * src/lib/shop/config.ts (also shared, and also catalogue-ish sample data);
 * `shippingById` and `missingFieldLabel` below translate them for display
 * without touching that shared file. Currency formatting/amounts are
 * untouched everywhere, per rupiah() in config.ts. */

type CheckoutContent = {
  meta: { title: string; description: string };
  eyebrow: string;
  heading: string;
  steps: [string, string, string];
  loadingCart: string;
  emptyCart: {
    heading: string;
    message: string;
    cta: string;
  };
  order: {
    heading: string;
    qtyAriaLabel: (productName: string) => string;
    removeAriaLabel: (productName: string) => string;
  };
  buyer: {
    heading: string;
    fullName: { label: string };
    whatsapp: { label: string; hint: string };
    email: { label: string };
    shippingMethod: { label: string; freeSuffix: string };
    address: { label: string };
    city: { label: string };
    postcode: { label: string };
    notes: { label: string };
  };
  /** Shipping option labels/notes, keyed by the `id` from SHOP.shipping in config.ts. */
  shippingById: Record<string, { label: string; note: string }>;
  summary: {
    heading: string;
    subtotal: string;
    shipping: string;
    free: string;
    total: string;
    agreement: string;
    submit: string;
    missingPrefix: string;
    missingSuffix: string;
  };
  /** Translations for the identifier names returned by unsetFields() in config.ts. */
  missingFieldLabels: Record<string, string>;
  paymentNotice: {
    heading: string;
    body: string;
    /** Rendered as: `{totalPrefix} <b>{rupiah amount}</b>{totalSuffix(count, shippingLabel)}` */
    totalPrefix: string;
    totalSuffix: (count: number, shippingLabel: string) => string;
    contactCta: string;
  };
};

const id: CheckoutContent = {
  meta: {
    title: 'Checkout',
    description: 'Selesaikan pesanan merchandise REKAM Nusantara.',
  },
  eyebrow: 'Checkout',
  heading: 'Selesaikan pesanan',
  steps: ['Pesanan', 'Data pembeli', 'Pembayaran'],
  loadingCart: 'Memuat keranjang…',
  emptyCart: {
    heading: 'Keranjang masih kosong',
    message: 'Pilih dulu produk yang ingin Anda dukung, lalu kembali ke halaman ini.',
    cta: 'Lihat katalog',
  },
  order: {
    heading: 'Pesanan',
    qtyAriaLabel: (productName) => `Jumlah ${productName}`,
    removeAriaLabel: (productName) => `Hapus ${productName}`,
  },
  buyer: {
    heading: 'Data pembeli',
    fullName: { label: 'Nama lengkap' },
    whatsapp: { label: 'WhatsApp', hint: 'Contoh: 0812xxxxxxx' },
    email: { label: 'Email' },
    shippingMethod: { label: 'Pengiriman', freeSuffix: 'gratis' },
    address: { label: 'Alamat' },
    city: { label: 'Kota' },
    postcode: { label: 'Kode pos' },
    notes: { label: 'Catatan (opsional)' },
  },
  shippingById: {
    pickup: { label: 'Ambil di kantor REKAM (Bogor)', note: 'dengan perjanjian' },
    jabo: { label: 'Jabodetabek', note: '1–2 hari kerja' },
    jawa: { label: 'Pulau Jawa', note: '2–4 hari kerja' },
    luar: { label: 'Luar Pulau Jawa', note: '3–7 hari kerja' },
  },
  summary: {
    heading: 'Ringkasan',
    subtotal: 'Subtotal',
    shipping: 'Pengiriman',
    free: 'Gratis',
    total: 'Total',
    agreement: 'Saya mengerti pesanan ini dikonfirmasi manual oleh tim REKAM.',
    submit: 'Buat pesanan',
    missingPrefix: 'Belum diisi',
    missingSuffix: 'Sampai itu terisi, pesanan tidak dapat diproses otomatis.',
  },
  missingFieldLabels: {
    'nomor rekening bank': 'nomor rekening bank',
    'gambar QRIS': 'gambar QRIS',
    'nomor WhatsApp': 'nomor WhatsApp',
    'alamat email': 'alamat email',
  },
  paymentNotice: {
    heading: 'Pembayaran belum tersambung',
    body: 'Katalog ini contoh dan kanal pembayarannya sengaja dibiarkan kosong. Sebuah halaman tidak boleh menjadi yang memutuskan pembayaran berhasil — itu perlu server yang memverifikasi, dan itu di luar lingkup pekerjaan ini. Hubungi tim REKAM untuk memesan.',
    totalPrefix: 'Total pesanan Anda:',
    totalSuffix: (count, shippingLabel) => ` (${count} item, ${shippingLabel}).`,
    contactCta: 'Hubungi kami',
  },
};

const en: CheckoutContent = {
  meta: {
    title: 'Checkout',
    description: 'Complete your REKAM Nusantara merchandise order.',
  },
  eyebrow: 'Checkout',
  heading: 'Complete your order',
  steps: ['Order', 'Buyer details', 'Payment'],
  loadingCart: 'Loading your cart…',
  emptyCart: {
    heading: 'Your cart is still empty',
    message: 'Pick a product you’d like to support first, then come back to this page.',
    cta: 'View catalogue',
  },
  order: {
    heading: 'Order',
    qtyAriaLabel: (productName) => `Quantity for ${productName}`,
    removeAriaLabel: (productName) => `Remove ${productName}`,
  },
  buyer: {
    heading: 'Buyer details',
    fullName: { label: 'Full name' },
    whatsapp: { label: 'WhatsApp', hint: 'Example: 0812xxxxxxx' },
    email: { label: 'Email' },
    shippingMethod: { label: 'Shipping', freeSuffix: 'free' },
    address: { label: 'Address' },
    city: { label: 'City' },
    postcode: { label: 'Postcode' },
    notes: { label: 'Notes (optional)' },
  },
  shippingById: {
    pickup: { label: 'Pick up at REKAM’s office (Bogor)', note: 'by appointment' },
    jabo: { label: 'Jabodetabek', note: '1–2 business days' },
    jawa: { label: 'Java', note: '2–4 business days' },
    luar: { label: 'Outside Java', note: '3–7 business days' },
  },
  summary: {
    heading: 'Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    agreement: 'I understand this order is confirmed manually by the REKAM team.',
    submit: 'Place order',
    missingPrefix: 'Not yet set',
    missingSuffix: 'Until those are filled in, orders cannot be processed automatically.',
  },
  missingFieldLabels: {
    'nomor rekening bank': 'bank account number',
    'gambar QRIS': 'QRIS image',
    'nomor WhatsApp': 'WhatsApp number',
    'alamat email': 'email address',
  },
  paymentNotice: {
    heading: 'Payment is not yet connected',
    body: 'This catalogue is a sample, and its payment channels have been deliberately left empty. A static page must never be what decides a payment has succeeded — that requires a server to verify it, and that is outside the scope of this build. Contact the REKAM team to place an order.',
    totalPrefix: 'Your order total:',
    totalSuffix: (count, shippingLabel) => ` (${count} item${count === 1 ? '' : 's'}, ${shippingLabel}).`,
    contactCta: 'Contact us',
  },
};

const CONTENT: Record<Locale, CheckoutContent> = { id, en };

export function checkoutContent(locale: Locale): CheckoutContent {
  return CONTENT[locale];
}

export type { CheckoutContent };
