const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const localUrl = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');
  await page.goto(localUrl, { waitUntil: 'load' });
  
  // Force all reveals
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
  });

  // Scroll through entire page so all lazy images load
  for (let y = 0; y <= 12000; y += 400) {
    await page.evaluate(top => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const out = path.join(process.env.TEMP, 'opencode', 'qa', 'desktop_audit');
  fs.mkdirSync(out, { recursive: true });

  const sections = [
    'hero',
    'statement',
    'principles',
    'metrics',
    'ventures',
    'venture-list',
    'journey',
    'gallery',
    'closing',
    'contact'
  ];

  for (const s of sections) {
    const el = await page.$(`.${s}`);
    if (el) {
      await el.screenshot({ path: path.join(out, `${s}.png`) });
      console.log(`Saved ${s}.png`);
    } else {
      console.log(`Not found: .${s}`);
    }
  }

  await browser.close();
})();
