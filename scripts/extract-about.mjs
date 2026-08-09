/* One-off: lift tentang.html's three collections into data.
 *
 *   node scripts/extract-about.mjs
 *
 * 18 team members, 6 programme units, and the org chart — the hardest page in
 * the site, and the one with the most hand-maintained cross-references.
 *
 * Two of those references are already broken in the source, which is the point
 * of moving them into data:
 *
 *   - Every .orgunit carries <span class="orgunit__count">N</span> manajer,
 *     typed by hand and free to disagree with the list beneath it.
 *   - Names in the chart link to bios by matching data-person against the
 *     team section's .person__name, and two of them do not match:
 *     data-person="Oktavianto Prastyo" renders "Octavianto P. Darmono",
 *     data-person="Yoki Hadiprakarsa" renders "Yok Yok Hadiprakarsa".
 *     rekam.js:290 silently skipped those, so the names simply were not
 *     clickable and nothing said so.
 *
 * The canonical name is the RENDERED one, not the data-person key: that is
 * what a reader sees today, so keeping it means the page does not change while
 * the link starts working.
 *
 * PROVENANCE. This reads site/, which was removed at cutover. To re-run it,
 * restore the original first:
 *
 *     git checkout baseline -- site/
 *
 * The tag `baseline` is the untouched static site as imported.
 */

import fs from 'node:fs';
import path from 'node:path';
import { decodeEntities } from './extract-text.mjs';

const SITE = 'site';
const OUT = 'src/data/about.json';

const clean = (s) => decodeEntities(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const html = fs.readFileSync(path.join(SITE, 'tentang.html'), 'utf8');
const assetDir = 'src/assets';

/* ---- team ---- */
const team = [];
for (const m of html.matchAll(/<article class="person">([\s\S]*?)<\/article>/g)) {
  const body = m[1];
  const photo = /class="person__photo" src="([^"]+)"/.exec(body)?.[1];
  const name = clean(/class="person__name">([\s\S]*?)<\/h3>/.exec(body)?.[1] ?? '');
  const bio = [...(/class="person__bio">([\s\S]*?)<\/details>/.exec(body)?.[1] ?? '').matchAll(/<p>([\s\S]*?)<\/p>/g)].map(
    (p) => clean(p[1])
  );
  const rel = photo ? photo.replace(/^assets\//, '') : undefined;
  team.push({
    id: slug(name),
    name,
    role: clean(/class="person__role">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? ''),
    /* Six of the eighteen portraits are not on disk. Optional rather than
       required: a missing photo should not stop the build over art nobody can
       produce today. PersonCard falls back to initials. */
    ...(rel && fs.existsSync(path.join(assetDir, rel)) ? { photo: rel } : {}),
    bio,
  });
}

/* ---- programme units ---- */
const units = [];
for (const m of html.matchAll(/<article class="unit">([\s\S]*?)<\/article>/g)) {
  const body = m[1];
  const logo = /class="unit__mark"[\s\S]*?src="([^"]+)"/.exec(body)?.[1];
  const rel = logo ? logo.replace(/^assets\//, '') : undefined;
  // aria-hidden sits between the class and the span, so do not anchor on '>'.
  const letters = clean(/class="unit__mark unit__mark--letters"[^>]*>\s*<span>([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '');
  units.push({
    name: clean(/class="unit__name">([\s\S]*?)<\/h3>/.exec(body)?.[1] ?? ''),
    former: clean(/class="unit__former">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '') || undefined,
    text: clean(/class="unit__text">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? ''),
    href: /class="unit__link" href="([^"]+)"/.exec(body)?.[1],
    /* NRCU carries .unit__note--only: it has no narrative at all, just the
       note explaining why. Match the class prefix so both variants land. */
    note: clean(/class="unit__note[^"]*">([\s\S]*?)<\/p>/.exec(body)?.[1] ?? '') || undefined,
    ...(rel && fs.existsSync(path.join(assetDir, rel)) ? { logo: rel } : {}),
    ...(letters ? { letters } : {}),
  });
}

/* ---- org chart ---- */
const byName = new Map(team.map((t) => [t.name, t.id]));
const unresolved = [];

/* data-person is the join key; the rendered text is what a reader sees. Where
   they disagree, resolve on the key — which is the half that actually matches
   a team entry — but keep displaying the rendered name, so the page looks
   identical while the link starts working.
   rekam.js:290 did neither: it looked up the key, and on a miss silently left
   the name as plain text. Two people simply were not clickable, with nothing
   to indicate why. */
function person(dataPerson, rendered) {
  const name = rendered || dataPerson;
  const id = byName.get(name) ?? byName.get(dataPerson);
  if (!id) unresolved.push({ dataPerson, rendered });
  return { name, ...(id ? { ref: id } : {}) };
}

const org = [];

for (const m of html.matchAll(/<div class="orgnode orgnode--board">([\s\S]*?)<\/div>\s*<\/div>/g)) {
  for (const b of m[1].matchAll(/<p class="orgnode__role">([\s\S]*?)<\/p>\s*<p class="orgnode__people">([\s\S]*?)<\/p>/g)) {
    org.push({
      kind: 'board',
      role: clean(b[1]),
      people: clean(b[2]).split('·').map((s) => s.trim()).filter(Boolean),
    });
  }
}

const chair = /<div class="orgnode orgnode--chair">([\s\S]*?)<\/div>/.exec(html)?.[1];
if (chair) {
  const dp = /data-person="([^"]+)"/.exec(chair)?.[1];
  org.push({
    kind: 'chair',
    role: clean(/class="orgnode__role">([\s\S]*?)<\/p>/.exec(chair)?.[1] ?? ''),
    lead: person(dp, clean(/class="orgnode__name"[^>]*>([\s\S]*?)<\/p>/.exec(chair)?.[1] ?? '')),
  });
}

for (const m of html.matchAll(/<li class="orgunit([^"]*)">([\s\S]*?)<\/li>\s*(?=<li class="orgunit|<\/ul>)/g)) {
  const body = m[2];
  const row = /<div class="orgunit__row">([\s\S]*?)<\/div>/.exec(body)?.[1] ?? '';
  const dp = /class="orgunit__name" data-person="([^"]+)"/.exec(row)?.[1];
  const rendered = clean(/class="orgunit__name"[^>]*>([\s\S]*?)<\/span>/.exec(row)?.[1] ?? '');

  const managers = [...body.matchAll(
    /<span class="orgm__role">([\s\S]*?)<\/span><span class="orgm__name" data-person="([^"]+)">([\s\S]*?)<\/span>/g
  )].map((g) => ({ role: clean(g[1]), person: person(g[2], clean(g[3])) }));

  /* The hand-typed count, captured only so the check below can compare it. */
  const stated = Number(clean(/class="orgunit__count">([\s\S]*?)<\/span>/.exec(row)?.[1] ?? '')) || 0;
  if (stated && stated !== managers.length) {
    console.warn(`  ! ${rendered}: tertulis ${stated} manajer, sebenarnya ${managers.length}`);
  }

  org.push({
    kind: m[1].includes('solo') ? 'leaf' : 'unit',
    role: clean(/class="orgunit__role">([\s\S]*?)<\/span>/.exec(row)?.[1] ?? ''),
    lead: person(dp, rendered),
    domId: /aria-controls="([^"]+)"/.exec(row)?.[1],
    managers,
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ team, units, org }, null, 2) + '\n');

/* Static imports for next/image, same bridge as the news covers: the data
   carries a path, next/image wants a module to get intrinsic dimensions and
   build-time optimisation from. */
const ident = (p) => 'p_' + p.replace(/[^a-z0-9]/gi, '_');
const withPhoto = team.filter((t) => t.photo);
fs.writeFileSync(
  'src/assets/team/portraits.ts',
  `/* GENERATED by scripts/extract-about.mjs — do not edit by hand. */
${withPhoto.map((t) => `import ${ident(t.id)} from './${path.basename(t.photo)}';`).join('\n')}
import type { StaticImageData } from 'next/image';

export const PORTRAITS: Record<string, StaticImageData> = {
${withPhoto.map((t) => `  '${t.photo}': ${ident(t.id)},`).join('\n')}
};
`
);

const withLogo = units.filter((u) => u.logo);
fs.writeFileSync(
  'src/assets/unit/logos.ts',
  `/* GENERATED by scripts/extract-about.mjs — do not edit by hand. */
${withLogo.map((u, i) => `import u_${i} from './${path.basename(u.logo)}';`).join('\n')}
import type { StaticImageData } from 'next/image';

export const UNIT_LOGOS: Record<string, StaticImageData> = {
${withLogo.map((u, i) => `  '${u.logo}': u_${i},`).join('\n')}
};
`
);

console.log(`${team.length} anggota tim, ${units.length} unit, ${org.length} simpul org -> ${OUT}`);
console.log(`  tanpa foto  : ${team.filter((t) => !t.photo).length}`);
console.log(`  tanpa bio   : ${team.filter((t) => !t.bio.length).map((t) => t.name).join(', ') || 'tidak ada'}`);
console.log(`  unit tanpa logo: ${units.filter((u) => !u.logo).map((u) => u.name).join(', ') || 'tidak ada'}`);
console.log(`  nama org tanpa profil: ${unresolved.length ? unresolved.map((u) => u.rendered).join(', ') : 'tidak ada'}`);
const drifted = [...html.matchAll(/data-person="([^"]+)"[^>]*>([^<]+)</g)]
  .map((m) => ({ key: m[1], shown: clean(m[2]) }))
  .filter((x) => x.key !== x.shown);
console.log(`  data-person melenceng: ${drifted.length ? drifted.map((d) => `${d.key} -> ${d.shown}`).join('; ') : 'tidak ada'}`);
