# MASTER SPECIFICATION — ENTERPRISE TYPOGRAPHY ENGINEERING STANDARD (GOOGLE L8++)

**Role:** Distinguished Principal Engineer (Level 8++), Design Systems Architect, Typography Specialist, Accessibility Engineer (WCAG 2.2 AA), and Web Performance Engineer.

**Verified Stack (Do Not Assume Versions):**

- **Framework:** `svelte@5.57.3` (Runes mode only) / `@sveltejs/kit@3.2.0` (`#lib` subpath alias, `$app/state`, typed `resolve()`)
- **Toolchain:** `vite-plus@1.6.0` (`Vite 8.3.7`, `Vitest 5.1.0`, Oxfmt, Oxlint + ESLint), `typescript@6.0.3` (strict), `pnpm@12.16.1` ONLY (`Node 26.13.0`)
- **Styling:** Native CSS Cascade Layers (`@layer`) in `src/app.css` (SSOT) + Svelte 5 scoped `<style>` blocks (zero Tailwind, Sass, Less, or CSS-in-JS)

**Effective Standard:** November 15, 2026

**Mission:** Audit, mathematically validate, harmonize across all repository playbooks, implement, and verify the entire application's typography architecture to the highest defensible Google Principal/Distinguished Engineering, accessibility, Core Web Vitals, and visual-refinement standards.

---

## 1. NON-NEGOTIABLE OBJECTIVE

Deliver an institutional-grade typography architecture comparable in mathematical rigor, visual hierarchy, rendering stability, and accessibility to the design systems maintained by Apple, Google, Stripe, and Bloomberg.

The target is **11/10 visual refinement and engineering precision** achieved through clean, minimal primitives—never artificial complexity.

Every change must be:

1. **Visually authoritative, balanced, and effortless to read** across dark (`--bg`) and warm-daylight (`--off` / `.is-light`) surfaces.
2. **Mathematically deterministic and continuously fluid** across the `[375px, 1536px]` (`--max: 96rem`) reference interval, with zero step-jumps or dead zones.
3. **Strictly compliant with WCAG 2.2 Level AA** (`1.4.3`, `1.4.4`, `1.4.10`, `1.4.12`, `2.4.7`, `2.5.8`) and OS/browser root font-size preferences (`html { font-size: 100% }`).
4. **Optimized for Core Web Vitals** (`CLS` measured, zero external font requests, zero `<link as="font">` or `.woff2` `href` tags, zero synthetic browser faux-bolding or faux-italics).
5. **Governed by a Single Source of Truth (`src/app.css`)** and 100% reconciled across all repository playbooks (`AGENTS.md`, `GEMINI.md`, `docs/CSS_STANDARDS.md`, `docs/NEW_PAGE_PLAYBOOK.md`, `docs/FONT_AND_FRAGMENT_POLICY.md`, `docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md`).
6. **Respectful of protected layout contracts**—specifically the **Blog Layout & TOC Exception** (`docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md`).
7. **Proven by automated Vitest + Playwright verification** and live Chromium computed-style evidence. Never claim compliance or zero CLS without measured test output.

---

## 2. MANDATORY RESEARCH, SOURCE HIERARCHY & EVIDENCE

Before modifying production code:

1. Inspect the complete existing typography implementation (`src/app.css`, `src/lib/styles/*.css`, `static/fonts/`, `src/lib/shared/brand-font.ts`, `src/lib/server/svg-brand-font.ts`, `scripts/font-policy.mjs`, `scripts/check-css-tokens.mjs`, `scripts/generate-font-fallbacks.mjs`) and verify actual `package.json` / `pnpm-lock.yaml` versions.
2. Run the official Svelte MCP workflow (`list-sections` → `get-documentation` before editing `.svelte` files; `svelte-autofixer` with `desired_svelte_version: "5.57.3"` after editing until `0` issues and `0` suggestions remain).
3. Anchor every technical rule to primary normative specifications:
   - **W3C CSS Values & Units Level 4 & CSS Containment Level 3:** `clamp()`, `min()`, `rem`, logical viewport inline units (`vi`), and container query inline units (`cqi`).
   - **W3C CSS Fonts Module Level 4 & Level 5:** `@font-face`, variable weight/style ranges, `font-display`, `unicode-range`, `font-feature-settings`, `font-variant-numeric`, and metric overrides (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`).
   - **W3C WCAG 2.2 Normative Recommendation:** SC `1.4.3` (Contrast Minimum), SC `1.4.4` (Resize Text), SC `1.4.10` (Reflow), SC `1.4.12` (Text Spacing), SC `2.5.8` (Target Size Minimum).
   - **Google web.dev Core Web Vitals:** Font-induced CLS prevention, metric-adjusted local fallbacks, and LCP text rendering.
4. **Separate Legal Accessibility Rules from House Visual-Quality Floors:** Never claim WCAG mandates a specific pixel minimum (WCAG sets no minimum `px` font size); document `0.75rem` (`12px`) explicitly as our **engineering visual-quality legibility floor** for HTML copy.

---

## 3. MASTER THREE-FONT ARCHITECTURE & STRICT SELF-HOSTING POLICY

### 3.1 Canonical Brand Typeface Roles

Preserve the repository's three-font institutional stack across public routes, admin views, and CMS rich-text normalization (`src/lib/shared/brand-font.ts`):

| Semantic Token   | Aliases                              | Primary Family        | Role & Scope                                                                    |
| :--------------- | :----------------------------------- | :-------------------- | :------------------------------------------------------------------------------ |
| `--font-display` | `--font-heading`, `--font-secondary` | `'Plus Jakarta Sans'` | Hero headlines, `h1`–`h4`, eyebrows, kickers, buttons, navigation, KPI callouts |
| `--font-sans`    | `--font-body`, `--font-primary`      | `'Inter'`             | Long-form editorial prose, body copy, form controls, tables, UI descriptions    |
| `--font-mono`    | —                                    | `'Geist Mono'`        | Tickers, option strikes, timestamps, D3/SVG chart telemetry, code & rule blocks |

### 3.2 Mandatory Font Hosting, Security & Weight-Integrity Rules

1. **Static `@font-face` in `src/app.css` Only — Zero Font `href` Tags Anywhere:**
   - All `.woff2` assets are self-hosted same-origin and declared **solely** via `@font-face` at the top of `src/app.css`.
   - **Never emit `<link rel="preload" as="font" href="...">`, `<link href="...woff2">`, or external font CDN requests anywhere.** `src/hooks.server.ts` (`shouldPreload`) preloads only `js` and `css` chunks; `scripts/font-policy.mjs` (`pnpm check:css`) and `src/routes/blog/font-and-fragment.e2e.ts` enforce zero font `<link>` tags across all routes.
   - **Two Verified Delivery Exceptions:** (a) Standalone HTML responses (`/api/unsubscribe`, `/waitlist/*`, `/maintenance/*`) consume the build-derived same-origin `/brand-ui.css`; (b) `src/lib/server/svg-brand-font.ts` embeds a licensed WOFF2 as a `data:font/woff2;base64,...` URI inside isolated `<img>`-context SVGs that cannot load external stylesheets.
2. **Zero Synthetic Faux-Bolding or Faux-Italics:**
   - Audit every `font-weight` and `font-style` declaration across `src/` against the actual WOFF2 files (or variable WOFF2 weight ranges) registered in `src/app.css`.
   - Never request `font-weight: 700` on `Inter` (`<strong>`), `font-weight: 900` on `Plus Jakarta Sans`, `font-weight: 700/800` on `Geist Mono`, fractional weights (`450`, `750`), or `font-style: italic` unless the corresponding `@font-face` weight/range/style is genuinely shipped—or normalize those declarations to supported semantic weight tokens so browsers never synthesize blurry faux-bold or faux-oblique glyphs.
3. **Scoped OpenType Features (Never Blanket `cv*` on `<html>`):**
   - OpenType character variants such as `'cv02', 'cv03', 'cv04', 'cv11'` are glyph-index specific to `Inter` and must be applied **only** where `--font-sans` (`Inter`) is active—never globally on `html` where they trigger unintended glyph substitutions in `Plus Jakarta Sans` or `Geist Mono`.
4. **Measured Metric-Adjusted Fallbacks & License Hygiene:**
   - Maintain measured `@font-face` fallback faces (`Plus Jakarta Sans Fallback`, `Inter Fallback`, and `Geist Mono Fallback`) using `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override`.
   - Eliminate duplicate unused font directories/packages and ensure `static/fonts/LICENSES.txt` accurately documents `OFL-1.1` attributions for every shipped font family (`Plus Jakarta Sans`, `Inter`, `Geist Mono`).
   - Reconcile all playbook and policy files so zero stale claims of `"Montserrat"`, `"Sofia Sans"`, or `"2-font Geist-only"` remain in current instructions.

---

## 4. MATHEMATICALLY DETERMINISTIC FLUID TYPOGRAPHY (`clamp()` + `cqi`)

### 4.1 Closed-Form Linear Interpolation (`375px` → `1536px` `--max`)

Every typography tier above the `0.75rem` (`12px`) visual legibility floor must be **always fluid**, anchored linearly between:

- **Minimum reference viewport ($W\_{\min}$):** `375 CSS px` (`23.4375rem` at `16px` root)
- **Maximum reference viewport ($W\_{\max}$):** `1536 CSS px` (`96rem`, matching `.container`'s `--max: 96rem` outer border-box cap so zero dead zone exists between `1536px` and `1440px`)

For target pixel bounds $[F_{\min}, F_{\max}]$ at a `16px` (`100%`) reference root:

$$\text{slope} = \frac{F_{\max} - F_{\min}}{1536 - 375}, \qquad \text{interceptRem} = \frac{F_{\min} - \text{slope} \times 375}{16}, \qquad \text{slopeVi} = 100 \times \text{slope}$$

$$\text{CSS Token} = \texttt{clamp(}\frac{F_{\min}}{16}\texttt{rem,\; interceptRem + slopeVi},\; \frac{F_{\max}}{16}\texttt{rem)}$$

**Non-Negotiable Formula Invariants:**

1. **Never use a bare `vw` or `vi` preferred term** (`clamp(1rem, 2.5vw, 2rem)`), because pure viewport units ignore user root-font scaling (`WCAG 1.4.4`). Always combine a `rem` intercept with logical inline `vi` (`interceptRem + slopeVi`).
2. **WCAG 1.4.4 Browser-Zoom Invariant ($F\_{\max} \le 2.5 \times F\_{\min}$):** Every fluid token must satisfy $F_{\max} / F_{\min} \le 2.5$ so users zooming up to `500%` browser zoom always achieve $\ge 200\%$ effective text enlargement of $F_{\max}$.
3. **Split-Column Hero $C^0$ Continuity (`container-type: inline-size` + `min(viRamp, cqiRamp)`):**
   - Multi-column asymmetric heroes (such as `HeroSection.svelte` `.hero-copy` and `.inner-page .hero-section__content / .hero-section__main`, which split from `1fr` below `1024px` to `~58.5%` column width at `>= 1024px`) must set `container-type: inline-size` on the copy column.
   - Bind split-column fluid typography with $C^0$-continuous `clamp(minRem, min(viRamp, cqiRamp), maxRem)` calibrated so `cqiRamp` equals `viRamp` at the `1024px` split boundary (`536px` column with `scrollbar-gutter: stable`) and reaches `maxRem` at `1536px` (`775px` column). This guarantees **strictly monotonic scaling across every single pixel from `1536px` down to `375px`** (`0.00px` reverse jump across `1024px ↔ 1023px`).
4. **Font-Relative Ornaments (`em`):** Decorative hairlines, dashes, and inline icon gaps attached to fluid labels (e.g., `.eyebrow::before`) must use `em` units so they scale in lockstep with the text.

### 4.2 Canonical Scale Targets & Critical Legibility Review

| Token (`:root` SSOT) | Aliases                                       | Baseline Target (`375px` → `1536px`)           | Engineering Evaluation Requirement                                              |
| :------------------- | :-------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------ |
| `--step-hero`        | `--text-hero`, `--text-display-h1`            | `32px` → `50px` (`2rem` → `3.125rem`)          | Verify balanced wrapping (`text-wrap: balance`) & `F_max / F_min = 1.56 <= 2.5` |
| `--step-h1`          | `--text-h1`, `--blog-h1`                      | `28px` → `42.4px` (`1.75rem` → `2.65rem`)      | Inner-page & blog article `<h1>`                                                |
| `--step-h2`          | `--text-h2`, `--text-section-h2`, `--blog-h2` | `24px` → `36px` (`1.5rem` → `2.25rem`)         | Section headings                                                                |
| `--step-h3`          | `--text-h3`, `--text-card-h3`, `--blog-h3`    | `18px` → `22px` (`1.125rem` → `1.375rem`)      | Card & subsection headings                                                      |
| `--step-sub`         | `--text-sub`                                  | `17px` → `20px` (`1.0625rem` → `1.25rem`)      | Subheadings & feature callouts                                                  |
| `--step-lead`        | `--text-lead`                                 | `17px` → `19px` (`1.0625rem` → `1.1875rem`)    | Hero & section lead paragraphs                                                  |
| `--step-h4`          | `--text-h4`, `--blog-h4`                      | `15px` → `16px` (`0.9375rem` → `1rem`)         | Compact headings & proof items                                                  |
| `--step-body`        | `--text-body`, `--blog-body`                  | `15px` → `16px` (`0.9375rem` → `1rem`)         | Primary body & editorial prose                                                  |
| `--step-body-sm`     | `--text-body-sm`                              | `13.5px` → `15px` (`0.84375rem` → `0.9375rem`) | Announcement bar, dense list items, card copy                                   |
| `--text-eyebrow`     | —                                             | `12px` → `16px` (`0.75rem` → `1rem`)           | Section eyebrows                                                                |
| `--step-sm`          | `--text-sm`, `--text-seo-kicker`              | `12px` → `14px` (`0.75rem` → `0.875rem`)       | `<h1>` SEO kickers, footer links, secondary UI                                  |
| `--step-caption`     | `--text-caption`                              | `12px` → `13px` (`0.75rem` → `0.8125rem`)      | Captions, metadata pills, compact CTAs                                          |
| `--step-xs`          | `--text-xs`                                   | `12px` (`0.75rem`)                             | Visual-quality HTML legibility floor                                            |

**Mandatory Micro/Nav Audit:** Audit every sub-`12px` exception (`--step-breadcrumb`, `--step-micro`, desktop `.nav-link` / `.nav-actions .btn` at `1024px`, and compact badges across `src/app.css` and `sunday-alpha-protocol.css`). Raise unjustified sub-`12px` copy to `--step-xs` (`0.75rem`) or `--step-caption` wherever layout space permits without triggering `Navbar` compact collapse at `1024px` (`Navbar.svelte.spec.ts`), and document every retained compact telemetry exception with before/after measurements.

---

## 5. COMPLETE TYPOGRAPHY DESIGN SYSTEM (`src/app.css` SSOT)

Centralize all typography primitives inside `@layer tokens` and `@layer typography` in `src/app.css`:

1. **Semantic Weight Tokens (`--weight-*`):** Define `--weight-regular: 400`, `--weight-medium: 500`, `--weight-semibold: 600`, `--weight-bold: 700`, `--weight-extrabold: 800` aligned 1-to-1 with shipped WOFF2 faces.
2. **Unitless Line-Height Tokens (`--leading-*`):** All `line-height` declarations must be **unitless ratios** (never fixed `px` or `rem` such as `line-height: 1.5rem`, which fails to scale under WCAG `1.4.12` / `1.4.4`):
   - Tight display headings (`1.1`–`1.2`), card/subsection headings (`1.25`–`1.35`), UI controls (`1.2`–`1.4`), marketing body (`1.65`), long-form editorial prose (`1.75`–`1.78`).
3. **Size-Optical Letter-Spacing Tokens (`--tracking-*`):**
   - Display headlines: `-0.02em` to `-0.01em`; section headings: `-0.015em` to `-0.01em`; body prose: `normal` / `0em` (never negative tracking that degrades small-size legibility); small uppercase kickers/badges: `+0.06em` to `+0.08em`.
4. **Numeric Typography Discipline (`tabular-nums`):**
   - Apply `font-variant-numeric: tabular-nums` purposefully to **financial figures, prices, percentages, KPIs, tables, timestamps, counters, badges, and SVG chart axes** (preserving all tested selectors in `page.svelte.e2e.ts` and `font-and-fragment.e2e.ts`)—evaluate whether global `body` should use `proportional-nums` or `normal` for natural editorial reading rhythm while keeping all data/telemetry surfaces strictly `tabular-nums`.
5. **Text Wrapping & Overflow Safety:**
   - Headings use `text-wrap: balance` (with `:where(h1, h2, h3, h4, h5, h6) { overflow-wrap: anywhere; }` so enlarged `200%` text wraps instead of overflowing boxes); paragraphs/lists use `text-wrap: pretty`.

---

## 6. PROTECTED LAYOUT EXCEPTIONS — BLOG & SHARED OUTER CONTAINER

> **CRITICAL ARCHITECTURAL BOUNDARY (`docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md`):**
> `/blog` and `/blog/[slug]` are a **protected layout section**. They MUST use the **exact same SSOT fluid typography tokens** (`--blog-h1..h4`, `--blog-body`, `--step-*`), while strictly preserving every rule of their verified layout contract:

1. **Shared `96rem` (`1536px`) Outer Container:** `src/app.css` owns the sole outer cap (`--max: 96rem`, border-box, responsive total gutters `24/36/44/56/40/64/112px` at `base/480/640/768/1024/1280/1536px`). `html:has(.nav)` reserves `scrollbar-gutter: stable`, switching to `scrollbar-gutter: stable both-edges` at `>= 118.75rem` (`1900px`).
2. **Container-Flush Blog Reading Geometry (`1424px` Inner Width at `>= 1536px`):**
   - Blog article title, cover, `.prose-base` (`src/lib/styles/prose.css`), CTA, FAQ, author bio, share bar, and related articles align **100% flush** with `.container`'s inner content edges (`max-inline-size: 100%` on `.prose-base p, li, blockquote`). **Never inject a `65ch` / `700px` reading-width cap into `.prose-base` or `/blog/[slug]`.**
   - Keep 1:1 visual parity between `prose.css` in `/blog/[slug]/+page.svelte` and the admin TipTap editor (`RichTextEditor.svelte`).
3. **External Left-Margin TOC Rail (`>= 118.75rem` / `1900px` Only):**
   - The native TOC stays hidden below `1900px` with focusable controls removed, and sits in the left viewport margin from `1900px+`. Expanding a native `<details>` FAQ must maintain `<= 1px` unintended sticky TOC shift (`docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md`).
4. **Blog Archive Cards & Zero `#` URL Fragments:**
   - Preserve `BlogArchive`, `ArchiveControls`, `ArchiveResults`, and `PostCard` card caps (`25rem` regular, `75rem` single/featured) and strictly preserve zero `#` URL fragments (`scrollToSection()` / history sanitization per `docs/FONT_AND_FRAGMENT_POLICY.md`).

---

## 7. NORMATIVE WCAG 2.2 AA ACCESSIBILITY REQUIREMENTS

Verify all five normative WCAG 2.2 AA typography criteria across representative routes (`/`, `/blog`, `/blog/[slug]`, `/live-trading-rooms`, `/mentorship`, `/resources/etf-stocks-list`, `/contact`):

1. **OS / Browser Root Preference (`html { font-size: 100% }`):** Replace `html { font-size: 16px }` in `src/app.css` with `font-size: 100%` so default rendering stays `16px = 1rem` while honoring user OS/browser default font-size settings.
2. **SC 1.4.4 — Resize Text (`200%`):** At `document.documentElement.style.fontSize = '32px'` (`200%` root text enlargement) and `200%` browser zoom, zero content is clipped, overlapped, or horizontally truncated, and `Navbar` transitions cleanly into compact mode (`Navbar.svelte.spec.ts`).
3. **SC 1.4.10 — Reflow (`320 CSS px`):** At `320px × 900px` viewport, `document.documentElement.scrollWidth <= 320` across pages (2D data tables scroll locally within `overflow-x: auto` wrappers, never forcing document-level horizontal overflow).
4. **SC 1.4.12 — Text Spacing Override:** Injecting the normative W3C bookmarklet override:
   ```css
   * {
   	line-height: 1.5 !important;
   	letter-spacing: 0.12em !important;
   	word-spacing: 0.16em !important;
   }
   p {
   	margin-bottom: 2em !important;
   }
   ```
   produces zero clipped text inside fixed-height boxes and zero overlapping interactive controls.
5. **SC 1.4.3 & Dual-Tone Contrast Discipline:**
   - Normal text `< 24px` (`< 18.66px` bold): `>= 4.5:1`; large text: `>= 3.0:1`.
   - Never use `var(--acid)` (`#dcff65`) as text or focus ring on light `--off` (`#f3f2ed`) surfaces (`1.13:1` contrast); always use `--acid-text-on-light: #4b5f1d` (`6.36:1`) and pair `var(--acid)` / `var(--acid2)` backgrounds with `color: var(--ink)` (`> 14:1`).
6. **SC 2.5.8 — Target Size Minimum:** Every interactive link/button maintains `>= 24×24 CSS px` (`>= 44×44 CSS px` on primary CTAs, filter chips, mobile drawer links, and `CatalogCard` actions).

---

## 8. MANDATORY 6-PHASE EXECUTION WORKFLOW

1. **Phase 1 — Read-Only Discovery:** Inspect all font files, `@font-face` rules, weight/style usages, CSS custom properties, playbook docs, and existing tests.
2. **Phase 2 — Evidence-Backed Diagnosis:** Tabulate every verified defect with exact `file:line`, current vs. expected behavior, specification reference, severity, and minimal fix.
3. **Phase 3 — Architecture Alignment:** Update `AGENTS.md`, `GEMINI.md`, `docs/CSS_STANDARDS.md`, `docs/FONT_AND_FRAGMENT_POLICY.md`, `docs/NEW_PAGE_PLAYBOOK.md`, `docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md`, and `static/fonts/LICENSES.txt` first so documentation and SSOT rules agree 100%.
4. **Phase 4 — Traceable Implementation:** Implement the font-weight/asset alignment, `html { font-size: 100% }`, semantic `--weight-*` / `--leading-*` / `--tracking-*` tokens, scoped OpenType/`tabular-nums` rules, micro/nav legibility refinements, and fallback metric updates without touching unrelated logic or protected blog geometry. Run `svelte-autofixer` on every touched `.svelte` file.
5. **Phase 5 — Automated & Live Verification (`pnpm` ONLY):**
   Add dedicated Vitest + Playwright typography/accessibility specs covering fluid math, computed sizes at `[320, 375, 768, 1024, 1280, 1440, 1536, 1920]`, zero faux-weight mismatches, `200%` text resize, `320px` reflow, `WCAG 1.4.12` text-spacing overrides, blog `1899/1900/1920px` TOC geometry, and measured CLS; then execute the full Vite+ verification suite:
   ```bash
   pnpm check:css
   pnpm check
   pnpm lint
   pnpm test:unit --run
   pnpm build
   pnpm check:pages
   pnpm test:seo
   pnpm test:e2e
   ```
6. **Phase 6 — Independent PR Self-Audit:** Re-review `git diff` critically as a skeptical Google L8++ reviewer; resolve any subtle regression, dead CSS, or doc mismatch and re-run affected gates.

---

## 9. FINAL DELIVERABLES & ACCEPTANCE GATE

Produce concise, hard-evidence deliverables (without creating unnecessary repo clutter):

1. **Typography Audit & Gap Resolution Table** (initial defects → verified fixes).
2. **Architecture Decision Record** (3-font WOFF2 weights, `font-display`, fallback metrics, scoped OpenType/`tabular-nums`, blog layout boundary).
3. **Final Production Typography Tokens (`src/app.css`)**.
4. **Fluid Scale Verification Table** (expected vs. live Chromium `getComputedStyle` values across `320px`–`1920px`).
5. **Font Loading & CLS Report** (WOFF2 bytes, HTTP waterfall, zero `<link as="font">`, measured CLS).
6. **WCAG 2.2 AA Verification Report** (`100%` root, `200%` resize, `320px` reflow, `1.4.12` text-spacing, contrast).
7. **Responsive & Protected Blog Layout Verification** (`320px`–`2560px`, including `1899px / 1900px / 1920px` blog TOC checks).
8. **Gate & Regression Test Results** (exact commands and pass counts).
9. **Complete Change Summary** (all modified files with clickable links).

**Acceptance Gate:** Declare complete **only** when every fluid ramp is mathematically and browser-verified, zero synthetic faux-weights remain, zero font `href` policy violations occur, blog layout geometry remains 100% intact, all WCAG 2.2 AA and project gates pass, and `pnpm build` succeeds cleanly.
