import { Icon } from '@/components/chrome/SvgSprite';
import type { IconId } from '@/icons';
import { cn } from '@/lib/cn';

/* rekam.css:2852-3040.
 *
 * Each group is a heading plus a row of figures, with the accent bar under the
 * heading cycling through five colours. The source did that with
 *   .bn__group:nth-of-type(5n + 1) { --bn-accent: var(--green-700) }
 * and .bn__group is a <section>, so :nth-of-type counted every <section>
 * sibling regardless of class — meaning one unrelated section between two
 * groups silently reshuffled the palette. Index arithmetic here instead. */

const ACCENTS = ['bg-green-700', 'bg-blue-deep', 'bg-rust', 'bg-olive-deep', 'bg-sage-deep'] as const;

export type StatItem = { icon?: string; value: string; label: string; chips?: string[] };
export type StatTable = { caption?: string; head: string[]; rows: string[][] };
export type PolicyItem = { status: string; title: string; ref: string };
export type StatGroup = {
  heading: string;
  when?: string;
  note?: string;
  headline: boolean;
  items: StatItem[];
  table?: StatTable;
  policy?: PolicyItem[];
};

function Figure({ item, big }: { item: StatItem; big?: boolean }) {
  return (
    <div>
      {item.icon && <Icon id={item.icon as IconId} className="mb-3 block size-7 fill-none stroke-green-900 stroke-[1.6]" />}
      <p
        className={cn(
          'm-0 font-bold leading-none tracking-[-0.02em] text-green-900',
          big ? 'text-display' : 'text-stat'
        )}
      >
        {item.value}
      </p>
      <p className="mt-[0.6rem] mb-0 text-xs font-medium leading-[1.45] text-ink-soft">{item.label}</p>
      {/* Names the figure's contents — the five hornbill species behind
          "52 jenis burung", the three mammals behind "3". */}
      {item.chips && (
        <ul className="mt-3 mb-0 flex list-none flex-wrap gap-2 p-0">
          {item.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-green-ink/25 px-3 py-1 text-[0.72rem] font-medium text-green-900"
            >
              {chip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ByTheNumbers({ groups }: { groups: StatGroup[] }) {
  return (
    <div className="grid gap-[clamp(2rem,4vw,3rem)]">
      {groups.map((group, i) => (
        <section key={group.heading} className="border-t border-green-ink/12 pt-6">
          <span aria-hidden="true" className={cn('mb-4 block h-[0.7rem] w-[0.7rem] rounded-[3px]', ACCENTS[i % ACCENTS.length])} />

          <h3 className="m-0 font-display text-title-sm leading-[1.25] text-green-900">{group.heading}</h3>
          {group.when && (
            <p className="mt-1 mb-0 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
              {group.when}
            </p>
          )}

          {group.items.length > 0 && (
            <div
              className={cn(
                'mt-6 grid gap-x-[clamp(1.5rem,3vw,2.5rem)] gap-y-8',
                group.headline ? '' : 'sm:grid-cols-2 lg:grid-cols-3'
              )}
            >
              {group.items.map((item) => (
                <Figure key={item.label || item.value} item={item} big={group.headline} />
              ))}
            </div>
          )}

          {group.table && (
            // Wide content scrolls inside its own box rather than pushing the
            // page sideways.
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-[0.9rem]">
                {/* Visually hidden in the source too: it is the only thing
                    describing this table to a screen reader. */}
                {group.table.caption && <caption className="sr-only">{group.table.caption}</caption>}
                <thead>
                  <tr>
                    {group.table.head.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-green-ink/25 pb-3 pr-6 font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.table.rows.map((row) => (
                    <tr key={row.join('|')}>
                      {row.map((cell, ci) => (
                        <td
                          key={cell + ci}
                          className={cn(
                            'border-b border-green-ink/12 py-3 pr-6 align-top text-ink-soft',
                            ci === 0 && 'font-semibold text-green-900'
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Regulations REKAM helped draft, with where each one has got to. */}
          {group.policy && (
            <ul className="mt-6 mb-0 list-none space-y-4 p-0">
              {group.policy.map((doc) => (
                <li key={doc.title} className="flex flex-wrap items-start gap-x-4 gap-y-2">
                  <span
                    className={cn(
                      'mt-1 shrink-0 rounded-full px-3 py-1 font-label text-[0.66rem] font-semibold uppercase tracking-[0.14em]',
                      doc.status.toLowerCase() === 'disahkan'
                        ? 'bg-green-700 text-white'
                        : 'border border-green-ink/30 text-ink-soft'
                    )}
                  >
                    {doc.status}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block font-sans text-[0.95rem] font-semibold leading-[1.45] text-green-900">
                      {doc.title}
                    </b>
                    {doc.ref && <span className="mt-1 block text-[0.8rem] text-ink-soft">{doc.ref}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {group.note && <p className="mt-4 mb-0 text-[0.82rem] leading-[1.6] text-ink-soft">{group.note}</p>}
        </section>
      ))}
    </div>
  );
}
