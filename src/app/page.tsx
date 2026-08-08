import Link from 'next/link';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';

/* Placeholder home page. The real one arrives in Fase 3d together with the
   programme pages, because they share the 360-degree hero engine. Rendered
   inside the shell so the chrome can be reviewed against the old site now. */

export default function Home() {
  return (
    <SiteShell>
      <Wrap className="page-top pb-24">
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
    </SiteShell>
  );
}
