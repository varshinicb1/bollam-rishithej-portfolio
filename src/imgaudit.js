// Audits every image Google could index: is it a real <img> present in the raw
// HTML (not JS-injected), does it have alt text and dimensions, and is it the
// format actually served.
const { chromium } = require('@playwright/test');
const B = 'http://localhost:4399';
const PAGES = ['/', '/about', '/ventures', '/ventures/predictera', '/ventures/vidyuthlabs',
  '/journey', '/media', '/contact', '/brochure'];

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  let totalImgs = 0, noAlt = 0, cssBg = [];

  for (const route of PAGES) {
    const raw = await (await fetch(B + route)).text();
    await p.goto(B + route, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    await p.evaluate(async () => {
      document.querySelectorAll('img').forEach(i => i.loading = 'eager');
      const H = document.body.scrollHeight;
      for (let y = 0; y < H; y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    });
    await p.waitForTimeout(900);

    const data = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')].map(i => ({
        src: (i.getAttribute('src') || ''),
        current: (i.currentSrc || '').split('/').pop(),
        alt: i.getAttribute('alt') || '',
        w: i.getAttribute('width'), h: i.getAttribute('height'),
        lazy: i.getAttribute('loading') === 'lazy',
        rendered: i.naturalWidth > 0,
      }));
      // Content-sized CSS backgrounds are invisible to image search.
      const bg = [];
      document.querySelectorAll('*').forEach(e => {
        const bi = getComputedStyle(e).backgroundImage;
        if (bi && bi !== 'none' && bi.includes('/assets/')) {
          const r = e.getBoundingClientRect();
          if (r.width > 200 && r.height > 200) bg.push(e.className + ' ' + bi.slice(0, 60));
        }
      });
      return { imgs, bg };
    });

    const inRaw = data.imgs.filter(i => i.src && raw.includes(i.src)).length;
    const missingAlt = data.imgs.filter(i => i.src && !i.alt.trim()).length;
    const notRendered = data.imgs.filter(i => i.src && !i.rendered).map(i => i.src);
    const noDims = data.imgs.filter(i => i.src && (!i.w || !i.h)).length;
    totalImgs += data.imgs.length; noAlt += missingAlt;
    if (data.bg.length) cssBg.push(route + ': ' + data.bg.join(' | '));

    console.log(route.padEnd(26) + ' imgs=' + String(data.imgs.length).padStart(2) +
      '  inRawHTML=' + String(inRaw).padStart(2) +
      '  noAlt=' + missingAlt + '  noDims=' + noDims +
      '  broken=' + notRendered.length);
    if (notRendered.length) console.log('      broken: ' + notRendered.join(', '));
  }
  console.log('\ntotal images: ' + totalImgs + '   missing alt: ' + noAlt);
  console.log('large CSS background images (never indexed): ' + (cssBg.length ? '\n  ' + cssBg.join('\n  ') : 'none'));
  await b.close();
})();
