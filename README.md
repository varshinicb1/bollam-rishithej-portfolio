# Bollam Rishithej — Executive Web Presence & Venture Monograph

Institutional personal portfolio, venture platform, and executive monograph for **Bollam Rishithej** — Founder, Chief Executive Officer, and Principal Investor across deep technology, autonomous artificial intelligence, and heavy sovereign industrial operations.

🌐 **Live Portfolio:** [https://bollam-rishithej.pages.dev/](https://bollam-rishithej.pages.dev/)  
📑 **Executive Monograph (Web):** [https://bollam-rishithej.pages.dev/brochure.html](https://bollam-rishithej.pages.dev/brochure.html)  
💼 **Verified LinkedIn:** [https://www.linkedin.com/in/rishithej-bollam-5b7638362/](https://www.linkedin.com/in/rishithej-bollam-5b7638362/)

---

## 🏛️ Executive Doctrine

> *"Build the best startup ecosystem in India and build for the world from India."*

Bollam Rishithej holds a **Master of Science in Advanced Mechanical Engineering with Management from the University of Leicester (United Kingdom)** and a B.Tech in Mechanical Engineering. His operational framework executes a dual-engine model: incubating sovereign frontier technology (electrochemical sensing, autonomous cybersecurity agents, computer vision, and healthcare financial AI) funded and backed by essential physical cashflow operations (precious metals bullion, civil infrastructure, commodity trading, and consumer food manufacturing).

---

## 🚀 Venture Portfolio

| Venture | Executive Role | Focus Domain | Official Portal / Recognition |
| :--- | :--- | :--- | :--- |
| **Vidyuthlabs Technologies** | Co-Founder | Deep Electrochemical Sensing & Analytical Instrumentation | [vidyuthlabs.co.in](https://vidyuthlabs.co.in) |
| **Predictera** | Co-Founder | Sovereign Edge Computer Vision & Video Cognition AI | [predictera.com](https://predictera.com) &bull; **DPIIT Recognized** |
| **FirstSecure.ai** | Co-Founder & CEO | Autonomous Agentic AI SOC & Cyber Defense Grids | [firstsecure.ai](https://firstsecure.ai) |
| **DenyFix.ai** | Co-Founder | Touchless Healthcare Revenue Cycle Intelligence & Appeals | Hospital RCM Systems |
| **ML Group / ML Capital** | Founder & MD | Enterprise Digital Architecture & Proprietary Venture Capital | [mldynamic.com](https://mldynamic.com) &bull; **DPIIT Recognized** |
| **CXOera** | CEO | Global C-Suite Governance, Syndicates & Board Advisory | Executive Network |
| **Akshara Groups Bullion** | Principal | Physical Gold & Silver Spot Bullion Trading & Vaulting | Commodity Treasury |
| **Jenani Infra** | Principal | Heavy Civil Infrastructure, Logistics Hubs & EPC | Physical Asset Base |
| **Aditya Trading Company** | Principal | Wholesale Agricultural Grain Logistics & Arbitrage | Cash Flow Engine |
| **RS Food Products** | Principal | High-Throughput Food Processing & Packaged Retail | Consumer Staple Network |

---

## 🎨 Design System & Visual Architecture

The system is **"Monograph"** — light-first and editorial, modelled on a printed
executive monograph rather than a dark product site. See `AGENTS.md` §2 for the
binding specification.

- **Color Palette** (semantic tokens; never hard-code a hex in a component):
  - Monograph Paper: `#f4f2ec` — the default canvas
  - Recessed Panel: `#e9e6dd` &bull; Raised Card: `#fbfaf7`
  - Ink: `#0b0d11` &bull; Secondary: `#3f4550` &bull; Metadata: `#737a87`
  - Volt Accent: `#c6ff35` — **dark contexts only**; on paper use `#46610d`
  - Plate / Deep Ink: `#05070a` — dark blocks and photographic plates
- **Dark blocks** opt in with `class="tone-dark"`, which re-declares the same
  token names inverted. Components carry no dark-specific rules.
- **Typography:**
  - Display: `Bodoni Moda` (400–900, italic) — headlines, numerals, pull-quotes
  - Body & UI: `Archivo` (400, 500, 600, 700)
  - Monospace / Serials: `DM Mono` (400, 500)
  - No text computes below 12px at any viewport.
- **Zero Informal Emojis:** The entire web presence strictly enforces zero emoji glyphs, utilizing clean inline vector SVGs or typographic marks (`↗`, `//`, `CMD K`).
- **Protected Photography:** Headlines never overprint a face. Every art-directed image anchors the subject with `object-position`; white-bordered plates multiply into paper and black-bordered plates sit on deep ink, so no border artifact is ever visible.
- **Responsive:** Verified at 320–1920px with zero horizontal overflow and 44px minimum touch targets.

---

## 🤖 AI Agent Guidelines

For autonomous AI coding assistants (Antigravity, Cursor, Windsurf, Claude Code, Copilot), refer to the comprehensive guidelines:
- **[AGENTS.md](AGENTS.md)** — Master specification for agents (rules, entity details, testing commands, pre-commit checklist)
- **[CLAUDE.md](CLAUDE.md)** — Directives for Claude Code
- **[.cursorrules](.cursorrules)** — Guardrails for Cursor
- **[.windsurfrules](.windsurfrules)** — Guardrails for Windsurf

---

## 🛠️ Local Development & Deployment

### Run Locally
Serve the `dist/` directory using any static web server:
```bash
# Python
python -m http.server 8080 --directory dist

# Node.js
npx serve dist
```

### Regenerate Personal Executive Brochure PDF
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
    print('Personal PDF compiled successfully')
    browser.close()
"
```

### Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name=bollam-rishithej --branch=main
```

---

## 📜 Copyright & Governance

&copy; 2026 Bollam Rishithej. All rights reserved. Intellectual property and registered trademarks belong to their respective corporate entities.
