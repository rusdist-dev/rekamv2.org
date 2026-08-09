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

## Verifikasi

Karena CSS dan JS ditulis ulang seluruhnya, HTML bukan satu-satunya yang bisa
regresi — jadi pengecekannya berlapis:

- **Paritas konten** — tiap blok teks dari sepuluh halaman lama harus muncul di
  penggantinya. Ini yang menangkap kelas bug paling senyap dalam sebuah
  penulisan ulang: paragraf yang hilang saat dipindahkan ke data. Semua sepuluh
  halaman 100%. Perbedaan yang disengaja terdaftar satu per satu beserta
  alasannya di `scripts/check-parity.mjs`.
- **Tautan** — 29 halaman, ~90 tautan dan aset unik.
- **Aksesibilitas** — axe pada setiap halaman, plus tes papan ketik. Situs lama
  gagal kontras WCAG AA di footer; itu diperbaiki, bukan diwariskan.

Screenshot baseline (`baseline/screens/`) tidak dilacak git — 33 MB, dan bisa
dibuat ulang setelah memulihkan `site/` seperti di atas.
