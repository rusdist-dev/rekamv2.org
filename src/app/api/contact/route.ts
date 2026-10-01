import type { NextRequest } from 'next/server';
import { z } from 'zod';

/* Proxies the compro's contact/complaint forms to the CMS's one write
 * endpoint, POST /api/v1/contact (docs/api-public.md). X_API_KEY stays
 * server-side — same reasoning as src/lib/cms/client.ts — so the browser
 * posts here instead of to cms.rekam.org directly. */

const BASE_URL = process.env.BASE_URL_CMS;
const API_KEY = process.env.X_API_KEY;

const payloadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().default(''),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
  address: z.string().trim().optional().default(''),
  is_private: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  if (!BASE_URL || !API_KEY) {
    return Response.json({ message: 'Layanan pengaduan belum dikonfigurasi.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: 'Data yang dikirim tidak lengkap atau tidak valid.' }, { status: 400 });
  }

  const upstream = await fetch(new URL('/api/v1/contact', BASE_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify(parsed.data),
  }).catch(() => null);

  if (!upstream) {
    return Response.json({ message: 'Tidak dapat menghubungi layanan pengaduan.' }, { status: 502 });
  }

  const responseBody = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const message = (responseBody as { message?: string } | null)?.message ?? 'Pengaduan gagal dikirim.';
    return Response.json({ message }, { status: upstream.status });
  }

  return Response.json(responseBody ?? { message: 'ok' }, { status: upstream.status });
}
