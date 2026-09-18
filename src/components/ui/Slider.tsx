'use client';

import { Children, cloneElement, isValidElement, useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/* Snap-scrolling shelf, navigated with left/right buttons (or native swipe)
   instead of a bare overflow-x scrollbar. For an infinite loop, the track
   renders the items three times back to back (clone / original / clone) and
   starts scrolled into the middle (original) copy. Swiping or stepping past
   either end therefore glides straight into an identical-looking clone; once
   scrolling settles at the very start or end of the tripled track, we snap
   the position back by exactly one copy's width with scroll-behavior
   temporarily forced to "auto", so the reset is instant and invisible - the
   copies are pixel-identical, so nothing appears to move. */
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
  const items = Children.toArray(children);

  const recenter = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft += delta;
    el.style.scrollBehavior = '';
  };

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = el.scrollWidth / 3;
    el.style.scrollBehavior = '';
  }, [items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let settleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const third = el.scrollWidth / 3;
        if (third <= 0) return;
        if (el.scrollLeft <= 1) {
          recenter(third);
        } else if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          recenter(-third);
        }
      }, 120);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(settleTimer);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

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
        {[0, 1, 2].flatMap((copy) =>
          items.map((item, i) => (isValidElement(item) ? cloneElement(item, { key: `c${copy}-${item.key ?? i}` }) : item))
        )}
      </ul>

      <SliderButton dir={-1} onClick={() => go(-1)} />
      <SliderButton dir={1} onClick={() => go(1)} />
    </div>
  );
}

function SliderButton({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === -1 ? 'Sebelumnya' : 'Berikutnya'}
      onClick={onClick}
      className={cn(
        'absolute top-[100px] z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full',
        'border-0 bg-white text-green-900 shadow-lg ring-1 ring-black/5 transition-all duration-200',
        'hover:-translate-y-[calc(50%+2px)] hover:bg-green-700 hover:text-white',
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
