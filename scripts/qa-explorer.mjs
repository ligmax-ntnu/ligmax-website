// End-to-end QA for the vessel explorer (/vessel).
//
// Loads the page in headless Edge, waits for the model to finish loading, then asserts:
//   1. every titled entry in src/data/part-info.json resolves on a real mesh with that title
//   2. every "Highlight a system" group highlights exactly as many meshes as it lists
//   3. no titled part falls back to "Structural component"
//
// Usage:
//   npm i --no-save puppeteer-core     (one-off; not a saved dependency)
//   npm run preview                    (in another terminal, serves the production build)
//   node scripts/qa-explorer.mjs
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const partInfo = JSON.parse(readFileSync(path.join(root, 'src/data/part-info.json'), 'utf8'));

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--hide-scrollbars'],
});

let failures = 0;
try {
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    failures++;
    console.log('PAGE ERROR:', err.message);
  });
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto('http://localhost:4321/vessel', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.__ligmax, { timeout: 120000, polling: 500 });
  const data = await page.evaluate(() => window.__ligmax);

  const titled = Object.entries(partInfo).filter(([, v]) => v.title);
  console.log(`\n== Part titles (${titled.length} expected) ==`);
  for (const [key, value] of titled) {
    const sanitized = key.replace(/\s/g, '_').replace(/[\[\].:/]/g, '');
    const match = data.parts.find((p) => p.gltfName === key || p.threeName === sanitized);
    if (!match) {
      failures++;
      console.log(`FAIL  ${key}: no mesh found in scene`);
    } else if (match.title !== value.title) {
      failures++;
      console.log(`FAIL  ${key}: resolved "${match.title}" instead of "${value.title}"`);
    } else {
      console.log(`ok    ${key} -> ${match.title}`);
    }
  }

  console.log('\n== Systems ==');
  for (const [key, counts] of Object.entries(data.systems)) {
    const ok = counts.resolved === counts.listed;
    if (!ok) failures++;
    console.log(`${ok ? 'ok   ' : 'FAIL '} ${key}: ${counts.resolved}/${counts.listed} parts resolve`);
  }

  const badStructural = data.parts.filter(
    (p) => partInfo[p.gltfName] && partInfo[p.gltfName].title && p.title === 'Structural component'
  );
  for (const p of badStructural) {
    failures++;
    console.log(`FAIL  ${p.gltfName} shows "Structural component" despite having a title`);
  }

  console.log(`\n${failures === 0 ? 'QA PASSED' : 'QA FAILED'}: ${failures} failure(s)`);
} finally {
  await browser.close();
}
process.exit(failures === 0 ? 0 : 1);
