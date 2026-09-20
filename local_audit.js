const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const LOCAL = 'file://' + path.resolve(process.cwd(), 'dist/index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  console.log('Testing LOCAL build across viewports...');
  let totalOverflowIssues = 0;

  for (const w of [320, 360, 390, 414, 600, 768, 834, 1024, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await page.goto(LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    // Scroll down and back to trigger reveals & layout
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 800) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 20));
      }
      window.scrollTo(0, 0);
    });

    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const bad = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.classList.contains('orbit') || el.classList.contains('grain') || el.classList.contains('skip-link')) return;
        const b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > vw + 1.5 || b.left < -1.5))
          bad.push(el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || ''));
      });
      const imgs = [...document.querySelectorAll('img')];
      const broken = imgs.filter(i => i.naturalWidth === 0).map(i => i.src);
      return { overflow: de.scrollWidth - vw, bad: bad.slice(0, 4), brokenImgs: broken };
    });

    if (r.overflow > 0) totalOverflowIssues++;
    console.log(`${w}px: overflow=${r.overflow}px, bad elements=${JSON.stringify(r.bad)}, brokenImgs=${r.brokenImgs.length}, consoleErrors=${consoleErrors.length}`);
    await page.close();
  }

  // Visual screenshots of key sections at desktop and mobile
  for (const [mode, width] of [['desktop', 1440], ['mobile', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));

    const hero = await page.$('.hero');
    if (hero) await hero.screenshot({ path: `dist/test-hero-${mode}.png` });

    const spotlight = await page.$('.executive-spotlight');
    if (spotlight) await spotlight.screenshot({ path: `dist/test-spotlight-${mode}.png` });

    const ventures = await page.$('.venture-cards');
    if (ventures) await ventures.screenshot({ path: `dist/test-ventures-${mode}.png` });

    const closing = await page.$('.closing');
    if (closing) await closing.screenshot({ path: `dist/test-closing-${mode}.png` });

    await page.close();
  }

  await browser.close();
  console.log('All local checks completed. Total overflow issues: ' + totalOverflowIssues);
})();
