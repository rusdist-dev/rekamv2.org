import { cn } from '@/lib/cn';

/* The small shared blocks the source treats as primitives rather than
   page components: rekam.css:71-75 (.wrap), :111-119 (.display),
   :121-127 (.lede), :130-140 (.eyebrow), :1842-1855 (.chip). */

/** rekam.css:71-75 — the site's single content column. */
export function Wrap({
  className,
  children,
  as: Tag = 'div',
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'header' | 'footer';
}) {
  return <Tag className={cn('mx-auto w-full max-w-wrap px-gutter', className)}>{children}</Tag>;
}

/** rekam.css:130-140 — the letterspaced label above almost every section title. */
export function Eyebrow({
  className,
  light = false,
  children,
}: {
  className?: string;
  light?: boolean;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'm-0 font-label text-[0.8rem] font-semibold uppercase tracking-[0.32em]',
        light ? 'text-white/92' : 'text-green-900',
        className
      )}
    >
      {children}
    </p>
  );
}

/** rekam.css:111-119 — Playfair display copy. */
export function Display({
  className,
  children,
  as: Tag = 'h2',
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}) {
  return (
    <Tag
      className={cn(
        'm-0 font-display text-hero-sm font-normal leading-[1.02] tracking-[-0.015em] text-green-900',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** rekam.css:121-127 — the standing paragraph under a display heading. */
export function Lede({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('mt-6 mb-0 max-w-[34ch] text-lede leading-[1.65] text-green-900', className)}>
      {children}
    </p>
  );
}

/** rekam.css:1842-1855 — pill control used by the shop filter and org chart tools. */
export function Chip({
  className,
  active = false,
  children,
  ...rest
}: {
  className?: string;
  active?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'cursor-pointer rounded-full border px-[1.2rem] py-2 text-[0.82rem] font-semibold',
        'transition-[background-color,color,border-color] duration-200',
        active
          ? 'border-green-900 bg-green-900 text-cream'
          : 'border-green-ink/30 bg-transparent text-green-900 hover:border-green-700',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
