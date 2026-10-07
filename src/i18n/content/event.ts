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
    /* `heading` is for the curated rail — events.json's explicit slugs, which
       really are earlier editions. `relatedHeading` replaces it when the rail
       falls back to the event's category, where the posts are related
       coverage and calling them past editions would be untrue. */
    documentation: { eyebrow: string; heading: string; relatedHeading: string };
    cta: { support: string; contact: string };
    /* The CTA band for a CMS event. events.json writes its own `cta` prose;
       the API has no such field, only a registration_url, so the band's copy
       is UI chrome here and the event's name is interpolated into it. */
    register: { title: (event: string) => string; lede: string };
    /* The closing band every event detail page ends on. Its heading is
       always the event's own name, so it reads the same whether the event
       comes from events.json or the CMS; events.json may still override the
       lede and add a note through its own `cta`. */
    join: { title: (event: string) => string; lede: string };
  };
  /* Labels for the facts strip. events.json stores label and value together
     as typed-out copy; a CMS row stores start_at / location / is_free / quota
     and the labels have to come from somewhere — here. */
  facts: {
    date: string;
    time: string;
    location: string;
    cost: string;
    quota: string;
    free: string;
    quotaValue: (n: number) => string;
  };
};

const id: EventContent = {
  metaDescription: 'Diskusi, pemutaran film, dan lokakarya dari seluruh program REKAM.',
  list: {
    heroTitle: 'Agenda Acara',
    eyebrow: 'Agenda',
    heading: 'Acara mendatang',
    count: (n) => `Menampilkan ${n} acara.`,
  },
  detail: {
    registerNow: 'Daftar sekarang',
    aboutEvent: 'Tentang acara',
    rundown: { heading: 'Susunan acara' },
    gains: { eyebrow: 'Yang Anda dapatkan', heading: 'Tiga hal yang dibawa pulang' },
    documentation: {
      eyebrow: 'Dokumentasi',
      heading: 'Dari rangkaian sebelumnya',
      relatedHeading: 'Liputan terkait',
    },
    cta: { support: 'Dukung acara ini', contact: 'Hubungi kami' },
    register: {
      title: (event) => `Daftar untuk ${event}`,
      lede: 'Pendaftaran acara ini dibuka lewat tautan resminya.',
    },
    join: {
      title: (event) => `Ikut serta di ${event}`,
      lede: 'Ikut ambil bagian dalam acara ini — dukung penyelenggaraannya, atau hubungi kami untuk informasi lebih lanjut.',
    },
  },
  facts: {
    date: 'Tanggal',
    time: 'Waktu',
    location: 'Lokasi',
    cost: 'Biaya',
    quota: 'Kuota',
    free: 'Gratis',
    quotaValue: (n) => `${n} peserta`,
  },
};

const en: EventContent = {
  metaDescription: 'Discussions, film screenings, and workshops from across REKAM’s programmes.',
  list: {
    heroTitle: "What's On",
    eyebrow: 'Agenda',
    heading: 'Upcoming events',
    count: (n) => `Showing ${n} event${n === 1 ? '' : 's'}.`,
  },
  detail: {
    registerNow: 'Register now',
    aboutEvent: 'About the event',
    rundown: { heading: 'Event schedule' },
    gains: { eyebrow: "What you'll gain", heading: "Three things you'll take home" },
    documentation: {
      eyebrow: 'Documentation',
      heading: 'From previous editions',
      relatedHeading: 'Related coverage',
    },
    cta: { support: 'Support this event', contact: 'Contact us' },
    register: {
      title: (event) => `Register for ${event}`,
      lede: "Sign-ups for this event are handled through its official link.",
    },
    join: {
      title: (event) => `Join ${event}`,
      lede: 'Take part in this event — support how it runs, or get in touch for more detail.',
    },
  },
  facts: {
    date: 'Date',
    time: 'Time',
    location: 'Location',
    cost: 'Cost',
    quota: 'Quota',
    free: 'Free',
    quotaValue: (n) => `${n} seats`,
  },
};

const CONTENT: Record<Locale, EventContent> = { id, en };

export function eventContent(locale: Locale): EventContent {
  return CONTENT[locale];
}

export type { EventContent };
