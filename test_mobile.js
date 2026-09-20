const { chromium } = require('@playwright/test');
const path = require('path');
const LOCAL = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');
const out = path.join(process.env.TEMP, 'opencode', 'qa');

(async () => {
  const browser = await chromium.launch();
  console.log('--- RUNNING MOBILE OPTIMIZATION VERIFICATION ---');

  for (const w of [320, 375, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 780 } });
    await page.goto(LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    // Force reveals visible
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    });

    // 1. Mobile top header
    await page.screenshot({ path: path.join(out, `mobile-${w}-top.png`) });

    // 2. Mobile menu open
    const menuBtn = await page.$('.menu');
    if (menuBtn) {
      await menuBtn.click();
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(out, `mobile-${w}-menu-open.png`) });
      // Close menu
      const closeBtn = await page.$('#mobileCloseBtn');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(250);
    }

    // 3. Scroll to and capture Metrics
    const metricsEl = await page.$('.metrics');
    if (metricsEl) {
      await metricsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await metricsEl.screenshot({ path: path.join(out, `mobile-${w}-metrics.png`) });
    }

    // 4. Scroll to and capture Venture Cards
    const ventureEl = await page.$('.venture-cards');
    if (ventureEl) {
      await ventureEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await ventureEl.screenshot({ path: path.join(out, `mobile-${w}-venture-cards.png`) });
    }

    // 5. Scroll to and capture Contact Section
    const contactEl = await page.$('.contact');
    if (contactEl) {
      await contactEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await contactEl.screenshot({ path: path.join(out, `mobile-${w}-contact.png`) });
    }

    // 6. Full Page Screenshot
    await page.screenshot({ path: path.join(out, `mobile-${w}-fullpage.png`), fullPage: true });

    // Check overflow
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const bad = [];
      document.querySelectorAll('body *').forEach(el => {
        if (el.classList.contains('orbit') || el.classList.contains('grain')
            || el.classList.contains('skip-link') || el.classList.contains('custom-cursor')
            || el.classList.contains('cursor-dot') || el.classList.contains('cursor-ring')
            || el.classList.contains('cmd-modal') || el.classList.contains('scroll-progress')
            || el.classList.contains('mobile-nav-top') || el.tagName === 'NAV') return;
        const b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > vw + 1.5 || b.left < -1.5)) {
          bad.push(el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || '').trim());
        }
      });
      return {
        scrollWidth: de.scrollWidth,
        clientWidth: vw,
        diff: de.scrollWidth - vw,
        bad: bad.slice(0, 5)
      };
    });

    console.log(`Mobile ${w}px -> overflow: ${overflow.diff}px ${overflow.bad.length ? 'BAD: ' + JSON.stringify(overflow.bad) : 'CLEAN'}`);
    await page.close();
  }

  await browser.close();
  console.log('--- MOBILE VERIFICATION FINISHED ---');
})();
