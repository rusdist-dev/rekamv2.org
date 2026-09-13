import type { NextRequest } from 'next/server';

/* "Unduh" for a CMS-hosted document.
 *
 * Two things make a direct link to `file_url` the wrong answer: browsers
 * ignore the `download` attribute on a cross-origin href, and cms.rekam.org
 * serves its media without a Content-Disposition header. A link straight to
 * the PDF therefore opens it in the tab instead of saving it, and lands the
 * reader on the CMS's domain. Streaming it back through our own origin with
 * the header set is what keeps the button honest.
 *
 * `url` is a full CMS media URL rather than a publication id so this needs no
 * second round-trip to the API. That makes the allowlist below the security
 * boundary: same origin as BASE_URL_CMS and nothing outside /media/, so the
 * handler can't be pointed at an internal host.
 */

const BASE_URL = process.env.BASE_URL_CMS;

function allowed(target: string): boolean {
  if (!BASE_URL) return false;
  try {
    const url = new URL(target);
    const base = new URL(BASE_URL);
    return url.origin === base.origin && url.pathname.startsWith('/media/');
  } catch {
    return false;
  }
}

/** Header-safe, path-free, and never empty — this string is user input that
 *  ends up inside a response header. */
function safeName(name: string | null): string {
  const cleaned = (name ?? '').replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 120);
  return cleaned || 'publication.pdf';
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('url');

  if (!target || !allowed(target)) {
    return new Response('Dokumen tidak dikenal.', { status: 400 });
  }

  const upstream = await fetch(target).catch(() => null);
  if (!upstream?.ok || !upstream.body) {
    return new Response('Dokumen tidak dapat diambil.', { status: 502 });
  }

  const headers = new Headers({
    'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${safeName(request.nextUrl.searchParams.get('name'))}"`,
    // The CMS's media URLs are content-addressed, so a long cache is safe:
    // replacing a document changes its URL.
    'Cache-Control': 'public, max-age=3600',
  });
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);

  return new Response(upstream.body, { headers });
}
