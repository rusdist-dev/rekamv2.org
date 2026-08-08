import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SvgSprite } from '@/components/chrome/SvgSprite';
import type { IconId } from '@/icons';
import type { NavKey } from '@/lib/nav';

/* The chrome every page wears: skip link, icon sprite, header, main, footer.
 * In the old build this was ~126 lines of byte-identical markup repeated on all
 * eleven pages — 36.8% of the site's HTML.
 *
 * Structure note: <header> and <main> stay direct siblings. The old CSS had
 * `.sidenav[data-reveal] ~ main .hero__inner` (rekam.css:244), a general
 * sibling combinator reaching from the header into main. That rule is gone now
 * — hero spacing is a prop on the hero itself — but keeping the shape means the
 * DOM still reads the way the rest of the site expects, and there is no wrapper
 * div between them to invent one later. */

export function SiteShell({
  children,
  hero = false,
  current = null,
  icons,
}: {
  children: React.ReactNode;
  /** true on the four pages with a 360-degree hero: header starts transparent */
  hero?: boolean;
  current?: NavKey | null;
  icons?: IconId[];
}) {
  return (
    <>
      <a
        href="#utama"
        className="absolute left-1/2 top-[-100px] z-[200] -translate-x-1/2 rounded-b-[10px] bg-green-900 px-5 py-3 text-white no-underline transition-[top] duration-200 focus:top-0"
      >
        Lewati ke konten utama
      </a>

      <SvgSprite icons={icons} />
      <SiteHeader hero={hero} current={current} />

      <main id="utama">{children}</main>

      <SiteFooter />
    </>
  );
}
