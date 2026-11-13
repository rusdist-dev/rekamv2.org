import type { Metadata } from 'next';
import Image from 'next/image';
import logoBlackOnly from '@/assets/logo/blackonly-logo.png';
import logoDownload from '@/assets/logo/download-logo.png';
import colorBar from '@/assets/logo/color.png';
import logoFullColor from '@/assets/logo/fullcolor-logo.png';
import landRule from '@/assets/logo/land.png';
import landHorizontal from '@/assets/logo/land-horizontal.png';
import landVertical from '@/assets/logo/land-vertical.png';
import logoHorizontal from '@/assets/logo/horizontal-logo.png';
import logoLandscape from '@/assets/logo/rekam-landscape.png';
import logoPortrait from '@/assets/logo/rekam-potrait.png';
import logoRibbon from '@/assets/logo/ribbon-logo.png';
import treeRule from '@/assets/logo/tree.png';
import treeHorizontal from '@/assets/logo/tree-horizontal.png';
import treeVertical from '@/assets/logo/tree-vertical.png';
import logoVertical from '@/assets/logo/vertical-logo.png';
import waterRule from '@/assets/logo/water.png';
import waterHorizontal from '@/assets/logo/water-horizontal.png';
import waterVertical from '@/assets/logo/water-vertical.png';
import logoWhite from '@/assets/logo/white-logo.png';
import { AssetFolderGate } from '@/components/brand/AssetFolderGate';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Icon } from '@/components/chrome/SvgSprite';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { buttonClasses } from '@/components/ui/button-classes';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { brandGuidelineContent } from '@/i18n/content/brand-guideline';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const copy = brandGuidelineContent(locale);
  return pageMetadata(locale, '/brand-guideline', {
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

/* Hero: breadcrumb + eyebrow + display heading on the cream panel — the same
 * opening as /safeguarding and /privacy-policy, minus the full-width photo
 * those two run underneath it, because the manual's own cover art isn't part
 * of this page.
 *
 * The section below it stays on the same cream so the two read as one opening
 * spread rather than two bands; the first rule of the manual itself (the two
 * approved lockups) is the first thing under the title. Further sections get
 * added after it. */

/* Index-aligned with copy.usage.options — the artwork is not content, so it
   stays here rather than in the locale file, and the two orders are the
   manual's own. */
const LOCKUPS = [logoHorizontal, logoVertical, logoRibbon];

/* Index-aligned with copy.colour.variants, same reasoning as LOCKUPS. The
   white version ships with its black block baked into the file — it is the
   only one of the three that cannot be shown on the page background. */
const COLOUR_VARIANTS = [logoFullColor, logoBlackOnly, logoWhite];

/* The palette, as the manual prints it: each swatch with its four
   notations. These are measurements of one colour, not copy, so they are not
   in the locale file — only the "Color n" label beside them is. The CMYK and
   HSB figures are the manual's own and are not derived from the hex. */
/* The shared folder holding the artwork this page describes. It is handed over
   by AssetFolderGate, which only reveals it once the visitor's name, email and
   purpose have been filed — see that component for why the link lives here and
   not behind an email the way a publication download does. */
const ASSET_FOLDER_URL =
  'https://drive.google.com/drive/folders/1LCnpqxaGtFEdimaYwouRG_tSovtOAfr_?usp=sharing';

/** The four notations each swatch is printed with, in the manual's order. */
const NOTATIONS = [
  ['HEX', 'hex'],
  ['RGB', 'rgb'],
  ['HSB', 'hsb'],
  ['CMYK', 'cmyk'],
] as const;

const COLOUR_TONES = [
  { hex: '006838', rgb: '0, 104, 56', hsb: '152, 100, 41', cmyk: '100, 0, 46, 59' },
  { hex: '1D9FCC', rgb: '29, 159, 204', hsb: '195, 86, 80', cmyk: '85, 22, 0, 19' },
  { hex: '6F3C18', rgb: '111, 60, 24', hsb: '25, 78, 44', cmyk: '0, 45, 78, 56' },
  { hex: 'EFF5E0', rgb: '239, 245, 224', hsb: '77, 9, 96', cmyk: '2, 0, 8, 3' },
  { hex: 'FECC90', rgb: '254, 204, 144', hsb: '33, 43, 100', cmyk: '0, 19, 43, 0' },
];

/* Index-aligned with copy.colour.elements.items — water, tree, land — each
   with the two lockups the manual shows for it and the colour rule that
   closes its block. */
const COLOUR_ELEMENTS = [
  { horizontal: waterHorizontal, vertical: waterVertical, rule: waterRule },
  { horizontal: treeHorizontal, vertical: treeVertical, rule: treeRule },
  { horizontal: landHorizontal, vertical: landVertical, rule: landRule },
];

export default async function BrandGuidelinePage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = brandGuidelineContent(locale);

  return (
    <SiteShell>
      <section className="bg-cream page-top pb-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Breadcrumb
            ariaLabel={copy.breadcrumb.aria}
            items={[{ label: copy.breadcrumb.home, href: '/' }, { label: copy.breadcrumb.current }]}
          />

          {/* The source line is set smaller and tighter than the site-wide
              eyebrow step, which at 1.2rem/0.22em would read as a second
              heading above the real one rather than as its label. */}
          <Eyebrow className="text-[0.82rem] tracking-[0.06em] sm:text-[0.82rem] sm:tracking-[0.06em]">
            {copy.hero.eyebrow}
          </Eyebrow>

          <Display
            as="h1"
            className="mt-4 max-w-[38ch] text-display-lg uppercase leading-[1.18] tracking-normal"
          >
            {copy.hero.heading}
          </Display>
        </Wrap>
      </section>

      <section className="bg-cream pb-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow
            as="h2"
            className="text-[0.82rem] tracking-[0.06em] sm:text-[0.82rem] sm:tracking-[0.06em]"
          >
            {copy.intro.eyebrow}
          </Eyebrow>

          {/* Both lockups at the scale the manual shows them, side by side and
              spread to the column's two edges, so the pair spans the same
              measure as the paragraphs under it rather than bunching against
              the left margin. They wrap onto separate rows on a narrow screen
              rather than shrinking further — the wordmark in the landscape
              lockup is the first thing to become unreadable. */}
          <div className="mt-[clamp(2rem,4vw,3rem)] flex flex-wrap items-center justify-between gap-x-[clamp(2rem,7vw,6rem)] gap-y-[clamp(2rem,5vw,3rem)]">
            <Image
              src={logoPortrait}
              alt={copy.intro.portraitAlt}
              priority
              sizes="(max-width: 640px) 45vw, 260px"
              className="h-[clamp(11rem,23.5vw,19.2rem)] w-auto"
            />
            <Image
              src={logoLandscape}
              alt={copy.intro.landscapeAlt}
              priority
              sizes="(max-width: 640px) 85vw, 650px"
              className="h-[clamp(5rem,14vw,11.1rem)] w-auto"
            />
          </div>

          <div className="mt-[clamp(2.5rem,5vw,3.5rem)] max-w-full">
            {copy.intro.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-6 mb-0 text-[1.05rem] leading-[1.75] text-green-900 first:mt-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow
            as="h2"
            className="text-[0.82rem] tracking-[0.06em] sm:text-[0.82rem] sm:tracking-[0.06em]"
          >
            {copy.usage.eyebrow}
          </Eyebrow>

          {/* One column per approved lockup. The artwork sits in a fixed-height
              band rather than being sized per image, so the three titles share
              a baseline however tall or wide the lockup inside it is — the
              horizontal one is a third the height of the other two. */}
          <div className="mt-[clamp(2rem,4vw,3rem)] grid gap-x-[clamp(2rem,5vw,4rem)] gap-y-[clamp(2.5rem,5vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
            {copy.usage.options.map((option, i) => (
              <div key={option.title}>
                <div className="flex h-[clamp(6rem,12vw,9.5rem)] items-center">
                  <Image
                    src={LOCKUPS[i]}
                    alt={option.alt}
                    sizes="(max-width: 640px) 80vw, 320px"
                    className={
                      i === 0
                        ? 'h-[clamp(2.8rem,5.8vw,5.2rem)] w-auto'
                        : 'h-full w-auto object-contain'
                    }
                  />
                </div>

                <h3 className="mt-[clamp(1.2rem,2.5vw,1.8rem)] mb-0 text-[1.3rem] font-normal leading-[1.3] text-ink">
                  {option.title}
                </h3>
                <p className="mt-3 mb-0 text-[0.92rem] leading-[1.6] text-ink">{option.body}</p>
              </div>
            ))}
          </div>

          {/* The manual closes the spread with its three-colour rule. It is
              ornament, so it carries no alt text. */}
          <Image
            src={colorBar}
            alt=""
            sizes="300px"
            className="mt-[clamp(2.5rem,6vw,4.5rem)] h-auto w-[clamp(11rem,24vw,19.5rem)]"
          />
        </Wrap>
      </section>

      <section className="bg-paper pb-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <h2 className="sr-only">{copy.colour.srHeading}</h2>

          <div className="max-w-full">
            {copy.colour.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 mb-0 text-[0.92rem] leading-[1.7] text-ink first:mt-0"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Captions are the figures' own labels, so each pair is a <figure>.
              The artwork sits in a fixed-height band aligned to its bottom, so
              the three captions share a baseline even though the white version
              is taller — its black block adds the clear space the other two
              get from the page. Each figure shrink-wraps its artwork, so the
              caption centres under the logo it names rather than under the
              grid column, which is wider than any of the three. */}
          <div className="mt-[clamp(2.5rem,6vw,4.5rem)] grid gap-x-[clamp(2rem,5vw,4rem)] gap-y-[clamp(2rem,4vw,3rem)] sm:grid-cols-2 lg:grid-cols-3">
            {copy.colour.variants.map((variant, i) => (
              <figure key={variant.caption} className="m-0 w-fit">
                <div className="flex h-[clamp(4rem,8vw,6rem)] items-end">
                  <Image
                    src={COLOUR_VARIANTS[i]}
                    alt={variant.alt}
                    sizes="(max-width: 640px) 70vw, 300px"
                    className={
                      i === 2
                        ? 'h-[clamp(3.6rem,7vw,5.4rem)] w-auto'
                        : 'h-[clamp(2.6rem,5vw,3.8rem)] w-auto'
                    }
                  />
                </div>
                <figcaption className="mt-4 text-center text-[1.05rem] uppercase leading-[1.3] text-ink">
                  {variant.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <hr className="mt-[clamp(2.5rem,6vw,4.5rem)] border-t border-green-ink/12" />

          <h3 className="mt-[clamp(2.5rem,6vw,4.5rem)] mb-0 text-[1.3rem] font-normal leading-[1.3] text-ink">
            {copy.colour.elements.variationsHeading}
          </h3>
          <Image
            src={colorBar}
            alt=""
            sizes="260px"
            className="mt-3 h-auto w-[clamp(10rem,22vw,16rem)]"
          />

          <h3 className="mt-[clamp(2rem,4.5vw,3.5rem)] mb-0 text-[1.3rem] font-normal leading-[1.3] text-ink">
            {copy.colour.elements.byElementHeading}
          </h3>

          {/* One block per colour element. Inside each, the two lockups sit on
              a shared bottom edge: both figures end with a one-line caption of
              the same size, so aligning the figures aligns the artwork above
              them too, without pinning either image to a fixed height. */}
          <div className="mt-[clamp(1.5rem,3.5vw,2.5rem)] grid gap-x-[clamp(2rem,5vw,4rem)] gap-y-[clamp(2.5rem,5vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
            {copy.colour.elements.items.map((item, i) => (
              <div key={item.name}>
                <div className="flex items-end gap-[clamp(0.75rem,1.5vw,1.25rem)]">
                  <figure className="m-0 w-fit">
                    <Image
                      src={COLOUR_ELEMENTS[i].horizontal}
                      alt={item.horizontalAlt}
                      sizes="(max-width: 640px) 45vw, 170px"
                      className="h-[clamp(2.4rem,4.6vw,3.5rem)] w-auto"
                    />
                    <figcaption className="mt-2 text-center text-[0.8rem] leading-[1.4] text-ink">
                      {copy.colour.elements.horizontalLabel}
                    </figcaption>
                  </figure>
                  <figure className="m-0 w-fit">
                    <Image
                      src={COLOUR_ELEMENTS[i].vertical}
                      alt={item.verticalAlt}
                      sizes="(max-width: 640px) 25vw, 80px"
                      className="h-[clamp(4rem,7.6vw,5.8rem)] w-auto"
                    />
                    <figcaption className="mt-2 text-center text-[0.8rem] leading-[1.4] text-ink">
                      {copy.colour.elements.verticalLabel}
                    </figcaption>
                  </figure>
                </div>

                <h4 className="mt-[clamp(1.2rem,2.5vw,1.8rem)] mb-0 text-[1.15rem] font-normal uppercase leading-[1.3] text-ink">
                  {item.name}
                </h4>
                <Image
                  src={COLOUR_ELEMENTS[i].rule}
                  alt=""
                  sizes="260px"
                  className="mt-2 h-auto w-[clamp(10rem,22vw,16rem)]"
                />
              </div>
            ))}
          </div>

          <hr className="mt-[clamp(2.5rem,6vw,4.5rem)] border-t border-green-ink/12" />

          <h3 className="mt-[clamp(2.5rem,6vw,4.5rem)] mb-0 text-[1.3rem] font-normal leading-[1.3] text-ink">
            {copy.colour.tone.heading}
          </h3>

          {/* Swatch and figures stay in one cell so they cannot drift apart
              when the grid reflows. The cells carry no column gap, which is
              what makes the swatches meet edge to edge as one strip; the
              figures below get their breathing room from their own padding
              instead. */}
          <div className="mt-[clamp(1.5rem,3.5vw,2.5rem)] grid grid-cols-2 gap-y-[clamp(1.75rem,3.5vw,2.5rem)] sm:grid-cols-3 lg:grid-cols-5">
            {COLOUR_TONES.map((tone, i) => (
              <div key={tone.hex}>
                <div
                  aria-hidden="true"
                  className="aspect-[247/162]"
                  style={{ background: `#${tone.hex}` }}
                />
                <p className="mt-5 mb-0 pr-[clamp(0.75rem,2vw,2rem)] text-[0.8rem] leading-[1.9] text-ink">
                  {copy.colour.tone.swatchLabel(i + 1)}
                </p>
                <dl className="m-0 pr-[clamp(0.75rem,2vw,2rem)] text-[0.8rem] leading-[1.9] text-ink">
                  {NOTATIONS.map(([label, key]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3">
                      <dt>{label}</dt>
                      <dd className="m-0 text-right">{tone[key]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <hr className="mt-[clamp(2.5rem,6vw,4.5rem)] border-t border-green-ink/12" />
        </Wrap>
      </section>

      <section className="bg-cream py-[clamp(3rem,7vw,5.5rem)]">
        <Wrap>
          <div className="flex flex-wrap items-center gap-x-[clamp(2rem,6vw,5.5rem)] gap-y-[clamp(2rem,4vw,3rem)]">
            <Image
              src={logoDownload}
              alt={copy.assets.logoAlt}
              sizes="(max-width: 640px) 45vw, 350px"
              className="h-[clamp(11rem,30vw,27rem)] w-auto"
            />

            <div>
              <Display as="h2" className="text-[clamp(2.1rem,5.2vw,4rem)] leading-[1.25]">
                {copy.assets.heading[0]}
                <br />
                {copy.assets.heading[1]}
              </Display>

              <AssetFolderGate
                folderUrl={ASSET_FOLDER_URL}
                copy={copy.assets.gate}
                className={buttonClasses(
                  'green',
                  false,
                  'mt-[clamp(1.75rem,3.5vw,2.75rem)] min-h-[3.4rem] px-9 text-[1rem] uppercase tracking-[0.04em]'
                )}
              >
                {copy.assets.download}
                <Icon id="i-arrow" className="ml-2.5 size-4 fill-none stroke-current" />
              </AssetFolderGate>
            </div>
          </div>
        </Wrap>
      </section>
    </SiteShell>
  );
}
