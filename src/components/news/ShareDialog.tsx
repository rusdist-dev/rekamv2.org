'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState } from 'react';
import { buttonClasses } from '@/components/ui/button-classes';
import { beritaContent } from '@/i18n/content/berita';
import type { Locale } from '@/i18n/config';

/* The share row under an article used to be three links to REKAM's own
 * Instagram, Facebook and LinkedIn pages — carried over from
 * berita-detail.html, where they were the only thing resembling a share
 * control. They never shared anything: a reader who pressed one landed on the
 * foundation's profile with the article left behind.
 *
 * These are the real thing — each network's own composer, opened with this
 * article's URL already in it, so the reader posts to their own account. The
 * destinations are each platform's documented intent endpoint and need no key
 * and no SDK:
 *   facebook.com/sharer/sharer.php?u=      — pulls title and image from the
 *                                            page's Open Graph tags
 *   x.com/intent/post?url=&text=           — the old twitter.com/intent/tweet
 *                                            still redirects here; this is the
 *                                            address it redirects to
 *   linkedin.com/sharing/share-offsite/?url=
 *   threads.net/intent/post?text=          — one field only, so the title and
 *                                            the link go in together
 *   wa.me/?text=                            — plain text, so the title rides
 *                                            along with the link
 *   mailto:                                 — the reader's own mail client
 *
 * Instagram has no such endpoint (it accepts no pre-filled web composer at
 * all), which is why it is not here even though it is in the footer. The
 * copy-link field covers it and every other app besides.
 *
 * The brand marks are inline rather than in @/icons: that sprite is REKAM's
 * own line-icon set, and these six are foreign glyphs used in one dialog. */

type Channel = {
  name: string;
  /** Built per article; `u` is already encoded. */
  href: (u: string, title: string) => string;
  mark: React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    name: 'Facebook',
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    mark: (
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true" focusable="false">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.33-.04-1.56-.14-2.86-.14C11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: (u, title) => `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(title)}`,
    mark: (
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true" focusable="false">
        <path d="M18.9 2H22l-7.1 8.1L23.2 22h-6.5l-5.1-6.6L5.8 22H2.7l7.6-8.7L2 2h6.7l4.6 6.1L18.9 2Zm-1.1 18h1.7L7.3 3.7H5.5L17.8 20Z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    mark: (
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true" focusable="false">
        <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
      </svg>
    ),
  },
  {
    name: 'Threads',
    href: (u, title) => `https://www.threads.net/intent/post?text=${encodeURIComponent(title)}%20${u}`,
    mark: (
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true" focusable="false">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221Z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: (u, title) => `https://wa.me/?text=${encodeURIComponent(title)}%20${u}`,
    mark: (
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true" focusable="false">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.5 1.34 5.02L2 22l5.1-1.34A9.95 9.95 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.17c-1.55 0-3.07-.42-4.4-1.2l-.32-.19-3.03.8.81-2.95-.21-.31a8.15 8.15 0 0 1-1.25-4.32c0-4.5 3.67-8.17 8.18-8.17 4.5 0 8.17 3.67 8.17 8.17 0 4.51-3.67 8.17-8.17 8.17Zm4.49-6.12c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.55.13-.17.24-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.48-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.47-.29Z" />
      </svg>
    ),
  },
  {
    name: 'Email',
    href: (u, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title)}%0A%0A${u}`,
    mark: (
      <svg
        viewBox="0 0 24 24"
        className="size-6 fill-none stroke-current"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.8 7 8.2 5.8L20.2 7" />
      </svg>
    ),
  },
];

export function ShareDialog({ locale, url, title }: { locale: Locale; url: string; title: string }) {
  const copy = beritaContent(locale).detail.shareDialog;
  const [copied, setCopied] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const encoded = encodeURIComponent(url);

  /* navigator.clipboard is undefined on plain http and can reject when the
     page is not focused, so a failure falls back to selecting the field —
     the reader can still press Ctrl+C, which is what the field is for. */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      field.current?.select();
    }
  }

  return (
    <Dialog.Root onOpenChange={() => setCopied(false)}>
      <Dialog.Trigger className={buttonClasses('ghostGreen', false, 'mt-3')}>{copy.trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-night/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[310] w-[min(30rem,92vw)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] bg-paper px-[clamp(1.5rem,4vw,2.5rem)] py-[clamp(1.75rem,4vw,2.5rem)]">
          <Dialog.Close
            aria-label={copy.close}
            className="absolute right-4 top-4 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[1.3rem] leading-none text-ink-soft hover:bg-sage/60 hover:text-green-900"
          >
            ×
          </Dialog.Close>

          <Dialog.Title className="m-0 text-center font-display text-[1.6rem] leading-[1.2] text-green-900">
            {copy.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 mb-0 text-center text-[0.9rem] leading-[1.6] text-ink-soft">
            {copy.lede}
          </Dialog.Description>

          {/* Six channels: three to a row rather than four, so the grid is two
              even rows instead of a row of four and an orphaned pair. */}
          <ul className="mx-auto mt-[clamp(1.5rem,4vw,2.25rem)] mb-0 grid max-w-[24rem] list-none grid-cols-2 gap-x-4 gap-y-6 p-0 xs:grid-cols-3">
            {CHANNELS.map((c) => (
              <li key={c.name} className="flex flex-col items-center gap-2">
                <a
                  href={c.href(encoded, title)}
                  {...(c.name === 'Email' ? {} : { target: '_blank', rel: 'noreferrer' })}
                  aria-label={`${copy.shareTo} ${c.name}`}
                  className="grid size-14 place-items-center rounded-full bg-sage/50 text-green-900 no-underline transition-colors hover:bg-sage"
                >
                  {c.mark}
                </a>
                <span className="text-[0.85rem] leading-[1.4] text-ink">{c.name}</span>
              </li>
            ))}
          </ul>

          <div className="mt-[clamp(1.75rem,4vw,2.5rem)]">
            <label
              htmlFor="share-page-link"
              className="m-0 block text-[0.8rem] font-semibold text-ink md:text-right"
            >
              {copy.linkLabel}
            </label>
            <div className="mt-2 flex items-stretch gap-2">
              <input
                id="share-page-link"
                ref={field}
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-[10px] border border-green-ink/15 bg-white px-3 py-2.5 text-[0.85rem] text-ink-soft"
              />
              <button
                type="button"
                onClick={() => void copyLink()}
                aria-label={copy.copy}
                className="shrink-0 cursor-pointer rounded-[10px] border border-green-ink/15 bg-white px-3 text-[0.8rem] font-semibold text-green-900 hover:bg-sage/50"
              >
                {copied ? copy.copied : copy.copy}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
