import type { Metadata } from 'next';
import Image from 'next/image';
import { Fragment } from 'react';
import initiative1 from '@/assets/banner/initiative-1.png';
import initiative2 from '@/assets/banner/initiative-2.png';
import initiative3 from '@/assets/banner/initiative-3.png';
import initiativeBg from '@/assets/banner/initiative_bg.png';
import dokumentasiForest1 from '@/assets/dokumentasi-forest1.png';
import { Icon } from '@/components/chrome/SvgSprite';
import { SiteShell } from '@/components/chrome/SiteShell';
import { GalleryFilm } from '@/components/initiative/GalleryFilm';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { initiativeContent } from '@/i18n/content/initiative';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { t } from '@/i18n/dictionary';
import { getNews } from '@/lib/content';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/initiative', {
    title: 'Bangga Papua — Back to the Roots',
    description: initiativeContent(locale).metaDescription,
  });
}

/* First stop for the forest programme page's "Learn more" — it used to jump
 * straight to the /berita article; now it lands here on a branded initiative
 * hero first, with a link through to the full story rather than duplicating
 * it. Numbers below are the placeholder set from the reference design; swap
 * them for the real participant count once it exists. Label comes from
 * copy.stats.participants (see initiative.ts) since it's translated. */
const STATS = ['166', '166', '166'];

const ARTICLE_SLUG = 'bangga-papua-hutan-papua-yang-dibangun-oleh-burung';

/* Same caption on all three, exactly as given in the reference — there is no
 * matching /berita article for it yet, so each card links to the news
 * archive rather than a slug that doesn't exist. Swap in real slugs once the
 * story is published. */
const HIGHLIGHTS = [
  { image: initiative1, caption: 'Small Action, Big Impact: How REKAM and LPPOM MUI Are Rethinking Waste.' },
  { image: initiative2, caption: 'Small Action, Big Impact: How REKAM and LPPOM MUI Are Rethinking Waste.' },
  { image: initiative3, caption: 'Small Action, Big Impact: How REKAM and LPPOM MUI Are Rethinking Waste.' },
];

const DOCUMENTATION_SLUG = 'mencari-sang-arsitek-hutan-papua-melalui-film-in-search-of-the-northern-cassowary';

export default async function InitiativePage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = initiativeContent(locale);
  const dict = t(locale);
  const article = await getNews(ARTICLE_SLUG);
  // Real article, real date and excerpt — only the cover is swapped for the
  // asset provided for this section, since it isn't in the /berita cover set.
  const doc = await getNews(DOCUMENTATION_SLUG);

  return (
    <SiteShell>
      <section className="relative isolate flex min-h-[min(44rem,100svh)] items-end overflow-hidden bg-forest-black pb-[clamp(2.5rem,6vh,4.5rem)] pt-[calc(var(--nav-h)+clamp(4rem,10vh,8rem))]">
        <Image
          src={initiativeBg}
          alt={copy.hero.alt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 z-[1]" style={{ backgroundColor: 'rgba(20, 40, 30, 0.72)' }} />

        <Wrap className="relative z-[2]">
          <Breadcrumb
            ariaLabel={dict.common.breadcrumb.ariaLabel}
            light
            items={[{ label: dict.common.breadcrumb.home, href: '/' }, { label: 'Initiative' }]}
          />
          <Eyebrow light>Initiative</Eyebrow>
          <h1 className="mt-3 mb-0 font-display font-normal leading-[1.08] text-white">
            <span className="block text-[clamp(1.9rem,4.5vw,2.6rem)]">{copy.hero.title[0]}</span>
            <span className="block text-[clamp(2.6rem,6.5vw,4rem)]">{copy.hero.title[1]}</span>
          </h1>
          <p className="mt-5 mb-0 max-w-[44ch] text-lede leading-[1.6] text-white/88">{copy.hero.lede}</p>

          <div className="mt-[clamp(1.75rem,4vw,2.5rem)] flex flex-wrap items-center gap-8 border-t border-white/25 pt-6">
            {STATS.map((value, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden="true" className="hidden h-12 w-[3px] bg-yellow sm:block" />}
                <div>
                  <p className="m-0 font-display text-[clamp(2.2rem,5vw,3rem)] font-bold leading-none text-white">
                    {value}
                  </p>
                  <p className="mt-1.5 mb-0 font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/75">
                    {copy.stats.participants}
                  </p>
                </div>
              </Fragment>
            ))}
          </div>
        </Wrap>
      </section>

      <section style={{ backgroundColor: '#f4f2eb' }} className="py-[clamp(3rem,7vw,6rem)]">
        <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <Eyebrow>{copy.about.eyebrow}</Eyebrow>
            <h2 className="mt-4 mb-0 max-w-[18ch] font-display text-display leading-[1.15] text-green-900">
              {copy.about.heading}
            </h2>
          </div>
          <div>
            <p className="m-0 text-lede leading-[1.8] text-ink">{copy.about.paragraphs[0]}</p>
            <p className="mt-6 mb-0 text-lede leading-[1.8] text-ink">{copy.about.paragraphs[1]}</p>
          </div>
        </Wrap>
      </section>

      {/* The English copy here reads like it strayed in from the Ocean
          programme (ICRS 2026, Ocean Accounts) rather than Bangga Papua —
          flagged for whoever owns the copy to review, but that's a content
          accuracy question, not a reason to leave the section untranslated. */}
      <section className="bg-white py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow>{copy.currentActivity.eyebrow}</Eyebrow>
          <ul className="m-0 mt-6 list-disc space-y-6 pl-5 text-lede leading-[1.7] text-ink-soft">
            {copy.currentActivity.items.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section className="bg-green-700 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {/* Display-only imagery, not a link — there is no article behind
              these captions to send a reader to. */}
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="relative isolate aspect-[4/3] overflow-hidden">
              <Image
                src={h.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[rgba(6,20,14,0.88)] via-[rgba(6,20,14,0.25)] to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="m-0 max-w-[85%] text-[1.05rem] font-semibold leading-[1.35] text-white">
                  {h.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GalleryFilm locale={locale} />

      {doc && (
        <section className="bg-band py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.documentation.eyebrow}</Eyebrow>
            <Display className="mt-4 mb-[clamp(1.5rem,3vw,2.5rem)] text-display">
              {copy.documentation.heading}
            </Display>

            <article className="group max-w-[26rem]">
              <AppLink href={`/berita/${doc.slug}`} className="block no-underline">
                <span className="block overflow-hidden rounded-sm">
                  <Image
                    src={dokumentasiForest1}
                    alt={doc.coverAlt}
                    sizes="(max-width: 500px) 100vw, 26rem"
                    className="block aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="mt-4 block font-label text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  <time dateTime={doc.date.toISOString()}>{dateFmt.format(doc.date)}</time>
                </span>
                <span className="mt-2 block font-display text-title-sm leading-[1.25] text-green-900">
                  {doc.title}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 pt-3 text-[0.8rem] font-semibold text-green-900">
                  {dict.common.readMore}
                  <Icon id="i-arrow" className="size-3 fill-none stroke-current" />
                </span>
              </AppLink>
            </article>
          </Wrap>
        </section>
      )}
    </SiteShell>
  );
}
