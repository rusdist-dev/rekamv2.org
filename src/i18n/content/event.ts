import type { Locale } from '@/i18n/config';

/* Page-level copy for /event and /event/[slug]. Chrome-wide strings (nav,
 * footer, "read more") stay in `dictionary.ts`; the event data itself
 * (title, dates, about/agenda/gains/cta prose) is bilingual right on
 * src/data/events.json — see the `localized` shape in
 * src/lib/content/schema.ts. What's left here is the roughly fifteen
 * hardcoded UI labels the two templates add around that data: section
 * headings, buttons, and the "showing N events" counter.
 *
 * "Event" and "Agenda" and "Rundown" are left as bare literals in the
 * templates rather than entries here — they're the same word in Indonesian
 * and English, so giving them a dictionary entry would just be two copies of
 * one string. */

type EventContent = {
  metaDescription: string;
  list: {
    heroTitle: string;
    eyebrow: string;
    heading: string;
    count: (n: number) => string;
  };
  detail: {
    registerNow: string;
    aboutEvent: string;
    rundown: { heading: string };
    gains: { eyebrow: string; heading: string };
    documentation: { eyebrow: string; heading: string };
    cta: { support: string; contact: string };
  };
};

const id: EventContent = {
  metaDescription: 'Diskusi, pemutaran film, dan lokakarya dari seluruh program REKAM.',
  list: {
    heroTitle: 'Agenda Acara',
    eyebrow: 'Agenda',
    heading: 'Acara mendatang',
    count: (n) =>
      `Menampilkan ${n} acara. Agenda berikutnya menyusul ketika daftar ini tersambung ke CMS.`,
  },
  detail: {
    registerNow: 'Daftar sekarang',
    aboutEvent: 'Tentang acara',
    rundown: { heading: 'Susunan acara' },
    gains: { eyebrow: 'Yang Anda dapatkan', heading: 'Tiga hal yang dibawa pulang' },
    documentation: { eyebrow: 'Dokumentasi', heading: 'Dari rangkaian sebelumnya' },
    cta: { support: 'Dukung acara ini', contact: 'Hubungi kami' },
  },
};

const en: EventContent = {
  metaDescription: 'Discussions, film screenings, and workshops from across REKAM’s programmes.',
  list: {
    heroTitle: "What's On",
    eyebrow: 'Agenda',
    heading: 'Upcoming events',
    count: (n) =>
      `Showing ${n} event${n === 1 ? '' : 's'}. More dates land here once this list is connected to the CMS.`,
  },
  detail: {
    registerNow: 'Register now',
    aboutEvent: 'About the event',
    rundown: { heading: 'Event schedule' },
    gains: { eyebrow: "What you'll gain", heading: "Three things you'll take home" },
    documentation: { eyebrow: 'Documentation', heading: 'From previous editions' },
    cta: { support: 'Support this event', contact: 'Contact us' },
  },
};

const CONTENT: Record<Locale, EventContent> = { id, en };

export function eventContent(locale: Locale): EventContent {
  return CONTENT[locale];
}

export type { EventContent };
