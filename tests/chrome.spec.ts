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
    const parent = page.getByRole('link', { name: 'Event', exact: true });
    await expect(parent).toHaveAttribute('href', '/event');

    const chevron = page.getByRole('button', { name: 'Buka submenu Event' });
    await expect(chevron).toHaveAttribute('aria-expanded', 'false');

    await chevron.click();
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menuitem', { name: 'Cerita Laut Nusantara' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });

  test('only one submenu is open at a time', async ({ page }) => {
    await page.goto('/donasi');
    await page.getByRole('button', { name: 'Buka submenu Event' }).click();
    await expect(page.getByRole('menuitem', { name: 'Cerita Laut Nusantara' })).toBeVisible();

    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Buka submenu Donasi' }).click();
    await expect(page.getByRole('menuitem', { name: 'Adopsi Pohon Pakan' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Cerita Laut Nusantara' })).toHaveCount(0);
  });
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

/* Escape hatch for accessibility failures that are genuinely inherited and
 * genuinely un-fixable, recorded per rule with the nodes they cover. Listing
 * them beats deleting the assertion, which would blind the gate entirely.
 *
 * It is currently empty, and that is the interesting part. The source design
 * shipped four WCAG AA contrast failures — confirmed by running these same
 * rules against the old static site, where donasi.html and index.html report
 * color-contrast on the footer blurb, copyright and heading, plus the language
 * toggle. The cause was the palette: cream on --green-900 (#2C7A56) is 4.66:1
 * at FULL opacity, so text at 0.55-0.78 could not pass. They are fixed rather
 * than tolerated — see SiteFooter.tsx.
 */
const INHERITED: Record<string, string[]> = {
  /* Empty on purpose. The four contrast failures the source design shipped are
     fixed rather than carried over: the footer sits on --green-800 and the
     language toggle uses --ink-soft. Kept as a mechanism, not deleted, so a
     genuinely un-fixable inherited issue can be recorded here with its reason
     instead of the whole assertion being weakened. */
};

test.describe('accessibility', () => {
  for (const path of [
    '/',
    '/donasi',
    '/design',
    '/berita',
    '/berita/rekam-di-icrs-2026-membawa-neraca-sumber-daya-laut-indonesia-ke-panggung-global',
    '/event',
    '/event/cerita-laut-nusantara',
  ]) {
    test(`${path} has no NEW axe violations`, async ({ page }) => {
      await page.goto(path);
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
