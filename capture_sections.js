const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const out = path.join(process.env.TEMP, 'opencode', 'qa');
const LOCAL = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });

  for (const w of [375, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 750 } });
    await page.goto(LOCAL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach(function(e) { e.classList.add('in'); }));

    const sections = [
      { sel: '.gallery',   name: 'gallery'   },
      { sel: '.closing',   name: 'closing'   },
      { sel: '.bw-frame',  name: 'bwframe'   },
      { sel: '.ventures',  name: 'ventures'  },
      { sel: '.journey',   name: 'journey'   },
    ];

    for (const sec of sections) {
      const el = await page.$(sec.sel);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const p = path.join(out, 'mobile-' + w + '-' + sec.name + '.png');
        await el.screenshot({ path: p, animations: 'disabled', timeout: 10000 });
        console.log('Saved:', p);
      }
    }
    await page.close();
  }
  await browser.close();
  console.log('Done');
})();
