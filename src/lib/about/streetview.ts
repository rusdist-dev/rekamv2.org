/* Street View configuration — edit this before it goes live.
 *
 * Ported from the old streetview-config.js. `apiKey` starts null on purpose:
 * without it the panel says so plainly instead of rendering Google's "For
 * development purposes only" watermark over a broken widget.
 *
 * To fill it in:
 *   1. Google Cloud console -> new project -> enable BILLING (Street View will
 *      not serve without an active billing account).
 *   2. Enable "Maps JavaScript API".
 *   3. Create an API key, then RESTRICT it — under Application restrictions
 *      pick "Websites" and list rekam.or.id and www.rekam.or.id. An
 *      unrestricted key in client-side JS is public, and anyone who copies it
 *      spends REKAM's quota.
 *
 * Two things worth knowing before switching it on, and the reason the panel is
 * click-to-load rather than automatic:
 *
 *   - Dynamic Street View is billed PER PANORAMA LOAD. A panel that loaded on
 *     its own would bill on every single page view of this page, including the
 *     ones that scroll straight past it.
 *   - Loading Google's script sends the visitor's IP address to Google. The
 *     same click-to-load rule is what keeps that from happening to every
 *     visitor whether they asked or not.
 *
 * Coordinates are CITY-LEVEL anchors, not survey points — they mark the town,
 * and getPanorama() then finds the nearest imagery within `radius`.
 */

export type Place = { id: string; label: string; region: string; lat: number; lng: number };

export const STREETVIEW = {
  apiKey: null as string | null,

  /** How far from each anchor to accept a panorama, in metres. Coverage in
   *  smaller towns can be a few streets away from the point. */
  radius: 4000,

  places: [
    { id: 'bogor', label: 'Bogor', region: 'Kantor pusat · Jawa Barat', lat: -6.5971, lng: 106.806 },
    { id: 'semarang', label: 'Semarang', region: 'Jawa Tengah', lat: -6.9932, lng: 110.4203 },
    { id: 'pati', label: 'Pati', region: 'Lokasi pendaratan ikan', lat: -6.7559, lng: 111.0377 },
    { id: 'surabaya', label: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
    { id: 'denpasar', label: 'Denpasar', region: 'Bali', lat: -8.6705, lng: 115.2126 },
    { id: 'mataram', label: 'Mataram', region: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167 },
    { id: 'makassar', label: 'Makassar', region: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
  ] as Place[],
};
