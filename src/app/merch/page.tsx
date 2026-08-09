import type { Metadata } from 'next';
import heroImg from '@/assets/card-photo.jpg';
import { SiteShell } from '@/components/chrome/SiteShell';
import { PageHero } from '@/components/layout/PageHero';
import { Shop } from '@/components/shop/Shop';
import { ButtonLink } from '@/components/ui/button';
import { Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';
import { CartProvider } from '@/lib/shop/cart';
import type { IconId } from '@/icons';
import catalogue from '@/data/products.json';

export const metadata: Metadata = {
  title: 'Merchandise',
  description:
    'Produk bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi.',
};

const WHY = [
  ['Produksi lokal', 'Dikerjakan perajin dan penyablon di Bogor dan sekitarnya.'],
  ['Bahan bertanggung jawab', 'Kanvas dan kertas bersertifikat daur ulang bila tersedia.'],
  ['Kemasan minim plastik', 'Kertas kraft dan tali rami, tanpa bubble wrap.'],
  ['Laporan terbuka', 'Rekap alokasi dana penjualan diterbitkan tiap semester.'],
];

export default function MerchPage() {
  // Only the glyphs this catalogue actually uses, derived from the data.
  const icons = [...new Set(catalogue.products.map((p) => p.glyph))] as IconId[];

  return (
    <CartProvider>
      <SiteShell current="merch" icons={icons}>
        <PageHero
          eyebrow="Fundraising Product"
          title="Merchandise"
          lede="Produk bertema keanekaragaman hayati Nusantara. Seluruh margin penjualan masuk ke kas program konservasi."
          image={heroImg}
          short
          dim
        />

        {/* The source shipped this strip and it stays: the catalogue is a
            sample, and saying so beats letting it look like a real shop. */}
        <p role="note" className="m-0 bg-yellow px-gutter py-[0.9rem] text-center text-[0.85rem] font-bold text-bronze">
          Katalog contoh — nama produk, harga, dan tarif kirim masih dummy, dan kanal pembayaran
          belum diisi. Lihat <code>src/lib/shop/config.ts</code> sebelum dipublikasikan.
        </p>

        <section className="bg-paper pt-[clamp(3rem,7vw,6rem)]">
          <Wrap className="mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Katalog</Eyebrow>
              <Display className="mt-4 text-display">Pilih dukunganmu</Display>
            </div>
            <p className="m-0 max-w-[34ch] text-[0.85rem] leading-[1.65] text-ink-soft">
              Harga sudah termasuk pajak. Pengiriman dari Bogor, 1–3 hari kerja setelah pembayaran
              terverifikasi.
            </p>
          </Wrap>
          <Shop />
        </section>

        <section className="bg-cream py-[clamp(3rem,7vw,6rem)]">
          <Wrap className="grid items-start gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2">
            <div>
              <Eyebrow>Ke mana uangnya</Eyebrow>
              <Display className="mt-4 text-display">Margin masuk ke lapangan</Display>
              <Lede>
                Setelah biaya produksi dan kirim, sisa penjualan dialokasikan ke tiga program:
                patroli dan pemantauan pohon pakan, riset perikanan skala kecil, serta pendidikan
                lingkungan di sekolah.
              </Lede>
              <ButtonLink href="/donasi" variant="ghostGreen" className="mt-8">
                Cara dukungan lainnya
              </ButtonLink>
            </div>
            <ul className="m-0 grid list-none gap-6 p-0">
              {WHY.map(([title, body]) => (
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
