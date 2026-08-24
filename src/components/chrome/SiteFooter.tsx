'use client';

import { Brand } from '@/components/chrome/Brand';
import { AppLink, useLocale } from '@/components/ui/AppLink';
import { t as dict } from '@/i18n/dictionary';
import { FOOTER_LEGAL, FOOTER_LINKS, FOOTER_SOCIAL } from '@/lib/nav';

/* rekam.css:943-992 and :1250-1271.
 *
 * This block was byte-identical across all eleven pages — 35 lines copied
 * verbatim, 385 lines in total. It is the single clearest case in the codebase
 * for a shared component.
 *
 * One deliberate departure from the source: the ground is --green-800 rather
 * than --green-900, and the copyright line sits at 0.7 rather than 0.55.
 * Cream on --green-900 measures 4.66:1 at FULL opacity, so the original's
 * 0.78 blurb (3.51), 0.55 copyright (2.52) and 0.7 heading (3.13) all failed
 * WCAG AA — confirmed by running axe against the old static site, where
 * donasi.html and index.html report exactly these nodes. --green-800 (#00522C)
 * was already in the palette as the button hover colour, so this stays inside
 * the brand while taking the three to 5.74 / 4.94 / 5.45.
 *
 * 'use client' only so it can read the locale off the URL — see AppLink.tsx.
 * There is no interactivity here. The alternative, headers() in middleware,
 * would have made every one of the 65 routes dynamic; threading a locale prop
 * would have touched fourteen pages. usePathname resolves during SSR, so the
 * translated strings are in the server-rendered HTML either way. */

/** `columns` is an array of link lists rendered side by side under one
 *  shared heading — the "Links" nav splits into two this way rather than
 *  getting a second, unlabelled heading of its own. */
function LinkColumn({
  heading,
  columns,
  label,
}: {
  heading: string;
  columns: { href: string; label: string }[][];
  label: string;
}) {
  return (
    <nav aria-label={label}>
      <p className="m-0 font-label text-[0.75rem] font-semibold uppercase tracking-[0.2em] opacity-70">{heading}</p>
      <div className="mt-2 flex gap-x-8">
        {columns.map((links, i) => (
          <ul key={i} className="m-0 list-none p-0 leading-[1.8]">
            {links.map((l) => (
              <li key={l.href}>
                <AppLink href={l.href} className="border-b border-transparent no-underline hover:border-current">
                  {l.label}
                </AppLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const T = dict(useLocale());

  return (
    <footer id="kontak" className="bg-green-800 py-[clamp(2rem,4vw,3rem)] text-white">
      <div
        className={
          'mx-auto grid w-full max-w-wrap items-start gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-[clamp(1.5rem,4vw,3rem)] px-gutter ' +
          // The brand column absorbs the free space so the two link columns sit
          // together on the right instead of being pushed apart by it.
          'grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto]'
        }
      >
        <div className="max-w-[26rem]">
          <Brand width={182} flat className="mb-[1.1rem] text-cream" />
          {/* The blurb is the foundation's own English strapline on all eleven
              source pages, so both dictionaries carry it unchanged. */}
          <p className="m-0 max-w-[34ch] text-[0.92rem] leading-[1.65] text-cream/78">
            {T.footer.blurb}
          </p>
          <p className="mt-[0.9rem] mb-0 text-[0.8rem] leading-[1.6] text-cream/70">
            {T.footer.rights}
          </p>
        </div>

        <LinkColumn heading={T.footer.links} columns={[FOOTER_LINKS, FOOTER_LEGAL]} label={T.footer.channels} />
        <LinkColumn heading={T.footer.follow} columns={[FOOTER_SOCIAL]} label={T.footer.social} />
      </div>
    </footer>
  );
}
