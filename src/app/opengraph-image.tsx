import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

/* Generated at build time rather than shipped as a static file, so it cannot
 * drift from the wording it is supposed to carry, and there is no 1200x630 PNG
 * to hand-maintain. Deliberately typographic: the brand's engraved
 * illustrations are detailed line work that turns to mush at preview size.
 *
 * Fonts are the platform defaults here on purpose — ImageResponse would need
 * the Playfair binary fetched and passed in, which is a lot of build weight
 * for a card most people see at thumbnail size. */

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#00522c',
          padding: 72,
          color: '#F4F2EB',
          fontFamily: 'serif',
        }}
      >
        {/* One string, not an expression plus text: Satori treats those as two
            children and then demands an explicit display on the parent. */}
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            opacity: 0.85,
          }}
        >
          {`${SITE.shortName} Nusantara Foundation`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -1 }}>Documenting knowledge</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -1 }}>Preserving life</div>
        </div>

        <div
          style={{
            fontSize: 24,
            fontFamily: 'sans-serif',
            opacity: 0.8,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Dari puncak hutan hingga dasar laut, dari sungai kota hingga layar bioskop.
        </div>
      </div>
    ),
    size
  );
}
