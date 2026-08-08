import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Chip, Display, Eyebrow, Lede, Wrap } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Design tokens',
  robots: { index: false, follow: false },
};

/* The Fase 1 approval gate. Every token ported out of rekam.css, shown next to
   the source rule it came from, so the palette and type scale can be signed off
   before any page component exists. Fixing tokens after forty components are
   written is the expensive version of this conversation. */

const SAMPLED = [
  ['green-900', '#2C7A56', 'heading, footer, bar kartu'],
  ['green-700', '#006838', 'tombol terisi'],
  ['green-500', '#5cb885', '—'],
  ['paper', '#F5F4F4', 'latar halaman'],
  ['cream', '#F4F2EB', 'section kutipan'],
  ['band', '#F4F3EF', 'band prioritas'],
  ['mauve', '#EFEBED', 'rail galeri'],
  ['sage', '#B7CCC7', 'panel formulir'],
  ['sage-deep', '#A3BDB6', 'baris opsi'],
  ['blue', '#6F8ABE', 'statistik Forest'],
  ['rust', '#AA5109', 'statistik Urban'],
  ['olive', '#A3B18A', 'statistik Ocean'],
  ['yellow', '#FEC901', 'panah kartu'],
  ['white', '#FFFFFF', '—'],
  ['ink', '#1D2A22', 'teks utama'],
  ['ink-soft', '#4A5A50', 'teks sekunder'],
] as const;

const RECOVERED = [
  ['green-ink', '#0E5436', 'dasar 60+ rgba() border & shadow'],
  ['night', '#08140E', 'dasar rgba() scrim'],
  ['green-800', '#00522C', 'hover tombol, rekam.css:158'],
  ['blue-deep', '#5F77A3', '—'],
  ['rust-deep', '#7A3A06', '—'],
  ['olive-deep', '#707A5F', '—'],
  ['yellow-light', '#FFD733', '—'],
  ['bronze', '#241D00', '—'],
  ['bronze-soft', '#4A3A06', '—'],
  ['forest-black', '#0B1712', '—'],
  ['forest-black-deep', '#0A1410', '—'],
] as const;

const SCALE = [
  ['text-hero-lg', 'clamp(2.6rem, 7.5vw, 5.5rem)', '.hero__title'],
  ['text-hero', 'clamp(2.6rem, 7vw, 5rem)', '.page-hero__title, .ev-hero__title'],
  ['text-hero-sm', 'clamp(2.5rem, 6vw, 4.5rem)', '.display'],
  ['text-stat-lg', 'clamp(2.2rem, 5vw, 3.75rem)', '.stat__value'],
  ['text-display-lg', 'clamp(2.1rem, 5vw, 3.5rem)', '.article__title, .shop__title'],
  ['text-display', 'clamp(1.9rem, 4vw, 3rem)', 'section title — 10 penggunaan'],
  ['text-stat', 'clamp(1.9rem, 3.4vw, 2.7rem)', '.bn__value'],
  ['text-quote', 'clamp(1.6rem, 3.2vw, 2.9rem)', '.quote__text, .lead-post__title'],
  ['text-title-lg', 'clamp(1.5rem, 3.5vw, 2.1rem)', '.bio__name'],
  ['text-title', 'clamp(1.4rem, 3vw, 1.9rem)', '.sv__title'],
  ['text-title-sm', 'clamp(1.15rem, 1.8vw, 1.4rem)', '.post__title'],
  ['text-lede-lg', 'clamp(1.05rem, 1.8vw, 1.3rem)', '.card__body, .page-hero__lede'],
  ['text-lede', 'clamp(1rem, 1.5vw, 1.15rem)', 'menyerap 5 nilai nyaris identik'],
  ['text-base', '17px', 'body, rekam.css:51'],
  ['text-sm', 'clamp(0.96rem, 1.4vw, 1.05rem)', '.sthink__panel p'],
  ['text-xs', 'clamp(0.82rem, 1.2vw, 0.98rem)', '.numcard__label, .stat__label'],
  ['text-2xs', 'clamp(0.72rem, 1vw, 0.8rem)', 'eyebrow, meta'],
] as const;

function Swatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  return (
    <li className="flex items-center gap-4">
      <span
        className="size-14 shrink-0 rounded-lg border border-green-ink/15"
        style={{ background: hex }}
        aria-hidden="true"
      />
      <span className="min-w-0">
        <code className="block text-[0.82rem] font-semibold text-ink">{name}</code>
        <code className="block text-[0.75rem] text-ink-soft">{hex}</code>
        <span className="block text-[0.75rem] text-ink-soft">{use}</span>
      </span>
    </li>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-green-ink/15 py-16">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-3 mb-10 max-w-[62ch] text-lede text-ink-soft">{note}</p>
      {children}
    </section>
  );
}

export default function DesignTokensPage() {
  return (
    <Wrap className="py-20">
      <Eyebrow>Fase 1 — gerbang persetujuan</Eyebrow>
      <Display as="h1" className="mt-4">
        Token desain
      </Display>
      <Lede className="max-w-[58ch]">
        Setiap nilai di halaman ini diambil dari <code>rekam.css</code>, bukan dari default
        Tailwind. Setujui halaman ini sebelum komponen pertama ditulis.
      </Lede>

      <Section
        title="Warna — 16 token tersampel"
        note="Disalin verbatim dari rekam.css:8-24. Nilainya dibaca langsung dari artwork Canva yang diekspor, jadi tidak ada yang boleh dibulatkan."
      >
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLED.map(([n, h, u]) => (
            <Swatch key={n} name={n} hex={h} use={u} />
          ))}
        </ul>
      </Section>

      <Section
        title="Warna — nilai yang dipulihkan"
        note="Sebelas warna yang bocor di luar token di sumbernya. Dua yang pertama adalah temuan terpenting: 81 nilai rgba() unik ternyata hanya dua warna dasar pada alpha berbeda, jadi sekarang ditulis green-ink/12, night/35, dan seterusnya."
      >
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {RECOVERED.map(([n, h, u]) => (
            <Swatch key={n} name={n} hex={h} use={u} />
          ))}
        </ul>
      </Section>

      <Section
        title="Tangga tipe — 17 langkah"
        note="Menggantikan 51 pemanggilan font-size clamp() dengan 38 nilai berbeda. Lima di antaranya — 1.08, 1.1, 1.12, 1.125, dan 1.15rem — adalah lima ejaan untuk satu ukuran yang sama; semuanya kini text-lede."
      >
        <ul className="list-none space-y-8 p-0">
          {SCALE.map(([name, value, src]) => (
            <li key={name} className="border-b border-green-ink/10 pb-6">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <code className="text-[0.82rem] font-semibold text-ink">{name}</code>
                <code className="text-[0.75rem] text-ink-soft">{value}</code>
                <span className="text-[0.75rem] text-ink-soft">← {src}</span>
              </div>
              <p
                className="mt-2 mb-0 font-display leading-[1.05] text-green-900"
                style={{ fontSize: `var(--${name})` }}
              >
                Merekam Nusantara
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Keluarga huruf"
        note="Di-host sendiri lewat next/font, menghapus dua preconnect dan satu permintaan ke fonts.googleapis.com dari 11 halaman."
      >
        <ul className="list-none space-y-6 p-0">
          <li>
            <code className="text-[0.82rem] text-ink-soft">font-display — Playfair Display</code>
            <p className="m-0 font-display text-display text-green-900">Documenting knowledge</p>
          </li>
          <li>
            <code className="text-[0.82rem] text-ink-soft">font-sans — DM Sans</code>
            <p className="m-0 font-sans text-lede-lg text-ink">
              Dari puncak hutan hingga dasar laut, REKAM bekerja di seluruh lanskap kehidupan
              Indonesia.
            </p>
          </li>
          <li>
            <code className="text-[0.82rem] text-ink-soft">font-label — Raleway</code>
            <p className="m-0 font-label text-[0.8rem] font-semibold uppercase tracking-[0.32em] text-green-900">
              What we conserve
            </p>
          </li>
        </ul>
      </Section>

      <Section
        title="Kontrol"
        note="Tombol dari rekam.css:142-159, :1450-1455, :1752-1757. Chip dari :1842-1855. Angkatan hover dimatikan di bawah prefers-reduced-motion, sesuai rekam.css:1035."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="green">Read More</Button>
          <Button variant="ghostGreen">Ikuti kami</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl bg-green-900 p-8">
          <Button variant="ghostLight">Shop</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Chip active>Semua</Chip>
          <Chip>Apparel</Chip>
          <Chip>Aksesori</Chip>
          <Chip>Cetak</Chip>
        </div>
      </Section>

      <Section
        title="Layout"
        note="--wrap 1180px dan --gutter clamp(1.25rem, 4vw, 3.5rem), keduanya tidak berubah. Breakpoint 560/640/720/1000px kini bernama xs/sm/md/lg dengan nilai yang sama persis."
      >
        <div className="rounded-lg border border-dashed border-green-700 bg-band p-gutter">
          <p className="m-0 text-sm text-ink-soft">
            Kotak ini memakai <code>max-w-wrap</code> dan <code>px-gutter</code>.
          </p>
        </div>
      </Section>
    </Wrap>
  );
}
