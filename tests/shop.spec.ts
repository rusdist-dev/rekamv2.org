import { expect, test } from '@playwright/test';

/* The cart round-trip.
 *
 * The migration plan called this the decisive check for the shop, because the
 * old storage format baked a VISIBLE label into the key:
 *
 *     select.dataset.opt + ': ' + select.value      // "Ukuran: L"
 *
 * so renaming or translating that label would have silently orphaned every
 * returning visitor's cart. v2 stores {productId, option, qty} and references
 * the catalogue by id; these tests assert that shape directly, because it is
 * the thing that must not regress. */

const KEY = 'rekam.cart.v2';

test.describe('cart', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one viewport is enough for storage behaviour');
  });

  test('survives a reload and carries into checkout', async ({ page }) => {
    await page.goto('/merch');

    const withOption = page.locator('article').filter({ has: page.locator('select') }).first();
    const name = (await withOption.locator('h3').textContent())!.trim();
    await withOption.locator('select').selectOption({ index: 1 });
    const option = await withOption.locator('select').inputValue();
    await withOption.getByRole('button', { name: `Tambah ${name} ke keranjang`, exact: true }).click();

    // Stored by id, with the option as data rather than part of the key.
    const stored = JSON.parse((await page.evaluate((k) => localStorage.getItem(k), KEY))!);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ option, qty: 1 });
    expect(typeof stored[0].productId).toBe('string');
    expect(JSON.stringify(stored)).not.toContain(': ');

    await page.reload();
    await expect(page.getByRole('link', { name: 'Lanjut ke pembayaran' })).toBeVisible();

    await page.getByRole('link', { name: 'Lanjut ke pembayaran' }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(option, { exact: false }).first()).toBeVisible();
  });

  test('ignores a v1 payload instead of choking on it', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/merch');
    // The old format: a concatenated display key, no productId anywhere.
    await page.evaluate(() =>
      localStorage.setItem('rekam.cart.v1', JSON.stringify([{ key: 'kaos-merekam::Ukuran: L', qty: 2 }]))
    );
    await page.reload();

    await expect(page.getByRole('link', { name: 'Lanjut ke pembayaran' })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('an empty checkout says so rather than showing a broken form', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByText('Keranjang masih kosong')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lihat katalog' })).toBeVisible();
  });

  /* Content parity for the checkout, done here rather than in
     scripts/check-parity.mjs. That script compares fetched HTML, and this
     page's real content only exists once there is a cart: the old
     checkout.html shipped the order table, the buyer form and the payment
     block on every visit and let JS hide them, so a fetch of the new page sees
     only the empty state and reports ~56 blocks "missing". Driving a real cart
     is the only way to compare like with like. */
  test('a populated checkout carries the copy the old page had', async ({ page }) => {
    await page.goto('/merch');
    const card = page.locator('article').first();
    const name = (await card.locator('h3').textContent())!.trim();
    await card.getByRole('button', { name: `Tambah ${name} ke keranjang`, exact: true }).click();
    await page.goto('/checkout');

    for (const text of [
      'Selesaikan pesanan',
      'Pesanan',
      'Data pembeli',
      'Pembayaran',
      'Nama lengkap',
      'WhatsApp',
      'Email',
      'Pengiriman',
      'Subtotal',
      'Total',
    ]) {
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    }

    // Every shipping tier the config offers is selectable.
    const options = await page.locator('#f-kirim option').allTextContents();
    expect(options).toHaveLength(4);
    expect(options.join(' ')).toContain('Jabodetabek');
  });

  test('the unfilled payment config is stated, not hidden', async ({ page }) => {
    await page.goto('/merch');
    const card = page.locator('article').first();
    const name = (await card.locator('h3').textContent())!.trim();
    await card.getByRole('button', { name: `Tambah ${name} ke keranjang`, exact: true }).click();
    await page.getByRole('link', { name: 'Lanjut ke pembayaran' }).click();

    /* The source's stance, kept: while an identifier is null the page says so.
       A fundraising page that prints a made-up account number is worse than one
       that prints none. */
    await expect(page.getByText('Belum diisi', { exact: false })).toBeVisible();
  });
});
