import { ICONS, type IconId } from '@/icons';

/* One <symbol> per icon the page actually uses, emitted once at the top of the
 * body. Markup at the call site stays exactly what it was —
 *   <svg class="…"><use href="#i-arrow"/></svg>
 * — so currentColor still inherits, the reference stays same-document (no extra
 * request, no CORS), and the 44 icons live in one place instead of being
 * retyped per page.
 *
 * #i-arrow marks every card on every page, so it is always included. */
export function SvgSprite({ icons = [] }: { icons?: IconId[] }) {
  const wanted = [...new Set<IconId>(['i-arrow', ...icons])];

  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      {wanted.map((id) => (
        <symbol key={id} id={id} viewBox={ICONS[id].viewBox} dangerouslySetInnerHTML={{ __html: ICONS[id].body }} />
      ))}
    </svg>
  );
}

/** Convenience wrapper for <svg><use href="#id"/></svg>. */
export function Icon({ id, className }: { id: IconId; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`#${id}`} />
    </svg>
  );
}
