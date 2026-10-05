import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

/** Parses Cloudflare's _headers format: a path line, then indented "Name: value" lines. */
function parseHeaders(text: string): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const colon = line.indexOf(':');
    current?.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
  }
  return rules;
}

const rules = existsSync('public/_headers') ? parseHeaders(readFileSync('public/_headers', 'utf8')) : new Map();

test('every response gets the security headers', () => {
  expect(Object.fromEntries(rules.get('/*') ?? [])).toEqual({
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    'cross-origin-opener-policy': 'same-origin',
  });
});

test('hashed build assets are cached for a year', () => {
  expect(rules.get('/_astro/*')?.get('cache-control')).toBe('public, max-age=31536000, immutable');
});
