// Confirms the scroll choreography is actually bound to a timeline, and that
// nothing ends up stranded invisible at any scroll position.
const { chromium } = require('@playwright/test');
const B = 'http://localhost:4399';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  for (const W of [375, 1440]) {
    const c = await b.newContext({ viewport: { width: W, height: 900 }, isMobile: W < 768, hasTouch: W < 768 });
    const p = await c.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(B + '/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1200);

    const bound = await p.evaluate(() => {
      const pick = (s) => { const e = document.querySelector(s); if (!e) return null;
        return e.getAnimations().map(a => a.animationName + ':' + (a.timeline && a.timeline.constructor.name)); };
      return { heroImg: pick('.hero-image img'), metrics: pick('.metrics-grid'),
               principle: pick('.principle-row'), bw: pick('.bw-frame') };
    });

    const H = await p.evaluate(() => document.body.scrollHeight);
    const stuck = new Map();
    for (let y = 0; y < H - 900; y += 420) {
      await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(90);
      (await p.evaluate(() => {
        const out = [];
        document.querySelectorAll('.principle-row,.metrics-grid,.bw-frame,.venture-row,h1,h2').forEach(e => {
          const r = e.getBoundingClientRect();
          if (r.top > innerHeight * 0.2 || r.bottom < innerHeight * 0.8) return;
          if (parseFloat(getComputedStyle(e).opacity) < 0.9)
            out.push((e.className || e.tagName).toString().split(' ')[0]);
        });
        return out;
      })).forEach(k => stuck.set(k, (stuck.get(k) || 0) + 1));
    }
    const bad = [...stuck.entries()].filter(([, n]) => n >= 3);
    console.log(`@${W}  bound=${JSON.stringify(bound)}`);
    console.log(`      stranded=${bad.length ? JSON.stringify(bad) : 'none'}  errors=${errs.length || 'none'}`);
    await c.close();
  }
  const rc = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rc.newPage();
  await rp.goto(B + '/', { waitUntil: 'domcontentloaded' }); await rp.waitForTimeout(1200);
  console.log('reduced-motion hidden elements:', await rp.evaluate(() =>
    [...document.querySelectorAll('.principle-row,.metrics-grid,.bw-frame,.venture-row')]
      .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).length));
  await b.close();
})();
