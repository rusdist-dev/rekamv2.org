import type { Locale } from '@/i18n/config';

/* en groups thousands with a comma and marks decimals with a period; id does
 * the reverse. The decimal place count comes from the raw number itself
 * (2.05 stringifies to two decimals, 1.2 to one) so nothing is hand-tracked
 * in the data beyond the number. */
export function formatNumber(value: number, locale: Locale) {
  const decimals = Number.isInteger(value) ? 0 : String(value).split('.')[1].length;
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
