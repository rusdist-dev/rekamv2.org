/* Menurunkan public/geo/wppnri.json dari geo-src/wppnri.raw.json.
 *
 * Sumbernya 5,2 MB: 135.158 titik dengan 20 angka desimal — presisi yang jauh
 * melampaui apa pun yang bisa ditampilkan, dan terlalu berat untuk dikirim ke
 * peramban. Membulatkan desimal saja hanya turun ke 2,1 MB, karena yang
 * dominan jumlah titiknya, bukan panjang angkanya. Jadi geometrinya
 * disederhanakan dengan Douglas-Peucker.
 *
 * Toleransi 0.01 derajat (~1,1 km) memangkas 89,6% titik menjadi ~230 KB. Itu
 * aman di sini karena dua hal: pada zoom awal peta ini satu piksel ~4,7 km,
 * dan tepi WPP yang mengikuti garis pantai digambar DI BAWAH poligon daratan,
 * jadi ketidakcocokannya tertutup. Yang tersisa terlihat adalah garis batas
 * lepas pantai yang lurus — dan garis lurus tidak kehilangan apa pun dari
 * penyederhanaan, karena hanya butuh dua titik.
 *
 * Jalankan ulang: node scripts/simplify-wppnri.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../geo-src/wppnri.raw.json', import.meta.url);
const OUT = new URL('../public/geo/wppnri.json', import.meta.url);

const TOLERANCE = 0.01; // derajat
const PRECISION = 3; // ~111 m, sudah di bawah toleransi di atas

/* Douglas-Peucker planar. Untuk lon/lat pada rentang lintang Indonesia
   (11°LS–6°LU) distorsi kosinusnya kecil, dan ini murni untuk tampilan. */
function simplify(points, tol) {
  if (points.length < 3) return points;
  const sq = (a, b) => (a - b) * (a - b);
  const segDist = (p, a, b) => {
    let [x, y] = a;
    const dx = b[0] - x;
    const dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) [x, y] = b;
      else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    return sq(p[0], x) + sq(p[1], y);
  };

  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  const tol2 = tol * tol;
  while (stack.length) {
    const [s, e] = stack.pop();
    let idx = -1;
    let max = tol2;
    for (let i = s + 1; i < e; i++) {
      const d = segDist(points[i], points[s], points[e]);
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round = (n) => Number(n.toFixed(PRECISION));

function ring(coords) {
  const out = simplify(coords, TOLERANCE).map(([x, y]) => [round(x), round(y)]);
  // Sebuah cincin poligon harus tertutup dan punya minimal 4 titik; cincin
  // yang runtuh di bawah itu (pulau kecil) dibuang, bukan dikirim rusak.
  if (out.length < 4) return null;
  const f = out[0];
  const l = out[out.length - 1];
  if (f[0] !== l[0] || f[1] !== l[1]) out.push([f[0], f[1]]);
  return out;
}

const src = JSON.parse(readFileSync(SRC, 'utf8'));
const polygon = (poly) => poly.map(ring).filter(Boolean);

let kept = 0;
const features = src.features.map((f) => {
  const g = f.geometry;
  const coordinates =
    g.type === 'MultiPolygon'
      ? g.coordinates.map(polygon).filter((p) => p.length)
      : polygon(g.coordinates);

  const count = (c, depth) => (depth === 0 ? c.length : c.reduce((a, x) => a + count(x, depth - 1), 0));
  kept += count(coordinates, g.type === 'MultiPolygon' ? 2 : 1);

  return {
    type: 'Feature',
    // Hanya dua properti yang dipakai UI. Enam sisanya (Uniq_ID, Area,
    // Sph_Area, Luas_ha, Luas_km, LUAS_CEA) tidak dirujuk di mana pun, dan
    // Luas_km untuk WPP 713 memang 0 di sumbernya.
    properties: { wpp: String(f.properties.WPP), name: f.properties.Ket },
    geometry: { type: g.type, coordinates },
  };
});

if (features.length !== 11) throw new Error(`Diharapkan 11 WPP, dapat ${features.length}`);

const out = JSON.stringify({ type: 'FeatureCollection', features });
writeFileSync(OUT, out);

console.log(
  `wppnri.json: ${features.length} zona, ${kept.toLocaleString()} titik, ` +
    `${(out.length / 1024).toFixed(0)} KB (dari 5,2 MB / 135.158 titik)`
);
console.log('zona:', features.map((f) => f.properties.wpp).sort().join(', '));
