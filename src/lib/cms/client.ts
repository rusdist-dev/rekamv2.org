/* Thin transport for the REKAM CMS public API (cms.rekam.org). See
 * docs/api-public.md for the full contract this wraps:
 *
 *   - every request carries `X-Api-Key`, which also selects the tenant
 *   - list endpoints answer `{ data: [...], meta: {...} }`, detail endpoints
 *     `{ data: {...} }`
 *   - a module disabled for the tenant is a 404 on the endpoint itself, not
 *     an empty list — cmsList/cmsGet both surface that as `null` rather than
 *     throwing, so a caller can fall back cleanly instead of taking the site
 *     down over a module REKAM's own tenant never enabled
 *
 *   BASE_URL_CMS   e.g. https://cms.rekam.org
 *   X_API_KEY      per-company key from Pengaturan Situs > API Key
 *
 * Field names on individual records are NOT specified in docs/api-public.md
 * (only endpoints, query params, and the envelope shape are) — that mapping
 * lives one layer up, next to whichever collection is doing the adapting.
 */

export type PageMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const BASE_URL = process.env.BASE_URL_CMS;
const API_KEY = process.env.X_API_KEY;

export function cmsConfigured(): boolean {
  return Boolean(BASE_URL && API_KEY);
}

type RequestOpts = {
  /** Next.js cache tag(s) for this call — lets a CMS webhook call
   *  revalidateTag() and only regenerate the pages that touched it. */
  tag: string | string[];
  /** Seconds before Next revalidates in the background. docs/api-public.md:
   *  "Respons di-cache per company selama beberapa menit." */
  revalidate?: number;
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params: RequestOpts['params']): URL {
  const url = new URL(`/api/v1${path}`, BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

/* The CMS occasionally answers 429/5xx under load (its own per-key rate
 * limit; raised server-side since — see docs/api-public.md). A short, capped
 * retry survives that. It deliberately does NOT wait out a large
 * `Retry-After`: Next's own static-generation worker kills a page after 60s
 * ("took more than 60 seconds. Retrying again shortly"), so any in-request
 * wait here must stay well under that budget — a previous version of this
 * function slept for the full Retry-After (up to 65s) and that alone was
 * enough to trip Next's timeout, turning a recoverable 429 into a build
 * failure. Capping the wait and keeping retries few means a page either
 * succeeds inside Next's own budget or fails fast enough for Next's own
 * staticGenerationRetryCount (next.config.ts) to re-run the whole page. */
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 400;
const MAX_RETRY_WAIT_MS = 4_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path: string, opts: RequestOpts): Promise<unknown> {
  if (!BASE_URL) throw new Error('BASE_URL_CMS tidak diset');
  if (!API_KEY) throw new Error('X_API_KEY tidak diset');

  const url = buildUrl(path, opts.params);
  const tags = Array.isArray(opts.tag) ? opts.tag : [opts.tag];

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: 'application/json', 'X-Api-Key': API_KEY },
        next: { tags, revalidate: opts.revalidate ?? 300 },
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < RETRY_COUNT) await sleep(RETRY_DELAY_MS * (attempt + 1));
      continue;
    }

    if (res.status === 404) return null;

    if ((res.status === 429 || res.status >= 500) && attempt < RETRY_COUNT) {
      lastError = new Error(`CMS ${url.pathname}${url.search} -> ${res.status} ${res.statusText}`);
      const retryAfterSec = Number(res.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? Math.min(retryAfterSec * 1000, MAX_RETRY_WAIT_MS)
        : RETRY_DELAY_MS * (attempt + 1);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = (body as { message?: string } | null)?.message ?? res.statusText;
      throw new Error(`CMS ${url.pathname}${url.search} -> ${res.status} ${message}`);
    }

    return res.json();
  }

  throw lastError ?? new Error(`CMS ${url.pathname}${url.search} -> request failed`);
}

/** GET a list endpoint. `null` means the module is disabled for this tenant. */
export async function cmsList<T>(path: string, opts: RequestOpts): Promise<{ data: T[]; meta?: PageMeta } | null> {
  const body = await request(path, opts);
  if (body === null) return null;

  const envelope = body as { data?: unknown; meta?: PageMeta };
  if (!Array.isArray(envelope.data)) {
    throw new Error(`CMS ${path} tidak mengembalikan daftar (data[])`);
  }
  return { data: envelope.data as T[], meta: envelope.meta };
}

/** GET a detail endpoint. `null` covers both "not found" and "module
 *  disabled" — the response alone can't tell those apart. */
export async function cmsGet<T>(path: string, opts: RequestOpts): Promise<T | null> {
  const body = await request(path, opts);
  if (body === null) return null;

  const envelope = body as { data?: unknown };
  return (envelope.data ?? null) as T | null;
}
