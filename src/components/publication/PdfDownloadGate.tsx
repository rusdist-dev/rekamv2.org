'use client';

import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonClasses } from '@/components/ui/button-classes';

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

/* Gates a publication download behind a name + email form, same shape as
 * PdfReadButton: a trigger that opens a Radix dialog instead of acting
 * directly. The actual file download still happens through a real <a
 * download> — browsers only honour that attribute from a genuine anchor
 * click — so submitting the form here just fires a synthetic click on a
 * hidden one and closes the dialog.
 *
 * The CMS endpoint to record who downloaded what doesn't exist yet, so this
 * is the display only: name/email are validated (both required, email by
 * type) but not read, sent, or stored anywhere. Wire that up where the
 * comment below says to, once there's an endpoint to call. */
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
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: once the CMS endpoint exists, read the form's name/email fields
    // and send them there before triggering the download below.
    downloadRef.current?.click();
    setOpen(false);
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

            <button type="submit" className={buttonClasses('green', true, 'uppercase')}>
              Download
            </button>
          </form>

          <a ref={downloadRef} href={href} download className="hidden" tabIndex={-1} aria-hidden="true" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
