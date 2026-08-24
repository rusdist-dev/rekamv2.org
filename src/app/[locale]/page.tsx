import Image from 'next/image';
import cardPhoto from '@/assets/card-photo.jpg';
import newsIcrs from '@/assets/news-icrs.jpg';
import bgRekamoke3 from '@/assets/banner/bg_rekamoke3.jpeg';
import borderRekamoke1 from '@/assets/banner/border_rekamoke1.png';
import borderRekamoke2 from '@/assets/banner/border_rekamoke2.png';
import card1 from '@/assets/banner/card1.jpg';
import cardForest from '@/assets/banner/card_forest.png';
import cardUrban from '@/assets/banner/card_urban.png';
import cardOcean from '@/assets/banner/card_ocean.png';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Hero360 } from '@/components/hero/Hero360';
import { AppLink } from '@/components/ui/AppLink';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { featuredNews, getNews, resolveCover } from '@/lib/content';
import { cn } from '@/lib/cn';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* One flagship figure per programme, all measuring the same kind of thing: how
   much ground the work actually covered. Each links to that programme's full
   set of figures. Tints use the deep variants — white on --blue and --olive
   fails AA, same finding as the number cards. */
const STATS = [
  { href: '/program/forest', icon: 'i-route', value: '19.000', unit: 'Ha', label: 'Customary Forest Established', when: 'Forest · 2025', tint: 'bg-olive-deep' },
  { href: '/program/urban', icon: 'i-bin', value: '512,2', unit: 'Ton', label: 'Total waste collected', when: 'Urban · 2025', tint: 'bg-rust' },
  { href: '/program/ocean', icon: 'i-shield', value: '23', label: 'Kawasan konservasi perairan', when: 'Ocean · 2022–2025', tint: 'bg-blue-deep' },
] as const;

const CARDS = [
  { href: '/program/forest', img: cardForest, kicker: 'Forest', body: 'Mapping what still stands, with the people who keep it standing.', alt: 'Ilustrasi sketsa lembah hutan dengan sungai berkelok' },
  { href: '/program/urban', img: cardUrban, kicker: 'Urban and sustainability', body: 'Where the city makes room for what lives in it.', alt: 'Ilustrasi sketsa desa dan permukiman di lereng gunung' },
  { href: '/program/ocean', img: cardOcean, kicker: 'Ocean', body: 'Counting what the sea gives, and who it gives it to.', alt: 'Ilustrasi sketsa terumbu karang dengan lumba-lumba, hiu, dan ikan' },
] as const;

/* The home page's featured article is NOT the archive's lead post. The source
   picked the ICRS piece here and "Searching for the Architects" on berita.html,
   so this is named rather than derived — deriving it would silently change
   which story the front page leads with. */
const FEATURE_SLUG = 'rekam-di-icrs-2026-membawa-neraca-sumber-daya-laut-indonesia-ke-panggung-global';

/* Shell only: these are REKAM's own photographs standing in for live posts.
   Wire to the Instagram Graph API (Business/Creator account plus a long-lived
   token) to make it a real feed. The note under the grid says so out loud,
   which is the source's stance and worth keeping. */
const IG_TILES = [
  'bangga-papua-hutan-papua-yang-dibangun-oleh-burung',
  'cerita-laut-dan-masa-depannya-mendorong-peran-generasi-muda-dalam-menjaga-masa-depan-laut-indonesia',
  'ketika-hutan-bercerita-film-manusia-dan-masa-depan-kehidupan',
  'rumah-baru-untuk-sains-dan-solusi-berbasis-alam-meresmikan-stasiun-riset-terpadu-jogo-laut',
  'dari-perairan-lokal-ke-dialog-global-indonesia-di-sharks-international-2026',
];

export default async function Home() {
  const feature = (await getNews(FEATURE_SLUG)) ?? (await featuredNews());
  const featureCover = resolveCover(feature?.cover);
  const igPosts = (await Promise.all(IG_TILES.map((s) => getNews(s)))).filter(Boolean);

  return (
    <SiteShell hero icons={['i-route', 'i-bin', 'i-shield']}>
      <Hero360
        scene="coast"
        image={bgRekamoke3.src}
        eyebrow="What we conserve?"
        title={
          <>
            Documenting knowledge
            <br />
            Preserving life
          </>
        }
        lightPano
        bgColor="#b7ccc7"
        imageOverlay="rgba(10, 20, 16, 0.12)"
        scrollTo="#lanskap"
      />

      {/* rekam.css:518-551. A panorama under a flat scrim, with the quote set
          in white over it — not a plain cream band. */}
      <section
        id="lanskap"
        className="relative isolate overflow-hidden bg-white aspect-[1177/329] min-h-[16rem]"
      >
        <Image
          src={borderRekamoke1}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(7,93,84,0.71)]" />
        <div className="absolute inset-0 flex items-center">
          <Wrap>
            <Eyebrow light>Who we are</Eyebrow>
            <p className="mt-6 mb-0 max-w-[46ch] font-display text-4xl leading-[1.28] text-white text-pretty">
              Documenting living Indonesia: in forests, in seas, in cities. What we gather becomes
              conservation that lasts.
            </p>
          </Wrap>
        </div>
      </section>

      <section id="program" className="bg-band py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="text-center">Our program</Eyebrow>
          <h2 className="mt-4 mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center font-display text-4xl font-normal text-green-900">
            Forest <span aria-hidden="true" className="inline-block h-8 w-px bg-green-900/40" />
            Urban <span aria-hidden="true" className="inline-block h-8 w-px bg-green-900/40" />
            Ocean
          </h2>

          <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
            {CARDS.map((card) => (
              <li key={card.href}>
                <AppLink href={card.href} className="group block no-underline">
                  <span className="relative block overflow-hidden rounded-sm">
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <Image
                        src={card.img}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>

                    <Icon
                      id="i-arrow"
                      className="absolute bottom-3 right-3 size-7 fill-none stroke-yellow stroke-[4]"
                    />
                  </span>
                  <span className="mt-4 block font-label text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {card.kicker}
                  </span>
                  <span className="mt-2 block text-title-xs leading-[1.3] text-green-900">
                    {card.body}
                  </span>
                  <span className="mt-3 block text-[0.8rem] uppercase text-green-900">
                    Pelajari selengkapnya
                  </span>
                </AppLink>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section id="dampak" className="relative isolate overflow-hidden bg-white py-14">
        <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="py-16">
            <h2 className="text-left text-6xl font-display text-green-900">Our<br />Impact</h2>
            <p className="mt-6 mb-0 max-w-[42ch] text-title-sm leading-[1.5] text-green-900">
              We count because decisions are made from counts. Every number below came from
              someone standing in a place, writing it down.
              <br />
              This is where the record stands today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[clamp(1rem,2.5vw,1.75rem)] sm:grid-cols-2">
            {STATS.map((stat, i) => (
              <AppLink
                key={stat.href}
                href={stat.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-[28px] p-4 text-center text-white no-underline transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0',
                  stat.tint,
                  // Forest sits alone in the top row, a wide landscape card;
                  // Urban is a tall portrait card below it; Ocean stays close
                  // to square — mixed shapes, not one uniform height.
                  i === 0 && 'sm:col-start-2 min-h-[13rem]',
                  i === 1 && 'min-h-[17rem]',
                  i === 2 && 'min-h-[17rem]'
                )}
              >
                <Icon id={stat.icon} className="size-10 fill-none stroke-current stroke-[1.6]" />
                {/* The unit is a flex sibling rather than a vertical-align'd
                    <sup>. Same look, but a shifted inline has no clean box for
                    axe to resolve a background against, so it reported the
                    white unit as sitting on the page ground at 1.09:1 when it
                    is in fact inside a tinted card. */}
                <p className="m-0 flex items-start gap-1 text-stat-lg font-bold leading-none tracking-[-0.02em]">
                  <span>{stat.value}</span>
                  {'unit' in stat && stat.unit && (
                    <span className="mt-[0.15em] text-[0.3em] font-bold leading-none">{stat.unit}</span>
                  )}
                </p>
                <p className="m-0 text-xs font-bold leading-[1.35]">{stat.label}</p>
                <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.04em] text-white">
                  {stat.when}
                </p>
              </AppLink>
            ))}
          </div>
        </Wrap>
      </section>

      {feature && (
        <section id="berita" className="grid bg-green-700 lg:grid-cols-2">
          <div className="order-2 self-center px-gutter py-[clamp(3rem,6vw,5rem)] lg:order-1">
            <p className="m-0 font-label text-[0.92rem] font-semibold uppercase tracking-[0.18em] text-white/85">
              <time dateTime={feature.date.toISOString()}>{dateFmt.format(feature.date)}</time>
              {feature.category && (
                <>
                  <span aria-hidden="true"> / </span>
                  {feature.category}
                </>
              )}
            </p>
            <h2 className="mt-4 mb-0 font-display text-4xl leading-[1.15] text-white">
              {feature.title}
            </h2>
            <ButtonLink href={`/berita/${feature.slug}`} variant="cream" className="mt-8">
              Read More
            </ButtonLink>
          </div>
          <Image
            src={featureCover ?? newsIcrs}
            alt=""
            width={1302}
            height={744}
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="order-1 h-full w-full object-cover lg:order-2"
          />
        </section>
      )}

      <section aria-label="Galeri kegiatan" className="bg-mauve py-[clamp(2rem,4vw,3rem)]">
        <ul className="m-0 flex list-none gap-4 overflow-x-auto px-gutter p-0 [scrollbar-width:thin]">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="w-[286px] flex-none">
              <AppLink href="/berita" className="group block no-underline">
                <Image
                  src={cardPhoto}
                  alt={i === 0 ? 'Tangan menanam bibit pohon di dalam pot' : ''}
                  width={286}
                  height={200}
                  className="block h-[200px] w-full rounded-sm object-cover"
                />
                <span className="mt-2 flex items-center justify-between gap-2 text-[0.78rem] text-green-800">
                  Our 10th Anniversary
                  <Icon id="i-arrow" className="size-3 fill-none stroke-current stroke-[4]" />
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ig-title" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Lately</Eyebrow>
            <Display id="ig-title" className="mt-3 text-display">
              @rekamnusantara
            </Display>
          </div>
          <ButtonLink href="https://www.instagram.com/rekamnusantara/" variant="ghostGreen">
            Ikuti kami
          </ButtonLink>
        </Wrap>

        <Wrap className="mt-[clamp(2rem,4vw,3rem)]">
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {igPosts.map((post) => {
              const cover = resolveCover(post!.cover);
              return (
                <li key={post!.slug}>
                  <a
                    href="https://www.instagram.com/rekamnusantara/"
                    aria-label="Buka Instagram REKAM Nusantara"
                    className="group relative block overflow-hidden rounded-sm"
                  >
                    {cover && (
                      <Image
                        src={cover}
                        alt=""
                        width={1200}
                        height={675}
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 mb-0 max-w-[52ch] text-[0.82rem] leading-[1.7] text-ink-soft">
            Feed belum tersambung ke Instagram — gambar di atas adalah foto REKAM sendiri sebagai
            penempatan sementara.
          </p>
        </Wrap>
      </section>

      <section className="bg-white pt-16">
        <Wrap>
          <Eyebrow>Featured Video</Eyebrow>
        </Wrap>
        {/* Full-bleed, and shorter than the player's native 16:9 — the iframe
            keeps its own aspect ratio and is simply vertically centred inside
            a shallower box, cropping a slice off its top and bottom. */}
        <div className="relative mt-6 aspect-[12/5] w-full overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/GlFSR2ymLWI"
            title="Apa Itu Neraca Sumber Daya Laut? | Ocean Accounts | Fisheries Resource Center of Indonesia"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-x-0 top-1/2 aspect-video w-full -translate-y-1/2 border-0"
          />
        </div>
      </section>

      {/* The section carries an explicit min-height, not the photograph's own
          aspect ratio: part_story.png is a portrait crop, and letting the grid
          row take its intrinsic size from that would make the whole band tall
          and narrow instead of the short, wide band the reference shows. */}
      <section className="grid bg-cream lg:min-h-[30rem] lg:grid-cols-2">
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
            src={card1}
            alt="Empat relawan REKAM berjalan bersama membawa buku dan materi kampanye"
            fill
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#f9f1e6] aspect-[994/278] min-h-[16rem]">
        <Image
          src={borderRekamoke2}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(13,42,26,0.55)]" />
        <div className="absolute inset-0 flex items-center">
          <Wrap>
            <p className="m-0 font-display text-4xl text-center leading-[1.5] text-white text-justify">
              The forest remembers, the ocean recalls, and every community carries stories older
              than us all. Science helps us understand, storytelling helps us care, technology
              helps us reach, and tradition reminds us why. For knowledge left unkept is a future
              undone; document with purpose today, so life may carry on.
            </p>
          </Wrap>
        </div>
      </section>
    </SiteShell>
  );
}
