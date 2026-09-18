import type { Locale } from './config';
import type { SceneName } from '@/lib/pano/pano-scenes';

/* The chrome dictionary.
 *
 * Scope is deliberate and worth stating plainly, because the boundary is not
 * where you would guess. What is here is the SHARED FURNITURE — everything in
 * SiteShell and the hero: skip link, brand mark, nav, search, language toggle,
 * footer, and the panorama engine's status copy. Every page wears all of it.
 *
 * What is NOT here, and is still Indonesian on /en:
 *
 *   - editorial content — eighteen team bios, the programme narratives, 155
 *     articles. A content-team project, not a migration task. What the
 *     migration owes is somewhere for that translation to land without code
 *     changes, which is `lang` on the news collection plus the fallback in
 *     listNews().
 *   - page-level interactive controls — the org-chart and bio-dialog buttons
 *     (about.tsx, Team.tsx, OrgChart.tsx), the strategy tablist, the Street
 *     View location picker, and the shop quantity and checkout form controls.
 *     These are page furniture rather than site furniture; they were left out
 *     of this pass rather than half-done, and they are the obvious next
 *     increment. Roughly forty strings, all mechanical.
 *
 * `partial` below exists for pages that want to say the second bullet out loud.
 * Nothing renders it yet — it is the hook, not the feature.
 *
 * The practical effect is less lopsided than it sounds: much of the editorial
 * copy is already English — the programme overviews, the article titles and
 * excerpts — while the chrome around it was Indonesian. /en mostly puts those
 * two in agreement.
 *
 * It also retires a real inconsistency. index.html shipped English nav labels
 * (Who We Are / Field Notes / Whats On / Take Part) while the other ten pages
 * shipped Indonesian. Those English strings were not lost — they are the /en
 * values below.
 */

type Dict = {
  skipToContent: string;
  /** Accessible name of the brand mark, which is a link home in header and footer. */
  brandHome: string;
  nav: { programme: string; explore: string; open: string; close: string; submenu: (label: string) => string };
  search: { label: string; placeholder: string; submit: string; noResults: string };
  lang: { group: string; switchTo: (label: string) => string };
  footer: { links: string; follow: string; channels: string; social: string; blurb: string; rights: string };
  nav_items: Record<'forest' | 'urban' | 'ocean' | 'tentang' | 'berita' | 'event' | 'donasi' | 'merch', string>;
  hero: { drag: string; play: string; pause: string; sound: string; recenter: string; loading: string; scroll: string };
  /* The panorama engine's own copy. It lives here rather than in Pano360.ts
     because the engine should not hold strings in one language, and the
     per-scene loader lines could not be translated in place at all:
     pano-scenes.js is the one file carried over byte-for-byte, so its
     `loading` field is read-only as far as this rewrite is concerned. The `id`
     values below therefore reproduce pano-scenes.js:1201-1237 exactly — the
     Indonesian output is unchanged, the strings just arrive from a different
     direction. */
  pano: {
    region: string;
    recenterAction: string;
    loadingScene: Record<SceneName, string>;
    webglUnsupported: string;
    saveData: string;
    slowConnection: (effectiveType: string) => string;
    noFootage: (src: string) => string;
  };
  common: {
    readMore: string;
    allNews: string;
    back: string;
    /** The programme pages' "Overview" / "Impact" section eyebrows — identical
     *  wording across forest/urban/ocean, so it lives here once rather than
     *  being repeated in each of src/i18n/content/{forest,urban,ocean}.ts. */
    overview: string;
    impact: string;
    /** The "Be Part of the Story" CTA band, duplicated identically across the
     *  home page, ProgramPage's shared (non-forest) branch, and both berita
     *  pages — genuinely shared chrome, not page-specific content.
     *  heading1/heading2 are the two visual lines of the heading. */
    storyBand: { heading1: string; heading2: string; shopCta: string; alt: string };
    /** The "Home" crumb and its <nav> accessible name, shared by every
     *  page-level Breadcrumb — the rest of the trail is page-specific. */
    breadcrumb: { ariaLabel: string; home: string };
  };
  /** Says which parts of the page are not translated yet. */
  partial: string;
};

const id: Dict = {
  skipToContent: 'Lewati ke konten utama',
  brandHome: 'REKAM Nusantara Foundation — beranda',
  nav: {
    programme: 'Program',
    explore: 'Jelajahi',
    open: 'Buka menu',
    close: 'Tutup menu',
    submenu: (label) => `Buka submenu ${label}`,
  },
  search: { label: 'Cari di situs REKAM', placeholder: 'Cari', submit: 'Cari', noResults: 'Menu tidak ditemukan' },
  lang: { group: 'Pilih bahasa', switchTo: (label) => `Beralih ke ${label}` },
  footer: {
    links: 'Unit Kami',
    follow: 'Ikuti Kami',
    channels: 'Unit dan kanal REKAM',
    social: 'Media sosial',
    blurb: 'Mendokumentasikan pengetahuan. Melestarikan kehidupan.',
    rights: '© 2022 Rekam Nusantara Foundation. Seluruh hak cipta dilindungi.',
  },
  nav_items: {
    forest: 'Forest',
    urban: 'Urban',
    ocean: 'Ocean',
    tentang: 'Tentang Kami',
    berita: 'Berita',
    event: 'Kegiatan',
    donasi: 'Donasi',
    merch: 'Merch',
  },
  hero: {
    drag: 'Seret untuk melihat sekeliling',
    play: 'Putar',
    pause: 'Jeda',
    sound: 'Suara',
    recenter: 'Pusatkan',
    loading: 'Menyiapkan panorama…',
    scroll: 'Gulir ke bawah',
  },
  pano: {
    region: 'Panorama 360 derajat. Gunakan tombol panah untuk melihat sekeliling.',
    recenterAction: 'Kembalikan sudut pandang',
    loadingScene: {
      coast: 'Menyiapkan panorama pesisir…',
      forest: 'Menyiapkan panorama hutan…',
      ocean: 'Menyiapkan panorama bawah laut…',
      urban: 'Menyiapkan panorama kota…',
    },
    webglUnsupported: 'Peramban ini tidak dapat memulai WebGL, jadi tampilan 360° tidak tersedia.',
    saveData: 'Mode hemat data aktif — menampilkan panorama prosedural.',
    slowConnection: (effectiveType) =>
      `Koneksi ${effectiveType} — menampilkan panorama prosedural agar halaman tetap ringan.`,
    noFootage: (src) => `Tidak ada footage di ${src} — menampilkan panorama prosedural.`,
  },
  common: {
    readMore: 'Baca selengkapnya',
    allNews: 'Lihat semua berita',
    back: 'Kembali',
    overview: 'Ikhtisar',
    impact: 'Dampak',
    storyBand: {
      heading1: 'Jadilah Bagian',
      heading2: 'dari Cerita Ini',
      shopCta: 'Belanja',
      alt: 'Empat relawan REKAM berjalan bersama membawa buku dan materi kampanye',
    },
    breadcrumb: { ariaLabel: 'Remah roti', home: 'Beranda' },
  },
  partial: '',
};

const en: Dict = {
  skipToContent: 'Skip to main content',
  brandHome: 'REKAM Nusantara Foundation — home',
  nav: {
    programme: 'Programme',
    explore: 'Explore',
    open: 'Open menu',
    close: 'Close menu',
    submenu: (label) => `Open ${label} submenu`,
  },
  search: { label: 'Search the REKAM site', placeholder: 'Search', submit: 'Search', noResults: 'No menu found' },
  lang: { group: 'Choose language', switchTo: (label) => `Switch to ${label}` },
  footer: {
    links: 'Our Units',
    follow: 'Follow Us',
    channels: 'REKAM units and channels',
    social: 'Social media',
    blurb: 'Documenting knowledge. Preserving life.',
    rights: '© 2022 Rekam Nusantara Foundation. All rights reserved.',
  },
  /* The labels index.html actually used, recovered rather than reinvented. */
  nav_items: {
    forest: 'Forest',
    urban: 'Urban',
    ocean: 'Ocean',
    tentang: 'Our Story',
    berita: 'Field Notes',
    event: 'Event',
    donasi: 'Take Part',
    merch: 'Shop',
  },
  hero: {
    drag: 'Drag to look around',
    play: 'Play',
    pause: 'Pause',
    sound: 'Sound',
    recenter: 'Recentre',
    loading: 'Preparing the panorama…',
    scroll: 'Scroll down',
  },
  pano: {
    region: '360-degree panorama. Use the arrow keys to look around.',
    recenterAction: 'Return to the starting view',
    loadingScene: {
      coast: 'Preparing the coastal panorama…',
      forest: 'Preparing the forest panorama…',
      ocean: 'Preparing the underwater panorama…',
      urban: 'Preparing the city panorama…',
    },
    webglUnsupported: 'This browser cannot start WebGL, so the 360° view is unavailable.',
    saveData: 'Data saver is on — showing the procedural panorama.',
    slowConnection: (effectiveType) =>
      `${effectiveType} connection — showing the procedural panorama to keep the page light.`,
    noFootage: (src) => `No footage at ${src} — showing the procedural panorama.`,
  },
  common: {
    readMore: 'Read more',
    allNews: 'See all news',
    back: 'Back',
    overview: 'Overview',
    impact: 'Impact',
    storyBand: {
      heading1: 'Be Part of',
      heading2: 'the Story',
      shopCta: 'Shop',
      alt: 'Four REKAM volunteers walking together carrying books and campaign materials',
    },
    breadcrumb: { ariaLabel: 'Breadcrumb', home: 'Home' },
  },
  partial:
    'Some editorial copy on this page has not been translated yet and is shown in Indonesian.',
};

const DICTS: Record<Locale, Dict> = { id, en };

export function t(locale: Locale): Dict {
  return DICTS[locale];
}

export type { Dict };
