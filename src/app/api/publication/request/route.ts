import type { NextRequest } from 'next/server';
import { z } from 'zod';

/* Proxies the publication download gate to POST /api/v1/publications/download
 * (docs/api-public.md). The CMS records the request and emails the visitor a
 * link to the file — the link never comes back in the response, so all this
 * returns is whether the email went out. X_API_KEY stays server-side, same as
 * src/app/api/contact/route.ts.
 *
 * `Accept: application/json` is not optional: without it a validation failure
 * comes back as a redirect to the CMS login page instead of a 422.
 *
 * The CMS rate-limits per IP (5/min, 20/hour). Every request reaches it from
 * this server, so the visitor's address is forwarded in X-Forwarded-For —
 * whether that counts depends on the CMS trusting this host as a proxy; if it
 * doesn't, all visitors share one bucket. */

const BASE_URL = process.env.BASE_URL_CMS;
const API_KEY = process.env.X_API_KEY;

const noLinkOrTag = (value: string) => !/[<>]|https?:\/\/|www\./i.test(value);

const payloadSchema = z.object({
  publication_id: z.number().int().positive(),
  name: z.string().trim().min(2).max(100).refine(noLinkOrTag),
  email: z.string().trim().email(),
  description: z.string().trim().max(2000).refine(noLinkOrTag).optional().default(''),
  website: z.string().optional().default(''),
});

function visitorIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || undefined;
}

export async function POST(request: NextRequest) {
  if (!BASE_URL || !API_KEY) {
    return Response.json({ message: 'Layanan unduhan belum dikonfigurasi.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: 'Data yang dikirim tidak lengkap atau tidak valid.' }, { status: 422 });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Api-Key': API_KEY,
  };
  const ip = visitorIp(request);
  if (ip) headers['X-Forwarded-For'] = ip;

  const upstream = await fetch(new URL('/api/v1/publications/download', BASE_URL), {
    method: 'POST',
    headers,
    body: JSON.stringify(parsed.data),
  }).catch(() => null);

  if (!upstream) {
    return Response.json({ message: 'Tidak dapat menghubungi layanan unduhan.' }, { status: 502 });
  }

  const responseBody = (await upstream.json().catch(() => null)) as { message?: string } | null;
  return Response.json(responseBody ?? { message: upstream.ok ? 'ok' : 'Permintaan gagal.' }, {
    status: upstream.status,
  });
}
