'use client';

import { useState } from 'react';

/* "Gallery Film" viewer for the initiative page's fourth section. Client
 * component only because Back/Next need state — everything else could stay
 * server-rendered.
 *
 * Videos are the same five YT_VIDEOS from the homepage (src/app/[locale]/
 * page.tsx), duplicated here rather than imported: the homepage's array
 * isn't exported, and the user asked to reuse them "as an example" for now
 * rather than wire up a shared source. Thumbnails use a plain <img>, matching
 * the homepage's own video grid — img.youtube.com isn't in next.config's
 * remote patterns, and adding it just for this one thumbnail isn't worth it. */
const VIDEOS = [
  { id: 'GlFSR2ymLWI', title: 'Apa Itu Neraca Sumber Daya Laut?' },
  { id: 'mnBlUW8BDhY', title: 'Video REKAM Nusantara' },
  { id: 'IGY158BlSt0', title: 'Video REKAM Nusantara' },
  { id: 'op95wuGjOTs', title: 'Video REKAM Nusantara' },
  { id: '4_0dqP8u0Mw', title: 'Video REKAM Nusantara' },
] as const;

function CircleIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
    >
      {children}
    </button>
  );
}

export function GalleryFilm() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = VIDEOS[index];
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  const go = (delta: number) => {
    setPlaying(false);
    setIndex((i) => (i + delta + VIDEOS.length) % VIDEOS.length);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: video.title, url: watchUrl }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(watchUrl).catch(() => {});
    }
  };

  return (
    <section style={{ backgroundColor: '#0a3142' }}>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c3d49] px-gutter py-5">
        <p className="m-0 font-label text-[0.85rem] font-semibold uppercase tracking-[0.28em] text-white">
          Gallery film
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex min-h-[2.5rem] cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-transparent px-5 font-label text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-white/10"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex min-h-[2.5rem] cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-transparent px-5 font-label text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-white/10"
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-[22rem] flex-col sm:min-h-[30rem] lg:min-h-[75vh] lg:flex-row">
        <div className="relative min-h-[18rem] flex-1 overflow-hidden bg-black lg:min-h-0">
          {playing ? (
            // Real YouTube player embedded in place — full native controls
            // (play/pause, seek, fullscreen), not just a thumbnail out to a
            // new tab. Re-mounted per video via `key` so switching with
            // Back/Next doesn't carry over the previous video's player state.
            <iframe
              key={video.id}
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Putar "${video.title}"`}
              className="group absolute inset-0 block w-full cursor-pointer border-0 bg-transparent p-0"
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 group-hover:bg-black/35"
              >
                <svg viewBox="0 0 24 24" className="size-16 drop-shadow-md">
                  <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.9)" />
                  <path d="M10 8.5v7l6-3.5z" fill="#0d2a1a" />
                </svg>
              </span>
            </button>
          )}
        </div>

        <div
          className="flex w-full flex-col justify-between gap-6 p-6 lg:w-[22rem]"
          style={{ background: 'linear-gradient(160deg, #0b2f4a 0%, #1f6f93 100%)' }}
        >
          <div className="flex items-start gap-3">
            <img src="/icon.svg" alt="" className="mt-0.5 size-9 shrink-0 rounded-full bg-white/90 p-1.5" />
            <div className="min-w-0">
              <p className="m-0 line-clamp-2 text-[0.95rem] font-semibold leading-[1.3] text-white">
                {video.title}
              </p>
              <p className="mt-1 mb-0 text-[0.78rem] text-white/70">Rekam Nusantara Foundation</p>
            </div>
          </div>

          <a
            href={watchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg bg-[#1d6fa5] px-4 py-3 no-underline transition-colors duration-200 hover:bg-[#2680bb]"
          >
            <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-none stroke-white" strokeWidth="1.8">
              <path d="M10 8.5v7l6-3.5z" fill="white" stroke="none" />
              <circle cx="12" cy="12" r="9" strokeLinecap="round" />
            </svg>
            <span className="text-[0.85rem] font-semibold leading-[1.4] text-white">
              Tonton video ini di YouTube
            </span>
          </a>

          <div className="flex items-center justify-between">
            <p className="m-0 text-[0.75rem] text-white/60">
              {index + 1} / {VIDEOS.length}
            </p>
            <div className="flex gap-3">
              <CircleIconButton label="Bagikan video ini" onClick={() => void share()}>
                <svg viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.6">
                  <path d="M7 12.5 13 8.5M7 7.5 13 11.5" strokeLinecap="round" />
                  <circle cx="15" cy="5.5" r="2.3" />
                  <circle cx="15" cy="14.5" r="2.3" />
                  <circle cx="5" cy="10" r="2.3" />
                </svg>
              </CircleIconButton>
              <CircleIconButton label={`Video ke-${index + 1} dari ${VIDEOS.length}`}>
                <svg viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.6">
                  <circle cx="10" cy="10" r="7.5" />
                  <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CircleIconButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
