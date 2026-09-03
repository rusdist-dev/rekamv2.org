# rekamv2.org

Website REKAM Nusantara Foundation — Next.js App Router, Tailwind v4, Radix.

Ini penulisan ulang dari situs statis 11 halaman yang sebelumnya ada di `site/`.
Situs lama sudah dihapus pada cutover; salinan utuhnya tetap ada di git pada tag
`baseline`.

```bash
npm install
npm run dev            # http://localhost:3000
```

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build produksi, lalu jalankan |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:e2e` | Playwright: interaksi, keranjang, aksesibilitas |
| `npm run check:links` | Telusuri HTML terbangun; setiap `href`/`src` harus hidup |
| `npm run check:parity` | Bandingkan teks halaman baru dengan `baseline/content.json` |

`test:e2e`, `check:links`, dan `check:parity` mengharapkan server sudah jalan di
`localhost:3100` (`npm run build && npx next start -p 3100`). Playwright tidak
mengelola servernya sendiri karena hook shell di lingkungan ini menelan output
`next`, yang membuat kegagalan tidak terbaca.

## Sebelum dipublikasikan

Tiga hal masih sengaja kosong. Masing-masing menyatakan dirinya kosong di
halaman, bukan diam-diam gagal:

- **`src/lib/shop/config.ts`** — nomor rekening, QRIS, WhatsApp, email. Semua
  `null` **dengan sengaja**: halaman penggalangan dana yang mencetak nomor
  rekening karangan lebih buruk daripada yang tidak mencetak apa-apa. Payment
  gateway di luar lingkup; katalognya contoh.
- **`src/lib/about/streetview.ts`** — kunci Google Maps API. Batasi ke domain
  REKAM: kunci tanpa pembatasan di sisi klien bersifat publik. Street View
  ditagih per pemuatan panorama, karena itu panelnya klik-untuk-memuat.
- **`NEXT_PUBLIC_SITE_URL`** — dipakai canonical, OG, dan sitemap. Fallback-nya
  `https://rekam.or.id` dan tidak pernah benar di produksi tanpa disetel.

## Aset yang belum ada

Enam belas berkas dirujuk sumbernya tetapi tidak pernah dikirim: 5 gambar
berita, 6 potret tim, 4 video panorama (`pano-forest`, `pano-urban`), dan 1
logo unit. Semuanya ditangani, tidak disembunyikan — kartu berita memakai blok
warna, potret memakai inisial, dan hero tanpa `<source>` memang **dirancang**
jatuh ke panorama prosedural. `scripts/check-links.mjs` menyimpan daftar yang
sudah diketahui itu sehingga celah **baru** tetap menggagalkan pemeriksaan.

## Dua bahasa

Indonesia **tanpa prefiks**, Inggris di bawah `/en`:

| | Indonesia | Inggris |
|---|---|---|
| Beranda | `/` | `/en` |
| Berita | `/berita` | `/en/berita` |

Rute tinggal di `src/app/[locale]/`, dan `src/middleware.ts` menulis-ulang
(*rewrite*, bukan redirect) URL tanpa prefiks ke `/id/...` secara internal.
Alasannya: penulisan ulang ini baru saja memberi 18 artikel URL sungguhan yang
pertama; memberi prefiks pada locale bawaan berarti memindahkannya lagi. `/id/...`
yang diminta langsung tetap di-redirect 308 ke bentuk kanoniknya, supaya satu
halaman tidak pernah hidup di dua URL.

**Yang diterjemahkan hanya *chrome*** — navigasi, footer, kontrol, label
formulir; sekitar 60 kunci di `src/i18n/dictionary.ts`. Isi editorial (18 profil
tim, narasi program, 155 artikel) adalah pekerjaan tim konten, bukan tugas
migrasi. Yang wajib disediakan migrasi adalah struktur tempat terjemahan itu
bisa mendarat tanpa mengubah kode, dan itu sudah ada: field `lang` pada koleksi
berita plus fallback di `listNews()`. Praktiknya tidak seberat kedengarannya —
banyak teks editorialnya sudah berbahasa Inggris, sementara chrome di
sekelilingnya berbahasa Indonesia; `/en` justru membuat keduanya sepakat.

Label nav Inggris di `dictionary.ts` **dipulihkan, bukan dikarang**:
`index.html` dulu mengirim *Who We Are / Field Notes / Whats On / Take Part*
sementara sepuluh halaman lain mengirim bahasa Indonesia. Ketidakcocokan itu
selesai dengan menjadikannya nilai `/en`.

Setiap tautan internal lewat `AppLink` (`src/components/ui/AppLink.tsx`), yang
membaca locale dari URL. Alternatifnya adalah meneruskan prop `locale` ke ~25
tempat — dan setiap tempat itu satu kesempatan untuk lupa, yang akibatnya
melempar pembaca Inggris kembali ke halaman Indonesia tanpa suara. `check-links`
menegakkan ini di kedua locale.

## Sumber data

Konten ada di `src/data/*.json`, divalidasi Zod di `src/lib/content/schema.ts`.
Halaman hanya mengimpor dari `src/lib/content` — tidak pernah langsung dari
sumbernya. Itu membuat pergantian ke CMS menjadi perubahan satu berkas:
`src/lib/content/source.ts` membaca JSON lokal hari ini, dan `fetch` ber-tag
saat `CONTENT_SOURCE=api`, siap untuk `revalidateTag` dari webhook.

Berkas JSON itu diturunkan dari markup lama oleh `scripts/extract-*.mjs`. Skrip
itu membaca `site/`, yang sudah dihapus — pulihkan dulu bila perlu dijalankan
ulang:

```bash
git checkout baseline -- site/
```

### Feed Instagram (beranda)

Section "Lately" di beranda menampilkan lima postingan @rekamnusantara.
Secara default (`IG_ACCESS_TOKEN` kosong) ia jatuh ke tangkapan layar
postingan itu sendiri (`src/assets/instagram-1.png` ... `instagram-5.png`) —
foto aslinya, tapi statis, tidak ikut ter-update kalau postingannya diedit.
Untuk feed yang benar-benar live, set:

```bash
IG_ACCESS_TOKEN=  # long-lived token, Instagram API with Instagram Login
```

Token ini didapat lewat akun Instagram professional (Business/Creator) yang
sudah terhubung ke app Meta Developer — tidak perlu Facebook Page terpisah.
`src/lib/instagram.ts` memanggil `graph.instagram.com/me/media` dengan token
itu tiap jam (`revalidate: 3600`) dan mencocokkan tiap link postingan di
`IG_TILES` (`src/app/[locale]/page.tsx`) lewat shortcode-nya; yang tidak
cocok tetap jatuh ke tangkapan layar per-item.

## Verifikasi

Karena CSS dan JS ditulis ulang seluruhnya, HTML bukan satu-satunya yang bisa
regresi — jadi pengecekannya berlapis:

- **Paritas konten** — tiap blok teks dari sepuluh halaman lama harus muncul di
  penggantinya. Ini yang menangkap kelas bug paling senyap dalam sebuah
  penulisan ulang: paragraf yang hilang saat dipindahkan ke data. Semua sepuluh
  halaman **100% (1.280 blok)**. Perbedaan yang disengaja terdaftar satu per satu
  beserta alasannya di `scripts/check-parity.mjs`. Yang dibandingkan hanya build
  **Indonesia** — baseline-nya situs Indonesia, jadi hanya sisi itu yang
  berutang paritas padanya; `/en` dipegang `tests/i18n.spec.ts`. `checkout.html`
  satu-satunya yang di luar daftar: isinya baru ada setelah hidrasi, jadi
  `tests/shop.spec.ts` yang menggerakkan keranjang sungguhan memeriksanya lebih
  keras, bukan lebih longgar.
- **Tautan** — 58 halaman di dua locale, 123 tautan dan aset unik. Selain status
  HTTP, pemeriksa ini menegakkan prefiks `/en` pada tautan internal — kegagalan
  yang tidak bisa dilihat dari kode status, karena tautan yang lupa prefiks tetap
  menjawab 200 dan hanya diam-diam memindahkan pembaca ke halaman Indonesia.
- **Aksesibilitas** — axe pada setiap halaman di **kedua** locale, plus tes papan
  ketik. Situs lama gagal kontras WCAG AA di footer; itu diperbaiki, bukan
  diwariskan.
- **92 tes Playwright** lulus (desktop 1440px dan mobile 390px).

Screenshot baseline (`baseline/screens/`) tidak dilacak git — 33 MB, dan bisa
dibuat ulang setelah memulihkan `site/` seperti di atas.
