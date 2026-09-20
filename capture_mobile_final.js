const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const LOCAL = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');
const targetOut = path.join(process.env.TEMP, 'opencode', 'qa');
fs.mkdirSync(targetOut, { recursive: true });

async function verifyMobile() {
  const browser = await chromium.launch({ channel: 'chrome' });
  console.log('=== RUNNING FINAL MOBILE QA & SCREENSHOT SUITE ===');

  const mobileWidths = [320, 360, 375, 390, 414, 480];

  // 1. Check numeric overflow across mobile breakpoints
  console.log('\n--- MOBILE OVERFLOW AUDIT ---');
  for (const w of mobileWidths) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto(LOCAL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Scroll to fire all reveals
    const sH = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= sH; y += 400) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(30);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    const r = await page.evaluate(() => {
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
        diff: Math.max(0, de.scrollWidth - vw),
        bad: bad.slice(0, 5)
      };
    });

    console.log(`[Mobile ${w}px] Overflow: ${r.diff}px ${r.bad.length ? 'OFFENDERS: ' + JSON.stringify(r.bad) : 'CLEAN'}`);
    await page.close();
  }

  // 2. Capture visual screenshots at 320px, 375px, and 390px
  console.log('\n--- CAPTURING MOBILE VISUAL ASSETS ---');
  const targetWidths = [320, 375, 390];

  for (const w of targetWidths) {
    console.log(`\nProcessing viewport ${w}px...`);
    const page = await browser.newPage({ viewport: { width: w, height: 750 } });
    await page.goto(LOCAL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    });

    // 1. Hero / Top
    const heroEl = await page.$('.hero');
    if (heroEl) {
      const heroPath = path.join(targetOut, `mobile-${w}-hero.png`);
      await heroEl.screenshot({ path: heroPath, animations: 'disabled', timeout: 10000 });
      console.log(`Saved: ${heroPath}`);
    }

    // 2. Open Mobile Navigation Drawer
    await page.evaluate(() => {
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.add('open');
      document.body.classList.add('nav-open');
    });
    await page.waitForTimeout(300);
    const menuPath = path.join(targetOut, `mobile-${w}-menu-open.png`);
    await page.screenshot({ path: menuPath, animations: 'disabled', timeout: 10000 });
    console.log(`Saved: ${menuPath}`);

    // Close Mobile Drawer
    await page.evaluate(() => {
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
    await page.waitForTimeout(200);

    // 3. Metrics Section
    const metricsEl = await page.$('.metrics');
    if (metricsEl) {
      await metricsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const metricsPath = path.join(targetOut, `mobile-${w}-metrics.png`);
      await metricsEl.screenshot({ path: metricsPath, animations: 'disabled', timeout: 10000 });
      console.log(`Saved: ${metricsPath}`);
    }

    // 4. Venture Cards
    const ventureEl = await page.$('.venture-cards');
    if (ventureEl) {
      await ventureEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const venturePath = path.join(targetOut, `mobile-${w}-venture-cards.png`);
      await ventureEl.screenshot({ path: venturePath, animations: 'disabled', timeout: 10000 });
      console.log(`Saved: ${venturePath}`);
    }

    // 5. Contact Section
    const contactEl = await page.$('.contact');
    if (contactEl) {
      await contactEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const contactPath = path.join(targetOut, `mobile-${w}-contact.png`);
      await contactEl.screenshot({ path: contactPath, animations: 'disabled', timeout: 10000 });
      console.log(`Saved: ${contactPath}`);
    }

    // 6. Fullpage screenshot
    const fullPath = path.join(targetOut, `mobile-${w}-fullpage.png`);
    await page.screenshot({ path: fullPath, fullPage: true, animations: 'disabled', timeout: 15000 });
    console.log(`Saved: ${fullPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\n=== MOBILE VERIFICATION COMPLETED ===');
}

verifyMobile().catch(err => {
  console.error('Mobile verification failed:', err);
  process.exit(1);
});
