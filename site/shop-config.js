/* ==========================================================================
   Shop configuration — the one file to edit before this goes live
   ==========================================================================

   Every payment identifier below starts as null on purpose. A fundraising page
   that prints a made-up account number is worse than one that prints none: the
   made-up one takes real money to the wrong place. While a field is null the
   checkout shows it as "belum diisi" and says so out loud, so an unfinished
   setup can never masquerade as a working one.

   Fill in only what REKAM actually holds:

   - banks[].account   the account number, exactly as the bank prints it
   - qris.image        path to the QRIS image issued by REKAM's acquirer
                       (BI-licensed: Dana, GoPay, OVO, ShopeePay and every
                       m-banking app read the same code, so one file covers
                       all of them). Never hand-build this payload — the CRC
                       at its tail is signed by the acquirer.
   - whatsapp          order confirmations land here, digits only: 62812…
   - email             fallback for buyers who do not use WhatsApp

   Google Pay is deliberately absent from the methods list. It cannot work from
   a static page: it needs the Google Pay JS API plus a gateway that accepts the
   payment token server-side (Midtrans, Xendit, Stripe). See PAYMENT_ROADMAP in
   shop.js for what wiring it up involves.
   ========================================================================== */

window.REKAM_SHOP = {
  /* Bank transfer — manual reconciliation. Works today with no gateway, which
     is why it is listed first. */
  banks: [
    { id: 'bca',     name: 'BCA',          account: null, holder: 'Yayasan Rekam Nusantara' },
    { id: 'mandiri', name: 'Bank Mandiri', account: null, holder: 'Yayasan Rekam Nusantara' },
    { id: 'bni',     name: 'BNI',          account: null, holder: 'Yayasan Rekam Nusantara' },
  ],

  /* One QR for every e-wallet. `image` stays null until the real QRIS file
     from the acquirer is dropped into assets/. */
  qris: {
    image: null,
    merchant: 'Yayasan Rekam Nusantara',
    /* Shown as "scan with" logos — informational only, no per-wallet wiring. */
    wallets: ['DANA', 'GoPay', 'OVO', 'ShopeePay', 'LinkAja', 'm-banking'],
  },

  /* Where a finished order goes. Digits only, no + and no spaces. */
  whatsapp: null,
  email: null,

  /* Shipping options, priced flat. Rates are examples — replace with the
     courier's own before publishing. */
  shipping: [
    { id: 'pickup',  label: 'Ambil di kantor REKAM (Bogor)', cost: 0,      note: 'dengan perjanjian' },
    { id: 'jabo',    label: 'Jabodetabek',                    cost: 20000,  note: '1–2 hari kerja' },
    { id: 'jawa',    label: 'Pulau Jawa',                     cost: 28000,  note: '2–4 hari kerja' },
    { id: 'luar',    label: 'Luar Pulau Jawa',                cost: 45000,  note: '3–7 hari kerja' },
  ],

  /* How long a payment instruction stays valid, in hours. */
  paymentWindowHours: 24,
};
