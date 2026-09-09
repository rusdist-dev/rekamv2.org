'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import type { Locale } from '@/i18n/config';
import { ourStoryContent, type OurStoryContent } from '@/i18n/content/our-story';
import { cn } from '@/lib/cn';

/* Strategic thinking.
 *
 * The source rebuilt a flat image as inline SVG so the four stages could drive
 * it: as a picture the diagram showed the layers but never said which was
 * which, and selecting a stage now lights up the ring it refers to.
 *
 * The tablist itself was hand-rolled — roving tabindex, arrow keys, Home and
 * End, aria-selected kept in sync by hand. Radix Tabs supplies all of that,
 * so what is left here is the wiring between the selected tab and the diagram.
 *
 * The short ALL-CAPS ring labels inside the SVG (CONSERVATION OUTCOMES,
 * NETWORKING · COLLABORATION, SCIENCE / TECH & ART / MEDIA & COMMS, …) are
 * deliberately left in English in both locales: each is set along a <textPath>
 * arc whose length was tuned for that exact string, and an Indonesian
 * translation would very likely overflow or wrap unpredictably along the
 * curve. The real, localized content is the intro paragraphs, the tab labels,
 * and the tab body copy below — plus the <title>/<desc> a11y text, which has
 * no such geometry constraint and is fully translated. */

type Step = 'strategies' | 'strengths' | 'actions' | 'outcomes';

/* Every step's body is `<strong>{lead}</strong> {rest}`, built from the
 * localized copy — except "outcomes", whose sentence ends with three inline
 * links out to the programme pages. Those three link labels ("Forest",
 * "Urban", "Ocean") are the same short English category names used in the
 * nav (FOREST / URBAN / OCEAN) and are kept unchanged across locale so a
 * reader can recognise them; only the connecting word before "Ocean" is
 * localized (`strategy.and`). */
function buildSteps(strategy: OurStoryContent['strategy']): { id: Step; n: number; label: string; body: React.ReactNode }[] {
  return [
    {
      id: 'strengths',
      n: 1,
      label: strategy.steps.strengths.label,
      body: (
        <>
          <strong>{strategy.steps.strengths.lead}</strong> {strategy.steps.strengths.rest}
        </>
      ),
    },
    {
      id: 'actions',
      n: 2,
      label: strategy.steps.actions.label,
      body: (
        <>
          <strong>{strategy.steps.actions.lead}</strong> {strategy.steps.actions.rest}
        </>
      ),
    },
    {
      id: 'strategies',
      n: 3,
      label: strategy.steps.strategies.label,
      body: (
        <>
          <strong>{strategy.steps.strategies.lead}</strong> {strategy.steps.strategies.rest}
        </>
      ),
    },
    {
      id: 'outcomes',
      n: 4,
      label: strategy.steps.outcomes.label,
      body: (
        <>
          <strong>{strategy.steps.outcomes.lead}</strong> {strategy.steps.outcomes.rest}{' '}
          <AppLink href="/program/forest" className="underline underline-offset-4">
            Forest
          </AppLink>
          ,{' '}
          <AppLink href="/program/urban" className="underline underline-offset-4">
            Urban
          </AppLink>
          , {strategy.and}{' '}
          <AppLink href="/program/ocean" className="underline underline-offset-4">
            Ocean
          </AppLink>
          .
        </>
      ),
    },
  ];
}

/** Dim every layer except the selected one. */
const layer = (active: boolean) =>
  cn('transition-opacity duration-300', active ? 'opacity-100' : 'opacity-15');

export function Strategy({ locale }: { locale: Locale }) {
  const copy = ourStoryContent(locale).strategy;
  const STEPS = buildSteps(copy);
  const [step, setStep] = useState<Step>('strengths');

  return (
    <Tabs.Root value={step} onValueChange={(v) => setStep(v as Step)}>
      <div className="grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2">
        <div>
          <p className="m-0 font-display text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.4] text-green-900">
            {copy.intro[0]}
          </p>
          <p className="mt-6 mb-0 text-lede leading-[1.75] text-ink-soft">
            {copy.intro[1]}
          </p>
        </div>

        <div>
          {/* The outcomes ring is added by growing the viewBox into negative
              coordinates rather than by re-centring the diagram. Keeping the
              centre at 150,150 leaves every existing radius and arc untouched;
              -20 -20 340 340 just puts 170 units between the centre and each
              edge, which is the room the fourth band needs. */}
          <svg viewBox="-20 -20 340 340" role="img" aria-labelledby="sthink-title sthink-desc" className="w-full">
            <title id="sthink-title">{copy.diagramTitle}</title>
            <desc id="sthink-desc">{copy.diagramDesc}</desc>
            <defs>
              <path id="arc-rim-top" d="M1,150 A149,149 0 0 1 299,150" />
              <path id="arc-rim-bot" d="M-3,150 A153,153 0 0 0 303,150" />
              <path id="arc-out-top" d="M32,150 A118,118 0 0 1 268,150" />
              <path id="arc-out-bot" d="M28,150 A122,122 0 0 0 272,150" />
              <path id="arc-mid-top" d="M64,150 A86,86 0 0 1 236,150" />
              <path id="arc-mid-bot" d="M60,150 A90,90 0 0 0 240,150" />
            </defs>

            {/* Outcomes was a line of text under the diagram with a ↓ into it.
                As a ring it takes green-900 rather than the green-700 of the two
                strategy bands, so the result still reads as a different kind of
                thing from the strategies that produce it. White on green-900
                measures 5.22:1.

                It now dims with the others when unselected, which the text
                version deliberately did not do (fading it measured 1.38:1). The
                trade is acceptable here only because it is a ring: the same
                opacity-15 already applies to the two bands inside it, and the
                wording survives in the tab panel below and in <desc> above, so
                nothing is only available in a dimmed layer. */}
            <g className={layer(step === 'outcomes')}>
              <circle cx="150" cy="150" r="152" fill="none" stroke="#224275" strokeWidth="30" />
              <text className="fill-white font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-rim-top" startOffset="50%">
                  CONSERVATION OUTCOMES
                </textPath>
              </text>
              <text className="fill-white font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-rim-bot" startOffset="50%">
                  &amp; SOCIO-ECONOMIC IMPACTS
                </textPath>
              </text>
            </g>

            <g className={layer(step === 'strategies')}>
              <circle cx="150" cy="150" r="121" fill="none" stroke='var(--color-green-700)' strokeWidth="30" />
              <text className="fill-white font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-out-top" startOffset="50%">
                  NETWORKING · COLLABORATION
                </textPath>
              </text>
              <text className="fill-white font-label text-[11px] font-semibold tracking-[0.14em]" textAnchor="middle">
                <textPath href="#arc-out-bot" startOffset="50%">
                  &amp; CAPACITY DEVELOPMENT
                </textPath>
              </text>
            </g>

            <g className={layer(step === 'actions')}>
              <circle cx="150" cy="150" r="90" fill="none" stroke='var(--color-green-700)' strokeWidth="29" />
              <text className="fill-white font-label text-[10px] font-semibold tracking-[0.12em]" textAnchor="middle">
                <textPath href="#arc-mid-top" startOffset="50%">
                  CONSERVATION AT SITES
                </textPath>
              </text>
              <text className="fill-white font-label text-[10px] font-semibold tracking-[0.12em]" textAnchor="middle">
                <textPath href="#arc-mid-bot" startOffset="50%">
                  POLICY AND REFORM
                </textPath>
              </text>
            </g>

            <g className={layer(step === 'strengths')}>
              {/* --color-yellow-500 is not one of this project's tokens; it was
                  resolving to Tailwind's stock yellow-500 (#eab308), the exact
                  thing the token block at the top of globals.css exists to keep
                  out. The brand token is --color-yellow, #fec901. */}
              <circle cx="150" cy="150" r="62" fill="var(--color-yellow)" />
              <text x="150" y="137" textAnchor="middle" className="font-label text-[11px] font-semibold tracking-[0.08em]">
                SCIENCE
              </text>
              <text x="150" y="151" textAnchor="middle" className="font-label text-[11px] font-semibold tracking-[0.08em]">
                TECH &amp; ART
              </text>
              <text x="150" y="165" textAnchor="middle" className="font-label text-[11px] font-semibold tracking-[0.08em]">
                MEDIA &amp; COMMS
              </text>
            </g>
          </svg>
        </div>
      </div>

      <Tabs.List aria-label={copy.tablistLabel} className="mt-10 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <Tabs.Trigger
            key={s.id}
            value={s.id}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[0.85rem] transition-colors duration-200',
              'border-green-ink/25 text-ink-soft hover:border-green-700',
              s.id === 'outcomes'
                ? 'data-[state=active]:border-[#224275] data-[state=active]:bg-[#224275] data-[state=active]:text-white'
                : 'data-[state=active]:border-green-900 data-[state=active]:bg-green-900 data-[state=active]:text-cream'
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
