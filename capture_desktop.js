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
  
  // Wait a bit
  await page.waitForTimeout(500);

  const out = path.join(process.env.TEMP, 'opencode', 'qa');
  fs.mkdirSync(out, { recursive: true });

  const selectors = [
    'header.site-header',
    'section.hero',
    'section.identity',
    'section.leadership-metrics',
    'section.ventures',
    'section.journey',
    'section.gallery',
    'section.closing',
    'footer.contact'
  ];

  for (const sel of selectors) {
    const el = await page.$(sel);
    if (el) {
      const clean = sel.replace(/[^a-zA-Z0-9]/g, '_');
      await el.screenshot({ path: path.join(out, `desktop-1440-${clean}.png`) });
      console.log('Saved', clean);
    }
  }

  // Also full page
  await page.screenshot({ path: path.join(out, 'desktop-1440-fullpage.png'), fullPage: true });
  console.log('Saved fullpage');

  await browser.close();
})();
