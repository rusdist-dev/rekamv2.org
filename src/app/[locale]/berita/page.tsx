import type { Metadata } from 'next';
import Image from 'next/image';
import heroImg from '@/assets/banner/bg_rekamoke1.png';
import card2 from '@/assets/banner/card2.jpg';
import card3 from '@/assets/banner/card3.png';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { PostGrid } from '@/components/news/PostCard';
import { AppLink } from '@/components/ui/AppLink';
import { ButtonLink } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { beritaContent } from '@/i18n/content/berita';
import { t } from '@/i18n/dictionary';
import { featuredNews, listNews, resolveCover } from '@/lib/content';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/berita', {
    title: 'Berita',
    description: 'Catatan lapangan, publikasi, dan kabar acara dari seluruh program REKAM.',
  });
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* The archive shows the 9 newest stories per page below the featured lead —
 * the lead itself sits outside this count, it's a callout, not page 1 of the
 * grid. */
const PAGE_SIZE = 9;

export default async function BeritaPage({
  params,
  searchParams,
}: LocaleParams & { searchParams: Promise<{ page?: string }> }) {
  const locale = await readLocale(params);
  const copy = beritaContent(locale);
  const dict = t(locale);
  const lead = await featuredNews(locale);
  const rest = await listNews({ exclude: lead?.slug, locale });

  /* The lead cover comes from the CMS row's cover_url (resolveCover passes an
   * absolute URL straight through). Articles without one — five of eighteen in
   * the local set — keep the house image rather than leaving a hole in the
   * band. */
  const leadCover = resolveCover(lead?.cover) ?? card3;

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam);
  const currentPage = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = rest.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <SiteShell current="berita">
      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        lede={copy.hero.lede}
        image={heroImg}
        overlay="rgba(10, 20, 16, 0.23)"
        short
      />

      {lead && (
        <section className="bg-cream py-[clamp(3rem,6vw,5rem)]">
          {/* No Wrap here — the cover bleeds to the actual viewport edge on
              the left, same as the home page's "Be Part of the Story" band. */}
          <AppLink
            href={`/berita/${lead.slug}`}
            className="group grid items-center gap-[clamp(1.5rem,4vw,3rem)] no-underline lg:grid-cols-2"
          >
            <span className="block overflow-hidden">
              <Image
                src={leadCover}
                alt={lead.coverAlt}
                width={1200}
                height={675}
                sizes="(max-width: 1000px) 100vw, 50vw"
                priority
                unoptimized={typeof leadCover === 'string'}
                className="block aspect-[16/9] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </span>
            <div className="px-gutter">
              <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                <time dateTime={lead.date.toISOString()}>{dateFmt.format(lead.date)}</time>
                {lead.category && (
                  <>
                    <span aria-hidden="true"> / </span>
                    {lead.category}
                  </>
                )}
              </p>
              <h2 className="mt-3 mb-0 font-display text-quote leading-[1.15] text-green-900">
                {lead.title}
              </h2>
              <p className="mt-4 mb-0 text-lede leading-[1.65] text-ink-soft">{lead.excerpt}</p>
              <span className="mt-7 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-green-700 px-8 text-[1rem] font-bold text-white transition-[background-color,transform] duration-200 group-hover:bg-green-800 group-hover:-translate-y-[2px] motion-reduce:group-hover:translate-y-0">
                {dict.common.readMore}
                <Icon id="i-arrow" className="size-4 fill-none stroke-current" />
              </span>
            </div>
          </AppLink>
        </section>
      )}

      <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="mt-4 mb-3 text-display">OUR STORY</Eyebrow>
          <div aria-hidden="true" className="mb-[clamp(2rem,4vw,3rem)] h-[1px] w-full bg-green-700" />
          {/* <Display className="mt-4 mb-[clamp(2rem,4vw,3rem)] text-display">Semua berita</Display> */}
          <PostGrid posts={pageItems} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/berita"
            labels={copy.list.pagination}
          />
          <p className="mt-[clamp(2rem,4vw,3rem)] mb-0 text-center text-[0.82rem] text-ink-soft">
            {copy.list.count(rest.length === 0 ? 0 : pageStart + 1, pageStart + pageItems.length, rest.length)}
          </p>
        </Wrap>
      </section>

      {/* Same "Be Part of the Story" CTA as the about page, the home page,
          and the programme pages. */}
      <section className="grid bg-white lg:min-h-[30rem] lg:grid-cols-2">
        <div className="self-center px-gutter py-[clamp(3rem,6vw,5rem)] text-center">
          <h2 className="mt-4 mb-0 font-display text-[clamp(2rem,6vw,5em)] leading-[1.15] text-green-900">
            {dict.common.storyBand.heading1}
            <br />
            {dict.common.storyBand.heading2}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/merch" variant="ghostGreen">
              {dict.common.storyBand.shopCta}
            </ButtonLink>
          </div>
        </div>
        <div className="relative h-64 w-full lg:h-full">
          <Image
            src={card2}
            alt={dict.common.storyBand.alt}
            fill
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
    </SiteShell>
  );
}
