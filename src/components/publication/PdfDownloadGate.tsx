'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

const labelCls = 'font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft';

/* Messages for the statuses POST /api/v1/publications/download documents.
 * 422 prefers the CMS's own message, which names the field that failed. */
function errorMessage(status: number, cmsMessage?: string): string {
  switch (status) {
    case 422:
      return cmsMessage ?? 'Periksa kembali nama, email, dan keperluan Anda.';
    case 429:
      return 'Terlalu banyak permintaan. Silakan coba lagi beberapa saat lagi.';
    case 503:
      return 'Email gagal dikirim. Silakan coba lagi.';
    case 404:
      return 'Publikasi ini sedang tidak tersedia untuk diunduh.';
    default:
      return 'Gagal mengirim permintaan. Silakan coba lagi.';
  }
}

/* Gates a publication download behind a name + email form, same shape as
 * PdfReadButton: a trigger that opens a Radix dialog instead of acting
 * directly.
 *
 * The CMS does the rest (POST /api/v1/publications/download, proxied through
 * /api/publication/request): it records the request and emails the visitor a
 * link to the file. Nothing is downloaded here — success means "check your
 * inbox".
 *
 * Without a publicationId — the bundled offline fallback in
 * src/lib/publication.ts, which the CMS knows nothing about — there is nothing
 * to request, so the trigger is a plain same-origin download link. */
export function PdfDownloadGate({
  publicationId,
  href,
  title,
  className,
  children,
}: {
  publicationId?: number;
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (publicationId === undefined) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setError(null);
      setSentTo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/publication/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          publication_id: publicationId,
          name: data.get('nama'),
          email,
          description: data.get('keperluan'),
          website: data.get('website'),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(errorMessage(res.status, body?.message));
        return;
      }
      setSentTo(email);
    } catch {
      setError(errorMessage(0));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby="pdf-download-gate-desc"
          className="fixed left-1/2 top-1/2 z-[310] max-h-[92vh] w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] bg-paper"
        >
          <div className="flex items-center justify-between gap-4 border-b border-green-ink/12 px-5 py-3.5">
            <Dialog.Title className="m-0 truncate font-display text-[1rem] leading-[1.3] text-green-900">
              Download {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Tutup"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-sage/60 text-[1.2rem] leading-none text-green-900 hover:bg-sage"
            >
              ×
            </Dialog.Close>
          </div>

          {sentTo ? (
            <div className="flex flex-col gap-4 px-5 py-5">
              <Dialog.Description id="pdf-download-gate-desc" role="status" className="m-0 text-[0.9rem] leading-[1.6] text-ink">
                Tautan unduhan telah dikirim ke <strong>{sentTo}</strong>. Periksa kotak masuk Anda, termasuk folder
                spam.
              </Dialog.Description>
              <Dialog.Close className={buttonClasses('green', true, 'uppercase')}>Tutup</Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
              <Dialog.Description id="pdf-download-gate-desc" className="m-0 text-[0.85rem] leading-[1.6] text-ink-soft">
                Isi nama dan email Anda. Tautan untuk mengunduh dokumen ini akan dikirim ke email tersebut.
              </Dialog.Description>

              <label className="block">
                <span className={labelCls}>Nama</span>
                <input
                  type="text"
                  name="nama"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className={labelCls}>Email</span>
                <input type="email" name="email" required autoComplete="email" className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>Keperluan (opsional)</span>
                <textarea name="keperluan" rows={3} maxLength={2000} className={cn(inputCls, 'resize-y')} />
              </label>

              {/* Honeypot: real visitors never see or fill it. The CMS answers
                  201 either way but drops the request when it's filled. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-px w-px opacity-0"
              />

              {error && (
                <p role="alert" className="m-0 text-[0.8rem] text-rust">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={buttonClasses('green', true, cn('uppercase', submitting && 'cursor-not-allowed opacity-70'))}
              >
                {submitting ? 'Mengirim...' : 'Kirim tautan unduhan'}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
