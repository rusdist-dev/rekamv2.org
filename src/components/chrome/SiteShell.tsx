import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SkipLink } from '@/components/chrome/SkipLink';
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
  /* Single root element, deliberately.
   *
   * On navigation the App Router walks the route segment's top-level siblings
   * and calls scrollIntoView on each candidate to reset the scroll position.
   * Returning a fragment gave it five — skip link, sprite, header, main,
   * footer — and with scroll-behavior: smooth those became competing
   * animations rather than one instant jump. Whichever finished last won, so
   * navigation sometimes landed at the bottom of the page instead of the top.
   *
   * It was height-dependent, which is why it looked random: /program/ocean
   * (7139px) lost the race every time while the shorter programme pages never
   * did. One root gives the router one candidate at top: 0. */
  return (
    <div>
      <SkipLink />
      <SvgSprite icons={icons} />
      <SiteHeader hero={hero} current={current} />

      <main id="utama">{children}</main>

      <SiteFooter />
    </div>
  );
}
