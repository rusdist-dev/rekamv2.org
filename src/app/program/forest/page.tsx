import type { Metadata } from 'next';
import art from '@/assets/card-forest.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';

export const metadata: Metadata = {
  alternates: { canonical: '/program/forest' },
  title: 'Forest',
  description:
    'Memetakan apa yang masih berdiri, bersama orang-orang yang menjaganya tetap berdiri.',
};

export default function Page() {
  return (
    <ProgramPage
      program="forest"
      art={art}
      icons={['i-people', 'i-map', 'i-post', 'i-route', 'i-helmet', 'i-board', 'i-station', 'i-book', 'i-binocs', 'i-bird', 'i-paw', 'i-nest', 'i-tree']}
    />
  );
}
