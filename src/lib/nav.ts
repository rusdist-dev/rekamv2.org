import events from '@/data/events.json';
import type { Locale } from '@/i18n/config';

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
  href: string;
  /* `label` is per-locale because it comes straight off events.json's
     bilingual `title` field (src/lib/content/schema.ts's `localized` shape) —
     this array is built once at module load, not per-request, so it can't
     just pick a language here. SiteHeader resolves `label[locale]` at
     render time via useLocale(). */
  children?: { label: Record<Locale, string>; href: string }[];
};

/** Left of the rail, beside the mark. Also the hero-state pill shortcuts. */
export const PROGRAMMES: NavItem[] = [
  { key: 'forest', href: '/program/forest' },
  { key: 'urban', href: '/program/urban' },
  { key: 'ocean', href: '/program/ocean' },
];

/** Right of the rail. */
export const EXPLORE: NavItem[] = [
  { key: 'tentang', href: '/tentang' },
  { key: 'berita', href: '/berita' },
  {
    key: 'event',
    href: '/event',
    /* Derived, not typed. The old nav listed two events — "Cerita Laut
       Nusantara" and "Bangga Papua" — and both hrefs pointed at the same
       event-detail.html, so clicking the second showed you the first. Only one
       event has ever had content. Reading the submenu off the collection makes
       a link that names something nonexistent impossible to write. */
    children: events.map((e) => ({ label: e.title, href: `/event/${e.slug}` })),
  },
  /* 'donasi' hidden from the navbar on request — the route, its #adopsi
     anchor, and /merch (previously reachable only via this item's
     "Fundraising Product" submenu) still exist and work when linked to
     directly; they're just no longer in the header or its mobile drawer. */
];

/** Every footer link's label, per locale. FOOTER_LINKS and FOOTER_SOCIAL
 *  carry proper names (sister sites, social platforms) so id and en repeat
 *  the same string; FOOTER_LEGAL and FOOTER_EXTRA are real UI copy. Kept as
 *  one shape across all four arrays — rather than plain strings for the
 *  untranslated ones — so SiteFooter's LinkColumn has a single way to read a
 *  label regardless of which column it's rendering. */
type FooterLink = { href: string; label: Record<Locale, string> };

/** Footer, from the block that was byte-identical across all eleven pages. */
export const FOOTER_LINKS: FooterLink[] = [
  { href: 'https://rangkong.org', label: { id: 'rangkong.org', en: 'rangkong.org' } },
  { href: 'https://inaturefilms.org', label: { id: 'inaturefilms.org', en: 'inaturefilms.org' } },
  { href: 'https://perikanan.org', label: { id: 'perikanan.org', en: 'perikanan.org' } },
  { href: 'https://rekamdiveacademy.id', label: { id: 'rekamdiveacademy.id', en: 'rekamdiveacademy.id' } },
];

/** Second, unlabelled column sitting beside FOOTER_LINKS under the same
 *  "Links" heading — site policy pages rather than sister projects. */
export const FOOTER_LEGAL: FooterLink[] = [
  { href: '/faq', label: { id: 'FAQ', en: 'FAQ' } },
  { href: '/brand-guideline', label: { id: 'Panduan Merek', en: 'Brand Guideline' } },
  { href: '/privacy-policy', label: { id: 'Kebijakan Privasi', en: 'Privacy Policy' } },
  { href: '/terms-of-service', label: { id: 'Syarat & Ketentuan', en: 'Term Of Service' } },
];

/** Third, unlabelled column sitting beside FOOTER_LEGAL under the same
 *  "Links" heading. "Safeguarding" stays English in both locales on
 *  purpose — see the standing note on that term's spelling. */
export const FOOTER_EXTRA: FooterLink[] = [
  { href: '/safeguarding', label: { id: 'Safeguarding', en: 'Safeguarding' } },
  { href: '/publication', label: { id: 'Publikasi', en: 'Publication' } },
];

export const FOOTER_SOCIAL: FooterLink[] = [
  { href: 'https://www.instagram.com/rekamnusantara/', label: { id: 'Instagram', en: 'Instagram' } },
  { href: 'https://www.facebook.com/RekamNusantara', label: { id: 'Facebook', en: 'Facebook' } },
  { href: 'https://www.youtube.com/channel/UCTDq1RHGEF4p_gxLOJtOIuA', label: { id: 'YouTube', en: 'YouTube' } },
  {
    href: 'https://www.linkedin.com/company/rekamnusantarafoundation/',
    label: { id: 'LinkedIn', en: 'LinkedIn' },
  },
];
