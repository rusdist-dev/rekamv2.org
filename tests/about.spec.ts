import { expect, test } from '@playwright/test';

/* The about page carries the four hardest pieces on the site. These are the
 * checks the migration plan called out by name, because each covers something
 * that failed silently in the source. */

test.describe('about', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one viewport is enough');
  });

  test('org chart opens the RIGHT person, including the two whose names drifted', async ({ page }) => {
    await page.goto('/tentang');

    /* This is the one that mattered. The source joined the chart to the bios by
       matching data-person against the team section's rendered text, and two
       entries disagreed:
         data-person="Yoki Hadiprakarsa"  rendered "Yok Yok Hadiprakarsa"
         data-person="Oktavianto Prastyo" rendered "Octavianto P. Darmono"
       rekam.js:290 did `if (!trigger) continue`, so those two names were
       silently not clickable and nothing indicated why. Resolving on the key
       while displaying the rendered name fixes the link without changing the
       page. */
    const drifted = page.getByRole('button', { name: 'Baca profil Yok Yok Hadiprakarsa' });
    await expect(drifted).toBeVisible();
    await drifted.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // The profile that opens must be that person's, not a neighbour's.
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Yoki Hadiprakarsa');
  });

  test('a name with no profile stays plain text, as before', async ({ page }) => {
    await page.goto('/tentang');
    // Four org names have no bio written; the source left them unlinked.
    await expect(page.getByRole('button', { name: 'Baca profil Prayekti Ningtias' })).toHaveCount(0);
    // Present in the HTML — its unit is collapsed, so not visible until opened.
    await expect(page.getByText('Prayekti Ningtias')).toHaveCount(1);
  });

  test('manager counts are derived, not typed', async ({ page }) => {
    await page.goto('/tentang');
    await page.getByRole('button', { name: 'Buka semua' }).click();

    /* The source typed <span class="orgunit__count">N</span> by hand beside a
       list it could not see, so the two were free to disagree. Compare each
       stated count against the rows actually rendered. */
    const triggers = page.getByRole('button', { name: /\d+ manajer/ });
    const n = await triggers.count();
    expect(n).toBe(4);

    for (let i = 0; i < n; i++) {
      const stated = Number((await triggers.nth(i).textContent())!.match(/\d+/)![0]);
      const panelId = await triggers.nth(i).getAttribute('aria-controls');
      const rows = await page.locator(`#${panelId} li`).count();
      expect(stated).toBe(rows);
    }
  });

  test('bio dialog steps between people and closes on Escape', async ({ page }) => {
    await page.goto('/tentang');
    // The name appears in the org chart and in the team grid; either opens it.
    await page.getByRole('button', { name: 'Baca profil Irfan Yulianto' }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const heading = dialog.getByRole('heading', { level: 2 });
    await expect(heading).toHaveText('Irfan Yulianto');

    await dialog.getByRole('button', { name: 'Berikutnya →' }).click();
    await expect(heading).not.toHaveText('Irfan Yulianto');

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('every bio is in the HTML, so the page reads without JavaScript', async ({ browser }) => {
    /* The source put each bio inside <details> precisely so it survived with
       JS off. A dialog that fetched its content on open would have dropped
       that quietly, so the bios are server-rendered. */
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/tentang');

    await expect(page.getByText('Dr. Irfan Yulianto currently works at', { exact: false })).not.toHaveCount(0);
    /* And every strategy panel, not just the selected one — Radix mounts one
       at a time unless forceMount is set, which would have dropped three
       quarters of this copy from the HTML. */
    for (const text of [
      'Jejaring, kolaborasi, dan penguatan kapasitas',
      'Sains, teknologi, seni, media, dan komunikasi',
      'Konservasi di tapak dan kebijakan',
      'Capaian konservasi dan dampak sosial-ekonomi',
    ]) {
      await expect(page.getByText(text, { exact: false })).not.toHaveCount(0);
    }
    await ctx.close();
  });

  test('street view loads nothing until asked', async ({ page }) => {
    const googleRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('googleapis') || r.url().includes('google.com')) googleRequests.push(r.url());
    });

    await page.goto('/tentang');
    await page.waitForTimeout(1500);

    /* Cost and privacy, both: dynamic Street View bills per panorama load, and
       fetching Google's script hands over the visitor's IP. Neither should
       happen to someone who merely scrolled past. */
    expect(googleRequests).toEqual([]);
    await expect(page.getByRole('button', { name: 'Buka Street View' })).toBeDisabled();
  });
});
