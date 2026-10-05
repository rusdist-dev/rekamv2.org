import { cn } from '@/lib/cn';

/* The numbered takeaways under an event's rundown — "yang Anda dapatkan".
 *
 * rekam.css:1332-1372 drew these as three tinted rounded cards, coloured by
 * DOM position (.numbers__grid .numcard:nth-child(1|2|3)). That is gone: the
 * section now sits on a solid green band and the items are plain white
 * numerals over their labels, so the colour that used to separate them comes
 * from the band itself and nothing depends on sibling order any more. The
 * old nth-child rule also meant a fourth card rendered unstyled, which is
 * why `gains` was capped at three; without tints the row simply wraps, and
 * an event whose CMS record carries a fourth benefit renders it.
 *
 * The band owns the background, so these carry no colour of their own beyond
 * the white text they inherit the contrast from. */

export function NumberCard({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <article className={cn('text-white', className)}>
      <p className="m-0 font-label text-stat-lg font-bold leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-[0.9rem] mb-0 max-w-[26ch] text-lede leading-[1.5] text-white/92">{label}</p>
    </article>
  );
}

/** rekam.css:1332-1336 — auto-fit so three items fill the row and one does not stretch. */
export function NumberGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-[clamp(1.5rem,3.5vw,2.75rem)] [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
      {children}
    </div>
  );
}
