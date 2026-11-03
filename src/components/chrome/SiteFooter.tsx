'use client';

import { Brand } from '@/components/chrome/Brand';
import { AppLink, useLocale } from '@/components/ui/AppLink';
import { t as dict } from '@/i18n/dictionary';
import { FOOTER_EXTRA, FOOTER_LEGAL, FOOTER_SOCIAL } from '@/lib/nav';
import type { Locale } from '@/i18n/config';

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

/** One list of footer links, and one column of the footer row.
 *
 *  It used to take an array OF lists so the policy links and the extras could
 *  sit side by side under a single heading. They are separate columns now:
 *  nested inside one flex item they kept their own tight gap while
 *  space-between widened the gaps on either side of that item, so the row read
 *  as two columns crammed together between two wide gaps. As siblings they get
 *  the same spacing as every other column.
 *
 *  `heading` is optional: the two link columns lost theirs when the unit links
 *  they used to sit beside were removed, and a heading still naming those
 *  units was worse than no heading at all. Each nav keeps its aria-label
 *  either way, so a screen reader still has a name for every landmark. */
function LinkColumn({
  heading,
  links,
  label,
  locale,
}: {
  heading?: string;
  links: { href: string; label: Record<Locale, string> }[];
  label: string;
  locale: Locale;
}) {
  return (
    <nav aria-label={label}>
      {heading && (
        <p className="m-0 font-label text-[0.75rem] font-semibold uppercase tracking-[0.2em] opacity-70">
          {heading}
        </p>
      )}
      <ul className={(heading ? 'mt-2 ' : '') + 'm-0 list-none p-0 leading-[1.8]'}>
        {links.map((l) => (
          <li key={l.href} className="flex items-baseline gap-2">
            <span aria-hidden="true" className="text-[1rem] opacity-70">
              &bull;
            </span>
            <AppLink href={l.href} className="border-b border-transparent no-underline hover:border-current">
              {l.label[locale]}
            </AppLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const locale = useLocale();
  const T = dict(locale);

  return (
    <footer id="kontak" className="bg-green-800 py-[clamp(2rem,4vw,3rem)] text-white">
      {/* Flex rather than grid, and deliberately so: each column should be as
          wide as its own content with the leftover width shared out evenly
          between them. A grid cannot express that here — the brand column used
          to hold the surplus as a 1fr track while its text is capped at 26rem,
          which pooled the slack into one gap mid-row once the unit links were
          removed, and `grid-cols-[auto_auto_auto]` is not a track list
          Tailwind v4 emits (verified against 4.3.3; it produces no rule at
          all, so the row silently falls back to one column). space-between on
          a flex row does it with core utilities — which is also why every
          column below is a direct child here rather than nested. */}
      <div className="mx-auto flex w-full max-w-wrap flex-col items-start gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-[clamp(1.5rem,4vw,3rem)] px-gutter md:flex-row md:justify-between">
        <div className="max-w-[26rem]">
          <Brand width={182} flat className="mb-[1.1rem] text-cream" />
          <p className="m-0 max-w-[34ch] text-[0.92rem] leading-[1.65] text-cream/78">
            {T.footer.blurb}
          </p>
          <p className="mt-[0.9rem] mb-0 text-[0.8rem] leading-[1.6] text-cream/70">
            {T.footer.rights}
          </p>
        </div>

        <LinkColumn links={FOOTER_LEGAL} label={T.footer.channels} locale={locale} />
        <LinkColumn links={FOOTER_EXTRA} label={T.footer.resources} locale={locale} />
        <LinkColumn heading={T.footer.follow} links={FOOTER_SOCIAL} label={T.footer.social} locale={locale} />
      </div>
    </footer>
  );
}
