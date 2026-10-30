import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { SEARCH_LIMIT, search } from '@/lib/search';

/* The header's search field calls this as the visitor types.
 *
 * It runs on the server because the index it queries is built from the live
 * collections — berita, event and publikasi all come from the CMS — and
 * shipping those to the browser would mean sending every article body down
 * the wire before anyone has typed a letter. The nav labels stay matched
 * client-side in SiteHeader so the first keystroke still answers instantly;
 * this fills in everything behind them.
 */

/** Long enough that a single letter does not scan the whole index, short
 *  enough for a two-letter name to be findable. */
const MIN_QUERY = 2;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get('q') ?? '').trim();
  const localeParam = params.get('locale') ?? '';
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  if (query.length < MIN_QUERY) return Response.json({ results: [] });

  const limitParam = Number(params.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : SEARCH_LIMIT;

  const results = await search(query, locale, limit).catch(() => []);

  return Response.json(
    { results },
    // Freshness is owned by the CMS fetches inside the index (their own tags
    // and revalidate), so the response itself only needs to not be stored by
    // a shared cache keyed on a query string that is effectively unbounded.
    { headers: { 'Cache-Control': 'private, max-age=30' } }
  );
}
