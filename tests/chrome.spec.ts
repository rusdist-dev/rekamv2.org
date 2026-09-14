import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/* Interaction and accessibility cover for the shared chrome.
 *
 * These are the checks no rendered-HTML diff can make, and they matter more
 * here than in a normal rewrite: the old site's accessibility was its strongest
 * asset — roving-tabindex tablist, native <dialog>, bios readable inside
 * <details> with JS off, aria-controls used consistently throughout. A rewrite
 * that loses any of that is a regression, not a fresh start. */

const DESKTOP_ONLY = 'desktop';
const MOBILE_ONLY = 'mobile';

test.describe('skip link', () => {
  test('is the first tab stop and targets main', async ({ page }) => {
    await page.goto('/donasi');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Lewati ke konten utama');
    await expect(focused).toHaveAttribute('href', '#utama');
    // Off-screen until focused, then pinned to the top.
    await expect(focused).toBeInViewport();
    await expect(page.locator('main#utama')).toBeVisible();
  });
});

test.describe('rail', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== DESKTOP_ONLY, 'rail is desktop-only');
  });

  test('marks the current page and no other', async ({ page }) => {
    await page.goto('/donasi');
    const current = page.locator('nav a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText('Donasi');
  });

  test('submenu opens from the chevron while the parent stays a link', async ({ page }) => {
    await page.goto('/donasi');

    // The parent is a real link, not a disclosure button — that was a
    // deliberate call in the original and is preserved.
    const parent = page.getByRole('link', { name: 'Kegiatan', exact: true });
    await expect(parent).toHaveAttribute('href', '/event');

    const chevron = page.getByRole('button', { name: 'Buka submenu Kegiatan' });
    await expect(chevron).toHaveAttribute('aria-expanded', 'false');

    await chevron.click();
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menuitem', { name: 'Side Event ICMMBT 2025' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });

  test('only one submenu is open at a time', async ({ page }) => {
    await page.goto('/donasi');
    await page.getByRole('button', { name: 'Buka submenu Kegiatan' }).click();
    await expect(page.getByRole('menuitem', { name: 'Side Event ICMMBT 2025' })).toBeVisible();

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Buka submenu Donasi' }).click();
    await expect(page.getByRole('menuitem', { name: 'Adopsi Pohon Pakan' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Side Event ICMMBT 2025' })).toHaveCount(0);
  });
});

test.describe('navigation scroll', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== DESKTOP_ONLY, 'hero pills are desktop-only');
  });

  /* Regression: clicking a programme pill used to land near the BOTTOM of the
     destination page. SiteShell returned a fragment, so the App Router found
     five top-level scroll candidates and called scrollIntoView on each; under
     scroll-behavior: smooth they raced and the footer's animation sometimes
     won. It was height-dependent, so /program/ocean (the tallest) failed every
     time while the shorter pages never did — see SiteShell.tsx. */
  for (const name of ['Forest', 'Urban', 'Ocean']) {
    test(`${name} lands at the top of the page`, async ({ page }) => {
      await page.goto('/');
      await page.locator('header a').filter({ hasText: new RegExp(`^${name}$`) }).first().click();
      await page.waitForURL(/\/program\//);
      await page.waitForTimeout(1500); // let any smooth scroll finish
      expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    });
  }
});

test.describe('drawer', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== MOBILE_ONLY, 'drawer is narrow-screen only');
  });

  test('opens, closes on Escape, and closes on navigation', async ({ page }) => {
    await page.goto('/donasi');

    const toggle = page.getByRole('button', { name: 'Buka menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#nav-drawer')).toHaveCount(0);

    await toggle.click();
    await expect(page.locator('#nav-drawer')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tutup menu' })).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(page.locator('#nav-drawer')).toHaveCount(0);

    // Following a link closes it, which matters most here where the open panel
    // covers the page.
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await page.locator('#nav-drawer').getByRole('link', { name: 'Berita' }).click();
    await expect(page).toHaveURL(/\/berita$/);
    await expect(page.locator('#nav-drawer')).toHaveCount(0);
  });

  test('drawer exposes the group labels the rail hides', async ({ page }) => {
    await page.goto('/donasi');
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await expect(page.locator('#nav-drawer')).toContainText('Program');
    await expect(page.locator('#nav-drawer')).toContainText('Jelajahi');
  });
});

/* Per-rule allowance, matched against the offending node's HTML. Listing an
 * exception beats deleting the assertion, which would blind the gate. */
const INHERITED: Record<string, string[]> = {
  /* The four contrast failures the source design shipped are fixed rather than
     carried over — the footer sits on --green-800 and the language toggle uses
     --ink-soft. The one entry below is not an inherited defect but a tool
     false positive, and it is here with its evidence rather than the assertion
     being weakened.

     The unit suffix on the impact stat cards ("35 km", "512,2 ton") is reported
     as white on #f5f4f4 at 1.09:1. It is not. Measured in the browser, both
     spans return insideCard: true and their card's computed background is
     rgb(95,119,163) and rgb(170,81,9) — white on those is 4.51 and 5.40, which
     pass. axe's background resolution gives up on these very small spans inside
     a flex container within a transitioned link and falls back to the document
     ground. Re-check if the markup around them changes. */
  'color-contrast': ['text-[0.3em]'],
};

test.describe('accessibility', () => {
  for (const path of [
    '/',
    '/donasi',
    '/design',
    '/berita',
    '/berita/rekam-di-icrs-2026-membawa-neraca-sumber-daya-laut-indonesia-ke-panggung-global',
    '/event',
    '/event/side-event-icmmbt-2025',
    '/program/forest',
    '/program/ocean',
    '/merch',
    '/checkout',
    '/tentang',
  ]) {
    test(`${path} has no NEW axe violations`, async ({ page }) => {
      await page.goto(path);

      /* Wait for the 360-degree hero to settle before auditing. It paints four
         procedural canvases at up to 4096px and holds a loader overlay while it
         works, so auditing straight after load measures a transient state that
         no reader sees for more than a moment. Pages without a hero skip this
         immediately. */
      const loader = page.locator('#hero [role="status"]');
      if (await loader.count()) {
        /* A hero page needs more than the 30s default, and the reason is
           arithmetic rather than caution: the settle wait alone allows 20s, so
           under GPU contention the audit itself has under 10s left and the test
           times out with nothing to show. Raising the budget for exactly these
           pages is honest about the contention documented in
           playwright.config.ts — a retry cannot fix a timeout that the timeout
           itself caused. */
        test.setTimeout(90_000);
        await loader.waitFor({ state: 'detached', timeout: 20_000 });
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const unexpected = results.violations.flatMap((v) => {
        const allowed = INHERITED[v.id];
        if (!allowed) return [{ rule: v.id, html: v.nodes[0]?.html }];
        return v.nodes
          .filter((n) => !allowed.some((cls) => n.html.includes(cls)))
          .map((n) => ({ rule: v.id, html: n.html }));
      });

      expect(unexpected).toEqual([]);
    });
  }
});
