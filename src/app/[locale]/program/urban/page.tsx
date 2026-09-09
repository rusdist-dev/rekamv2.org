import type { Metadata } from 'next';
import art from '@/assets/card-urban.jpg';
import { ProgramPage } from '@/components/program/ProgramPage';
import { urbanContent } from '@/i18n/content/urban';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/program/urban', {
    title: 'Urban',
    description: urbanContent(locale).metaDescription,
  });
}

export default function Page({ params }: LocaleParams) {
  return (
    <ProgramPage
      program="urban"
      art={art}
      icons={['i-bin', 'i-recycle', 'i-brick', 'i-building', 'i-coins']}
      params={params}
    />
  );
}
