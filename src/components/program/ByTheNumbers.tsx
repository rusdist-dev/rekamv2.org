import { cn } from '@/lib/cn';

/* rekam.css:2852-3040.
 *
 * Each group is a heading plus a row of figures. The source cycled an accent
 * bar under the heading through five colours; the redesign drops that in
 * favour of a plain divider, so ACCENTS and the icon column are gone too —
 * every figure is now a fixed-size olive card, number first. */

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

// "20 km" -> a leading number with a trailing unit; "Rp 1.210.000.000" -> a
// leading currency prefix with the number after it. Told apart by whether the
// first token starts with a digit — the number itself always keeps its own
// span so its size can scale independently of whichever side the word sits on.
function splitValue(value: string) {
  const spaceAt = value.indexOf(' ');
  if (spaceAt === -1) return { prefix: undefined, number: value, suffix: undefined };
  const first = value.slice(0, spaceAt);
  const rest = value.slice(spaceAt + 1);
  return /^[0-9]/.test(first)
    ? { prefix: undefined, number: first, suffix: rest }
    : { prefix: first, number: rest, suffix: undefined };
}

// Long numbers (currency totals run to 13+ digits) would otherwise overflow
// the fixed-width card, so the number's own size scales down with its length
// and is allowed to wrap mid-string rather than push past the card's edge.
function numberSizeClass(number: string) {
  if (number.length > 9) return 'text-xl';
  if (number.length > 6) return 'text-3xl';
  if (number.length > 3) return 'text-4xl';
  return 'text-5xl';
}

// Every card is 190px wide by default, which fits a label into two or three
// lines. Prose wraps well short of its theoretical chars-per-line capacity
// (word boundaries leave slack line to line), so 45 characters is where real
// labels start reaching a fourth line — e.g. "Community from Lauk Rugun and
// Tamlambaloh Apalin Lauk involved" (62 chars). Past that, widening beats
// growing taller: the card spans two grid tracks, roughly doubling the line
// budget.
const WIDE_LABEL_THRESHOLD = 45;

// Height still has a 150px floor and grows from there for a longer label.
// flex-auto (not flex-1) keeps that content-based floor intact — flex-1
// zeroes out the flex-basis, which let long labels overflow past the box.
//
// Urban and ocean both swap the fixed olive card for a lighter one with the
// figures in ink rather than white — a request specific to those programmes'
// pages, not a redesign of the shared default. Ocean additionally never
// widens a long-label card to a second track (unlike urban/default): its
// longest label just wraps across more lines in the same 190px column.
function Figure({ item, variant = 'default' }: { item: StatItem; variant?: 'default' | 'urban' | 'ocean' }) {
  const { prefix, number, suffix } = splitValue(item.value);
  const wide = item.label.length > WIDE_LABEL_THRESHOLD;
  const isUrban = variant === 'urban';
  const isOcean = variant === 'ocean';
  const isLight = isUrban || isOcean;
  // Urban's one wide label ("Value of upcycled products…") needs the extra
  // track to stay on a single line — the shared col-span-2 wraps it to two.
  const span = isOcean ? 'col-span-1' : wide ? (isUrban ? 'col-span-3' : 'col-span-2') : 'col-span-1';
  return (
    <div className={cn('flex flex-col', span)}>
      <div
        className={cn(
          'flex min-h-[150px] flex-auto flex-col items-center justify-center rounded-md p-4 text-center',
          isUrban ? 'bg-[#f3ecde]' : isOcean ? 'bg-[#c6e9f4]' : 'bg-[#6b7a3d]'
        )}
      >
        <p
          className={cn(
            'm-0 flex flex-wrap items-baseline justify-center gap-1 leading-none tracking-[-0.02em]',
            isLight ? 'text-green-900' : 'text-white'
          )}
        >
          {prefix && <span className="text-base font-bold">{prefix}</span>}
          <span
            className={cn(
              'font-bold [overflow-wrap:anywhere]',
              isUrban && wide ? 'text-4xl' : numberSizeClass(number)
            )}
          >
            {number}
          </span>
          {suffix && <span className="text-base font-bold">{suffix}</span>}
        </p>
        <p
          className={cn(
            'mt-2 mb-0 text-[0.9rem] font-medium leading-[1.35]',
            isLight ? 'text-ink-soft' : 'text-white',
            isUrban && wide && 'whitespace-nowrap'
          )}
        >
          {item.label}
        </p>
      </div>
      {/* Names the figure's contents — the five hornbill species behind
          "52 jenis burung", the three mammals behind "3" — as a plain caption
          rather than the pill list the source used. */}
      {item.chips && (
        <p className="mt-2 mb-0 text-[0.7rem] leading-[1.4] text-ink-soft">{item.chips.join(' · ')}</p>
      )}
    </div>
  );
}

export function ByTheNumbers({
  groups,
  variant = 'default',
}: {
  groups: StatGroup[];
  variant?: 'default' | 'urban' | 'ocean';
}) {
  const pillWhen = variant === 'urban' || variant === 'ocean';
  return (
    <div className="grid gap-[clamp(2rem,4vw,3rem)]">
      {groups.map((group) => (
        <section key={group.heading} className="border-t border-green pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 font-sans text-base font-bold leading-[1.25] text-ink">{group.heading}</h3>
            {pillWhen && group.when && (
              <span className="rounded-full bg-olive/35 px-3 py-1 text-[0.72rem] font-semibold text-green-900">
                {group.when}
              </span>
            )}
          </div>
          {!pillWhen && group.when && (
            <p className="mt-1 mb-0 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
              {group.when}
            </p>
          )}

          {group.items.length > 0 && (
            // Fixed-width tracks, not auto-fill columns: a normal card takes
            // one track, a long-label card spans two, and everything else
            // wraps around it exactly as it would with plain flex-wrap.
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,190px)] gap-x-6 gap-y-6">
              {group.items.map((item) => (
                <Figure key={item.label || item.value} item={item} variant={variant} />
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
                    <tr key={row.join('|')} className={variant === 'ocean' ? 'bg-[#c6e9f4]/21' : undefined}>
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

          {group.note && <p className="mt-4 mb-0 text-[0.82rem] italic leading-[1.6] text-ink-soft">{group.note}</p>}
        </section>
      ))}
    </div>
  );
}
