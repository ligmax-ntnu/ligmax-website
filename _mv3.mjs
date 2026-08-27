import puppeteer from 'puppeteer-core';
const out = process.argv[2];
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
});
const p = await b.newPage();
const errs = [];
p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: '+e.message));
await p.setViewport({ width: 1440, height: 900 });
await p.goto('http://localhost:4332/', { waitUntil:'domcontentloaded', timeout: 60000 });
await p.evaluate(() => document.querySelector('#model').scrollIntoView({ block:'center' }));
await new Promise(r => setTimeout(r, 500));
await p.screenshot({ path: `${out}/f-poster.png` });
await p.click('#load-model');
const st = await p.evaluate(() => new Promise(res => {
  const v = document.querySelector('#mobula-viewer');
  v.addEventListener('load', () => res('loaded'), { once:true });
  setTimeout(() => res('TIMEOUT loaded=' + v.loaded), 420000);
}));
console.log('model:', st);
await new Promise(r => setTimeout(r, 6000));
await p.screenshot({ path: `${out}/f-quarter.png` });
await p.evaluate(() => document.querySelectorAll('#view-buttons button')[1].click());
await new Promise(r => setTimeout(r, 5000));
await p.screenshot({ path: `${out}/f-profile.png` });
console.log('errors:', errs.length ? errs.slice(0,5) : 'none');
await b.close();
