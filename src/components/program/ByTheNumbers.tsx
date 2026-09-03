import { cn } from '@/lib/cn';

/* rekam.css:2852-3040.
 *
 * Each group is a heading plus a row of figures. The source cycled an accent
 * bar under the heading through five colours; the redesign drops that in
 * favour of a plain divider, so ACCENTS and the icon column are gone too —
 * every figure is now an olive card, number first.
 *
 * Most groups hold two to four figures, so stacking every group full-width
 * left two thirds of each row empty. Groups are packed into a twelve-column
 * grid instead: a group asks for a share proportional to how many figures it
 * holds, rows fill left to right, and whatever is left over at the end of a
 * row is handed back to that row's groups so no gap survives. See
 * layoutGroups below. */

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

type Variant = 'default' | 'urban' | 'ocean';

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

// Long numbers (currency totals run to 13+ digits) would otherwise overflow a
// card that is now as narrow as ~140px in a three-across row, so the number's
// own size scales down with its length and is allowed to wrap mid-string
// rather than push past the card's edge.
function numberSizeClass(number: string) {
  if (number.length > 9) return 'text-lg';
  if (number.length > 6) return 'text-2xl';
  if (number.length > 3) return 'text-3xl';
  return 'text-4xl';
}

// Cards are fluid now, but a label past ~45 characters still reaches a fourth
// line at a normal track width — e.g. "Community from Lauk Rugun and
// Tamlambaloh Apalin Lauk involved" (62 chars). Past that, widening beats
// growing taller: the card counts as two tracks when the group is measured and
// spans two of them when it is drawn. Ocean is the exception — that
// programme's page keeps every card one track wide.
const WIDE_LABEL_THRESHOLD = 45;

const MAX_CARD_COLUMNS = 5; // beyond this a group wraps to a second card row
const CARD_MAX_WIDTH = 320; // px — keeps a lone card from stretching a whole row
const CARD_GAP = 12; // px — matches gap-3 on the card grid

function itemTracks(item: StatItem, variant: Variant) {
  return variant !== 'ocean' && item.label.length > WIDE_LABEL_THRESHOLD ? 2 : 1;
}

// Height has a 128px floor and grows from there for a longer label. flex-auto
// (not flex-1) keeps that content-based floor intact — flex-1 zeroes out the
// flex-basis, which let long labels overflow past the box.
//
// Urban and ocean both swap the olive card for a lighter one with the figures
// in ink rather than white — a request specific to those programmes' pages,
// not a redesign of the shared default.
// A group holding a single figure would otherwise leave three quarters of its
// row blank, so such a card is drawn as a band instead: shorter, full width,
// with the number beside the label rather than above it.
function Figure({
  item,
  variant = 'default',
  band = false,
}: {
  item: StatItem;
  variant?: Variant;
  band?: boolean;
}) {
  const { prefix, number, suffix } = splitValue(item.value);
  const wide = !band && itemTracks(item, variant) === 2;
  const isUrban = variant === 'urban';
  const isOcean = variant === 'ocean';
  return (
    <div className={cn('flex flex-col', wide && 'col-span-2')}>
      <div
        className={cn(
          'flex flex-auto flex-col items-center justify-center rounded-md border text-center',
          band ? 'min-h-[92px] gap-x-5 px-5 py-4 sm:flex-row sm:text-left' : 'min-h-[128px] px-3 py-4',
          isUrban ? 'border-green-900' : isOcean ? 'border-sky-700' : 'border-[#6b7a3d]'
        )}
      >
        <p
          className={cn(
            'm-0 flex flex-wrap items-baseline justify-center gap-1 leading-none tracking-[-0.02em]',
            isUrban ? 'text-green-900' : isOcean ? 'text-sky-700' : 'text-[#6b7a3d]'
          )}
        >
          {prefix && <span className="text-base font-bold">{prefix}</span>}
          <span
            className={cn(
              'font-bold [overflow-wrap:anywhere]',
              // A band has room across, so the length-based step-down that
              // keeps a narrow card from overflowing does not apply.
              band ? 'text-3xl' : numberSizeClass(number)
            )}
          >
            {number}
          </span>
          {suffix && <span className="text-base font-bold">{suffix}</span>}
        </p>
        <p
          className={cn(
            'mb-0 font-medium leading-[1.3]',
            band ? 'mt-2 text-[0.95rem] sm:mt-0' : 'mt-1.5 text-[0.82rem]',
            isUrban ? 'text-green-900' : isOcean ? 'text-sky-700' : 'text-[#6b7a3d]'
          )}
        >
          {item.label}
        </p>
      </div>
      {/* Names the figure's contents — the five hornbill species behind
          "52 jenis burung", the three mammals behind "3" — as a plain caption
          rather than the pill list the source used. */}
      {item.chips && (
        <p className="mt-1.5 mb-0 text-[0.7rem] leading-[1.35] text-ink-soft">{item.chips.join(' · ')}</p>
      )}
    </div>
  );
}

const COLUMNS = 12;

// A group's share of the row, before packing. A table or a policy list is wide
// content in its own right and always takes the full width; otherwise the
// share follows the number of card tracks — two cards want a third of the row,
// three a half, four two thirds, five or more the lot.
function desiredSpan(tracks: number, group: StatGroup) {
  // A policy list wants the full width; a table asks for two thirds so a small
  // group can sit alongside it, and widens to the full row when none does —
  // eight columns still clear the table's 34rem minimum at every width where
  // this grid is in play.
  if (group.policy && group.policy.length > 0) return COLUMNS;
  if (group.table) return 8;
  if (tracks >= 5) return COLUMNS;
  if (tracks === 4) return 8;
  if (tracks === 3) return 6;
  return 4;
}

// Groups run smallest first: the fewer figures a group holds, the earlier it
// is packed, so the narrow ones pair up at the top instead of being stranded
// one-per-row further down. A table or a policy list is full-width content no
// matter how few figures sits with it, so those groups go last regardless of
// count. Ties keep their order in the data.
function sortByFigureCount(groups: StatGroup[]) {
  const isWide = (g: StatGroup) => Boolean(g.table || (g.policy && g.policy.length > 0));
  return groups
    .map((group, i) => ({ group, i }))
    .sort(
      (a, b) =>
        Number(isWide(a.group)) - Number(isWide(b.group)) ||
        a.group.items.length - b.group.items.length ||
        a.i - b.i
    )
    .map((entry) => entry.group);
}

// Greedy left-to-right packing: a group starts a new row as soon as it no
// longer fits the current one, and the columns left over at the end of a row
// are shared out one at a time among that row's groups — so a two-card group
// beside a four-card one ends up 4 + 8 with no hole between them, and a group
// left alone on the last row widens to the full twelve.
function layoutGroups(unsorted: StatGroup[], variant: Variant) {
  const groups = (unsorted);
  const tracks = groups.map((g) => g.items.reduce((n, item) => n + itemTracks(item, variant), 0));
  const spans = groups.map((g, i) => desiredSpan(tracks[i], g));

  let rowStart = 0;
  let used = 0;
  const fillRow = (end: number) => {
    const len = end - rowStart;
    if (len <= 0) return;
    for (let leftover = COLUMNS - used, k = 0; leftover > 0; leftover--, k++) {
      spans[rowStart + (k % len)] += 1;
    }
  };
  spans.forEach((span, i) => {
    if (used + span > COLUMNS) {
      fillRow(i);
      rowStart = i;
      used = 0;
    }
    used += span;
  });
  fillRow(spans.length);

  return groups.map((group, i) => ({
    group,
    span: spans[i],
    columns: Math.max(1, Math.min(tracks[i], MAX_CARD_COLUMNS)),
    // One figure holding down two thirds of a row or more reads as a gap; it
    // is drawn as a band across that width instead.
    band: group.items.length === 1 && spans[i] >= 8,
  }));
}

// Tailwind only sees class names it can read in the source, so the computed
// span is looked up rather than interpolated.
const SPAN_CLASS: Record<number, string> = {
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

export function ByTheNumbers({
  groups,
  variant = 'default',
}: {
  groups: StatGroup[];
  variant?: Variant;
}) {
  const pillWhen = variant === 'urban' || variant === 'ocean';
  const laidOut = layoutGroups(groups, variant);
  return (
    <div className="grid gap-x-8 gap-y-[clamp(1.5rem,3vw,2.25rem)] lg:grid-cols-12">
      {laidOut.map(({ group, span, columns, band }) => (
        <section
          key={group.heading}
          className={cn('border-t border-green pt-4', SPAN_CLASS[span] ?? 'lg:col-span-12')}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 font-sans text-[0.95rem] font-bold leading-[1.25] text-ink">{group.heading}</h3>
            {pillWhen && group.when && (
              <span className="rounded-full bg-olive/35 px-2.5 py-0.5 text-[0.7rem] font-semibold text-green-900">
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
            // Two across on a phone, then as many tracks as the group has
            // figures — its column was sized for exactly that many, so the
            // cards fill it. The max-width only bites when a couple of cards
            // inherit a whole row; a lone figure is a band across the full
            // width instead and takes no cap at all.
            <div
              className={cn(
                'mt-3 grid gap-3 sm:[grid-template-columns:var(--cards)]',
                columns === 1 ? 'grid-cols-1' : 'grid-cols-2'
              )}
              style={
                {
                  '--cards': `repeat(${columns}, minmax(0,1fr))`,
                  maxWidth: band ? undefined : columns * CARD_MAX_WIDTH + (columns - 1) * CARD_GAP,
                } as React.CSSProperties
              }
            >
              {group.items.map((item) => (
                <Figure key={item.label || item.value} item={item} variant={variant} band={band} />
              ))}
            </div>
          )}

          {group.table && (
            // Wide content scrolls inside its own box rather than pushing the
            // page sideways.
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-[0.88rem]">
                {/* Visually hidden in the source too: it is the only thing
                    describing this table to a screen reader. */}
                {group.table.caption && <caption className="sr-only">{group.table.caption}</caption>}
                <thead>
                  <tr>
                    {group.table.head.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-green-ink/25 pb-2 pr-6 font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
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
                            'border-b border-green-ink/12 py-2 pr-6 align-top text-ink-soft',
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

          {/* Regulations REKAM helped draft, with where each one has got to.
              Two abreast once there is room, since each entry is a short line
              of text rather than a paragraph. */}
          {group.policy && (
            <ul className="mt-4 mb-0 grid list-none gap-3 p-0 md:grid-cols-2">
              {group.policy.map((doc) => (
                <li key={doc.title} className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 font-label text-[0.66rem] font-semibold uppercase tracking-[0.14em]',
                      doc.status.toLowerCase() === 'disahkan'
                        ? 'bg-green-700 text-white'
                        : 'border border-green-ink/30 text-ink-soft'
                    )}
                  >
                    {doc.status}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block font-sans text-[0.92rem] font-semibold leading-[1.4] text-green-900">
                      {doc.title}
                    </b>
                    {doc.ref && <span className="mt-0.5 block text-[0.78rem] text-ink-soft">{doc.ref}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {group.note && <p className="mt-3 mb-0 text-[0.8rem] italic leading-[1.55] text-ink-soft">{group.note}</p>}
        </section>
      ))}
    </div>
  );
}
