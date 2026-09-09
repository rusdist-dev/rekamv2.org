import raw from '@/data/about.json';
import type { Locale } from '@/i18n/config';

/* Explicit shapes for about.json.
 *
 * TypeScript infers a JSON import as a UNION of the exact object shapes it
 * finds, so an optional field present on only some records is not accessible
 * on the union at all. Declaring the shape once fixes that and documents
 * which fields are genuinely optional and why.
 *
 * Translatable copy (bios, roles, unit blurbs) is stored inline as
 * `{ id, en }` / `{ id: string[], en: string[] }` rather than duplicated into
 * a separate content file — with 18 bios and 16 org posts, mirroring the full
 * shape in src/i18n/content would just be the same data twice. `pick`/`pickList`
 * below resolve a locale against those pairs; proper names (people, unit brand
 * names like "Rangkong Indonesia") are not localized at all. */

export type Localized = { en: string; id: string };
export type LocalizedList = { en: string[]; id: string[] };

export function pick(value: Localized, locale: Locale): string {
  return value[locale];
}

export function pickList(value: LocalizedList, locale: Locale): string[] {
  return value[locale];
}

export type PersonRef = {
  /** The name as rendered on the page, which is what a reader sees. */
  name: string;
  /** Resolved team id. Absent when no profile was ever written for them. */
  ref?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: Localized;
  /** Six of eighteen portraits are not on disk; initials stand in. */
  photo?: string;
  bio: LocalizedList;
};

export type Unit = {
  name: string;
  text: Localized;
  href?: string;
  logo: string;
};

export type OrgNode = {
  kind: 'board' | 'chair' | 'unit' | 'leaf';
  role: Localized;
  /** Boards list several names with no individual role. */
  people?: string[];
  lead?: PersonRef;
  /** DOM id for the collapsible panel, units only. */
  domId?: string;
  managers?: { role: Localized; person: PersonRef }[];
};

export const ABOUT = raw as unknown as {
  team: TeamMember[];
  units: Unit[];
  org: OrgNode[];
};
