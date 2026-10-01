'use client';

import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

/* Gates a publication download behind a name + email form, same shape as
 * PdfReadButton: a trigger that opens a Radix dialog instead of acting
 * directly. The actual file download still happens through a real <a
 * download> — browsers only honour that attribute from a genuine anchor
 * click — so a successful submit fires a synthetic click on a hidden one and
 * closes the dialog.
 *
 * Who downloaded what is recorded via the same CMS write endpoint the
 * safeguarding complaint form uses (POST /api/v1/contact, proxied through
 * /api/contact — see src/app/api/contact/route.ts). There's no dedicated
 * "download log" endpoint, so this reuses contact with a fixed subject/
 * message identifying it as a download rather than a message. */
export function PdfDownloadGate({
  href,
  title,
  className,
  children,
}: {
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('nama'),
          email: data.get('email'),
          subject: `Unduhan Publikasi: ${title}`,
          message: `Pengunjung situs mengunduh publikasi "${title}".`,
        }),
      });
      if (!res.ok) throw new Error();

      downloadRef.current?.click();
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby="pdf-download-gate-desc"
          className="fixed left-1/2 top-1/2 z-[310] w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] bg-paper"
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
            <Dialog.Description id="pdf-download-gate-desc" className="m-0 text-[0.85rem] leading-[1.6] text-ink-soft">
              Isi nama dan email untuk mengunduh dokumen ini.
            </Dialog.Description>

            <label className="block">
              <span className="font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Nama
              </span>
              <input type="text" name="nama" required autoComplete="name" className={inputCls} />
            </label>

            <label className="block">
              <span className="font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Email
              </span>
              <input type="email" name="email" required autoComplete="email" className={inputCls} />
            </label>

            {error && (
              <p role="alert" className="m-0 text-[0.8rem] text-rust">
                Gagal mengirim data. Silakan coba lagi.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={buttonClasses('green', true, cn('uppercase', submitting && 'cursor-not-allowed opacity-70'))}
            >
              {submitting ? 'Mengirim...' : 'Download'}
            </button>
          </form>

          <a ref={downloadRef} href={href} download className="hidden" tabIndex={-1} aria-hidden="true" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
