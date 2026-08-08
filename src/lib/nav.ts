/* The nav, as data. This is what makes one drift structurally impossible:
 * index.html shipped English labels (Who We Are / Field Notes / Whats On /
 * Take Part) while the other ten pages shipped Indonesian (Tentang / Berita /
 * Event / Donasi). Ten pages beat one, and the site is Indonesian, so the
 * Indonesian labels are canonical.
 *
 * Shape note: the rail renders exactly two groups. The old nav-station.css
 * leaned on `.sidenav__panel > ul:first-of-type { order: 1 }` /
 * `:last-of-type { order: 2 }` to split them left and right — a rule that broke
 * silently if a third <ul> ever appeared. Here the two groups are named fields
 * rather than positional siblings, so a third group cannot be added by accident.
 */

export type NavKey = 'forest' | 'urban' | 'ocean' | 'tentang' | 'berita' | 'event' | 'donasi' | 'merch';

export type NavItem = {
  key: NavKey;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

/** Left of the rail, beside the mark. Also the hero-state pill shortcuts. */
export const PROGRAMMES: NavItem[] = [
  { key: 'forest', label: 'Forest', href: '/program/forest' },
  { key: 'urban', label: 'Urban', href: '/program/urban' },
  { key: 'ocean', label: 'Ocean', href: '/program/ocean' },
];

/** Right of the rail. */
export const EXPLORE: NavItem[] = [
  { key: 'tentang', label: 'Tentang', href: '/tentang' },
  { key: 'berita', label: 'Berita', href: '/berita' },
  {
    key: 'event',
    label: 'Event',
    href: '/event',
    children: [
      { label: 'Cerita Laut Nusantara', href: '/event/cerita-laut-nusantara' },
      { label: 'Bangga Papua', href: '/event/bangga-papua' },
    ],
  },
  {
    key: 'donasi',
    label: 'Donasi',
    href: '/donasi',
    children: [
      { label: 'Adopsi Pohon Pakan', href: '/donasi#adopsi' },
      { label: 'Fundraising Product', href: '/merch' },
    ],
  },
];

/** Footer, from the block that was byte-identical across all eleven pages. */
export const FOOTER_LINKS = [
  { href: 'https://rangkong.org', label: 'rangkong.org' },
  { href: 'https://inaturefilms.org', label: 'inaturefilms.org' },
  { href: 'https://perikanan.org', label: 'perikanan.org' },
  { href: 'https://rekamdiveacademy.id', label: 'rekamdiveacademy.id' },
];

export const FOOTER_SOCIAL = [
  { href: 'https://www.instagram.com/rekamnusantara/', label: 'Instagram' },
  { href: 'https://www.facebook.com/RekamNusantara', label: 'Facebook' },
  { href: 'https://www.youtube.com/channel/UCTDq1RHGEF4p_gxLOJtOIuA', label: 'YouTube' },
  { href: 'https://www.linkedin.com/company/rekamnusantarafoundation/', label: 'LinkedIn' },
];
