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



function PersonName({ person }: { person: { name: string; ref?: string } }) {
  const { open, has } = useTeam();

  // No profile written for this person: plain text, exactly as before.
  if (!person.ref || !has(person.ref)) {
    return <span className="font-semibold text-green-900">{person.name}</span>;
  }

  return (
    <button
      type="button"
      aria-label={`Baca profil ${person.name}`}
      onClick={() => open(person.ref!)}
      className="cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-green-900 underline decoration-green-ink/30 underline-offset-4 hover:decoration-green-700"
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
            <p className="mt-2 mb-0 text-[0.95rem] leading-[1.6] text-green-900">
              {b.people?.join(' · ')}
            </p>
          </div>
        ))}
      </div>

      {chair && (
        <div className="mt-4 rounded-[12px] border border-green-ink/15 bg-band p-5">
          <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            {chair.role}
          </p>
          <p className="mt-2 mb-0 text-[1rem]">
            <PersonName person={chair.lead!} />
          </p>
        </div>
      )}

      <Accordion.Root type="multiple" value={openIds} onValueChange={setOpenIds} className="mt-4 grid gap-2">
        {branch.map((node) => {
          const managers = node.managers ?? [];

          // A leaf has nobody reporting to it, so no toggle and no panel —
          // which is why it is not an accordion item at all.
          if (node.kind === 'leaf') {
            return (
              <div key={node.role} className="rounded-[12px] border border-green-ink/15 bg-white p-5">
                <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  {node.role}
                </p>
                <p className="mt-2 mb-0 text-[0.95rem]">
                  <PersonName person={node.lead!} />
                </p>
              </div>
            );
          }

          return (
            <Accordion.Item
              key={node.domId}
              value={node.domId!}
              className="overflow-hidden rounded-[12px] border border-green-ink/15 bg-white"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-5">
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

              {/* forceMount for the same reason as the strategy panels: the
                  source kept every manager list in the DOM and hid it with the
                  hidden attribute, so all sixteen posts were readable without
                  JavaScript. Radix would otherwise mount only what is open. */}
              <Accordion.Content forceMount className="overflow-hidden data-[state=closed]:hidden">
                <ul className="m-0 list-none border-t border-green-ink/12 p-5 pt-3">
                  {managers.map((m) => (
                    <li key={m.role} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-green-ink/8 py-3 last:border-b-0">
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
