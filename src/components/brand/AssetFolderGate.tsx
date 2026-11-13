'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonClasses } from '@/components/ui/button-classes';
import { cn } from '@/lib/cn';
import type { BrandGuidelineContent } from '@/i18n/content/brand-guideline';

/* Gates the brand asset folder behind a name + email + purpose form, the same
 * shape as the publication download gate
 * (src/components/publication/PdfDownloadGate.tsx): a trigger that opens a
 * Radix dialog instead of following its href directly.
 *
 * Two things differ from that gate, both because of where the file lives. The
 * publication gate posts to the CMS's publications endpoint, which emails the
 * visitor a link it holds; this folder is a shared Drive URL the site already
 * knows, so the request is filed as an ordinary contact entry (POST
 * /api/contact, the same hop /safeguarding's complaint form uses) and the link
 * is handed over here rather than by email.
 *
 * The link is revealed only after that POST succeeds. A CMS outage therefore
 * blocks the download — deliberately, and the same way the publication gate
 * behaves: the point of the gate is that nobody takes the artwork without
 * leaving their details.
 *
 * The folder opens from a link the visitor clicks, not window.open() after the
 * await — a popup opened from an async callback is blocked by default in every
 * current browser, which would look like the form having failed. */

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

const labelCls = 'font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft';

type Gate = BrandGuidelineContent['assets']['gate'];

export function AssetFolderGate({
  folderUrl,
  copy,
  className,
  children,
}: {
  folderUrl: string;
  copy: Gate;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.get('nama'),
          email: data.get('email'),
          subject: copy.subjectValue,
          message: data.get('keperluan'),
        }),
      });
      if (!res.ok) {
        setError(copy.error);
        return;
      }
      setGranted(true);
    } catch {
      setError(copy.error);
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
          aria-describedby="asset-folder-gate-desc"
          className="fixed left-1/2 top-1/2 z-[310] max-h-[92vh] w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] bg-paper"
        >
          <div className="flex items-center justify-between gap-4 border-b border-green-ink/12 px-5 py-3.5">
            <Dialog.Title className="m-0 truncate font-display text-[1rem] leading-[1.3] text-green-900">
              {copy.title}
            </Dialog.Title>
            <Dialog.Close
              aria-label={copy.closeAria}
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-sage/60 text-[1.2rem] leading-none text-green-900 hover:bg-sage"
            >
              ×
            </Dialog.Close>
          </div>

          {granted ? (
            <div className="flex flex-col gap-4 px-5 py-5">
              <Dialog.Description
                id="asset-folder-gate-desc"
                role="status"
                className="m-0 text-[0.9rem] leading-[1.6] text-ink"
              >
                {copy.successBody}
              </Dialog.Description>
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses('green', true, 'uppercase')}
              >
                {copy.openFolder}
              </a>
              <Dialog.Close className={buttonClasses('ghostGreen', true, 'uppercase')}>
                {copy.close}
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
              <Dialog.Description
                id="asset-folder-gate-desc"
                className="m-0 text-[0.85rem] leading-[1.6] text-ink-soft"
              >
                {copy.intro}
              </Dialog.Description>

              <label className="block">
                <span className={labelCls}>{copy.nameLabel}</span>
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
                <span className={labelCls}>{copy.emailLabel}</span>
                <input type="email" name="email" required autoComplete="email" className={inputCls} />
              </label>

              <label className="block">
                <span className={labelCls}>{copy.purposeLabel}</span>
                <textarea
                  name="keperluan"
                  required
                  rows={3}
                  maxLength={2000}
                  className={cn(inputCls, 'resize-y')}
                />
              </label>

              {error && (
                <p role="alert" className="m-0 text-[0.8rem] text-rust">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={buttonClasses(
                  'green',
                  true,
                  cn('uppercase', submitting && 'cursor-not-allowed opacity-70')
                )}
              >
                {submitting ? copy.submitting : copy.submit}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
