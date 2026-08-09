'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PORTRAITS } from '@/assets/team/portraits';
import { cn } from '@/lib/cn';
import { ABOUT, type TeamMember } from '@/lib/about/types';

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

/** Six of the eighteen portraits are not on disk; initials stand in. */
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
      width={600}
      height={750}
      sizes="(max-width: 720px) 50vw, 20vw"
      className={cn('block aspect-[4/5] w-full object-cover', className)}
    />
  );
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const people = ABOUT.team;
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
            className="fixed left-1/2 top-1/2 z-[310] grid max-h-[88vh] w-[min(52rem,92vw)] -translate-x-1/2 -translate-y-1/2 grid-cols-1 overflow-hidden rounded-[16px] bg-paper sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]"
          >
            {person && (
              <>
                <div className="hidden sm:block">
                  <Portrait person={person} className="h-full" />
                </div>

                <div className="max-h-[88vh] overflow-y-auto p-[clamp(1.5rem,3vw,2.5rem)]">
                  <p className="m-0 font-label text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    {person.role}
                  </p>
                  {/* The visible name IS the dialog's accessible name. A
                      separate sr-only Dialog.Title would give the panel two
                      level-2 headings saying the same thing. */}
                  <Dialog.Title className="mt-2 mb-0 font-display text-title-lg leading-[1.15] text-green-900">
                    {person.name}
                  </Dialog.Title>

                  <div className="mt-5">
                    {person.bio.map((p) => (
                      <p key={p.slice(0, 40)} className="mt-0 mb-4 text-[0.95rem] leading-[1.75] text-ink-soft">
                        {p}
                      </p>
                    ))}
                  </div>

                  <nav aria-label="Pindah profil" className="mt-6 flex items-center gap-3 border-t border-green-ink/12 pt-4">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="cursor-pointer rounded-full border border-green-ink/25 px-4 py-2 text-[0.82rem] text-green-900 hover:border-green-700"
                    >
                      ← Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="cursor-pointer rounded-full border border-green-ink/25 px-4 py-2 text-[0.82rem] text-green-900 hover:border-green-700"
                    >
                      Berikutnya →
                    </button>
                    <span aria-hidden="true" className="ml-auto text-[0.8rem] text-ink-soft">
                      {index + 1} / {people.length}
                    </span>
                  </nav>
                </div>

                <Dialog.Close
                  aria-label="Tutup profil"
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

export function TeamGrid() {
  const people = ABOUT.team;
  const { open } = useTeam();

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
            <p className="mt-1 mb-0 text-[0.82rem] leading-[1.45] text-ink-soft">{person.role}</p>

            {person.bio.length > 0 && (
              <button
                type="button"
                // The visible label repeats eighteen times; the accessible name
                // says whose profile it opens.
                aria-label={`Baca profil ${person.name}`}
                onClick={() => open(person.id)}
                className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[0.82rem] font-semibold text-green-900 underline underline-offset-4"
              >
                Baca profil
              </button>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
