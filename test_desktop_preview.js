const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const localUrl = 'file://' + path.resolve(__dirname, 'dist/index.html').replace(/\\/g, '/');
  await page.goto(localUrl, { waitUntil: 'load' });

  // Add improved desktop styling
  await page.addStyleTag({
    content: `
      /* 1. Hero image: anchor right so face is not cut off */
      .hero-image img {
        object-position: right center !important;
      }

      /* 2. BW Frame: anchor top so head is fully intact */
      .bw-frame {
        height: 75vh !important;
        max-height: 750px !important;
        border-radius: 4px;
      }
      .bw-frame img {
        object-position: center top !important;
      }

      /* 3. Metric 2: fix spacing */
      .metric-plus {
        margin-left: 0.25rem;
      }

      /* 4. Gallery: elegant editorial proportions instead of giant stretched portraits */
      .gallery {
        padding: 7rem 6vw !important;
        gap: 4vw !important;
      }
      .gallery figure {
        height: 65vh !important;
        max-height: 600px !important;
        overflow: hidden;
        border-radius: 4px;
      }
      .gallery img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center top !important;
      }
      .short {
        transform: translateY(2rem) !important;
      }
      .gallery-center p {
        font-size: clamp(1.8rem, 2.4vw, 2.8rem) !important;
        line-height: 1.25 !important;
      }

      /* 5. Closing section: seamless blend with full uncropped portrait */
      .closing {
        height: 100vh !important;
        min-height: 700px !important;
        position: relative !important;
        overflow: hidden !important;
        background: #000000 !important;
        display: flex !important;
        align-items: center !important;
      }
      .closing picture {
        position: absolute !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: 55vw !important;
        display: flex !important;
        justify-content: flex-end !important;
        align-items: flex-end !important;
      }
      .closing-image {
        width: auto !important;
        height: 100% !important;
        max-width: 100% !important;
        object-fit: contain !important;
        object-position: right bottom !important;
        opacity: 0.92 !important;
      }
      .closing::after {
        content: "" !important;
        position: absolute !important;
        inset: 0 !important;
        background: linear-gradient(90deg, #000000 35%, rgba(0,0,0,0.6) 55%, transparent 80%) !important;
        pointer-events: none !important;
      }
      .closing-copy {
        position: relative !important;
        z-index: 2 !important;
        left: 5vw !important;
        top: auto !important;
        transform: none !important;
        max-width: 50vw !important;
      }
      .closing-copy h2 {
        font-size: clamp(4rem, 7.5vw, 9rem) !important;
        line-height: 0.82 !important;
      }
    `
  });

  // Force all reveals
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
  });

  // Scroll through entire page so all lazy images load
  for (let y = 0; y <= 12000; y += 400) {
    await page.evaluate(top => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const out = path.join(process.env.TEMP, 'opencode', 'qa', 'desktop_preview');
  fs.mkdirSync(out, { recursive: true });

  const sections = ['hero', 'statement', 'metrics', 'gallery', 'closing'];
  for (const s of sections) {
    const el = await page.$(`.${s}`);
    if (el) {
      await el.screenshot({ path: path.join(out, `${s}.png`) });
      console.log(`Saved preview: ${s}.png`);
    }
  }

  await browser.close();
})();
