import type { Locale } from '@/i18n/config';

/* Page-level copy for /tentang ("Our Story" in the nav — the route itself is
 * unchanged). Chrome-wide strings stay in `dictionary.ts`; this is the body
 * content specific to this one page and the client components it renders
 * (Strategy, OrgChart, Team), split out per src/i18n/content/initiative.ts's
 * own convention (a typed `Content`, an `id` and `en` object, a
 * `xContent(locale)` getter).
 *
 * The 18 staff bios, roles, and unit blurbs are NOT duplicated here — they
 * live inline in src/data/about.json as `{ id, en }` pairs (see
 * src/lib/about/types.ts's `pick`/`pickList`), since mirroring their full
 * shape into this file would just be the same data twice. Everything else on
 * the page — headings, eyebrows, section intros, and the client components'
 * own UI microcopy (buttons, aria-labels, the strategy diagram) — lives here.
 *
 * A few of these English strings did not exist before this pass — the org
 * chart and team dialog controls ("Baca profil", "Buka semua", "Sebelumnya" …)
 * were hardcoded in Indonesian regardless of locale. Their `en` values here
 * are new, deliberately plain UI copy standing in as the English source of
 * truth; nothing about the real content (names, titles, facts) was invented. */

type StrategyStep = {
  label: string;
  lead: string;
  rest: string;
};

type OurStoryContent = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string };
  vision: { label: string; text: string };
  mission: { label: string; text: string };
  strategy: {
    eyebrow: string;
    intro: [string, string];
    diagramTitle: string;
    diagramDesc: string;
    tablistLabel: string;
    steps: {
      strengths: StrategyStep;
      actions: StrategyStep;
      strategies: StrategyStep;
      outcomes: StrategyStep;
    };
    and: string;
  };
  units: { eyebrow: string; heading: string; intro: string };
  org: {
    eyebrow: string;
    heading: string;
    expandAll: string;
    collapseAll: string;
    /** The word after the bold count in the accordion trigger, e.g. "managers". */
    managersLabel: (count: number) => string;
    switchProfileNav: string;
    previous: string;
    next: string;
    closeProfile: string;
    readProfile: (name: string) => string;
  };
  map: { eyebrow: string; tableAriaLabel: string; tableAlt: string };
  impactReport: {
    dateLabel: string;
    heading: string;
    paragraph: string;
    download: string;
    readOnline: string;
  };
  collaboration: { eyebrow: string; intro: string };
  team: {
    eyebrow: string;
    heading: string;
    intro: string;
    readProfile: string;
    readProfileAria: (name: string) => string;
  };
};

const id: OurStoryContent = {
  meta: {
    title: 'Tentang Kami',
    description:
      'Merekam dan menjaga kekayaan alam Nusantara untuk menumbuhkan kesadaran dan aksi kolektif demi keberlanjutan lingkungan dan masa depan Indonesia yang lebih baik. Visi, misi, strategi, struktur organisasi, dan tim di balik Rekam Nusantara Foundation.',
  },
  hero: {
    eyebrow: 'Yang kami kerjakan',
    title:
      'Merekam dan menjaga kekayaan hayati Indonesia melalui riset dan konservasi.',
  },
  vision: {
    label: 'Visi',
    text: 'Merekam dan menjaga warisan alam Nusantara yang luar biasa untuk menumbuhkan kesadaran dan aksi kolektif demi keberlanjutan lingkungan serta masa depan Indonesia yang lebih baik.',
  },
  mission: {
    label: 'Misi',
    text: 'Memadukan seni, sains, teknologi, dan kearifan tradisional untuk mewujudkan keberlanjutan lingkungan dan kesejahteraan manusia di seluruh Nusantara.',
  },
  strategy: {
    eyebrow: 'Pemikiran strategis',
    intro: [
      'Sejak didirikan pada 2013, kami memanfaatkan strategi kunci berupa jejaring, kolaborasi, dan penguatan kapasitas untuk memperkuat kekuatan inti kami di bidang sains, teknologi, seni, media, dan komunikasi.',
      'Hal ini memungkinkan kami untuk bertindak nyata, seperti mengembangkan inisiatif konservasi di lokasi-lokasi yang penting secara ekologis dan ekonomis, serta merumuskan kebijakan dan memelopori reformasi dalam pengelolaan sumber daya alam Indonesia — semuanya bermuara pada capaian konservasi dan dampak sosial-ekonomi yang nyata.',
    ],
    diagramTitle: 'Diagram pemikiran strategis REKAM',
    diagramDesc:
      'Empat lapisan melingkar, dari pusat ke luar — sains, teknologi, seni, media dan komunikasi di pusat; konservasi di tapak dan kebijakan di lingkar tengah; jejaring, kolaborasi dan penguatan kapasitas di lingkar luar; capaian konservasi dan dampak sosial-ekonomi di lingkar terluar.',
    tablistLabel: 'Tahap pemikiran strategis',
    steps: {
      strengths: {
        label: 'Kekuatan inti',
        lead: 'Sains, teknologi, seni, media, dan komunikasi.',
        rest: 'Kekuatan inti yang digunakan untuk membaca isu sekaligus mengomunikasikannya, ditopang oleh strategi pada lingkar-lingkar luar.',
      },
      actions: {
        label: 'Aksi',
        lead: 'Konservasi di tapak dan kebijakan.',
        rest: 'Inisiatif konservasi di lokasi-lokasi yang penting secara ekologis dan ekonomis, dijalankan bersamaan dengan penyusunan kebijakan dan reformasi pengelolaan sumber daya alam.',
      },
      strategies: {
        label: 'Strategi kunci',
        lead: 'Jejaring, kolaborasi, dan penguatan kapasitas.',
        rest: 'Tiga strategi kunci yang menopang seluruh kerja REKAM sejak 2013, dan menjadi alasan program-programnya dapat berjalan beriringan dengan pemerintah dan mitra.',
      },
      outcomes: {
        label: 'Capaian',
        lead: 'Capaian konservasi dan dampak sosial-ekonomi.',
        rest: 'Hasil yang ditopang oleh tiga lapisan di dalamnya, dilaporkan per program:',
      },
    },
    and: 'dan',
  },
  units: {
    eyebrow: 'Unit kami',
    heading: 'Unit program',
    intro: 'Enam unit menjalankan kerja REKAM di lapangan — mulai dari riset rangkong dan perikanan, penceritaan (storytelling), komunikasi, penegakan hukum sumber daya alam, hingga kota berkelanjutan.',
  },
  org: {
    eyebrow: 'Struktur organisasi',
    heading: 'Bagaimana kami terorganisasi',
    expandAll: 'Buka semua',
    collapseAll: 'Tutup semua',
    managersLabel: () => 'manajer',
    switchProfileNav: 'Pindah profil',
    previous: 'Sebelumnya',
    next: 'Berikutnya',
    closeProfile: 'Tutup profil',
    readProfile: (name) => `Baca profil ${name}`,
  },
  map: {
    eyebrow: 'Wilayah kerja kami',
    tableAriaLabel: 'Tabel cakupan kerja per unit — dapat digeser mendatar',
    tableAlt:
      'Tabel cakupan kerja empat unit: Rangkong Indonesia, FRCI, Natural Resources Crime Unit, dan Urban & Sustainability — pada tingkat nasional, provinsi/tapak, dan Wilayah Pengelolaan Perikanan',
  },
  impactReport: {
    dateLabel: 'Impact Report',
    heading: 'Impact Report 2025',
    paragraph:
      'Dunia terus menghadapi berbagai tantangan lingkungan. Perubahan iklim, degradasi sumber daya alam, dan kesenjangan sosial-ekonomi merupakan isu mendesak yang membutuhkan solusi yang inovatif dan berkelanjutan.',
    download: 'Unduh',
    readOnline: 'Baca daring',
  },
  collaboration: {
    eyebrow: 'Kolaborasi',
    intro: 'Kemitraan yang kuat kami bangun melalui hubungan baik, dialog terbuka, dan komunikasi yang efektif.',
  },
  team: {
    eyebrow: 'Tim kami',
    heading: 'Orang-orang di balik kerja ini',
    intro:
      'Kami adalah sekelompok pegiat lingkungan yang melakukan riset, menerbitkan publikasi ilmiah, dan menyebarluaskan kekayaan alam dan budaya Indonesia melalui konten audiovisual, teks, visual, dan grafis yang menarik untuk mengedukasi dan mendorong kesadaran publik.',
    readProfile: 'Baca profil',
    readProfileAria: (name) => `Baca profil ${name}`,
  },
};

const en: OurStoryContent = {
  meta: {
    title: 'About Us',
    description:
      'Championing Indonesia biodiversity through research and conservation. Vision, mission, strategy, organisation structure, and the team behind Rekam Nusantara Foundation.',
  },
  hero: {
    eyebrow: 'What we do',
    title: 'Championing Indonesia biodiversity through research and conservation.',
  },
  vision: {
    label: 'Vision',
    text: 'Capturing and preserving the extraordinary natural heritage of the archipelago to inspire collective awareness and action for environmental sustainability and a better future of Indonesia.',
  },
  mission: {
    label: 'Mission',
    text: 'Integrating art, science, technology and traditional wisdom to realize environmental sustainability and human welfare throughout the Indonesian archipelago.',
  },
  strategy: {
    eyebrow: 'Strategic thinking',
    intro: [
      'Since our founding in 2013, we have utilized key strategies of networking, collaboration and capacity building to underpin our core strengths of science, technology, arts, media and communications.',
      'This has enabled us to take action, such as developing conservation initiatives in ecologically and economically important locations, as well as formulating policies and spearheading reforms in the management of Indonesia natural resources — all leading to tangible conservation outcomes and socio-economic impacts.',
    ],
    diagramTitle: "REKAM's strategic thinking diagram",
    diagramDesc:
      'Four concentric layers, centre to edge — science, technology, arts, media and communications at the centre; conservation on-site and policy in the middle ring; networking, collaboration and capacity building in the outer ring; conservation outcomes and socio-economic impacts in the outermost ring.',
    tablistLabel: 'Strategic thinking stages',
    steps: {
      strengths: {
        label: 'Core strengths',
        lead: 'Science, technology, arts, media, and communications.',
        rest: 'The core strengths used to read issues as well as communicate them, underpinned by the strategies in the outer rings.',
      },
      actions: {
        label: 'Actions',
        lead: 'Conservation at sites and policy.',
        rest: 'Conservation initiatives in ecologically and economically important locations, carried out alongside policy-making and reform in the management of natural resources.',
      },
      strategies: {
        label: 'Key strategies',
        lead: 'Networking, collaboration, and capacity building.',
        rest: "The three key strategies underpinning all of REKAM's work since 2013, and the reason its programmes can run alongside government and partners.",
      },
      outcomes: {
        label: 'Outcomes',
        lead: 'Conservation outcomes and socio-economic impacts.',
        rest: 'The results underpinned by the three layers within it, reported per programme:',
      },
    },
    and: 'and',
  },
  units: {
    eyebrow: 'Our units',
    heading: 'Unit program',
    intro: "Six units carry out REKAM's work on the ground — from hornbill and fisheries research to storytelling, communications, natural-resource law enforcement, and sustainable cities.",
  },
  org: {
    eyebrow: 'Organization structure',
    heading: 'How we are organised',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    managersLabel: (count) => (count === 1 ? 'manager' : 'managers'),
    switchProfileNav: 'Switch profile',
    previous: 'Previous',
    next: 'Next',
    closeProfile: 'Close profile',
    readProfile: (name) => `Read profile ${name}`,
  },
  map: {
    eyebrow: 'Where we work',
    tableAriaLabel: 'Work-coverage table per unit — can be scrolled horizontally',
    tableAlt:
      'Work-coverage table for four units: Rangkong Indonesia, FRCI, Natural Resources Crime Unit, and Urban & Sustainability — at the national, provincial/site, and Fisheries Management Area (WPP) levels',
  },
  impactReport: {
    dateLabel: 'Impact Report',
    heading: 'Impact Report 2025',
    paragraph:
      'The world continues to face various environmental challenges. Climate change, natural resource degradation, and socio-economic disparities are urgent issues that require innovative and sustainable solutions.',
    download: 'Download',
    readOnline: 'Read online',
  },
  collaboration: {
    eyebrow: 'Collaboration',
    intro: 'Strong partnerships we build in good relationships, through open dialogue and effective communication.',
  },
  team: {
    eyebrow: 'Our team',
    heading: 'The people behind the work',
    intro:
      'We are a group of dedicated environmentalists who conduct research, publish scientific publications, and disseminate Indonesia natural and cultural treasures through engaging audiovisual, text, visual, and graphic content to educate and encourage public awareness.',
    readProfile: 'Read profile',
    readProfileAria: (name) => `Read profile ${name}`,
  },
};

const CONTENT: Record<Locale, OurStoryContent> = { id, en };

export function ourStoryContent(locale: Locale): OurStoryContent {
  return CONTENT[locale];
}

export type { OurStoryContent };
