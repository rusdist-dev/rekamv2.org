import type { Metadata } from 'next';
import Image from 'next/image';
import canopy from '@/assets/canopy.jpg';
import mountains from '@/assets/mountains2.png';
import petaKerja from '@/assets/peta-kerja.svg';
import { UNIT_LOGOS } from '@/assets/unit/logos';
import whereWeWork from '@/assets/where-we-work.svg';
import { OrgChart } from '@/components/about/OrgChart';
import { Strategy } from '@/components/about/Strategy';
import { StreetView } from '@/components/about/StreetView';
import { TeamGrid, TeamProvider } from '@/components/about/Team';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { ABOUT } from '@/lib/about/types';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/tentang', {
    title: 'About Us',
    description:
      'Championing Indonesia biodiversity through research and conservation. Visi, misi, strategi, struktur organisasi, dan tim di balik Rekam Nusantara Foundation.',
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

export default function TentangPage() {
  const { team, units } = ABOUT;

  return (
    <TeamProvider>
      <SiteShell current="tentang">
        <PageHero
          eyebrow="What we do"
          title="About Us"
          lede="Championing Indonesia biodiversity through research and conservation."
          image={mountains}
          short
          dim
        />

        <section id="visi-misi" className="grid md:grid-cols-2">
          <div className="bg-cream p-[clamp(2rem,5vw,4rem)]">
            <Display className="text-display">Vision</Display>
            <p className="mt-5 mb-0 max-w-[42ch] text-lede leading-[1.75] text-ink">
              Capturing and preserving the extraordinary natural heritage of the archipelago to
              inspire collective awareness and action for environmental sustainability and a better
              future of Indonesia.
            </p>
          </div>
          <div className="bg-sage p-[clamp(2rem,5vw,4rem)]">
            <Display className="text-display">Mission</Display>
            <p className="mt-5 mb-0 max-w-[42ch] text-lede leading-[1.75] text-ink">
              Integrating art, science, technology and traditional wisdom to realize environmental
              sustainability and human welfare throughout the Indonesian archipelago.
            </p>
          </div>
        </section>

        <section id="strategi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Strategic thinking</Eyebrow>
            <div className="mt-8">
              <Strategy />
            </div>
          </Wrap>
        </section>

        <section id="unit" className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Our units</Eyebrow>
            <Display className="mt-4 text-display">Unit program</Display>
            <p className="mt-5 mb-[clamp(2rem,4vw,3rem)] max-w-[58ch] text-lede leading-[1.7] text-ink-soft">
              Enam unit menjalankan kerja REKAM di lapangan — dari riset rangkong dan perikanan
              sampai penceritaan, komunikasi, penegakan hukum sumber daya alam, dan kota
              berkelanjutan.
            </p>

            <ul className="m-0 grid list-none gap-[clamp(1.5rem,3vw,2.5rem)] p-0 md:grid-cols-2">
              {units.map((unit) => (
                <li key={unit.name} className="flex gap-5 rounded-[14px] bg-white p-6">
                  <div className="w-24 flex-none">
                    {unit.logo && UNIT_LOGOS[unit.logo] ? (
                      <Image
                        src={UNIT_LOGOS[unit.logo]}
                        alt={`Logo ${unit.name}`}
                        sizes="96px"
                        className="w-full"
                      />
                    ) : (
                      /* The source's own fallback for units with no logo. */
                      <span
                        aria-hidden="true"
                        className="grid aspect-square w-full place-items-center rounded-[10px] bg-sage font-display text-[1.4rem] text-green-800"
                      >
                        {unit.letters ??
                          unit.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="m-0 font-display text-title-sm leading-[1.25] text-green-900">
                      {unit.name}
                    </h3>
                    {unit.former && (
                      <p className="mt-1 mb-0 text-[0.78rem] text-ink-soft">{unit.former}</p>
                    )}
                    <p className="mt-3 mb-0 text-[0.92rem] leading-[1.65] text-ink-soft">{unit.text}</p>
                    {unit.href && (
                      <a
                        href={unit.href}
                        className="mt-3 inline-block text-[0.85rem] font-semibold text-green-900 underline underline-offset-4"
                      >
                        {unit.href.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {unit.note && (
                      <p className="mt-3 mb-0 text-[0.8rem] leading-[1.6] text-ink-soft">{unit.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Wrap>
        </section>

        <section id="struktur" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Organization structure</Eyebrow>
            <Display className="mt-4 mb-[clamp(2rem,4vw,3rem)] text-display">
              How we are organised
            </Display>
            <OrgChart />
          </Wrap>
        </section>

        <section id="wilayah" className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Where we work</Eyebrow>
            <Image
              src={petaKerja}
              alt="Peta wilayah kerja REKAM di Indonesia, mencakup Wilayah Pengelolaan Perikanan FMA 571 hingga FMA 718"
              className="mt-6 w-full"
            />
            <Image
              src={whereWeWork}
              alt="Tabel cakupan kerja empat unit: Rangkong Indonesia, FRCI, Natural Resources Crime Unit, dan Urban & Sustainability — pada tingkat nasional, provinsi/tapak, dan Wilayah Pengelolaan Perikanan"
              className="mt-6 w-full"
            />
            {/* Sits under the illustrated map, not in place of it: the map shows
                the fishery management areas, this shows what the ground looks
                like. Nothing loads until the button is pressed. */}
            <StreetView />
          </Wrap>
        </section>

        <section id="tim" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Our team</Eyebrow>
            <Display className="mt-4 text-display">The people behind the work</Display>
            <p className="mt-5 mb-[clamp(2rem,4vw,3rem)] max-w-[62ch] text-lede leading-[1.7] text-ink-soft">
              We are a group of dedicated environmentalists who conduct research, publish scientific
              publications, and disseminate Indonesia natural and cultural treasures through
              engaging audiovisual, text, visual, and graphic content to educate and encourage
              public awareness.
            </p>
            <TeamGrid />

            {/* Every bio, as real markup. The dialog reads from the same data,
                but this is what makes the page complete with JavaScript off —
                the reason the source wrapped each one in <details>. */}
            <div className="sr-only">
              {team.map((p) => (
                <article key={p.id}>
                  <h3>{p.name}</h3>
                  <p>{p.role}</p>
                  {p.bio.map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
                </article>
              ))}
            </div>
          </Wrap>
        </section>

        <section className="bg-cream pt-[clamp(3.5rem,8vw,6.5rem)]">
          <Wrap>
            <Display className="text-hero-sm">Be Part of the Story</Display>
            <Lede>
              Ada gagasan, data, atau kolaborasi yang ingin dibawa bersama? Kami terbuka untuk
              bekerja sama di seluruh lanskap kehidupan Indonesia.
            </Lede>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/donasi#adopsi">Adopt</ButtonLink>
              <ButtonLink href="/donasi">Give</ButtonLink>
              <ButtonLink href="/merch" variant="ghostGreen">
                Shop
              </ButtonLink>
            </div>
          </Wrap>
          <Image src={canopy} alt="" sizes="100vw" className="mt-[clamp(2rem,5vw,4rem)] w-full" />
        </section>
      </SiteShell>
    </TeamProvider>
  );
}
