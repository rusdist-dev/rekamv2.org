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

/* The three programme pages share this skeleton — hero, overview, by the
 * numbers, news rail, closing — but stay three separate routes rather than one
 * dynamic one. Their content diverges enough to make that worth it: forest has
 * five stat groups, urban three, ocean eleven plus a table. */

export const CLOSING = programs.forest.closing ?? '';

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
        scrollTo="#ikhtisar"
      />

      <section id="ikhtisar" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div>
            <Eyebrow>Overview</Eyebrow>
            {data.overview.body.map((p, i) => (
              <p
                key={p.slice(0, 40)}
                className={
                  i === 0
                    ? 'mt-6 mb-6 text-lede-lg leading-[1.7] text-green-900'
                    : 'mt-0 mb-6 text-lede leading-[1.75] text-ink-soft'
                }
              >
                {p}
              </p>
            ))}
          </div>
          <Image
            src={art}
            alt={data.overview.artAlt}
            sizes="(max-width: 1000px) 100vw, 40vw"
            className="w-full rounded-sm"
          />
        </Wrap>
      </section>

      <section id="dampak" className="bg-band py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Display className="text-display">{data.numbers.title}</Display>
          {data.numbers.lede && (
            <p className="mt-4 mb-10 max-w-[52ch] text-lede leading-[1.65] text-ink-soft">
              {data.numbers.lede}
            </p>
          )}
          <ByTheNumbers groups={data.numbers.groups as StatGroup[]} />
          {data.numbers.note && (
            <p className="mt-8 mb-0 text-[0.85rem] leading-[1.6] text-ink-soft">{data.numbers.note}</p>
          )}
        </Wrap>
      </section>

      {posts.length > 0 && (
        <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            {/* "From Forest" / "From City" / "From Sea" — the source gave each
                programme its own heading, and hid the shared "Berita terkait"
                eyebrow above it. */}
            <Display className="mb-[clamp(1.5rem,3vw,2.5rem)] text-display">{data.postsTitle}</Display>
            <PostGrid posts={posts} showExcerpt={false} />
            <ButtonLink href="/berita" variant="ghostGreen" className="mt-[clamp(2rem,4vw,3rem)]">
              Lihat semua berita
            </ButtonLink>
          </Wrap>
        </section>
      )}

      {data.closing && (
        <section className="bg-cream py-[clamp(3.5rem,8vw,6.5rem)]">
          <Wrap>
            <p className="m-0 max-w-[46ch] font-display text-quote leading-[1.25] text-green-900">
              {data.closing}
            </p>
          </Wrap>
        </section>
      )}
    </SiteShell>
  );
}
