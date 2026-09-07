'use client';

import Link from 'next/link';
import { AppLink } from '@/components/ui/AppLink';
import { buttonClasses, type ButtonVariant } from '@/components/ui/button-classes';

export type { ButtonVariant };

type Props = {
  variant?: ButtonVariant;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = 'green',
  block = false,
  className,
  children,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, block, className)} {...rest}>
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
    <AppLink href={href} className={buttonClasses(variant, block, className)} {...rest}>
      {children}
    </AppLink>
  );
}
