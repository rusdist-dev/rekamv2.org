/* ==========================================================================
   Shop — catalogue interactions, cart, and checkout
   ==========================================================================

   The cart lives in localStorage, which is the whole persistence layer: there
   is no server here to hold a session. Product facts (id, name, price) are read
   off the catalogue DOM rather than duplicated in a JS array, so the markup
   stays the single source of truth and a price can never disagree with itself.

   PAYMENT_ROADMAP
   ---------------
   What this file does is generate a payment *instruction* and hand the order to
   a human. That is a real, widely used Indonesian flow — and it is the only
   honest one available without a backend, because every automatic method needs
   a server the buyer cannot forge:

     - QRIS / e-wallet (DANA, GoPay, OVO, ShopeePay): a static QR from REKAM's
       acquirer works today, but nothing tells the page when it is paid. Live
       status needs the acquirer's webhook hitting a server endpoint.
     - Virtual account, one per order: needs a gateway API call at checkout
       (Midtrans /charge, Xendit /callback_virtual_accounts).
     - Google Pay / card: needs the Google Pay JS API plus a gateway that
       decrypts the payment token server-side. Never client-side — a browser
       cannot hold a merchant key.

   In every case the same rule holds: the *page* must never be what decides a
   payment succeeded. Until a server can verify it, a person does.
   ========================================================================== */

(() => {
  'use strict';

  const CFG = window.REKAM_SHOP || {};
  const KEY = 'rekam.cart.v1';
  const MAX_QTY = 20;

  /* ---- money -------------------------------------------------------------
     Rupiah has no minor unit in practice, so no decimals anywhere. */
  const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const say = (msg) => {
    const box = document.getElementById('cart-say');
    if (box) box.textContent = msg;
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ---- cart --------------------------------------------------------------
     A line is identified by product id plus its chosen option, so two sizes of
     the same shirt are two lines rather than one ambiguous one. */

  const lineKey = (id, opt) => (opt ? id + '::' + opt : id);

  const read = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      // Anything malformed is dropped rather than trusted: this data is
      // user-writable, and a NaN price would poison every total downstream.
      return raw.filter((l) => l && typeof l.id === 'string'
        && Number.isFinite(+l.price) && +l.price >= 0
        && Number.isFinite(+l.qty) && +l.qty > 0)
        .map((l) => ({
          key: lineKey(l.id, l.opt),
          id: l.id,
          name: String(l.name || l.id),
          opt: l.opt ? String(l.opt) : '',
          price: +l.price,
          qty: Math.min(MAX_QTY, Math.round(+l.qty)),
        }));
    } catch { return []; }
  };

  const write = (lines) => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* full or blocked */ }
    document.dispatchEvent(new CustomEvent('cart:change'));
  };

  const subtotal = (lines) => lines.reduce((n, l) => n + l.price * l.qty, 0);
  const count = (lines) => lines.reduce((n, l) => n + l.qty, 0);

  const add = (item) => {
    const lines = read();
    const key = lineKey(item.id, item.opt);
    const found = lines.find((l) => l.key === key);
    if (found) found.qty = Math.min(MAX_QTY, found.qty + item.qty);
    else lines.push({ ...item, key });
    write(lines);
  };

  const setQty = (key, qty) => {
    let lines = read();
    if (qty <= 0) lines = lines.filter((l) => l.key !== key);
    else {
      const found = lines.find((l) => l.key === key);
      if (found) found.qty = Math.min(MAX_QTY, qty);
    }
    write(lines);
  };

  /* ---- quantity steppers (shared by both pages) -------------------------- */

  const clampInput = (input) => {
    const min = +input.min || 1;
    const max = +input.max || MAX_QTY;
    let v = Math.round(+input.value);
    if (!Number.isFinite(v)) v = min;
    input.value = Math.min(max, Math.max(min, v));
    return +input.value;
  };

  document.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    if (!step) return;
    const input = step.parentElement.querySelector('input');
    if (!input) return;
    input.value = +input.value + +step.dataset.step;
    clampInput(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('.qty input')) clampInput(event.target);
  });

  /* ======================================================================
     Catalogue page
     ====================================================================== */

  const grid = document.getElementById('shop-grid');

  if (grid) {
    /* ---- add to cart ---- */
    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('.mc__add');
      if (!btn) return;
      const card = btn.closest('.mc');
      const input = card.querySelector('.qty input');
      const select = card.querySelector('select[data-opt]');
      const opt = select ? select.dataset.opt + ': ' + select.value : '';

      add({
        id: card.dataset.id,
        name: card.dataset.name,
        price: +card.dataset.price,
        opt,
        qty: clampInput(input),
      });

      input.value = 1;
      btn.classList.add('is-done');
      btn.textContent = 'Ditambahkan';
      setTimeout(() => { btn.classList.remove('is-done'); btn.textContent = 'Tambah'; }, 1400);
      say(`${card.dataset.name} masuk keranjang.`);
    });

    /* ---- category filter ---- */
    const chips = [...document.querySelectorAll('.chip[data-filter]')];
    const cards = [...grid.querySelectorAll('.mc')];
    const countBox = document.getElementById('shop-count');

    const applyFilter = (want) => {
      let shown = 0;
      for (const card of cards) {
        const on = want === 'all' || card.dataset.cat === want;
        card.hidden = !on;
        if (on) shown++;
      }
      for (const chip of chips) {
        const on = chip.dataset.filter === want;
        chip.classList.toggle('is-on', on);
        chip.setAttribute('aria-pressed', String(on));
      }
      if (countBox) {
        countBox.textContent = shown === cards.length
          ? `${cards.length} produk`
          : `${shown} dari ${cards.length} produk`;
      }
    };

    for (const chip of chips) {
      chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
    }
    applyFilter('all');

    /* ---- the cart bar ---- */
    const bar = document.getElementById('cartbar');
    const toggle = document.getElementById('cart-toggle');
    const panel = document.getElementById('cart-list');
    const linesBox = document.getElementById('cart-lines');

    const paintBar = () => {
      const lines = read();
      const n = count(lines);
      bar.hidden = n === 0;
      if (n === 0 && panel) { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
      document.getElementById('cart-count').textContent = String(n);
      document.getElementById('cart-total').textContent = rp(subtotal(lines));

      linesBox.innerHTML = lines.map((l) => `
        <li class="cartline">
          <span class="cartline__name">${esc(l.name)}${l.opt ? `<em>${esc(l.opt)}</em>` : ''}</span>
          <span class="cartline__qty">${l.qty} &times; ${rp(l.price)}</span>
          <span class="cartline__sum">${rp(l.price * l.qty)}</span>
          <button class="cartline__x" type="button" data-drop="${esc(l.key)}"
                  aria-label="Hapus ${esc(l.name)}">&times;</button>
        </li>`).join('');
    };

    toggle.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });

    linesBox.addEventListener('click', (event) => {
      const x = event.target.closest('[data-drop]');
      if (x) { setQty(x.dataset.drop, 0); say('Item dihapus.'); }
    });

    document.addEventListener('cart:change', paintBar);
    paintBar();
  }

  /* ======================================================================
     Checkout page
     ====================================================================== */

  const co = document.getElementById('co-main');
  if (!co) return;

  const $ = (id) => document.getElementById(id);
  const form = $('co-form');
  const shipSel = $('f-kirim');
  const linesBox = $('co-lines');
  let locked = false;

  /* ---- shipping options come from config so rates live in one file ---- */
  const ships = Array.isArray(CFG.shipping) && CFG.shipping.length
    ? CFG.shipping
    : [{ id: 'pickup', label: 'Ambil di kantor', cost: 0, note: '' }];

  shipSel.innerHTML = ships.map((s, i) => `
    <option value="${esc(s.id)}"${i === 1 || (ships.length === 1 && i === 0) ? ' selected' : ''}>
      ${esc(s.label)} — ${s.cost ? rp(s.cost) : 'Gratis'}${s.note ? ' · ' + esc(s.note) : ''}
    </option>`).join('');

  const ship = () => ships.find((s) => s.id === shipSel.value) || ships[0];

  /* ---- wallet and bank chips, also from config ---- */
  const wallets = (CFG.qris && CFG.qris.wallets) || [];
  $('pay-wallets').innerHTML = wallets.map((w) => `<span class="wchip">${esc(w)}</span>`).join('');

  const banks = Array.isArray(CFG.banks) ? CFG.banks : [];
  $('pay-banks').innerHTML = banks.length
    ? banks.map((b, i) => `
        <label class="bchip">
          <input type="radio" name="bank" value="${esc(b.id)}"${i === 0 ? ' checked' : ''}>
          <span>${esc(b.name)}</span>
        </label>`).join('')
    : '<span class="co-warn">Belum ada rekening di shop-config.js.</span>';

  const method = () => (document.querySelector('input[name="metode"]:checked') || {}).value || 'qris';
  const bank = () => banks.find((b) => b.id === (document.querySelector('input[name="bank"]:checked') || {}).value)
    || banks[0] || null;

  /* ---- the unique three-digit suffix ----
     Bank transfers are reconciled by eye, and two buyers sending the same round
     number on the same day are indistinguishable. Derived from the order code
     so it never drifts between the summary and the instruction. Only applied to
     bank transfer; QRIS carries its own reference. */
  const uniqOf = (code) => {
    let h = 0;
    for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 899;
    return h + 100;
  };

  let orderCode = (() => {
    const d = new Date();
    const stamp = String(d.getFullYear()).slice(2)
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0');
    const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RKM-${stamp}-${tail}`;
  })();

  /* ---- paint the order and the running total ---- */

  const paint = () => {
    const lines = read();
    const empty = lines.length === 0;
    $('co-empty').hidden = !empty;
    co.hidden = empty;
    if (empty) return;

    linesBox.innerHTML = lines.map((l) => `
      <li class="coline">
        <span class="coline__name">${esc(l.name)}${l.opt ? `<em>${esc(l.opt)}</em>` : ''}</span>
        <span class="coline__unit">${rp(l.price)}</span>
        <span class="qty qty--sm" role="group" aria-label="Jumlah ${esc(l.name)}">
          <button type="button" data-step="-1" aria-label="Kurangi jumlah"${locked ? ' disabled' : ''}>&minus;</button>
          <input type="number" value="${l.qty}" min="1" max="${MAX_QTY}" step="1"
                 data-line="${esc(l.key)}" aria-label="Jumlah"${locked ? ' disabled' : ''}>
          <button type="button" data-step="1" aria-label="Tambah jumlah"${locked ? ' disabled' : ''}>+</button>
        </span>
        <span class="coline__sum">${rp(l.price * l.qty)}</span>
        <button class="coline__x" type="button" data-drop="${esc(l.key)}"
                aria-label="Hapus ${esc(l.name)}"${locked ? ' disabled' : ''}>&times;</button>
      </li>`).join('');

    const sub = subtotal(lines);
    const shipCost = ship().cost;
    const isBank = method() === 'bank';
    const uniq = isBank ? uniqOf(orderCode) : 0;

    $('s-sub').textContent = rp(sub);
    $('s-ship').textContent = shipCost ? rp(shipCost) : 'Gratis';
    $('s-uniq-row').hidden = !isBank;
    $('s-uniq').textContent = '+ ' + uniq;
    $('s-total').textContent = rp(sub + shipCost + uniq);
    $('s-note').textContent = isBank
      ? 'Transfer tepat sampai tiga angka terakhir — itu penanda pesanan Anda.'
      : 'Nominal pada QRIS harus sama persis dengan total di atas.';

    // Picking up in person means there is nothing to post.
    const needsAddr = ship().id !== 'pickup';
    for (const id of ['f-alamat', 'f-kota', 'f-pos']) {
      const el = $(id);
      el.required = needsAddr;
      el.closest('.co-field').hidden = !needsAddr;
    }
    $('f-alamat-wrap').hidden = !needsAddr;
  };

  linesBox.addEventListener('change', (event) => {
    const input = event.target.closest('input[data-line]');
    if (input) setQty(input.dataset.line, clampInput(input));
  });
  linesBox.addEventListener('click', (event) => {
    const x = event.target.closest('[data-drop]');
    if (x && !locked) { setQty(x.dataset.drop, 0); say('Item dihapus.'); }
  });

  shipSel.addEventListener('change', paint);
  for (const radio of document.querySelectorAll('input[name="metode"], input[name="bank"]')) {
    radio.addEventListener('change', paint);
  }
  document.addEventListener('cart:change', paint);

  /* ---- step indicator follows the section you are actually in ---- */
  const stepEls = [...document.querySelectorAll('#co-steps li')];
  const cards = [...document.querySelectorAll('.co-card')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = cards.indexOf(e.target);
        stepEls.forEach((el, j) => el.classList.toggle('is-on', j <= i));
      }
    }, { rootMargin: '-45% 0px -45% 0px' });
    for (const c of cards) spy.observe(c);
  }

  /* ---- validate ---- */

  const problems = () => {
    const out = [];
    const val = (id) => $(id).value.trim();
    if (val('f-nama').length < 3) out.push('nama lengkap');
    if (!/^0\d{8,13}$/.test(val('f-wa').replace(/[\s-]/g, ''))) out.push('nomor WhatsApp (mulai 08…)');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('f-email'))) out.push('email');
    if (ship().id !== 'pickup') {
      if (val('f-alamat').length < 10) out.push('alamat lengkap');
      if (val('f-kota').length < 3) out.push('kota / kabupaten');
      if (!/^\d{5}$/.test(val('f-pos'))) out.push('kode pos (5 angka)');
    }
    if (!$('f-setuju').checked) out.push('centang pernyataan di bawah');
    return out;
  };

  /* ---- build the instruction ---- */

  const orderText = (o) => [
    `Pesanan ${o.code}`,
    '',
    ...o.lines.map((l) => `- ${l.name}${l.opt ? ` (${l.opt})` : ''} × ${l.qty} = ${rp(l.price * l.qty)}`),
    '',
    `Subtotal: ${rp(o.sub)}`,
    `Pengiriman (${o.ship.label}): ${o.ship.cost ? rp(o.ship.cost) : 'Gratis'}`,
    ...(o.uniq ? [`Kode unik: +${o.uniq}`] : []),
    `TOTAL: ${rp(o.total)}`,
    '',
    `Metode: ${o.methodLabel}`,
    '',
    `Nama: ${o.nama}`,
    `WhatsApp: ${o.wa}`,
    `Email: ${o.email}`,
    ...(o.alamat ? [`Alamat: ${o.alamat}, ${o.kota} ${o.pos}`] : ['Pengambilan: di kantor REKAM']),
    ...(o.catatan ? [`Catatan: ${o.catatan}`] : []),
  ].join('\n');

  const targetBlock = (o) => {
    if (o.method === 'qris') {
      const img = CFG.qris && CFG.qris.image;
      return img
        ? `<img class="co-qr" src="${esc(img)}" alt="Kode QRIS ${esc((CFG.qris && CFG.qris.merchant) || 'REKAM')}" width="320" height="320">`
        : `<div class="co-qr co-qr--none">
             <p><strong>File QRIS belum dipasang.</strong></p>
             <p>Isi <code>qris.image</code> di <code>shop-config.js</code> dengan kode QRIS
                resmi dari acquirer REKAM. Kode QRIS tidak boleh dibuat sendiri —
                CRC di ujungnya ditandatangani penerbit.</p>
           </div>`;
    }
    const b = o.bank;
    if (!b) return '<p class="co-warn">Belum ada rekening di shop-config.js.</p>';
    return `
      <dl class="co-acct">
        <div><dt>Bank</dt><dd>${esc(b.name)}</dd></div>
        <div><dt>Nomor rekening</dt><dd>${b.account
          ? `<span class="co-acct__no">${esc(b.account)}</span>`
          : '<span class="co-warn">belum diisi di shop-config.js</span>'}</dd></div>
        <div><dt>Atas nama</dt><dd>${esc(b.holder || '—')}</dd></div>
      </dl>`;
  };

  const handoff = (o) => {
    const text = orderText(o);
    const bits = [];
    if (CFG.whatsapp) {
      bits.push(`<a class="btn btn--green" target="_blank" rel="noopener"
        href="https://wa.me/${esc(String(CFG.whatsapp).replace(/\D/g, ''))}?text=${encodeURIComponent(text)}">
        Konfirmasi via WhatsApp</a>`);
    }
    if (CFG.email) {
      bits.push(`<a class="btn btn--ghost-green"
        href="mailto:${esc(CFG.email)}?subject=${encodeURIComponent('Pesanan ' + o.code)}&body=${encodeURIComponent(text)}">
        Kirim via email</a>`);
    }
    bits.push('<button class="btn btn--ghost-green" type="button" id="co-copy">Salin rincian</button>');
    if (!CFG.whatsapp && !CFG.email) {
      bits.unshift(`<p class="co-warn co-warn--block">
        Kanal konfirmasi belum diisi. Lengkapi <code>whatsapp</code> atau
        <code>email</code> di <code>shop-config.js</code>, kalau tidak pembeli
        tidak punya cara mengirim bukti bayar.</p>`);
    }
    return bits.join('');
  };

  const submit = () => {
    const errBox = $('co-error');
    const bad = problems();
    if (bad.length) {
      errBox.hidden = false;
      errBox.textContent = 'Masih perlu dilengkapi: ' + bad.join(', ') + '.';
      errBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    errBox.hidden = true;

    const lines = read();
    if (!lines.length) return;

    const m = method();
    const sub = subtotal(lines);
    const uniq = m === 'bank' ? uniqOf(orderCode) : 0;
    const hours = +CFG.paymentWindowHours || 24;
    const due = new Date(Date.now() + hours * 3600 * 1000);

    const o = {
      code: orderCode,
      lines, sub, uniq,
      ship: ship(),
      total: sub + ship().cost + uniq,
      method: m,
      methodLabel: m === 'qris' ? 'QRIS (e-wallet / m-banking)' : `Transfer bank ${(bank() || {}).name || ''}`.trim(),
      bank: m === 'bank' ? bank() : null,
      nama: $('f-nama').value.trim(),
      wa: $('f-wa').value.trim(),
      email: $('f-email').value.trim(),
      alamat: ship().id === 'pickup' ? '' : $('f-alamat').value.trim(),
      kota: $('f-kota').value.trim(),
      pos: $('f-pos').value.trim(),
      catatan: $('f-catatan').value.trim(),
    };

    const steps = o.method === 'qris'
      ? ['Buka DANA, GoPay, OVO, ShopeePay, LinkAja, atau aplikasi m-banking Anda.',
         'Pilih menu bayar / scan QRIS, arahkan ke kode di atas.',
         `Pastikan nominal terbaca <strong>${rp(o.total)}</strong> sebelum dikonfirmasi.`,
         'Simpan tangkapan layar bukti bayar.',
         'Kirim bukti beserta kode pesanan lewat tombol di bawah.']
      : ['Buka aplikasi m-banking atau ATM.',
         'Transfer ke rekening di atas.',
         `Isi nominal <strong>${rp(o.total)}</strong> — persis, termasuk tiga angka terakhir.`,
         'Simpan bukti transfer.',
         'Kirim bukti beserta kode pesanan lewat tombol di bawah.'];

    $('co-out-body').innerHTML = `
      <dl class="co-meta">
        <div><dt>Kode pesanan</dt><dd class="co-meta__code">${esc(o.code)}</dd></div>
        <div><dt>Bayar sebelum</dt><dd>${due.toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })} WIB</dd></div>
        <div><dt>Metode</dt><dd>${esc(o.methodLabel)}</dd></div>
      </dl>

      <p class="co-amount">
        <span>Jumlah yang dibayar</span>
        <strong>${rp(o.total)}</strong>
        ${o.uniq ? `<em>termasuk kode unik ${o.uniq} — jangan dibulatkan</em>` : ''}
      </p>

      ${targetBlock(o)}

      <ol class="co-how">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>

      <div class="co-hand">${handoff(o)}</div>

      <p class="co-out__foot">
        Pesanan belum tercatat di sistem mana pun sampai tim REKAM menerima
        bukti bayar Anda — halaman ini tidak punya server yang bisa
        memverifikasinya sendiri.
        <button class="co-link" type="button" id="co-unlock">Ubah pesanan</button>
      </p>`;

    $('co-out').hidden = false;
    locked = true;
    for (const el of form.elements) el.disabled = true;
    for (const el of document.querySelectorAll('#co-pay input, #f-setuju')) el.disabled = true;
    $('co-submit').hidden = true;
    paint();
    $('co-out').scrollIntoView({ block: 'start', behavior: 'smooth' });
    say(`Instruksi pembayaran ${o.code} dibuat.`);

    const copy = $('co-copy');
    if (copy) {
      copy.addEventListener('click', async () => {
        const text = orderText(o);
        try {
          await navigator.clipboard.writeText(text);
          copy.textContent = 'Tersalin';
        } catch {
          // Clipboard needs a secure context; fall back to a selectable box.
          const ta = document.createElement('textarea');
          ta.className = 'co-fallback';
          ta.readOnly = true;
          ta.value = text;
          copy.after(ta);
          ta.select();
          copy.textContent = 'Salin manual dari kotak ini';
        }
        setTimeout(() => { copy.textContent = 'Salin rincian'; }, 2500);
      });
    }

    $('co-unlock').addEventListener('click', () => {
      locked = false;
      for (const el of form.elements) el.disabled = false;
      for (const el of document.querySelectorAll('#co-pay input, #f-setuju')) el.disabled = false;
      document.querySelector('input[name="metode"][value="gpay"]').disabled = true;
      $('co-out').hidden = true;
      $('co-submit').hidden = false;
      // A changed order must not keep the old code: the unique suffix and the
      // total are tied to it, and a stale pair is what makes a transfer
      // impossible to reconcile.
      orderCode = orderCode.replace(/-[A-Z0-9]{4}$/, '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
      paint();
      $('co-submit').scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  $('co-submit').addEventListener('click', submit);
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });

  /* If nothing in config is filled in, say so once at the top rather than
     letting the buyer discover it at the last step. */
  const unset = [];
  if (!(CFG.qris && CFG.qris.image)) unset.push('QRIS');
  if (!banks.some((b) => b.account)) unset.push('rekening bank');
  if (!CFG.whatsapp && !CFG.email) unset.push('kanal konfirmasi');
  if (unset.length) {
    $('co-notice').innerHTML = `Belum siap terima pembayaran: ${unset.join(', ')} belum diisi
      di <code>shop-config.js</code>. Alur di bawah tetap bisa dicoba.`;
  }

  paint();
})();
