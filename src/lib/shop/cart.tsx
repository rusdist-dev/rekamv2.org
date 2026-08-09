'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import catalogue from '@/data/products.json';

/* The cart.
 *
 * This is where the rewrite pays for itself. The old shop.js read product id,
 * name and price off each card's data-* attributes, so the markup WAS the
 * database, and it built each cart line's storage key by concatenating the
 * visible option label with its value:
 *
 *     select.dataset.opt + ': ' + select.value      // "Ukuran: L"
 *
 * That made a label part of the persisted format. Renaming it — or translating
 * it for the English build — would silently orphan every returning visitor's
 * cart. Here a line is {productId, option, qty}, referencing the catalogue by
 * id, and the label is presentation again.
 *
 * Hence the key bump. v1 payloads are ignored rather than migrated: the
 * catalogue is a sample, payment is out of scope, and inventing a translation
 * from stale display strings back to product ids would be more risk than the
 * handful of carts is worth.
 */

const KEY = 'rekam.cart.v2';
const MAX_QTY = 20;

export type Product = (typeof catalogue.products)[number];
export type CartLine = { productId: string; option?: string; qty: number };

/** A line joined to its product, which is the only shape the UI ever wants. */
export type ResolvedLine = CartLine & { product: Product; subtotal: number };

type CartApi = {
  lines: CartLine[];
  resolved: ResolvedLine[];
  count: number;
  subtotal: number;
  /** True until the stored cart has been read, so SSR and first paint agree. */
  hydrated: boolean;
  add: (productId: string, option: string | undefined, qty: number) => void;
  setQty: (productId: string, option: string | undefined, qty: number) => void;
  remove: (productId: string, option: string | undefined) => void;
  clear: () => void;
  /** Last thing that happened, for the live region. */
  announcement: string;
};

const CartContext = createContext<CartApi | null>(null);

const same = (a: CartLine, productId: string, option?: string) =>
  a.productId === productId && (a.option ?? '') === (option ?? '');

/** Anything malformed is dropped rather than trusted; this data is user-writable. */
function read(): CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((row): CartLine[] => {
      if (!row || typeof row !== 'object') return [];
      const { productId, option, qty } = row as Record<string, unknown>;
      if (typeof productId !== 'string') return [];
      if (!catalogue.products.some((p) => p.id === productId)) return [];
      const n = Number(qty);
      if (!Number.isFinite(n) || n < 1) return [];
      return [
        {
          productId,
          ...(typeof option === 'string' && option ? { option } : {}),
          qty: Math.min(Math.floor(n), MAX_QTY),
        },
      ];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Read once on mount. Doing it in useState's initialiser would run during SSR
  // and produce a hydration mismatch.
  useEffect(() => {
    setLines(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // Private mode or a full store: the cart still works for this session.
    }
  }, [lines, hydrated]);

  const nameOf = useCallback(
    (id: string) => catalogue.products.find((p) => p.id === id)?.name ?? id,
    []
  );

  const add = useCallback(
    (productId: string, option: string | undefined, qty: number) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => same(l, productId, option));
        if (i === -1) return [...prev, { productId, ...(option ? { option } : {}), qty: Math.min(qty, MAX_QTY) }];
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, MAX_QTY) };
        return next;
      });
      setAnnouncement(`${nameOf(productId)} ditambahkan ke keranjang.`);
    },
    [nameOf]
  );

  const setQty = useCallback((productId: string, option: string | undefined, qty: number) => {
    setLines((prev) =>
      qty < 1
        ? prev.filter((l) => !same(l, productId, option))
        : prev.map((l) => (same(l, productId, option) ? { ...l, qty: Math.min(qty, MAX_QTY) } : l))
    );
  }, []);

  const remove = useCallback(
    (productId: string, option: string | undefined) => {
      setLines((prev) => prev.filter((l) => !same(l, productId, option)));
      setAnnouncement(`${nameOf(productId)} dihapus dari keranjang.`);
    },
    [nameOf]
  );

  const clear = useCallback(() => {
    setLines([]);
    setAnnouncement('Keranjang dikosongkan.');
  }, []);

  const value = useMemo<CartApi>(() => {
    const resolved = lines.flatMap((l): ResolvedLine[] => {
      const product = catalogue.products.find((p) => p.id === l.productId);
      return product ? [{ ...l, product, subtotal: product.price * l.qty }] : [];
    });
    return {
      lines,
      resolved,
      count: resolved.reduce((n, l) => n + l.qty, 0),
      subtotal: resolved.reduce((n, l) => n + l.subtotal, 0),
      hydrated,
      add,
      setQty,
      remove,
      clear,
      announcement,
    };
  }, [lines, hydrated, add, setQty, remove, clear, announcement]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>');
  return ctx;
}

export { MAX_QTY, catalogue };
