/* Screenshot capture for the visual-regression baseline.
 *
 *   node scripts/shoot.mjs <base-url> <out-dir> [path ...]
 *
 * Constraints that are not optional, all of them learned from this codebase:
 *
 * - reducedMotion: 'reduce'. The live stylesheets carry 30 animation/transition
 *   declarations and 5 @keyframes; without this the shots race the animations.
 * - #stage is masked on the four hero pages. hero-360.js has six unseeded
 *   Math.random() calls and pano-scenes.js one more at :544, on top of WebGL
 *   and rAF — that surface is fundamentally un-diffable.
 * - The mouse is never moved. cursor.js draws a follower disc that only exists
 *   once a pointer event has fired.
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const WIDTHS = [390, 768, 1440];
const SETTLE_MS = 1200;

const [baseUrl, outDir, ...paths] = process.argv.slice(2);
if (!baseUrl || !outDir || !paths.length) {
  console.error('usage: node scripts/shoot.mjs <base-url> <out-dir> <path>...');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();

for (const p of paths) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    const url = new URL(p, baseUrl).href;
    /* domcontentloaded, not networkidle: next/image generates each optimised
       variant on first request, so a cold page can sit well past the default
       navigation timeout while the loader works. Settling explicitly afterwards
       is both faster and more predictable. */
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);

    const stage = await page.locator('#stage').count();
    const name = (p.replace(/\.html$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'index') + `@${width}.png`;

    await page.screenshot({
      path: path.join(outDir, name),
      fullPage: true,
      mask: stage ? [page.locator('#stage')] : [],
      animations: 'disabled',
    });
    console.log(`  ${name}`);
  }
}

await browser.close();
