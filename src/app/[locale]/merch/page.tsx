import type { Metadata } from 'next';
import heroImg from '@/assets/card-photo.jpg';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { Shop } from '@/components/shop/Shop';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import catalogue from '@/data/products.json';
import { merchContent } from '@/i18n/content/merch';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import type { IconId } from '@/icons';
import { CartProvider } from '@/lib/shop/cart';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/merch', {
    title: 'Merchandise',
    description: merchContent(locale).metaDescription,
  });
}

export default async function MerchPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = merchContent(locale);

  // Only the glyphs this catalogue actually uses, derived from the data.
  const icons = [...new Set(catalogue.products.map((p) => p.glyph))] as IconId[];

  return (
    <CartProvider>
      <SiteShell current="merch" icons={icons}>
        <PageHero
          eyebrow="Fundraising Product"
          title="Merchandise"
          lede={copy.hero.lede}
          image={heroImg}
          short
          dim
        />

        {/* The source shipped this strip and it stays: the catalogue is a
            sample, and saying so beats letting it look like a real shop. */}
        <p role="note" className="m-0 bg-yellow px-gutter py-[0.9rem] text-center text-[0.85rem] font-bold text-bronze">
          {copy.dummyNotice.before} <code>{copy.dummyNotice.codeNote}</code> {copy.dummyNotice.after}
        </p>

        <section className="bg-paper pt-[clamp(3rem,7vw,6rem)]">
          <Wrap className="mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{copy.catalogueSection.eyebrow}</Eyebrow>
              <Display className="mt-4 text-display">{copy.catalogueSection.heading}</Display>
            </div>
            <p className="m-0 max-w-[34ch] text-[0.85rem] leading-[1.65] text-ink-soft">
              {copy.catalogueSection.note}
            </p>
          </Wrap>
          <Shop locale={locale} />
        </section>

        <section className="bg-cream py-[clamp(3rem,7vw,6rem)]">
          <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2">
            <div>
              <Eyebrow>{copy.whereMoney.eyebrow}</Eyebrow>
              <Display className="mt-4 text-display">{copy.whereMoney.heading}</Display>
              <Lede>{copy.whereMoney.body}</Lede>
              <ButtonLink href="/donasi" variant="ghostGreen" className="mt-8">
                {copy.whereMoney.cta}
              </ButtonLink>
            </div>
            <ul className="m-0 grid list-none gap-6 p-0">
              {copy.why.map(({ title, body }) => (
                <li key={title} className="border-t border-green-ink/15 pt-4">
                  <b className="block font-sans text-[1rem] font-semibold text-green-900">{title}</b>
                  <span className="mt-1 block text-[0.92rem] leading-[1.6] text-ink-soft">{body}</span>
                </li>
              ))}
            </ul>
          </Wrap>
        </section>
      </SiteShell>
    </CartProvider>
  );
}
