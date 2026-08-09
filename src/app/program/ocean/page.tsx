import type { Metadata } from 'next';
import art from '@/assets/card-ocean.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';

export const metadata: Metadata = {
  alternates: { canonical: '/program/ocean' },
  title: 'Ocean',
  description: 'Menghitung apa yang diberikan laut, dan kepada siapa ia memberikannya.',
};

export default function Page() {
  return (
    <ProgramPage
      program="ocean"
      art={art}
      icons={['i-shield', 'i-area', 'i-map', 'i-people', 'i-clipboard', 'i-heart', 'i-cap', 'i-article', 'i-scroll', 'i-bulb', 'i-book', 'i-boat', 'i-ruler', 'i-board', 'i-laptop', 'i-megaphone']}
    />
  );
}
