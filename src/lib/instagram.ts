/* Instagram API with Instagram Login (graph.instagram.com) — the successor to
 * the retired Basic Display API. It only needs an Instagram professional
 * account and a long-lived user token; no linked Facebook Page required.
 *
 *   IG_ACCESS_TOKEN   long-lived token for the rekamnusantara account
 *
 * Unset in an environment (local dev, preview builds), fetchInstagramMedia
 * returns null and callers fall back to their own placeholder image — the
 * home page's Lately section does exactly that. media_url is a signed CDN
 * link Meta can rotate, so it is fetched fresh (tagged, hourly-revalidated)
 * rather than ever being stored.
 */

export type InstagramMedia = {
  id: string;
  permalink: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
};

const TOKEN = process.env.IG_ACCESS_TOKEN;
const FIELDS = 'id,permalink,media_type,media_url,thumbnail_url';

export async function fetchInstagramMedia(limit = 25): Promise<InstagramMedia[] | null> {
  if (!TOKEN) return null;

  try {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=${FIELDS}&limit=${limit}&access_token=${TOKEN}`,
      { next: { revalidate: 3600, tags: ['instagram'] } }
    );
    if (!res.ok) return null;

    const body = (await res.json()) as { data?: unknown };
    if (!Array.isArray(body.data)) return null;

    return body.data.map((raw) => {
      const m = raw as Record<string, unknown>;
      return {
        id: String(m.id),
        permalink: String(m.permalink),
        mediaType: m.media_type as InstagramMedia['mediaType'],
        mediaUrl: String(m.media_url),
        thumbnailUrl: m.thumbnail_url ? String(m.thumbnail_url) : undefined,
      };
    });
  } catch {
    return null;
  }
}

/** The `/p/<code>/` or `/reel/<code>/` segment — the stable part of a
 *  permalink, so a hardcoded link and the API's own permalink still match
 *  even if one carries a trailing slash or a `?img_index=` query string the
 *  other doesn't. */
export function igShortcode(url: string): string | null {
  return url.match(/\/(?:p|reel)\/([^/?]+)/)?.[1] ?? null;
}
