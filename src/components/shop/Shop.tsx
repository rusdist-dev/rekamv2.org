'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/chrome/SvgSprite';
import { AppLink } from '@/components/ui/AppLink';
import { Chip, Wrap } from '@/components/ui/primitives';
import type { IconId } from '@/icons';
import { cn } from '@/lib/cn';
import { rupiah } from '@/lib/shop/config';
import { catalogue, MAX_QTY, useCart, type Product } from '@/lib/shop/cart';

/* rekam.css:1819-2135. The catalogue, its category filter, and the sticky cart
 * bar. Product facts come from the collection now rather than being read back
 * off the card's own data-* attributes, so the displayed price and the charged
 * price cannot drift apart. */

/* .mc__art--a … --l in the source: a hand-assigned tint per card. Kept as a
   lookup so the palette stays deliberate rather than cycling. */
const ART: Record<string, string> = {
  a: 'bg-sage', b: 'bg-band', c: 'bg-mauve', d: 'bg-cream',
  e: 'bg-sage-deep', f: 'bg-band', g: 'bg-mauve', h: 'bg-sage',
  i: 'bg-cream', j: 'bg-sage-deep', k: 'bg-band', l: 'bg-mauve',
};

function Qty({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex items-center rounded-full border border-green-ink/25">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid size-9 place-items-center rounded-full text-green-900 hover:bg-green-ink/8"
      >
        &minus;
      </button>
      <input
        type="number"
        min={1}
        max={MAX_QTY}
        step={1}
        value={value}
        aria-label="Jumlah"
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 1), MAX_QTY) : 1);
        }}
        className="w-10 border-0 bg-transparent text-center text-[0.9rem] font-semibold text-green-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Tambah jumlah"
        onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
        className="grid size-9 place-items-center rounded-full text-green-900 hover:bg-green-ink/8"
      >
        +
      </button>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [option, setOption] = useState(product.option?.selected ?? undefined);
  const [qty, setQty] = useState(1);

  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-green-ink/12 bg-white">
      <div className={cn('relative grid aspect-[4/3] place-items-center', ART[product.art] ?? 'bg-band')}>
        <Icon id={product.glyph as IconId} className="size-16 fill-none stroke-green-900 stroke-[1.2]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 font-label text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-green-900">
          {product.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="m-0 font-display text-title-sm leading-[1.25] text-green-900">{product.name}</h3>
        <p className="mt-2 mb-0 text-[0.9rem] leading-[1.55] text-ink-soft">{product.desc}</p>
        <p className="mt-3 mb-0 text-[1.05rem] font-bold text-green-900">{rupiah(product.price)}</p>

        {product.option && (
          <label className="mt-4 block">
            <span className="block font-label text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {product.option.label}
            </span>
            <select
              value={option}
              onChange={(e) => setOption(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-2 text-[0.9rem] text-green-900"
            >
              {product.option.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          <Qty value={qty} onChange={setQty} label={`Jumlah ${product.name}`} />
          {/* The visible label repeats twelve times, so the accessible name
              says which product — and distinguishes it from the stepper's
              "Tambah jumlah" sitting right beside it. */}
          <button
            type="button"
            aria-label={`Tambah ${product.name} ke keranjang`}
            onClick={() => {
              add(product.id, option, qty);
              setQty(1);
            }}
            className="min-h-[2.6rem] flex-1 cursor-pointer rounded-full border-0 bg-green-700 px-5 text-[0.9rem] font-bold text-white transition-colors duration-200 hover:bg-green-800"
          >
            Tambah
          </button>
        </div>
      </div>
    </article>
  );
}

function CartBar() {
  const { resolved, count, subtotal, hydrated, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);

  // Nothing until the stored cart has been read, or the bar would flash empty.
  if (!hydrated || count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-green-ink/12 bg-white/95 backdrop-blur-[12px]">
      {open && (
        <Wrap className="max-h-[46vh] overflow-y-auto py-4">
          <ul className="m-0 list-none p-0">
            {resolved.map((l) => (
              <li
                key={l.productId + (l.option ?? '')}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-green-ink/10 py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.92rem] font-semibold text-green-900">{l.product.name}</span>
                  {l.option && (
                    <span className="block text-[0.8rem] text-ink-soft">
                      {l.product.option?.label}: {l.option}
                    </span>
                  )}
                </span>
                <Qty
                  value={l.qty}
                  onChange={(n) => setQty(l.productId, l.option, n)}
                  label={`Jumlah ${l.product.name}`}
                />
                <span className="w-28 text-right text-[0.92rem] font-bold text-green-900">
                  {rupiah(l.subtotal)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(l.productId, l.option)}
                  aria-label={`Hapus ${l.product.name}`}
                  className="cursor-pointer border-0 bg-transparent px-2 text-ink-soft hover:text-rust"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </Wrap>
      )}

      <Wrap className="flex flex-wrap items-center gap-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="cart-list"
          className="flex flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
        >
          <span className="grid size-7 place-items-center rounded-full bg-green-700 text-[0.78rem] font-bold text-white">
            {count}
          </span>
          <span className="text-[0.92rem] font-semibold text-green-900">Keranjang</span>
          <span className="text-[0.92rem] font-bold text-green-900">{rupiah(subtotal)}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-4 transition-transform', open && 'rotate-180')}>
            <path d="M6 15 L12 9 L18 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <AppLink
          href="/checkout"
          className="min-h-[2.6rem] rounded-full bg-green-700 px-6 text-[0.9rem] font-bold leading-[2.6rem] text-white no-underline transition-colors duration-200 hover:bg-green-800"
        >
          Lanjut ke pembayaran
        </AppLink>
      </Wrap>
    </div>
  );
}

export function Shop() {
  const [filter, setFilter] = useState('all');
  const { announcement } = useCart();

  const shown = useMemo(
    () => (filter === 'all' ? catalogue.products : catalogue.products.filter((p) => p.cat === filter)),
    [filter]
  );

  return (
    <>
      <Wrap className="pb-[clamp(3rem,7vw,6rem)]">
        <div className="flex flex-wrap items-center gap-3">
          {catalogue.categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </Chip>
          ))}
          <p className="m-0 ml-auto text-[0.82rem] text-ink-soft">
            {shown.length} dari {catalogue.products.length} produk
          </p>
        </div>

        <div className="mt-[clamp(1.5rem,3vw,2.5rem)] grid gap-[clamp(1.25rem,2.5vw,2rem)] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Wrap>

      {/* The source kept a live region for cart changes; keeping it means a
          screen reader hears "added to cart" instead of nothing happening. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <CartBar />
    </>
  );
}
