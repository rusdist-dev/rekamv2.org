import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/* globals.css:70-86 defines the type scale as named --text-* tokens (e.g.
 * --text-display, --text-hero-sm) rather than Tailwind's default xs/sm/base
 * ladder. Vanilla tailwind-merge doesn't know these names are font sizes, so
 * it lumped `text-display` in with `text-{color}` utilities and silently
 * dropped whichever one lost the merge. Telling it these are font sizes fixes
 * that class of bug for every `cn(...)` call, not just one call site. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            '2xs',
            'lede',
            'lede-lg',
            'title-sm',
            'title',
            'title-lg',
            'quote',
            'stat',
            'display',
            'display-lg',
            'stat-lg',
            'hero-sm',
            'hero',
            'hero-lg',
          ],
        },
      ],
    },
  },
});

/** Merge class lists, letting a caller's className win over a component default. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
