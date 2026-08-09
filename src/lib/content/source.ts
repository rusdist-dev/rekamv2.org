import eventsJson from '@/data/events.json';
import newsJson from '@/data/news.json';

/* THE SEAM.
 *
 * Everything above this file works with validated domain objects and never
 * knows where they came from. Everything below is "how do we get the bytes".
 * When the CMS arrives, only this file changes.
 *
 * Two env vars drive it:
 *   CONTENT_SOURCE  'local' (default) | 'api'
 *   CMS_API_URL     base URL of the CMS, required when SOURCE is 'api'
 *
 * Note the `next: { tags }` on the fetch. That is the whole reason Next was
 * picked for the "static + dynamic" requirement: the CMS webhook calls a route
 * handler that runs revalidateTag('news'), and only the pages touching that
 * tag regenerate — in seconds, with no full rebuild and no server to run for
 * the other 90% of the site.
 */

const SOURCE = process.env.CONTENT_SOURCE ?? 'local';
const API = process.env.CMS_API_URL;

async function fromApi(path: string, tag: string): Promise<unknown[]> {
  if (!API) throw new Error(`CONTENT_SOURCE=api but CMS_API_URL is unset`);
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json' },
    next: { tags: [tag] },
  });
  if (!res.ok) throw new Error(`CMS ${path} -> ${res.status} ${res.statusText}`);
  const body = await res.json();
  if (!Array.isArray(body)) throw new Error(`CMS ${path} did not return an array`);
  return body;
}

/** Raw, unvalidated news records. Validation happens one layer up. */
export async function rawNews(): Promise<unknown[]> {
  return SOURCE === 'api' ? fromApi('/news', 'news') : newsJson;
}

/** Raw, unvalidated event records. */
export async function rawEvents(): Promise<unknown[]> {
  return SOURCE === 'api' ? fromApi('/events', 'events') : eventsJson;
}
