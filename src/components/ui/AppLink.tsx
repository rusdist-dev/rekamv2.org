'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeFromPath, withLocale } from '@/i18n/routing';

/* Every internal link on the site goes through here.
 *
 * The alternative was threading a `locale` prop from each page down to each
 * link — roughly twenty-five call sites plus the nav, every one of them a place
 * to forget it and silently drop an English reader back onto an Indonesian
 * page. Reading the locale off the URL means a link cannot be wrong: it is
 * always relative to the page it sits on.
 *
 * The cost is that these become client components. That is small — they are
 * styled anchors, and most already sat inside client components — and
 * usePathname resolves during SSR, so the prefix is in the server-rendered
 * HTML rather than being patched in after hydration. */

export function useLocale() {
  return localeFromPath(usePathname());
}

/** Prefix an href with the current locale. External and hash links pass through. */
export function useHref(href: string) {
  const locale = useLocale();
  return withLocale(locale, href);
}

type Props = Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'> & { href: string };

export function AppLink({ href, ...rest }: Props) {
  return <Link href={useHref(href)} {...rest} />;
}
