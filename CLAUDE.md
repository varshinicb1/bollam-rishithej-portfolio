# CLAUDE.md — Instructions for Claude Code & Anthropic Models

This repository houses the personal portfolio, venture platform, and executive monograph of **Bollam Rishithej**.

## Critical Directives & Non-Negotiables
- Read and follow [AGENTS.md](AGENTS.md) as the primary source of truth.
- **NEVER use informal emojis** anywhere in the code or interface (use SVGs or clean typography).
- **Entities & Statutory Roles — MCA / Companies Act, 2013 compliant.**
  **Section 203 permits exactly ONE whole-time KMP office** (MD / WTD / CEO / CFO / CS),
  plus that company's own subsidiaries. That office is **ML Dynamic Solutions**.
  Never assign CEO or Managing Director to any other entity.

  | Entity | Designation |
  |---|---|
  | **ML Dynamic Solutions** | **Founder & Managing Director** *(the sole s.203 KMP office)* |
  | ML Group of Companies | Promoter & Director |
  | ML Capital | Director *(subsidiary of the KMP company)* |
  | Vidyuthlabs Technologies (`vidyuthlabs.co.in`) | Co-Founder & Director |
  | Predictera (`predictera.com`, DPIIT Recognized) | Co-Founder & Director |
  | FirstSecure.ai (`firstsecure.ai`) | Co-Founder & Director |
  | DenyFix.ai *(Co-Founder, NOT a venture/employee)* | Co-Founder & Director |
  | CXOera | Director |
  | Akshara Groups Bullion / Jenani Infra / Aditya Trading Company / RS Food Products | Director |
  | Emergera.ai *(**United States LLC — NOT an MCA company**)* | Co-Founder & Chief Technology Officer |

  - "Co-Founder" and "Founder" are **business descriptors, not MCA designations** — always
    pair them with the statutory term (Director / Managing Director / Promoter).
  - "Promoter" is the statutory term under **s.2(69)** for a person who caused the company
    to be formed; use it where there is no board seat to claim.
  - **s.165** caps directorships at 20 (max 10 public). The matrix holds **12 MCA directorships** —
    compliant. **Emergera.ai is a United States LLC and is NOT counted**: it falls outside the
    Companies Act entirely, so it is neither a directorship for s.165 nor an office for s.203.
  - **Foreign entities must be marked.** The register's own standfirst says designations are
    stated under the Companies Act, 2013, so any holding outside that Act carries a
    `jurisdiction` field rendered as `.row-juris`. Never list a foreign holding unmarked.
  - **CTO, CIO and CxO titles other than CEO/CFO are NOT s.203 KMP offices.** The five whole-time
    KMP offices are MD, WTD, CEO, CFO and CS. A CTO title elsewhere does not conflict with the
    sole KMP office at ML Dynamic Solutions.
  - **Verify a stated title against the company's own site before publishing it.** Emergera.ai
    publicly lists him as Chief Technology Officer; an earlier instruction said "Director". The
    company's own listing won. Do not propagate a title that its own company contradicts.
  - Any entity that is an **LLP** takes **Designated Partner**, never Director. Any
    **proprietorship or partnership firm** takes Proprietor / Partner and is not MCA-registered.
  - Do not publish DIN, CIN or LLPIN numbers — withheld by the principal's instruction.
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
  - Fonts: `Bodoni Moda` (display, the only webfont) + the **native system stack**
    for body/UI and metadata — SF Pro on Apple, Segoe UI on Windows, Roboto on
    Android. SF cannot legally be shipped as a webfont; reference the installed
    face via `-apple-system` / `BlinkMacSystemFont`. Never add Archivo or DM Mono back.
  - The **hero is a `.tone-dark` block**: the plate is a night-office photograph and
    the headline sits in its left negative space. `script.js` toggles `.nav-on-dark`
    while the bar overlaps it.
  - Photography is never overprinted with text, and faces are anchored with `object-position`.
- **Deploy:** `npx wrangler pages deploy dist --project-name=bollam-rishithej --branch=main`.
