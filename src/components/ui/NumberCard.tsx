import { cn } from '@/lib/cn';

/* rekam.css:1332-1372.
 *
 * The source coloured these by DOM position —
 *   .numbers__grid .numcard:nth-child(1) { background: var(--blue) }
 *   … :nth-child(2) rust, :nth-child(3) olive
 * — which meant a fourth card rendered unstyled and any wrapper element
 * silently reshuffled the palette, since :nth-child counts every sibling
 * regardless of class.
 *
 * Here the colour is an explicit index into a tuple. Same output, but a fourth
 * card now cycles instead of falling through to nothing, and no markup change
 * can recolour the row. */

/* The source used --blue, --rust and --olive with white text. Two of those do
 * not carry white: white on --olive (#A3B18A) is 2.28:1 and on --blue
 * (#6F8ABE) is 3.47:1, against a 4.5 requirement — the label here is bold but
 * only ~15px, below the 18.66px large-text threshold, so the relaxed 3.0 bar
 * does not apply. --rust was already fine at 5.40.
 *
 * The two deep variants are not invented: they were recovered in Fase 1 from
 * hexes that had leaked past the token set in rekam.css. Using them keeps the
 * family and takes all three to 4.5+. */
const TINTS = ['bg-blue-deep', 'bg-rust', 'bg-olive-deep'] as const;

export function NumberCard({
  index,
  value,
  label,
  className,
}: {
  /** 0-based position; decides the tint the source assigned by nth-child. */
  index: number;
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'flex min-h-[clamp(11rem,18vw,14rem)] flex-col items-center justify-end rounded-[18px] p-[clamp(1.25rem,2.4vw,2rem)] text-center text-white',
        TINTS[index % TINTS.length],
        className
      )}
    >
      <p className="m-0 text-stat-lg font-bold leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-[0.7rem] mb-0 text-xs font-bold leading-[1.35]">{label}</p>
    </article>
  );
}

/** rekam.css:1332-1336 — auto-fit so three cards fill the row and one does not stretch. */
export function NumberGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-[clamp(1rem,2.5vw,1.75rem)] [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
      {children}
    </div>
  );
}
