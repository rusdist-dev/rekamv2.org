import type { Locale } from '@/i18n/config';

/* Page-level copy for /brand-guideline, same shape as the other
 * src/i18n/content/*.ts files (a Content type, an `id` and `en` object, and a
 * `brandGuidelineContent(locale)` getter).
 *
 * Every string on the page is translated, section labels included. An earlier
 * version left the hero and the section labels in English on both routes, on
 * the grounds that they name an English-language document; that was reversed
 * on request — the Indonesian route now reads as Indonesian throughout, and
 * the English wording survives in the `en` object beside it.
 *
 * Heading case: stored in sentence case and uppercased in CSS, so screen
 * readers do not spell it out letter by letter. */

type BrandGuidelineContent = {
  metaTitle: string;
  metaDescription: string;
  breadcrumb: { aria: string; home: string; current: string };
  hero: { eyebrow: string; heading: string };
  intro: {
    eyebrow: string;
    portraitAlt: string;
    landscapeAlt: string;
    paragraphs: [string, string];
  };
  usage: {
    eyebrow: string;
    /** One per approved lockup, in the order the manual prints them. */
    options: [UsageOption, UsageOption, UsageOption];
  };
  colour: {
    /** The manual prints this spread without a heading; it is carried for
     *  screen readers only, so the section is reachable from a heading list. */
    srHeading: string;
    paragraphs: [string, string, string, string];
    /** One per approved colour variation, in the manual's order. Captions are
     *  stored in sentence case and uppercased in CSS. */
    variants: [ColourVariant, ColourVariant, ColourVariant];
    elements: {
      variationsHeading: string;
      byElementHeading: string;
      /** Shared by all three elements — each shows the same two lockups. */
      horizontalLabel: string;
      verticalLabel: string;
      items: [ColourElement, ColourElement, ColourElement];
    };
    tone: {
      heading: string;
      /** "Color 1" … "Color 5"; a function because only the number changes. */
      swatchLabel: (n: number) => string;
    };
  };
  assets: {
    logoAlt: string;
    /** Two lines, broken where the manual breaks them. */
    heading: [string, string];
    download: string;
    gate: AssetGateCopy;
  };
};

/** Every string in the download dialog. `subjectValue` is not shown to anyone
 *  on the page — it is the subject the request is filed under in the CMS, so
 *  these requests can be told apart from complaints and contact messages. */
type AssetGateCopy = {
  subjectValue: string;
  title: string;
  intro: string;
  nameLabel: string;
  emailLabel: string;
  purposeLabel: string;
  submit: string;
  submitting: string;
  successBody: string;
  openFolder: string;
  close: string;
  closeAria: string;
  error: string;
};

type ColourVariant = { caption: string; alt: string };

/** One of the mark's three colour elements. `name` is stored in sentence case
 *  and uppercased in CSS. */
type ColourElement = { name: string; horizontalAlt: string; verticalAlt: string };

type UsageOption = { title: string; alt: string; body: string };

const id: BrandGuidelineContent = {
  metaTitle: 'Panduan Citra REKAM',
  metaDescription:
    'Panduan Citra REKAM: standar grafis dan ketentuan co-branding untuk seluruh komunikasi REKAM yang dibuat oleh karyawan, kontraktor, penerima hibah, dan mitra.',
  breadcrumb: {
    aria: 'Remah roti',
    home: 'Beranda',
    current: 'Panduan Citra REKAM',
  },
  hero: {
    eyebrow: 'Panduan Standar Grafis REKAM dan Co-Branding Mitra',
    heading:
      'Panduan ini menetapkan standar bagi seluruh komunikasi REKAM yang dibuat oleh karyawan, kontraktor, penerima hibah, dan mitra lainnya.',
  },
  intro: {
    eyebrow: 'Panduan Citra Logo REKAM Nusantara untuk Semua Publikasi',
    portraitAlt: 'Logo REKAM Nusantara, kunci potret: lambang di atas tulisan REKAM',
    landscapeAlt: 'Logo REKAM Nusantara, kunci lanskap: lambang di samping tulisan REKAM',
    paragraphs: [
      'Panduan Graphic Standards and Brand Manual ini hadir untuk memastikan bahwa cara kita menggunakan logo, warna, tipografi, dan materi komunikasi selalu konsisten, jelas, dan selaras dengan nilai-nilai yayasan. Panduan ini memberikan standar, template, dan contoh penggunaan agar semua pesan yang kita sampaikan dapat memperkuat citra Rekam Nusantara sebagai lembaga yang kredibel, inklusif, dan berpihak pada alam serta masyarakat yang menjaganya.',
      'Dengan mengikuti panduan ini, kita membantu menjaga reputasi yayasan, membangun kepercayaan publik, dan memastikan pesan-pesan konservasi yang kita suarakan sampai ke audiens dengan cara yang efektif dan profesional.',
    ],
  },
  usage: {
    eyebrow: 'Pilihan Penggunaan',
    options: [
      {
        title: 'Logo Horizontal',
        alt: 'Logo REKAM versi horizontal: lambang di samping tulisan REKAM',
        body: 'Penggunaan umum: Halaman web, publikasi, papan nama, alat tulis kantor, dan saat co-branding dengan logo horizontal lain. Ini versi logo yang paling sering dipakai.',
      },
      {
        title: 'Logo Vertikal',
        alt: 'Logo REKAM versi vertikal: lambang di atas tulisan REKAM',
        body: 'Penggunaan umum: Undangan resmi, sertifikat, dan saat co-branding dengan logo vertikal lain.',
      },
      {
        title: 'PITA/PERSEGI*',
        alt: 'Logo REKAM versi pita/persegi: lambang dan tulisan REKAM putih di dalam kotak hijau',
        body: 'Penggunaan umum: Papan podium, plakat lembaga.',
      },
    ],
  },
  colour: {
    srHeading: 'Ketentuan warna logo',
    paragraphs: [
      'Logo Rekam Nusantara Foundation memiliki tiga variasi warna yang disetujui: warna penuh, hitam saja, dan putih (reverse). Pilihan ini memastikan logo tetap utuh dan terbaca di berbagai media — baik cetak, digital, maupun tayangan layar.',
      'Versi warna penuh dipakai setiap kali memungkinkan, karena versi inilah yang mewakili identitas yayasan seutuhnya. Versi hitam saja dianjurkan untuk materi cetak monokrom atau ketika cetak warna tidak tersedia. Versi putih (reverse) dipakai di atas latar gelap atau foto agar tetap terlihat jelas dan konsisten.',
      'Hanya berkas resmi yang disediakan Rekam Nusantara Foundation yang boleh dipakai. Jangan mengubah, menggambar ulang, mendistorsi, atau mengganti warna logo dalam keadaan apa pun. Selalu sisakan ruang kosong yang cukup di sekeliling logo agar tetap terbaca dan berdampak.',
      'Saat menempatkan logo di atas foto atau latar berwarna, pastikan logo tetap terlihat jelas dan kontrasnya cukup demi menjaga integritas citra lembaga.',
    ],
    variants: [
      {
        caption: 'Logo warna penuh',
        alt: 'Logo REKAM versi warna penuh',
      },
      {
        caption: 'Logo hitam saja',
        alt: 'Logo REKAM versi hitam saja',
      },
      {
        caption: 'Logo putih',
        alt: 'Logo REKAM versi putih di atas blok hitam',
      },
    ],
    elements: {
      variationsHeading: 'Variasi warna',
      byElementHeading: 'Berdasarkan elemen warna logo',
      horizontalLabel: 'Horizontal',
      verticalLabel: 'Vertikal',
      items: [
        {
          name: 'Air',
          horizontalAlt: 'Logo REKAM horizontal dalam warna air',
          verticalAlt: 'Logo REKAM vertikal dalam warna air',
        },
        {
          name: 'Pohon',
          horizontalAlt: 'Logo REKAM horizontal dalam warna pohon',
          verticalAlt: 'Logo REKAM vertikal dalam warna pohon',
        },
        {
          name: 'Tanah',
          horizontalAlt: 'Logo REKAM horizontal dalam warna tanah',
          verticalAlt: 'Logo REKAM vertikal dalam warna tanah',
        },
      ],
    },
    tone: {
      heading: 'Tona warna',
      swatchLabel: (n) => `Warna ${n}`,
    },
  },
  assets: {
    logoAlt: 'Logo REKAM versi pita/persegi',
    heading: ['Rekam Nusantara', 'Tautan folder aset'],
    download: 'Unduh',
    gate: {
      subjectValue: 'Permintaan folder aset Panduan Citra REKAM',
      title: 'Unduh folder aset',
      intro:
        'Isi nama, email, dan keperluan Anda. Tautan ke folder aset akan terbuka setelah formulir ini terkirim.',
      nameLabel: 'Nama',
      emailLabel: 'Email',
      purposeLabel: 'Keperluan',
      submit: 'Kirim & buka folder',
      submitting: 'Mengirim...',
      successBody:
        'Terima kasih. Permintaan Anda sudah kami terima — folder aset dapat dibuka melalui tombol di bawah ini.',
      openFolder: 'Buka folder aset',
      close: 'Tutup',
      closeAria: 'Tutup',
      error: 'Gagal mengirim permintaan. Silakan coba lagi.',
    },
  },
};

const en: BrandGuidelineContent = {
  metaTitle: 'Brand Guideline',
  metaDescription:
    'REKAM Brand Guideline: the graphics standard and co-branding rules for every REKAM communication produced by employees, contractors, grantees and other partners.',
  breadcrumb: {
    aria: 'Breadcrumb',
    home: 'Home',
    current: 'Brand Guideline',
  },
  hero: {
    eyebrow: 'REKAM Graphics Standard Manual and Partner Co Branding',
    heading:
      'This manual sets the standard for all REKAM communications produced by employees, contractors, grantees and other partners.',
  },
  intro: {
    eyebrow: 'REKAM Nusantara Logo Branding for Any Publication',
    portraitAlt: 'REKAM Nusantara logo, portrait lockup: the mark above the REKAM wordmark',
    landscapeAlt: 'REKAM Nusantara logo, landscape lockup: the mark beside the REKAM wordmark',
    paragraphs: [
      "This Graphic Standards and Brand Manual exists to make sure that the way we use our logo, colours, typography and communication materials stays consistent, clear and true to the foundation's values. It sets out the standards, templates and worked examples that let every message we send strengthen Rekam Nusantara's standing as a credible, inclusive organisation that sides with nature and with the communities who look after it.",
      "By following this guideline we help protect the foundation's reputation, build public trust, and make sure the conservation messages we raise reach their audience effectively and professionally.",
    ],
  },
  usage: {
    eyebrow: 'Usage Options',
    options: [
      {
        title: 'Horizontal Logo',
        alt: 'REKAM logo, horizontal lockup: the mark beside the REKAM wordmark',
        body: 'Typical uses: Web pages, publication, signs, stationary and when co-branding with other horizontal logos. This is the most widely used version of the logo.',
      },
      {
        title: 'Vertical Logo',
        alt: 'REKAM logo, vertical lockup: the mark above the REKAM wordmark',
        body: 'Typical uses: Formal invitation, certificates and when co-branding with other vertical logos.',
      },
      {
        title: 'RIBBON/SQUARE*',
        alt: 'REKAM logo, ribbon/square lockup: the mark and wordmark reversed out of a green panel',
        body: 'Typical uses: Podium Signs, corporate plaques.',
      },
    ],
  },
  colour: {
    srHeading: 'Logo colour rules',
    paragraphs: [
      'Rekam Nusantara Foundation logo has three approved color variations: full-color, black-only, and white (reverse). These options ensure that the logo maintains its integrity and visibility across different media — whether in print, digital, or on-screen presentations.',
      'Full-color version should be used whenever possible, as it represents the full identity of the foundation. Black-only version is recommended for monochrome print materials or when color printing is not available. White version (reverse) is used on dark or photographic backgrounds to ensure clear visibility and brand consistency.',
      'Only the official files provided by Rekam Nusantara Foundation may be used. Do not alter, re-create, distort, or recolor the logo under any circumstances. Always maintain sufficient clear space around the logo to preserve its legibility and impact.',
      'When placing the logo on photos or color backgrounds, ensure that the logo remains clearly visible and there is enough contrast to maintain brand integrity.',
    ],
    variants: [
      {
        caption: 'Full-color logo',
        alt: 'REKAM logo, full-colour version',
      },
      {
        caption: 'Black-only logo',
        alt: 'REKAM logo, black-only version',
      },
      {
        caption: 'White logo',
        alt: 'REKAM logo, white version reversed out of a black block',
      },
    ],
    elements: {
      variationsHeading: 'Color variations',
      byElementHeading: 'By logo color element',
      horizontalLabel: 'Horizontal',
      verticalLabel: 'Vertical',
      items: [
        {
          name: 'Water',
          horizontalAlt: 'REKAM horizontal logo in the water colour',
          verticalAlt: 'REKAM vertical logo in the water colour',
        },
        {
          name: 'Tree',
          horizontalAlt: 'REKAM horizontal logo in the tree colour',
          verticalAlt: 'REKAM vertical logo in the tree colour',
        },
        {
          name: 'Land',
          horizontalAlt: 'REKAM horizontal logo in the land colour',
          verticalAlt: 'REKAM vertical logo in the land colour',
        },
      ],
    },
    tone: {
      heading: 'Color tone',
      swatchLabel: (n) => `Color ${n}`,
    },
  },
  assets: {
    logoAlt: 'REKAM logo, ribbon/square lockup',
    heading: ['Rekam Nusantara', 'Link folder asset'],
    download: 'Download',
    gate: {
      subjectValue: 'Permintaan folder aset Panduan Citra REKAM',
      title: 'Download the asset folder',
      intro:
        'Fill in your name, email and what you need the assets for. The link to the asset folder opens once this form is sent.',
      nameLabel: 'Name',
      emailLabel: 'Email',
      purposeLabel: 'What you need it for',
      submit: 'Send & open folder',
      submitting: 'Sending...',
      successBody:
        'Thank you. We have your request — the asset folder opens from the button below.',
      openFolder: 'Open the asset folder',
      close: 'Close',
      closeAria: 'Close',
      error: 'The request could not be sent. Please try again.',
    },
  },
};

const CONTENT: Record<Locale, BrandGuidelineContent> = { id, en };

export function brandGuidelineContent(locale: Locale): BrandGuidelineContent {
  return CONTENT[locale];
}

export type { BrandGuidelineContent };
