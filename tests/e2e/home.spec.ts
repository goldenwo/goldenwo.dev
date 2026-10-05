import { test, expect } from '@playwright/test';
import { findPrivateData } from '../../src/privacy.mjs';
import { roles } from '../../src/data/experience';
import { groups, projects } from '../../src/data/projects';
import { site } from '../../src/data/site';
import { studio } from '../../src/data/studio';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('hero names the person, with headline, bio, photo and profile links', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.name);
  await expect(page.locator('.hero .headline')).toHaveText(site.headline);
  await expect(page.locator('.hero .bio')).toHaveText(site.bio);
  await expect(page.locator('.hero img')).toHaveAttribute('alt', site.photoAlt);
  await expect(page.locator(`.hero a[href="${site.links.linkedin}"]`)).toHaveText('LinkedIn');
  await expect(page.locator(`.hero a[href="${site.links.github}"]`)).toHaveText('GitHub');
});

test('the résumé button follows site.resumePdf', async ({ page }) => {
  const button = page.getByRole('link', { name: 'Résumé (PDF)' });
  if (site.resumePdf) await expect(button).toHaveAttribute('href', site.resumePdf);
  else await expect(button).toHaveCount(0);
});

test('experience lists every role in order', async ({ page }) => {
  await expect(page.locator('#experience h3')).toHaveText(roles.map((r) => `${r.title} · ${r.org}`));
  await expect(page.locator('#experience .when')).toHaveText(roles.map((r) => r.when));
});

test('the Blindly section links the studio and its game', async ({ page }) => {
  const section = page.locator('#blindly');
  await expect(section.locator('.chip')).toHaveText(studio.role);
  await expect(section.locator(`a[href="${studio.url}"]`)).toHaveCount(1);
  await expect(section.locator(`a[href="${studio.featured.url}"]`)).toHaveCount(1);
  await expect(section.locator('img')).toHaveAttribute('alt', studio.featured.art.alt);
});

test('projects appear in their groups, in order', async ({ page }) => {
  await expect(page.locator('#projects h3')).toHaveText(groups.map((g) => g.title));
  for (const g of groups) {
    await expect(page.locator(`[data-group="${g.id}"] h4`)).toHaveText(projects.filter((p) => p.group === g.id).map((p) => p.name));
  }
});

test('project links name their project for screen readers', async ({ page }) => {
  const feed = projects.find((p) => p.id === 'ai-x-feed')!;
  await expect(page.getByRole('link', { name: 'Live for ai-x-feed' })).toHaveAttribute('href', feed.links.site!);
  await expect(page.getByRole('link', { name: 'Source for ai-x-feed' })).toHaveAttribute('href', feed.links.source!);
});

test('every in-page link points at an element that exists', async ({ page }) => {
  const hrefs = await page.locator('a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) await expect(page.locator(href), href).toHaveCount(1);
});

test('every image has alt text', async ({ page }) => {
  const missing = await page.locator('img').evaluateAll((imgs) =>
    imgs.filter((i) => !(i.getAttribute('alt') ?? '').trim()).map((i) => i.getAttribute('src')),
  );
  expect(missing).toEqual([]);
});

test('no email address or phone number anywhere on the page', async ({ page }) => {
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
  expect(findPrivateData(await page.content())).toEqual([]);
});

for (const [width, columns] of [[375, 1], [768, 2], [1280, 3]] as const) {
  test(`project grids use ${columns} column(s) at ${width}px with no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const tracks = await page
      .locator('#projects .grid')
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(tracks).toBe(columns);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('the hero stacks the photo above the name on phones and beside it on desktop', async ({ page }) => {
  const photo = page.locator('.hero img');
  const name = page.getByRole('heading', { level: 1 });
  await page.setViewportSize({ width: 375, height: 900 });
  expect((await photo.boundingBox())!.y + (await photo.boundingBox())!.height).toBeLessThanOrEqual((await name.boundingBox())!.y);
  await page.setViewportSize({ width: 1280, height: 900 });
  expect((await photo.boundingBox())!.x + (await photo.boundingBox())!.width).toBeLessThanOrEqual((await name.boundingBox())!.x);
});
