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

### Venture Portfolio & Statutory Roles (MCA / Companies Act, 2013)

Designations on this site are written to withstand a CA/CS review against the
public MCA21 register. Two rules govern everything:

1. **Section 203(1)** — a whole-time Key Managerial Person (Managing Director,
   Whole-Time Director, CEO, CFO, Company Secretary) **may not hold office in
   more than one company at a time**, except in that company's own subsidiary.
   The single KMP office is **ML Dynamic Solutions**. No other entity on this
   site may be labelled CEO or Managing Director.
2. **Section 165** — a person may hold at most 20 directorships (max 10 public).
   The matrix below is 12, comfortably compliant.

| # | Entity | Statutory designation | Domain |
|---|---|---|---|
| 1 | **ML Dynamic Solutions** | **Founder & Managing Director** — *sole s.203 KMP office*. DPIIT Recognized. | Enterprise digital backbones, sovereign cloud architecture |
| 2 | ML Group of Companies | Promoter & Director | Diversified holding group |
| 3 | ML Capital | Director — *subsidiary of the KMP company* | Proprietary venture capital compounding |
| 4 | Vidyuthlabs Technologies (`vidyuthlabs.co.in`) | Co-Founder & Director | Electrochemical sensing, micro-electrode arrays |
| 5 | Predictera (`predictera.com`) | Co-Founder & Director. DPIIT Recognized. | Edge computer vision, spatial video intelligence |
| 6 | FirstSecure.ai (`firstsecure.ai`) | Co-Founder & Director | Autonomous agentic AI cyber defence |
| 7 | DenyFix.ai | Co-Founder & Director *(Co-Founder — NOT a venture partner or employee)* | Touchless healthcare revenue cycle, claim denial recovery |
| 8 | CXOera | Director | Executive leadership consortium, board advisory |
| 9 | Akshara Groups Bullion | Director | Spot bullion trading, vaulting, wholesale liquidity |
| 10 | Jenani Infra | Director | Heavy civil infrastructure, logistics hubs, EPC |
| 11 | Aditya Trading Company | Director | Wholesale agricultural commodity supply chain |
| 12 | RS Food Products | Director | Staple milling, packaged consumer foods, distribution |

**Vocabulary discipline**

- **"Founder" / "Co-Founder" are business descriptors, not MCA designations.**
  Never let one stand alone as the statutory role — always pair it with
  Director, Managing Director or Promoter.
- **"Promoter"** is the s.2(69) term for a person who caused the company to be
  formed. Use it where there is no board seat to claim.
- An **LLP** takes **Designated Partner** (identifier: LLPIN), never Director.
  A **proprietorship** takes Proprietor; a **partnership firm** takes Partner or
  Managing Partner. Neither is a company, and neither has a CIN.
- **CEO** is only a lawful label where the company has actually designated one
  under s.2(18) and filed it. Because that office is taken by ML Dynamic
  Solutions, it must not appear against any other entity — including in `alt`
  text, image captions, JSON-LD `roleName`, meta descriptions or the brochure.
- **DIN / CIN / LLPIN are withheld** by the principal's instruction. Do not add
  them without explicit approval.

**When changing any designation,** update all five surfaces together: the
venture card in `dist/index.html`, the JSON-LD `worksFor` graph in the same
file, the company page and spec list in `dist/brochure.html`, any `alt` text
that names a role, and this table.

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
   The italic is the emphasis device — never outline or hollow type. This is the
   **only webfont the site loads**.
2. **Body & UI — the native system stack.** `-apple-system, BlinkMacSystemFont,
   'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', Roboto, …` — SF Pro on
   Apple, Segoe UI on Windows, Roboto on Android. Every reader gets the face
   their OS hints and renders best, it paints on the first frame, and there is
   no download and no swap-in shift.
3. **Metadata & serials — the native mono stack.** `ui-monospace, 'SF Mono',
   SFMono-Regular, Menlo, 'Cascadia Mono', 'Roboto Mono', …`. Section slugs,
   folios, reference codes, captions, pills, keyboard hints.

**Legibility rules — these were all measured failures, not preferences.**

- **Bodoni is a didone with an `opsz` axis (6–96).** Under
  `font-optical-sizing: auto` the browser feeds it the rendered size, so a 40px
  numeral gets the ~30pt *display* cut, whose hairlines are drawn for poster
  scale and drop out at UI sizes — "4" lost its crossbar, "MSc" looked damaged.
  Every mid-size display use therefore pins `font-variation-settings: 'opsz' 14`
  with `font-optical-sizing: none`. Only the hero `h1` and section `h2` keep the
  automatic display cut. **Do not remove those pins.**
- **`--ink-3` must clear 4.5:1 on `--paper-sunk`**, the worst-case surface. The
  previous `#737a87` measured 3.86:1 on paper and 3.46:1 on the sunk panel and
  failed AA everywhere it appeared. `#5a616d` gives 5.57:1 / 5.00:1.
- **Metadata floor is 14px** (`--t-meta`). 13px monospace uppercase was below
  comfortable reading size for the share of the page set that way.
- **Tracking on reading metadata stays at or below 0.08em.** Monospace is
  already wide, uppercase removes word-shape cues, and heavy tracking breaks
  word cohesion; all three at once is unreadable. Wide tracking (0.22–0.34em)
  is reserved for decorative, non-reading type: the vertical marginalia, the
  rotating seal, one display eyebrow.
- **Descriptive phrases and designations belong in the reading face, not
  tracked uppercase mono.** Mono is for serials, folios, reference codes and
  short taxonomy tags only. Specifically:

  | Element | Face | Why |
  |---|---|---|
  | Company name (`.venture-row h3`, `.company-title-meta h3`) | Display (Bodoni, `opsz` pinned) | Primary identifier |
  | Role line (`.row-role`, `.sign-tag`, `.company-title-meta span`) | Reading face, title case | Read as words, not scanned as a code |
  | Sector tag (`.row-sector`) | Mono, uppercase | Taxonomy label — the contrast with the role is what gives the row its hierarchy |
  | Serial / folio / ref (`.section-no`, `.page-serial`, `.row-index`) | Mono, uppercase | Genuine codes |
- Run `node type_audit.js` after any type or colour change. It reports every
  WCAG AA contrast failure with the measured ratio.

> **Apple fonts cannot be self-hosted.** Apple's licence covers interface design
> on Apple platforms, not webfont embedding. Referencing the installed face
> through `-apple-system` / `BlinkMacSystemFont` is the supported route and is
> what this site does. Do not add SF Pro `@font-face` files.
> Archivo and DM Mono were removed in favour of this stack — do not reinstate them.

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
   - **Overprinting the subject is forbidden; overprinting deliberate negative
     space is the point.** `hero-exec.*` is composed with the subject in the
     right third precisely so the headline can occupy the left. Type must never
     cross him at any width.
   - **Current portfolio imagery**
     | Asset | Ratio | Placement | Anchor |
     |---|---|---|---|
     | `hero-exec-*` | 16:9 | Hero, full-bleed on a `.tone-dark` block | `76% 22%` phone / `82% center` desktop |
     | `portrait-seated-*` | 4:5 | Statement (#story), B&W plate | `50% 28%`, capped to 44% on desktop |
     | `portrait-lobby-*` | 4:5 | Ventures, full-body | `50% 30%` |
     | `portrait-navy-*` | 4:5 | Closing, on ink | `50% 16%` |
     | `ml-dynamic-background-*` | 4:3 | Leadership spotlight | `50% 32%` |
   - `portrait-seated-*` carries a **real dark-grey ground, not a white border** —
     it must NOT use `mix-blend-mode: multiply`. Multiply is only correct for art
     whose border is pure white. Check the asset before applying it.
   - `editorial-bw-*` has pure-white borders and blends into paper with
     `mix-blend-mode: multiply`. `portrait-navy-*` has borders calibrated to
     absolute zero `rgb(0,0,0)`, so `.closing` is **pure `#000`, not
     `--ink-deep`** — at `#05070a` the delta is 22 and the plate reads as a
     faint rectangle. Never place it on paper.
   - **The other three plates feather into the page.** Measured, the edges of
     `portrait-seated`, `portrait-lobby` and `ml-dynamic-background` are busy
     photographic content (colour spread 38–141), not flat studio grounds, so
     no blend mode and no single flat colour can dissolve them. They carry a
     mask that fades to transparent, which matches whatever surface is behind
     by construction. Do not "simplify" that mask away.
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

### 2.35 The venture register — do not rebuild it as cards

The eight holdings are set as a **register**: ruled rows of
`[display numeral | identity | account]`, not a grid of bordered cards. The
card grid was removed because it read as templated — a 3-column set of rounded
boxes, company names in the UI sans rather than the display face, the accent
spent on every small label, and ragged card heights leaving dead voids.

Rules for this section:

- Company names use **`--font-display` at `clamp(1.6rem, 3.4vw, 2.6rem)`**. This
  is the single thing that makes the section read as designed. Never let them
  fall back to the UI sans.
- **One accent per row, and only where it carries meaning** — the DPIIT
  recognition. Not on sector labels, not on every link.
- The sole s.203 KMP office (`.is-principal`, ML Dynamic Solutions) is the only
  row given visual promotion, and it is promoted with a **rule, not a colour
  fill**.
- Hover state is **CSS only**: a ruled row and a drawn underline. The former
  3D perspective tilt and per-frame cursor spotlight were removed with the
  cards; do not reintroduce per-frame JavaScript here.
- Logos are **unboxed** and inline at 30px. The emblem-in-a-rounded-square was
  part of the templated look.
- **Grid placement must be explicit.** Each row has three children. In the
  720–1023px band the grid has only two columns, so `.row-detail` needs
  `grid-column: 2` — otherwise it auto-places into row 2 **column 1**, the
  46px numeral gutter, and renders as a 46px-wide ribbon ~600px tall. That
  rule must stay scoped to `max-width: 1023.98px`, or it drags the account out
  of the real third column on desktop.

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
