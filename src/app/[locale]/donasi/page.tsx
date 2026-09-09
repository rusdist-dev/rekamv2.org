import type { Metadata } from 'next';
import Image, { type StaticImageData } from 'next/image';
import cardForest from '@/assets/card-forest.jpg';
import cardOcean from '@/assets/card-ocean.jpg';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import { donasiContent } from '@/i18n/content/donasi';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/donasi', {
    title: donasiContent(locale).hero.eyebrow,
    description: donasiContent(locale).metaDescription,
  });
}

/* rekam.css:1667-1684. Two mirrored panels — copy one side, artwork the other,
   flipped on the second — then a closing prompt. */

function Give({
  eyebrow,
  title,
  lede,
  items,
  cta,
  image,
  alt,
  flip = false,
  id,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  items: string[];
  cta: React.ReactNode;
  image: StaticImageData;
  alt: string;
  /** Mirrors the grid so the artwork leads. The two panels alternate. */
  flip?: boolean;
  id?: string;
}) {
  const copy = (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Display className="mt-4 text-display">{title}</Display>
      <Lede>{lede}</Lede>
      <ul className="mt-6 mb-8 list-disc pl-[1.1rem] leading-[1.8] text-ink-soft">
        {items.map((item) => (
          <li key={item} className="mb-[0.35rem]">
            {item}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );

  const art = <Image src={image} alt={alt} className="w-full" sizes="(max-width: 720px) 100vw, 45vw" />;

  return (
    // The two panels alternate ground: cream, then paper.
    <section id={id} className={`py-[clamp(3rem,7vw,6rem)] ${flip ? 'bg-paper' : 'bg-cream'}`}>
      <Wrap
        className={
          'grid items-center gap-[clamp(2rem,5vw,4rem)] ' +
          (flip
            ? 'md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]'
            : 'md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]')
        }
      >
        {flip ? (
          <>
            {art}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {art}
          </>
        )}
      </Wrap>
    </section>
  );
}

export default async function DonasiPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = donasiContent(locale);

  return (
    <SiteShell current="donasi">
      <PageHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        lede={copy.hero.lede}
        image={cardForest}
        short
      />

      <Give
        id="adopsi"
        eyebrow={copy.adopsi.eyebrow}
        title={copy.adopsi.title}
        lede={copy.adopsi.lede}
        items={copy.adopsi.items}
        cta={<ButtonLink href="#form-donasi">{copy.adopsi.cta}</ButtonLink>}
        image={cardForest}
        alt={copy.adopsi.alt}
      />

      <Give
        id="produk"
        flip
        eyebrow={copy.produk.eyebrow}
        title={copy.produk.title}
        lede={copy.produk.lede}
        items={copy.produk.items}
        cta={
          <ButtonLink href="/merch" variant="ghostGreen">
            {copy.produk.cta}
          </ButtonLink>
        }
        image={cardOcean}
        alt={copy.produk.alt}
      />

      <section id="form-donasi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow>{copy.closing.eyebrow}</Eyebrow>
          <Display className="mt-4 text-display">{copy.closing.title}</Display>
          <Lede>{copy.closing.lede}</Lede>
          {/* The source keeps this note visible on purpose: a fundraising page
              that quietly does nothing is worse than one that says so. */}
          <p className="mt-6 mb-0 max-w-[52ch] text-[0.82rem] leading-[1.7] text-ink-soft">
            {copy.closing.note}
          </p>
          <ButtonLink href="/#kontak" className="mt-8">
            {copy.closing.cta}
          </ButtonLink>
        </Wrap>
      </section>
    </SiteShell>
  );
}
