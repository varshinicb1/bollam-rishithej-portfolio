const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const OUT = process.env.OUT_DIR || path.join(__dirname, '.audit');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = ['', 'about', 'ventures', 'ventures/predictera', 'journey', 'media', 'contact', 'brochure'];
const WIDTHS = [320, 360, 375, 390, 414, 480, 640, 768, 834, 1024, 1180, 1280, 1440, 1920];

const probe = () => {
  const de = document.documentElement;
  const cw = de.clientWidth;
  const bad = [];
  const seen = new Set();
  document.querySelectorAll('body *').forEach((e) => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
    const b = e.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    if (b.right > cw + 1 || b.left < -1) {
      const key = e.tagName + '.' + (e.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.');
      if (seen.has(key)) return;
      seen.add(key);
      bad.push({ el: key, left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width) });
    }
  });

  const small = [];
  const seenT = new Set();
  document.querySelectorAll('a,button,input,select,textarea,[role="button"]').forEach((e) => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const b = e.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    // WCAG 2.5.8 exempts links inside a sentence of running text: their size
    // is set by the prose, and boxing them would break the line. Counting them
    // as failures buries the controls that genuinely need fixing.
    const inSentence = e.tagName === 'A'
      && e.parentElement
      && /^(P|LI|TD|DD|FIGCAPTION|BLOCKQUOTE)$/.test(e.parentElement.tagName)
      && e.parentElement.textContent.trim().length > e.textContent.trim().length + 12;
    if (inSentence) return;
    if (b.height < 44 || b.width < 44) {
      const key = e.tagName + '.' + (e.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.') + '|' + e.textContent.trim().slice(0, 18);
      if (seenT.has(key)) return;
      seenT.add(key);
      small.push({ el: key, w: Math.round(b.width), h: Math.round(b.height) });
    }
  });

  const tiny = [];
  const seenF = new Set();
  document.querySelectorAll('p,li,span,td,dd,dt,a,div,small,figcaption').forEach((e) => {
    if (e.children.length) return;
    const txt = e.textContent.trim();
    if (txt.length < 6) return;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const fs2 = parseFloat(cs.fontSize);
    if (fs2 < 12) {
      const key = e.tagName + '.' + (e.className || '').toString().trim().split(/\s+/)[0] + '@' + fs2;
      if (seenF.has(key)) return;
      seenF.add(key);
      tiny.push({ el: key, size: fs2, txt: txt.slice(0, 26) });
    }
  });

  return {
    scrollW: de.scrollWidth,
    clientW: cw,
    docH: document.body.scrollHeight,
    overflow: de.scrollWidth > cw + 1,
    offenders: bad.slice(0, 14),
    smallTargets: small.slice(0, 14),
    tinyText: tiny.slice(0, 14),
  };
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = {};
  for (const p of PAGES) {
    report[p] = {};
    for (const w of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: 900 },
        deviceScaleFactor: 1,
        isMobile: w < 768,
        hasTouch: w < 768,
      });
      const page = await ctx.newPage();
      // the static server serves clean URLs and 301s away from .html
      await page.goto('' + (process.env.BASE || 'http://localhost:4399') + '/' + p, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);
      // force all reveal animations complete so screenshots show final state
      await page.evaluate(() => {
        document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in'));
      });
      await page.waitForTimeout(400);
      report[p][w] = await page.evaluate(probe);
      if (process.env.SHOTS) {
        const tag = p.replace('.html', '');
        await page.screenshot({ path: path.join(OUT, `${tag}-${w}.png`), fullPage: true });
      }
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  // concise console summary
  for (const p of Object.keys(report)) {
    console.log('\n=== ' + p + ' ===');
    for (const w of WIDTHS) {
      const r = report[p][w];
      console.log(
        `${String(w).padStart(5)}px  scrollW=${r.scrollW}  docH=${r.docH}  ${r.overflow ? 'OVERFLOW' : 'ok'}  tapFails=${r.smallTargets.length}  tinyText=${r.tinyText.length}`
      );
      if (r.overflow) r.offenders.forEach((o) => console.log(`         ! ${o.el} left=${o.left} right=${o.right} w=${o.w}`));
    }
  }
  await browser.close();
})();
