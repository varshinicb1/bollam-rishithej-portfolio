const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const LOCAL = 'file://' + path.resolve(process.cwd(), 'dist/index.html').replace(/\\/g, '/');
const LIVE = 'https://bollam-rishithej.pages.dev/';
const out = path.join(process.env.TEMP, 'opencode', 'qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const targets = [
    { name: 'local', url: LOCAL },
    { name: 'live',  url: LIVE }
  ];

  // Step 1: Overflow audit
  console.log('=== OVERFLOW AUDIT ===');
  for (const t of targets) {
    for (const w of [320, 360, 390, 414, 600, 768, 834, 1024, 1280, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(t.url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(800);
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      const r = await page.evaluate(() => {
        const de = document.documentElement;
        const vw = de.clientWidth;
        const bad = [];
        document.querySelectorAll('body *').forEach(el => {
          if (el.classList.contains('orbit') || el.classList.contains('grain')
              || el.classList.contains('skip-link')) return;
          const b = el.getBoundingClientRect();
          if (b.width > 0 && (b.right > vw + 1.5 || b.left < -1.5))
            bad.push(el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || ''));
        });
        return { overflow: de.scrollWidth - vw, bad: bad.slice(0, 6) };
      });
      console.log(`${t.name} ${w}px  overflow=${r.overflow}px  ${r.bad.length ? JSON.stringify(r.bad) : ''}`);
      await page.close();
    }
  }

  // Step 2: Visual screenshots at key widths
  console.log('\n=== VISUAL SCREENSHOTS ===');
  const sections = ['.hero', '.venture-cards', '.journey', '.executive-spotlight', '.closing', '.contact'];
  const widths = { 'phone': 390, 'tablet': 834, 'laptop': 1280, 'desktop': 1536 };

  for (const [label, w] of Object.entries(widths)) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(LOCAL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(800);
    // Force reveals visible
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    });
    // Scroll for lazy images
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    // Fullpage screenshot
    await page.screenshot({ path: path.join(out, `${label}-${w}-fullpage.png`), fullPage: true });
    console.log(`Saved ${label}-${w}-fullpage.png`);

    // Section screenshots
    for (const sel of sections) {
      const el = await page.$(sel);
      if (el) {
        const name = sel.replace('.', '');
        await el.screenshot({ path: path.join(out, `${label}-${w}-${name}.png`) });
        console.log(`Saved ${label}-${w}-${name}.png`);
      }
    }
    await page.close();
  }

  // Step 3: Runtime health (live)
  console.log('\n=== RUNTIME HEALTH (LIVE) ===');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => failedRequests.push(req.url()));
  
  const response = await page.goto(LIVE, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  const health = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const broken = imgs.filter(i => i.naturalWidth === 0).map(i => i.src);
    const reveals = document.querySelectorAll('.reveal');
    const shown = document.querySelectorAll('.reveal.in');
    return { brokenImgs: broken, totalReveals: reveals.length, shownReveals: shown.length };
  });

  console.log(`Console errors: ${consoleErrors.length}${consoleErrors.length ? ' -> ' + consoleErrors.join('; ') : ''}`);
  console.log(`Failed requests: ${failedRequests.length}${failedRequests.length ? ' -> ' + failedRequests.join('; ') : ''}`);
  console.log(`Broken images: ${health.brokenImgs.length}${health.brokenImgs.length ? ' -> ' + health.brokenImgs.join('; ') : ''}`);
  console.log(`Reveals: ${health.shownReveals}/${health.totalReveals} fired`);

  await page.close();
  await browser.close();
  console.log('\n=== DONE ===');
})();
