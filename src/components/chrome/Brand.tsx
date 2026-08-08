import Link from 'next/link';
import { cn } from '@/lib/cn';

/* rekam.css:167-196.
 *
 * The mark has two renderings of one file. On light ground it is the official
 * full-colour SVG drawn as a background. On the footer's brand green and over
 * the hero's dark imagery, the same file is used as an alpha MASK filled with
 * currentColor instead — the logo's own green and brown would otherwise sink
 * into both. Masking reads only the alpha channel, so the geometry stays
 * pixel-identical between the two.
 *
 * The file lives in public/ rather than going through next/image because a CSS
 * mask needs a stable URL, and next/image does not process SVG anyway. */

const ASPECT = '719.07 / 163.01'; // matches the file's viewBox

export function Brand({
  href = '/',
  width = 132,
  flat = false,
  className,
}: {
  href?: string;
  /** px width of the mark; the source uses 132 default, 118 rail, 112 narrow, 182 footer */
  width?: number;
  /** true on dark ground: paint the mark flat in currentColor via an alpha mask */
  flat?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="REKAM Nusantara Foundation — beranda"
      className={cn('block leading-[0]', className)}
    >
      <span
        aria-hidden="true"
        className="block"
        style={
          flat
            ? {
                width,
                aspectRatio: ASPECT,
                background: 'currentColor',
                WebkitMask: 'url("/logo-rekam.svg") no-repeat center / contain',
                mask: 'url("/logo-rekam.svg") no-repeat center / contain',
              }
            : {
                width,
                aspectRatio: ASPECT,
                background: 'url("/logo-rekam.svg") no-repeat center / contain',
              }
        }
      />
    </Link>
  );
}
