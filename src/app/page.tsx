import Link from 'next/link';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';

/* Placeholder. The real home page arrives in Fase 3d, together with the
   programme pages, because they share the 360-degree hero engine. */

export default function Home() {
  return (
    <Wrap className="py-24">
      <Eyebrow>Rewrite sedang berjalan</Eyebrow>
      <Display as="h1" className="mt-4">
        REKAM Nusantara
      </Display>
      <Lede>
        Situs lama masih utuh di <code>site/</code> sebagai acuan visual dan konten sampai
        cutover.
      </Lede>
      <p className="mt-8">
        <Link href="/design" className="text-green-700 underline underline-offset-4">
          Lihat token desain →
        </Link>
      </p>
    </Wrap>
  );
}
