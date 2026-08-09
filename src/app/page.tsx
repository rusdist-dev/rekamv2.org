import Image from 'next/image';
import Link from 'next/link';
import canopy from '@/assets/canopy.jpg';
import cardForest from '@/assets/card-forest.jpg';
import cardOcean from '@/assets/card-ocean.jpg';
import cardPhoto from '@/assets/card-photo.jpg';
import cardUrban from '@/assets/card-urban.jpg';
import newsIcrs from '@/assets/news-icrs.jpg';
import panoramaLanskap from '@/assets/panorama-lanskap.jpg';
import volunteer from '@/assets/volunteer-aerial.jpg';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Hero360 } from '@/components/hero/Hero360';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import { featuredNews, getNews, resolveCover } from '@/lib/content';
import { cn } from '@/lib/cn';

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/* One flagship figure per programme, all measuring the same kind of thing: how
   much ground the work actually covered. Each links to that programme's full
   set of figures. Tints use the deep variants — white on --blue and --olive
   fails AA, same finding as the number cards. */
const STATS = [
  { href: '/program/forest', icon: 'i-route', value: '35', unit: 'km', label: 'Batas hutan adat terdelineasi', when: 'Forest · 2025', tint: 'bg-blue-deep' },
  { href: '/program/urban', icon: 'i-bin', value: '512,2', unit: 'ton', label: 'Sampah terkumpul', when: 'Urban · 2025', tint: 'bg-rust' },
  { href: '/program/ocean', icon: 'i-shield', value: '23', label: 'Kawasan konservasi perairan', when: 'Ocean · 2022–2025', tint: 'bg-olive-deep' },
] as const;

const CARDS = [
  { href: '/program/forest', img: cardForest, kicker: 'Forest', body: 'Mapping what still stands, with the people who keep it standing.', alt: 'Ilustrasi ukir lembah hutan dengan sungai berkelok' },
  { href: '/program/urban', img: cardUrban, kicker: 'Urban and sustainability', body: 'Where the city makes room for what lives in it.', alt: 'Ilustrasi ukir permukiman padat dengan latar gunung' },
  { href: '/program/ocean', img: cardOcean, kicker: 'Ocean', body: 'Counting what the sea gives, and who it gives it to.', alt: 'Ilustrasi ukir gerombolan ikan di laut' },
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
        eyebrow="What we conserve?"
        title={
          <>
            Documenting knowledge
            <br />
            Preserving life
          </>
        }
        lightPano
        scrollTo="#lanskap"
      />

      {/* rekam.css:518-551. A panorama under a flat scrim, with the quote set
          in white over it — not a plain cream band. */}
      <section id="lanskap" className="relative isolate overflow-hidden py-[clamp(3.5rem,7vw,6rem)]">
        <Image
          src={panoramaLanskap}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(13,42,26,0.45)]" />
        <Wrap>
          <Eyebrow light>Who we are</Eyebrow>
          <p className="mt-6 mb-0 max-w-[46ch] font-display text-quote leading-[1.28] text-white text-pretty">
            REKAM records the living Indonesia — in forests, in seas, in cities — and turns what we
            document into conservation that lasts.
          </p>
        </Wrap>
      </section>

      <section id="program" className="bg-band py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="text-center">Our program</Eyebrow>
          <h2 className="mt-4 mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center font-display text-display font-normal text-green-900">
            Forest <span aria-hidden="true" className="inline-block h-px w-10 bg-green-900/40" />
            Urban <span aria-hidden="true" className="inline-block h-px w-10 bg-green-900/40" />
            Ocean
          </h2>

          <ul className="m-0 grid list-none gap-[clamp(1.5rem,3vw,2.5rem)] p-0 md:grid-cols-3">
            {CARDS.map((card) => (
              <li key={card.href}>
                <Link href={card.href} className="group block no-underline">
                  <span className="relative block overflow-hidden rounded-sm">
                    <Image
                      src={card.img}
                      alt={card.alt}
                      sizes="(max-width: 720px) 100vw, 33vw"
                      className="block w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <Icon
                      id="i-arrow"
                      className="absolute bottom-3 right-3 size-7 fill-none stroke-yellow stroke-[4]"
                    />
                  </span>
                  <span className="mt-4 block font-label text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    {card.kicker}
                  </span>
                  <span className="mt-2 block font-display text-title-sm leading-[1.3] text-green-900">
                    {card.body}
                  </span>
                  <span className="mt-3 block text-[0.8rem] font-semibold text-green-900">
                    Pelajari selengkapnya
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section id="dampak" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <Display>
              Our
              <br />
              Impact
            </Display>
            <Lede>
              Sejak 2013, kami berkolaborasi dengan pemerintah pusat dan daerah, serta lembaga
              non-pemerintah nasional dan internasional.
            </Lede>
            <p className="mt-6 mb-0 max-w-[38ch] text-[0.85rem] leading-[1.7] text-ink-soft">
              Tiga angka teratas dari <em>Impact Highlights 2025</em> — satu untuk setiap program.
              Rinciannya ada di halaman masing-masing.
            </p>
          </div>

          <div className="grid gap-[clamp(1rem,2.5vw,1.75rem)] sm:grid-cols-3">
            {STATS.map((stat, i) => (
              <Link
                key={stat.href}
                href={stat.href}
                className={cn(
                  'flex min-h-[clamp(11rem,18vw,14rem)] flex-col justify-end rounded-[18px] p-[clamp(1.25rem,2.4vw,2rem)] text-white no-underline transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0',
                  stat.tint,
                  // Staggered, as in the source's impact grid.
                  i === 1 && 'sm:mt-8',
                  i === 2 && 'sm:mt-16'
                )}
              >
                <Icon id={stat.icon} className="mb-auto size-7 fill-none stroke-current stroke-[1.6]" />
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
                <p className="mt-3 mb-0 text-xs font-bold leading-[1.35]">{stat.label}</p>
                <p className="mt-2 mb-0 text-[0.72rem] font-medium text-white">{stat.when}</p>
              </Link>
            ))}
          </div>
        </Wrap>
      </section>

      {feature && (
        <section id="berita" className="grid bg-cream lg:grid-cols-2">
          <div className="order-2 self-center px-gutter py-[clamp(3rem,6vw,5rem)] lg:order-1">
            <p className="m-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              <time dateTime={feature.date.toISOString()}>{dateFmt.format(feature.date)}</time>
              {feature.category && (
                <>
                  <span aria-hidden="true"> / </span>
                  {feature.category}
                </>
              )}
            </p>
            <h2 className="mt-4 mb-0 max-w-[20ch] font-display text-display leading-[1.15] text-green-900">
              {feature.title}
            </h2>
            <ButtonLink href={`/berita/${feature.slug}`} className="mt-8">
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
              <Link href="/berita" className="group block no-underline">
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
              </Link>
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

      {/* No items-center here: the photograph is sized with h-full, which only
          resolves if the grid item is allowed to stretch to the row. */}
      <section className="grid bg-paper lg:grid-cols-2">
        <div className="self-center px-gutter py-[clamp(3rem,6vw,5rem)]">
          <Display>Be Part of the Story</Display>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/donasi#adopsi">Adopt</ButtonLink>
            <ButtonLink href="/donasi">Give</ButtonLink>
            <ButtonLink href="/merch" variant="ghostGreen">
              Shop
            </ButtonLink>
          </div>
        </div>
        <Image
          src={volunteer}
          alt="Foto udara petak ladang dan barisan pohon"
          sizes="(max-width: 1000px) 100vw, 50vw"
          className="h-full w-full object-cover"
        />
      </section>

      <section className="bg-cream pt-[clamp(3.5rem,8vw,6.5rem)]">
        <Wrap>
          <p className="m-0 max-w-[46ch] font-display text-quote leading-[1.25] text-green-900">
            The forest remembers, the ocean recalls, and every community carries stories older than
            us all. Science helps us understand, storytelling helps us care, technology helps us
            reach, and tradition reminds us why. For knowledge left unkept is a future undone;
            document with purpose today, so life may carry on.
          </p>
        </Wrap>
        <Image src={canopy} alt="" sizes="100vw" className="mt-[clamp(2rem,5vw,4rem)] w-full" />
      </section>
    </SiteShell>
  );
}
