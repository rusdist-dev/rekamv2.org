import { AppLink } from '@/components/ui/AppLink';
import { cn } from '@/lib/cn';

/* Page-number windowing: always the first and last page, the current page and
 * its immediate neighbours, and an ellipsis to bridge whatever's skipped in
 * between — the standard archive-pager shape, so /berita's ~18 pages don't
 * render as an eighteen-wide row of links. */
function pageWindow(current: number, total: number): (number | 'ellipsis')[] {
  const kept = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of kept) {
    if (prev && p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  labels,
}: {
  currentPage: number;
  totalPages: number;
  /** Locale-free path, e.g. "/berita" — AppLink adds the /en prefix itself. */
  basePath: string;
  labels: { ariaLabel: string; prev: string; next: string };
}) {
  if (totalPages <= 1) return null;

  const edgeLinkClasses =
    'inline-flex h-10 items-center rounded-full border border-green-ink/15 px-4 text-[0.85rem] font-semibold text-green-900 no-underline transition-colors hover:bg-green-700 hover:text-white';
  const edgeDisabledClasses = 'inline-flex h-10 items-center rounded-full px-4 text-[0.85rem] font-semibold text-ink-soft/50';

  return (
    <nav aria-label={labels.ariaLabel} className="mt-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <AppLink href={pageHref(basePath, currentPage - 1)} className={edgeLinkClasses}>
          {labels.prev}
        </AppLink>
      ) : (
        <span className={edgeDisabledClasses} aria-disabled="true">
          {labels.prev}
        </span>
      )}

      <ul className="m-0 flex list-none items-center gap-1 p-0">
        {pageWindow(currentPage, totalPages).map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`ellipsis-${i}`} aria-hidden="true" className="px-1 text-ink-soft">
              …
            </li>
          ) : (
            <li key={p}>
              <AppLink
                href={pageHref(basePath, p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full text-[0.85rem] font-semibold no-underline transition-colors',
                  p === currentPage ? 'bg-green-700 text-white' : 'text-green-900 hover:bg-sage/50'
                )}
              >
                {p}
              </AppLink>
            </li>
          )
        )}
      </ul>

      {currentPage < totalPages ? (
        <AppLink href={pageHref(basePath, currentPage + 1)} className={edgeLinkClasses}>
          {labels.next}
        </AppLink>
      ) : (
        <span className={edgeDisabledClasses} aria-disabled="true">
          {labels.next}
        </span>
      )}
    </nav>
  );
}
