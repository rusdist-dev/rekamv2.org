'use client';

import { useState } from 'react';
import type { SafeguardingContent } from '@/i18n/content/safeguarding';

/* Client half of the /safeguarding "lapor" form — split out of page.tsx (a
 * server component) so it can hold submit state and POST to /api/contact,
 * which proxies POST /api/v1/contact server-side (see src/app/api/contact/
 * route.ts for why that hop exists). */

const inputCls =
  'mt-2 w-full rounded-lg border border-green-ink/25 bg-white px-3 py-[0.65rem] text-[0.92rem] text-ink outline-none focus:border-green-700';

function ComplaintField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ComplaintForm({ form }: { form: SafeguardingContent['lapor']['form'] }) {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('nama'),
          email: data.get('email'),
          phone: data.get('nomor'),
          subject: form.subjectValue,
          message: data.get('keluhan'),
          address: data.get('alamat'),
          is_private: data.get('anonim') === form.anonymityOptions[0],
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      formEl.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-[14px] border border-green-ink/12 bg-white p-6 text-[0.95rem] leading-[1.7] text-green-900"
      >
        {form.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[14px] border border-green-ink/12 bg-white p-6">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-3 block font-label text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-green-900">
          {form.anonymityLegend}
        </legend>
        <div className="grid gap-2">
          {form.anonymityOptions.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-sage/30 px-4 py-3 text-[0.92rem] text-ink"
            >
              <input type="radio" name="anonim" value={opt} required className="accent-green-700" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        <ComplaintField id="nama" label={form.nameLabel}>
          <input id="nama" name="nama" type="text" required className={inputCls} />
        </ComplaintField>
        <ComplaintField id="email-pengadu" label={form.emailLabel}>
          <input id="email-pengadu" name="email" type="email" required className={inputCls} />
        </ComplaintField>
        <ComplaintField id="alamat" label={form.addressLabel}>
          <input id="alamat" name="alamat" type="text" className={inputCls} />
        </ComplaintField>
        <ComplaintField id="nomor" label={form.phoneLabel}>
          <input id="nomor" name="nomor" type="tel" className={inputCls} />
        </ComplaintField>
        <ComplaintField id="keluhan" label={form.messageLabel}>
          <textarea id="keluhan" name="keluhan" rows={4} required className={inputCls} />
        </ComplaintField>
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-4 mb-0 text-[0.85rem] text-rust">
          {form.error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-6 min-h-[3rem] w-full rounded-lg bg-green-700 text-[0.95rem] font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? form.submitting : form.submit}
      </button>
    </form>
  );
}
