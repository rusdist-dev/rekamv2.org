import type { Metadata } from 'next';
import Image from 'next/image';
import bgPublication from '@/assets/banner/bg_rekamoke1.png';
import card2 from '@/assets/banner/card2.jpg';
import impactReport from '@/assets/banner/impact-report.png';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { Button, ButtonLink } from '@/components/ui/button';
import { Eyebrow, Wrap } from '@/components/ui/primitives';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { cn } from '@/lib/cn';
import { getNews, resolveCover } from '@/lib/content';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/publication', {
    title: 'Publication',
    description:
      'Laporan riset, jurnal ilmiah, dan materi publikasi dari seluruh program Rekam Nusantara Foundation.',
  });
}

/* Achievement cards. The Impact Report is a document with no article of its
 * own, so its two buttons point at the cover image itself — a real file,
 * rather than a dead "#" — until an actual PDF exists to swap in. The other
 * two reuse real /berita entries (same cover, same story) rather than
 * inventing content: "Download" and "Read online" both go to the article,
 * since there's no separate downloadable asset for a web story. */
async function achievements() {
  const [lastPlace, papuaPride] = await Promise.all([
    getNews('the-last-place-on-earth-perjalanan-sembilan-tahun-yang-berbuah-penghargaan-internasional'),
    getNews('bangga-papua-hutan-papua-yang-dibangun-oleh-burung'),
  ]);

  const impactReportHref = typeof impactReport === 'string' ? impactReport : impactReport.src;

  return [
    {
      key: 'impact-report',
      title: 'Impact Report Rekam Nusantara Foundation 2025',
      description:
        'The world continues to face various environmental challenges. Climate change, natural resource degradation, and socio-economic disparities are urgent issues that require innovative and sustainable solutions.',
      cover: impactReport,
      downloadHref: impactReportHref,
      readHref: impactReportHref,
    },
    lastPlace && {
      key: lastPlace.slug,
      title: lastPlace.title,
      description:
        'The investigative documentary produced by OPS, Planet Expert and Catalyst with INFIS has won the Grand Prize.',
      cover: resolveCover(lastPlace.cover),
      downloadHref: `/berita/${lastPlace.slug}`,
      readHref: `/berita/${lastPlace.slug}`,
    },
    papuaPride && {
      key: papuaPride.slug,
      title: papuaPride.title,
      description:
        'The hall at SMA Negeri 1 Raja Ampat filled with laughter when Yoki, Forest Program Director, asked a simple question about birds.',
      cover: resolveCover(papuaPride.cover),
      downloadHref: `/berita/${papuaPride.slug}`,
      readHref: `/berita/${papuaPride.slug}`,
    },
  ].filter((x): x is Exclude<typeof x, false | undefined> => Boolean(x));
}

const achievementBtn = 'min-h-[2.5rem] px-5 text-[0.78rem]';

export default async function PublicationPage() {
  const cards = await achievements();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Publication"
        title="What have we achieved"
        lede="Report document from all REKAM programs."
        image={bgPublication}
        overlay="rgba(10, 20, 16, 0.35)"
        short
      />

      {/* Sorotan Impact Report — sama seperti section di halaman /tentang.
          Tombolnya mengarah ke bagian dokumentasi di bawah karena belum ada
          berkas PDF nyata untuk ditautkan. */}
      <section className="grid bg-[#f4f3f1] lg:min-h-[28rem] lg:grid-cols-2">
        <div className="relative order-2 h-64 w-full lg:order-1 lg:h-full">
          <Image
            src={impactReport}
            alt="Sampul Impact Report 2025 Rekam Nusantara Foundation"
            fill
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="w-full h-auto max-h-[500px] object-contain lg:pt-10"
          />
        </div>
        <div className="order-1 self-center px-gutter py-[clamp(2.5rem,5vw,4rem)] lg:order-2">
          <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-green-900">
            <time dateTime="2026-07-29">29 July 2026</time>
            <span aria-hidden="true"> / </span>
            Impact Report
          </p>
          <h2 className="mt-3 mb-0 font-display text-quote leading-[1.15] text-green-900">
            Impact Report 2025
          </h2>
          <p className="mt-4 mb-0 max-w-[46ch] text-lede leading-[1.65] text-ink-soft">
            The world continues to face various environmental challenges. Climate change, natural
            resource degradation, and socio-economic disparities are urgent issues that require
            innovative and sustainable solutions.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="#documentation" variant="green" className="uppercase">
              Download
              <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
            </ButtonLink>
            <ButtonLink href="#documentation" variant="ghostGreen" className="uppercase">
              Read online
              <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="documentation" className="bg-white py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="mt-4 mb-3 text-display">Achievement</Eyebrow>
          <div aria-hidden="true" className="mb-[clamp(2rem,4vw,3rem)] h-px w-full bg-green-ink/15" />

          <ul className="m-0 grid list-none gap-x-[clamp(2rem,5vw,3rem)] gap-y-[clamp(2.5rem,5vw,3rem)] p-0 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <li key={card.key} className="flex flex-col items-start">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-sage">
                  {card.cover && (
                    <Image
                      src={card.cover}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1080px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="mt-5 mb-0 font-display text-title-sm leading-[1.2] text-green-900">
                  {card.title}
                </h3>
                <p className="mt-3 mb-0 flex-1 text-[0.9rem] leading-[1.6] text-ink-soft">{card.description}</p>
                <div className="mt-5 grid w-full grid-cols-2 gap-2">
                  <ButtonLink href={card.downloadHref} variant="green" block className={cn('uppercase', achievementBtn)}>
                    Download
                    <Icon id="i-arrow" className="ml-2 size-3.5 fill-none stroke-current" />
                  </ButtonLink>
                  <ButtonLink href={card.readHref} variant="ghostGreen" block className={cn('uppercase', achievementBtn)}>
                    Read online
                    <Icon id="i-arrow" className="ml-2 size-3.5 fill-none stroke-current" />
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="mt-[clamp(2.5rem,5vw,3.5rem)] h-px w-full bg-green-ink/15" />

          {/* Static for now — a real "load more" needs the CMS-backed
              collection this page will eventually read from. */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button variant="ghostGreen" disabled className="cursor-not-allowed uppercase opacity-60">
              Load more publication
            </Button>
            <Icon id="i-arrow" className="size-4 rotate-45 fill-none stroke-green-900" />
          </div>
        </Wrap>
      </section>
    </SiteShell>
  );
}
