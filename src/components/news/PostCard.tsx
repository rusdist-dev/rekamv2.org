import Image from 'next/image';
import { Icon } from '@/components/chrome/SvgSprite';
import { AppLink } from '@/components/ui/AppLink';
import { resolveCover, type News } from '@/lib/content';
import { cn } from '@/lib/cn';

/* rekam.css:1381-1456.
 *
 * This one component replaces 33 hand-typed blocks across six files. The same
 * article was retyped in berita.html, a programme page's rail, and
 * berita-detail.html's "Baca juga" — which is exactly how the copies drifted.
 *
 * The date is a real <time datetime> now. The source printed free text. */

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/** Five of eighteen articles reference a cover that is not on disk. Rather than
 *  ship a broken <img>, the media slot becomes a flat tint from the palette —
 *  no new asset, so nothing new can go missing. */
function CoverSlot({ post, className, sizes }: { post: News; className?: string; sizes: string }) {
  const src = resolveCover(post.cover);

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn('block aspect-[16/9] w-full bg-sage/60', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={post.coverAlt}
      width={1200}
      height={675}
      sizes={sizes}
      className={cn('block aspect-[16/9] w-full object-cover', className)}
    />
  );
}

export function PostCard({
  post,
  showExcerpt = true,
  accent = false,
  ctaLabel = 'Baca selengkapnya',
  ctaBold = true,
}: {
  post: News;
  showExcerpt?: boolean;
  /** Matches the programme page's "From X" rail: brand-green text throughout,
   *  and a cover with its bottom corners left square (only the top is rounded). */
  accent?: boolean;
  /** Urban's rail reads "Read more" in regular weight — every other rail
   *  keeps the source's "Baca selengkapnya", bold. */
  ctaLabel?: string;
  ctaBold?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col">
      <AppLink href={`/berita/${post.slug}`} className="flex h-full flex-col no-underline">
        <span className={cn('block overflow-hidden', accent ? 'rounded-t-xl' : 'rounded-sm')}>
          <CoverSlot
            post={post}
            sizes="(max-width: 720px) 100vw, (max-width: 1000px) 50vw, 33vw"
            className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </span>

        <span
          className={cn(
            'mt-4 block font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em]',
            accent ? 'text-green-700' : 'text-ink-soft'
          )}
        >
          <time dateTime={post.date.toISOString()}>{dateFmt.format(post.date)}</time>
        </span>

        <span
          className={cn(
            'mt-2 block font-display text-title-sm leading-[1.25]',
            accent ? 'font-bold text-green-700' : 'text-green-900'
          )}
        >
          {post.title}
        </span>

        {showExcerpt && post.excerpt && (
          <span className="mt-2 block text-[0.95rem] leading-[1.6] text-ink-soft">
            {post.excerpt}
          </span>
        )}

        <span
          className={cn(
            'mt-auto inline-flex items-center gap-2 pt-3 text-[0.8rem]',
            ctaBold && 'font-semibold',
            accent ? 'text-green-700' : 'text-green-900'
          )}
        >
          {ctaLabel}
          <Icon id="i-arrow" className="size-3 fill-none stroke-current" />
        </span>
      </AppLink>
    </article>
  );
}

/** A grid of them. Used by the archive and by every three-up rail. */
export function PostGrid({
  posts,
  showExcerpt = true,
  accent = false,
  ctaLabel,
  ctaBold,
}: {
  posts: News[];
  showExcerpt?: boolean;
  accent?: boolean;
  ctaLabel?: string;
  ctaBold?: boolean;
}) {
  return (
    <div className="grid gap-x-[clamp(1.5rem,3vw,2.5rem)] gap-y-[clamp(2rem,4vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          showExcerpt={showExcerpt}
          accent={accent}
          ctaLabel={ctaLabel}
          ctaBold={ctaBold}
        />
      ))}
    </div>
  );
}
