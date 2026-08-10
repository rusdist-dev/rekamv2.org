import type { Metadata } from 'next';
import { SiteShell } from '@/components/chrome/SiteShell';
import { Checkout } from '@/components/shop/Checkout';
import { CartProvider } from '@/lib/shop/cart';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Selesaikan pesanan merchandise REKAM Nusantara.',
  // The source marked this noindex; a checkout has nothing to offer a crawler.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <CartProvider>
      <SiteShell current="merch">
        <Checkout />
      </SiteShell>
    </CartProvider>
  );
}
