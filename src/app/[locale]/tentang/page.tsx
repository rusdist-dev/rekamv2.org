import type { Metadata } from 'next';
import Image from 'next/image';
import bgTentang from '@/assets/banner/bg_tentang.png';
import whereWeWork from '@/assets/where-work.svg';
import { IndonesiaMap } from '@/components/about/IndonesiaMap';
import { OrgChart } from '@/components/about/OrgChart';
import { Strategy } from '@/components/about/Strategy';
// import { StreetView } from '@/components/about/StreetView';
import { TeamGrid, TeamProvider } from '@/components/about/Team';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Icon } from '@/components/chrome/SvgSprite';
import { PageHero } from '@/components/layout/PageHero';
import { PdfReadButton } from '@/components/publication/PdfReadButton';
import { buttonClasses } from '@/components/ui/button-classes';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { ourStoryContent } from '@/i18n/content/our-story';
import { publicationContent } from '@/i18n/content/publication';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { ABOUT, pick, pickList } from '@/lib/about/types';
import { listPartners } from '@/lib/about/partners';
import { listUnits } from '@/lib/about/units';
import { featuredPublication } from '@/lib/publication';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const copy = ourStoryContent(locale).meta;
  return pageMetadata(locale, '/tentang', {
    title: copy.title,
    description: copy.description,
  });
}

/* The largest page in the site, and the only one carrying all four of its
 * hardest pieces: eighteen bios, the org chart with its cross-referenced
 * names, the strategy tablist, and the click-to-load Street View.
 *
 * Bios are rendered here as server components — real text in the HTML — so the
 * source's progressive enhancement survives. The old page put each bio inside
 * a <details> precisely so it was readable with JavaScript off; a dialog that
 * fetched its content on open would have quietly dropped that. */

export default async function TentangPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = ourStoryContent(locale);
  const { team } = ABOUT;
  const units = await listUnits(locale);
  const partners = await listPartners(locale);
  const publication = await featuredPublication(locale);
  const pubCopy = publicationContent(locale);

  return (
    <TeamProvider locale={locale}>
      <SiteShell current="tentang">
        <PageHero
          eyebrow={copy.hero.eyebrow}
          title={copy.hero.title}
          image={bgTentang}
          overlay="rgba(10, 20, 16, 0.5)"
          longTitle
          fullImage
        />

        <section id="visi-misi" className="grid md:grid-cols-2">
          <div className="bg-cream p-[clamp(2rem,5vw,4rem)]">
            <Display className="text-display">{copy.vision.label}</Display>
            <p className="mt-5 mb-0 max-w-[42ch] text-lede leading-[1.75] text-ink">
              {copy.vision.text}
            </p>
          </div>
          <div className="bg-sage p-[clamp(2rem,5vw,4rem)]">
            <Display className="text-display">{copy.mission.label}</Display>
            <p className="mt-5 mb-0 max-w-[42ch] text-lede leading-[1.75] text-ink">
              {copy.mission.text}
            </p>
          </div>
        </section>

        <section id="strategi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.strategy.eyebrow}</Eyebrow>
            <div className="mt-8">
              <Strategy locale={locale} />
            </div>
          </Wrap>
        </section>

        <section id="unit" className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.units.eyebrow}</Eyebrow>
            <Display className="mt-4 text-display text-black">{copy.units.heading}</Display>
            <p className="mt-5 mb-[clamp(2.5rem,5vw,3.5rem)] max-w-[58ch] text-lede leading-[1.7] text-ink-soft">
              {copy.units.intro}
            </p>

            <ul className="m-0 grid list-none gap-x-[clamp(2rem,5vw,4rem)] gap-y-[clamp(2rem,4vw,3rem)] p-0 md:grid-cols-3">
              {units.map((unit) => (
                <li key={unit.name} className="flex flex-col items-start">
                  {/* A CMS logo is an absolute URL of unknown proportions, so
                      it goes through a plain <img>: next/image would need a
                      width/height pair here, and with `h-11 w-auto` a guessed
                      ratio decides the box width and pads the logo. Bundled
                      art keeps next/image, which reads its own dimensions. */}
                  {typeof unit.logo === 'string' ? (
                    <img
                      src={unit.logo}
                      alt={`${unit.name} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-11 w-auto object-contain object-left"
                    />
                  ) : (
                    unit.logo && (
                      <Image
                        src={unit.logo}
                        alt={`${unit.name} logo`}
                        className="h-11 w-auto object-contain object-left"
                      />
                    )
                  )}

                  <h3 className="mt-4 mb-0 text-[1.05rem] font-semibold leading-[1.3] text-ink">
                    {unit.name}
                  </h3>
                  <p className="mt-2 mb-0 text-[0.9rem] leading-[1.6] text-ink-soft">{unit.text}</p>
                  {unit.href && (
                    <a
                      href={unit.href}
                      className="mt-3 inline-block text-[0.85rem] font-semibold text-green-900"
                    >
                      {unit.href.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Wrap>
        </section>

        <section id="struktur" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.org.eyebrow}</Eyebrow>
            <Display className="mt-4 mb-[clamp(2rem,4vw,3rem)] text-display text-black">
              {copy.org.heading}
            </Display>
            <OrgChart locale={locale} />
          </Wrap>
        </section>

        <section id="wilayah" className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.map.eyebrow}</Eyebrow>
            {/* Warna diambil dari token, bukan hex lepas, supaya peta ikut
                berubah bila paletnya digeser. `background` adalah lautnya —
                itu yang bisa disesuaikan, dan alasannya ada di komponen. */}
            <IndonesiaMap
              className="mt-6"
              fullBleed
              provinceUrl="/geo/provinces.json"
              background="var(--color-band)"
              land="var(--color-sage)"
              outline="var(--color-green-700)"
              marker="var(--color-red-600)"
            />
            {/* This is a table, drawn as a 1117x308 picture. Scaled to fit a
                375px screen its row labels land at about 3px and stop being
                text. A table that is too wide for the screen scrolls
                sideways — so it scrolls, inside its own box, with the floor
                set at the width where the labels are still legible; above
                that width the floor never binds and nothing scrolls.
                -mx/px reaches the scroll area out to both screen edges so the
                first and last columns are not cut off by the gutter, and
                tabIndex makes the box focusable, which is what lets a keyboard
                scroll it. */}
            <div
              role="region"
              aria-label={copy.map.tableAriaLabel}
              tabIndex={0}
              className="mt-6 overflow-x-auto mx-[calc(var(--spacing-gutter)*-1)] px-gutter md:mx-0 md:px-0"
            >
              <Image
                src={whereWeWork}
                alt={copy.map.tableAlt}
                className="w-full min-w-[44rem] md:min-w-0"
              />
            </div>
            {/* Sits under the illustrated map, not in place of it: the map shows
                the fishery management areas, this shows what the ground looks
                like. Nothing loads until the button is pressed. */}
            {/* <StreetView /> */}
          </Wrap>
        </section>

        {/* Publication: sorotan publikasi unggulan dari CMS, menggantikan CTA
            "Be Part of the Story" yang dipakai halaman lain. Datanya sama
            persis dengan band teratas di /publication. */}
        {publication && (
          <section className="grid bg-white lg:min-h-[28rem] lg:grid-cols-2">
            {/* `fill` — a CMS cover is a remote URL with no intrinsic size, and
                matching /publication's own band keeps the two identical. */}
            <div className="relative order-2 h-64 w-full lg:order-1 lg:h-full">
              {publication.cover && (
                <Image
                  src={publication.cover}
                  alt={pubCopy.coverAlt(publication.title)}
                  fill
                  sizes="(max-width: 1000px) 100vw, 50vw"
                  className="w-full h-auto max-h-[500px] object-contain lg:py-10"
                />
              )}
            </div>
            <div className="order-1 self-center px-gutter py-[clamp(2.5rem,5vw,4rem)] lg:order-2">
              <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-green-900">
                {[publication.category ?? copy.impactReport.dateLabel, publication.size]
                  .filter(Boolean)
                  .join(' / ')}
              </p>
              <h2 className="mt-3 mb-0 font-display text-quote leading-[1.15] text-green-900">
                {publication.title}
              </h2>
              <p className="mt-4 mb-0 max-w-[46ch] text-lede leading-[1.65] text-ink-soft">
                {publication.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={publication.downloadUrl}
                  download
                  className={buttonClasses('green', false, 'uppercase')}
                >
                  {copy.impactReport.download}
                  <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
                </a>
                <PdfReadButton
                  href={publication.viewUrl}
                  title={publication.title}
                  className={buttonClasses('ghostGreen', false, 'uppercase')}
                >
                  {copy.impactReport.readOnline}
                  <Icon id="i-arrow" className="ml-2 size-4 fill-none stroke-current" />
                </PdfReadButton>
              </div>
            </div>
          </section>
        )}

        <section id="kolaborasi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.collaboration.eyebrow}</Eyebrow>
            <p className="mt-3 mb-[clamp(2rem,4vw,3rem)] max-w-[62ch] text-lede leading-[1.7] text-ink-soft">
              {copy.collaboration.intro}
            </p>

            {/* 3 straight to 10 left the whole 640-1000px range rendering
                ten columns into a ~600px column — roughly 40px per logo, which
                is below the point where the wordmarks in these files can be
                read at all. The ladder steps instead. */}
            <ul className="m-0 grid grid-cols-3 xs:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-x-6 gap-y-8 p-0">
              {/* The CMS marks are full-size PNGs — 350KB on average, and one
                  of them 1.2MB — for a 56px-tall cell, so they go through
                  next/image rather than being served raw. `fill` needs no
                  intrinsic dimensions, which is what makes a remote logo of
                  unknown proportions work here at all. */}
              {partners.map(({ name, logo }, i) => (
                <li key={`${name}-${i}`} className="relative h-14 w-full list-none">
                  <Image src={logo} alt={name} fill sizes="120px" className="object-contain" />
                </li>
              ))}
            </ul>
          </Wrap>
        </section>

        {/* Every bio, as real markup. The dialog reads from the same data,
            but this is what makes the page complete with JavaScript off —
            the reason the source wrapped each one in <details>. */}
        {/* <section id="tim" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.team.eyebrow}</Eyebrow>
            <Display className="mt-4 text-display">{copy.team.heading}</Display>
            <p className="mt-5 mb-[clamp(2rem,4vw,3rem)] max-w-[62ch] text-lede leading-[1.7] text-ink-soft">
              {copy.team.intro}
            </p>
            <TeamGrid locale={locale} />
            <div className="sr-only">
              {team.map((p) => (
                <article key={p.id}>
                  <h3>{p.name}</h3>
                  <p>{pick(p.role, locale)}</p>
                  {pickList(p.bio, locale).map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
                </article>
              ))}
            </div>
          </Wrap>
        </section> */}
      </SiteShell>
    </TeamProvider>
  );
}
