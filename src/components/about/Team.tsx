'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PORTRAITS } from '@/assets/team/portraits';
import type { Locale } from '@/i18n/config';
import { ourStoryContent } from '@/i18n/content/our-story';
import { cn } from '@/lib/cn';
import { ABOUT, pick, pickList, type TeamMember } from '@/lib/about/types';

/* The team grid and its bio dialog.
 *
 * The source shipped each bio inside a <details> so it was readable with no JS
 * at all, then upgraded that to one shared native <dialog> — which brought
 * focus trapping, Escape, the top layer and focus restoration from the
 * platform rather than hand-written code. Radix Dialog supplies the same, and
 * the progressive-enhancement half survives because RSC renders the bio text
 * into the HTML: see AboutTeamSection, which emits every bio as real markup.
 *
 * The dialog is provided at page level rather than per card, because the org
 * chart opens it too. In the old build that cross-wiring was done by JS
 * looking up a DOM button and firing trigger.click() on it — a synthetic event
 * as the interface between two blocks of the same file. */

export type Person = TeamMember;

type TeamApi = { open: (id: string) => void; has: (id: string) => boolean };
const TeamContext = createContext<TeamApi | null>(null);

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam harus dipakai di dalam <TeamProvider>');
  return ctx;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Two of the sixteen portraits are not on disk; initials stand in. */
function Portrait({ person, className }: { person: Person; className?: string }) {
  const src = person.photo ? PORTRAITS[person.photo] : undefined;
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          // green-800 not green-900: on --sage the latter measures 3.10:1.
          'grid aspect-[4/5] w-full place-items-center bg-sage font-display text-[2rem] text-green-800',
          className
        )}
      >
        {initials(person.name)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      sizes="(max-width: 720px) 50vw, 20vw"
      /* The sources are now all 4:5 themselves, so a 4:5 tile holds each photo
         whole at its own shape: cover has nothing left to crop, and contain
         would have nothing left to pad. Cover is still the one to use —
         it guarantees the tile is filled edge to edge even where a file is a
         hair off the ratio (jessica.jpg is 574×717, 0.8006), where contain
         would leave a hairline gap instead.
         No width/height here: the static imports carry their own intrinsic
         size, so there is nothing to restate and nothing to get wrong when a
         photo is re-uploaded at a different resolution. */
      className={cn('block aspect-[4/5] w-full object-cover', className)}
    />
  );
}

export function TeamProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const people = ABOUT.team;
  const copy = ourStoryContent(locale).org;
  const [openId, setOpenId] = useState<string | null>(null);

  const index = openId ? people.findIndex((p) => p.id === openId) : -1;
  const person = index >= 0 ? people[index] : null;

  // Wrap at both ends, so the arrows never dead-end — as the source did.
  const step = useCallback(
    (delta: number) => setOpenId(people[(index + delta + people.length) % people.length].id),
    [index, people]
  );

  const api = useMemo<TeamApi>(
    () => ({
      open: setOpenId,
      has: (id: string) => people.some((p) => p.id === id),
    }),
    [people]
  );

  return (
    <TeamContext.Provider value={api}>
      {children}

      <Dialog.Root open={Boolean(person)} onOpenChange={(o) => !o && setOpenId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                step(-1);
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                step(1);
              }
            }}
            /* The panel has a DEFINITE height from `sm` up, which is what lets
               the portrait fill its half edge to edge. Height had been
               max-h-[88vh], i.e. driven by the bio: let the portrait fill that
               and a long bio stretches it while a short one squashes it, which
               is the resizing this dialog started out doing. Pinning the height
               satisfies both at once — the portrait fills the panel AND is the
               same size for everyone. Below `sm` the portrait is not rendered,
               so the panel goes back to hugging its text.

               That height is no longer a round 34rem but derived, so the
               portrait column comes out at exactly 4:5 — the shape the source
               files are — and the photo fills it without being cropped or
               letterboxed. The columns are 2fr/3fr, so the column is 2/5 of the
               panel width W; 4:5 of that is W·(2/5)/0.8 = W/2. Both halves read
               from the same `min(52rem,92vw)` the width uses, so the ratio
               holds at every width. `max-h-[88vh]` still wins on a short
               viewport — a 4:5 portrait taller than the screen has to give
               somewhere — and there cover trims the top and bottom. */
            className="fixed left-1/2 top-1/2 z-[310] grid max-h-[88vh] w-[min(52rem,92vw)] -translate-x-1/2 -translate-y-1/2 grid-cols-1 overflow-hidden rounded-[16px] bg-paper sm:h-[calc(min(52rem,92vw)/2)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          >
            {person && (
              <>
                {/* Fills its column: `aspect-auto` drops Portrait's own 4:5 box
                    (cn merges it away) so h-full governs instead. The column is
                    itself 4:5 now — see the height on Dialog.Content — so cover
                    has nothing to crop here either, and the panel's definite
                    height keeps the column the same size for everyone. */}
                <div className="hidden h-full sm:block">
                  <Portrait person={person} className="aspect-auto h-full w-full object-cover" />
                </div>

                <div className="max-h-[88vh] overflow-y-auto p-[clamp(1.5rem,3vw,2.5rem)] sm:h-full sm:max-h-none">
                  <p className="m-0 font-label text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    {pick(person.role, locale)}
                  </p>
                  {/* The visible name IS the dialog's accessible name. A
                      separate sr-only Dialog.Title would give the panel two
                      level-2 headings saying the same thing. */}
                  <Dialog.Title className="mt-2 mb-0 font-display text-title-lg leading-[1.15] text-green-900">
                    {person.name}
                  </Dialog.Title>

                  <div className="mt-5">
                    {pickList(person.bio, locale).map((p) => (
                      <p key={p.slice(0, 40)} className="mt-0 mb-4 text-[0.95rem] leading-[1.75] text-ink-soft">
                        {p}
                      </p>
                    ))}
                  </div>

                  <nav aria-label={copy.switchProfileNav} className="mt-6 flex items-center gap-3 border-t border-green-ink/12 pt-4">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="cursor-pointer rounded-full border border-green-ink/25 px-4 py-2 text-[0.82rem] text-green-900 hover:border-green-700"
                    >
                      ← {copy.previous}
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="cursor-pointer rounded-full border border-green-ink/25 px-4 py-2 text-[0.82rem] text-green-900 hover:border-green-700"
                    >
                      {copy.next} →
                    </button>
                    <span aria-hidden="true" className="ml-auto text-[0.8rem] text-ink-soft">
                      {index + 1} / {people.length}
                    </span>
                  </nav>
                </div>

                <Dialog.Close
                  aria-label={copy.closeProfile}
                  className="absolute right-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-paper/80 text-[1.3rem] text-green-900 hover:bg-paper"
                >
                  ×
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </TeamContext.Provider>
  );
}

export function TeamGrid({ locale }: { locale: Locale }) {
  const people = ABOUT.team;
  const { open } = useTeam();
  const copy = ourStoryContent(locale).team;

  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-[clamp(1rem,2vw,1.75rem)] p-0 md:grid-cols-3 lg:grid-cols-4">
      {people.map((person) => (
        <li key={person.id}>
          <article>
            <span className="block overflow-hidden rounded-sm">
              <Portrait person={person} />
            </span>
            <h3 className="mt-3 mb-0 font-display text-title-sm leading-[1.25] text-green-900">
              {person.name}
            </h3>
            <p className="mt-1 mb-0 text-[0.82rem] leading-[1.45] text-ink-soft">{pick(person.role, locale)}</p>

            {person.bio[locale].length > 0 && (
              <button
                type="button"
                // The visible label repeats for every member; the accessible name
                // says whose profile it opens.
                aria-label={copy.readProfileAria(person.name)}
                onClick={() => open(person.id)}
                className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[0.82rem] font-semibold text-green-900 underline underline-offset-4"
              >
                {copy.readProfile}
              </button>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
