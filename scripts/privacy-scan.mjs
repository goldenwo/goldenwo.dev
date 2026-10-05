// scripts/privacy-scan.mjs: fails if the build ships an email address or a phone number.
// The repo and the site are public, so this runs after every build (npm run check, CI).
// Usage: node scripts/privacy-scan.mjs [dir=dist]. Reports counts per file, never the values.
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { extractText, getDocumentProxy, getMeta } from 'unpdf';
import { findPrivateData } from '../src/privacy.mjs';

// '' covers extensionless files such as _headers.
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.txt', '.xml', '.svg', '.webmanifest', '']);
const root = process.argv[2] ?? 'dist';

async function textOf(path) {
  if (extname(path) !== '.pdf') return readFile(path, 'utf8');
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(path)));
  try {
    const { text } = await extractText(pdf, { mergePages: true });
    const { info, metadata } = await getMeta(pdf);
    return [text, JSON.stringify(info ?? {}), JSON.stringify(metadata ?? {})].join('\n');
  } finally {
    await pdf.loadingTask.destroy();
  }
}

const files = (await readdir(root, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name))
  .filter((path) => extname(path) === '.pdf' || TEXT.has(extname(path)));

let failed = files.length === 0;
if (failed) console.log(`FAIL no files to scan under ${root}`);
for (const file of files) {
  for (const { kind, count } of findPrivateData(await textOf(file))) {
    failed = true;
    console.log(`FAIL ${file}: ${count} ${kind} match(es)`);
  }
}
if (!failed) console.log(`PASS privacy scan: ${files.length} files, no email addresses or phone numbers`);
process.exit(failed ? 1 : 0);
