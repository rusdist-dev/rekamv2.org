'use client';

import { useCallback, useRef, useState } from 'react';
import { Chip } from '@/components/ui/primitives';
import { STREETVIEW } from '@/lib/about/streetview';

/* Deliberately click-to-load. Three reasons, all the same decision, and all
 * carried over from the source:
 *
 *   - Cost. Dynamic Street View bills per panorama load. Auto-loading would
 *     charge REKAM for every page view of this page, including the ones that
 *     scroll straight past this section.
 *   - Privacy. Fetching Google's script hands the visitor's IP to Google. Not
 *     requesting it until someone asks keeps that from happening by default.
 *   - Weight. The Maps bootstrap plus imagery is a large third-party payload.
 *
 * With no API key the button says so plainly rather than rendering Google's
 * "For development purposes only" watermark over a broken widget. */

declare global {
  interface Window {
    google?: typeof globalThis & { maps?: unknown };
    __rekamMapsReady?: () => void;
  }
}

type Status = 'idle' | 'loading' | 'live' | 'error';

export function StreetView() {
  const paneRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<unknown>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [place, setPlace] = useState(STREETVIEW.places[0]);
  const [message, setMessage] = useState('');

  const showPlace = useCallback((p: typeof STREETVIEW.places[number]) => {
    setPlace(p);
    const maps = (window.google as { maps?: Record<string, new (...a: never[]) => unknown> } | undefined)?.maps;
    if (!maps || !paneRef.current) return;

    /* Minimal hand-written shapes for the two Maps classes this uses, rather
       than pulling in @types/google.maps for a panel that is off by default. */
    type SvcResult = { location?: { pano?: string } };
    type PanoInstance = { setPano: (id: string) => void; setPov: (pov: Record<string, number>) => void };
    const Service = maps.StreetViewService as unknown as new () => {
      getPanorama: (
        req: Record<string, unknown>,
        cb: (data: SvcResult | null, st: string) => void
      ) => void;
    };
    const Pano = maps.StreetViewPanorama as unknown as new (
      el: HTMLElement,
      opts: Record<string, unknown>
    ) => PanoInstance;

    new Service().getPanorama(
      { location: { lat: p.lat, lng: p.lng }, radius: STREETVIEW.radius },
      (data, st) => {
        if (st !== 'OK' || !data?.location?.pano) {
          setMessage(`Belum ada citra Street View di sekitar ${p.label}.`);
          return;
        }
        setMessage('');
        const opts = {
          pano: data.location.pano,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        };
        if (panoRef.current) {
          const existing = panoRef.current as PanoInstance;
          existing.setPano(data.location.pano);
          existing.setPov({ heading: 0, pitch: 0 });
        } else {
          panoRef.current = new Pano(paneRef.current!, opts);
        }
      }
    );
  }, []);

  const load = useCallback(() => {
    if (!STREETVIEW.apiKey) return;
    setStatus('loading');

    const done = () => {
      setStatus('live');
      showPlace(place);
    };
    window.__rekamMapsReady = () => {
      delete window.__rekamMapsReady;
      done();
    };

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: STREETVIEW.apiKey,
      callback: '__rekamMapsReady',
      v: 'weekly',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => {
      setStatus('error');
      setMessage('Gagal memuat Google Maps.');
    };
    document.head.appendChild(script);

    const timer = window.setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
      setMessage((m) => m || 'Google Maps terlalu lama merespons.');
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [place, showPlace]);

  return (
    <div className="mt-[clamp(2rem,4vw,3rem)] rounded-[14px] border border-green-ink/15 bg-white p-[clamp(1.25rem,2.5vw,2rem)]">
      <h3 className="m-0 font-display text-title leading-[1.2] text-green-900">Tampak dari jalan</h3>
      <p className="mt-2 mb-0 max-w-[56ch] text-[0.95rem] leading-[1.65] text-ink-soft">
        Kota tempat tim dan enumerator kami bekerja, dilihat lewat Google Street View. Pilih lokasi,
        lalu seret untuk melihat sekeliling.
      </p>

      <div role="group" aria-label="Pilih lokasi" className="mt-5 flex flex-wrap gap-2">
        {STREETVIEW.places.map((p) => (
          <Chip
            key={p.id}
            active={p.id === place.id}
            onClick={() => (status === 'live' ? showPlace(p) : setPlace(p))}
          >
            {p.label}
          </Chip>
        ))}
      </div>
      <p className="mt-2 mb-0 text-[0.8rem] text-ink-soft">{place.region}</p>

      <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[10px] bg-band">
        <div ref={paneRef} className="absolute inset-0" />

        {status !== 'live' && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              {/* The source's own wording, shown whether or not a key exists.
                  It names both costs — the visitor's IP and REKAM's API quota
                  — which is the entire reason this is a button rather than an
                  auto-load, and that reasoning is worth reading either way. */}
              <p className="mb-4 mt-0 max-w-[46ch] text-[0.85rem] leading-[1.65] text-ink-soft">
                Street View dimuat hanya kalau Anda memintanya — membukanya mengirimkan alamat IP
                Anda ke Google dan menggunakan kuota API REKAM.
              </p>

              <button
                type="button"
                onClick={load}
                disabled={!STREETVIEW.apiKey || status === 'loading'}
                className="min-h-[3rem] cursor-pointer rounded-full border-0 bg-green-700 px-7 text-[0.95rem] font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-ink/20 disabled:text-ink-soft"
              >
                {status === 'loading' ? 'Memuat…' : 'Buka Street View'}
              </button>

              {/* Disabled with a reason beside it, rather than a dead control
                  that gives no clue why nothing happens. */}
              {!STREETVIEW.apiKey && (
                <p className="mx-auto mt-4 mb-0 max-w-[48ch] text-[0.82rem] leading-[1.7] text-ink-soft">
                  Belum aktif: kunci Google Maps API belum diisi. Lihat{' '}
                  <code>src/lib/about/streetview.ts</code> — kuncinya harus dibatasi ke domain
                  REKAM, karena kunci tanpa pembatasan di sisi klien bersifat publik.
                </p>
              )}
              {message && <p className="mt-3 mb-0 text-[0.82rem] text-rust">{message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
