'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/* Snap-scrolling shelf, navigated with left/right buttons instead of a bare
   overflow-x scrollbar. Buttons step by one card's width (measured off the
   first <li>, not guessed) and fade out at whichever end has nothing left to
   reveal, so the affordance never dead-ends on an inert control. */
export function Slider({
  children,
  className,
  trackClassName,
}: {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('li');
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    const step = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      <ul
        ref={trackRef}
        className={cn(
          'm-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth p-0',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[&>li]:snap-start',
          trackClassName
        )}
      >
        {children}
      </ul>

      <SliderButton dir={-1} disabled={atStart} onClick={() => go(-1)} />
      <SliderButton dir={1} disabled={atEnd} onClick={() => go(1)} />
    </div>
  );
}

function SliderButton({ dir, disabled, onClick }: { dir: -1 | 1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === -1 ? 'Sebelumnya' : 'Berikutnya'}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'absolute top-[100px] z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full',
        'border-0 bg-white text-green-900 shadow-lg ring-1 ring-black/5 transition-all duration-200',
        'hover:-translate-y-[calc(50%+2px)] hover:bg-green-700 hover:text-white',
        'disabled:pointer-events-none disabled:opacity-0',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-[-50%]',
        dir === -1 ? 'left-2 sm:left-4' : 'right-2 sm:right-4'
      )}
    >
      <svg viewBox="0 0 24 24" className={cn('size-5', dir === -1 && 'rotate-180')} aria-hidden="true">
        <path
          d="M9 5l7 7-7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
