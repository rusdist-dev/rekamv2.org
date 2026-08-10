import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display, Raleway } from 'next/font/google';
import { notFound } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, OG_LOCALE, isLocale, type Locale } from '@/i18n/config';
import { withLocale } from '@/i18n/routing';
import { SITE, SITE_URL } from '@/lib/site';
import '../globals.css';

/* This is the root layout, deliberately inside the [locale] segment rather than
 * at app/. A root layout must own <html>, and <html lang> has to follow the
 * locale — which only a segment that receives the locale param can do. Every
 * page routes through here; sitemap.ts, robots.ts and icon.svg sit outside it
 * because they are route handlers, not pages, and are locale-independent. */

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-raleway',
  display: 'swap',
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE.name} — ${SITE.tagline}`,
      template: `%s — ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    alternates: {
      canonical: withLocale(locale, '/'),
      /* hreflang, with x-default pointing at Indonesian — the unprefixed URLs
         are the ones that already exist and already rank. */
      languages: {
        id: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: OG_LOCALE[locale],
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      url: withLocale(locale, '/'),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: 'light',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // A path like /xx/berita would otherwise render as the default locale under a
  // nonsense prefix, and be indexed that way.
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  );
}
