// scripts/screenshots.mjs: full-page screenshots for visual sign-off, written to screenshots/ (gitignored).
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { startPreview } from './preview-server.mjs';

const { url, stop } = await startPreview(4323);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
await mkdir('screenshots', { recursive: true });
try {
  for (const width of [375, 768, 1280]) {
    for (const colorScheme of ['light', 'dark']) {
      // Reduced motion: everything sharp, as a reader sees it once scrolled into view.
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      // Lazy images (the studio art) may not have loaded yet: load and decode them so they are in the shot.
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map(async (img) => {
            img.loading = 'eager';
            await img.decode().catch(() => {});
          }),
        ),
      );
      // Grow the viewport to the page height: a full-page capture otherwise paints the fixed background
      // gradient over the first screen only, leaving a seam that no visitor ever sees.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width, height });
      await page.screenshot({ path: `screenshots/home-${width}-${colorScheme}.png`, fullPage: true });
      await page.close();
    }
  }
  // The first screen with motion on, a moment after load, to show the effect.
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/home-1280-light-motion.png' });
  await page.close();
} finally {
  await browser.close();
  stop();
}
console.log('wrote screenshots/');
