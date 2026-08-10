'use client';

import { useMemo, useState } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { rupiah, SHOP, unsetFields } from '@/lib/shop/config';
import { useCart } from '@/lib/shop/cart';

/* rekam.css:2138-2575.
 *
 * Order review, buyer details, and the handoff. Payment is out of scope for
 * this rewrite, and the source's own position makes that easy to honour: it
 * never took money either. It generated a payment INSTRUCTION and handed the
 * order to a human, because every automatic method needs a server the buyer
 * cannot forge — a static page must never be what decides a payment succeeded.
 *
 * With every identifier in config.ts still null, the honest end state is a
 * clearly-labelled dead end rather than a form that pretends. */

const STEPS = ['Pesanan', 'Data pembeli', 'Pembayaran'];

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 mb-0 text-[0.78rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.7rem] text-[0.95rem] text-ink outline-none focus:border-green-700';

export function Checkout() {
  const { resolved, count, subtotal, hydrated, setQty, remove } = useCart();
  const [shipping, setShipping] = useState(SHOP.shipping[0].id);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const chosen = SHOP.shipping.find((s) => s.id === shipping) ?? SHOP.shipping[0];
  const needsAddress = chosen.id !== 'pickup';
  const total = subtotal + chosen.cost;
  const missing = useMemo(() => unsetFields(), []);

  if (!hydrated) {
    return (
      <Wrap className="page-top pb-24">
        <p className="text-ink-soft">Memuat keranjang…</p>
      </Wrap>
    );
  }

  if (count === 0) {
    return (
      <Wrap className="page-top pb-24">
        <Eyebrow>Checkout</Eyebrow>
        <Display className="mt-4 text-display">Keranjang masih kosong</Display>
        <p className="mt-4 mb-8 max-w-[46ch] text-lede text-ink-soft">
          Pilih dulu produk yang ingin Anda dukung, lalu kembali ke halaman ini.
        </p>
        <AppLink
          href="/merch"
          className="inline-flex min-h-[3.25rem] items-center rounded-full bg-green-700 px-8 text-[1rem] font-bold text-white no-underline hover:bg-green-800"
        >
          Lihat katalog
        </AppLink>
      </Wrap>
    );
  }

  return (
    <Wrap className="page-top pb-[clamp(3rem,7vw,6rem)]">
      <Eyebrow>Checkout</Eyebrow>
      <Display className="mt-4 text-display">Selesaikan pesanan</Display>

      <ol className="mt-8 mb-10 flex list-none flex-wrap gap-x-8 gap-y-2 p-0">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-[0.85rem] text-ink-soft">
            <span className="grid size-6 place-items-center rounded-full bg-green-ink/12 text-[0.72rem] font-bold text-green-900">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-[clamp(1.5rem,3vw,2.5rem)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid gap-[clamp(1.5rem,3vw,2rem)]">
          <section className="rounded-[14px] border border-green-ink/12 bg-white p-6">
            <h2 className="m-0 font-display text-title-sm text-green-900">Pesanan</h2>
            <ul className="mt-4 mb-0 list-none p-0">
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
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={l.qty}
                    aria-label={`Jumlah ${l.product.name}`}
                    onChange={(e) => setQty(l.productId, l.option, Number(e.target.value))}
                    className="w-16 rounded-lg border border-green-ink/25 px-2 py-1 text-center text-[0.9rem] text-green-900"
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
          </section>

          <section className="rounded-[14px] border border-green-ink/12 bg-white p-6">
            <h2 className="m-0 mb-5 font-display text-title-sm text-green-900">Data pembeli</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="f-nama" label="Nama lengkap">
                <input id="f-nama" name="nama" autoComplete="name" className={inputCls} />
              </Field>
              <Field id="f-wa" label="WhatsApp" hint="Contoh: 0812xxxxxxx">
                <input id="f-wa" name="wa" inputMode="tel" autoComplete="tel" className={inputCls} />
              </Field>
              <Field id="f-email" label="Email">
                <input id="f-email" name="email" type="email" autoComplete="email" className={inputCls} />
              </Field>
              <Field id="f-kirim" label="Pengiriman">
                <select
                  id="f-kirim"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className={inputCls}
                >
                  {SHOP.shipping.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.cost ? rupiah(s.cost) : 'gratis'} ({s.note})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Address fields appear only when something is being shipped;
                  collecting a postcode for an office pickup is noise. */}
              {needsAddress && (
                <>
                  <Field id="f-alamat" label="Alamat">
                    <textarea id="f-alamat" name="alamat" rows={3} autoComplete="street-address" className={inputCls} />
                  </Field>
                  <div className="grid gap-5">
                    <Field id="f-kota" label="Kota">
                      <input id="f-kota" name="kota" autoComplete="address-level2" className={inputCls} />
                    </Field>
                    <Field id="f-pos" label="Kode pos">
                      <input id="f-pos" name="pos" inputMode="numeric" autoComplete="postal-code" className={inputCls} />
                    </Field>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <Field id="f-catatan" label="Catatan (opsional)">
                  <textarea id="f-catatan" name="catatan" rows={2} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-[14px] border border-green-ink/12 bg-cream p-6 lg:sticky lg:top-[calc(var(--nav-h)+1rem)]">
          <h2 className="m-0 font-display text-title-sm text-green-900">Ringkasan</h2>
          <dl className="mt-4 mb-0 grid gap-2 text-[0.92rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="m-0 font-semibold text-green-900">{rupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Pengiriman</dt>
              <dd className="m-0 font-semibold text-green-900">
                {chosen.cost ? rupiah(chosen.cost) : 'Gratis'}
              </dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-green-ink/15 pt-3">
              <dt className="font-semibold text-green-900">Total</dt>
              <dd className="m-0 text-[1.15rem] font-bold text-green-900">{rupiah(total)}</dd>
            </div>
          </dl>

          <label className="mt-6 flex items-start gap-3 text-[0.85rem] leading-[1.55] text-ink-soft">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 size-4 accent-green-700"
            />
            <span>Saya mengerti pesanan ini dikonfirmasi manual oleh tim REKAM.</span>
          </label>

          <button
            type="button"
            disabled={!agreed}
            onClick={() => setSubmitted(true)}
            className={cn(
              'mt-5 min-h-[3.25rem] w-full rounded-full border-0 px-6 text-[1rem] font-bold transition-colors duration-200',
              agreed
                ? 'cursor-pointer bg-green-700 text-white hover:bg-green-800'
                : 'cursor-not-allowed bg-green-ink/15 text-ink-soft'
            )}
          >
            Buat pesanan
          </button>

          {/* Config-incomplete notice, straight from the source's stance: while
              an identifier is null the page says so rather than letting an
              unfinished setup look finished. */}
          {missing.length > 0 && (
            <p className="mt-5 mb-0 rounded-lg bg-yellow/35 p-3 text-[0.8rem] leading-[1.6] text-bronze">
              Belum diisi: {missing.join(', ')}. Sampai itu terisi, pesanan tidak dapat diproses
              otomatis.
            </p>
          )}
        </aside>
      </div>

      {submitted && (
        <section className="mt-[clamp(2rem,4vw,3rem)] rounded-[14px] border border-green-ink/12 bg-white p-6" role="status">
          <h2 className="m-0 font-display text-title-sm text-green-900">Pembayaran belum tersambung</h2>
          <p className="mt-3 mb-0 max-w-[62ch] text-[0.95rem] leading-[1.7] text-ink-soft">
            Katalog ini contoh dan kanal pembayarannya sengaja dibiarkan kosong. Sebuah halaman
            tidak boleh menjadi yang memutuskan pembayaran berhasil — itu perlu server yang
            memverifikasi, dan itu di luar lingkup pekerjaan ini. Hubungi tim REKAM untuk memesan.
          </p>
          <p className="mt-4 mb-0 text-[0.85rem] text-ink-soft">
            Total pesanan Anda: <b className="text-green-900">{rupiah(total)}</b> ({count} item,{' '}
            {chosen.label}).
          </p>
          <AppLink
            href="/#kontak"
            className="mt-6 inline-flex min-h-[3.25rem] items-center rounded-full bg-green-700 px-8 text-[1rem] font-bold text-white no-underline hover:bg-green-800"
          >
            Hubungi kami
          </AppLink>
        </section>
      )}
    </Wrap>
  );
}
