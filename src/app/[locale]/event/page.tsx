import type { Metadata } from 'next';
import Image from 'next/image';
import heroEvnt from '@/assets/banner/event1.png';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { AppLink } from '@/components/ui/AppLink';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { listEvents } from '@/lib/content';

/* A page the old site never had. Events existed only as two nav links that both
 * pointed at the same event-detail.html — so the second one showed you the
 * first one's event. There was nowhere to see what was on. */

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await readLocale(params), '/event', {
    title: 'Event',
    description: 'Diskusi, pemutaran film, dan lokakarya dari seluruh program REKAM.',
  });
}

export default async function EventIndexPage() {
  const events = await listEvents();

  return (
    <SiteShell current="event">
      <PageHero
        eyebrow="Event"
        title="Whats on"
        lede="Diskusi, pemutaran film, dan lokakarya dari seluruh program REKAM."
        image={heroEvnt}
        short
        dim
      />

      <section className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow>Agenda</Eyebrow>
          <Display className="mt-4 mb-[clamp(2rem,4vw,3rem)] text-display">Acara mendatang</Display>

          <ul className="m-0 grid list-none gap-[clamp(2rem,4vw,3rem)] p-0 lg:grid-cols-2">
            {events.map((event) => (
              <li key={event.slug}>
                <AppLink href={`/event/${event.slug}`} className="group block no-underline">
                  {/* Same event1.png the detail page's own hero uses (event/[slug]/page.tsx)
                      rather than event.cover/COVERS — that map only holds berita photos,
                      so a raw lookup was showing an unrelated news article's cover here. */}
                  <span className="block overflow-hidden rounded-sm">
                    <Image
                      src={heroEvnt}
                      alt={event.coverAlt}
                      width={1200}
                      height={675}
                      sizes="(max-width: 1000px) 100vw, 50vw"
                      className="block aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </span>
                  <h3 className="mt-5 mb-0 font-display text-title-lg leading-[1.15] text-green-900">
                    {event.title}
                  </h3>
                  <p className="mt-3 mb-0 text-lede leading-[1.65] text-ink-soft">{event.lede}</p>
                  {event.facts.length > 0 && (
                    <dl className="mt-4 mb-0 flex flex-wrap gap-x-8 gap-y-2">
                      {event.facts.slice(0, 2).map((f) => (
                        <div key={f.label}>
                          <dt className="font-label text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                            {f.label}
                          </dt>
                          <dd className="ml-0 text-[0.95rem] font-bold text-green-900">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </AppLink>
              </li>
            ))}
          </ul>

          {/* Honest rather than padded. One event exists; the nav used to imply
              two by linking a name that led somewhere else. */}
          <p className="mt-[clamp(2rem,4vw,3rem)] mb-0 text-[0.82rem] leading-[1.7] text-ink-soft">
            Menampilkan {events.length} acara. Agenda berikutnya menyusul ketika daftar ini
            tersambung ke CMS.
          </p>
        </Wrap>
      </section>
    </SiteShell>
  );
}
