'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Brand } from '@/components/chrome/Brand';
import { cn } from '@/lib/cn';
import { EXPLORE, PROGRAMMES, type NavItem, type NavKey } from '@/lib/nav';

/* Ported from nav-station.css — the only nav variant any page actually links.
 * (nav-bar, nav-card and nav-overlay were dead code: zero references across all
 * eleven pages. They are not reproduced.)
 *
 * Two states:
 *
 *   hero      Only on pages with a 360-degree hero, before it scrolls past.
 *             The bar is transparent, the mark is centred and painted white,
 *             and the Forest/Urban/Ocean pills sit under it. Past 24px both
 *             fade out, because they share the hero's centre line and the
 *             headline would otherwise slide straight through them.
 *   revealed  Everything else. A blurred, barely-tinted bar carrying a top
 *             utility strip (search + language) over a hairline, and the rail
 *             beneath it (mark, programmes, explore).
 *
 * The original built both out of one flex container using `display: contents`
 * on three wrappers plus eight hand-assigned `order` values — including
 * a zero-height `::before` whose only job was to force a flex wrap. That was
 * clever and extremely brittle. Here the two rows are simply two rows.
 */

const RAIL_LINK =
  'block py-[0.3rem] text-[0.78rem] font-medium tracking-[0.02em] lowercase leading-[1.4] ' +
  'whitespace-nowrap no-underline text-ink-soft transition-colors duration-200 hover:text-green-900 ' +
  // The underline grows from the left on hover, and stays out for the current page.
  'after:block after:h-px after:mt-[3px] after:bg-current after:origin-left after:scale-x-0 ' +
  'after:transition-transform after:duration-[250ms] after:ease-[cubic-bezier(0.2,0.7,0.3,1)] ' +
  'hover:after:scale-x-100 motion-reduce:after:transition-none';

function RailLink({ item, current }: { item: NavItem; current?: NavKey | null }) {
  const active = current === item.key;

  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(RAIL_LINK, active && 'text-green-900 after:scale-x-100')}
    >
      {item.label}
    </Link>
  );

  if (!item.children) return <li>{link}</li>;

  /* The parent stays a real link and the chevron beside it is the disclosure,
     so keyboard and touch each get an unambiguous target. That was a good call
     in the original and is preserved; Radix supplies the focus management,
     Escape and outside-click that were hand-rolled before. */
  return (
    <li className="relative flex items-center gap-1">
      {link}
      {/* modal={false} matters: the default marks everything outside the menu
          aria-hidden and locks body scroll, which is right for a dialog and
          wrong for a nav dropdown — it would hide the rest of the rail from
          assistive tech while the submenu is open. */}
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          aria-label={`Buka submenu ${item.label}`}
          className="group size-4 shrink-0 cursor-pointer border-0 bg-transparent p-0 text-ink-soft hover:text-green-900"
        >
          <span
            aria-hidden="true"
            className={
              'mx-auto block size-[5px] -translate-y-px rotate-45 border-b-[1.5px] border-r-[1.5px] ' +
              'border-current transition-transform duration-[250ms] ' +
              'group-data-[state=open]:translate-y-px group-data-[state=open]:-rotate-[135deg]'
            }
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={10}
            alignOffset={-14}
            className={
              'z-[200] min-w-[13rem] rounded-md bg-white py-[0.6rem] shadow-[0_18px_40px_rgba(9,40,26,0.16)] ' +
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in ' +
              'data-[state=closed]:fade-out'
            }
          >
            {item.children.map((child) => (
              <DropdownMenu.Item key={child.href} asChild>
                <Link
                  href={child.href}
                  className="block cursor-pointer px-[1.1rem] py-2 text-[0.82rem] whitespace-nowrap text-ink-soft no-underline outline-none hover:bg-band hover:text-green-900 data-[highlighted]:bg-band data-[highlighted]:text-green-900"
                >
                  {child.label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </li>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={cn(
        'flex items-center gap-[0.35rem] border-b border-green-ink/35 pb-1 focus-within:border-green-900',
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        // Wired to Pagefind in Fase 4. Until then this does nothing rather than
        // pretending — same stance the old rekam.js:124-132 took with its alert.
      }}
    >
      <label className="sr-only" htmlFor="nav-q">
        Cari di situs REKAM
      </label>
      <input
        id="nav-q"
        name="q"
        type="search"
        placeholder="Cari"
        autoComplete="off"
        className="min-w-0 flex-1 border-0 bg-transparent text-[0.8rem] text-green-900 outline-none placeholder:lowercase placeholder:text-green-ink/50"
      />
      <button type="submit" aria-label="Cari" className="grid size-[22px] flex-none cursor-pointer place-items-center border-0 bg-transparent p-0 text-green-900">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[15px]">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

function LangSwitch({ className }: { className?: string }) {
  return (
    <div role="group" aria-label="Pilih bahasa" className={cn('flex items-center gap-[0.3rem] text-[0.74rem] font-bold tracking-[0.06em]', className)}>
      <span aria-current="true" className="text-green-900">
        ID
      </span>
      {/* Becomes a real href in Fase 4. In the old build this was an inert
          anchor whose click handler popped an alert. */}
      <span aria-hidden="true" className="text-green-ink/30">
        /
      </span>
      <span lang="en" className="text-green-ink/45">
        EN
      </span>
    </div>
  );
}

export function SiteHeader({ hero = false, current = null }: { hero?: boolean; current?: NavKey | null }) {
  // Non-hero pages are revealed from the start; hero pages begin transparent.
  const [revealed, setRevealed] = useState(!hero);
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* The old rekam.js:13-34 read getBoundingClientRect().bottom on every scroll
     event. An IntersectionObserver on the hero does the same job without
     forcing layout on the scroll thread. */
  useEffect(() => {
    if (!hero) return;
    const heroEl = document.getElementById('hero');
    if (!heroEl) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setRevealed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(heroEl);
    return () => io.disconnect();
  }, [hero]);

  // Separate 24px threshold: the mark and pills retire as soon as the page
  // leaves the top, well before the hero has fully scrolled past.
  useEffect(() => {
    if (!hero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hero]);

  // Escape and outside-click close the drawer.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    const onClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setDrawer(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [drawer]);

  const heroState = hero && !revealed;

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full">
      {/* The tint is deliberately see-through: the blur, not the opacity, is
          what keeps the rail readable over whatever scrolls beneath it. */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-[rgba(244,243,239,0.58)] shadow-[0_1px_0_rgba(14,84,54,0.08)] backdrop-blur-[20px] backdrop-saturate-[1.4] transition-opacity duration-[350ms]',
          heroState && 'opacity-0'
        )}
      />

      <div
        ref={cardRef}
        className={cn(
          'relative mx-auto w-full max-w-wrap px-gutter',
          heroState ? 'pt-[clamp(1.5rem,3vw,2.25rem)] pb-2' : 'py-[0.6rem]',
          drawer && 'bg-[rgba(244,243,239,0.98)] pb-6 shadow-[0_18px_40px_rgba(14,84,54,0.14)]'
        )}
      >
        {heroState ? (
          /* ---- Hero state: centred mark plus programme pills ---- */
          <div className="flex flex-col items-center">
            <Brand
              width={118}
              flat
              className={cn('text-white transition-opacity duration-300', scrolled && 'pointer-events-none opacity-0')}
            />
            <nav
              aria-label="Program utama"
              className={cn(
                'mt-[1.1rem] flex justify-center gap-[0.55rem] transition-opacity duration-300',
                scrolled && 'pointer-events-none opacity-0'
              )}
            >
              {PROGRAMMES.map((p) => (
                <Link
                  key={p.key}
                  href={p.href}
                  aria-current={current === p.key ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-[1.35rem] py-2 text-[0.74rem] font-semibold uppercase tracking-[0.1em] no-underline backdrop-blur-[6px] transition-colors duration-200',
                    current === p.key
                      ? 'border-white bg-white text-green-900'
                      : 'border-white/45 bg-white/8 text-white hover:border-white hover:bg-white hover:text-green-900'
                  )}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : (
          <>
            {/* ---- Top utility strip, desktop only, right-aligned ---- */}
            <div className="hidden items-center justify-end lg:flex">
              <SearchForm className="w-[clamp(4rem,6.5vw,5.75rem)]" />
              <LangSwitch className="ml-[clamp(0.7rem,1.5vw,1.3rem)]" />
            </div>
            <div className="my-2 hidden border-t border-green-ink/10 lg:block" />

            {/* ---- The rail ---- */}
            <div className="flex items-center">
              <Brand width={118} className="mr-[clamp(0.75rem,1.6vw,1.5rem)] max-lg:mr-auto max-lg:w-[112px] text-green-900" />

              <nav aria-label="Program" className="hidden lg:block lg:mr-auto">
                <ul className="m-0 flex list-none items-center gap-[clamp(0.85rem,1.8vw,1.6rem)] p-0">
                  {PROGRAMMES.map((item) => (
                    <RailLink key={item.key} item={item} current={current} />
                  ))}
                </ul>
              </nav>

              <nav aria-label="Jelajahi" className="hidden lg:block">
                <ul className="m-0 flex list-none items-center gap-[clamp(0.85rem,1.8vw,1.6rem)] p-0">
                  {EXPLORE.map((item) => (
                    <RailLink key={item.key} item={item} current={current} />
                  ))}
                </ul>
              </nav>

              {/* Three bars, narrow screens only. */}
              <button
                type="button"
                aria-expanded={drawer}
                aria-controls="nav-drawer"
                aria-label={drawer ? 'Tutup menu' : 'Buka menu'}
                onClick={() => setDrawer((d) => !d)}
                className="ml-[clamp(0.75rem,2vw,1.25rem)] size-[34px] cursor-pointer border-0 bg-transparent p-0 text-green-900 lg:hidden"
              >
                <span
                  aria-hidden="true"
                  className={cn('mx-auto my-[5px] block h-[1.5px] w-5 bg-current transition-transform duration-[250ms]', drawer && 'translate-y-[3.25px] rotate-45')}
                />
                <span
                  aria-hidden="true"
                  className={cn('mx-auto my-[5px] block h-[1.5px] w-5 bg-current transition-transform duration-[250ms]', drawer && '-translate-y-[3.25px] -rotate-45')}
                />
              </button>
            </div>

            {/* ---- Drawer, narrow screens. An inline expansion of the bar
                    rather than a modal overlay, which is what the original did. ---- */}
            {drawer && (
              <div id="nav-drawer" className="lg:hidden">
                <NavGroup title="Program" items={PROGRAMMES} current={current} onNavigate={() => setDrawer(false)} />
                <NavGroup title="Jelajahi" items={EXPLORE} current={current} onNavigate={() => setDrawer(false)} />
                <SearchForm className="mt-2" />
                <LangSwitch className="mt-4 text-[0.8rem]" />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

/* In the drawer the groups get their labels back (hidden on the rail), links
   are full width with a rule between them, and submenus are simply always open
   and indented rather than being dropdowns. */
function NavGroup({
  title,
  items,
  current,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  current?: NavKey | null;
  onNavigate: () => void;
}) {
  return (
    <>
      <p className="mt-2 mb-[0.35rem] font-label text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-green-ink/60">
        {title}
      </p>
      <ul className="m-0 mb-4 list-none p-0">
        {items.map((item) => (
          <li key={item.key} className="border-b border-green-ink/12">
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={current === item.key ? 'page' : undefined}
              className={cn(
                'block py-[0.7rem] text-[0.98rem] no-underline',
                current === item.key ? 'text-green-900' : 'text-ink-soft'
              )}
            >
              {item.label}
            </Link>
            {item.children && (
              <ul className="m-0 list-none pb-[0.6rem] pl-4">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} onClick={onNavigate} className="block py-[0.45rem] text-[0.9rem] text-ink-soft no-underline">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
