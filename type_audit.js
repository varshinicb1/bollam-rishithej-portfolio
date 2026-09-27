const { chromium } = require('@playwright/test');
const B = process.env.BASE || 'http://localhost:4399';

const probe = () => {
  const lum = (c) => { const [r,g,b]=c.map(v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*r+0.7152*g+0.0722*b; };
  const parse = (s) => { const m=s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const p=m[1].split(',').map(Number); return {rgb:p.slice(0,3), a:p.length>3?p[3]:1}; };
  const bgOf = (el) => { let e=el;
    while (e) { const c=parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0.5) return c.rgb; e=e.parentElement; }
    return [255,255,255]; };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b);
    return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)); };

  const out = [];
  const seen = new Set();
  document.querySelectorAll('p,span,a,h1,h2,h3,h4,strong,li,time,div,td,th,button').forEach(el => {
    if (el.children.length) return;
    const txt = el.textContent.trim();
    if (txt.length < 3) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const fg = parse(cs.color); if (!fg) return;
    const bg = bgOf(el);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10);
    const cr = ratio(fg.rgb, bg);
    // WCAG: large text = >=24px, or >=18.66px at weight>=700
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3.0 : 4.5;
    const key = el.className + '|' + Math.round(size) + '|' + cs.color;
    if (seen.has(key)) return; seen.add(key);
    if (cr < need) out.push({
      el: el.tagName.toLowerCase() + '.' + (el.className||'').toString().split(' ')[0],
      txt: txt.slice(0, 34), size: Math.round(size*10)/10, weight,
      color: cs.color, ratio: Math.round(cr*100)/100, need,
      upper: cs.textTransform === 'uppercase',
      track: cs.letterSpacing,
      font: cs.fontFamily.split(',')[0].replace(/"/g,'')
    });
  });
  return out;
};

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  for (const page of ['index.html','brochure.html']) {
    for (const W of [375, 1440]) {
      const ctx = await b.newContext({ viewport:{width:W,height:900}, isMobile:W<768, hasTouch:W<768 });
      const p = await ctx.newPage();
      await p.goto(B+'/'+page, { waitUntil:'domcontentloaded' });
      await p.waitForTimeout(1200);
      await p.evaluate(()=>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')));
      await p.waitForTimeout(400);
      const r = await p.evaluate(probe);
      console.log(`\n=== ${page} @${W} — ${r.length} contrast failures ===`);
      r.sort((a,b)=>a.ratio-b.ratio).slice(0,14).forEach(f=>console.log(
        `  ${String(f.ratio).padStart(5)}:1 (need ${f.need})  ${String(f.size).padStart(5)}px w${f.weight} ${f.upper?'UPPER':'     '} ${f.el.padEnd(26)} "${f.txt}"`));
      await ctx.close();
    }
  }
  await b.close();
})();
