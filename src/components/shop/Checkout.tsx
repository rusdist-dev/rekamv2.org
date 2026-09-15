'use client';

import { useMemo, useState } from 'react';
import { AppLink, useLocale } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Display, Eyebrow, Wrap } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { rupiah, SHOP, unsetFields } from '@/lib/shop/config';
import { useCart } from '@/lib/shop/cart';
import { checkoutContent } from '@/i18n/content/checkout';
import { t } from '@/i18n/dictionary';

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
  const locale = useLocale();
  const content = checkoutContent(locale);
  const dict = t(locale);
  const breadcrumbItems = [
    { label: dict.common.breadcrumb.home, href: '/' },
    { label: dict.nav_items.merch, href: '/merch' },
    { label: content.eyebrow },
  ];
  const { resolved, count, subtotal, hydrated, setQty, remove } = useCart();
  const [shipping, setShipping] = useState(SHOP.shipping[0].id);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const chosen = SHOP.shipping.find((s) => s.id === shipping) ?? SHOP.shipping[0];
  const chosenCopy = content.shippingById[chosen.id] ?? { label: chosen.label, note: chosen.note };
  const needsAddress = chosen.id !== 'pickup';
  const total = subtotal + chosen.cost;
  const missing = useMemo(() => unsetFields(), []);
  const missingLabels = missing.map((m) => content.missingFieldLabels[m] ?? m);

  if (!hydrated) {
    return (
      <Wrap className="page-top pb-24">
        <Breadcrumb ariaLabel={dict.common.breadcrumb.ariaLabel} items={breadcrumbItems} />
        <p className="text-ink-soft">{content.loadingCart}</p>
      </Wrap>
    );
  }

  if (count === 0) {
    return (
      <Wrap className="page-top pb-24">
        <Breadcrumb ariaLabel={dict.common.breadcrumb.ariaLabel} items={breadcrumbItems} />
        <Eyebrow>{content.eyebrow}</Eyebrow>
        <Display className="mt-4 text-display">{content.emptyCart.heading}</Display>
        <p className="mt-4 mb-8 max-w-[46ch] text-lede text-ink-soft">
          {content.emptyCart.message}
        </p>
        <AppLink
          href="/merch"
          className="inline-flex min-h-[3.25rem] items-center rounded-full bg-green-700 px-8 text-[1rem] font-bold text-white no-underline hover:bg-green-800"
        >
          {content.emptyCart.cta}
        </AppLink>
      </Wrap>
    );
  }

  return (
    <Wrap className="page-top pb-[clamp(3rem,7vw,6rem)]">
      <Breadcrumb ariaLabel={dict.common.breadcrumb.ariaLabel} items={breadcrumbItems} />
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <Display className="mt-4 text-display">{content.heading}</Display>

      <ol className="mt-8 mb-10 flex list-none flex-wrap gap-x-8 gap-y-2 p-0">
        {content.steps.map((s, i) => (
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
            <h2 className="m-0 font-display text-title-sm text-green-900">{content.order.heading}</h2>
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
                    aria-label={content.order.qtyAriaLabel(l.product.name)}
                    onChange={(e) => setQty(l.productId, l.option, Number(e.target.value))}
                    className="w-16 rounded-lg border border-green-ink/25 px-2 py-1 text-center text-[0.9rem] text-green-900"
                  />
                  <span className="w-28 text-right text-[0.92rem] font-bold text-green-900">
                    {rupiah(l.subtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(l.productId, l.option)}
                    aria-label={content.order.removeAriaLabel(l.product.name)}
                    className="cursor-pointer border-0 bg-transparent px-2 text-ink-soft hover:text-rust"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[14px] border border-green-ink/12 bg-white p-6">
            <h2 className="m-0 mb-5 font-display text-title-sm text-green-900">{content.buyer.heading}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="f-nama" label={content.buyer.fullName.label}>
                <input id="f-nama" name="nama" autoComplete="name" className={inputCls} />
              </Field>
              <Field id="f-wa" label={content.buyer.whatsapp.label} hint={content.buyer.whatsapp.hint}>
                <input id="f-wa" name="wa" inputMode="tel" autoComplete="tel" className={inputCls} />
              </Field>
              <Field id="f-email" label={content.buyer.email.label}>
                <input id="f-email" name="email" type="email" autoComplete="email" className={inputCls} />
              </Field>
              <Field id="f-kirim" label={content.buyer.shippingMethod.label}>
                <select
                  id="f-kirim"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className={inputCls}
                >
                  {SHOP.shipping.map((s) => {
                    const copy = content.shippingById[s.id] ?? { label: s.label, note: s.note };
                    return (
                      <option key={s.id} value={s.id}>
                        {copy.label} — {s.cost ? rupiah(s.cost) : content.buyer.shippingMethod.freeSuffix} ({copy.note})
                      </option>
                    );
                  })}
                </select>
              </Field>

              {/* Address fields appear only when something is being shipped;
                  collecting a postcode for an office pickup is noise. */}
              {needsAddress && (
                <>
                  <Field id="f-alamat" label={content.buyer.address.label}>
                    <textarea id="f-alamat" name="alamat" rows={3} autoComplete="street-address" className={inputCls} />
                  </Field>
                  <div className="grid gap-5">
                    <Field id="f-kota" label={content.buyer.city.label}>
                      <input id="f-kota" name="kota" autoComplete="address-level2" className={inputCls} />
                    </Field>
                    <Field id="f-pos" label={content.buyer.postcode.label}>
                      <input id="f-pos" name="pos" inputMode="numeric" autoComplete="postal-code" className={inputCls} />
                    </Field>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <Field id="f-catatan" label={content.buyer.notes.label}>
                  <textarea id="f-catatan" name="catatan" rows={2} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="rounded-[14px] border border-green-ink/12 bg-cream p-6 lg:sticky lg:top-[calc(var(--nav-h)+1rem)]">
          <h2 className="m-0 font-display text-title-sm text-green-900">{content.summary.heading}</h2>
          <dl className="mt-4 mb-0 grid gap-2 text-[0.92rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{content.summary.subtotal}</dt>
              <dd className="m-0 font-semibold text-green-900">{rupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">{content.summary.shipping}</dt>
              <dd className="m-0 font-semibold text-green-900">
                {chosen.cost ? rupiah(chosen.cost) : content.summary.free}
              </dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-green-ink/15 pt-3">
              <dt className="font-semibold text-green-900">{content.summary.total}</dt>
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
            <span>{content.summary.agreement}</span>
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
            {content.summary.submit}
          </button>

          {/* Config-incomplete notice, straight from the source's stance: while
              an identifier is null the page says so rather than letting an
              unfinished setup look finished. */}
          {missing.length > 0 && (
            <p className="mt-5 mb-0 rounded-lg bg-yellow/35 p-3 text-[0.8rem] leading-[1.6] text-bronze">
              {content.summary.missingPrefix}: {missingLabels.join(', ')}. {content.summary.missingSuffix}
            </p>
          )}
        </aside>
      </div>

      {submitted && (
        <section className="mt-[clamp(2rem,4vw,3rem)] rounded-[14px] border border-green-ink/12 bg-white p-6" role="status">
          <h2 className="m-0 font-display text-title-sm text-green-900">{content.paymentNotice.heading}</h2>
          <p className="mt-3 mb-0 max-w-[62ch] text-[0.95rem] leading-[1.7] text-ink-soft">
            {content.paymentNotice.body}
          </p>
          <p className="mt-4 mb-0 text-[0.85rem] text-ink-soft">
            {content.paymentNotice.totalPrefix} <b className="text-green-900">{rupiah(total)}</b>
            {content.paymentNotice.totalSuffix(count, chosenCopy.label)}
          </p>
          <AppLink
            href="/#kontak"
            className="mt-6 inline-flex min-h-[3.25rem] items-center rounded-full bg-green-700 px-8 text-[1rem] font-bold text-white no-underline hover:bg-green-800"
          >
            {content.paymentNotice.contactCta}
          </AppLink>
        </section>
      )}
    </Wrap>
  );
}
