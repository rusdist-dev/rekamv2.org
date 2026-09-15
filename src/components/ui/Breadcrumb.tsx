import { Fragment } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import { cn } from '@/lib/cn';

/* Location-based breadcrumb, first written by hand on /safeguarding and
 * /berita/[slug] (rekam.css has no source rule for this — both are pages the
 * old static site never had). Centralised here once a third and fourth page
 * needed the identical markup, so every page composes the same "Home / …"
 * trail instead of re-typing the <nav> each time. */

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({
  items,
  ariaLabel,
  light = false,
  className,
}: {
  items: BreadcrumbItem[];
  ariaLabel: string;
  /** For a breadcrumb sitting over a photo hero, where the cream-panel ink tone would be unreadable. */
  light?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('mb-6 text-[0.78rem]', light ? 'text-white/75' : 'text-ink-soft', className)}
    >
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-2">
              /
            </span>
          )}
          {item.href ? (
            <AppLink
              href={item.href}
              className={cn('no-underline', light ? 'hover:text-white' : 'hover:text-green-900')}
            >
              {item.label}
            </AppLink>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
