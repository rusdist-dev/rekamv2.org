import Image, { type StaticImageData } from 'next/image';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
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
  overlay,
  longTitle = false,
  fullImage = false,
  breadcrumb,
  breadcrumbLabel,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image: StaticImageData;
  /** Decorative by default: the headline beside it already carries the meaning. */
  alt?: string;
  short?: boolean;
  dim?: boolean;
  /** Flat CSS color replacing the scrim entirely, e.g. 'rgba(10, 20, 16, 0.5)'. */
  overlay?: string;
  /** For a title that's a full sentence rather than a short label: smaller type, wrapped to a measure. */
  longTitle?: boolean;
  /** Sizes the banner to the image's own aspect ratio instead of a fixed viewport-height band, so object-cover never has to crop it. */
  fullImage?: boolean;
  /** "Home / …" trail rendered above the eyebrow, light-styled to sit over the photo. Omitted entirely when not passed. */
  breadcrumb?: BreadcrumbItem[];
  /** The trail's accessible name; required alongside `breadcrumb`. */
  breadcrumbLabel?: string;
}) {
  return (
    <section
      className={cn(
        'relative isolate flex w-full overflow-hidden bg-green-300',
        fullImage
          ? 'items-center py-[clamp(6rem,12vh,9rem)]'
          : cn(
              'items-end pt-[clamp(6rem,12vh,9rem)] pb-[clamp(2.5rem,5vw,4.5rem)]',
              short ? 'min-h-[clamp(20rem,44vh,28rem)]' : 'min-h-[clamp(26rem,58vh,38rem)]'
            )
      )}
      /* A MINIMUM height derived from the image's ratio, not `aspect-ratio`.
         The two agree wherever the picture is the taller of the two — every
         width from about the `md` step up — and there the banner is still
         exactly the image, uncropped, which is the whole point of fullImage.
         They part on a phone: 2732x1024 over a 375px viewport is a 140px
         band, and the headline needs roughly three times that. `aspect-ratio`
         gives the box a definite height, so the title was simply cut off at
         the section's edge (and `overflow-hidden` hid the evidence); a
         min-height lets the box grow to its content and lets object-cover crop
         the photograph instead, which is the thing that can afford to give.
         max() keeps the 16rem floor that used to be a class. */
      style={
        fullImage
          ? { minHeight: `max(16rem, calc(100vw * ${image.height} / ${image.width}))` }
          : undefined
      }
    >
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{ background: overlay ?? (dim ? SCRIM_DIM : SCRIM_BASE) }}
      />

      <Wrap className={cn('relative z-[2]', fullImage ? 'mt-8 md:mt-16' : 'pt-12')}>
        {breadcrumb && breadcrumbLabel && (
          <Breadcrumb items={breadcrumb} ariaLabel={breadcrumbLabel} light className="mb-4" />
        )}
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1
          className={cn(
            'mt-3 mb-0 font-display font-normal text-white',
            longTitle
              ? 'max-w-[38ch] text-display-lg leading-[1.2] tracking-normal'
              : 'text-hero leading-[1.04] tracking-[-0.02em]'
          )}
        >
          {title}
        </h1>
        {lede && (
          <p className="mt-4 mb-0 max-w-[38ch] text-lede-lg leading-[1.55] text-white/88">{lede}</p>
        )}
      </Wrap>
    </section>
  );
}
