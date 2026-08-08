import { Stub } from '@/components/chrome/Stub';
import type { NavKey } from '@/lib/nav';

const PROGRAMS = ['forest', 'urban', 'ocean'] as const;

export function generateStaticParams() {
  return PROGRAMS.map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return <Stub title={title} phase="Fase 3d" current={slug as NavKey} />;
}
