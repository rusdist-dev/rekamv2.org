import Image, { type StaticImageData } from 'next/image';
import { Eyebrow, Wrap } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';

/* rekam.css:1042-1083, :1300 (--short) and :2567-2574 (--dim).
 *
 * The banner used by the pages without a 360-degree hero: berita, donasi,
 * merch, tentang. A photograph under a two-stop scrim with the copy pinned to
 * the bottom.
 *
 * The scrim is worth keeping exactly as it was: darkest at the bottom where
 * the text sits, lightest at 60%, then slightly darker again at the top so the
 * fixed header's own tint has something to sit against. */

const SCRIM_BASE =
  'linear-gradient(to top, rgba(8,20,14,0.8) 0%, rgba(8,20,14,0.15) 60%, rgba(8,20,14,0.35) 100%)';

// --dim lays a flat wash under the gradient, for busier photographs.
const SCRIM_DIM = `linear-gradient(rgba(8,20,14,0.62), rgba(8,20,14,0.62)), ${SCRIM_BASE}`;

export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  alt = '',
  short = false,
  dim = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image: StaticImageData;
  /** Decorative by default: the headline beside it already carries the meaning. */
  alt?: string;
  short?: boolean;
  dim?: boolean;
}) {
  return (
    <section
      className={cn(
        'relative isolate flex items-end overflow-hidden bg-green-300',
        'pt-[clamp(6rem,12vh,9rem)] pb-[clamp(2.5rem,5vw,4.5rem)]',
        short ? 'min-h-[clamp(20rem,44vh,28rem)]' : 'min-h-[clamp(26rem,58vh,38rem)]'
      )}
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 z-[1]" style={{ background: dim ? SCRIM_DIM : SCRIM_BASE }} />

      <Wrap className="relative z-[2] pt-12">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-3 mb-0 font-display text-hero font-normal leading-[1.04] tracking-[-0.02em] text-white">
          {title}
        </h1>
        {lede && (
          <p className="mt-4 mb-0 max-w-[38ch] text-lede-lg leading-[1.55] text-white/88">{lede}</p>
        )}
      </Wrap>
    </section>
  );
}
