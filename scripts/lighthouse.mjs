// scripts/lighthouse.mjs: Lighthouse budgets gate (median of 3 runs). Run after `npm run build`.
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { startPreview } from './preview-server.mjs';

const RUNS = 3;
const BUDGETS = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 95 };
const categories = Object.keys(BUDGETS);
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const { url, stop } = await startPreview(4322);
let failed = false;
try {
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROMIUM_EXECUTABLE ?? chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox'],
  });
  const scores = Object.fromEntries(categories.map((c) => [c, []]));
  try {
    for (let run = 0; run < RUNS; run++) {
      const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: categories });
      for (const c of categories) scores[c].push(Math.round(result.lhr.categories[c].score * 100));
    }
  } finally {
    try { await chrome.kill(); } catch { /* Windows can refuse to delete Chrome's temp dir; harmless */ }
  }
  for (const [c, min] of Object.entries(BUDGETS)) {
    const m = median(scores[c]);
    if (m < min) failed = true;
    console.log(`${m >= min ? 'PASS' : 'FAIL'} ${c}: ${m} (budget ${min}; runs ${scores[c].join(', ')})`);
  }
} finally {
  stop();
}
process.exit(failed ? 1 : 0);
