const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = 8765;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(DIST_DIR, reqPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found: ' + reqPath);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Test server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();
  const LOCAL_URL = `http://127.0.0.1:${PORT}/`;

  const browser = await chromium.launch({ channel: 'msedge' });
  const viewports = [320, 360, 390, 414, 600, 768, 834, 1024, 1280, 1440, 1920];

  console.log('\n--- STEP 1: HORIZONTAL OVERFLOW & RUNTIME AUDIT ---');
  let hasOverflow = false;

  for (const w of viewports) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });

    // Scroll down to fire all lazy images and layout checks
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 25));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);

    const check = await page.evaluate(() => {
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
      return {
        overflow: Math.max(0, de.scrollWidth - vw),
        bad: bad.slice(0, 5),
        brokenImgs: broken,
        videoPlaying: (() => {
          const v = document.querySelector('.hero-3d-video');
          return v ? (!v.paused && v.readyState >= 2) : false;
        })()
      };
    });

    if (check.overflow > 0) hasOverflow = true;
    console.log(`[${w}px] Overflow: ${check.overflow}px | Bad elements: ${check.bad.length ? JSON.stringify(check.bad) : 'none'} | Broken Imgs: ${check.brokenImgs.length} | Video Ready: ${check.videoPlaying} | Console Errors: ${consoleErrors.length}`);
    await page.close();
  }

  console.log('\n--- STEP 2: CAPTURING VISUAL SNAPSHOTS ---');
  for (const [mode, width] of [['desktop-1440', 1440], ['mobile-390', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
    await page.waitForTimeout(500);

    const hero = await page.$('.hero');
    if (hero) await hero.screenshot({ path: `dist/snapshot-${mode}-hero.png` });

    const spotlight = await page.$('.executive-spotlight');
    if (spotlight) await spotlight.screenshot({ path: `dist/snapshot-${mode}-spotlight.png` });

    const ventures = await page.$('.venture-cards');
    if (ventures) await ventures.screenshot({ path: `dist/snapshot-${mode}-ventures.png` });

    const closing = await page.$('.closing');
    if (closing) await closing.screenshot({ path: `dist/snapshot-${mode}-closing.png` });

    console.log(`Captured snapshots for ${mode}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\n--- QA SUMMARY: Overflow Issues: ' + (hasOverflow ? 'DETECTED' : 'NONE (0px across all screens)') + ' ---');
})();
