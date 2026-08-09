import type { Metadata } from 'next';
import Image, { type StaticImageData } from 'next/image';
import cardForest from '@/assets/card-forest.jpg';
import cardOcean from '@/assets/card-ocean.jpg';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';

export const metadata: Metadata = {
  alternates: { canonical: '/donasi' },
  title: 'Donasi',
  description:
    'Setiap kontribusi menopang riset, patroli, dan dokumentasi di lanskap yang kami dampingi.',
};

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

export default function DonasiPage() {
  return (
    <SiteShell current="donasi">
      <PageHero
        eyebrow="Donasi"
        title="Dukung kami"
        lede="Setiap kontribusi menopang riset, patroli, dan dokumentasi di lanskap yang kami dampingi."
        image={cardForest}
        short
      />

      <Give
        id="adopsi"
        eyebrow="Cara pertama"
        title="Adopsi Pohon Pakan"
        lede="Rangkong bergantung pada pohon berbuah tertentu sepanjang musim. Dengan mengadopsi satu pohon pakan, Anda membiayai penandaan, pemantauan berkala, dan perlindungannya bersama masyarakat adat di sekitar kawasan."
        items={[
          'Penandaan dan pendataan pohon di lokasi',
          'Pemantauan berkala oleh tim patroli',
          'Laporan kondisi pohon untuk setiap pengadopsi',
        ]}
        cta={<ButtonLink href="#form-donasi">Adopsi satu pohon</ButtonLink>}
        image={cardForest}
        alt="Ilustrasi ukir lembah hutan dengan sungai berkelok"
      />

      <Give
        id="produk"
        flip
        eyebrow="Cara kedua"
        title="Fundraising Product"
        lede="Produk cetak dan merchandise bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi."
        items={[
          'Cetak ilustrasi ukir seri Forest, Ocean, Urban',
          'Buku dan publikasi hasil riset',
          'Merchandise kampanye #MerekamNusantara',
        ]}
        cta={
          <ButtonLink href="/merch" variant="ghostGreen">
            Lihat katalog
          </ButtonLink>
        }
        image={cardOcean}
        alt="Ilustrasi ukir gerombolan ikan di laut"
      />

      <section id="form-donasi" className="bg-paper py-[clamp(3rem,7vw,6rem)]">
        <Wrap>
          <Eyebrow>Langkah berikutnya</Eyebrow>
          <Display className="mt-4 text-display">Siap berdonasi?</Display>
          <Lede>
            Kanal pembayaran belum tersambung ke halaman ini. Untuk sementara, hubungi kami lebih
            dulu dan tim akan memandu prosesnya.
          </Lede>
          {/* The source keeps this note visible on purpose: a fundraising page
              that quietly does nothing is worse than one that says so. */}
          <p className="mt-6 mb-0 max-w-[52ch] text-[0.82rem] leading-[1.7] text-ink-soft">
            Catatan teknis: sambungkan tombol di atas ke payment gateway atau halaman donasi resmi
            sebelum halaman ini dipublikasikan.
          </p>
          <ButtonLink href="/#kontak" className="mt-8">
            Hubungi kami
          </ButtonLink>
        </Wrap>
      </section>
    </SiteShell>
  );
}
