import type { Metadata } from 'next';
import art from '@/assets/card-forest.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';
import { forestContent } from '@/i18n/content/forest';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/program/forest', {
    title: 'Forest',
    description: forestContent(locale).metaDescription,
  });
}

export default function Page({ params }: LocaleParams) {
  return (
    <ProgramPage
      program="forest"
      art={art}
      icons={['i-people', 'i-map', 'i-post', 'i-route', 'i-helmet', 'i-board', 'i-station', 'i-book', 'i-binocs', 'i-bird', 'i-paw', 'i-nest', 'i-tree']}
      params={params}
    />
  );
}
