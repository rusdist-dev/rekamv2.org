import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PostGrid } from '@/components/news/PostCard';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { getNews, listNews, resolveCover } from '@/lib/content';

/* Replaces berita-detail.html, which was a single hardcoded article that all 34
 * news links on the site pointed at. Every article now has its own URL. */

export async function generateStaticParams() {
  const posts = await listNews();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) return {};

  /* An article is the thing people actually share, so this is where the Open
     Graph work earns its keep: the cover as the card image, the real headline,
     and article:published_time. The cover is a StaticImageData when it comes
     from disk, so .src is the built, hashed path. */
  const cover = resolveCover(post.cover);
  const image = typeof cover === 'string' ? cover : cover?.src;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/berita/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/berita/${post.slug}`,
      publishedTime: post.date.toISOString(),
      ...(image ? { images: [{ url: image, width: 1200, height: 675 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/* The three channels berita-detail.html linked. Not the full footer set: the
   source deliberately omitted YouTube here. */
const SHARE = [
  { href: 'https://www.instagram.com/rekamnusantara/', label: 'Instagram' },
  { href: 'https://www.facebook.com/RekamNusantara', label: 'Facebook' },
  { href: 'https://www.linkedin.com/company/rekamnusantarafoundation/', label: 'LinkedIn' },
];

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) notFound();

  const cover = resolveCover(post.cover);

  /* The source's "Tulisan lain" rail listed the three newest articles
     excluding the current one — not programme-matched. Checked against the
     hardcoded markup: for the ICRS piece it showed the 29 Jul, 17 Jul and
     10 Jul articles, which is exactly that. Reproduced rather than "improved"
     into a programme filter, which would have quietly changed the output. */
  const related = await listNews({ exclude: post.slug, limit: 3 });

  return (
    <SiteShell current="berita">
      <article>
        <Wrap className="article-top pb-[clamp(2rem,4vw,3rem)]">
          <nav aria-label="Remah roti" className="mb-6 text-[0.78rem] text-ink-soft">
            <Link href="/" className="no-underline hover:text-green-900">
              Beranda
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <Link href="/berita" className="no-underline hover:text-green-900">
              Berita
            </Link>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span aria-current="page">Artikel</span>
          </nav>

          <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
            <time dateTime={post.date.toISOString()}>{dateFmt.format(post.date)}</time>
            {post.category && (
              <>
                <span aria-hidden="true"> / </span>
                {post.category}
              </>
            )}
          </p>
          <h1 className="mt-4 mb-0 max-w-[22ch] font-display text-display-lg leading-[1.08] tracking-[-0.015em] text-green-900">
            {post.title}
          </h1>
        </Wrap>

        {cover && (
          <Wrap className="pb-[clamp(2rem,4vw,3rem)]">
            <figure className="m-0">
              <Image
                src={cover}
                alt={post.coverAlt}
                width={1200}
                height={675}
                sizes="(max-width: 1180px) 100vw, 1180px"
                priority
                className="block w-full rounded-sm object-cover"
              />
              {post.coverAlt && (
                <figcaption className="mt-3 text-[0.8rem] leading-[1.6] text-ink-soft">
                  {post.coverAlt}
                </figcaption>
              )}
            </figure>
          </Wrap>
        )}

        <Wrap className="pb-[clamp(3rem,7vw,6rem)]">
          <div className="max-w-[68ch]">
            {post.body ? (
              // The CMS supplies markup for this field; nothing user-authored
              // reaches it today.
              <div
                className="[&_p]:mt-0 [&_p]:mb-6 [&_p]:text-lede [&_p]:leading-[1.75] [&_p]:text-ink-soft [&_p:first-child]:text-lede-lg"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <>
                <p className="mt-0 mb-6 text-lede-lg leading-[1.7] text-ink-soft">{post.excerpt}</p>
                {/* Seventeen of eighteen articles have no body: the old site
                    only ever wrote one, in berita-detail.html. Saying so beats
                    padding the page with invented prose. */}
                <p className="m-0 border-l-2 border-sage pl-4 text-[0.85rem] leading-[1.7] text-ink-soft">
                  Naskah lengkap tulisan ini belum tersedia di situs. Isinya menyusul begitu arsip
                  redaksi tersambung ke CMS.
                </p>
              </>
            )}
          </div>

          <div className="mt-[clamp(2.5rem,5vw,4rem)] border-t border-green-ink/12 pt-6">
            <p className="m-0 font-label text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-soft">
              Bagikan
            </p>
            <ul className="mt-3 mb-0 flex list-none flex-wrap gap-5 p-0">
              {SHARE.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="border-b border-transparent text-[0.9rem] no-underline hover:border-current"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Wrap>
      </article>

      {related.length > 0 && (
        <section className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Baca juga</Eyebrow>
            <Display className="mt-4 mb-[clamp(1.5rem,3vw,2.5rem)] text-display">Tulisan lain</Display>
            {/* The source repeated three post blocks by hand here, on every
                page that carried a rail. One collection now. */}
            <PostGrid posts={related} showExcerpt={false} />
            <ButtonLink href="/berita" variant="ghostGreen" className="mt-[clamp(2rem,4vw,3rem)]">
              Lihat semua berita
            </ButtonLink>
          </Wrap>
        </section>
      )}
    </SiteShell>
  );
}
