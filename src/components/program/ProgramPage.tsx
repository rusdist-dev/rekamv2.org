import Image, { type StaticImageData } from 'next/image';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Hero360 } from '@/components/hero/Hero360';
import { PostGrid } from '@/components/news/PostCard';
import { ByTheNumbers, type StatGroup } from '@/components/program/ByTheNumbers';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import type { IconId } from '@/icons';
import { listNews, type Program } from '@/lib/content';
import type { SceneName } from '@/lib/pano/pano-scenes';
import programs from '@/data/programs.json';
import bgForestoke3 from '@/assets/banner/bg_forestoke3.jpeg';
import bgForestoke1Overview from '@/assets/banner/bg_forestoke1_overview.png';
import bgUrbanoke2 from '@/assets/banner/bg_urbanoke2.jpeg';
import bgUrbanoke1Overview from '@/assets/banner/bg_urbanoke1_overview.png';
import bgOceanoke5 from '@/assets/banner/bg_oceanoke5.png';
import bgOceanoke1Overview from '@/assets/banner/bg_oceanoke1_overview.png';
import card2 from '@/assets/banner/card2.jpg';
import bgBanggaPapua from '@/assets/banner/bangga_papua.png';

/* The three programme pages share this skeleton — hero, overview, by the
 * numbers, news rail, closing — but stay three separate routes rather than one
 * dynamic one. Their content diverges enough to make that worth it: forest has
 * five stat groups, urban three, ocean eleven plus a table. */

/* All three programmes ship real photography in place of the procedural
 * scene — a static equirectangular image standing in for footage, same as
 * the homepage hero. */
const HERO_OVERRIDES: Partial<Record<Program, { image: string; bgColor: string; imageOverlay: string; fov?: number }>> = {
  forest: { image: bgForestoke3.src, bgColor: '#c6e9f4', imageOverlay: 'rgba(10, 20, 16, 0.29)' },
  urban: { image: bgUrbanoke2.src, bgColor: '#c6e9f4', imageOverlay: 'rgba(10, 20, 16, 0.26)' },
  // Wider FOV pulls the camera back so the reef photo isn't cropped in tight.
  ocean: { image: bgOceanoke5.src, bgColor: '#496aa2', imageOverlay: 'rgba(10, 20, 16, 0.18)', fov: 90 },
};

/* Forest swaps the side-by-side prose+art overview for a full-bleed photo
 * band beneath the text — everyone else keeps the original two-column
 * layout with its engraved illustration. This is a separate crop of the
 * hero's source art with its sky knocked out to transparent — the hero
 * needs that sky opaque for its WebGL sphere, but here it would otherwise
 * show as a flat colour band, and the terrain's horizon height varies too
 * much across the width for a plain top-crop to hide it. */
const OVERVIEW_BANNER: Partial<Record<Program, { image: string; bgColor?: string; fade?: boolean }>> = {
  forest: { image: bgForestoke1Overview.src, fade: true },
  urban: { image: bgUrbanoke1Overview.src, bgColor: '#f4f2eb' },
  ocean: { image: bgOceanoke1Overview.src, bgColor: '#f4f2eb', fade: true },
};

/* Forest swaps the generic two-column "Be Part of the Story" CTA for a
   full-bleed photo band with the copy set directly over the image — urban
   and ocean keep the shared version below. */
const STORY_BANNER: Partial<
  Record<Program, { image: string; eyebrow: string; title: string; ctaLabel: string; ctaHref: string }>
> = {
  forest: {
    image: bgBanggaPapua.src,
    eyebrow: 'Bangga Papua',
    title: 'Back to the roots',
    ctaLabel: 'Learn more',
    ctaHref: '/initiative',
  },
};

export async function ProgramPage({
  program,
  art,
  icons,
}: {
  program: Program;
  /** The engraved illustration beside the overview prose. */
  art: StaticImageData;
  /** Symbols this page's stat groups reference. */
  icons: IconId[];
}) {
  const data = programs[program];
  const posts = await listNews({ program, limit: 3 });

  return (
    <SiteShell hero current={program} icons={icons}>
      <Hero360
        scene={data.scene as SceneName}
        eyebrow={data.hero.eyebrow}
        title={data.hero.title}
        sources={data.hero.sources}
        image={HERO_OVERRIDES[program]?.image}
        fov={HERO_OVERRIDES[program]?.fov}
        bgColor={HERO_OVERRIDES[program]?.bgColor}
        imageOverlay={HERO_OVERRIDES[program]?.imageOverlay}
        scrollTo="#ikhtisar"
      />

      {(() => {
        const banner = OVERVIEW_BANNER[program];
        const prose = data.overview.body.map((p, i) => (
          <p
            key={p.slice(0, 40)}
            className={
              i === 0
                ? 'mt-6 mb-6 text-justify text-lede-lg leading-[1.7] text-ink-soft'
                : 'mt-0 mb-6 text-justify text-lede-lg leading-[1.7] text-ink-soft'
            }
          >
            {p}
          </p>
        ));

        if (banner) {
          return (
            <section
              id="ikhtisar"
              className="overflow-hidden"
              style={banner.bgColor ? { backgroundColor: banner.bgColor } : undefined}
            >
              <Wrap className="py-[clamp(3rem,7vw,6rem)] mb-5">
                <Eyebrow>Overview</Eyebrow>
                {prose}
              </Wrap>
              <div className="relative aspect-[3246/906] w-full">
                <Image
                  src={banner.image}
                  alt={data.overview.artAlt}
                  fill
                  sizes="100vw"
                  className={banner.fade ? 'object-cover opacity-70' : 'object-cover'}
                />
              </div>
            </section>
          );
        }

        return (
          <section id="ikhtisar" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
            <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
              <div>
                <Eyebrow>Overview</Eyebrow>
                {prose}
              </div>
              <Image
                src={art}
                alt={data.overview.artAlt}
                sizes="(max-width: 1000px) 100vw, 40vw"
                className="w-full rounded-sm"
              />
            </Wrap>
          </section>
        );
      })()}

      <section id="dampak" className="bg-white py-7">
        <Wrap>
          <Eyebrow>Impact</Eyebrow>
          <Display className="mt-3 text-display text-black">{data.numbers.title}</Display>
          {data.numbers.lede && (
            <p className="mt-3 mb-8 max-w-[68ch] text-lede leading-[1.6] text-ink-soft">
              {data.numbers.lede}
            </p>
          )}
          <div/>
          <ByTheNumbers
            groups={data.numbers.groups as StatGroup[]}
            variant={program === 'urban' ? 'urban' : program === 'ocean' ? 'ocean' : 'default'}
          />
          {data.numbers.note && (
            <p className="mt-10 mb-0 text-[0.8rem] italic leading-[1.6] text-ink-soft">{data.numbers.note}</p>
          )}
        </Wrap>
      </section>

      {posts.length > 0 && (
        <section className="bg-cream py-7">
          <Wrap>
            {/* "From Forest" / "From City" / "From Sea" — the source gave each
                programme its own heading, and hid the shared "Berita terkait"
                eyebrow above it. */}
            <Display className="mb-[clamp(1.5rem,3vw,2.5rem)] text-[45px] text-green-700">
              {data.postsTitle}
            </Display>
            <PostGrid posts={posts} showExcerpt={false} accent ctaLabel="Read more" ctaBold={false} />
          </Wrap>
        </section>
      )}

      {(() => {
        const banner = STORY_BANNER[program];

        if (banner) {
          return (
            <section className="relative isolate aspect-[21/8] min-h-[24rem] w-full overflow-hidden">
              <Image
                src={banner.image}
                alt=""
                fill
                sizes="100vw"
                className="absolute inset-0 -z-10 size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(8,20,14,0.6)] via-[rgba(8,20,14,0.28)] to-[rgba(8,20,14,0.05)]"
              />
              <div className="absolute inset-0 flex items-center">
                <Wrap>
                  <div className="max-w-[24rem]">
                    <p className="m-0 font-display text-2xl leading-none text-white/95">{banner.eyebrow}</p>
                    <h2 className="mt-3 mb-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-white">
                      {banner.title}
                    </h2>
                    <ButtonLink href={banner.ctaHref} variant="green" className="mt-8">
                      {banner.ctaLabel.toUpperCase()} →
                    </ButtonLink>
                  </div>
                </Wrap>
              </div>
            </section>
          );
        }

        /* Same "Be Part of the Story" CTA as the home page — not
            programme-specific, so it's identical across urban/ocean. */
        return (
          <section className="grid bg-white lg:min-h-[30rem] lg:grid-cols-2">
            <div className="self-center px-gutter py-[clamp(3rem,6vw,5rem)] text-center">
              <h2 className="mt-4 mb-0 font-display text-[clamp(2rem,6vw,5em)] leading-[1.15] text-green-900">
                Be Part of
                <br />
                the Story
              </h2>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/merch" variant="ghostGreen">
                  Shop
                </ButtonLink>
              </div>
            </div>
            <div className="relative h-64 w-full lg:h-full">
              <Image
                src={card2}
                alt="Empat relawan REKAM berjalan bersama membawa buku dan materi kampanye"
                fill
                sizes="(max-width: 1000px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </section>
        );
      })()}
    </SiteShell>
  );
}
