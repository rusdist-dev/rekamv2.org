import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display, Raleway } from 'next/font/google';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

/* Self-hosted through next/font, which also retires the two <link rel="preconnect">
   tags and the fonts.googleapis.com request that sat on all 11 static pages.
   Beyond the obvious privacy and latency win, it removes a network dependency
   that would otherwise make screenshot comparison flaky. */
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

export const metadata: Metadata = {
  /* metadataBase is what makes every relative canonical, OG image and alternate
     below resolve to an absolute URL. Without it Next emits relative values,
     which crawlers and social scrapers cannot follow. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${dmSans.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  );
}
