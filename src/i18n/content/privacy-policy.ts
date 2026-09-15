import type { Locale } from '@/i18n/config';

/* Page-level copy for /privacy-policy. Chrome-wide strings (nav, footer,
 * "read more") stay in `dictionary.ts`; this is the body content specific to
 * this one page, following the same shape as src/i18n/content/faq.ts (a
 * `Content` type, an `id` and `en` object, a `privacyPolicyContent(locale)`
 * getter).
 *
 * The English copy is the source text supplied for this page; the
 * Indonesian is a faithful translation of it. Each `blocks` entry is one
 * heading + its body, in source order; `list` renders as a numbered list,
 * with `afterList` for any paragraph that follows it under the same
 * heading. */

type PolicyBlock = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  afterList?: string[];
};

type PrivacyPolicyContent = {
  metaDescription: string;
  breadcrumb: { aria: string; home: string; current: string };
  hero: { title: string; imageAlt: string };
  section: {
    heading: string;
    effective: string;
    blocks: PolicyBlock[];
    contact: { heading: string; org: string; addressLines: [string, string]; phone: string };
  };
};

const id: PrivacyPolicyContent = {
  metaDescription:
    'Kebijakan Privasi Rekam Nusantara Foundation mengenai bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi pengunjung website.',
  breadcrumb: {
    aria: 'Remah roti',
    home: 'Beranda',
    current: 'Kebijakan Privasi',
  },
  hero: {
    title: 'Kebijakan Privasi',
    imageAlt: 'Beberapa orang menyatukan tangan sebagai simbol kepercayaan bersama',
  },
  section: {
    heading: 'Kebijakan Privasi',
    effective: 'Efektif 1 Juli 2022',
    blocks: [
      {
        paragraphs: [
          'Kebijakan privasi ini merupakan komitmen Rekam Nusantara Foundation dalam menghormati dan melindungi informasi pribadi Anda, serta memastikan bahwa informasi pribadi Anda, maupun pengunjung dan pengguna situs rangkong.org, terlindungi (selanjutnya disebut sebagai “website”).',
          'Kebijakan privasi ini berlaku untuk data pribadi dan informasi yang dikumpulkan selama kunjungan Anda ke website kami, termasuk alamat, detail kontak, e-mail, foto dan gambar, serta lainnya. Setelah perubahan apa pun pada kebijakan privasi ini diunggah, perubahan tersebut langsung berlaku. Perubahan atau penambahan pada Kebijakan Privasi ini dapat dilakukan kapan saja. Setiap perubahan dapat dilihat pada halaman ini.',
          'Jika Anda memiliki pertanyaan mengenai Website ini atau Kebijakan Privasi kami, silakan hubungi kami melalui sarana komunikasi yang tersedia sesuai preferensi Anda.',
        ],
      },
      {
        heading: 'Dengan menggunakan website ini, Anda menyetujui untuk:',
        paragraphs: [
          'Memberikan informasi tentang diri Anda yang akurat, lengkap, dan terkini saat mengisi atau mengembalikan formulir pendaftaran, baik melalui website maupun langsung kepada kami.',
        ],
      },
      {
        heading: 'Bagaimana Kami Mengumpulkan Informasi:',
        list: [
          'Kami mengumpulkan informasi acak mengenai pengguna dan pengunjung website untuk lebih memahami pengguna, seperti (i) peramban (browser), (ii) sistem operasi, (iii) penyedia layanan internet, (iv) alamat IP, (v) pola penggunaan atau kunjungan, (vi) halaman website yang paling populer atau paling sering dikunjungi, dan informasi serupa lainnya.',
          'Kami juga menyediakan layanan analitik dan optimasi website serta aplikasi pihak ketiga untuk meningkatkan kualitas dan kinerja website demi meningkatkan kepuasan dan pengalaman pengunjung.',
          'Kami menggunakan informasi yang dikumpulkan melalui “cookies” untuk menganalisis jumlah kunjungan website, durasi kunjungan, jumlah halaman yang dilihat dan dikunjungi, serta data dan informasi lain yang memungkinkan kami meningkatkan kualitas dan kinerja website.',
          'Kami juga menggunakan Google Analytics, yang menggunakan cookies dan teknologi serupa lainnya untuk mengumpulkan informasi mengenai penggunaan Situs secara anonim dan melaporkan tren website, tanpa mengidentifikasi pengunjung secara individu.',
          'Kami mengumpulkan informasi mengenai, namun tidak terbatas pada, nama, nama lengkap, alamat, email, nomor ponsel, nomor telepon, foto profil, dan informasi relevan lainnya melalui survei dan/atau penawaran.',
        ],
      },
      {
        heading: 'Bagaimana Kami Mengumpulkan Informasi Pribadi Anda:',
        paragraphs: [
          '“Informasi Pribadi” adalah informasi yang mengidentifikasi Anda sebagai individu atau berkaitan dengan orang yang dapat diidentifikasi.',
          'Kami mengumpulkan Informasi Pribadi yang berkaitan dengan Anda hanya jika Anda secara sukarela memberikan informasi tersebut kepada kami, terutama saat Anda:',
        ],
        list: [
          'Berlangganan layanan tertentu',
          'Mengunduh konten yang dapat diunduh',
          'Melakukan transaksi daring untuk membeli produk',
          'Melakukan donasi',
          'Mengikuti permainan/kompetisi',
          'Mengirimkan e-mail kepada kami',
          'Menanggapi jajak pendapat atau kasus.',
        ],
        afterList: [
          'Anda memahami Kebijakan Privasi Website ini dan menyetujui bahwa data pribadi Anda akan diperlakukan sebagaimana diatur di dalam website (apabila diperlukan untuk tujuan sebagaimana diatur di Website) dan diarsipkan sebagaimana diatur di dalam website.',
        ],
      },
      {
        heading: 'Bagaimana Kami Menggunakan Data Pribadi Anda:',
        paragraphs: [
          'Kami akan menggunakan data pribadi Anda untuk tujuan yang telah Anda percayakan kepada kami, namun tidak terbatas pada menjawab pertanyaan, menanggapi permintaan Anda, memproses pembelian daring, memproses donasi, memperbarui keanggotaan dan layanan, serta mendaftarkan program.',
          'Kami dapat menggunakan informasi Anda untuk mengirimkan surat dan/atau e-mail mengenai Rekam Nusantara Foundation dan program kami. Kami juga dapat menggunakan informasi Anda untuk mengirimkan informasi mengenai mitra Rekam Nusantara Foundation, informasi administratif, serta meminta partisipasi Anda dalam acara yang diselenggarakan oleh Rekam Nusantara Foundation dan/atau mitra yang melibatkan Rekam Nusantara Foundation.',
          'Kami dapat menggunakan informasi Anda untuk keperluan internal kami; termasuk analisis data, mengidentifikasi tren pengguna, menentukan efektivitas kampanye promosi kami, serta mengoperasikan dan memperluas kegiatan kami.',
        ],
      },
      {
        heading: 'Siapa yang Dapat Mengakses Data Anda:',
        paragraphs: [
          'Kami membatasi akses terhadap data yang dikumpulkan, khususnya akses terhadap data individu tertentu. Data yang digunakan sesuai dengan ketentuan dan komitmen dalam Kebijakan Privasi ini.',
        ],
      },
      {
        heading: 'Tautan Lain',
        paragraphs: [
          'Website ini mungkin memuat tautan ke website lain dan/atau website mitra. Website ini mungkin memuat tautan ke website dan/atau layanan dari pihak-pihak yang berkontribusi dalam pembangunan website ini. Ini termasuk tautan pada halaman dukungan dan hasil pencarian. Tautan-tautan ini tidak berarti bahwa kami telah menyetujui situs pihak kedua dan ketiga tersebut. Anda memahami dan menyetujui bahwa kami tidak bertanggung jawab atas konten atau materi lain pada situs pihak kedua dan ketiga tersebut.',
        ],
      },
      {
        heading: 'Pengawasan',
        paragraphs: [
          'Anda menyetujui bahwa kami tidak bertanggung jawab atas konten yang disediakan oleh pihak lain. Kami tidak berkewajiban untuk memeriksa konten tersebut, namun kami berhak untuk memuat atau menyunting konten yang dikirimkan. Kami berhak menghapus konten dengan alasan apa pun, namun kami tidak bertanggung jawab atas kegagalan atau keterlambatan dalam menghapus materi tersebut.',
        ],
      },
      {
        heading: 'Bagaimana Anda Dapat Merevisi atau Memperbarui Data Anda:',
        paragraphs: ['Anda dapat merevisi dan memperbarui informasi pribadi Anda dengan mengirimkan e-mail ke contact@rekam.org'],
      },
    ],
    contact: {
      heading: 'Informasi Kontak',
      org: 'Rekam Nusantara Foundation',
      addressLines: ['Jl. Sempur No 35, Kelurahan Sempur', 'Kecamatan Bogor Tengah, Bogor 16129'],
      phone: 'Telepon: +62 251 8354253',
    },
  },
};

const en: PrivacyPolicyContent = {
  metaDescription:
    "Rekam Nusantara Foundation's Privacy Policy on how we collect, use, and protect website visitors' personal information.",
  breadcrumb: {
    aria: 'Breadcrumb',
    home: 'Home',
    current: 'Privacy Policy',
  },
  hero: {
    title: 'Privacy Policy',
    imageAlt: 'Several people joining hands as a symbol of shared trust',
  },
  section: {
    heading: 'Privacy Policy',
    effective: 'Effective 1 July 2022',
    blocks: [
      {
        paragraphs: [
          'This privacy policy is Rekam Nusantara Foundation commitment in respecting and protecting your personal information and ensuring that your personal information, as well as that of rangkong.org website visitors and users, are protected (hereinafter referred to as “website”).',
          'This privacy policy applies to personal data and information collected during your visit to our website, including address, contact details, e-mail, photos and images, and others. Once any amendment to this privacy policy is uploaded it becomes effective immediately. Changes or additions to this Privacy Policy may be made at any time. Any changes can be viewed on this page.',
          'If you have questions on this Website or our Privacy Policy, please contact us through your preferred means of communication available.',
        ],
      },
      {
        heading: 'By using this website, you agree to:',
        paragraphs: [
          'Provide accurate, complete and up-to-date information about yourself when completing or returning the registration form whether through the website or directly to us.',
        ],
      },
      {
        heading: 'How We Collect Information:',
        list: [
          'We collect random information on website users and visitors to better understand users (i) browser, (ii) operation system, (iii) internet provider, (iv) IP address, (v) use or visit patterns, (vi) most popular or visited website page, and other similar information.',
          "We also provide website analytical and optimization services and third-party apps to improve the website quality and performance in order to enhance the visitor's satisfaction and experience.",
          'We use the information collected through “cookies” to analyze the number of website visits, visit duration, the number of pages viewed and visited, and other data and information that allow us to enhance website quality and performance.',
          'We also use Google Analytics, which uses cookies and other, similar technologies to collect information about Site use anonymously and reports website trends, without identifying individual visitors.',
          'We collect information on, but not limited to, name, full name, address, email, cell phone number, phone number, profile picture and other relevant information through surveys and/or offers.',
        ],
      },
      {
        heading: 'How We Collect Your Personal Information:',
        paragraphs: [
          '“Personal Information” is information that identifies you as an individual or relates to an identifiable person.',
          'We collect Personal Information relating to you only if you voluntarily provide such information to us, especially when you:',
        ],
        list: [
          'Subscribe to certain services',
          'Download any downloadable content',
          'Carry out online transactions to purchase products',
          'Make donations',
          'Take part in games/competitions',
          'Send us e-mails',
          'Respond to polls or cases.',
        ],
        afterList: [
          'You understand the Website Privacy Policy and agree that your personal data will be treated as governed in the web (if needed for purposes as governed on the Website) and archived as governed in the web.',
        ],
      },
      {
        heading: 'How We Use Your Personal Data:',
        paragraphs: [
          'We will use your personal data for purposes that you have entrusted us for, but not limited to responding to questions, responding to your requests, processing online purchases, processing donations, renew memberships and services, and register programs.',
          'We may use your information to send a post and/or electronic email about Rekam Nusantara Foundation and our program. We may also use your information to send information on Rekam Nusantara Foundation partners, administrative information as well as request your participation in events held by Rekam Nusantara Foundation and/or partners involving Rekam Nusantara Foundation.',
          'We may use your information for our internal purposes; including data analysis, identifying user trends, determining our promotional campaign effectiveness, and operate and extend our activities.',
        ],
      },
      {
        heading: 'Who Can Access Your Data:',
        paragraphs: [
          'We limit access to the data collected, especially access to selected individual data. The data used is in accordance with the terms and commitments in the Privacy Policy.',
        ],
      },
      {
        heading: 'Other Links',
        paragraphs: [
          "This website may contain links to other websites and/or partner's website. This website may contain links to websites and/or services from parties that contribute to the construction of this website. This includes links in support and search results pages. These links do not mean that we have agreed to the second- and third-party sites. You understand and agree that we are not responsible for other contents or materials in these second- and third-party sites.",
        ],
      },
      {
        heading: 'Oversight',
        paragraphs: [
          'You agree that we are not responsible for contents provided by other parties. We are not obliged to check on these contents, but we have the right to load or edit the content sent. We have the right to erase content for any reason, but we are not responsible for the failure or delay in erasing these materials.',
        ],
      },
      {
        heading: 'How You Can Revise Or Update Your Data:',
        paragraphs: ['You can revise and update your personal information by sending an e-mail to contact@rekam.org'],
      },
    ],
    contact: {
      heading: 'Contact Information',
      org: 'Rekam Nusantara Foundation',
      addressLines: ['Jl. Sempur No 35, Kelurahan Sempur', 'Kecamatan Bogor Tengah, Bogor 16129'],
      phone: 'Phone: +62 251 8354253',
    },
  },
};

const CONTENT: Record<Locale, PrivacyPolicyContent> = { id, en };

export function privacyPolicyContent(locale: Locale): PrivacyPolicyContent {
  return CONTENT[locale];
}

export type { PrivacyPolicyContent };
