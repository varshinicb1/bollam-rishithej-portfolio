// Crawls every internal link from the homepage, checking status, JSON-LD
// validity, canonical correctness, title uniqueness and broken images.
const { chromium } = require('@playwright/test');
const B = 'http://localhost:4399';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const seen = new Set(), queue = ['/'], report = [], problems = [];

  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);
    const bad = [];
    p.removeAllListeners('response');
    p.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace(B, '')}`); });
    const errs = [];
    p.removeAllListeners('pageerror');
    p.on('pageerror', e => errs.push(String(e)));

    const res = await p.goto(B + route, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(450);
    const info = await p.evaluate(() => {
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')];
      let ldOk = true; let types = [];
      for (const s of ld) { try { const d = JSON.parse(s.textContent);
        types = types.concat((d['@graph'] || [d]).map(n => n['@type'])); } catch { ldOk = false; } }
      return {
        title: (document.title || '').trim(),
        desc: (document.querySelector('meta[name=description]') || {}).content || '',
        canonical: (document.querySelector('link[rel=canonical]') || {}).href || '',
        h1: document.querySelectorAll('h1').length,
        ldOk, types,
        links: [...new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
          .filter(h => h && !/^(https?:|mailto:|#)/.test(h)))],
        brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0)
          .map(i => (i.currentSrc || i.src).split('/').pop()),
      };
    });
    report.push({ route, status: res.status(), ...info });
    if (res.status() !== 200) problems.push(`${route} -> HTTP ${res.status()}`);
    if (!info.ldOk) problems.push(`${route} -> invalid JSON-LD`);
    if (info.h1 !== 1) problems.push(`${route} -> ${info.h1} h1 elements`);
    if (!info.canonical.endsWith(route === '/' ? '/' : route)) problems.push(`${route} -> canonical ${info.canonical}`);
    if (!info.desc) problems.push(`${route} -> no meta description`);
    if (bad.length) problems.push(`${route} -> subresources ${bad.join(', ')}`);
    if (errs.length) problems.push(`${route} -> JS ${errs[0]}`);
    if (info.brokenImgs.length) problems.push(`${route} -> broken imgs ${info.brokenImgs.join(', ')}`);
    for (const l of info.links) {
      const u = new URL(l, B + route).pathname;
      // Only follow pages. The media kit links straight at image files for
      // download; those are assets, not routes, and judging them as pages
      // produces noise that hides real faults.
      if (/\.(jpg|jpeg|png|webp|svg|mp4|webm|pdf|xml|txt|webmanifest)$/i.test(u)) continue;
      if (!seen.has(u)) queue.push(u);
    }
  }

  console.log('crawled %d pages\n', report.length);
  for (const r of report.sort((a, b) => a.route.localeCompare(b.route))) {
    console.log('  ' + r.status + '  ' + r.route.padEnd(34) + ' h1=' + r.h1 + '  ' + r.types.join('+'));
  }
  const titles = report.map(r => r.title);
  const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  console.log('\nunique titles :', new Set(titles).size + '/' + titles.length, dupes.length ? 'DUPES: ' + dupes : '');
  console.log('problems      :', problems.length ? '\n  ' + problems.join('\n  ') : 'none');
  await b.close();
})();
