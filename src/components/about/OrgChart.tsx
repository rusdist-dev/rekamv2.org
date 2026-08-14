'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { useState } from 'react';
import { Chip } from '@/components/ui/primitives';
import { useTeam } from '@/components/about/Team';
import { cn } from '@/lib/cn';
import { ABOUT, type OrgNode } from '@/lib/about/types';

/* The organisation chart.
 *
 * Rebuilt from the source's own rebuild: nested lists rather than a flat
 * image, so it is navigable by keyboard and readable by a screen reader, with
 * each unit opening on demand instead of showing all sixteen posts at once.
 *
 * Two things the source could not keep straight are now structural:
 *
 *   - The manager count was typed by hand into
 *     <span class="orgunit__count">N</span> and free to disagree with the list
 *     beneath it. It is managers.length.
 *   - Names linked to bios by matching a data-person attribute against the
 *     team section's rendered text. Two of them did not match, so those people
 *     were silently not clickable. The join is resolved at extraction now, and
 *     carries a ref or it does not — see scripts/extract-about.mjs. */



/* The connector — rekam.css:3102-3149, ported as utilities.
 *
 * One vertical spine down the left of the branch with a short stub into each
 * row, drawn with pseudo-elements so it survives reflow at any width and adds
 * nothing to the DOM or the accessibility tree.
 *
 * --org-indent drives the list's own padding, the stub's length and the spine's
 * offset from a single declaration, so the spine and the stubs cannot drift
 * apart. The left margin is what makes the spine emerge from beneath the
 * chairperson card instead of running down the page edge. */
const BRANCH =
  'mt-4 grid gap-2 ml-[clamp(1rem,2.5vw,2rem)] pl-[var(--org-indent)] [--org-indent:clamp(1.5rem,3.5vw,2.5rem)]';

/* The spine is drawn per row, not as one line down the list, so no single line
 * has to guess where to stop. Every row but the last runs its segment its full
 * height, which carries the line down into the row below; the last stops at its
 * own stub so nothing dangles past the final branch.
 *
 * --spine-top reaches up into the grid gap to meet the row above. The first row
 * reaches 0.25rem further, overlapping the chairperson card so the join reads as
 * connected rather than as two shapes that happen to touch. */
const SPINE_VARS = '[--spine-top:-0.5rem] [--spine-rise:0.5rem]';
const SPINE_VARS_FIRST = '[--spine-top:-1.25rem] [--spine-rise:1.25rem]';

const SPINE_FULL =
  'after:absolute after:left-[calc(var(--org-indent)*-1)] after:top-[var(--spine-top)] after:bottom-0 after:w-px after:bg-green-ink/25';

/* The last row's segment ends at its own stub. Both are measured from the row's
   centre, so they meet wherever that centre lands. */
const SPINE_STOP =
  'after:absolute after:left-[calc(var(--org-indent)*-1)] after:top-[var(--spine-top)] after:h-[calc(50%+var(--spine-rise))] after:w-px after:bg-green-ink/25';

/* top-1/2 rather than the source's hardcoded 1.9rem. That value was measured off
   one particular row, so it drifted the moment the row's padding or type size
   changed; half of the row's own height cannot.
 *
 * Both this and SPINE_STOP go on a bare wrapper around the card, never on the
 * card itself. An absolutely positioned box resolves against its containing
 * block's PADDING box, so hanging a connector off the bordered card offsets it
 * by the border width: the spine drew at x=133 on the borderless items and
 * x=134 on the cards, with 1-2px gaps where the two met. The wrapper has no
 * border, so it shares the item's edges exactly, and its height is the card's
 * height — which is what makes top-1/2 the card's centre. */
const STUB =
  'before:absolute before:left-[calc(var(--org-indent)*-1)] before:top-1/2 before:h-px before:w-[var(--org-indent)] before:bg-green-ink/25';

function PersonName({ person, isDark }: { person: { name: string; ref?: string }, isDark?: boolean }) {
  const { open, has } = useTeam();

  // No profile written for this person: plain text, exactly as before.
  if (!person.ref || !has(person.ref)) {
    return <span className={cn('font-display font-semibold text-lg', isDark ? 'text-white' : 'text-green-900')}>{person.name}</span>;
  }

  return (
    <button
      type="button"
      aria-label={`Baca profil ${person.name}`}
      onClick={() => open(person.ref!)}
      className={cn('font-display text-lg cursor-pointer border-0 bg-transparent p-0 text-left font-semibold underline underline-offset-4', isDark ? 'text-white decoration-green-100 hover:decoration-green-200' : 'text-green-900 decoration-green-ink/30 hover:decoration-green-700')}
    >
      {person.name}
    </button>
  );
}

export function OrgChart() {
  const nodes: OrgNode[] = ABOUT.org;
  const units = nodes.filter((n) => n.kind === 'unit');
  // The source opened the first unit so the interaction was discoverable
  // rather than a wall of closed rows.
  const [openIds, setOpenIds] = useState<string[]>(units[0]?.domId ? [units[0].domId] : []);

  const boards = nodes.filter((n) => n.kind === 'board');
  const chair = nodes.find((n) => n.kind === 'chair');
  const branch = nodes.filter((n) => n.kind === 'unit' || n.kind === 'leaf');

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <Chip onClick={() => setOpenIds(units.map((u) => u.domId!).filter(Boolean))}>Buka semua</Chip>
        <Chip onClick={() => setOpenIds([])}>Tutup semua</Chip>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {boards.map((b) => (
          <div key={b.role} className="rounded-[12px] border border-green-ink/15 bg-cream p-5">
            <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {b.role}
            </p>
            <p className="mt-2 mb-0 text-[0.95rem] leading-[1.6] text-green-900 flex justify-between">
              {b.people?.map((p, i) => (<span key={p}>{p}</span>))}
            </p>
          </div>
        ))}
      </div>

      {chair && (
        <div className="mt-4 rounded-[12px] border border-green-ink/15 bg-green-ink/75 p-5">
          <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-200">
            {chair.role}
          </p>
          <p className="mt-2 mb-0 text-[1rem] text-white">
            <PersonName person={chair.lead!} isDark={true} />
          </p>
        </div>
      )}

      <Accordion.Root type="multiple" value={openIds} onValueChange={setOpenIds} className={BRANCH}>
        {branch.map((node, i) => {
          const managers = node.managers ?? [];

          /* Which segment this row draws is a property of its position, so it
             comes from the index rather than a last-child selector — a leaf is
             a plain div and a unit is an Accordion.Item, and :last-child would
             have to hold across both. */
          const isFirst = i === 0;
          const isLast = i === branch.length - 1;
          const vars = isFirst ? SPINE_VARS_FIRST : SPINE_VARS;

          // A leaf has nobody reporting to it, so no toggle and no panel —
          // which is why it is not an accordion item at all. On the chart it is
          // still a peer of the directorates, so it sits on the same spine.
          if (node.kind === 'leaf') {
            return (
              <div key={node.role} className={cn('relative', vars, !isLast && SPINE_FULL)}>
                <div className={cn('relative', STUB, isLast && SPINE_STOP)}>
                  <div className="rounded-[12px] border border-green-ink/15 bg-white p-5">
                    <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                      {node.role}
                    </p>
                    <p className="mt-2 mb-0 text-[0.95rem]">
                      <PersonName person={node.lead!} />
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Accordion.Item
              key={node.domId}
              value={node.domId!}
              /* The spine spans the item, so an open manager panel carries it;
                 the stub is on the row box, which is what it points at. */
              className={cn('relative', vars, !isLast && SPINE_FULL)}
            >
              <div className={cn('relative', STUB, isLast && SPINE_STOP)}>
                {/* No overflow-hidden on the card: it clipped the stub, which by
                    design is drawn outside this box's left edge. */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-5 bg-white rounded-[12px] border border-green-ink/15">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                      {node.role}
                    </p>
                    <p className="mt-2 mb-0 text-[0.95rem]">
                      <PersonName person={node.lead!} />
                    </p>
                  </div>
                  <Accordion.Header className="m-0">
                    <Accordion.Trigger
                      className={cn(
                        'group flex cursor-pointer items-center gap-2 rounded-full border border-green-ink/25 bg-transparent px-4 py-2',
                        'text-[0.8rem] text-ink-soft hover:border-green-700 hover:text-green-900'
                      )}
                    >
                      {/* Derived, not typed. */}
                      <span className="font-bold text-green-900">{managers.length}</span> manajer
                      <span
                        aria-hidden="true"
                        className="ml-1 block size-[6px] -translate-y-px rotate-45 border-b-[1.5px] border-r-[1.5px] border-current transition-transform duration-200 group-data-[state=open]:translate-y-px group-data-[state=open]:-rotate-[135deg]"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                </div>
              </div>

              {/* forceMount for the same reason as the strategy panels: the
                  source kept every manager list in the DOM and hid it with the
                  hidden attribute, so all sixteen posts were readable without
                  JavaScript. Radix would otherwise mount only what is open. */}
              <Accordion.Content forceMount className="overflow-hidden data-[state=closed]:hidden ml-6 mt-2">
                <ul className="m-0 list-none pb-3 space-y-2">
                  {managers.map((m) => (
                    <li key={m.role} className="flex flex-col py-3 px-5 bg-white overflow-hidden rounded-[12px] border border-green-ink/15">
                      <span className="min-w-0 flex-1 text-[0.85rem] text-ink-soft">{m.role}</span>
                      <span className="text-[0.9rem]">
                        <PersonName person={m.person} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </div>
  );
}
