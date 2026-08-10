'use client';

import Link from 'next/link';
import { AppLink } from '@/components/ui/AppLink';
import { cn } from '@/lib/cn';

/* Ported from rekam.css:142-159, :1450-1455, :1752-1757.
   The 1rem font size is deliberate and not --text-base: the source sets buttons
   to 16px while body copy runs at 17px. */

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
} as const;

export type ButtonVariant = keyof typeof variants;

type Props = {
  variant?: ButtonVariant;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
};

function classes(variant: ButtonVariant, block: boolean, className?: string) {
  return cn(
    base,
    variants[variant],
    block && 'w-full',
    // rekam.css:1035 drops the hover lift entirely under reduced motion.
    'motion-reduce:hover:translate-y-0',
    className
  );
}

export function Button({
  variant = 'green',
  block = false,
  className,
  children,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classes(variant, block, className)} {...rest}>
      {children}
    </button>
  );
}

/* Routes through AppLink so the href picks up the current locale. An internal
   link that forgot its prefix would drop an English reader back onto the
   Indonesian page, silently — see AppLink.tsx for why that is handled there
   rather than by threading a prop to every call site. */
export function ButtonLink({
  variant = 'green',
  block = false,
  className,
  children,
  href,
  ...rest
}: Props & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    'className' | 'children' | 'href'
  >) {
  return (
    <AppLink href={href} className={classes(variant, block, className)} {...rest}>
      {children}
    </AppLink>
  );
}
