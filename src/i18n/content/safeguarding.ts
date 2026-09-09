import type { Locale } from '@/i18n/config';

/* Page-level copy for /safeguarding. Chrome-wide strings (nav, footer, "read
 * more") stay in `dictionary.ts`; this is the body content that is specific
 * to this one page, following the same shape as src/i18n/content/initiative.ts
 * (a `Content` type, an `id` and `en` object, a `safeguardingContent(locale)`
 * getter).
 *
 * Before this file existed, the top ~60% of the page (the policy boilerplate
 * — hero heading, purpose/scope/definitions) was hardcoded in English and
 * shown as-is on the Indonesian route, while the bottom "lapor" section (the
 * complaint channels, the process list, and the complaint form) was hardcoded
 * in Indonesian and shown as-is on the English route. Both directions are
 * translated here: the originally-English policy text keeps its exact `en`
 * wording with a faithful Indonesian translation added, and the originally-
 * Indonesian complaint section keeps its exact `id` wording with a faithful
 * English translation added.
 *
 * Contact emails, phone numbers, and the organisation name are not part of
 * this content object — they are language-independent and stay inline in
 * page.tsx. */

type ComplaintStep = { label: string; text: string };

type SafeguardingContent = {
  metaDescription: string;
  breadcrumb: { aria: string; home: string; current: string };
  hero: { eyebrow: string; heading: string; imageAlt: string };
  policy: {
    purposeLede: string;
    purposeCauses: [string, string];
    /** Split around the footnote-1 marker so page.tsx can render a real <sup>. */
    commitmentsBefore: string;
    commitmentsAfter: string;
    doesNotCover: string;
    /** doesNotCoverItems[0] excludes the trailing footnote-2 marker, which
     *  page.tsx renders as a real <sup> after it; doesNotCoverItems[1] has no
     *  footnote and is used as-is. */
    doesNotCoverItems: [string, string];
    whatIsSafeguardingHeading: string;
    whatIsSafeguardingParagraphs: [string, string, string];
    scopeHeading: string;
    scopeItems: [string, string];
    footnotes: [string, string, string];
  };
  lapor: {
    channelsHeading: string;
    eligibilityHeading: string;
    eligibilityItems: [string, string, string, string];
    processHeading: string;
    processSteps: [ComplaintStep, ComplaintStep, ComplaintStep, ComplaintStep, ComplaintStep, ComplaintStep];
    form: {
      anonymityLegend: string;
      anonymityOptions: [string, string];
      nameLabel: string;
      emailLabel: string;
      addressLabel: string;
      phoneLabel: string;
      messageLabel: string;
      submit: string;
    };
  };
  cta: {
    heading: [string, string];
    button: string;
    imageAlt: string;
  };
};

const id: SafeguardingContent = {
  metaDescription:
    'Komitmen Rekam Nusantara Foundation dalam melindungi masyarakat, mitra, relawan, dan lingkungan dari risiko bahaya selama pelaksanaan program.',
  breadcrumb: {
    aria: 'Remah roti',
    home: 'Beranda',
    current: 'Safeguarding',
  },
  hero: {
    eyebrow: 'Kebijakan Safeguarding REKAM',
    heading:
      'Kebijakan, prosedur, dan budaya kerja yang diterapkan untuk melindungi kelompok rentan, penerima manfaat, dan staf dari bahaya, penyalahgunaan, eksploitasi, dan pelecehan.',
    imageAlt: 'Beberapa orang menyatukan tangan sebagai simbol perlindungan bersama',
  },
  policy: {
    purposeLede:
      'Tujuan kebijakan ini adalah melindungi masyarakat, khususnya anak-anak, orang dewasa berisiko, dan penerima bantuan, dari segala bentuk bahaya yang dapat timbul akibat kontak mereka dengan [NGO]. Ini mencakup bahaya yang timbul dari:',
    purposeCauses: [
      'Perilaku staf atau personel yang berasosiasi dengan [NGO]',
      'Rancangan dan pelaksanaan program serta kegiatan [NGO]',
    ],
    commitmentsBefore:
      'Kebijakan ini menjabarkan komitmen yang dibuat oleh [NGO], serta menginformasikan staf dan personel yang berasosiasi dengannya',
    commitmentsAfter: ' mengenai tanggung jawab mereka terkait safeguarding.',
    doesNotCover: 'Kebijakan ini tidak mencakup:',
    doesNotCoverItems: [
      'Pelecehan seksual di tempat kerja – hal ini ditangani berdasarkan Kebijakan Anti-Perundungan dan Pelecehan NGO',
      'Kekhawatiran safeguarding di masyarakat luas yang tidak dilakukan oleh [NGO] atau personel yang berasosiasi dengannya',
    ],
    whatIsSafeguardingHeading: 'Apa itu safeguarding?',
    whatIsSafeguardingParagraphs: [
      'Di Inggris, safeguarding berarti melindungi kesehatan, kesejahteraan, dan hak asasi manusia, serta memungkinkan mereka hidup bebas dari bahaya, penyalahgunaan, dan penelantaran.',
      'Dalam sektor kami, safeguarding dipahami sebagai upaya melindungi masyarakat, termasuk anak-anak dan orang dewasa berisiko, dari bahaya yang timbul akibat kontak mereka dengan staf atau program kami.',
      'Definisi lebih lanjut terkait safeguarding disediakan pada glosarium di bawah ini.',
    ],
    scopeHeading: 'Lingkup',
    scopeItems: [
      'Seluruh staf yang dikontrak oleh [NGO]',
      'Personel yang berasosiasi selama terlibat dalam pekerjaan atau kunjungan terkait [NGO], termasuk namun tidak terbatas pada: konsultan; relawan; kontraktor; pengunjung program termasuk jurnalis, tokoh publik, dan politisi',
    ],
    footnotes: [
      'Lihat ‘Lingkup’ untuk definisi personel yang berasosiasi.',
      'Beberapa LSM kini turut memasukkan perundungan dan pelecehan di tempat kerja ke dalam cakupan safeguarding mereka, karena hal ini berkaitan dengan bahaya yang timbul akibat kontak dengan staf atau program kami. Namun, prosedur penanganan perundungan dan pelecehan di tempat kerja kemungkinan berbeda, mengingat adanya perbedaan hukum dan ketentuan perundang-undangan dalam menangani insiden di tempat kerja.',
      'NHS ‘What is Safeguarding? Easy Read’ 2011.',
    ],
  },
  lapor: {
    channelsHeading: 'Kami menyediakan beberapa kanal komunikasi untuk menyampaikan keluhan:',
    eligibilityHeading: 'Siapa saja yang bisa menggunakan kanal ini?',
    eligibilityItems: [
      'Pemangku kepentingan yang berada di lokasi proyek/program konservasi Indonesia',
      'Keluhan yang dibuat dengan itikad baik',
      'Komplain dibuat oleh perwakilan/orang yang mewakili seseorang/pihak yang terdampak oleh proyek',
      'Komplain yang dibuat selama implementasi proyek atau 2 tahun setelah proyek berakhir',
    ],
    processHeading: 'Bagaimana prosesnya?',
    processSteps: [
      {
        label: 'Pengajuan keluhan:',
        text: 'Anda dapat mengirimkan pengaduan kepada perwakilan kami di lapangan atau koordinator.',
      },
      {
        label: 'Pemeriksaan awal:',
        text: 'Kami memverifikasi kelengkapan dan kesesuaian keluhan.',
      },
      {
        label: 'Tindak lanjut:',
        text: 'Keluhan ditindaklanjuti berdasarkan tingkat risikonya — rendah, menengah, atau tinggi.',
      },
      {
        label: 'Resolusi:',
        text: 'Solusi yang disepakati diimplementasikan dengan transparansi penuh.',
      },
      {
        label: 'Implementasi:',
        text: 'Langkah-langkah penyelesaian diterapkan sesuai dengan rencana tindakan yang telah disepakati. Proses ini mencakup pemantauan untuk memastikan efektivitas solusi.',
      },
      {
        label: 'Penutupan:',
        text: 'Setelah solusi diterapkan dan hasilnya dievaluasi, keluhan dianggap selesai, dan laporan akhir disampaikan kepada pihak terkait.',
      },
    ],
    form: {
      anonymityLegend: 'Apakah anda ingin merahasiakan identitas anda?',
      anonymityOptions: ['Ya', 'Tidak'],
      nameLabel: 'Nama lengkap',
      emailLabel: 'Email',
      addressLabel: 'Alamat Kontak',
      phoneLabel: 'Nomor Kontak',
      messageLabel: 'Ceritakan keluhanmu?',
      submit: 'Lanjutkan Pengaduan',
    },
  },
  cta: {
    heading: ['Jadilah Bagian dari', 'Kisah Ini'],
    button: 'Tentang Kami',
    imageAlt: 'Empat relawan REKAM berjalan bersama membawa buku dan materi kampanye',
  },
};

const en: SafeguardingContent = {
  metaDescription:
    "Rekam Nusantara Foundation's commitment to protecting communities, partners, volunteers, and the environment from harm throughout the delivery of its programmes.",
  breadcrumb: {
    aria: 'Breadcrumb',
    home: 'Home',
    current: 'Safeguarding',
  },
  hero: {
    eyebrow: 'Rekam Safeguarding Policy',
    heading:
      'The policies, procedures, and culture put in place to protect vulnerable people, beneficiaries, and staff from harm, abuse, exploitation, and harassment.',
    imageAlt: 'Several people joining hands as a symbol of shared protection',
  },
  policy: {
    purposeLede:
      'The purpose of this policy is to protect people, particularly children, at risk adults and beneficiaries of assistance, from any harm that may be caused due to their coming into contact with [NGO]. This includes harm arising from:',
    purposeCauses: [
      'The conduct of staff or personnel associated with [NGO]',
      'The design and implementation of [NGO]’s programmes and activities',
    ],
    commitmentsBefore:
      'The policy lays out the commitments made by [NGO], and informs staff and associated personnel',
    commitmentsAfter: ' of their responsibilities in relation to safeguarding.',
    doesNotCover: 'This policy does not cover:',
    doesNotCoverItems: [
      'Sexual harassment in the workplace – this is dealt with under NGO’s Anti-Bullying and Harassment Policy',
      'Safeguarding concerns in the wider community not perpetrated by [NGO] or associated personnel',
    ],
    whatIsSafeguardingHeading: 'What is safeguarding?',
    whatIsSafeguardingParagraphs: [
      "In the UK, safeguarding means protecting peoples' health, wellbeing and human rights, and enabling them to live free from harm, abuse and neglect.",
      'In our sector, we understand it to mean protecting people, including children and at risk adults, from harm that arises from coming into contact with our staff or programmes.',
      'Further definitions relating to safeguarding are provided in the glossary below.',
    ],
    scopeHeading: 'Scope',
    scopeItems: [
      'All staff contracted by [NGO]',
      'Associated personnel whilst engaged with work or visits related to [NGO], including but not limited to the following: consultants; volunteers; contractors; programme visitors including journalists, celebrities and politicians',
    ],
    footnotes: [
      "See ‘Scope’ for definition of associated personnel.",
      'Some NGOs are now including workplace bullying and harassment in their safeguarding portfolio, as it relates to harm caused by coming into contact with our staff or programmes. However accompanying procedures for dealing with workplace bullying and harassment are likely to be different, due to legal and statutory differences in handling workplace incidents.',
      "NHS ‘What is Safeguarding? Easy Read’ 2011.",
    ],
  },
  lapor: {
    channelsHeading: 'We provide several communication channels for submitting complaints:',
    eligibilityHeading: 'Who can use this channel?',
    eligibilityItems: [
      'Stakeholders located within an Indonesian conservation project/programme site',
      'Complaints made in good faith',
      'Complaints made by a representative acting on behalf of a person or party affected by the project',
      'Complaints made during project implementation or within 2 years after the project ends',
    ],
    processHeading: 'What is the process?',
    processSteps: [
      {
        label: 'Submitting a complaint:',
        text: 'You can send your complaint to our field representative or coordinator.',
      },
      {
        label: 'Initial review:',
        text: 'We verify that the complaint is complete and appropriate.',
      },
      {
        label: 'Follow-up:',
        text: 'The complaint is followed up according to its risk level — low, medium, or high.',
      },
      {
        label: 'Resolution:',
        text: 'The agreed solution is implemented with full transparency.',
      },
      {
        label: 'Implementation:',
        text: 'Resolution steps are carried out in line with the agreed action plan. This process includes monitoring to ensure the solution is effective.',
      },
      {
        label: 'Closure:',
        text: 'Once the solution has been implemented and its results evaluated, the complaint is considered resolved, and a final report is shared with the relevant parties.',
      },
    ],
    form: {
      anonymityLegend: 'Would you like to keep your identity confidential?',
      anonymityOptions: ['Yes', 'No'],
      nameLabel: 'Full name',
      emailLabel: 'Email',
      addressLabel: 'Contact address',
      phoneLabel: 'Contact number',
      messageLabel: 'Tell us about your complaint',
      submit: 'Submit Complaint',
    },
  },
  cta: {
    heading: ['Be Part of', 'the Story'],
    button: 'About Us',
    imageAlt: 'Four REKAM volunteers walking together carrying books and campaign materials',
  },
};

const CONTENT: Record<Locale, SafeguardingContent> = { id, en };

export function safeguardingContent(locale: Locale): SafeguardingContent {
  return CONTENT[locale];
}

export type { SafeguardingContent };
