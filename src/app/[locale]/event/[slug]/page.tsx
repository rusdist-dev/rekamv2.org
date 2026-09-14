import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import eventImg from '@/assets/banner/event1.png';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PostGrid } from '@/components/news/PostCard';
import { ButtonLink } from '@/components/ui/button';
import { NumberCard, NumberGrid } from '@/components/ui/NumberCard';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import { eventContent } from '@/i18n/content/event';
import { pageMetadata, readLocale } from '@/i18n/metadata';
import { eventDocumentation, getEvent, listEvents, resolveCover } from '@/lib/content';

/* rekam.css:1690-1812. A landing-style page rather than an article: full-bleed
 * hero with the facts strip, then about / rundown / takeaways / documentation /
 * sign-up. */

export async function generateStaticParams() {
  const events = await listEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await readLocale(params);
  const event = await getEvent(slug, locale);
  if (!event) return {};

  return pageMetadata(locale, `/event/${event.slug}`, {
    title: event.title,
    description: event.lede,
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await readLocale(params);
  const copy = eventContent(locale);
  const event = await getEvent(slug, locale);
  if (!event) notFound();

  const docs = await eventDocumentation(event.documentation);

  return (
    <SiteShell current="event">
      <section className="relative isolate flex min-h-[min(44rem,100svh)] items-end overflow-hidden bg-forest-black pb-[clamp(2.5rem,6vh,4.5rem)] pt-[calc(var(--nav-h)+clamp(4rem,10vh,8rem))]">
        {/* The event's own cover from the CMS; event1.png is the stand-in for
            one that has none. A 1.6MB PNG behind a full-bleed hero is exactly
            what the optimiser is for, so this is NOT `unoptimized` — the host
            is allow-listed in next.config.ts. */}
        <Image
          src={resolveCover(event.cover) ?? eventImg}
          alt={event.coverAlt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{ background: 'rgba(20, 40, 30, 0.58)' }}
        />
        <Wrap className="relative z-[2]">
          <Eyebrow light>Event</Eyebrow>
          <h1 className="mt-3 mb-0 max-w-[12ch] font-display text-hero font-normal leading-[1.04] tracking-[-0.02em] text-white">
            {event.title}
          </h1>
          <p className="mt-5 mb-0 max-w-[44ch] text-lede leading-[1.6] text-white/88">{event.lede}</p>

          {event.facts.length > 0 && (
            <dl className="mt-[clamp(1.75rem,4vw,2.5rem)] mb-0 flex flex-wrap gap-[clamp(1.5rem,4vw,3rem)] border-t border-white/25 pt-6">
              {event.facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-label text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/60">
                    {f.label}
                  </dt>
                  <dd className="mt-[0.35rem] ml-0 text-[1.05rem] font-bold text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-[clamp(1.75rem,4vw,2.5rem)] flex flex-wrap gap-3">
            {/* Only shown when sign-ups exist: events.json's event has its own
                CTA band at #daftar, a CMS event has one only when it carries a
                registration_url, and a button scrolling to a section that
                isn't on the page is worse than no button. */}
            {(event.cta || event.registerUrl) && (
              <ButtonLink href="#daftar">{copy.detail.registerNow}</ButtonLink>
            )}
            <ButtonLink href="#tentang-event" variant="ghostLight">
              {copy.detail.aboutEvent}
            </ButtonLink>
          </div>
        </Wrap>
      </section>

      {/* An unmissable strip, because the details above are still examples. */}
      {event.notice && (
        <p role="note" className="m-0 bg-yellow px-gutter py-[0.9rem] text-center text-[0.85rem] font-bold text-bronze">
          {event.notice}
        </p>
      )}

      {event.about && (
        <section id="tentang-event" className="bg-cream py-[clamp(3rem,7vw,6rem)]">
          <Wrap className="grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <Eyebrow>{event.about.eyebrow}</Eyebrow>
              <Display className="mt-4 text-display">{event.about.title}</Display>
            </div>
            <div>
              {event.about.html ? (
                // Rich text straight from the CMS, same treatment the news
                // detail page gives a post body.
                <div
                  /* Paragraphs get the spacing the JSON path uses. Plain <div>s
                     are styled but NOT given a margin: this CMS writes its
                     breaks as <div><br></div>, so adding one would double
                     every gap the author actually asked for. */
                  className="text-lede leading-[1.8] text-ink [&_p]:mt-0 [&_p]:mb-[1.4rem] [&_a]:text-green-900 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: event.about.html }}
                />
              ) : (
                event.about.body.map((p) => (
                  <p key={p.slice(0, 40)} className="mt-0 mb-[1.4rem] text-lede leading-[1.8] text-ink">
                    {p}
                  </p>
                ))
              )}
            </div>
          </Wrap>
        </section>
      )}

      {event.agenda.length > 0 && (
        <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>Rundown</Eyebrow>
            <Display className="mt-4 mb-10 text-display">{copy.detail.rundown.heading}</Display>
            <ol className="m-0 list-none p-0">
              {event.agenda.map((row, i) => (
                <li
                  key={row.time}
                  className={cnRow(i === event.agenda.length - 1)}
                >
                  <span className="font-display text-[1.3rem] text-green-900">{row.time}</span>
                  <span className="leading-[1.65] text-ink-soft">
                    <strong className="mb-[0.2rem] block text-[1.05rem] font-normal text-green-900">
                      {row.title}
                    </strong>
                    {row.detail}
                  </span>
                </li>
              ))}
            </ol>
          </Wrap>
        </section>
      )}

      {event.gains.length > 0 && (
        <section className="bg-cream py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.detail.gains.eyebrow}</Eyebrow>
            <Display className="mt-4 mb-10 text-display">{copy.detail.gains.heading}</Display>
            <NumberGrid>
              {event.gains.map((g, i) => (
                <NumberCard key={g} index={i} value={String(i + 1).padStart(2, '0')} label={g} />
              ))}
            </NumberGrid>
          </Wrap>
        </section>
      )}

      {docs.length > 0 && (
        <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
          <Wrap>
            <Eyebrow>{copy.detail.documentation.eyebrow}</Eyebrow>
            <Display className="mt-4 mb-[clamp(1.5rem,3vw,2.5rem)] text-display">
              {copy.detail.documentation.heading}
            </Display>
            <PostGrid posts={docs} showExcerpt={false} />
          </Wrap>
        </section>
      )}

      {event.cta && (
        <section id="daftar" className="grid bg-[#f4f3f1] lg:grid-cols-2">
          <div className="self-stretch px-gutter py-[clamp(1.5rem,4vw,2.5rem)]">
            <Display className="text-display-lg">{event.cta.title}</Display>
            <Lede className="text-black">{event.cta.lede}</Lede>
            {event.cta.note && (
              <p className="mt-6 mb-0 max-w-[34ch] text-[0.85rem] leading-[1.6] text-ink-soft italic">
                {event.cta.note}
              </p>
            )}
            <div className="mt-[clamp(1.75rem,4vw,2.5rem)] flex flex-wrap gap-3">
              {event.registerUrl && (
                <ButtonLink href={event.registerUrl} target="_blank" rel="noreferrer">
                  {copy.detail.registerNow}
                </ButtonLink>
              )}
              <ButtonLink href="/donasi" variant={event.registerUrl ? 'ghostGreen' : 'green'}>
                {copy.detail.cta.support}
              </ButtonLink>
              <ButtonLink href="/#kontak" variant="ghostGreen">
                {copy.detail.cta.contact}
              </ButtonLink>
            </div>
          </div>
          <div className="flex items-end justify-center self-stretch">
            <Image
              src={resolveCover(event.cover) ?? eventImg}
              alt=""
              width={1200}
              height={800}
              sizes="(max-width: 1000px) 100vw, 50vw"
              className="block h-auto w-full object-contain"
            />
          </div>
        </section>
      )}
    </SiteShell>
  );
}

/* rekam.css:1787-1794 — a rule above every row and one below the last, so the
   list reads as a closed block rather than a trailing edge. */
const cnRow = (last: boolean) =>
  'grid grid-cols-[4.5rem_1fr] gap-[clamp(1rem,3vw,2rem)] border-t border-green-ink/15 py-5 lg:grid-cols-[6rem_1fr]' +
  (last ? ' border-b' : '');
