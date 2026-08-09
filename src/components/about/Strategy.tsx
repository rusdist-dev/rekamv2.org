'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { cn } from '@/lib/cn';

/* Strategic thinking.
 *
 * The source rebuilt a flat image as inline SVG so the four stages could drive
 * it: as a picture the diagram showed the layers but never said which was
 * which, and selecting a stage now lights up the ring it refers to.
 *
 * The tablist itself was hand-rolled — roving tabindex, arrow keys, Home and
 * End, aria-selected kept in sync by hand. Radix Tabs supplies all of that,
 * so what is left here is the wiring between the selected tab and the diagram. */

type Step = 'strategies' | 'strengths' | 'actions' | 'outcomes';

const STEPS: { id: Step; n: number; label: string; body: React.ReactNode }[] = [
  {
    id: 'strategies',
    n: 1,
    label: 'Key strategies',
    body: (
      <>
        <strong>Jejaring, kolaborasi, dan penguatan kapasitas.</strong> Lingkar terluar — tiga
        strategi kunci yang menopang seluruh kerja REKAM sejak 2013, dan alasan program-programnya
        bisa berjalan bersama pemerintah dan mitra.
      </>
    ),
  },
  {
    id: 'strengths',
    n: 2,
    label: 'Core strengths',
    body: (
      <>
        <strong>Sains, teknologi, seni, media, dan komunikasi.</strong> Pusat diagram — kekuatan
        inti yang dipakai untuk membaca persoalan sekaligus menyampaikannya, dan yang ditopang oleh
        strategi di lingkar luar.
      </>
    ),
  },
  {
    id: 'actions',
    n: 3,
    label: 'Actions',
    body: (
      <>
        <strong>Konservasi di tapak dan kebijakan.</strong> Lingkar tengah — inisiatif konservasi di
        lokasi yang penting secara ekologis maupun ekonomis, berjalan bersamaan dengan penyusunan
        kebijakan dan reformasi pengelolaan sumber daya alam.
      </>
    ),
  },
  {
    id: 'outcomes',
    n: 4,
    label: 'Outcomes',
    body: (
      <>
        <strong>Capaian konservasi dan dampak sosial-ekonomi.</strong> Ujung panah — hasil yang
        dituju, dan yang angka-angkanya bisa dibaca di halaman{' '}
        <a href="/program/forest" className="underline underline-offset-4">
          Forest
        </a>
        ,{' '}
        <a href="/program/urban" className="underline underline-offset-4">
          Urban
        </a>
        , dan{' '}
        <a href="/program/ocean" className="underline underline-offset-4">
          Ocean
        </a>
        .
      </>
    ),
  },
];

/** Dim every layer except the selected one. */
const layer = (active: boolean) =>
  cn('transition-opacity duration-300', active ? 'opacity-100' : 'opacity-25');

export function Strategy() {
  const [step, setStep] = useState<Step>('strategies');

  return (
    <Tabs.Root value={step} onValueChange={(v) => setStep(v as Step)}>
      <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2">
        <div>
          <p className="m-0 text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.4] text-green-900">
            Since our founding in 2013, we have utilized key strategies of networking,
            collaboration and capacity building to underpin our core strengths of science,
            technology, arts, media and communications.
          </p>
          <p className="mt-6 mb-0 text-lede leading-[1.75] text-ink-soft">
            This has enabled us to take action, such as developing conservation initiatives in
            ecologically and economically important locations, as well as formulating policies and
            spearheading reforms in the management of Indonesia natural resources — all leading to
            tangible conservation outcomes and socio-economic impacts.
          </p>
        </div>

        <div>
          <svg viewBox="0 0 300 300" role="img" aria-labelledby="sthink-title sthink-desc" className="w-full">
            <title id="sthink-title">Diagram pemikiran strategis REKAM</title>
            <desc id="sthink-desc">
              Tiga lapisan melingkar — jejaring, kolaborasi dan penguatan kapasitas di lingkar luar;
              konservasi di tapak dan kebijakan di lingkar tengah; sains, teknologi, seni, media dan
              komunikasi di pusat — mengarah ke capaian konservasi dan dampak sosial-ekonomi.
            </desc>
            <defs>
              <path id="arc-out-top" d="M32,150 A118,118 0 0 1 268,150" />
              <path id="arc-out-bot" d="M28,150 A122,122 0 0 0 272,150" />
              <path id="arc-mid-top" d="M64,150 A86,86 0 0 1 236,150" />
              <path id="arc-mid-bot" d="M60,150 A90,90 0 0 0 240,150" />
            </defs>

            <g className={layer(step === 'strategies')}>
              <circle cx="150" cy="150" r="120" fill="var(--color-sage)" />
              <text className="fill-green-900 font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-out-top" startOffset="50%">
                  NETWORKING · COLLABORATION
                </textPath>
              </text>
              <text className="fill-green-900 font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-out-bot" startOffset="50%">
                  &amp; CAPACITY DEVELOPMENT
                </textPath>
              </text>
            </g>

            <g className={layer(step === 'actions')}>
              <circle cx="150" cy="150" r="88" fill="var(--color-sage-deep)" />
              <text className="fill-green-900 font-label text-[10px] font-semibold tracking-[0.12em]" textAnchor="middle">
                <textPath href="#arc-mid-top" startOffset="50%">
                  CONSERVATION AT SITES
                </textPath>
              </text>
              <text className="fill-green-900 font-label text-[10px] font-semibold tracking-[0.12em]" textAnchor="middle">
                <textPath href="#arc-mid-bot" startOffset="50%">
                  POLICY AND REFORM
                </textPath>
              </text>
            </g>

            <g className={layer(step === 'strengths')}>
              <circle cx="150" cy="150" r="62" fill="var(--color-green-700)" />
              <text x="150" y="137" textAnchor="middle" className="fill-white font-label text-[11px] font-semibold tracking-[0.08em]">
                SCIENCE
              </text>
              <text x="150" y="154" textAnchor="middle" className="fill-white font-label text-[11px] font-semibold tracking-[0.08em]">
                TECH &amp; ART
              </text>
              <text x="150" y="171" textAnchor="middle" className="fill-white font-label text-[11px] font-semibold tracking-[0.08em]">
                MEDIA &amp; COMMS
              </text>
            </g>
          </svg>

          {/* Unlike the rings, this is text, so it is never dimmed. Fading it
              to match them measured 1.38:1 — the selection signal cannot be
              worth making a label unreadable. Colour carries it instead, and
              both states clear AA: green-900 at 4.75, ink-soft at 6.67. */}
          <p
            className={cn(
              'mt-3 mb-0 text-center text-[0.85rem] transition-colors duration-300',
              step === 'outcomes' ? 'font-semibold text-green-900' : 'font-medium text-ink-soft'
            )}
          >
            <span aria-hidden="true">↓</span> Capaian konservasi &amp; dampak sosial-ekonomi
          </p>
        </div>
      </div>

      <Tabs.List aria-label="Tahap pemikiran strategis" className="mt-10 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <Tabs.Trigger
            key={s.id}
            value={s.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] transition-colors duration-200',
              'border-green-ink/25 text-ink-soft hover:border-green-700',
              'data-[state=active]:border-green-900 data-[state=active]:bg-green-900 data-[state=active]:text-cream'
            )}
          >
            <span className="font-bold">{s.n}</span> {s.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {STEPS.map((s) => (
        /* forceMount keeps all four panels in the HTML, with Radix adding
           hidden to the inactive ones — which is what the source did. Without
           it Radix renders only the selected panel, so three quarters of this
           copy would vanish from the page for a crawler or a reader with
           JavaScript off. */
        <Tabs.Content
          key={s.id}
          value={s.id}
          forceMount
          className="mt-5 max-w-[70ch] text-sm leading-[1.75] text-ink-soft focus-visible:outline-2 data-[state=inactive]:hidden"
        >
          <p className="m-0">{s.body}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
