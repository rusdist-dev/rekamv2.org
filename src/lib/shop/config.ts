/* Shop configuration — the one file to edit before this goes live.
 *
 * Ported from the old shop-config.js, including its central discipline: every
 * payment identifier starts null ON PURPOSE. A fundraising page that prints a
 * made-up account number is worse than one that prints none, because the
 * made-up one takes real money to the wrong place. While a field is null the
 * checkout says so out loud, so an unfinished setup cannot masquerade as a
 * working one.
 *
 * Payment is out of scope for this rewrite — the catalogue is a sample. These
 * stay null, and the checkout ends at a clearly-labelled handoff rather than
 * pretending to take money.
 */

export type Bank = { id: string; name: string; account: string | null; holder: string };
export type ShippingOption = { id: string; label: string; cost: number; note: string };

export const SHOP = {
  /* Bank transfer — manual reconciliation. Works with no gateway at all, which
     is why the source listed it first. */
  banks: [
    { id: 'bca', name: 'BCA', account: null, holder: 'Yayasan Rekam Nusantara' },
    { id: 'mandiri', name: 'Bank Mandiri', account: null, holder: 'Yayasan Rekam Nusantara' },
    { id: 'bni', name: 'BNI', account: null, holder: 'Yayasan Rekam Nusantara' },
  ] as Bank[],

  /* One QR for every e-wallet. `image` stays null until the real QRIS file from
     REKAM's acquirer is dropped in. Never hand-build this payload — the CRC at
     its tail is signed by the acquirer. */
  qris: {
    image: null as string | null,
    merchant: 'Yayasan Rekam Nusantara',
    /* Shown as "scan with" logos: informational, no per-wallet wiring. */
    wallets: ['DANA', 'GoPay', 'OVO', 'ShopeePay', 'LinkAja', 'm-banking'],
  },

  /* Where a finished order goes. Digits only, no + and no spaces. */
  whatsapp: null as string | null,
  email: null as string | null,

  /* Flat rates. Examples in the source — replace with the courier's own. */
  shipping: [
    { id: 'pickup', label: 'Ambil di kantor REKAM (Bogor)', cost: 0, note: 'dengan perjanjian' },
    { id: 'jabo', label: 'Jabodetabek', cost: 20000, note: '1–2 hari kerja' },
    { id: 'jawa', label: 'Pulau Jawa', cost: 28000, note: '2–4 hari kerja' },
    { id: 'luar', label: 'Luar Pulau Jawa', cost: 45000, note: '3–7 hari kerja' },
  ] as ShippingOption[],

  /** How long a payment instruction stays valid, in hours. */
  paymentWindowHours: 24,
};

/** Which required identifiers are still unset, for the honest notice. */
export function unsetFields(): string[] {
  const missing: string[] = [];
  if (SHOP.banks.every((b) => !b.account)) missing.push('nomor rekening bank');
  if (!SHOP.qris.image) missing.push('gambar QRIS');
  if (!SHOP.whatsapp) missing.push('nomor WhatsApp');
  if (!SHOP.email) missing.push('alamat email');
  return missing;
}

/** Rupiah has no minor unit in practice, so no decimals anywhere. */
export const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
