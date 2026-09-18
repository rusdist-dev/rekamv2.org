import type { Metadata } from 'next';
import Image from 'next/image';
import bgPublication from '@/assets/banner/bg_rekamoke1.png';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { PdfDownloadGate } from '@/components/publication/PdfDownloadGate';
import { PdfReadButton } from '@/components/publication/PdfReadButton';
import { buttonClasses } from '@/components/ui/button-classes';
import { Eyebrow, Wrap } from '@/components/ui/primitives';
import { publicationContent } from '@/i18n/content/publication';
import { t } from '@/i18n/dictionary';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { cn } from '@/lib/cn';
import { listPublications } from '@/lib/publication';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/publication', {
    title: 'Publication',
    description:
      'Laporan riset, jurnal ilmiah, dan materi publikasi dari seluruh program Rekam Nusantara Foundation.',
  });
}

/* The achievement grid used to be three copies of one hard-coded PDF, because
 * there was no collection to read. There is now: the lead band shows the
 * publication the CMS flags as featured, the grid shows the rest — the same
 * split /berita makes between its lead article and its archive. */

const achievementBtn = 'min-h-[2.5rem] px-5 text-[0.78rem]';

export default async function PublicationPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const pubCopy = publicationContent(locale);
  const dict = t(locale);
  const publications = await listPublications(locale);
  const lead = publications.find((p) => p.featured) ?? publications[0];
  const rest = publications.filter((p) => p !== lead);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Publication"
        title="What have we achieved"
        lede="Report document from all REKAM programs."
        image={bgPublication}
        overlay="rgba(10, 20, 16, 0.35)"
        short
        breadcrumb={[
          { label: dict.common.breadcrumb.home, href: '/' },
          { label: locale === 'id' ? 'Publikasi' : 'Publication' },
        ]}
        breadcrumbLabel={dict.common.breadcrumb.ariaLabel}
      />

      {/* Sorotan publikasi unggulan — sama seperti section di halaman /tentang. */}
      {lead && (
        <section className="grid bg-[#f4f3f1] lg:min-h-[28rem] lg:grid-cols-2">
          <div className="relative order-2 h-64 w-full lg:order-1 lg:h-full">
            {lead.cover && (
              <Image
                src={lead.cover}
                alt={pubCopy.coverAlt(lead.title)}
                fill
                sizes="(max-width: 1000px) 100vw, 50vw"
                className="w-full h-auto max-h-[500px] object-contain lg:py-10"
              />
            )}
          </div>
          <div className="order-1 self-center px-gutter py-[clamp(2.5rem,5vw,4rem)] lg:order-2">
            <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-green-900">
              {[lead.category, lead.size].filter(Boolean).join(' / ')}
            </p>
            <h2 className="mt-3 mb-0 font-display text-quote leading-[1.15] text-green-900">
              {lead.title}
            </h2>
            <p className="mt-4 mb-0 max-w-[46ch] text-lede leading-[1.65] text-ink-soft">
              {lead.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PdfDownloadGate
                href={lead.downloadUrl}
                title={lead.title}
                className={buttonClasses('green', false, 'uppercase')}
              >
                Download
                <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
              </PdfDownloadGate>
              <PdfReadButton
                href={lead.viewUrl}
                title={lead.title}
                className={buttonClasses('ghostGreen', false, 'uppercase')}
              >
                Read online
                <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
              </PdfReadButton>
            </div>
          </div>
        </section>
      )}

      {/* Hidden entirely while the CMS holds nothing but the featured
          document: an "Achievement" heading over an empty grid reads as a
          broken page, where its absence reads as "there is one publication". */}
      {rest.length > 0 && (
        <section id="documentation" className="bg-white py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow className="mt-4 mb-3 text-display">Achievement</Eyebrow>
            <div aria-hidden="true" className="mb-[clamp(2rem,4vw,3rem)] h-px w-full bg-green-ink/15" />

            <ul className="m-0 grid list-none gap-x-[clamp(2rem,5vw,3rem)] gap-y-[clamp(2.5rem,5vw,3rem)] p-0 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((card) => (
                <li key={card.id} className="flex flex-col items-start">
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
                    <PdfDownloadGate
                      href={card.downloadUrl}
                      title={card.title}
                      className={buttonClasses('green', true, cn('uppercase', achievementBtn))}
                    >
                      Download
                      <Icon id="i-arrow" className="ml-2 size-3.5 fill-none stroke-current" />
                    </PdfDownloadGate>
                    <PdfReadButton
                      href={card.viewUrl}
                      title={card.title}
                      className={buttonClasses('ghostGreen', true, cn('uppercase', achievementBtn))}
                    >
                      Read online
                      <Icon id="i-arrow" className="ml-2 size-3.5 fill-none stroke-current" />
                    </PdfReadButton>
                  </div>
                </li>
              ))}
            </ul>

            {/* The "Load more publication" button that stood here is gone:
                listPublications walks every page of the endpoint, so the grid
                is already the whole collection — the button could only ever
                have been disabled. */}
            <div aria-hidden="true" className="mt-[clamp(2.5rem,5vw,3.5rem)] h-px w-full bg-green-ink/15" />
          </Wrap>
        </section>
      )}
    </SiteShell>
  );
}
