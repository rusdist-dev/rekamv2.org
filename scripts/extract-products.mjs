/* One-off: lift the merch catalogue out of markup into data.
 *
 *   node scripts/extract-products.mjs
 *
 * The old shop had no product data at all. shop.js read id, name and price
 * straight off each card's data-* attributes, which made the markup the
 * database — and meant the formatted price in .mc__price could silently
 * disagree with the data-price the cart actually charged.
 */

import fs from 'node:fs';
import path from 'node:path';
import { decodeEntities } from './extract-text.mjs';

const SITE = 'site';
const OUT = 'src/data/products.json';

const clean = (s) => decodeEntities(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const html = fs.readFileSync(path.join(SITE, 'merch.html'), 'utf8');
const products = [];

for (const m of html.matchAll(
  /<article class="mc"([^>]*)>([\s\S]*?)<\/article>/g
)) {
  const [, attrs, body] = m;
  const attr = (name) => new RegExp(`data-${name}="([^"]*)"`).exec(attrs)?.[1];

  const priceText = clean(/class="mc__price">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '');
  const price = Number(attr('price'));

  /* The two prices are separate strings in the source. Check they agree before
     discarding the formatted one — a mismatch would mean the cart has been
     charging something other than the displayed price. */
  const shown = Number(priceText.replace(/[^\d]/g, ''));
  if (shown && shown !== price) {
    console.warn(`  ! ${attr('id')}: data-price ${price} != harga tampil ${shown}`);
  }

  const option = /<select data-opt="([^"]*)"([\s\S]*?)<\/select>/.exec(body);
  const values = option
    ? [...option[2].matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/g)].map((o) => ({
        value: clean(o[2]),
        selected: /\bselected\b/.test(o[1]),
      }))
    : [];

  products.push({
    id: attr('id'),
    cat: attr('cat'),
    name: attr('name'),
    price,
    desc: clean(/class="mc__desc">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? ''),
    tag: clean(/class="mc__tag">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? ''),
    glyph: /<use href="#([^"]+)"/.exec(body)?.[1],
    /* .mc__art--a … --l: a per-card tint, assigned by hand in the source. */
    art: /class="mc__art mc__art--([a-z])"/.exec(body)?.[1],
    ...(option
      ? {
          option: {
            /* FROZEN. shop.js built cart line keys from this label, so it was
               part of the storage format rather than presentation. Recorded
               here so the constraint is visible even though v2 no longer keys
               on it. */
            label: option[1],
            values: values.map((v) => v.value),
            selected: values.find((v) => v.selected)?.value ?? values[0]?.value,
          },
        }
      : {}),
  });
}

/* Category filter chips, in source order. */
const categories = [...html.matchAll(/data-filter="([^"]*)"[^>]*>([^<]*)</g)].map((m) => ({
  id: m[1],
  label: clean(m[2]),
}));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ categories, products }, null, 2) + '\n');

const byCat = {};
for (const p of products) byCat[p.cat] = (byCat[p.cat] ?? 0) + 1;

console.log(`${products.length} produk -> ${OUT}`);
console.log(`  kategori   : ${categories.map((c) => c.id).join(', ')}`);
console.log(`  per kategori: ${JSON.stringify(byCat)}`);
console.log(`  punya opsi : ${products.filter((p) => p.option).length}`);
console.log(`  rentang harga: Rp ${Math.min(...products.map((p) => p.price)).toLocaleString('id-ID')} – Rp ${Math.max(...products.map((p) => p.price)).toLocaleString('id-ID')}`);
const missing = products.filter((p) => !p.id || !p.name || !p.price || !p.glyph || !p.art);
console.log(`  field kosong: ${missing.length ? missing.map((p) => p.id).join(', ') : 'tidak ada'}`);
