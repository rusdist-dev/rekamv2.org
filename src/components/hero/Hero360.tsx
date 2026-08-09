'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pano360 } from '@/lib/pano/Pano360';
import type { SceneName } from '@/lib/pano/pano-scenes';
import { cn } from '@/lib/cn';

/* rekam.css:270-479. The 360-degree hero: a full-height stage the engine
 * renders into, a scrim, the headline, and a HUD carrying the drag hint and
 * the play/mute/recentre controls.
 *
 * The engine is imperative and lives in a ref — see Pano360.ts for why it is
 * not React Three Fiber. Everything React owns here is chrome: which controls
 * are visible, what the loader says, whether the hint has been dismissed. */

type Source = { src: string; type?: string };

const CTRL =
  'pointer-events-auto inline-flex min-h-[2.6rem] cursor-pointer items-center gap-2 rounded-full ' +
  'border border-white/28 bg-[rgba(10,22,16,0.4)] px-4 text-[0.8rem] text-white backdrop-blur-[10px] ' +
  'transition-[background-color,border-color] duration-200 hover:border-white/55 hover:bg-green-ink/60';

/* The source drew these with CSS pseudo-elements so the hero shipped with no
   icon requests. Inline SVG costs no requests either and is far less fragile
   than reproducing clip-path triangles in utility classes. */
function CtrlIcon({ name }: { name: 'play' | 'pause' | 'sound' | 'muted' | 'recenter' }) {
  const common = { width: 12, height: 12, viewBox: '0 0 12 12', 'aria-hidden': true as const, className: 'flex-none' };
  switch (name) {
    case 'pause':
      return (
        <svg {...common} fill="currentColor">
          <rect x="0" y="0" width="4" height="12" />
          <rect x="8" y="0" width="4" height="12" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common} fill="currentColor">
          <path d="M1 0 L12 6 L1 12 Z" />
        </svg>
      );
    case 'sound':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M0.8 4.4 H3 L5.6 2 V10 L3 7.6 H0.8 Z" fill="currentColor" stroke="none" />
          <path d="M7.6 3.6 a3.4 3.4 0 0 1 0 4.8" strokeLinecap="round" />
        </svg>
      );
    case 'muted':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M0.8 4.4 H3 L5.6 2 V10 L3 7.6 H0.8 Z" fill="currentColor" stroke="none" />
          <path d="M7.6 4.2 L11.2 7.8 M11.2 4.2 L7.6 7.8" strokeLinecap="round" />
        </svg>
      );
    case 'recenter':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="6" cy="6" r="5" />
          <circle cx="6" cy="6" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export function Hero360({
  scene,
  title,
  eyebrow,
  sources = [],
  poster,
  lightPano = false,
  scrollTo,
}: {
  scene: SceneName;
  title: React.ReactNode;
  eyebrow: string;
  /** Omit entirely for a procedural-only hero — that is by design, not a fault. */
  sources?: Source[];
  poster?: string;
  /** A brighter scrim, for procedural scenes that are pale rather than dark. */
  lightPano?: boolean;
  scrollTo?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<Pano360 | null>(null);

  const [status, setStatus] = useState<string | null>('Menyiapkan panorama…');
  const [videoUsable, setVideoUsable] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let engine: Pano360 | null = null;
    try {
      engine = new Pano360(stage, {
        scene,
        video: videoRef.current,
        onStatus: setStatus,
        onVideoUsable: setVideoUsable,
        onFirstInteraction: () => setHintGone(true),
      });
      engineRef.current = engine;
    } catch {
      // Pano360 has already reported the failure through onStatus.
      return;
    }

    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [scene]);

  // Autoplay only once footage is actually in use, and never under reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!videoUsable || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [videoUsable]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  // Unmuting only works off a user gesture, which this click provides.
  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSound(!video.muted);
    if (!video.muted && video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate h-svh min-h-[34rem] overflow-hidden bg-forest-black-deep"
    >
      <div
        ref={stageRef}
        // Horizontal drags rotate the panorama; vertical ones stay with the
        // browser so touch users can scroll past a full-height hero.
        className="absolute inset-0 z-0 cursor-grab touch-pan-y active:cursor-grabbing [&_canvas]:block [&_canvas]:size-full"
        tabIndex={0}
        role="application"
        aria-label="Panorama 360 derajat. Gunakan tombol panah untuk melihat sekeliling."
      />

      <video
        ref={videoRef}
        className="sr-only"
        loop
        muted
        playsInline
        preload="none"
        poster={poster}
        crossOrigin="anonymous"
        disablePictureInPicture
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: lightPano ? SCRIM_LIGHT : SCRIM_DARK }}
      />

      <div className="pointer-events-none relative z-[2] flex h-full flex-col items-center justify-center gap-6 px-gutter pt-20 pb-36 text-center">
        <p className="m-0 font-label text-[0.8rem] font-semibold uppercase tracking-[0.32em] text-white/92">
          {eyebrow}
        </p>
        <h1 className="m-0 max-w-[18ch] font-display text-hero-lg font-normal leading-[1.06] tracking-[-0.02em] text-white [text-shadow:0_2px_44px_rgba(0,0,0,0.5)]">
          {title}
        </h1>

        {scrollTo && (
          <a
            href={scrollTo}
            aria-label="Gulir ke bawah"
            className="pointer-events-auto relative mt-6 block h-[78px] w-px bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.85)_100%)]"
          >
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-1/2 -ml-1 size-2 animate-[cue_2.6s_ease-in-out_infinite] rounded-full bg-white"
            />
          </a>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[3] flex flex-wrap items-center justify-between gap-4 px-gutter">
        <p
          className={cn(
            'm-0 flex items-center gap-[0.6rem] font-label text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/80 transition-opacity duration-500',
            hintGone && 'opacity-0'
          )}
        >
          <span
            aria-hidden="true"
            className="size-[7px] animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-yellow"
          />
          Seret untuk melihat sekeliling
        </p>

        <div className="flex gap-2">
          {videoUsable && (
            <>
              <button type="button" onClick={togglePlay} aria-pressed={playing} className={CTRL}>
                <CtrlIcon name={playing ? 'pause' : 'play'} />
                <span>{playing ? 'Jeda' : 'Putar'}</span>
              </button>
              <button type="button" onClick={toggleSound} aria-pressed={sound} className={CTRL}>
                <CtrlIcon name={sound ? 'sound' : 'muted'} />
                <span>Suara</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => engineRef.current?.recenter()}
            aria-label="Kembalikan sudut pandang"
            className={CTRL}
          >
            <CtrlIcon name="recenter" />
            <span>Pusatkan</span>
          </button>
        </div>
      </div>

      {status && (
        <div className="pointer-events-none absolute inset-0 z-[4] grid place-items-center gap-4 bg-forest-black-deep/70 text-center">
          <div>
            <span
              aria-hidden="true"
              className="mx-auto mb-4 block size-8 animate-spin rounded-full border-2 border-white/25 border-t-white motion-reduce:animate-none"
            />
            <p className="m-0 px-gutter text-[0.85rem] text-white/85" role="status">
              {status}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* rekam.css:292-327. Two scrims: the default for dark footage, and
   --light-pano for the pale procedural scenes, which need more cover in the
   middle band where the headline sits. */
const SCRIM_DARK =
  'linear-gradient(to bottom, rgba(8,20,14,0.55) 0%, rgba(8,20,14,0) 26%),' +
  'linear-gradient(to top, rgba(8,20,14,0.6) 0%, rgba(8,20,14,0) 42%),' +
  'radial-gradient(115% 80% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)';

const SCRIM_LIGHT =
  'linear-gradient(to bottom, rgba(8,20,14,0.34) 0%, rgba(8,20,14,0.60) 14%, rgba(8,20,14,0.60) 62%, rgba(8,20,14,0.30) 78%, rgba(8,20,14,0.22) 100%),' +
  'linear-gradient(to top, rgba(8,20,14,0.45) 0%, rgba(8,20,14,0) 34%)';
