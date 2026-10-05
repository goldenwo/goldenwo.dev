import { createHash } from 'node:crypto';
import { test, expect } from '@playwright/test';

const sha256 = (source: string) => `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
const DIRECTIVES = ["default-src 'self'", "img-src 'self'", "font-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"];

for (const path of ['/', '/does-not-exist']) {
  test(`${path} has a CSP that covers every executable inline script`, async ({ page }) => {
    await page.goto(path);
    const csp = (await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content')) ?? '';
    for (const directive of DIRECTIVES) expect(csp, directive).toContain(directive);
    const inline = await page
      .locator('script:not([src])')
      .evaluateAll((els) => (els as HTMLScriptElement[]).filter((s) => !s.type || s.type === 'module').map((s) => s.textContent ?? ''));
    expect(inline.length).toBeGreaterThan(0);
    for (const source of inline) expect(csp, source.slice(0, 50)).toContain(sha256(source));
  });

  test(`${path} puts the CSP before every executable script, so the policy governs them all`, async ({ page }) => {
    await page.goto(path);
    const ungoverned = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="content-security-policy"]');
      if (!meta) return ['no CSP meta'];
      return [...document.querySelectorAll('script')]
        .filter((s) => !s.type || s.type === 'module')
        .filter((s) => !(meta.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING))
        .map((s) => (s.src || s.textContent || '').slice(0, 50));
    });
    expect(ungoverned).toEqual([]);
  });
}

test('the inline js-class script runs under the policy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\bjs\b/);
});

test('nothing violates the CSP while the page loads and scrolls', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { cspViolations: string[] };
    w.cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => w.cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations)).toEqual([]);
});
