import Image from 'next/image';
import card4 from '@/assets/banner/card4.png';
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
import { featuredNews, getNews, listNews, resolveCover } from '@/lib/content';
import { cn } from '@/lib/cn';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* One flagship figure per programme, all measuring the same kind of thing: how
   much ground the work actually covered. Each links to that programme's full
   set of figures. Tints use the deep variants — white on --blue and --olive
   fails AA, same finding as the number cards. */
const STATS = [
  { href: '/program/forest', icon: 'i-route', value: '19.000', unit: 'Ha', label: 'Customary Forest Established', when: 'Forest · 2025', tint: 'bg-olive-deep' },
  { href: '/program/urban', icon: 'i-bin', value: '512,2', unit: 'Ton', label: 'Total waste collected', when: 'Urban · 2025', tint: 'bg-rust' },
  { href: '/program/ocean', icon: 'i-shield', value: '1,115juta', unit: 'Ha', label: 'Kawasan konservasi perairan', when: 'Ocean · 2022–2025', tint: 'bg-blue-deep' },
] as const;

const CARDS = [
  { href: '/program/forest', img: cardForest, kicker: 'Forest', body: 'Mapping what still stands, with the people who keep it standing.', alt: 'Ilustrasi sketsa lembah hutan dengan sungai berkelok' },
  { href: '/program/urban', img: cardUrban, kicker: 'Urban and sustainability', body: 'Where the city makes room for what lives in it.', alt: 'Ilustrasi sketsa desa dan permukiman di lereng gunung' },
  { href: '/program/ocean', img: cardOcean, kicker: 'Ocean', body: 'Counting what the sea gives, and who it gives it to.', alt: 'Ilustrasi sketsa terumbu karang dengan lumba-lumba, hiu, dan ikan' },
] as const;

/* The home page's featured article is NOT the archive's lead post — the two are
   picked independently, so this is named rather than derived. Deriving it would
   silently change which story the front page leads with. */
const FEATURE_SLUG = 'leuser-ekosistem-terakhir-yang-masih-menyimpan-harapan';

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
  // Excludes the feature post so its headline doesn't also show up here.
  const galleryPosts = await listNews({ exclude: feature?.slug, limit: 6 });

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
      {/* The panorama's own 1177/329 ratio only holds from lg up. Below that
          the box would be ~105px tall while the quote inside it needs several
          hundred, so the quote sits in normal flow with its own padding and
          the section takes its height from the text. */}
      <section
        id="lanskap"
        className="relative isolate overflow-hidden bg-white py-[clamp(2.5rem,8vw,4rem)] lg:aspect-[1177/329] lg:min-h-[16rem] lg:py-0"
      >
        <Image
          src={borderRekamoke1}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(7,93,84,0.71)]" />
        <div className="flex items-center lg:absolute lg:inset-0">
          <Wrap>
            <Eyebrow light className="text-[clamp(0.95rem,3.4vw,1.2rem)] tracking-[0.18em] sm:tracking-[0.22em]">
              Who we are
            </Eyebrow>
            <p className="mt-4 mb-0 max-w-[46ch] font-display text-[clamp(1.3rem,4.4vw,2.25rem)] leading-[1.28] text-white text-pretty sm:mt-6">
              Documenting living Indonesia: in forests, in seas, in cities. What we gather becomes conservation that lasts.
            </p>
          </Wrap>
        </div>
      </section>

      <section id="program" className="bg-band py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="text-center">Our program</Eyebrow>
          <h2 className="mt-4 mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center font-display text-[clamp(1.75rem,7vw,2.25rem)] font-normal text-green-900 sm:gap-x-8">
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

      <section id="dampak" className="relative isolate overflow-hidden bg-white py-[clamp(2.5rem,6vw,3.5rem)]">
        <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="py-[clamp(1rem,5vw,4rem)]">
            <h2 className="text-left font-display text-[clamp(2.5rem,11vw,3.75rem)] leading-[1.05] text-green-900">
              Our<br />Impact
            </h2>
            <p className="mt-5 mb-0 max-w-[42ch] text-title-sm leading-[1.5] text-green-900 sm:mt-6">
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
                  i === 0 && 'min-h-[10rem] sm:col-start-2 sm:min-h-[13rem]',
                  i === 1 && 'min-h-[11rem] sm:min-h-[17rem]',
                  i === 2 && 'min-h-[11rem] sm:min-h-[17rem]'
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
            <h2 className="mt-4 mb-0 font-display text-[clamp(1.6rem,6vw,2.25rem)] leading-[1.15] text-white">
              {feature.title}
            </h2>
            <ButtonLink href={`/berita/${feature.slug}`} variant="cream" className="mt-8">
              Read More
            </ButtonLink>
          </div>
          <Image
            src={card4}
            alt=""
            width={1302}
            height={744}
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="order-1 h-full w-full object-cover lg:order-2"
          />
        </section>
      )}

      <section aria-label="Galeri kegiatan" className="bg-mauve py-[clamp(2rem,4vw,3rem)]">
        <ul className="m-0 flex list-none gap-4 overflow-x-auto py-0 px-gutter [scrollbar-width:thin]">
          {galleryPosts.map((post) => {
            const cover = resolveCover(post.cover);
            return (
              <li key={post.slug} className="w-[286px] flex-none">
                <AppLink href={`/berita/${post.slug}`} className="group relative block overflow-hidden rounded-sm no-underline">
                  <div className="relative h-[200px] w-full">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={post.coverAlt}
                        fill
                        sizes="286px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <span aria-hidden="true" className="absolute inset-0 block bg-sage/60" />
                    )}
                  </div>
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-green-700/92 px-3 py-2.5 text-[0.78rem] font-semibold leading-[1.3] text-white">
                    <span className="line-clamp-2">{post.title}</span>
                    <Icon id="i-arrow" className="size-3 flex-none fill-none stroke-current stroke-[4]" />
                  </span>
                </AppLink>
              </li>
            );
          })}
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
        {/* The 12/5 crop leaves a phone with a ~155px-tall player whose
            controls fall outside the box, so below sm the iframe's own 16:9 is
            shown whole. */}
        <div className="relative mt-6 aspect-video w-full overflow-hidden sm:aspect-[12/5]">
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

      {/* Same as #lanskap: the artwork's ratio from lg up, content-driven
          height below it — this passage is ~330 characters and never fitted a
          phone-width band. */}
      <section className="relative isolate overflow-hidden bg-[#f9f1e6] py-[clamp(2.5rem,8vw,4rem)] lg:aspect-[994/278] lg:min-h-[16rem] lg:py-0">
        <Image
          src={borderRekamoke2}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(13,42,26,0.55)]" />
        <div className="flex items-center lg:absolute lg:inset-0">
          <Wrap>
            {/* text-center and text-justify both set text-align; the pair left
                which one applied down to stylesheet order. Ragged-right on a
                phone, justified only where the measure is wide enough for it. */}
            <p className="m-0 text-left font-display text-[clamp(1.05rem,3.8vw,2.25rem)] leading-[1.5] text-white lg:text-justify">
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
