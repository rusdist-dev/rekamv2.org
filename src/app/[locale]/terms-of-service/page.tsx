import type { Metadata } from 'next';
import Image from 'next/image';
import safeguardingImg from '@/assets/save-guarding.png';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Display, Wrap } from '@/components/ui/primitives';
import { termsOfServiceContent } from '@/i18n/content/terms-of-service';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/terms-of-service', {
    title: 'Term Of Service',
    description: termsOfServiceContent(locale).metaDescription,
  });
}

/* Hero + full-width photo below it, and a single text section underneath —
 * the same shape as /safeguarding, /faq, and /privacy-policy (see the note
 * on those page.tsx files), reused here since this page is likewise all
 * standing informational copy with no further sections. */

export default async function TermsOfServicePage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = termsOfServiceContent(locale);

  return (
    <SiteShell>
      <section className="bg-cream page-top pb-[clamp(2rem,4vw,3rem)]">
        <Wrap>
          <Breadcrumb
            ariaLabel={copy.breadcrumb.aria}
            items={[{ label: copy.breadcrumb.home, href: '/' }, { label: copy.breadcrumb.current }]}
          />

          <Display as="h1" className="max-w-[46ch] text-display-lg leading-[1.15] tracking-normal">
            {copy.hero.title}
          </Display>
        </Wrap>
      </section>

      <Image
        src={safeguardingImg}
        alt={copy.hero.imageAlt}
        sizes="100vw"
        priority
        className="block h-auto w-full object-cover"
      />

      <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <div className="max-w-full">
            <h2 className="m-0 text-[1.6rem] font-semibold leading-[1.3] text-green-900">
              {copy.section.heading}
            </h2>

            {copy.section.intro.map((paragraph, i) => (
              <p key={i} className="mt-4 mb-0 leading-[1.75] text-ink-soft first:mt-4">
                {paragraph}
              </p>
            ))}

            {copy.section.blocks.map((block, i) => (
              <div key={i} className="mt-8">
                <h3 className="m-0 mb-3 text-[1.15rem] font-semibold leading-[1.4] text-green-900">
                  {block.heading}
                </h3>
                {block.parts.map((part, j) =>
                  'paragraph' in part ? (
                    <p key={j} className="mt-3 mb-0 leading-[1.75] text-ink-soft first:mt-0">
                      {part.paragraph}
                    </p>
                  ) : (
                    <ol key={j} className="mt-3 mb-0 list-decimal space-y-2 pl-5 leading-[1.75] text-ink-soft">
                      {part.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  )
                )}
              </div>
            ))}

            <div className="mt-8">
              <h3 className="m-0 mb-3 text-[1.15rem] font-semibold leading-[1.4] text-green-900">
                {copy.section.contact.heading}
              </h3>
              <p className="m-0 leading-[1.75] text-ink-soft">{copy.section.contact.org}</p>
              <p className="m-0 leading-[1.75] text-ink-soft">{copy.section.contact.addressLines[0]}</p>
              <p className="m-0 leading-[1.75] text-ink-soft">{copy.section.contact.addressLines[1]}</p>
              <p className="mt-3 mb-0 leading-[1.75] text-ink-soft">{copy.section.contact.phone}</p>
            </div>
          </div>
        </Wrap>
      </section>
    </SiteShell>
  );
}
