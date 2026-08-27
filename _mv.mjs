import puppeteer from 'puppeteer-core';
const out = process.argv[2];
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage();
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
await p.setViewport({ width: 1440, height: 950 });
await p.goto('http://localhost:4332/', { waitUntil: 'networkidle0', timeout: 60000 });
await p.evaluate(() => document.querySelector('#model').scrollIntoView({ block: 'center' }));
await new Promise(r => setTimeout(r, 500));
await p.screenshot({ path: `${out}/mv-poster.png` });

// click load and wait for the model to finish
await p.click('#load-model');
const ok = await p.evaluate(() => new Promise(res => {
  const v = document.querySelector('#mobula-viewer');
  if (v.loaded) return res('already');
  v.addEventListener('load', () => res('load-event'), { once: true });
  setTimeout(() => res('TIMEOUT loaded=' + v.loaded), 90000);
}));
console.log('model load:', ok);
await new Promise(r => setTimeout(r, 2500));
await p.screenshot({ path: `${out}/mv-loaded.png` });

for (const [label, sel] of [['profile', 1], ['plan', 2], ['headon', 3]]) {
  await p.evaluate(i => document.querySelectorAll('#view-buttons button')[i].click(), sel);
  await new Promise(r => setTimeout(r, 1600));
  await p.screenshot({ path: `${out}/mv-${label}.png` });
}
console.log('console errors:', errs.length ? errs.slice(0, 6) : 'none');
await b.close();
