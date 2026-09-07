import { cn } from '@/lib/cn';

/* Pulled out of button.tsx (a 'use client' module) so it can be called from
   Server Components too — importing a plain function from a 'use client'
   file fails at render time ("Attempted to call ... from the server"),
   since only components, not arbitrary functions, cross that boundary. This
   file has no hooks or browser APIs, so it carries no such restriction.
   Ported from rekam.css:142-159, :1450-1455, :1752-1757. The 1rem font size
   is deliberate and not --text-base: the source sets buttons to 16px while
   body copy runs at 17px. */

const base =
  'inline-flex items-center justify-center min-h-[3.25rem] px-8 rounded-full ' +
  'font-sans text-[1rem] font-bold no-underline cursor-pointer border-0 ' +
  'transition-[background-color,transform] duration-200';

const variants = {
  /* Filled. rekam.css:157-158 */
  green: 'bg-green-700 text-white hover:bg-green-800 hover:-translate-y-[2px]',
  /* Outlined on light ground. rekam.css:1450-1455 */
  ghostGreen:
    'border border-green-700 text-green-900 bg-transparent hover:bg-green-700 hover:text-cream hover:-translate-y-[2px]',
  /* Outlined on imagery. rekam.css:1752-1757 */
  ghostLight:
    'border border-white/55 text-white bg-transparent hover:bg-white hover:text-green-900 hover:-translate-y-[2px]',
  /* Filled, inverse of ghostLight — for a light call to action on a solid green section. */
  cream: 'bg-cream text-green-900 hover:bg-white hover:-translate-y-[2px]',
} as const;

export type ButtonVariant = keyof typeof variants;

/** The class list Button/ButtonLink render. Also for a one-off element (a raw
 * `<a>` or `<button>`) that needs to look identical but can't route through
 * either — e.g. a same-origin file download, which AppLink's locale prefixing
 * would otherwise corrupt. */
export function buttonClasses(variant: ButtonVariant, block = false, className?: string) {
  return cn(
    base,
    variants[variant],
    block && 'w-full',
    // rekam.css:1035 drops the hover lift entirely under reduced motion.
    'motion-reduce:hover:translate-y-0',
    className
  );
}
