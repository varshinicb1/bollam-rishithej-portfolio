const { chromium } = require('@playwright/test');
const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, '.audit', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const W = parseInt(process.argv[2] || '375', 10);
const PAGE = process.argv[3] || 'index.html';
const TILE = parseInt(process.argv[4] || '900', 10);
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: W, height: TILE }, deviceScaleFactor: 1, isMobile: W < 768, hasTouch: W < 768 });
  const p = await ctx.newPage();
  await p.goto('' + (process.env.BASE || 'http://localhost:4399') + '/' + PAGE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  await p.evaluate(() => { document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')); document.documentElement.style.scrollBehavior='auto'; });
  await p.waitForTimeout(1600);
  const H = await p.evaluate(() => document.body.scrollHeight);
  const tag = PAGE.replace('.html','') + '-' + W;
  const n = Math.ceil(H / TILE);
  for (let i = 0; i < n; i++) {
    const y = i * TILE;
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, `${tag}-${String(i).padStart(2,'0')}.png`) });
  }
  console.log('wrote ' + n + ' tiles for ' + tag + ' (docH=' + H + ')');
  await b.close();
})();
