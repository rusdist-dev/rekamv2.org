import type { Metadata } from 'next';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Checkout } from '@/components/shop/Checkout';
import { checkoutContent } from '@/i18n/content/checkout';
import { pageMetadata, readLocale, type LocaleParams } from '@/i18n/metadata';
import { CartProvider } from '@/lib/shop/cart';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const copy = checkoutContent(locale);
  return pageMetadata(locale, '/checkout', {
    title: copy.meta.title,
    description: copy.meta.description,
    // The source marked this noindex; a checkout has nothing to offer a crawler.
    robots: { index: false, follow: false },
  });
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <SiteShell current="merch">
        <Checkout />
      </SiteShell>
    </CartProvider>
  );
}
