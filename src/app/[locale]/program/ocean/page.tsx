import type { Metadata } from 'next';
import art from '@/assets/card-ocean.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';
import { oceanContent } from '@/i18n/content/ocean';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/program/ocean', {
    title: 'Ocean',
    description: oceanContent(locale).metaDescription,
  });
}

export default function Page({ params }: LocaleParams) {
  return (
    <ProgramPage
      program="ocean"
      art={art}
      icons={['i-shield', 'i-area', 'i-map', 'i-people', 'i-clipboard', 'i-heart', 'i-cap', 'i-article', 'i-scroll', 'i-bulb', 'i-book', 'i-boat', 'i-ruler', 'i-board', 'i-laptop', 'i-megaphone']}
      params={params}
    />
  );
}
