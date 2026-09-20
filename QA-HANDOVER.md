# QA Handover — Visual Verification

Paste the prompt in the **Task prompt** section into Claude (or any agent with shell +
Playwright access). It is self-contained: context, environment quirks, steps, review
checklist, and a ready-to-run audit script.

- **Live:** https://bollam-rishithej.pages.dev/
- **Local entry:** `dist/index.html`
- **Source.** Plain HTML/CSS/JS, no build step.

---

## Task prompt

````text
# Task: Visually verify the Bollam Rishithej portfolio via screenshots

You are a QA reviewer. Your job is to visually verify a deployed static portfolio
by taking real screenshots at multiple screen sizes and inspecting them for layout
defects. Do NOT change any code — this is verification only. Report findings with
evidence (which width, which element, what's wrong).

## Context
- Static site: plain HTML/CSS/JS. No build step. Source dir: `dist/`
- Local entry: `dist/index.html`
- Live (production): https://bollam-rishithej.pages.dev/
- Deployed on Cloudflare Pages (project `bollam-rishithej`)
- A responsive pass was just done to eliminate horizontal overflow on phones
  (320–600px). It should be clean from 320px up to 2560px.
- Expected, known-benign quirk: the `.orbit` element (bottom-right of the closing
  section) is a rotating square, so its axis-aligned bounding box reports ~147px
  wide even though the visible circle is 104px. Ignore it as an overflow offender.

## Environment (Windows / PowerShell)
- Node is at `C:\nvm4w\nodejs\node.exe`
- Playwright is installed GLOBALLY, not in the project. `require('playwright')`
  FAILS. Use this instead, set per shell:
  `$env:NODE_PATH="C:\nvm4w\nodejs\node_modules"`
  then `require('@playwright/test')` and use its `chromium`.
- Chromium browsers are already downloaded (no `playwright install` needed).
- Work from the project root:
  `D:\Downloads\Bollam-Rishithej-Portfolio-Source(1)\Bollam-Rishithej-Portfolio-Source`
- IMPORTANT: in PowerShell, `$HOME` is read-only — never assign to a variable
  named `home`/`$home`. Use `$page`, `$doc`, etc.
- Write screenshots to: `C:\Users\varsh\AppData\Local\Temp\opencode\qa`

## Step 1 — overflow audit (numeric)
Run a headless Chromium audit against BOTH the live URL and the local file at
these widths: 320, 360, 390, 414, 600, 768, 834, 1024, 1180, 1280, 1440, 1920, 2560.

At each width, report `document.documentElement.scrollWidth - clientWidth` and, if
> 0, list the offending elements. Note: `.reveal` elements start at `opacity:0`;
scroll the full page gradually first so the IntersectionObserver fires, then
scroll back to top before measuring.

Pass criteria: horizontal overflow == 0 at every width (except the `.orbit` bbox
quirk noted above).

## Step 2 — visual screenshots (the actual review)
For widths 390 (phone), 834 (tablet), 1280 (laptop), and 1536 (desktop):
1. Load the page.
2. Force reveals visible so nothing is invisible:
   `document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'))`
3. Scroll through the whole page once (lazy images), then capture:
   - the `.hero` element
   - the `.venture-cards` element
   - the `.journey` element
   - the `.gallery` element
   - the `.contact` element
4. Save each as `qa/<name>-<width>.png`, e.g. `qa/phone-390-hero.png`.

Then ACTUALLY OPEN AND LOOK AT the PNGs (read the image files). Do not just
confirm they exist — inspect them.

## Step 3 — what to look for in each screenshot
- No text clipped at the right edge; no element cut off.
- Headlines fit their column without breaking a single word awkwardly
  (watch `INDUSTRIES.`, `BECOMING.`, `CONSEQUENCE.`, `OPERATIONS.`).
- Hero: headline + portrait + eyebrow + footer all legible and balanced.
- Venture cards: 3 columns on laptop/desktop, 1 column on phone, text not touching
  edges beyond the intended full-bleed padding.
- Gallery: phone = 2 portraits side by side with centered text above;
  tablet/laptop = 3-column editorial row.
- Journey timeline: phone = stacked, tablet/laptop = sticky heading + timeline.
- Contact: email link visible and not overflowing.
- Hero/portrait images are not stretched or pixelated.

## Step 4 — runtime health (live URL only)
Load https://bollam-rishithej.pages.dev/ and record:
- console errors (should be none)
- failed network responses >= 400 (should be none)
- `img` elements with `naturalWidth === 0` (should be none)
- count of `.reveal.in` vs total `.reveal` after scrolling (should be all shown)

## Step 5 — report back
Return a concise report:
1. Overflow audit table (width -> overflow px).
2. A list of any visual defects, each with: width, section, what's wrong,
   and the screenshot filename as evidence.
3. Runtime health results.
4. A one-line verdict: PASS or FAIL, plus the single most important thing to fix
   if FAIL.
If everything passes, say so plainly and attach/point to the 4 hero screenshots
as proof.

## Ready-to-run audit script (adapt as needed)
Save as `qa.js` and run with:
`$env:NODE_PATH="C:\nvm4w\nodejs\node_modules"; node qa.js`

```js
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const LOCAL = 'file://' + path.resolve(process.cwd(), 'dist/index.html').replace(/\\/g, '/');
const LIVE = 'https://bollam-rishithej.pages.dev/';
const out = path.join(process.env.TEMP, 'opencode', 'qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const targets = [{ name: 'live', url: LIVE }];
  for (const t of targets) {
    for (const w of [320, 390, 600, 768, 834, 1024, 1280, 1440, 1920, 2560]) {
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
  await browser.close();
})();
```
````

---

## What was changed (for reference)

- Replaced rigid `clamp()` heading sizes with fluid
  `min(max, calc((100vw - 48px) / N))`, where `N` is each heading's measured
  longest-word ratio, so headlines shrink to fit instead of overflowing.
- Fixed the `≤380px` hero override (`3rem`) that broke at 320px.
- Fixed the hero footer overflowing on very small phones (`flex:1; min-width:0`).
- Added `dist/_headers` (security headers + one-week `/assets/*` cache).
- Deployed to Cloudflare Pages; canonical/OG/JSON-LD/robots/sitemap point at
  `https://bollam-rishithej.pages.dev`.

**Last verified clean:** 320px–2560px, zero horizontal overflow; live site had
0 console errors, 0 failed requests, 0 broken images, 30/30 reveals firing.
