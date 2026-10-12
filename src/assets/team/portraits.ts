/* Portrait imports, keyed by the `photo` field in src/data/about.json.
 *
 * Originally emitted by scripts/extract-about.mjs. It is maintained by hand
 * now: the portrait set was replaced with the photos actually used by the
 * organisation chart, which is a different list from the one the extractor
 * found in the old site.
 *
 * Only people who appear somewhere on /tentang need an entry. A member whose
 * `photo` is absent in about.json falls back to their initials — see
 * src/components/about/Team.tsx. */
import type { StaticImageData } from 'next/image';
import p_irfan_yulianto from './irfan-yulianto.jpg';
import p_wahyu_mulyono from './wahyu-mulyono.jpeg';
import p_yoki_hadiprakarsa from './yoki-hadiprakarsa.jpg';
import p_een_irawan_putra from './een-irawan-putra.jpg';
/* The file is spelled `heidi-retnonigtyas` — one `n` short of her name. Kept
 * as delivered rather than renamed; the key below carries the correct
 * spelling, which is the one about.json and the page use. */
import p_heidi_retnoningtyas from './heidi-retnonigtyas.png';
import p_nuraeni from './nuraeni.jpg';
import p_riki_rahmansyah from './riki-rahmansyah.jpg';
import p_irwan_setiadi from './irwan-setiadi.jpeg';
import p_efin_muttaqin from './efin-muttaqin.jpg';
import p_annisya_rosdiana from './annisya-rosdiana.png';
import p_oktavianto_prastyo from './oktavianto-prastyo.jpg';
import p_intan_destianis_hartati from './intan-destianis-hartati.jpg';
import p_prayekti_ningtias from './prayekti.png';
import p_jessica_pingkan from './jessica.jpg';

export const PORTRAITS: Record<string, StaticImageData> = {
  'team/irfan-yulianto.jpg': p_irfan_yulianto,
  'team/wahyu-mulyono.jpeg': p_wahyu_mulyono,
  'team/yoki-hadiprakarsa.jpg': p_yoki_hadiprakarsa,
  'team/een-irawan-putra.jpg': p_een_irawan_putra,
  'team/heidi-retnonigtyas.png': p_heidi_retnoningtyas,
  'team/nuraeni.jpg': p_nuraeni,
  'team/riki-rahmansyah.jpg': p_riki_rahmansyah,
  'team/irwan-setiadi.jpeg': p_irwan_setiadi,
  'team/efin-muttaqin.jpg': p_efin_muttaqin,
  'team/annisya-rosdiana.png': p_annisya_rosdiana,
  'team/oktavianto-prastyo.jpg': p_oktavianto_prastyo,
  'team/intan-destianis-hartati.jpg': p_intan_destianis_hartati,
  'team/prayekti.png': p_prayekti_ningtias,
  'team/jessica.jpg': p_jessica_pingkan,
};
