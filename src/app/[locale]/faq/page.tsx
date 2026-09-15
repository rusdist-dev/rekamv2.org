import type { Metadata } from 'next';
import Image from 'next/image';
import safeguardingImg from '@/assets/save-guarding.png';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { faqContent } from '@/i18n/content/faq';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { cn } from '@/lib/cn';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/faq', {
    title: 'FAQ',
    description: faqContent(locale).metaDescription,
  });
}

/* Hero + full-width photo below it, and a single text section underneath —
 * the same shape as /safeguarding (see the note on that page.tsx), reused
 * here since this page is likewise all standing informational copy with no
 * further sections. */

export default async function FaqPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = faqContent(locale);

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
          <p className="mt-4 mb-0 max-w-[46ch] text-lede leading-[1.65] text-green-900">{copy.hero.lede}</p>
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
            <Eyebrow>{copy.section.eyebrow}</Eyebrow>

            <ol className="m-0 mt-6 list-none space-y-10 p-0">
              {copy.section.items.map((item, i) => (
                <li key={item.question}>
                  <h2 className="m-0 mb-3 text-[1.35rem] font-semibold leading-[1.3] text-green-900">
                    {i + 1}. {item.question}
                  </h2>
                  {item.paragraphs.map((paragraph, j) => (
                    <p key={j} className={cn('mb-0 leading-[1.75] text-ink-soft', j > 0 && 'mt-4')}>
                      {paragraph}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </div>
        </Wrap>
      </section>
    </SiteShell>
  );
}
