# AGENTS.md — AI Coding Assistant & Developer Guidelines

> **Target Audience:** Autonomous AI coding agents (Antigravity, Claude Code, Cursor, Windsurf, Copilot, Codex, Gemini CLI) and software engineers contributing to the **Bollam Rishithej Executive Portfolio & Venture Monograph**.

---

## 1. Executive Summary & Core Identity

This project is the flagship institutional web presence, venture portfolio, and executive monograph for **Bollam Rishithej** — a high-conviction deep-tech founder, operator, and principal investor.

### Key Executive Facts & Non-Negotiable Context
- **Name:** Bollam Rishithej
- **Academic Foundation:** MSc in Advanced Mechanical Engineering with Management, University of Leicester (United Kingdom) &bull; B.Tech Mechanical Engineering
- **Overarching Vision:** *"Build the best startup ecosystem in India and build for the world from India."*
- **Official Portfolio URL:** `https://bollam-rishithej.pages.dev/`
- **Official Brochure / Dossier URL:** `https://bollam-rishithej.pages.dev/brochure.html`
- **Verified LinkedIn Profile:** `https://www.linkedin.com/in/rishithej-bollam-5b7638362/`
- **Official Communications:** `rishi@mldynamic.com` &bull; `rishithej@firstsecure.ai`

### Venture Portfolio & Roles (Strict Entity Mapping)
When referencing or modifying any company details, **ALWAYS** preserve these exact roles and designations:
1. **Vidyuthlabs Technologies** (`vidyuthlabs.co.in`): Co-Founder. Deep-tech electrochemical sensing instrumentation, micro-electrode arrays, and portable analytical chemistry platforms.
2. **Predictera** (`predictera.com`): Co-Founder. **DPIIT Recognized Startup (Govt. of India)**. Edge computer vision, camera-to-cognition AI, and real-time spatial video intelligence.
3. **FirstSecure.ai** (`firstsecure.ai`): Co-Founder & Chief Executive Officer (CEO). Autonomous agentic AI cybersecurity and self-healing SOC defense systems.
4. **DenyFix.ai**: Co-Founder. Touchless healthcare revenue cycle intelligence and algorithmic insurance claim denial recovery. *(Note: He is Co-Founder of DenyFix.ai, NOT a venture partner or employee).*
5. **ML Group of Companies / ML Dynamic / ML Capital**: Founder & Managing Director. **DPIIT Recognized Startup (Govt. of India)**. Enterprise digital backbones, sovereign cloud architectures, and proprietary venture capital compounding.
6. **CXOera**: Chief Executive Officer (CEO). Global executive leadership consortium, board advisory, and sovereign venture syndicates.
7. **Industrial Assets & Operations**:
   - **Akshara Groups Bullion:** Precious metals spot bullion trading, vaulting, and wholesale liquidity.
   - **Jenani Infra:** Heavy civil infrastructure contracting, logistics hubs, and EPC.
   - **Aditya Trading Company:** Wholesale agricultural commodity supply chain arbitrage.
   - **RS Food Products:** High-throughput staple milling, packaged consumer foods, and regional distribution.

---

## 2. Strict Design System & Brand Guardrails — "MONOGRAPH"

The system is **light-first and editorial**: a printed executive monograph, not a
dark product site. Reference points are Pentagram annual reports and serious
print monographs — large asymmetric display type, generous margins, hairline
rules, and photography that is given room and never overprinted.

### 2.1 Colour — semantic tokens only

Colour is expressed as semantic tokens. **Never hard-code a hex inside a
component.** Both `dist/styles.css` and `dist/brochure.css` declare this set.

```css
:root {
  --paper:        #f4f2ec;   /* warm monograph paper — the default canvas */
  --paper-sunk:   #e9e6dd;   /* recessed panel / alternating page stock */
  --paper-raised: #fbfaf7;   /* raised card */
  --ink:          #0b0d11;   /* primary text */
  --ink-2:        #3f4550;   /* secondary text */
  --ink-3:        #737a87;   /* metadata, captions */
  --rule:         rgba(11, 13, 17, 0.16);
  --rule-soft:    rgba(11, 13, 17, 0.08);

  --acid:     #c6ff35;  /* accent — DARK CONTEXT ONLY */
  --acid-ink: #46610d;  /* the accent, darkened for use on paper */
  --ink-deep: #05070a;  /* canonical dark block / photographic plate */
}
```

**The `.tone-dark` contract.** Dark blocks opt in with `class="tone-dark"`,
which re-declares the *same token names* inverted (and resets `--acid-ink` back
to full `--acid`). Components therefore need **no dark-specific rules of their
own** — write one rule set against the tokens and it renders correctly on both
grounds. In `brochure.css` the photographic plate classes
(`.panel-photo-hero`, `.cover-portrait-frame`, `.panoramic-header-banner`)
inherit the same inversion.

**Accent discipline.** `--acid` on `--paper` measures roughly 1.5:1 and is
unreadable. On paper the accent role is carried by ink, hairline rules, and
`--acid-ink`. Reach for `--acid` only inside a dark block.

### 2.2 Typography

1. **Display — `'Bodoni Moda', serif`** (400–900, italic available). Headlines,
   metric numerals, pull-quotes, the wordmark. Use `font-optical-sizing: auto`.
   The italic is the emphasis device — never outline or hollow type.
2. **Body & UI — `'Archivo', sans-serif`** (400/500/600/700). Prose, subheads,
   buttons, labels.
3. **Metadata & serials — `'DM Mono', monospace`** (400/500). Section slugs,
   folios, reference codes, captions, pills, keyboard hints.

Type is fluid via `clamp()` on tokens (`--t-display` … `--t-meta`). **No text
may compute below 12px at any viewport** — `--t-meta` (13px) is the floor.

### 2.3 Non-negotiable styling rules

1. **ZERO INFORMAL EMOJIS.** Never introduce emojis (⚡ 📋 ✉ 🚀 ✓ ✕ etc.) into
   user-facing code or templates. Use inline SVG or precise typographic
   symbols (`↗`, `↑`, `↓`, `//`, `•`, `—`).
2. **Photography is protected.**
   - Headlines and badges never sit across a face. Copy goes beside or beneath
     the image; overlay badges are confined to a corner clear of the subject.
   - Every art-directed image sets `object-position` to anchor the face.
     Brochure anchors are calibrated per asset (`.photo-ceremonial`,
     `.photo-hero-half`, …) — do not retune them casually.
   - `hero-half.*` is a **half portrait**: the subject occupies the right ~30%
     of the frame. Narrow viewports crop horizontally to the face
     (`aspect-ratio: 5/8; object-position: 100% 16%`); ≥900px restores the full
     composition at 3/4.
   - `editorial-bw-*` has pure-white borders and blends into paper with
     `mix-blend-mode: multiply`. `portrait-navy-*` has pure-black borders and
     must sit on `--ink-deep` (a `.tone-dark` block or a plate), never on paper.
3. **`img { height: auto }` is mandatory.** Every `<img>` carries `width`/
   `height` attributes, which map to presentational `height` declarations, and
   `aspect-ratio` is ignored unless one axis is `auto`. Omit it and every
   art-directed crop silently reverts to the intrinsic pixel height.
4. **Global anchor reset required.** `a { color: inherit; text-decoration: none }`.
   Without it, any link whose component rule omits `color` falls through to the
   user-agent blue — this shipped previously on `.contact-link` and `footer a`.
5. **`backdrop-filter` creates a containing block** for `position: fixed`
   descendants. The header blur therefore lives on `.nav::before`, not on
   `.nav`; putting it on `.nav` traps the mobile drawer inside the 76px bar.
6. **State classes belong to specific elements.** `script.js` toggles `.open` on
   the **header** (`.nav`), not on the inner `<nav>` — the drawer selector is
   `.nav.open nav`.

### 2.4 Responsive standards

- Breakpoints: **560 / 620 / 720 / 768 / 900 / 1024 / 1280**. Layout is fluid
  between them via `clamp()`; `--gutter: clamp(22px, 5.2vw, 88px)`.
- Verified widths: **320, 360, 375, 390, 414, 480, 640, 768, 834, 1024, 1180,
  1280, 1440, 1920**.
- **Zero horizontal overflow** at every width. Verify with `overflow-x` forced
  to `visible` — `overflow-x: hidden` on `body` clamps `scrollWidth` and will
  hide genuine offenders from a naive check.
- **Touch targets ≥ 44×44px.** Inline links inside running prose are the only
  exemption (WCAG 2.5.8); a link that is a row's sole control is not.
- Long URLs and handles must never break mid-token. Shorten the visible label
  and keep the full `href`.
- Data tables collapse to labelled records below 768px via `td[data-label]`.
- `prefers-reduced-motion: reduce` must disable transforms, clip-path wipes and
  the rotating seal, and force all `.reveal` content visible.

### 2.5 Motion

One restrained gesture per element. Content rises and fades in once; images
wipe open with `clip-path` — a print-plate gesture. No parallax, no bouncing,
no scattered micro-interactions. Hover translations are suppressed under
`(hover: none), (pointer: coarse)` so they cannot stick after a tap.

## 3. Project Directory Structure

```
.
├── dist/                          # Production build output (deployed to Cloudflare)
│   ├── assets/                    # Optimized WebP/JPEG images, SVG vectors, and logos
│   │   ├── vidyuthlabs-logo.svg   # Official Vidyuthlabs vector emblem
│   │   ├── predictera-logo.png    # Official Predictera brand logo
│   │   ├── firstsecure-logo.svg   # Official FirstSecure.ai vector shield
│   │   ├── denyfix-logo.svg       # Official DenyFix.ai vector emblem
│   │   ├── ml-group-logo.svg      # ML Group monolithic crest
│   │   ├── ml-dynamic-logo.svg    # ML Dynamic vector mark
│   │   ├── cxoera-logo.svg        # CXOera geometric chevron
│   │   ├── akshara-logo.svg       # Akshara Bullion ingot emblem
│   │   ├── jenani-infra-logo.svg  # Jenani Infra structure mark
│   │   ├── aditya-trading-logo.svg# Aditya Trading grain vector
│   │   ├── rs-foods-logo.svg      # RS Foods seal
│   │   ├── editorial-bw-*.webp    # Background-blended portrait (paper section)
│   │   ├── portrait-navy-*.webp   # Pure-black blended portrait (closing section)
│   │   └── hero-3d-loop.mp4       # Video asset
│   ├── _headers                   # Cloudflare Pages security & caching headers
│   ├── index.html                 # Flagship interactive portfolio SPA
│   ├── styles.css                 # Portfolio stylesheet
│   ├── script.js                  # Accessible animations, Command Palette (CMD K), acoustics
│   ├── brochure.html              # 10-page Institutional Executive Dossier & Monograph
│   ├── brochure.css               # Brochure styling and print/PDF layout rules (@media print)
│   ├── robots.txt                 # Search engine directives
│   └── sitemap.xml                # Canonical sitemap
├── Bollam_Rishithej_Executive_Brochure.pdf # Personal compiled executive brochure (not public)
├── AGENTS.md                      # This specification file for AI coding agents
├── CLAUDE.md                      # Instructions for Claude Code / Anthropic agents
├── .cursorrules                   # Rules file for Cursor IDE
├── .windsurfrules                 # Rules file for Windsurf IDE
├── .gitignore                     # Git exclusion rules
├── README.md                      # Public project README
└── QA-HANDOVER.md                 # Historic audit and QA verification log
```

---

## 4. Executive Brochure Protocol (10-Page Monograph)

When modifying or expanding the executive brochure (`dist/brochure.html` and `dist/brochure.css`):
1. **Strict Page Sequence:**
   - **Page 01:** Cover Dossier (`BR-MONO-2026-01` — Cover title, portrait, doctrine).
   - **Page 02:** Executive Profile & Strategic Doctrine (`BR-MONO-2026-02` — University of Leicester MSc, about him, operating model).
   - **Page 03:** Company 1 &mdash; **Vidyuthlabs Technologies** (`BR-VENTURE-01` &mdash; electrochemical sensing, micro-electrodes).
   - **Page 04:** Company 2 &mdash; **Predictera** (`BR-VENTURE-02` &mdash; DPIIT recognized, edge computer vision).
   - **Page 05:** Company 3 &mdash; **FirstSecure.ai** (`BR-VENTURE-03` &mdash; autonomous SOC cyber defense).
   - **Page 06:** Company 4 &mdash; **DenyFix.ai** (`BR-VENTURE-04` &mdash; healthcare claim denial recovery).
   - **Page 07:** Company 5 &mdash; **ML Group & ML Capital** (`BR-VENTURE-05` &mdash; DPIIT recognized enterprise software & investments).
   - **Page 08:** Company 6 &mdash; **CXOera** (`BR-VENTURE-06` &mdash; C-suite syndicate consortium).
   - **Page 09:** Industrial Operations & Commodities (`BR-FOUNDATION-01` &mdash; Akshara Bullion, Jenani Infra, Aditya Trading, RS Foods).
   - **Page 10:** Office of Bollam Rishithej (`BR-MONO-2026-10` &mdash; direct channels, governance, confidentiality).
2. **Print & PDF Standards:**
   - In `@media print`, each page must have `page-break-after: always !important;` and render on a crisp white background with dark typography for ultra-high-definition physical printing.
   - The PDF generation script uses Playwright with `A4` format and `print_background=True`.

---

## 5. Development & Testing Commands

### Local Inspection
Open `dist/index.html` or `dist/brochure.html` directly in any web browser, or launch a local static server:
```bash
# Using Python
python -m http.server 8080 --directory dist

# Or using npx
npx serve dist
```

### Automated Headless Browser Verification
To run headless layout verification and screenshot regression tests:
```bash
# Using Microsoft Edge directly
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --window-size=1440,900 --screenshot=dist/test.png "file:///absolute/path/to/dist/index.html"

# Using Python Playwright
python -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:8080')
    print('Title:', page.title())
    browser.close()
"
```

### Regenerating the Personal Executive Brochure PDF
```bash
python -c "
import os
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', headless=True)
    page = browser.new_page()
    file_uri = 'file:///' + os.path.abspath('dist/brochure.html').replace('\\', '/')
    page.goto(file_uri, wait_until='networkidle')
    page.pdf(path='Bollam_Rishithej_Executive_Brochure.pdf', format='A4', print_background=True)
    print('Personal brochure PDF compiled successfully')
    browser.close()
"
```

### Deploying to Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name=bollam-rishithej --branch=main
```

---

## 6. Pre-Commit Checklist for Autonomous Agents
Before finalizing any code change or deployment, verify:
- [ ] No informal emoji characters introduced anywhere in `dist/*.html`, `dist/*.js`, or `dist/*.css`.
- [ ] Zero broken images or missing asset links (`naturalWidth > 0` on loaded images).
- [ ] DPIIT recognition badges correctly present on **ML Dynamic** and **Predictera**.
- [ ] Co-Founder role correctly maintained for **DenyFix.ai** and **Predictera**.
- [ ] Co-Founder & CEO role correctly maintained for **FirstSecure.ai**.
- [ ] Brochure starts with **Vidyuthlabs Technologies** on Company Page 1, followed immediately by **Predictera** on Company Page 2.
- [ ] LinkedIn link resolves to `https://www.linkedin.com/in/rishithej-bollam-5b7638362/`.
- [ ] No unhandled JavaScript console errors.
- [ ] Both desktop (1440px) and mobile (390px) responsive layouts render without horizontal scroll or truncated text.
