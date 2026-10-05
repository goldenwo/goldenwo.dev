// scripts/verify-live.mjs: post-deploy checks for goldenwo.dev, its DNS, and the old goldenwo.github.io URL.
// `npm run verify:live -- --skip-old-url` skips the goldenwo.github.io stub check (before the stub is pushed).
import { Resolver } from 'node:dns/promises';

const skipOldUrl = process.argv.includes('--skip-old-url');
const resolver = new Resolver();
resolver.setServers(['1.1.1.1']);
let failed = false;

async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`PASS ${name}${detail ? ` (${detail})` : ''}`);
  } catch (error) {
    failed = true;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await check('apex serves the site over HTTPS with a CSP', async () => {
  const res = await fetch('https://goldenwo.dev/', { redirect: 'manual' });
  assert(res.status === 200, `status ${res.status}`);
  const html = await res.text();
  assert(html.includes('Software engineer in Boston'), 'page content missing');
  assert(html.includes('http-equiv="content-security-policy"'), 'CSP meta missing');
  return 'HTTP 200';
});
await check('security headers are set', async () => {
  const res = await fetch('https://goldenwo.dev/');
  const want = {
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'cross-origin-opener-policy': 'same-origin',
  };
  for (const [name, value] of Object.entries(want)) assert(res.headers.get(name) === value, `${name}: ${res.headers.get(name)}`);
  assert(res.headers.get('permissions-policy')?.includes('camera=()'), 'permissions-policy missing');
});
await check('hashed assets are cached immutably', async () => {
  const html = await (await fetch('https://goldenwo.dev/')).text();
  const asset = html.match(/\/_astro\/[^"'\s,]+/)?.[0];
  assert(asset, 'no /_astro/ asset referenced');
  const cache = (await fetch(`https://goldenwo.dev${asset}`)).headers.get('cache-control');
  assert(cache?.includes('immutable'), `cache-control ${cache}`);
  return asset;
});
await check('unknown paths return 404', async () => {
  const res = await fetch('https://goldenwo.dev/does-not-exist', { redirect: 'manual' });
  assert(res.status === 404, `status ${res.status}`);
});
await check('www redirects to the apex with a 301, keeping path and query', async () => {
  const res = await fetch('https://www.goldenwo.dev/some/path?x=1', { redirect: 'manual' });
  const location = res.headers.get('location');
  assert(res.status === 301, `status ${res.status}`);
  assert(location === 'https://goldenwo.dev/some/path?x=1', `location ${location}`);
  return location;
});
await check('http upgrades to https', async () => {
  const res = await fetch('http://goldenwo.dev/', { redirect: 'manual' });
  const location = res.headers.get('location');
  assert([301, 308].includes(res.status), `status ${res.status}`);
  assert(location === 'https://goldenwo.dev/', `location ${location}`);
});
await check('null MX (the domain receives no mail)', async () => {
  const mx = await resolver.resolveMx('goldenwo.dev');
  assert(mx.length === 1 && mx[0].priority === 0 && mx[0].exchange === '', JSON.stringify(mx));
});
await check('SPF allows no senders', async () => {
  const txt = (await resolver.resolveTxt('goldenwo.dev')).map((parts) => parts.join(''));
  assert(txt.includes('v=spf1 -all'), txt.join(' | '));
});
await check('DMARC rejects spoofed mail', async () => {
  const txt = (await resolver.resolveTxt('_dmarc.goldenwo.dev')).map((parts) => parts.join(''));
  assert(txt.some((t) => t.startsWith('v=DMARC1') && /\bp=reject\b/.test(t)), txt.join(' | '));
});
await check('no wildcard record', async () => {
  try {
    const a = await resolver.resolve4('wildcard-probe-7f3a.goldenwo.dev');
    throw new Error(`a random name resolved to ${a.join(', ')}`);
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') return 'random name does not resolve';
    throw error;
  }
});
await check('ai-x-feed still served from goldenwo.github.io', async () => {
  const res = await fetch('https://goldenwo.github.io/ai-x-feed/', { redirect: 'manual' });
  assert(res.status === 200, `status ${res.status}`);
});
if (!skipOldUrl) {
  await check('goldenwo.github.io points to goldenwo.dev', async () => {
    const res = await fetch('https://goldenwo.github.io/', { redirect: 'manual' });
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('url=https://goldenwo.dev/'), 'meta refresh missing');
    assert(html.includes('rel="canonical" href="https://goldenwo.dev/"'), 'canonical missing');
  });
}

process.exit(failed ? 1 : 0);
