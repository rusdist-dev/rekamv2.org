'use client';

import * as Dialog from '@radix-ui/react-dialog';

/* Same shape as PdfReadButton (src/components/publication/PdfReadButton.tsx):
 * a trigger that opens the real thing inline instead of navigating away. The
 * homepage's YouTube cards used to be plain <a target="_blank"> links to
 * youtube.com; `children` is now that same card markup, wrapped as the
 * dialog trigger, so clicking it opens the video here instead of leaving the
 * page. Radix only mounts Dialog.Content while open, so the iframe - and
 * whatever is playing in it - is torn down the moment the dialog closes. */
export function YoutubeWatchModal({
  videoId,
  title,
  watchOnYoutubeLabel,
  children,
}: {
  videoId: string;
  title: string;
  watchOnYoutubeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[310] w-[min(56rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px] bg-paper"
        >
          <div className="flex items-center justify-between gap-4 border-b border-green-ink/12 px-5 py-3.5">
            <Dialog.Title className="m-0 truncate font-display text-[1rem] leading-[1.3] text-green-900">
              {title}
            </Dialog.Title>
            <div className="flex shrink-0 items-center gap-4">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden text-[0.8rem] font-semibold text-green-900 underline underline-offset-4 sm:inline"
              >
                {watchOnYoutubeLabel}
              </a>
              <Dialog.Close
                aria-label="Tutup"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-sage/60 text-[1.2rem] leading-none text-green-900 hover:bg-sage"
              >
                ×
              </Dialog.Close>
            </div>
          </div>
          <div className="aspect-video w-full bg-sage/20">
            <iframe
              key={videoId}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
