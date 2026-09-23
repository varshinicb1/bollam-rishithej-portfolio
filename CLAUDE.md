# CLAUDE.md — Instructions for Claude Code & Anthropic Models

This repository houses the personal portfolio, venture platform, and executive monograph of **Bollam Rishithej**.

## Critical Directives & Non-Negotiables
- Read and follow [AGENTS.md](AGENTS.md) as the primary source of truth.
- **NEVER use informal emojis** anywhere in the code or interface (use SVGs or clean typography).
- **Entities & Roles:**
  - Co-Founder of **DenyFix.ai** (NOT a venture/employee).
  - Co-Founder & CEO of **FirstSecure.ai** (`firstsecure.ai`).
  - Co-Founder of **Predictera** (`predictera.com`, DPIIT Recognized Startup).
  - Co-Founder of **Vidyuthlabs Technologies** (`vidyuthlabs.co.in`).
  - Founder & MD of **ML Group / ML Dynamic** (DPIIT Recognized Startup) & **ML Capital**.
  - CEO of **CXOera**.
- **Brochure Company Sequence:**
  - Company Page 1: Vidyuthlabs Technologies
  - Company Page 2: Predictera
  - Company Page 3: FirstSecure.ai
  - Company Page 4: DenyFix.ai
  - Company Page 5: ML Group & Capital
  - Company Page 6: CXOera
  - Followed by Industrial Assets (Akshara Bullion, Jenani Infra, Aditya Trading, RS Foods) and Executive Office.
- **Design System — "Monograph" (light-first, editorial):**
  - Canvas is **paper**, not ink. `--paper #f4f2ec` / `--ink #0b0d11`. See `AGENTS.md` §2 for the full token set.
  - `--acid #c6ff35` is a **dark-context accent only**. On paper it fails contrast (~1.5:1); use `--acid-ink #46610d` there. Never hard-code either — go through the token.
  - Dark blocks are opted in with `class="tone-dark"`, which re-declares the same semantic tokens inverted. Do **not** write dark-specific component rules.
  - Fonts: `Bodoni Moda` (display), `Archivo` (body/UI), `DM Mono` (metadata, serials).
  - Photography is never overprinted with text, and faces are anchored with `object-position`.
- **Deploy:** `npx wrangler pages deploy dist --project-name=bollam-rishithej --branch=main`.
