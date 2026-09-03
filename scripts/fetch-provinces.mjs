/* Menurunkan public/geo/provinces.json — batas tiga provinsi yang disorot.
 *
 * Sumber: geoBoundaries gbOpen IDN ADM1 (wmgeolab), lisensi ODbL 1.0.
 * ATRIBUSI WAJIB dan sudah dipasang di <figcaption> IndonesiaMap.
 *
 * Kenapa bukan Natural Earth yang public domain: NE hanya punya 33 provinsi
 * (era pra-2012) dan tidak mengenal Kalimantan Utara, sehingga poligon
 * "Kalimantan Timur"-nya masih mencakup wilayah yang kini Kalimantan Utara —
 * peta yang salah menyorot lebih buruk daripada catatan kaki lisensi.
 *
 * CATATAN PENTING soal Papua Barat: data ini merepresentasikan 2017, jadi
 * poligon Papua Barat masih ekstent pra-2022 dan MENCAKUP wilayah yang kini
 * menjadi Papua Barat Daya. Memisahkannya perlu penggabungan enam kabupaten
 * dari data ADM2 — di luar lingkup yang diminta.
 *
 * Jalankan ulang: node scripts/fetch-provinces.mjs
 */
import { writeFileSync } from 'node:fs';

const API = 'https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM1/';

/* geoBoundaries memakai nama Inggris; situs ini berbahasa Indonesia, jadi
   dinamai ulang di sini agar komponen dan legenda tidak perlu tahu asal data. */
const WANTED = new Map([
  // Kelompok 1
  ['east kalimantan', 'Kalimantan Timur'],
  ['west kalimantan', 'Kalimantan Barat'],
  ['west papua', 'Papua Barat'],
  // Kelompok 2
  ['banten', 'Banten'],
  ['central java', 'Jawa Tengah'],
  ['west nusa tenggara', 'Nusa Tenggara Barat'],
  ['south sulawesi', 'Sulawesi Selatan'],
  // Kunci dicocokkan persis, jadi 'maluku' tidak akan ikut menangkap
  // 'north maluku' (Maluku Utara).
  ['maluku', 'Maluku'],
]);

const TOLERANCE = 0.005; // ~0,6 km — lebih halus dari WPP karena poligon ini
const PRECISION = 3; // digambar DI ATAS daratan, jadi selisihnya kelihatan

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
  if (out.length < 4) return null;
  const f = out[0];
  const l = out[out.length - 1];
  if (f[0] !== l[0] || f[1] !== l[1]) out.push([f[0], f[1]]);
  return out;
}

const meta = await fetch(API).then((r) => r.json());
console.log('lisensi:', meta.boundaryLicense, '| tahun:', meta.boundaryYearRepresented);

const src = await fetch(meta.gjDownloadURL).then((r) => r.json());

const polygon = (poly) => poly.map(ring).filter(Boolean);
let pts = 0;

const features = [];
for (const f of src.features) {
  const key = String(f.properties?.shapeName ?? '').toLowerCase();
  const name = WANTED.get(key);
  if (!name) continue;

  const g = f.geometry;
  const coordinates =
    g.type === 'MultiPolygon'
      ? g.coordinates.map(polygon).filter((p) => p.length)
      : polygon(g.coordinates);

  const count = (c, d) => (d === 0 ? c.length : c.reduce((a, x) => a + count(x, d - 1), 0));
  pts += count(coordinates, g.type === 'MultiPolygon' ? 2 : 1);

  features.push({
    type: 'Feature',
    properties: { name, source: 'geoBoundaries gbOpen IDN ADM1 (ODbL 1.0)' },
    geometry: { type: g.type, coordinates },
  });
}

if (features.length !== WANTED.size) {
  throw new Error(`Diharapkan ${WANTED.size} provinsi, dapat ${features.length}`);
}

const out = JSON.stringify({ type: 'FeatureCollection', features });
writeFileSync(new URL('../public/geo/provinces.json', import.meta.url), out);

console.log(
  `provinces.json: ${features.length} provinsi, ${pts.toLocaleString()} titik, ` +
    `${(out.length / 1024).toFixed(0)} KB`
);
console.log('provinsi:', features.map((f) => f.properties.name).join(', '));
