import { test, expect, type Locator } from '@playwright/test';

const filterOf = (loc: Locator) => loc.evaluate((el) => getComputedStyle(el).filter);
const belowFold = '[data-group="research"] .card';

test('cards below the fold start blurred and sharpen when scrolled into view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/focus-ready/);
  const card = page.locator(belowFold).first();
  expect(await filterOf(card)).toContain('blur');
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => filterOf(card), { timeout: 3000 }).toBe('none');
});

test('the name sharpens after load', async ({ page }) => {
  await page.goto('/');
  const name = page.locator('.hero-blur');
  expect(await name.evaluate((el) => el.getAnimations().length)).toBe(1);
  await expect.poll(() => filterOf(name), { timeout: 4000 }).toBe('none');
});

test('print shows below-the-fold cards sharp', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/focus-ready/);
  const card = page.locator(belowFold).first();
  expect(await filterOf(card)).toContain('blur');
  await page.emulateMedia({ media: 'print' });
  expect(await filterOf(card)).toBe('none');
});

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('nothing is blurred or animated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/focus-ready/);
    expect(await filterOf(page.locator(belowFold).first())).toBe('none');
    expect(await filterOf(page.locator('.hero-blur'))).toBe('none');
    expect(await page.locator('.hero-blur').evaluate((el) => el.getAnimations().length)).toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('everything is sharp', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/focus-ready/);
    expect(await filterOf(page.locator(belowFold).first())).toBe('none');
    expect(await filterOf(page.locator('.hero-blur'))).toBe('none');
  });
});
