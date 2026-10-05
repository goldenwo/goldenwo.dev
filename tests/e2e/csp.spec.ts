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
}

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
