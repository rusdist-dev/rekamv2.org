import type { Metadata } from 'next';
import Image from 'next/image';
import iconEmail from '@/assets/icon-email.svg';
import iconTelepon from '@/assets/icon-telepon.svg';
import safeguardingImg from '@/assets/save-guarding.png';
import card2 from '@/assets/banner/card2.jpg';
import { SiteShell } from '@/components/chrome/SiteShell';
import { AppLink } from '@/components/ui/AppLink';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { safeguardingContent } from '@/i18n/content/safeguarding';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  return pageMetadata(locale, '/safeguarding', {
    title: 'Safeguarding',
    description: safeguardingContent(locale).metaDescription,
  });
}

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

/** Label + control pair for the complaint form. Not `Field` from Checkout.tsx
 *  — that one lives in a client component and isn't exported — but the same
 *  uppercase-label-over-input shape, kept local since this form is a server
 *  component with no state of its own. */
function ComplaintField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* Baru: halaman ini belum ada pada situs sumber. Hero-nya sengaja bukan
 * PageHero biasa — breadcrumb + judul panjang di atas panel krem, lalu foto
 * penuh lebar tanpa scrim di bawahnya — mengikuti pola .article__title pada
 * /berita/[slug] daripada hero bergambar-latar seperti /tentang. */

export default async function SafeguardingPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  const copy = safeguardingContent(locale);

  return (
    <SiteShell>
      <section className="bg-cream page-top pb-[clamp(2rem,4vw,3rem)]">
        <Wrap>
          <nav aria-label={copy.breadcrumb.aria} className="mb-6 text-[0.78rem] text-ink-soft">
            <AppLink href="/" className="no-underline hover:text-green-900">
              {copy.breadcrumb.home}
            </AppLink>
            <span aria-hidden="true" className="px-2">
              /
            </span>
            <span aria-current="page">{copy.breadcrumb.current}</span>
          </nav>

          <Eyebrow>{copy.hero.eyebrow}</Eyebrow>
          <Display
            as="h1"
            className="mt-4 max-w-[46ch] text-display-lg leading-[1.25] tracking-normal"
          >
            {copy.hero.heading}
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
            <p className="m-0 text-lede leading-[1.75] text-green-900">{copy.policy.purposeLede}</p>
            <ul className="mt-4 mb-0 list-disc space-y-1 pl-5 text-lede leading-[1.75] text-green-900">
              <li>{copy.policy.purposeCauses[0]}</li>
              <li>{copy.policy.purposeCauses[1]}</li>
            </ul>

            <p className="mt-8 mb-0 leading-[1.75] text-ink-soft">
              {copy.policy.commitmentsBefore}
              <sup>1</sup>
              {copy.policy.commitmentsAfter}
            </p>
            <p className="mt-6 mb-0 leading-[1.75] text-ink-soft">{copy.policy.doesNotCover}</p>
            <ul className="mt-3 mb-0 list-disc space-y-1 pl-5 leading-[1.75] text-ink-soft">
              <li>
                {copy.policy.doesNotCoverItems[0]}
                <sup>2</sup>
              </li>
              <li>{copy.policy.doesNotCoverItems[1]}</li>
            </ul>

            <h2 className="mt-10 mb-3 text-[1.35rem] font-semibold leading-[1.3] text-green-900">
              {copy.policy.whatIsSafeguardingHeading}
            </h2>
            <p className="m-0 leading-[1.75] text-ink-soft">{copy.policy.whatIsSafeguardingParagraphs[0]}</p>
            <p className="mt-4 mb-0 leading-[1.75] text-ink-soft">{copy.policy.whatIsSafeguardingParagraphs[1]}</p>
            <p className="mt-4 mb-0 leading-[1.75] text-ink-soft">{copy.policy.whatIsSafeguardingParagraphs[2]}</p>

            <h2 className="mt-10 mb-3 text-[1.35rem] font-semibold leading-[1.3] text-green-900">
              {copy.policy.scopeHeading}
            </h2>
            <ul className="m-0 list-disc space-y-1 pl-5 leading-[1.75] text-ink-soft">
              <li>{copy.policy.scopeItems[0]}</li>
              <li>{copy.policy.scopeItems[1]}</li>
            </ul>

            <hr className="mt-10 mb-4 border-t border-green-ink/12" />
            <ol className="m-0 list-none space-y-2 p-0 text-[0.8rem] leading-[1.6] text-ink-soft">
              {copy.policy.footnotes.map((note, i) => (
                <li key={note}>
                  [{i + 1}] {note}
                </li>
              ))}
            </ol>
          </div>
        </Wrap>
      </section>

      <section id="lapor" className="bg-[#f4f3f1] py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <h2 className="m-0 max-w-full text-[clamp(1.4rem,4vw,1.9rem)] leading-[1.4] text-[#0e5436]">
            {copy.lapor.channelsHeading}
          </h2>

          <ul className="mt-6 mb-0 list-none space-y-4 p-0">
            <li className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center"
              >
                <Image src={iconEmail} alt="" className="h-6 w-auto" />
              </span>
              <a
                href="mailto:pengaduan@rekam.or.id"
                className="min-w-0 break-all text-[clamp(1.05rem,4.5vw,1.7rem)] font-medium hover:text-green-800 no-underline text-[#0e5436]"
              >
                pengaduan@rekam.or.id
              </a>
            </li>
            <li className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center">
                <Image src={iconTelepon} alt="" className="size-9" />
              </span>
              <a
                href="tel:+6208112549517"
                className="min-w-0 text-[clamp(1.05rem,4.5vw,1.7rem)] font-medium hover:text-green-800 no-underline text-[#0e5436]"
              >
                0811 1254 9517
              </a>
            </li>
          </ul>

          <hr className="my-10 border-t border-green-ink/15" />

          <div className="grid gap-[clamp(2rem,4vw,3rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h3 className="m-0 text-[1.4rem] font-semibold leading-[1.4] text-[#0e5436]">
                {copy.lapor.eligibilityHeading}
              </h3>
              <ul className="mt-3 mb-8 list-disc space-y-2 pl-5 text-[1rem] leading-[1.65] text-ink-soft">
                {copy.lapor.eligibilityItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3 className="m-0 text-[1.4rem] font-semibold leading-[1.4] text-[#0e5436]">
                {copy.lapor.processHeading}
              </h3>
              <ul className="mt-3 mb-0 list-disc space-y-2 pl-5 text-[1rem] leading-[1.65] text-ink-soft">
                {copy.lapor.processSteps.map((step) => (
                  <li key={step.label}>
                    <strong className="text-ink">{step.label}</strong> {step.text}
                  </li>
                ))}
              </ul>
            </div>

            <form className="rounded-[14px] border border-green-ink/12 bg-white p-6">
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-3 block font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-green-900">
                  {copy.lapor.form.anonymityLegend}
                </legend>
                <div className="grid gap-2">
                  {copy.lapor.form.anonymityOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-sage/30 px-4 py-3 text-[0.92rem] text-ink"
                    >
                      <input type="radio" name="anonim" value={opt} className="accent-green-700" />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-4">
                <ComplaintField id="nama" label={copy.lapor.form.nameLabel}>
                  <input id="nama" name="nama" type="text" className={inputCls} />
                </ComplaintField>
                <ComplaintField id="email-pengadu" label={copy.lapor.form.emailLabel}>
                  <input id="email-pengadu" name="email" type="email" className={inputCls} />
                </ComplaintField>
                <ComplaintField id="alamat" label={copy.lapor.form.addressLabel}>
                  <input id="alamat" name="alamat" type="text" className={inputCls} />
                </ComplaintField>
                <ComplaintField id="nomor" label={copy.lapor.form.phoneLabel}>
                  <input id="nomor" name="nomor" type="tel" className={inputCls} />
                </ComplaintField>
                <ComplaintField id="keluhan" label={copy.lapor.form.messageLabel}>
                  <textarea id="keluhan" name="keluhan" rows={4} className={inputCls} />
                </ComplaintField>
              </div>

              <button
                type="submit"
                className="mt-6 min-h-[3rem] w-full rounded-lg bg-green-700 text-[0.95rem] font-bold text-white hover:bg-green-800"
              >
                {copy.lapor.form.submit}
              </button>
            </form>
          </div>
        </Wrap>
      </section>

      <section className="grid bg-white lg:min-h-[26rem] lg:grid-cols-2">
        <div className="self-center px-gutter py-[clamp(3rem,6vw,5rem)] text-center">
          <h2 className="mt-4 mb-0 font-display text-[clamp(2rem,6vw,5em)] leading-[1.15] text-green-900">
            {copy.cta.heading[0]}
            <br />
            {copy.cta.heading[1]}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tentang" variant="ghostGreen">
              {copy.cta.button}
            </ButtonLink>
          </div>
        </div>
        <div className="relative h-64 w-full lg:h-full">
          <Image
            src={card2}
            alt={copy.cta.imageAlt}
            fill
            sizes="(max-width: 1000px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
    </SiteShell>
  );
}
