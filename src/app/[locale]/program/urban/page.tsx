import type { Metadata } from 'next';
import art from '@/assets/card-urban.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/program/urban', {
    title: 'Urban',
    description: 'Ketika kota memberi ruang bagi yang hidup di dalamnya.',
  });
}

export default function Page() {
  return (
    <ProgramPage
      program="urban"
      art={art}
      icons={['i-bin', 'i-recycle', 'i-brick', 'i-building', 'i-coins']}
    />
  );
}
