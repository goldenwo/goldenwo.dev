// scripts/make-images.mjs: renders og-image.png and the PNG icons into public/.
// Re-run after changing favicon.svg, the headshot or the OG copy: `npm run images`.
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const font = (await readFile('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64');
const fontFace = `@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}`;
const photo = (await readFile('src/assets/headshot.jpg')).toString('base64');

const ogHtml = `<html><head><style>${fontFace}
  html,body{margin:0}
  body{position:relative;width:1200px;height:630px;box-sizing:border-box;padding:0 96px;display:flex;flex-direction:column;justify-content:center;
    font-family:Inter;color:#1d1a24;background:linear-gradient(135deg,#f6e6da 0%,#e9e0f6 50%,#dcecf0 100%)}
  .mark{position:absolute;top:64px;left:96px;font-weight:700;font-size:30px;letter-spacing:-.02em;color:#5b3fc4}
  h1{margin:0 0 20px;max-width:620px;font-size:112px;line-height:1;letter-spacing:-.045em;font-weight:800}
  p{margin:0;max-width:620px;font-size:36px;line-height:1.25;font-weight:600;color:#565068;letter-spacing:-.01em}
  img{position:absolute;right:96px;top:50%;transform:translateY(-50%);width:300px;height:300px;border-radius:50%;
    object-fit:cover;border:6px solid rgba(255,255,255,.75)}
</style></head><body>
  <div class="mark">goldenwo.dev</div>
  <h1>Golden Wo</h1>
  <p>Software engineer building AI systems that hold up in production.</p>
  <img src="data:image/jpeg;base64,${photo}" alt="">
</body></html>`;

const svg = await readFile('public/favicon.svg', 'utf8');
const iconHtml = (size) => `<html><head><style>${fontFace}
  html,body{margin:0;background:transparent} svg{display:block;width:${size}px;height:${size}px}
</style></head><body>${svg}</body></html>`;

// iOS rounds the touch icon itself and renders transparent corners black, so it gets a full-bleed square.
const iconHtmlFullBleed = (size) => iconHtml(size).replace('rx="16"', 'rx="0"');

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
async function render(html, width, height, path, transparent = false) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, omitBackground: transparent });
  await page.close();
}

try {
  await render(ogHtml, 1200, 630, 'public/og-image.png');
  await render(iconHtmlFullBleed(180), 180, 180, 'public/apple-touch-icon.png');
  await render(iconHtml(32), 32, 32, 'public/favicon-32.png', true);
} finally {
  await browser.close();
}
console.log('wrote public/og-image.png, public/apple-touch-icon.png, public/favicon-32.png');
