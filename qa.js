const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const LOCAL = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');
const LIVE = 'https://bollam-rishithej.pages.dev/';
const targetOut = path.join(process.env.TEMP, 'opencode', 'qa');
fs.mkdirSync(targetOut, { recursive: true });

async function runAudit() {
  const browser = await chromium.launch();
  console.log('--- STARTING COMPREHENSIVE QA AUDIT (AWARD-WINNING PASS) ---');
  console.log('Output dir:', targetOut);

  // -------------------------------------------------------------
  // STEP 4: Runtime health check on LOCAL entrypoint
  // -------------------------------------------------------------
  console.log('\n=== RUNTIME HEALTH CHECK (LOCAL DIST) ===');
  const healthPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  const networkFailures = [];

  healthPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  healthPage.on('response', resp => {
    if (resp.status() >= 400) {
      networkFailures.push(`${resp.status()} ${resp.url()}`);
    }
  });

  await healthPage.goto(LOCAL, { waitUntil: 'load', timeout: 60000 });
  await healthPage.waitForTimeout(600);

  // Scroll smoothly down to allow lazy images and intersection observers to trigger
  const docHeight = await healthPage.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= docHeight; y += 350) {
    await healthPage.evaluate(y => window.scrollTo(0, y), y);
    await healthPage.waitForTimeout(60);
  }
  await healthPage.waitForTimeout(800);

  const healthData = await healthPage.evaluate(async () => {
    const all = Array.from(document.querySelectorAll('img'));
    await Promise.all(all.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => { img.onload = img.onerror = res; });
    }));

    const brokenImgs = all.filter(img => img.naturalWidth === 0).map(img => img.src);
    const totalReveals = document.querySelectorAll('.reveal').length;
    const activeReveals = document.querySelectorAll('.reveal.in').length;
    const liveTimeText = document.getElementById('liveTime')?.textContent || '';
    const metricsCount = document.querySelectorAll('.metric-num').length;
    return {
      brokenImgs,
      totalReveals,
      activeReveals,
      liveTimeText,
      metricsCount
    };
  });

  console.log('Console Errors:', JSON.stringify(consoleErrors));
  console.log('Failed Responses:', JSON.stringify(networkFailures));
  console.log('Broken Images:', JSON.stringify(healthData.brokenImgs));
  console.log(`Reveals: ${healthData.activeReveals} / ${healthData.totalReveals} active`);
  console.log('Live Time HUD:', healthData.liveTimeText);
  console.log('Metrics rendered:', healthData.metricsCount);
  await healthPage.close();

  // -------------------------------------------------------------
  // STEP 1: Overflow Audit (Numeric) across 13 breakpoints
  // -------------------------------------------------------------
  console.log('\n=== STEP 1: OVERFLOW AUDIT (NUMERIC) ===');
  const auditWidths = [320, 360, 390, 414, 600, 768, 834, 1024, 1180, 1280, 1440, 1920, 2560];

  for (const w of auditWidths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(LOCAL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(300);

    // Scroll gradually to fire reveals
    const scrollH = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= scrollH; y += 400) {
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
            || el.classList.contains('cmd-modal') || el.classList.contains('scroll-progress')) return;
        const b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > vw + 1.5 || b.left < -1.5)) {
          bad.push(el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || '').trim());
        }
      });
      return {
        scrollWidth: de.scrollWidth,
        clientWidth: vw,
        overflow: Math.max(0, de.scrollWidth - vw),
        bad: bad.slice(0, 8)
      };
    });

    console.log(`[Local] ${w}px -> overflow: ${r.overflow}px ${r.bad.length ? 'OFFENDERS: ' + JSON.stringify(r.bad) : 'CLEAN'}`);
    await page.close();
  }

  // -------------------------------------------------------------
  // STEP 2: Visual Screenshots (Local site with new design)
  // -------------------------------------------------------------
  console.log('\n=== STEP 2: VISUAL SCREENSHOTS ===');
  const screenshotConfigs = [
    { name: 'phone', width: 390 },
    { name: 'tablet', width: 834 },
    { name: 'laptop', width: 1280 },
    { name: 'desktop', width: 1536 }
  ];

  const sections = [
    { selector: '.hero', name: 'hero' },
    { selector: '.metrics', name: 'metrics' },
    { selector: '.venture-cards', name: 'venture-cards' },
    { selector: '.journey', name: 'journey' },
    { selector: '.gallery', name: 'gallery' },
    { selector: '.contact', name: 'contact' }
  ];

  for (const cfg of screenshotConfigs) {
    console.log(`\nCapturing screenshots for ${cfg.name} (${cfg.width}px)...`);
    const page = await browser.newPage({ viewport: { width: cfg.width, height: 900 } });
    await page.goto(LOCAL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(400);

    // Force reveals visible
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    });

    // Scroll through the page once for lazy images
    const sHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= sHeight; y += 400) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    for (const sec of sections) {
      const el = await page.$(sec.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const filePath = path.join(targetOut, `${cfg.name}-${cfg.width}-${sec.name}.png`);
        await el.screenshot({ path: filePath });
        console.log(`Saved: ${filePath}`);
      } else {
        console.warn(`Could not find selector: ${sec.selector}`);
      }
    }

    // Also capture full page screenshot for award review
    const fullPagePath = path.join(targetOut, `${cfg.name}-${cfg.width}-fullpage.png`);
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`Saved full page: ${fullPagePath}`);

    // Test Command Palette interaction on laptop (1280px)
    if (cfg.width === 1280) {
      await page.evaluate(() => {
        const cmd = document.getElementById('cmdModal');
        if (cmd) {
          cmd.classList.add('open');
          cmd.setAttribute('aria-hidden', 'false');
        }
      });
      await page.waitForTimeout(300);
      const cmdScreenshotPath = path.join(targetOut, `laptop-1280-cmd-palette.png`);
      await page.screenshot({ path: cmdScreenshotPath });
      console.log(`Saved Command Palette: ${cmdScreenshotPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\n--- COMPREHENSIVE QA AUDIT COMPLETED ---');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
