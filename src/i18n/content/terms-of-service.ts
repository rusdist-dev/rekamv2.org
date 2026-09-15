import type { Locale } from '@/i18n/config';

/* Page-level copy for /terms-of-service. Chrome-wide strings (nav, footer,
 * "read more") stay in `dictionary.ts`; this is the body content specific to
 * this one page, following the same shape as src/i18n/content/privacy-policy.ts
 * (a `Content` type, an `id` and `en` object, a `termsOfServiceContent(locale)`
 * getter).
 *
 * The English copy is the source text supplied for this page; the
 * Indonesian is a faithful translation of it. Unlike the privacy policy,
 * "User's Obligations" interleaves several paragraphs and numbered lists
 * under one heading, so each block holds an ordered `parts` array instead of
 * privacy-policy.ts's single paragraphs/list/afterList shape. */

type PolicyPart = { paragraph: string } | { list: string[] };

type PolicyBlock = { heading: string; parts: PolicyPart[] };

type TermsOfServiceContent = {
  metaDescription: string;
  breadcrumb: { aria: string; home: string; current: string };
  hero: { title: string; imageAlt: string };
  section: {
    heading: string;
    intro: string[];
    blocks: PolicyBlock[];
    contact: { heading: string; org: string; addressLines: [string, string]; phone: string };
  };
};

const id: TermsOfServiceContent = {
  metaDescription:
    'Syarat & Ketentuan penggunaan website Rekam Nusantara Foundation, termasuk hak cipta, kewajiban pengguna, dan lisensi penggunaan konten.',
  breadcrumb: {
    aria: 'Remah roti',
    home: 'Beranda',
    current: 'Syarat & Ketentuan',
  },
  hero: {
    title: 'Syarat & Ketentuan',
    imageAlt: 'Beberapa orang menyatukan tangan sebagai simbol kepercayaan bersama',
  },
  section: {
    heading: 'Syarat & Ketentuan',
    intro: [
      'Selamat datang di rekam.org, sebuah website yang dikelola oleh Rekam Nusantara Foundation dengan fokus pada konservasi Sumber Daya Alam dan budaya Indonesia (selanjutnya disebut sebagai “website”). Dengan mengakses website ini, Anda menyetujui untuk terikat oleh seluruh ketentuan yang berlaku pada website ini.',
      'Mohon membaca dengan saksama Ketentuan Penggunaan website ini. Jika Anda tidak menyetujui syarat dan ketentuan yang tercantum pada halaman ini, jangan mengakses website ini.',
    ],
    blocks: [
      {
        heading: 'Privasi',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation menghormati privasi pengunjung dan pengguna kami. Kami menyarankan Anda membaca dengan saksama Kebijakan Privasi ini untuk lebih memahami ketentuan penggunaan website ini.',
          },
        ],
      },
      {
        heading: 'Kepemilikan',
        parts: [
          { paragraph: 'Hak Cipta © 2022 Rekam Nusantara Foundation. Seluruh hak dilindungi undang-undang.' },
          {
            paragraph:
              'Seluruh desain, gambar, tulisan, karya seni, audio, video, dan kode pemrograman (selanjutnya disebut sebagai “konten”) pada website ini merupakan hak cipta Rekam Nusantara Foundation. Anda dilarang mengubah, menyalin, mengalihkan, atau menambahkan desain, gambar, tulisan, karya seni, audio, video, atau materi kreatif lainnya serta kode pemrograman pada fasilitas ini dalam bentuk apa pun.',
          },
        ],
      },
      {
        heading: 'Konten',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation melakukan segala upaya untuk memastikan bahwa informasi yang termuat pada website ini benar. Namun demikian, kami tidak dapat menjamin kebenaran atau kelengkapan konten website ini. Kami dapat melakukan perubahan untuk memastikan validitas konten website kapan pun tanpa pemberitahuan sebelumnya.',
          },
        ],
      },
      {
        heading: 'Ketentuan Penggunaan',
        parts: [
          {
            paragraph:
              'Anda bebas menggunakan website ini tanpa perlu membuat akun. Ketentuan penggunaan mengacu pada ketentuan penggunaan website ini, konten, layanan, dan fitur pada website.',
          },
        ],
      },
      {
        heading: 'Perubahan atas Ketentuan Layanan',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation dapat mengganti, menambahkan, atau menghapus bagian mana pun dari Ketentuan Layanan ini. Anda terikat oleh perubahan tersebut, sehingga kami mengingatkan Anda untuk secara rutin membaca halaman ini dan meninjau Ketentuan Layanan yang berlaku dan mengikat Anda.',
          },
        ],
      },
      {
        heading: 'Perubahan atas Website',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation dapat mengubah konten, informasi, layanan, fitur, dan Ketentuan Penggunaan pada website ini kapan pun dan tanpa pemberitahuan sebelumnya, terutama untuk tujuan kepatuhan terhadap peraturan perundang-undangan terbaru yang berlaku dan/atau untuk meningkatkan kualitas website.',
          },
        ],
      },
      {
        heading: 'Kewajiban Pengguna',
        parts: [
          {
            paragraph:
              'Pengguna website wajib mematuhi peraturan perundang-undangan Indonesia yang berlaku. Dengan menggunakan website ini, Anda menyetujui untuk tidak:',
          },
          {
            list: [
              'Melanggar hak pihak lain, termasuk dan tanpa terkecuali, paten, merek dagang, rahasia dagang, hak cipta, publisitas, atau hak milik lainnya.',
              'Menganiaya, melecehkan, merendahkan, atau mengintimidasi individu atau kelompok individu karena agama, gender, orientasi seksual, ras, etnis, usia, atau disabilitas fisik.',
              'Melanggar norma kesusilaan, kecabulan, dan pornografi, atau menyarankan maupun mengusulkan tindakan ilegal.',
              'Menghina, memicu konflik dan/atau permusuhan antarsuku, agama, ras, dan golongan.',
              'Mengunggah kata-kata atau gambar yang menimbulkan ketakutan atau bersifat cabul dan vulgar.',
              'Melanggar Ketentuan Layanan, instruksi, atau kebijakan lain yang tercantum pada website ini.',
            ],
          },
          { paragraph: 'Dengan menggunakan website ini, Anda menyetujui untuk:' },
          {
            list: [
              'Menjaga dan secara rutin memperbarui informasi tentang diri Anda serta informasi lainnya secara akurat dan menyeluruh.',
              'Menerima segala risiko akibat akses ilegal terhadap informasi dan data pendaftaran.',
            ],
          },
          { paragraph: 'Selain itu, Anda dilarang untuk:' },
          {
            list: [
              'Menggunakan website ini dengan cara atau sarana apa pun yang dapat merusak, melumpuhkan, membebani, atau mengganggu server atau jaringan website.',
              'Mengubah, memodifikasi, mengalihkan, atau merusak perangkat lunak, tampilan, atau fungsi website.',
              'Mengakses layanan, akun pengguna, sistem komputer, atau jaringan secara ilegal, melalui peretasan, pencarian kata sandi, atau metode ilegal lainnya.',
            ],
          },
          {
            paragraph:
              'Pengelola akan sepenuhnya bekerja sama dengan aparat penegak hukum atau perintah pengadilan mana pun yang meminta atau menginstruksikan pengelola untuk mengungkapkan identitas siapa pun yang mengunggah materi atau informasi sebagaimana disebutkan di atas.',
          },
        ],
      },
      {
        heading: 'Lisensi Pengguna',
        parts: [
          {
            paragraph:
              'Anda menyadari dan memahami bahwa Rekam Nusantara Foundation tidak bertanggung jawab secara langsung maupun tidak langsung atas kerugian atau kerusakan apa pun yang disebabkan atau diduga disebabkan oleh penggunaan atau kepercayaan terhadap konten, barang, atau layanan apa pun yang disediakan oleh atau melalui website ini atau layanan serupa.',
          },
          {
            paragraph:
              'Anda dapat menggunakan website ini dan konten yang ditawarkan pada website hanya untuk penggunaan pribadi atau publik, dan dilarang menggunakannya untuk tujuan komersial. Anda dapat menggunakan konten yang dapat diunduh, termasuk foto dan rekaman audio, untuk penggunaan pribadi dan publik sesuai dengan ketentuan konten tersebut. Anda dilarang menggandakan, mencetak, menyalin, menyimpan, mempublikasikan, menampilkan, menyebarluaskan, mengubah, menerjemahkan, mengalihkan, menjual, meminjamkan, atau mendistribusikan konten website tanpa izin tertulis dari Rekam Nusantara Foundation.',
          },
        ],
      },
      {
        heading: 'Hubungi Kami',
        parts: [
          {
            paragraph:
              'Jika Anda memiliki pertanyaan mengenai ketentuan yang tercantum pada website ini atau pertanyaan lain mengenai website ini, atau komentar lainnya, silakan hubungi kami di contact@rekam.org',
          },
        ],
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

const en: TermsOfServiceContent = {
  metaDescription:
    "Rekam Nusantara Foundation's Terms of Service for using rekam.org, including copyright, user obligations, and content licensing.",
  breadcrumb: {
    aria: 'Breadcrumb',
    home: 'Home',
    current: 'Term Of Service',
  },
  hero: {
    title: 'Term Of Service',
    imageAlt: 'Several people joining hands as a symbol of shared trust',
  },
  section: {
    heading: 'Term Of Service',
    intro: [
      'Welcome to rekam.org, a website managed by Rekam Nusantara Foundation focusing on the conservation of Indonesia’s Natural Resources and cultures (hereinafter referred to as “website”). By accessing this website, you agree to be bound by all terms that apply in this website.',
      'Please carefully read the Terms of Use for this website. If you do not agree with the terms and conditions as stated in this page, do not access this website.',
    ],
    blocks: [
      {
        heading: 'Privacy',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation respects the privacy of our visitors and users. We suggest that you carefully read this Privacy Policy to better understand terms of use for this website.',
          },
        ],
      },
      {
        heading: 'Ownership',
        parts: [
          { paragraph: 'Copyright © 2022 Rekam Nusantara Foundation. All rights reserved.' },
          {
            paragraph:
              'All design, figures, writing, artwork, audio, video, and programming code (hereinafter referred to as “content”) in this website is the copyright of Rekam Nusantara Foundation. You are prohibited from modifying, copying, altering or adding to the design, figures, writing, artwork, audio, video, or other creative material as well as programming code in this facility in any shape or form.',
          },
        ],
      },
      {
        heading: 'Content',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation undertakes all measures to ensure that the information contained in this website is correct. However, we cannot guarantee the truth or completeness of this website content. We may make changes to ensure the validity of the website contents at any time without prior notice.',
          },
        ],
      },
      {
        heading: 'Terms Of Use',
        parts: [
          {
            paragraph:
              'You are free to use this website without creating an account. Terms of use refers to the terms of using this website, contents, services and features on the website.',
          },
        ],
      },
      {
        heading: 'Amendments to Terms of Services',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation may replace, add or take away any part of this Terms of Services. You are bound to these changes and therefore we remind you to routinely read this page and review the Terms of Services that apply to and bind you.',
          },
        ],
      },
      {
        heading: 'Amendments to Website',
        parts: [
          {
            paragraph:
              'Rekam Nusantara Foundation may change the content, information, services, features and Terms of Use in this website at any time and without prior notice, especially for purposes of compliance with the latest applicable laws and/or regulations and/or to improve the website.',
          },
        ],
      },
      {
        heading: 'User’s Obligations',
        parts: [
          {
            paragraph:
              'Website users must comply with applicable Indonesian laws and regulations. By using this website, you agree not to:',
          },
          {
            list: [
              'Infringe on or violate the rights of others, including and without exception, patents, trademarks, trade secrets, copyrights, publicity or other proprietary rights.',
              'Persecute, harass, demean or intimidate any individual or groups of individuals because of religion, gender, sexual orientation, race, ethnicity, age or physical disabilities.',
              'Violate norms of decency, obscenity and pornography, or advise or suggest illegal actions.',
              'Offend, incite conflict and/or hostility between tribes, religions, races and groups.',
              'Upload words or pictures that cause fear or are profane and vulgar in nature.',
              'Violate Terms of Services, instructions or other policies stated on this website.',
            ],
          },
          { paragraph: 'By using this website, you agree to:' },
          {
            list: [
              'Protect and routinely update information about yourself as well as other information in an accurate and comprehensive manner.',
              'Accept all risks from illegal access to information and registration data.',
            ],
          },
          { paragraph: 'In addition, you are prohibited from:' },
          {
            list: [
              'Using this website in any way or means that can damage, cripple, burden or disturb the server or website network.',
              'Changing, modifying, altering or tampering with website software, appearance or functionalities.',
              'Accessing services, user accounts, computer system or network illegally, by hacking, password mining, or other illegal methods.',
            ],
          },
          {
            paragraph:
              'The manager will cooperate fully with any law enforcers or court warrant that request or instructs the manager to disclose the identity of anyone that puts up materials or information as stated above.',
          },
        ],
      },
      {
        heading: 'User License',
        parts: [
          {
            paragraph:
              'You are aware and understand that Rekam Nusantara Foundation is not directly or indirectly responsible for any damages or losses caused or allegedly caused by use or trust in any content, goods or services provided by or through this website or similar services.',
          },
          {
            paragraph:
              'You may use this website and the contents offered on the website for personal or public use only and is prohibited from doing so for commercial purposes. You may use the downloadable content including photos and audio recordings for personal and public use in accordance with regulations of said contents. You are prohibited from reproducing, printing, copying, storing, publishing, displaying, disseminating, modifying, translating, transferring, selling, lending or distributing the website contents without written permission from Rekam Nusantara Foundation.',
          },
        ],
      },
      {
        heading: 'Contact Us',
        parts: [
          {
            paragraph:
              'If you have any questions about the terms as stated on this website or any questions about this website, or any other comments, please contact us at contact@rekam.org',
          },
        ],
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

const CONTENT: Record<Locale, TermsOfServiceContent> = { id, en };

export function termsOfServiceContent(locale: Locale): TermsOfServiceContent {
  return CONTENT[locale];
}

export type { TermsOfServiceContent };
