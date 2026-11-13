'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { Eyebrow, Wrap } from '@/components/ui/primitives';
import type { Locale } from '@/i18n/config';
import { NATURE_KEEPERS, type NatureKeeper } from '@/i18n/content/nature-keepers';

/** How many profiles show before "Load more" (two rows of three). */
const INITIAL_COUNT = 6;
/** Lines of description visible while a card is collapsed. */
const CLAMP_LINES = 5;
/** Must match the body text's leading below (leading-[1.65]). */
const LINE_HEIGHT_EM = 1.65;
const COLLAPSED_MAX = `${CLAMP_LINES * LINE_HEIGHT_EM}em`;

type Labels = { eyebrow: string; readMore: string; readLess: string; loadMore: string };

export function NatureKeepers({ locale, labels }: { locale: Locale; labels: Labels }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? NATURE_KEEPERS : NATURE_KEEPERS.slice(0, INITIAL_COUNT);
  const hasMore = NATURE_KEEPERS.length > INITIAL_COUNT;

  return (
    <section className="bg-white py-[clamp(3rem,7vw,6rem)]">
      <Wrap>
        <Eyebrow as="h2" className="border-b border-ink/20 pb-6">
          {labels.eyebrow}
        </Eyebrow>

        {/* items-start: an expanded card grows on its own, without
            stretching the other cards in its row. */}
        <ul className="m-0 mt-8 grid list-none items-start gap-x-[clamp(1rem,2vw,1.25rem)] gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((keeper) => (
            <KeeperCard key={keeper.id} keeper={keeper} locale={locale} labels={labels} />
          ))}
        </ul>

        {hasMore && !showAll && (
          <div className="mt-14 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="cursor-pointer rounded-[10px] border border-ink bg-transparent px-7 py-2.5 text-[0.95rem] uppercase text-green-900 transition-colors duration-200 hover:bg-green-900 hover:text-white"
            >
              {labels.loadMore}
            </button>
            <svg aria-hidden="true" viewBox="0 0 12 34" className="h-8 w-3 fill-none stroke-green-900">
              <path d="M6 0v32M1 27l5 5 5-5" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </Wrap>
    </section>
  );
}

function KeeperCard({ keeper, locale, labels }: { keeper: NatureKeeper; locale: Locale; labels: Labels }) {
  const c = keeper.copy[locale];
  const bodyId = useId();
  const innerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [overflows, setOverflows] = useState(true);

  /* Track the description's natural height so max-height can animate to an
     exact pixel value (CSS can't transition to `auto`). Re-measured on resize
     since wrapping changes with the column width. */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const measure = () => {
      const h = inner.scrollHeight;
      const lineH = parseFloat(getComputedStyle(inner).fontSize) * LINE_HEIGHT_EM;
      setFullHeight(h);
      setOverflows(h > lineH * CLAMP_LINES + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const expanded = open || !overflows;

  return (
    <li>
      <div className="relative aspect-[246/134] overflow-hidden rounded-sm bg-[#b7ccc5]">
        {keeper.image && (
          <Image
            src={keeper.image}
            alt={c.title}
            fill
            placeholder="blur"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>

      <h3 className="mt-5 mb-0 font-display text-[1.2rem] font-normal leading-[1.25] text-green-700">{c.title}</h3>

      <div
        id={bodyId}
        className="relative mt-5 overflow-hidden text-[0.85rem] leading-[1.65] text-ink-soft transition-[max-height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        style={{ maxHeight: expanded && fullHeight ? `${fullHeight}px` : COLLAPSED_MAX }}
      >
        <div ref={innerRef}>
          <p className="m-0">{c.tagline}</p>
          <p className="mt-3 mb-0">{c.body}</p>
          <ul className="mt-3 mb-0 list-disc space-y-1 pl-4">
            {c.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        {/* Soft fade on the cut-off line while collapsed. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[1.65em] bg-gradient-to-t from-white to-transparent transition-opacity duration-300 ${
            expanded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {overflows && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="mt-5 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[0.72rem] font-bold uppercase text-green-900"
        >
          {open ? labels.readLess : labels.readMore}
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            className={`size-2.5 fill-none stroke-current transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1.5 1.5l7 7M8.5 3v5.5H3" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </li>
  );
}
