'use client';

import { useLocale } from '@/components/ui/AppLink';
import { t as dict } from '@/i18n/dictionary';

/* Radix does not supply this one; it is hand-written, as it was in the source.
 *
 * A plain <a href="#utama">, not a Link: this is a same-document fragment jump,
 * and routing it through the App Router would push a history entry for what the
 * browser already does natively.
 *
 * Split out of SiteShell purely so the shell can stay a server component — this
 * is the only string in it that follows the locale. It also fixes an
 * inconsistency in the source, where tentang.html declared lang="en" but its
 * skip link read Indonesian. */
export function SkipLink() {
  return (
    <a
      href="#utama"
      className="absolute left-1/2 top-[-100px] z-[200] -translate-x-1/2 rounded-b-[10px] bg-green-900 px-5 py-3 text-white no-underline transition-[top] duration-200 focus:top-0"
    >
      {dict(useLocale()).skipToContent}
    </a>
  );
}
