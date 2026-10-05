import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  for (const width of [390, 1280]) {
    test(`no serious or critical accessibility violations (${colorScheme}, ${width}px)`, async ({ page }) => {
      // Reduced motion keeps everything sharp, so axe can measure contrast.
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const blocking = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(blocking).toEqual([]);
    });
  }
}
