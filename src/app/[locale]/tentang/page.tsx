import type { Metadata } from 'next';
import Image from 'next/image';
import bgTentang from '@/assets/banner/bg_tentang.png';
import card2 from '@/assets/banner/card2.jpg';
import { PARTNER_LOGOS } from '@/assets/partners/logos';
import petaKerja from '@/assets/peta-kerja.svg';
import { UNIT_LOGOS } from '@/assets/unit/logos';
import whereWeWork from '@/assets/where-we-work.svg';
import { OrgChart } from '@/components/about/OrgChart';
import { Strategy } from '@/components/about/Strategy';
// import { StreetView } from '@/components/about/StreetView';
import { TeamGrid, TeamProvider } from '@/components/about/Team';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
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
          title="Championing Indonesia biodiversity through research and conservation."
          image={bgTentang}
          overlay="rgba(10, 20, 16, 0.5)"
          longTitle
          fullImage
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
            <Display className="mt-4 text-display text-black">Unit program</Display>
            <p className="mt-5 mb-[clamp(2.5rem,5vw,3.5rem)] max-w-[58ch] text-lede leading-[1.7] text-ink-soft">
              Six units carry out REKAM&rsquo;s work on the ground — from hornbill and fisheries
              research to storytelling, communications, natural-resource law enforcement, and
              sustainable cities.
            </p>

            <ul className="m-0 grid list-none gap-x-[clamp(2rem,5vw,4rem)] gap-y-[clamp(2rem,4vw,3rem)] p-0 md:grid-cols-3">
              {units.map((unit) => (
                <li key={unit.name} className="flex flex-col items-start">
                  <Image
                    src={UNIT_LOGOS[unit.logo]}
                    alt={`${unit.name} logo`}
                    className="h-11 w-auto object-contain object-left"
                  />

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
            <Eyebrow>Organization structure</Eyebrow>
            <Display className="mt-4 mb-[clamp(2rem,4vw,3rem)] text-display text-black">
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
            {/* <StreetView /> */}
          </Wrap>
        </section>

        {/* Same "Be Part of the Story" CTA as the home page and the
            programme pages. */}
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

        <section id="kolaborasi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Collaboration</Eyebrow>
            <p className="mt-3 mb-[clamp(2rem,4vw,3rem)] max-w-[62ch] text-lede leading-[1.7] text-ink-soft">
              Strong partnerships we build in good relationships, through open dialogue and
              effective communication.
            </p>

            <ul className="m-0 grid grid-cols-10 gap-x-6 gap-y-8 p-0">
              {PARTNER_LOGOS.map(({ name, logo }, i) => (
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
            <Eyebrow>Our team</Eyebrow>
            <Display className="mt-4 text-display">The people behind the work</Display>
            <p className="mt-5 mb-[clamp(2rem,4vw,3rem)] max-w-[62ch] text-lede leading-[1.7] text-ink-soft">
              We are a group of dedicated environmentalists who conduct research, publish scientific
              publications, and disseminate Indonesia natural and cultural treasures through
              engaging audiovisual, text, visual, and graphic content to educate and encourage
              public awareness.
            </p>
            <TeamGrid />
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
        </section> */}
      </SiteShell>
    </TeamProvider>
  );
}
