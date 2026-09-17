import Image from 'next/image';
import oiForest from '@/assets/oi-forest.svg';
import oiUrban from '@/assets/oi-urban.svg';
import oiFrci from '@/assets/oi-frci.svg';
import instagram1 from '@/assets/instagram-1.png';
import instagram2 from '@/assets/instagram-2.png';
import instagram3 from '@/assets/instagram-3.png';
import instagram4 from '@/assets/instagram-4.png';
import instagram5 from '@/assets/instagram-5.png';
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
import { Slider } from '@/components/ui/Slider';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { featuredNews, getNews, listNews, resolveCover } from '@/lib/content';
import { cn } from '@/lib/cn';
import { fetchInstagramMedia, igShortcode } from '@/lib/instagram';
import { homeContent } from '@/i18n/content/home';
import { t } from '@/i18n/dictionary';
import { readLocale, type LocaleParams } from '@/i18n/metadata';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* One flagship figure per programme, all measuring the same kind of thing: how
   much ground the work actually covered. Each links to that programme's full
   set of figures. Tints use the deep variants — white on --blue and --olive
   fails AA, same finding as the number cards. */
const STATS = [
  { href: '/program/forest', icon: oiForest, value: '19.000', unit: 'Ha', labelKey: 'forest', when: 'Forest · 2025', tint: 'bg-olive-deep' },
  { href: '/program/urban', icon: oiUrban, value: '512,2', unit: 'Ton', labelKey: 'urban', when: 'Urban · 2025', tint: 'bg-rust' },
  { href: '/program/ocean', icon: oiFrci, value: '1,115 Mio', unit: 'Ha', labelKey: 'ocean', when: 'Ocean · 2022–2025', tint: 'bg-blue-deep' },
] as const;

const CARDS = [
  { href: '/program/forest', img: cardForest, altKey: 'forest' },
  { href: '/program/urban', img: cardUrban, altKey: 'urban' },
  { href: '/program/ocean', img: cardOcean, altKey: 'ocean' },
] as const;

/* The home page's featured article is NOT the archive's lead post — the two are
   picked independently, so this is named rather than derived. Deriving it would
   silently change which story the front page leads with. */
const FEATURE_SLUG = 'leuser-ekosistem-terakhir-yang-masih-menyimpan-harapan';

/* Screenshots of the actual posts (supplied directly, not scraped — Instagram
   walls off bot requests and its rendered image URLs are signed and expire
   within hours, so there's no reliable way to pull these automatically).
   Wire IG_ACCESS_TOKEN (see src/lib/instagram.ts) to replace these with a
   live feed; unmatched or unconfigured tiles keep using the screenshot. */
const IG_TILES = [
  { cover: instagram1, href: 'https://www.instagram.com/p/DcaQtGdic3B/?img_index=1' },
  { cover: instagram2, href: 'https://www.instagram.com/p/DYwpjK7iVZx/?img_index=1' },
  { cover: instagram3, href: 'https://www.instagram.com/p/DZCvxBslL0x/?img_index=1' },
  { cover: instagram4, href: 'https://www.instagram.com/p/DZUHUCDibbZ/?img_index=1' },
  { cover: instagram5, href: 'https://www.instagram.com/p/DG5LsGfy9Cm/?img_index=1' },
] as const;

/* Same shelf layout as the Instagram widget above, one video per column.
   Thumbnails come straight from YouTube's img.youtube.com host, so no local
   asset or next/image remote-pattern config is needed. */
const YT_VIDEOS = [
  { id: 'GlFSR2ymLWI', title: 'Apa Itu Neraca Sumber Daya Laut? | Ocean Accounts | Fisheries Resource Center of Indonesia' },
  { id: 'mnBlUW8BDhY', title: 'Video REKAM Nusantara' },
  { id: 'IGY158BlSt0', title: 'Video REKAM Nusantara' },
  { id: 'op95wuGjOTs', title: 'Video REKAM Nusantara' },
  { id: '4_0dqP8u0Mw', title: 'Video REKAM Nusantara' },
];

export default async function Home({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = homeContent(locale);
  const dict = t(locale);
  const feature = (await getNews(FEATURE_SLUG)) ?? (await featuredNews());
  const featureCover = resolveCover(feature?.cover);
  // null when IG_ACCESS_TOKEN isn't configured — every tile then falls back
  // to its screenshot cover below.
  const igMedia = await fetchInstagramMedia();
  const igPosts = IG_TILES.map((tile) => ({
    tile,
    media: igMedia?.find((m) => igShortcode(m.permalink) === igShortcode(tile.href)) ?? null,
  }));
  // Excludes the feature post so its headline doesn't also show up here.
  const galleryPosts = await listNews({ exclude: feature?.slug, limit: 6 });

  return (
    <SiteShell hero>
      <Hero360
        scene="coast"
        image={bgRekamoke3.src}
        eyebrow={copy.hero.eyebrow}
        title={
          <>
            {copy.hero.title[0]}
            <br />
            {copy.hero.title[1]}
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
              {copy.lanskap.eyebrow}
            </Eyebrow>
            <p className="mt-4 mb-0 max-w-[46ch] font-display text-[clamp(1.3rem,4.4vw,2.25rem)] leading-[1.28] text-white text-pretty sm:mt-6">
              {copy.lanskap.quote}
            </p>
          </Wrap>
        </div>
      </section>

      <section id="program" className="bg-band py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow className="text-center">{copy.program.eyebrow}</Eyebrow>
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
                        alt={copy.cardAlts[card.altKey]}
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
                    {copy.cardKickers[card.altKey]}
                  </span>
                  <span className="mt-2 block text-title-xs leading-[1.3] text-green-900">
                    {copy.cardBodies[card.altKey]}
                  </span>
                  <span className="mt-3 block text-[0.8rem] uppercase text-green-900">
                    {copy.program.cardCta}
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
              {copy.impact.heading[0]}<br />{copy.impact.heading[1]}
            </h2>
            <p className="mt-5 mb-0 max-w-[42ch] text-title-sm leading-[1.5] text-green-900 sm:mt-6">
              {copy.impact.paragraph[0]}
              <br />
              {copy.impact.paragraph[1]}
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
                {/* Fixed height, auto width — not a square box, so each SVG
                    keeps its own aspect ratio (forest square, urban portrait,
                    frci a wide horizontal mark) instead of being letterboxed.
                    frci's long edge is its ~110px width at h-10; forest and
                    urban are sized so THEIR long edge matches that, which is
                    why they get a taller box than frci's own h-10. */}
                <Image
                  src={stat.icon}
                  alt=""
                  className={cn('w-auto object-contain', i === 2 ? 'h-10' : 'h-[60px]')}
                />
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
                <p className="m-0 text-xs font-bold leading-[1.35]">{copy.stats[stat.labelKey]}</p>
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
              {dict.common.readMore}
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

      <section aria-label={copy.gallery.ariaLabel} className="bg-mauve py-[clamp(2rem,4vw,3rem)]">
        <Slider trackClassName="px-gutter">
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
                        unoptimized={typeof cover === 'string'}
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
        </Slider>
      </section>

      <section aria-labelledby="ig-title" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{copy.instagram.eyebrow}</Eyebrow>
            <Display id="ig-title" className="mt-3 text-display">
              @rekamnusantara
            </Display>
          </div>
          <ButtonLink href="https://www.instagram.com/rekamnusantara/" variant="ghostGreen" target="_blank" rel="noreferrer">
            {copy.instagram.followCta}
          </ButtonLink>
        </Wrap>

        <Wrap className="mt-[clamp(2rem,4vw,3rem)]">
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {igPosts.map(({ tile, media }) => {
              // The real post photo once IG_ACCESS_TOKEN is set and this
              // shortcode is among the account's recent media; otherwise the
              // screenshot supplied for this post.
              const liveSrc = media && (media.mediaType === 'VIDEO' ? media.thumbnailUrl : media.mediaUrl);
              return (
                <li key={tile.href}>
                  <a
                    href={tile.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={copy.instagram.postAriaLabel}
                    className="group relative block overflow-hidden rounded-sm"
                  >
                    {liveSrc ? (
                      // Plain <img>: media_url is a signed CDN link Meta
                      // rotates, not a stable asset next/image should optimize.
                      <img
                        src={liveSrc}
                        alt=""
                        loading="lazy"
                        className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <Image
                        src={tile.cover}
                        alt=""
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="size-10 drop-shadow-md">
                        <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.9)" />
                        <path
                          fill="#0d2a1a"
                          d="M12 6.2c-1.62 0-1.82.01-2.46.04-.64.03-1.08.13-1.46.28a2.95 2.95 0 0 0-1.06.7 2.95 2.95 0 0 0-.7 1.06c-.15.38-.25.82-.28 1.46-.03.64-.04.84-.04 2.46s.01 1.82.04 2.46c.03.64.13 1.08.28 1.46.15.4.34.7.7 1.06.35.35.66.55 1.06.7.38.15.82.25 1.46.28.64.03.84.04 2.46.04s1.82-.01 2.46-.04c.64-.03 1.08-.13 1.46-.28.4-.15.7-.35 1.06-.7.35-.36.55-.66.7-1.06.15-.38.25-.82.28-1.46.03-.64.04-.84.04-2.46s-.01-1.82-.04-2.46c-.03-.64-.13-1.08-.28-1.46a2.95 2.95 0 0 0-.7-1.06 2.95 2.95 0 0 0-1.06-.7c-.38-.15-.82-.25-1.46-.28-.64-.03-.84-.04-2.46-.04Zm0 1.08c1.6 0 1.79.01 2.42.04.58.02.9.12 1.11.2.28.11.48.24.69.45.21.21.34.41.45.69.08.21.18.53.2 1.11.03.63.04.82.04 2.42s-.01 1.79-.04 2.42c-.02.58-.12.9-.2 1.11-.11.28-.24.48-.45.69-.21.21-.41.34-.69.45-.21.08-.53.18-1.11.2-.63.03-.82.04-2.42.04s-1.79-.01-2.42-.04c-.58-.02-.9-.12-1.11-.2a1.86 1.86 0 0 1-.69-.45 1.86 1.86 0 0 1-.45-.69c-.08-.21-.18-.53-.2-1.11-.03-.63-.04-.82-.04-2.42s.01-1.79.04-2.42c.02-.58.12-.9.2-1.11.11-.28.24-.48.45-.69.21-.21.41-.34.69-.45.21-.08.53-.18 1.11-.2.63-.03.82-.04 2.42-.04Zm0 1.83a3.09 3.09 0 1 0 0 6.18 3.09 3.09 0 0 0 0-6.18Zm0 5.1a2.01 2.01 0 1 1 0-4.02 2.01 2.01 0 0 1 0 4.02Zm3.21-5.22a.72.72 0 1 1-1.44 0 .72.72 0 0 1 1.44 0Z"
                        />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Wrap>
      </section>

      <section aria-labelledby="video-title" className="bg-white py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{copy.featuredVideo.eyebrow}</Eyebrow>
            <Display id="video-title" className="mt-3 text-display">
              Rekam Nusantara
            </Display>
          </div>
          <ButtonLink href="https://www.youtube.com/@RekamNusantara" variant="ghostGreen" target="_blank" rel="noreferrer">
            {copy.youtube.channelCta}
          </ButtonLink>
        </Wrap>

        <Wrap className="mt-[clamp(2rem,4vw,3rem)]">
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {YT_VIDEOS.map((video) => (
              <li key={video.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={copy.youtube.watchAriaLabel(video.title)}
                  className="group relative block overflow-hidden rounded-sm"
                >
                  {/* Plain <img>, not next/image: the host (img.youtube.com)
                      isn't in next.config's remote patterns, and adding one
                      just for this thumbnail isn't worth it. */}
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt=""
                    width={480}
                    height={360}
                    loading="lazy"
                    className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors duration-300 group-hover:bg-black/35"
                  >
                    <svg viewBox="0 0 24 24" className="size-10 drop-shadow-md">
                      <circle cx="12" cy="12" r="12" fill="rgba(255,255,255,0.9)" />
                      <path d="M10 8.5v7l6-3.5z" fill="#0d2a1a" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      {/* The section carries an explicit min-height, not the photograph's own
          aspect ratio: part_story.png is a portrait crop, and letting the grid
          row take its intrinsic size from that would make the whole band tall
          and narrow instead of the short, wide band the reference shows. */}
      <section className="grid bg-cream lg:min-h-[30rem] lg:grid-cols-2">
        <div className="self-center px-gutter py-[clamp(3rem,6vw,5rem)] text-center">
          <h2 className="mt-4 mb-0 font-display text-[clamp(2rem,6vw,5em)] leading-[1.15] text-green-900">
            {dict.common.storyBand.heading1}
            <br />
            {dict.common.storyBand.heading2}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink
              href="https://tk.tokopedia.com/ZSqqyXM3x/"
              variant="ghostGreen"
              target="_blank"
              rel="noreferrer"
            >
              {dict.common.storyBand.shopCta}
            </ButtonLink>
          </div>
        </div>
        <div className="relative h-64 w-full lg:h-full">
          <Image
            src={card1}
            alt={dict.common.storyBand.alt}
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
              {copy.closingQuote}
            </p>
          </Wrap>
        </div>
      </section>
    </SiteShell>
  );
}
