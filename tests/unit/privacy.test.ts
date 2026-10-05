import { describe, expect, test } from 'vitest';
import { findPrivateData } from '../../src/privacy.mjs';

describe('findPrivateData', () => {
  test.each(['(617) 555-0123', '617-555-0123', '617.555.0123', '617 555 0123', '+1 617 555 0123', '+1-617-555-0123'])(
    'finds the phone number %s',
    (phone) => {
      expect(findPrivateData(`call ${phone} today`)).toEqual([{ kind: 'phone', count: 1 }]);
    },
  );

  test('finds email addresses', () => {
    expect(findPrivateData('mail someone@example.com or a.b+c@sub.example.org')).toEqual([{ kind: 'email', count: 2 }]);
  });

  test.each([
    '2018, 2021',
    '2023 – now',
    'Jan. 2023 - Present',
    "'sha256-+/LQBSJqJZrp5StU3GEBN6qnKpYPnt0RHliSjOdyJBc='",
    'max-age=63072000',
    '1024 × 500',
    'https://www.linkedin.com/in/goldenwo/',
    '@media (min-width: 640px)',
    'used by 5+ teams with < 100 ms latency',
  ])('ignores %s', (text) => {
    expect(findPrivateData(text)).toEqual([]);
  });

  test('reports counts, never the values', () => {
    expect(JSON.stringify(findPrivateData('someone@example.com 617-555-0123'))).not.toMatch(/example|555/);
  });

  test('skips allowlisted values', () => {
    expect(findPrivateData('617-555-0123', ['617-555-0123'])).toEqual([]);
  });
});
