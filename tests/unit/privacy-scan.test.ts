import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { afterEach, expect, test } from 'vitest';

const dirs: string[] = [];
const fixture = (files: Record<string, string | Buffer>) => {
  const dir = mkdtempSync(join(tmpdir(), 'privacy-'));
  dirs.push(dir);
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
};
const scan = (dir: string) => spawnSync(process.execPath, ['scripts/privacy-scan.mjs', dir], { encoding: 'utf8' });
const pdfOf = async (html: string, title = '') => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
  try {
    const page = await browser.newPage();
    await page.setContent(`<title>${title}</title>${html}`);
    return await page.pdf();
  } finally {
    await browser.close();
  }
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

test('passes a clean build', () => {
  const result = scan(fixture({ 'index.html': '<p>Software engineer in Boston.</p>', _headers: '/*\n  X-Frame-Options: DENY\n' }));
  expect(result.status, result.stdout).toBe(0);
  expect(result.stdout).toContain('PASS privacy scan: 2 files');
});

test('fails on an email address in HTML, reporting the count but not the value', () => {
  const result = scan(fixture({ 'index.html': '<a href="mailto:someone@example.com">mail</a>' }));
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('1 email match(es)');
  expect(result.stdout).not.toContain('example.com');
});

test('fails on a phone number in a PDF', async () => {
  const result = scan(fixture({ 'resume.pdf': await pdfOf('<p>Call (617) 555-0123</p>') }));
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('1 phone match(es)');
}, 30_000);

test('fails on an email address in PDF metadata', async () => {
  const result = scan(fixture({ 'resume.pdf': await pdfOf('<p>Clean page</p>', 'someone@example.com') }));
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('email match(es)');
}, 30_000);

test('fails when there is nothing to scan', () => {
  const result = scan(fixture({}));
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('FAIL no files to scan');
});
