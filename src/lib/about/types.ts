import raw from '@/data/about.json';

/* Explicit shapes for about.json.
 *
 * TypeScript infers a JSON import as a UNION of the exact object shapes it
 * finds, so an optional field present on only some records — `letters` on the
 * three units with no logo, `note` on two of them — is not accessible on the
 * union at all. Declaring the shape once fixes that and documents which fields
 * are genuinely optional and why. */

export type PersonRef = {
  /** The name as rendered on the page, which is what a reader sees. */
  name: string;
  /** Resolved team id. Absent when no profile was ever written for them. */
  ref?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Six of eighteen portraits are not on disk; initials stand in. */
  photo?: string;
  bio: string[];
};

export type Unit = {
  name: string;
  text: string;
  /** One unit of six carries a former name. */
  former?: string;
  href?: string;
  /** Editorial note, on the two units whose narrative is incomplete. */
  note?: string;
  /** Three units have no logo on disk. */
  logo?: string;
  /** The source's own fallback: initials in place of a mark. */
  letters?: string;
};

export type OrgNode = {
  kind: 'board' | 'chair' | 'unit' | 'leaf';
  role: string;
  /** Boards list several names with no individual role. */
  people?: string[];
  lead?: PersonRef;
  /** DOM id for the collapsible panel, units only. */
  domId?: string;
  managers?: { role: string; person: PersonRef }[];
};

export const ABOUT = raw as unknown as {
  team: TeamMember[];
  units: Unit[];
  org: OrgNode[];
};
