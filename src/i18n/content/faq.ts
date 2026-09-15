import type { Locale } from '@/i18n/config';

/* Page-level copy for /faq. Chrome-wide strings (nav, footer, "read more")
 * stay in `dictionary.ts`; this is the body content specific to this one
 * page, following the same shape as src/i18n/content/safeguarding.ts (a
 * `Content` type, an `id` and `en` object, a `faqContent(locale)` getter).
 *
 * The English copy is the source text supplied for this page; the
 * Indonesian is a faithful translation of it. */

type FaqItem = { question: string; paragraphs: string[] };

type FaqContent = {
  metaDescription: string;
  breadcrumb: { aria: string; home: string; current: string };
  hero: { title: string; lede: string; imageAlt: string };
  section: { eyebrow: string; items: FaqItem[] };
};

const id: FaqContent = {
  metaDescription:
    'Pertanyaan yang sering diajukan seputar Rekam Nusantara Foundation — siapa kami, apa yang kami kerjakan, dan bagaimana cara berkolaborasi dengan kami.',
  breadcrumb: {
    aria: 'Remah roti',
    home: 'Beranda',
    current: 'FAQ',
  },
  hero: {
    title: 'Pertanyaan yang Sering Diajukan',
    lede: 'Jika Anda tidak menemukan informasi yang Anda cari di sini, silakan hubungi kami secara langsung.',
    imageAlt: 'Beberapa orang menyatukan tangan sebagai simbol kolaborasi',
  },
  section: {
    eyebrow: 'FAQ',
    items: [
      {
        question: 'Apa itu Rekam Nusantara Foundation?',
        paragraphs: [
          'Rekam Nusantara Foundation (Yayasan Rekam Jejak Alam Nusantara) adalah organisasi nirlaba yang berbasis di Bogor, Jawa Barat. Organisasi yang didirikan pada tahun 2013 ini berfokus pada isu lingkungan dan komunikasi kreatif.',
        ],
      },
      {
        question: 'Bagaimana Perjalanan Kami Hingga Sampai di Titik Ini?',
        paragraphs: [
          'Rekam Nusantara Foundation dibentuk oleh sekelompok praktisi media lingkungan serta peneliti keanekaragaman hayati satwa liar dan laut. Sejak berdiri, kami telah membangun kemitraan dan berupaya mengangkat potensi lingkungan dan alam Indonesia, beserta kekayaan alamnya.',
          'Rekam Nusantara Foundation berkomitmen untuk mengomunikasikan narasi dan strategi yang kuat agar publik dapat memahami Indonesia melalui wawasan yang mutakhir dan berbasis analisis. Seiring waktu, kami belajar bahwa kolaborasi lintas sektor adalah strategi untuk menjembatani kesenjangan pengetahuan tentang kekayaan Indonesia.',
        ],
      },
      {
        question: 'Apa yang Kami Kerjakan?',
        paragraphs: [
          'Rekam Nusantara Foundation melakukan riset sumber daya alam dan keanekaragaman hayati, serta aksi konservasi di seluruh nusantara. Kami telah berkolaborasi dengan beragam pemangku kepentingan, termasuk Pemerintah, masyarakat, kelompok masyarakat adat dan lokal, akademisi, perusahaan, serta organisasi nirlaba lain dengan komitmen dan nilai yang sama.',
          'Oleh karena itu, kami akan terus menggali ide-ide baru dan narasi yang paling menarik. Kami ingin mendokumentasikan jejak ekologis nusantara dan membantu negara ini menjadi lebih baik. Kami percaya bahwa menyuarakan perubahan dapat memberikan dampak yang luas dan nyata.',
        ],
      },
      {
        question: 'Apa Saja Unit di Bawah Rekam Nusantara Foundation?',
        paragraphs: [
          'Rekam Nusantara Foundation dibangun di atas konservasi dan komunikasi kreatif untuk mendorong perubahan dalam upaya konservasi alam dan budaya Indonesia. Saat ini kami memiliki empat unit, masing-masing dengan fokus dan keahlian khusus sebagai berikut.',
          '1. Rangkong Indonesia',
          '2. Fisheries Resource Centre of Indonesia (FRCI)',
          '3. Natural Resource Crime Unit (NRCU)',
          '4. Indonesia Nature Film Society (INFIS)',
        ],
      },
      {
        question: 'Bolehkah Saya Menggunakan Kembali Rekaman atau Foto dari Rekam Nusantara Foundation?',
        paragraphs: [
          'Kami senang mengetahui bahwa karya-karya kami memberikan dampak yang lebih luas, berkat dedikasi dan kerja keras seluruh personel kami yang berkomitmen menghasilkan visual yang bermakna dan berkualitas tinggi. Karena itu, kami menghormati baik hak cipta atas karya tersebut maupun setiap individu yang terlibat dalam prosesnya.',
          'Reproduksi tanpa izin dari pihak yang berhak atas foto atau video merupakan bentuk pelanggaran hak cipta.',
          'Kami dengan senang hati akan membahas lebih lanjut mengenai penggunaan rekaman dan foto kami untuk tujuan non-komersial. Kami juga bersedia memberikan penjelasan lebih lanjut apabila diperlukan.',
          'Silakan kirimkan permintaan Anda ke contact@rekam.or.id atau kirim pesan langsung ke platform media sosial kami apabila Anda ingin menggunakan kembali rekaman atau foto kami. Tim kami akan membantu Anda dengan prosedur selanjutnya.',
        ],
      },
      {
        question: 'Bagaimana Cara Bekerja Sama dengan Rekam Nusantara Foundation?',
        paragraphs: [
          'Kami terbuka terhadap berbagai bentuk kolaborasi dan peluang kerja sama dengan berbagai pihak yang memiliki visi yang sama untuk memperluas dampak.',
          'Pertama-tama, silakan kirimkan email kepada kami di contact@rekam.org atau kirim pesan langsung melalui salah satu platform media sosial Rekam Nusantara Foundation.',
        ],
      },
    ],
  },
};

const en: FaqContent = {
  metaDescription:
    "Frequently asked questions about Rekam Nusantara Foundation — who we are, what we do, and how to collaborate with us.",
  breadcrumb: {
    aria: 'Breadcrumb',
    home: 'Home',
    current: 'FAQ',
  },
  hero: {
    title: 'Frequently Asked Questions',
    lede: "If you don't find the information you're looking for here, please contact us directly.",
    imageAlt: 'Several people joining hands as a symbol of collaboration',
  },
  section: {
    eyebrow: 'FAQ',
    items: [
      {
        question: 'What is Rekam Nusantara Foundation?',
        paragraphs: [
          'Rekam Nusantara Foundation (Yayasan Rekam Jejak Alam Nusantara) is a non-profit organisation based in Bogor, West Java. The organisation, which was founded in 2013, focuses on environmental issues and creative communication.',
        ],
      },
      {
        question: 'How Did We Start Our Journey to This Point?',
        paragraphs: [
          "Rekam Nusantara Foundation was created by a group of environmental media practitioners as well as wildlife and marine biodiversity researchers. Since its establishment, we have developed partnerships and worked to promote the potential of Indonesia's environment and nature, as well as its natural richness.",
          "Rekam Nusantara Foundation is committed to communicating powerful narratives and strategies for the public to perceive Indonesia using up-to-date, analysis-based insights. Over the time, we learned that cross-sectoral collaboration is a strategy for bridging the gap of knowledge about Indonesia's richness.",
        ],
      },
      {
        question: 'What Do We Do?',
        paragraphs: [
          'Rekam Nusantara Foundation conducts research on natural resources and biodiversity, as well as conservation actions throughout the archipelago. We have collaborated with a diverse range of stakeholders, including the Government, community, groups of indigenous peoples and local communities, academics, companies, and other non-profit organisations with shared commitments and values.',
          "Therefore, we will keep exploring novel ideas and the most compelling narratives. We wish to document the archipelago's ecological imprints and help the country improve. We believe that speaking up for a change can have a far-reaching and concrete impact.",
        ],
      },
      {
        question: 'What Are The Units Of Rekam Nusantara Foundation?',
        paragraphs: [
          "Rekam Nusantara Foundation is built on conservation and creative communication to drive change in Indonesia's natural and cultural conservation efforts. We presently have four units, each with specific focus and skillsets as follows.",
          '1. Rangkong Indonesia',
          '2. Fisheries Resource Centre of Indonesia (FRCI)',
          '3. Natural Resource Crime Unit (NRCU)',
          '4. Indonesia Nature Film Society (INFIS)',
        ],
      },
      {
        question: 'Can I Reuse Footage Or Photographs From The Rekam Nusantara Foundation?',
        paragraphs: [
          'We are delighted to know that our works have a broader impact, thanks to the dedication and hard work of all of our personnel who are devoted to capturing meaningful, high-quality visuals. Therefore, we respect both the copyright of the work and all the individuals involved in each process.',
          'Reproduction without the permission from those who are entitled to any photographs or videos is a form of copyright infringement.',
          'We would be pleased to talk more about using our footage and photographs for non-commercial purposes. We are also willing to provide elaboration on this if necessary.',
          'Please email your request to contact@rekam.or.id or send direct messages to our social media platforms if you intend to reuse our footage or photographs. Our team will assist you with the next procedures.',
        ],
      },
      {
        question: 'How Can I Work With Rekam Nusantara Foundation?',
        paragraphs: [
          'We are open to various forms of collaboration and cooperation opportunities with different parties with shared visions to amplify the impacts.',
          "First of all, please send us an email at contact@rekam.org or send a direct message through any of the Rekam Nusantara Foundation's social media platforms.",
        ],
      },
    ],
  },
};

const CONTENT: Record<Locale, FaqContent> = { id, en };

export function faqContent(locale: Locale): FaqContent {
  return CONTENT[locale];
}

export type { FaqContent };
