import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

test('home head has title, description, canonical and Open Graph tags', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(site.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', site.description);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://goldenwo.dev/');
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
    await expect(page.locator(`meta[property="${prop}"]`), prop).toHaveCount(1);
  }
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://goldenwo.dev/og-image.png');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

test('JSON-LD describes the person', async ({ page }) => {
  await page.goto('/');
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '');
  expect(data).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: 'https://goldenwo.dev/',
    jobTitle: site.jobTitle,
    sameAs: [site.links.linkedin, site.links.github],
  });
  expect(data.image).toMatch(/^https:\/\/goldenwo\.dev\/_astro\/.+\.jpg$/);
});

test('static assets are served', async ({ request }) => {
  for (const path of ['/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/og-image.png', '/robots.txt', '/art/raccoon-heist-feature.png']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('unknown paths get the 404 page, without canonical or JSON-LD', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nothing here.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('skip link targets main content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);
});
