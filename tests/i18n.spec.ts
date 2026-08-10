import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/* The English locale.
 *
 * Content parity (scripts/check-parity.mjs) guards the Indonesian build against
 * the baseline and is the stronger check, but it can say nothing about /en —
 * there is no baseline to compare to. This is what holds that side up, and the
 * failures it is built to catch are the quiet ones:
 *
 *   - an internal link that forgot its prefix, which still answers 200 and just
 *     drops an English reader back onto the Indonesian page
 *   - <html lang> not following the locale, which is what screen readers use to
 *     pick a voice
 *   - the switcher losing your place and sending you to the home page
 *
 * check-links.mjs also walks both locales asserting the prefix on every page;
 * these tests cover what needs a real browser. */

const PAGES = ['/', '/tentang', '/berita', '/event', '/donasi', '/merch', '/program/forest'];

/* The switcher is not reachable from the same place at every width, and both
   reasons are faithful to the source rather than incidental:
     - On the four hero pages the header starts transparent, showing only the
       centred mark and the programme pills; the utility strip carrying search
       and language appears once the hero has scrolled past. So these tests use
       a page WITHOUT a hero.
     - Below 1000px the strip is not rendered at all and the switcher lives in
       the drawer, which has to be opened first. */
async function reachSwitcher(page: import('@playwright/test').Page, project: string) {
  if (project === 'mobile') {
    await page.getByRole('button', { name: /^(Buka menu|Open menu)$/ }).click();
    await expect(page.locator('#nav-drawer')).toBeVisible();
  }
}

test.describe('locale routing', () => {
  test('Indonesian stays unprefixed and English is prefixed', async ({ page }) => {
    await page.goto('/berita');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    expect(new URL(page.url()).pathname).toBe('/berita');

    await page.goto('/en/berita');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('/id/... redirects to the canonical unprefixed URL', async ({ page }) => {
    /* The default prefix must never survive in the address bar: the same page at
       two URLs competes with itself, and these eighteen articles have only just
       been given their first real URLs. */
    const response = await page.goto('/id/berita');
    expect(new URL(page.url()).pathname).toBe('/berita');
    expect(response?.status()).toBe(200);
  });

  test('an unknown locale is a 404, not the default locale in disguise', async ({ page }) => {
    const response = await page.goto('/xx/berita');
    expect(response?.status()).toBe(404);
  });

  test('the middleware does not rewrite files in public/', async ({ page }) => {
    /* Regression. The matcher used to name its exemptions one by one, so
       /logo-rekam.svg was rewritten to /id/logo-rekam.svg and 404'd — and
       because the brand mark is painted as a CSS background and alpha mask
       rather than an <img>, nothing reported a broken image. The logo was just
       gone from every page, in both locales. */
    for (const asset of ['/logo-rekam.svg', '/icon.svg', '/sitemap.xml', '/robots.txt']) {
      const response = await page.request.get(asset);
      expect(response.status(), `${asset} harus dilayani apa adanya`).toBe(200);
    }
  });

  test('the brand mark actually renders', async ({ page }) => {
    await page.goto('/berita');

    // The mark is a <span> with the SVG as its background, so "is it visible"
    // is not enough — an empty span passes that. Ask whether the browser
    // fetched the file.
    const loaded = await page.evaluate(async () => {
      const res = await fetch('/logo-rekam.svg');
      return { ok: res.ok, type: res.headers.get('content-type') ?? '' };
    });

    expect(loaded.ok).toBe(true);
    expect(loaded.type).toContain('svg');
  });
});

test.describe('language switcher', () => {
  test('keeps your place in both directions', async ({ page }, testInfo) => {
    /* The point of the test: it must land on /en/tentang, not on /en. The old
       toggle was an inert anchor that popped an alert, so there is no source
       behaviour to preserve here — only the obvious requirement that switching
       language does not also navigate you somewhere else. */
    await page.goto('/tentang');
    await reachSwitcher(page, testInfo.project.name);

    await page.getByRole('link', { name: 'Beralih ke EN' }).click();
    await expect(page).toHaveURL(/\/en\/tentang$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await reachSwitcher(page, testInfo.project.name);
    await page.getByRole('link', { name: 'Switch to ID' }).click();
    await expect(page).toHaveURL(/\/tentang$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  });

  test('marks the current language and offers only the other', async ({ page }, testInfo) => {
    await page.goto('/en/berita');
    await reachSwitcher(page, testInfo.project.name);

    const group = page.getByRole('group', { name: 'Choose language' }).first();

    // EN is the current one, so it is text rather than a link.
    await expect(group.getByText('EN', { exact: true })).toHaveAttribute('aria-current', 'true');
    await expect(group.getByRole('link', { name: 'Switch to ID' })).toBeVisible();
    await expect(group.getByRole('link', { name: /Switch to EN/ })).toHaveCount(0);
  });
});

test.describe('translated chrome', () => {
  test('the chrome is English and in the server HTML, not patched in after hydration', async ({
    page,
  }) => {
    /* With JavaScript off nothing hydrates, so whatever is on screen is what the
       server sent. usePathname resolves during SSR, which is the whole reason
       the locale can be read off the URL instead of threaded through fourteen
       pages — this is the test that says so. */
    await page.context().addInitScript(() => {});
    const response = await page.request.get('/en/berita');
    const html = await response.text();

    expect(html).toContain('Skip to main content');
    expect(html).toContain('Field Notes');
    expect(html).toContain('All rights reserved');
    expect(html).not.toContain('Lewati ke konten utama');
  });

  test('recovers index.html’s original English nav labels', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'rail is desktop-only');
    /* Not /en: the home page's header starts in its hero state, where the rail
       is hidden until the hero scrolls past. The labels are the same on every
       page, so a page without a hero tests the same thing without racing a
       scroll animation. */
    await page.goto('/en/berita');

    /* Not invented: index.html shipped exactly these while the other ten pages
       shipped Indonesian. The inconsistency is retired by making them the /en
       values rather than by deleting them. */
    for (const label of ['Who We Are', 'Field Notes', 'Whats On', 'Take Part']) {
      await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  });

  test('the skip link works on /en too', async ({ page }) => {
    await page.goto('/en/donasi');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Skip to main content');
    await expect(focused).toHaveAttribute('href', '#utama');
  });
});

test.describe('internal links stay on /en', () => {
  for (const path of PAGES) {
    test(`from ${path}`, async ({ page }) => {
      await page.goto(`/en${path === '/' ? '' : path}`);

      const hrefs = await page.locator('a[href^="/"]').evaluateAll((nodes) =>
        nodes.map((n) => ({
          href: n.getAttribute('href') ?? '',
          // The switcher's own link out to Indonesian is the one exception.
          hreflang: n.getAttribute('hreflang') ?? '',
        }))
      );

      const stray = hrefs
        .filter((a) => a.hreflang !== 'id')
        .filter((a) => !/^\/(en(?=$|[/#?])|_next|assets|icon\.svg)/.test(a.href))
        .map((a) => a.href);

      expect(stray, `tautan tanpa prefiks /en di /en${path}`).toEqual([]);
    });
  }
});

test.describe('hreflang', () => {
  test('every page points at both locales and x-default at Indonesian', async ({ page }) => {
    for (const path of ['/berita', '/en/berita']) {
      await page.goto(path);
      const alt = (hreflang: string) =>
        page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`).first();

      await expect(alt('id')).toHaveAttribute('href', /\/berita$/);
      await expect(alt('en')).toHaveAttribute('href', /\/en\/berita$/);
      await expect(alt('x-default')).toHaveAttribute('href', /\/berita$/);
    }
  });

  test('canonical follows the locale rather than pointing home', async ({ page }) => {
    await page.goto('/en/tentang');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/tentang$/);
  });
});

/* Same allowance as chrome.spec.ts, and for the same reason: the impact stat
   cards' unit suffix is reported as white on #f5f4f4 at 1.09:1, which it is
   not — measured in the browser both spans sit inside cards whose computed
   background is rgb(95,119,163) and rgb(170,81,9), giving 4.51 and 5.40. Listed
   with its evidence rather than weakening the assertion. */
const FALSE_POSITIVE: Record<string, string[]> = {
  'color-contrast': ['text-[0.3em]'],
};

test.describe('accessibility on /en', () => {
  for (const path of PAGES) {
    test(`axe reports no NEW violations on /en${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/en${path === '/' ? '' : path}`);

      // The hero paints four procedural canvases at up to 4096px behind a
      // loader; auditing before it settles measures a state no reader sees. Same
      // raised budget as chrome.spec.ts, and for the same reason stated there.
      const loader = page.locator('#hero [role="status"]');
      if (await loader.count()) {
        test.setTimeout(90_000);
        await loader.waitFor({ state: 'detached', timeout: 20_000 });
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const unexpected = results.violations.flatMap((v) => {
        const allowed = FALSE_POSITIVE[v.id];
        if (!allowed) return [{ rule: v.id, html: v.nodes[0]?.html }];
        return v.nodes
          .filter((n) => !allowed.some((cls) => n.html.includes(cls)))
          .map((n) => ({ rule: v.id, html: n.html }));
      });

      expect(unexpected).toEqual([]);
    });
  }
});
