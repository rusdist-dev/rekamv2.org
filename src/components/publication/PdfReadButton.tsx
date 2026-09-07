'use client';

import * as Dialog from '@radix-ui/react-dialog';

/* "Read online" for a real PDF: opens the document inline in a dialog instead
 * of navigating away, so a reader never loses their place on the achievement
 * grid. The iframe leans on the browser's own PDF viewer — no library, and it
 * is what every major desktop browser already does with a bare .pdf src.
 * "Buka di tab baru" and "Unduh" are there for the mobile browsers that show
 * a blank frame instead of rendering the PDF inline. */
export function PdfReadButton({
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
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[310] flex h-[90vh] w-[min(64rem,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] bg-paper"
        >
          <div className="flex items-center justify-between gap-4 border-b border-green-ink/12 px-5 py-3.5">
            <Dialog.Title className="m-0 truncate font-display text-[1rem] leading-[1.3] text-green-900">
              {title}
            </Dialog.Title>
            <div className="flex shrink-0 items-center gap-4">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="hidden text-[0.8rem] font-semibold text-green-900 underline underline-offset-4 sm:inline"
              >
                Buka di tab baru
              </a>
              <a href={href} download className="text-[0.8rem] font-semibold text-green-900 underline underline-offset-4">
                Unduh
              </a>
              <Dialog.Close
                aria-label="Tutup"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-sage/60 text-[1.2rem] leading-none text-green-900 hover:bg-sage"
              >
                ×
              </Dialog.Close>
            </div>
          </div>
          <iframe src={href} title={title} className="min-h-0 flex-1 border-0 bg-sage/20" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
