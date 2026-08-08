import { SiteShell } from '@/components/chrome/SiteShell';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import type { NavKey } from '@/lib/nav';

/* Placeholder for a route that exists so the URL structure is settled and
 * typedRoutes can check every internal link from day one, but whose content
 * arrives in a later phase.
 *
 * Locking the routes up front is deliberate: the old site had all 34 news links
 * pointing at the single file berita-detail.html, and no slug anywhere. Having
 * the real URLs exist before the pages are written makes that mistake
 * impossible to repeat.
 *
 * scripts/check-stubs.mjs fails the build if any of these survive to cutover. */

export function Stub({ title, phase, current }: { title: string; phase: string; current?: NavKey | null }) {
  return (
    <SiteShell current={current}>
      <Wrap className="page-top pb-24">
        <Eyebrow>Belum dikerjakan</Eyebrow>
        <Display as="h1" className="mt-4">
          {title}
        </Display>
        <Lede>Halaman ini dibangun pada {phase}. Rutenya sudah ada supaya tautan internal bisa diperiksa.</Lede>
      </Wrap>
    </SiteShell>
  );
}
