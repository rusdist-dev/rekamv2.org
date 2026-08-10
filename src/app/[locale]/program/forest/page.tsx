import type { Metadata } from 'next';
import art from '@/assets/card-forest.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/program/forest', {
    title: 'Forest',
    description:
      'Memetakan apa yang masih berdiri, bersama orang-orang yang menjaganya tetap berdiri.',
  });
}

export default function Page() {
  return (
    <ProgramPage
      program="forest"
      art={art}
      icons={['i-people', 'i-map', 'i-post', 'i-route', 'i-helmet', 'i-board', 'i-station', 'i-book', 'i-binocs', 'i-bird', 'i-paw', 'i-nest', 'i-tree']}
    />
  );
}
