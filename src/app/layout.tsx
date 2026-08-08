import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display, Raleway } from 'next/font/google';
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
  title: {
    default: 'REKAM Nusantara Foundation — Documenting knowledge, preserving life',
    template: '%s — REKAM Nusantara Foundation',
  },
  description:
    'Dari puncak hutan hingga dasar laut, dari sungai kota hingga layar bioskop — REKAM bekerja di seluruh lanskap kehidupan Indonesia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${dmSans.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  );
}
