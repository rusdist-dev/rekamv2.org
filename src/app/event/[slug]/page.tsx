import { Stub } from '@/components/chrome/Stub';

/* Two events exist today, and only as nav links that both pointed at the same
   file. Real slugs land in Fase 3c. */
export function generateStaticParams() {
  return [{ slug: 'cerita-laut-nusantara' }, { slug: 'bangga-papua' }];
}

export default function Page() {
  return <Stub title="Event" phase="Fase 3c" current="event" />;
}
