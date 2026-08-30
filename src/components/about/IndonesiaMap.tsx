'use client';

import { useEffect, useId, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { STREETVIEW, type Place } from '@/lib/about/streetview';
import { cn } from '@/lib/cn';

/* Peta wilayah kerja — pengganti ilustrasi peta-kerja.svg.
 *
 * SENGAJA TANPA TILE LAYER. Itu yang membuat warna latarnya bisa disetel: kalau
 * ada tile, yang terlihat adalah gambar dari server tile dan `background` hanya
 * sempat berkedip sebelum tertutup. Tanpa tile, latar peta ini murni CSS, dan
 * yang digambar hanya poligon dari GeoJSON. Tidak ada kunci API dan tidak ada
 * pihak ketiga yang bisa melihat pengunjung situs ini.
 *
 * GeoJSON-nya diambil dari /geo (public/), bukan diimpor sebagai modul. Kedua
 * berkas totalnya ~614 KB; mengimpornya menaruh seluruhnya ke dalam bundel JS
 * halaman ini, padahal isinya tidak berubah antar rilis. Sebagai berkas statis
 * keduanya di-cache terpisah dari bundel yang berganti hash tiap deploy, dan
 * diambil paralel.
 *
 * Leaflet diimpor di dalam useEffect, bukan di puncak modul. Komponen klien
 * tetap dirender di server oleh Next, dan modul Leaflet menyentuh `window`
 * saat dievaluasi — impor statis akan menggagalkan SSR halaman ini. Pola
 * "lib imperatif hidup di dalam ref" ini sama dengan Pano360.
 */

const REGION_URL = '/geo/indonesia-region.json';
const WPP_URL = '/geo/wppnri.json';
/* Lokasi yang diharapkan untuk data provinsi. TIDAK dipakai sebagai default:
   lapisan ini opt-in lewat prop `provinceUrl`. Kalau di-fetch tanpa berkasnya
   ada, setiap pengunjung mendapat 404 di konsol peramban — kegagalan diam yang
   menyisakan sampah. Aktifkan setelah berkasnya benar-benar dipasang:
     <IndonesiaMap provinceUrl="/geo/provinces.json" /> */
export const PROVINCE_URL = '/geo/provinces.json';

/* Zoom dibatasi karena kedua sumber dibulatkan ke 3 desimal (~56 m) dan WPP
   disederhanakan pada toleransi ~1,1 km. Di zoom 8 satu piksel ~610 m, jadi
   penyederhanaan itu tetap di bawah ambang yang terlihat. */
const MAX_ZOOM = 8;

/* Seberapa longgar bingkai awalnya, sebagai rasio kotak batas Indonesia yang
   dilebarkan ke tiap sisi. 0 berarti garis pantai terluar menempel tepi
   kanvas. Naikkan untuk mengecilkan tampilan awal, turunkan untuk memenuhi. */
const FIT_PAD = 0.12;

/** WPP yang disorot. Dibedakan lewat warna, bukan lewat menyembunyikan sisanya:
 *  zona lain tetap perlu terlihat supaya yang disorot punya pembanding. */
const HIGHLIGHT = ['572', '573', '712', '713', '718'];

/** Titik yang ditandai di peta, dalam urutan ini.
 *
 * Koordinatnya TIDAK ditulis ulang di sini — diambil dari STREETVIEW.places
 * supaya lat/lng hanya hidup di satu tempat. Yang ditentukan di sini hanya
 * pilihan dan urutannya, karena panel Street View memakai daftar yang sama:
 * memangkasnya di sana akan diam-diam mengubah pilihan lokasi panel itu ketika
 * ia diaktifkan kembali.
 *
 * Pati tidak masuk daftar ini. */
const PIN_IDS = ['bogor', 'semarang', 'denpasar', 'surabaya', 'mataram', 'makassar'];

const PINS: Place[] = PIN_IDS.map((id) => {
  const found = STREETVIEW.places.find((p) => p.id === id);
  // Dilempar, bukan dilewati. Id yang salah tulis adalah bug, dan pin yang
  // hilang diam-diam tidak akan disadari siapa pun; modul ini dievaluasi saat
  // prerender, jadi kegagalannya muncul di `next build`, bukan di peramban
  // pengunjung.
  if (!found) throw new Error(`PIN_IDS: tidak ada tempat berid "${id}" di STREETVIEW.places`);
  return found;
});

/** Kelompok provinsi yang disorot, masing-masing dengan warnanya sendiri.
 *
 * Dijadikan array kelompok, bukan dua pasang prop terpisah, supaya kelompok
 * ketiga tidak menuntut perubahan struktur lagi — penggambarannya ikut jumlah
 * kelompok.
 *
 * CATATAN DATA (kelompok 1): Papua Barat Daya dimekarkan dari Papua Barat pada
 * Desember 2022 dan tidak ada di Natural Earth (33 provinsi, pra-2012),
 * geoBoundaries (34, data 2017), maupun dataset komunitas yang diperiksa.
 * Poligon "Papua Barat" di sumber 2017 masih ekstent PRA-pemekaran, jadi
 * wilayah yang kini Papua Barat Daya tetap ikut tersorot. */
export type ProvinceGroup = { color: string; names: string[] };

const PROVINCE_GROUPS: ProvinceGroup[] = [
  {
    color: 'var(--color-yellow-600)',
    names: ['Kalimantan Timur', 'Kalimantan Barat', 'Papua Barat'],
  },
  {
    color: 'var(--color-blue-900)',
    names: ['Banten', 'Jawa Tengah', 'Nusa Tenggara Barat', 'Sulawesi Barat', 'Maluku'],
  },
];

/* Sumber provinsi menamai kolomnya berbeda-beda: `state` (CartoDB/komunitas),
   `shapeName` (geoBoundaries), `NAME_1` (GADM), `name`/`provinsi` (lainnya).
   Dicoba berurutan supaya berkas apa pun bisa dipasang tanpa menyunting kode. */
const NAME_KEYS = ['state', 'shapeName', 'NAME_1', 'name', 'provinsi', 'PROVINSI', 'Propinsi'];

type Props = {
  /** Warna latar, yakni laut. Terlihat karena tidak ada tile yang menutupinya. */
  background?: string;
  /** Warna isian daratan Indonesia. */
  land?: string;
  /** Warna garis pantai Indonesia. */
  outline?: string;
  /** Warna negara tetangga. Dibedakan supaya Indonesia tetap jadi subjeknya. */
  neighbour?: string;
  /** Warna zona WPPNRI biasa. */
  wpp?: string;
  /** Warna zona WPPNRI yang disorot — biru yang lebih gelap. */
  wppHighlight?: string;
  /** Nomor WPP yang disorot. */
  highlight?: string[];
  /** Bentangkan kanvas peta selebar layar, menembus <Wrap> di sekelilingnya. */
  fullBleed?: boolean;
  /** Sumber batas provinsi. Dibiarkan kosong = lapisannya mati. */
  provinceUrl?: string;
  /** Kelompok provinsi yang disorot. Nama dicocokkan tanpa membedakan
   *  huruf besar/kecil. Sorotan ini di DARATAN, jadi warnanya harus terbaca
   *  beda dari zona WPP yang biru di laut. */
  provinceGroups?: ProvinceGroup[];
  /** Warna penanda lokasi. */
  marker?: string;
  places?: Place[];
  className?: string;
};

export function IndonesiaMap({
  background = 'var(--color-sage)',
  land = 'var(--color-green-900)',
  outline = 'var(--color-green-700)',
  neighbour = 'var(--color-gray-300)',
  wpp = 'var(--color-blue)',
  wppHighlight = 'var(--color-blue-400)',
  highlight = HIGHLIGHT,
  fullBleed = false,
  provinceUrl,
  provinceGroups = PROVINCE_GROUPS,
  marker = 'var(--color-yellow)',
  places = PINS,
  className,
}: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const captionId = useId();
  const [failed, setFailed] = useState(false);

  /* Array sebagai dependensi effect akan membangun ulang peta tiap render kalau
     pemanggilnya menuliskannya inline. Yang dibandingkan isinya, bukan
     identitasnya. */
  const highlightKey = highlight.join(',');
  /* Satu string yang mewakili seluruh kelompok — warna DAN nama. Array sebagai
     dependensi effect akan membangun ulang peta tiap render kalau pemanggilnya
     menuliskannya inline. */
  const groupsKey = provinceGroups.map((g) => `${g.color}:${g.names.join('|')}`).join(';');

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let map: import('leaflet').Map | null = null;
    /* Pendengar sentuh di bawah dipasang pada `el`, yang bertahan melintasi
       pemasangan ulang effect — jadi ia harus dilepas sendiri; map.remove()
       hanya melepas yang dipasang Leaflet. */
    let detach: (() => void) | null = null;
    let cancelled = false;
    const hot = new Set(highlightKey.split(','));
    /* Nama -> warna. Kalau satu provinsi muncul di dua kelompok, yang terakhir
       menang; itu bug di konfigurasi, bukan keadaan yang perlu didukung. */
    const colourOf = new Map<string, string>();
    for (const g of provinceGroups) {
      for (const n of g.names) colourOf.set(n.trim().toLowerCase(), g.color);
    }

    (async () => {
      const [{ default: L }, regionRes, wppRes, provRes] = await Promise.all([
        import('leaflet'),
        fetch(REGION_URL),
        fetch(WPP_URL),
        // Lapisan opsional: hanya diminta kalau pemanggil memberi URL-nya, dan
        // kegagalannya tidak boleh menjatuhkan peta.
        provinceUrl ? fetch(provinceUrl).catch(() => null) : null,
      ]);
      if (!regionRes.ok) throw new Error(`${REGION_URL} -> ${regionRes.status}`);
      if (!wppRes.ok) throw new Error(`${WPP_URL} -> ${wppRes.status}`);
      const [region, wppGeo] = await Promise.all([regionRes.json(), wppRes.json()]);
      // StrictMode memasang effect dua kali; tanpa penjaga ini Leaflet
      // mengeluh "Map container is already initialized".
      if (cancelled || !host.current) return;

      map = L.map(el, {
        // Tidak ada tile, jadi tidak ada yang perlu diatribusi di dalam peta.
        attributionControl: false,
        // Roda mouse dibiarkan menggulir HALAMAN. Peta di tengah artikel yang
        // menyandera scroll adalah cara tercepat membuat pembaca terjebak.
        scrollWheelZoom: false,
        zoomSnap: 0.25,
        maxZoom: MAX_ZOOM,
        // Kontrol zoom pindah ke kanan-bawah. Di kiri-atas ia duduk tepat di
        // jalur header yang fixed: begitu peta tergulir ke bawah header, tombol
        // tambah tertutup dan tidak bisa diklik.
        zoomControl: false,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      /* Roda tetikus sudah dibiarkan menggulir halaman di atas. Di layar
         sentuh yang menyandera gulir bukan roda, melainkan geseran satu jari:
         peta setinggi separuh layar yang menangkapnya membuat pembaca
         terjebak — jempolnya menggeser peta, halamannya diam. Jadi satu jari
         dikembalikan ke halaman, dan geser peta baru hidup selagi jari kedua
         menyentuh. Cubit untuk zoom tidak ikut dimatikan: itu memang dua jari.
         Tetikus dan papan ketik tidak tersentuh aturan ini. */
      if (L.Browser.mobile) {
        const m = map;
        m.dragging.disable();
        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length > 1) m.dragging.enable();
        };
        const onTouchEnd = (e: TouchEvent) => {
          if (e.touches.length < 2) m.dragging.disable();
        };
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchEnd, { passive: true });
        detach = () => {
          el.removeEventListener('touchstart', onTouchStart);
          el.removeEventListener('touchend', onTouchEnd);
          el.removeEventListener('touchcancel', onTouchEnd);
        };
      }

      type Feat = { properties?: { subject?: boolean; wpp?: string; name?: string } };
      const isSubject = (f?: Feat) => Boolean(f?.properties?.subject);
      const isHot = (f?: Feat) => Boolean(f?.properties?.wpp && hot.has(f.properties.wpp));

      /* Urutan menggambar penting. WPP paling bawah: batasnya mengikuti garis
         pantai pada resolusi yang berbeda dari poligon daratan, jadi selisihnya
         harus tertutup daratan, bukan terlihat sebagai celah di tepi pulau. */
      const wppLayer = L.geoJSON(wppGeo, {
        style: (feature) =>
          isHot(feature as Feat)
            ? // Perbedaannya dibuat lewat DUA hal sekaligus — biru yang lebih
              // gelap dan opasitas yang lebih tinggi. Hanya menaikkan opasitas
              // menghasilkan biru yang sama tapi lebih pekat; hanya mengganti
              // hue pada 0.18 nyaris tidak terbaca di atas sage.
              { fillColor: wppHighlight, fillOpacity: 0.42, color: wppHighlight, weight: 1.4 }
            : { fillColor: wpp, fillOpacity: 0.14, color: wpp, weight: 0.8 },
        onEachFeature: (feature, layer) => {
          const p = (feature as Feat).properties ?? {};
          layer.bindTooltip(`WPP ${p.wpp} — ${p.name}`, { sticky: true });
        },
      }).addTo(map);

      L.geoJSON(region, {
        filter: (f) => !isSubject(f as Feat),
        style: { fillColor: neighbour, fillOpacity: 1, color: neighbour, weight: 0.5 },
        interactive: false,
      }).addTo(map);

      const subject = L.geoJSON(region, {
        filter: (f) => isSubject(f as Feat),
        style: { fillColor: land, fillOpacity: 1, color: outline, weight: 0.6 },
        // Tidak interaktif supaya daratan tidak menelan hover milik zona WPP
        // yang ada di bawahnya.
        interactive: false,
      }).addTo(map);

      /* Sorotan provinsi digambar DI ATAS daratan, bukan di bawahnya: ini
         menandai bagian dari daratan itu sendiri, jadi harus menutupi warnanya.
         Zona WPP tetap di paling bawah karena ia laut. */
      if (provRes && provRes.ok) {
        const provGeo = await provRes.json();
        const nameOf = (f?: { properties?: Record<string, unknown> }) => {
          const props = f?.properties ?? {};
          for (const k of NAME_KEYS) {
            const v = props[k];
            if (typeof v === 'string' && v.trim()) return v.trim();
          }
          return '';
        };
        L.geoJSON(provGeo, {
          filter: (f) => colourOf.has(nameOf(f as never).toLowerCase()),
          style: (f) => ({
            // Warna per fitur: satu layer, dua kelompok. Memisahkannya menjadi
            // dua L.geoJSON hanya menduplikasi filter dan tooltip.
            fillColor: colourOf.get(nameOf(f as never).toLowerCase()),
            fillOpacity: 1,
            color: outline,
            /* Garis tepi sedikit lebih tebal daripada poligon lain di peta ini:
               provinsi terkecil dalam daftar (Banten, ~9.700 km2) hanya belasan
               piksel pada zoom awal, dan tanpa tepi yang jelas ia melebur ke
               daratan di sekitarnya. */
            weight: 1.2,
          }),
          onEachFeature: (f, l) => l.bindTooltip(nameOf(f as never), { sticky: true }),
        }).addTo(map);
      }

      /* Nomor zona sebagai divIcon, bukan tooltip permanen: tooltip Leaflet
         butuh CSS global untuk ditata, sedangkan divIcon menerima gaya inline
         sehingga tetap ikut token warna komponen ini. */
      wppLayer.eachLayer((layer) => {
        const feature = (layer as unknown as { feature?: Feat }).feature;
        const p = feature?.properties ?? {};
        if (!p.wpp) return;
        const on = isHot(feature);
        const center = (layer as import('leaflet').Polygon).getBounds().getCenter();
        L.marker(center, {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: '',
            iconSize: [34, 16],
            iconAnchor: [17, 8],
            html:
              `<span style="display:flex;align-items:center;justify-content:center;` +
              `width:34px;height:16px;border-radius:8px;` +
              `background:${on ? wppHighlight : 'var(--color-paper)'};` +
              `color:${on ? 'var(--color-white)' : 'var(--color-green-900)'};` +
              `font-size:10px;font-weight:700;letter-spacing:0.02em;` +
              `border:1px solid ${on ? wppHighlight : wpp}">${p.wpp}</span>`,
          }),
        }).addTo(map!);
      });

      // Dibingkai ke Indonesia saja. Seluruh koleksi membentang dari Vietnam
      // sampai Australia; memuat semuanya akan mengecilkan subjeknya sendiri.
      const frame = subject.getBounds();
      /* Sedikit lebih longgar daripada pas-pasan: bingkainya dilebarkan
         FIT_PAD ke tiap sisi sebelum difitkan, jadi ada ruang antara garis
         pantai terluar dan tepi kanvas. Dinyatakan sebagai rasio bounds, bukan
         piksel, supaya kelonggarannya sama di tiap lebar layar — padding piksel
         akan terasa jauh lebih longgar di ponsel daripada di desktop. */
      map.fitBounds(frame.pad(FIT_PAD), { padding: [8, 8] });
      // Dipasang setelah fitBounds supaya batas bawahnya adalah "seluruh
      // Indonesia terlihat" — pengunjung tidak bisa mengecilkan sampai negaranya
      // jadi titik di tengah bidang kosong.
      map.setMinZoom(map.getZoom());
      /* Harus lebih longgar daripada bingkai yang difitkan. Kalau sama, peta
         tertarik balik begitu digeser sedikit pun. */
      map.setMaxBounds(frame.pad(FIT_PAD + 0.08));

      for (const p of places) {
        L.circleMarker([p.lat, p.lng], {
          radius: 5,
          color: 'var(--color-red-900)',
          weight: 3,
          fillColor: marker,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(`${p.label} — ${p.region}`, { direction: 'top' });
      }
    })().catch(() => {
      // Diberitahukan, bukan dibiarkan jadi kotak kosong yang terbaca seperti
      // peta yang memang tidak punya daratan.
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      detach?.();
      map?.remove();
    };
    // Warna ikut dependensi: mengubahnya membangun ulang peta, yang lebih
    // sederhana daripada menelusuri setiap layer untuk setStyle.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- groupsKey mewakili provinceGroups
  }, [land, outline, neighbour, wpp, wppHighlight, highlightKey, provinceUrl, groupsKey, marker, places]);

  return (
    <figure className={cn('m-0', className)}>
      <div
        ref={host}
        aria-describedby={captionId}
        /* Inline, bukan kelas Tailwind: nilainya datang dari prop, dan harus
           mengalahkan `.leaflet-container { background: #ddd }` milik Leaflet. */
        style={{ background }}
        /* `isolate` bukan hiasan. Leaflet memberi overlay pane-nya z-index 400
           dan kontrol zoom 1000, sementara header situs ini fixed di z-100 dan
           dropdown nav-nya z-200 — tanpa stacking context sendiri, daratan dan
           tombol zoom diadu langsung melawan header di root dan menang, jadi
           menutupi menu. isolation:isolate mengurung seluruh angka itu di dalam
           kotak peta; container-nya sendiri ikut aliran normal, di bawah header. */
        /* Klik pada zona/provinsi/pin memberi fokus ke <path> Leaflet, dan
           peramban menggambar cincin fokus bawaannya (auto 5px rgb(16,16,16))
           — kotak hitam yang terlihat seperti tombol aktif. Dimatikan HANYA
           untuk :focus yang bukan :focus-visible, yaitu fokus dari tetikus dan
           sentuhan. Menghapus outline tanpa syarat akan membutakan pengguna
           papan ketik: menekan Tab MEMANG memfokuskan path ini, dan tanpa
           penanda apa pun mereka kehilangan jejak posisi. Yang keyboard dapat
           diganti dari cincin hitam bawaan peramban menjadi hijau green-700,
           sama seperti aturan :focus-visible global di globals.css. */
        className={cn(
          /* Lantai 18rem disetel untuk kotak selebar desktop. Di ponsel
             kanvasnya 375px sementara kotak batas Indonesia mendekati 2,7:1,
             jadi fitBounds memenuhi lebarnya dan menyisakan ~140px laut kosong
             di atas dan di bawah. 13rem memangkas ruang mati itu tanpa
             menyentuh apa pun di atas ~495px, tempat 42vw sudah lebih besar. */
          'relative isolate h-[clamp(13rem,42vw,30rem)] overflow-hidden',
          '[&_.leaflet-interactive:focus:not(:focus-visible)]:outline-none',
          '[&_.leaflet-interactive:focus-visible]:outline-2',
          '[&_.leaflet-interactive:focus-visible]:outline-offset-2',
          '[&_.leaflet-interactive:focus-visible]:outline-green-700',
          /* Trik full-bleed: 50% adalah setengah lebar induk (yang dibatasi
             Wrap), 50vw setengah lebar viewport — selisihnya persis jarak yang
             harus ditembus di tiap sisi. Sudut membulat ikut dilepas; kanvas
             yang menyentuh kedua tepi layar tapi bersudut tumpul terlihat
             seperti gagal memenuhi, bukan seperti pilihan. */
          fullBleed ? 'w-screen ml-[calc(50%-50vw)]' : 'w-full rounded-[12px]'
        )}
      />

      {failed && (
        <p role="status" className="mt-3 mb-0 text-[0.82rem] text-rust-deep">
          Peta gagal dimuat. Daftar lokasi di bawah tetap lengkap.
        </p>
      )}

      {/* Padanan tekstual dari peta, kini hanya untuk pembaca layar: legenda
          dan keterangan yang terlihat sudah dilepas atas permintaan, sementara
          kotak peta yang isinya digambar Leaflet tetap butuh sesuatu yang
          menerangkan dirinya di pohon aksesibilitas. */}
      <figcaption id={captionId} className="sr-only">
        Peta wilayah kerja REKAM di Indonesia: {places.length} lokasi ditandai, di atas 11 Wilayah
        Pengelolaan Perikanan (WPPNRI 571–718). {highlight.length} zona diberi warna lebih pekat;
        sisanya ditampilkan lebih samar sebagai pembanding. Arahkan kursor ke sebuah zona atau
        provinsi untuk melihat namanya. Rincian cakupan per unit ada pada tabel di bawah.
      </figcaption>
    </figure>
  );
}
