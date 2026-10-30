# Enterprise CSS Architecture & Typography Standards

> **Single Source of Truth (SSOT):** [`src/app.css`](../src/app.css)  
> **Shared Inner-Page Stylesheet:** [`src/lib/styles/inner-page.css`](../src/lib/styles/inner-page.css)  
> **Token Governance Script:** [`scripts/check-css-tokens.mjs`](../scripts/check-css-tokens.mjs) (`pnpm check:css`)

This document is the authoritative CSS and typography engineering standard for the Revolution Trading Pros (`new-revolution-web`) repository. Every new route, layout, and Svelte 5 component must conform to these rules.

---

## 1. Architecture Overview & Ownership Model

The styling architecture is organized into three strictly bounded tiers:

| Tier                            | Location                        | Scope & Responsibility                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------------------ | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Global SSOT**              | `src/app.css`                   | `@font-face` imports, CSS cascade layers (`@layer`), canonical `:root` design tokens, document reset, institutional typography primitives (`.display-xl`, `.h2`, `.eyebrow`, `.kicker`, `.lead`), global grid/container layout (`.container`, `.section`), shared interactive primitives (`.btn`, `.skip-link`, `.reveal`), and the 6-breakpoint mobile-first responsive cascade.                                   |
| **2. Shared Inner-Page System** | `src/lib/styles/inner-page.css` | Shared marketing inner-page patterns scoped beneath `.inner-page`: `.page-hero`, `.content-section` (`.is-light` / `.is-alt`), `.section-header`, `.section-kicker`, `.section-h2`, `.card-grid`, `.info-card`, `.pricing-card`, `.faq-list` / `.faq-item`, `.cta-banner`, `.disclaimer-strip`, and shared store/alert/resource patterns. Imported only by routes that wrap their `<main>` in `class="inner-page"`. |
| **3. Component-Scoped Styles**  | `<style>` inside `*.svelte`     | Component-specific layout, state, and visual refinements automatically scoped by the Svelte 5 compiler. Consumes tokens from `src/app.css`; never redefines global tokens.                                                                                                                                                                                                                                          |

### Cascade Layer Order (`src/app.css`)

```css
@layer reset, tokens, base, typography, layout, components, utilities, responsive;
```

- Do **not** introduce Tailwind, Sass/SCSS, Less, PostCSS plugins, or CSS-in-JS runtimes. Native CSS + Svelte 5 scoped `<style>` is the only permitted styling system.
- Do **not** use `!important` to win specificity wars. The only permitted `!important` rules are inside `@media (prefers-reduced-motion: reduce)` in `src/app.css` to neutralize animations for accessibility.

---

## 2. Single Source of Truth (SSOT) Design Tokens

All shared design tokens are declared **once** inside `@layer tokens` (`:root`) in `src/app.css`.

### 2.1 Core Brand & Surface Tokens

| Token           | Value     | Semantic Role                                                                  |
| :-------------- | :-------- | :----------------------------------------------------------------------------- |
| `--bg`          | `#0b0e12` | Primary dark obsidian canvas (`body` background)                               |
| `--bg-soft`     | `#11151a` | Elevated dark section background                                               |
| `--panel`       | `#151a20` | Primary dark card / panel surface                                              |
| `--panel2`      | `#1b2027` | Secondary elevated panel / hover surface / interactive control background      |
| `--line`        | `#2b313a` | Primary structural hairline border (`1px solid var(--line)`)                   |
| `--line-strong` | `#394149` | Emphasized hairline / panel border                                             |
| `--off`         | `#f3f2ed` | Primary warm daylight surface (`.section--light`, `.content-section.is-light`) |
| `--off2`        | `#eae9e2` | Secondary warm daylight surface                                                |
| `--ink`         | `#11151a` | High-contrast dark ink text on `--off`, `--off2`, and `--acid` surfaces        |
| `--acid`        | `#dcff65` | Primary institutional chartreuse accent (CTAs, active indicators, focus rings) |
| `--acid2`       | `#b9e64f` | Secondary chartreuse accent (hover gradients, secondary borders)               |
| `--coral`       | `#ff7969` | Risk / warning / negative variance accent                                      |

### 2.2 Text & Interactive Tokens

| Token                        | Value     | Contrast & Usage Notes                                                                              |
| :--------------------------- | :-------- | :-------------------------------------------------------------------------------------------------- |
| `--text`                     | `#f4f5f0` | Primary copy on dark surfaces (>16:1 on `--bg`)                                                     |
| `--text-secondary`           | `#aab3b7` | Long-form secondary copy on dark surfaces (>8.2:1 on `--bg`)                                        |
| `--muted`                    | `#a0a7ad` | Muted metadata / labels on dark surfaces (>7.3:1 on `--bg`)                                         |
| `--lightmuted`               | `#58616b` | Secondary copy on light `--off` surfaces (>5.7:1 on `--off`; **never** use for body text on `--bg`) |
| `--btn-acid-hover`           | `#efffae` | Hover background for primary `.btn--acid` / `.btn--solid` buttons                                   |
| `--btn-dark-hover`           | `#30373e` | Hover background for `.btn--dark` buttons                                                           |
| `--btn-outline-border`       | `#5a6067` | Border for `.btn--outline` on dark surfaces                                                         |
| `--btn-outline-light-border` | `#8b9088` | Border for `.btn--outline-light` on light surfaces                                                  |

### 2.3 Elevation & Layout Tokens

| Token           | Value                             | Role                                                             |
| :-------------- | :-------------------------------- | :--------------------------------------------------------------- |
| `--shadow-card` | `0 18px 44px rgba(0, 0, 0, 0.32)` | Standard elevated card shadow                                    |
| `--shadow-md`   | `0 12px 30px rgba(0, 0, 0, 0.28)` | Medium interactive hover shadow                                  |
| `--shadow-lg`   | `0 28px 72px rgba(0, 0, 0, 0.4)`  | Deep modal / featured panel shadow                               |
| `--max`         | `100%` → `1600px`                 | Responsive container max-width (scales across the 6 breakpoints) |
| `--gutter`      | `24px` → `64px`                   | Responsive horizontal container padding                          |
| `--nav-height`  | `73px`                            | Sticky navigation bar height offset                              |
| `--ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)`  | Standard institutional motion easing                             |

### 2.4 Contextual Component Custom Properties

Components may define **scoped contextual custom properties** on a local selector when a child rule needs to adapt between dark and light sections (for example, `.inner-page .content-section.is-light { --kicker-color: #4b5f1d; }`).

**Automated Governance (`pnpm check:css`):**
Every `var(--token)` referenced anywhere in `src/**/*.{css,svelte}` is verified against declared `--token:` properties by `scripts/check-css-tokens.mjs`. Never reference an undeclared custom property; in CSS, an undeclared `var(--missing)` without a fallback makes the declaration invalid at computed-value time (`background` falls back to `transparent`, which can render dark text invisible on a dark page).

---

## 3. Mandatory Self-Hosted Typography (Fontsource)

All website fonts are self-hosted via Fontsource variable WOFF2 packages and imported **exclusively** at the top of `src/app.css`:

```css
@import '@fontsource-variable/montserrat/wght.css';
@import '@fontsource-variable/montserrat/wght-italic.css';
@import '@fontsource-variable/sofia-sans/wght.css';
@import '@fontsource-variable/sofia-sans/wght-italic.css';
```

### 3.1 Font Pairing & Tokens

| Token            | Family Stack                                                                      | Axes Shipped                       | Primary Usage                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------- |
| `--font-display` | `'Montserrat Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | `wght` (100–900), normal + italic  | `.display-xl`, `.h2`, `.h3`, `.eyebrow`, `.kicker`, navigation, buttons, metrics, table headers |
| `--font-sans`    | `'Sofia Sans Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | `wght` (100–1000), normal + italic | `body`, `.lead`, long-form editorial copy, FAQ answers, form controls                           |
| `--font-mono`    | `ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace`              | System                             | Ticker symbols, execution timestamps, code/rule blocks                                          |

### 3.2 Mandatory Font Rules

1. **Zero External Font Requests:** Never add `<link href="https://fonts.googleapis.com/...">`, `<link href="https://cdn.jsdelivr.net/...">`, or external `@import url(...)` rules. Vite bundles the Fontsource WOFF2 subsets into `/_app/immutable/assets/*.woff2` served from the website's own origin.
2. **Import Location:** Import `@fontsource-variable/*` **only** in `src/app.css`. Never import Fontsource CSS inside `+layout.svelte` or individual page/component `<script>` blocks (doing so duplicates `@font-face` rules across chunks).
3. **Supported Variable Axes:** Both `@fontsource-variable/montserrat` (v5.3.0) and `@fontsource-variable/sofia-sans` (v5.3.0) ship only the `wght` axis (no `wdth` axis). Do not add `font-stretch` or `font-variation-settings: 'wdth' ...` expecting condensed glyphs.
4. **Why `<link rel="preload" as="font">` Is Intentionally Omitted:**
   - Fontsource uses `font-display: swap` and splits each variable font into `unicode-range` subsets (`latin`, `latin-ext`, `cyrillic`, `vietnamese`, etc.), so the browser automatically downloads only the 2 Latin WOFF2 files (`montserrat-latin-wght-normal.woff2` ~39 KB and `sofia-sans-latin-wght-normal.woff2` ~32 KB) when text is laid out.
   - An empirical 5-run median A/B benchmark in headless Chromium against the production build (`pnpm preview`) demonstrated that preloading the two Latin WOFF2 files in `<head>` **degraded** FCP and LCP because the preloaded fonts competed for early bandwidth with the render-blocking CSS asset:
     - **Fast 3G (1.6 Mbps, 150 ms RTT):** `/` FCP/LCP regressed from **400 ms → 744 ms** (+344 ms); `/about` regressed from **512 ms → 940 ms** (+428 ms), with **0.0000 CLS** in both configurations.
     - **4G (9 Mbps, 40 ms RTT):** `/` FCP/LCP regressed from **152 ms → 240 ms** (+88 ms); `/about` regressed from **168 ms → 256 ms** (+88 ms), with **0.0000 CLS** in both configurations.
   - Do not add font preloads unless a future benchmark proves a net FCP/LCP improvement.
5. **Licensing:** Full OFL-1.1 license attributions for Montserrat and Sofia Sans are maintained in [`static/fonts/LICENSES.txt`](../static/fonts/LICENSES.txt).

---

## 4. Svelte 5 Idiomatic Styling Rules

1. **Component-Scoped `<style>` by Default:** Keep component-specific layout and states inside the component's `<style>` block.
2. **Svelte 5 Class Array/Object Syntax:** Use Svelte 5's native `class` attribute array/object syntax for conditional states instead of string concatenation:
   ```svelte
   <button
   	type="button"
   	class={['filter-chip', { 'is-active': selectedCategory === category.id }]}
   	onclick={() => (selectedCategory = category.id)}
   >
   	{category.label}
   </button>
   ```
3. **Minimal `:global(...)` Usage:** Use `:global(...)` only when styling child component roots or framework states (such as `body.menu-open` or `.reveal.in-view`), and always scope it to a local parent selector when inside a component.
4. **Sharp Architectural Geometry:** The Revolution Trading Pros visual system uses crisp `0px` (`border-radius: 0`) corners on primary cards, buttons, and structural panels, paired with `1px solid var(--line)` hairlines. Do not introduce arbitrary pill-rounded buttons or blue SaaS cards on marketing pages.

---

## 5. Responsive Design & Accessibility Standards

### 5.1 Six-Breakpoint Mobile-First Cascade

Base styles target `320px+` viewports first, scaling upward via `min-width` media queries:

| Breakpoint                | Media Query                  | `--max` Container | `--gutter` |
| :------------------------ | :--------------------------- | :---------------- | :--------- |
| **Base (Mobile)**         | Default (`320px+`)           | `100%`            | `24px`     |
| **xs (Large Phone)**      | `@media (min-width: 480px)`  | `100%`            | `28px`     |
| **sm (Small Tablet)**     | `@media (min-width: 640px)`  | `640px`           | `32px`     |
| **md (Tablet)**           | `@media (min-width: 768px)`  | `768px`           | `40px`     |
| **lg (Laptop / Desktop)** | `@media (min-width: 1024px)` | `1280px`          | `48px`     |
| **xl (Wide Desktop)**     | `@media (min-width: 1280px)` | `1440px`          | `56px`     |
| **2xl (Ultra-Wide)**      | `@media (min-width: 1536px)` | `1600px`          | `64px`     |

### 5.2 Accessibility & Contrast Requirements

- **WCAG 2.2 AA Contrast:**
  - Normal text (< 18pt / 24px): minimum **4.5:1** contrast ratio against its rendered background.
  - Large text (≥ 18pt / 24px or ≥ 14pt / 18.66px bold): minimum **3.0:1** contrast ratio.
  - **Light-Section Rule (`.section--light` / `.content-section.is-light`):** Never use `var(--acid)` (`#dcff65`) as text on a light `--off` (`#f3f2ed`) background (1.13:1 contrast). Inside `.is-light` sections, kickers and accent labels must use `--kicker-color: #4b5f1d` (6.36:1 contrast on `--off`) and headings/copy must use `var(--ink)` (`#11151a`) or `var(--lightmuted)` (`#58616b`).
  - **Acid Badge / Button Rule:** Any badge, ribbon, or button with a `var(--acid)` or `var(--acid2)` background **must** use `color: var(--ink)` (`#11151a`, >14:1 contrast).
- **Keyboard Focus:** Every interactive element (`<a>`, `<button>`, `<input>`, `<select>`, `<summary>`) inherits `:focus-visible { outline: 3px solid var(--acid); outline-offset: 4px; }` from `src/app.css`. Never set `outline: none` without providing an equally high-contrast `:focus-visible` indicator.
- **Reduced Motion:** Respect `@media (prefers-reduced-motion: reduce)`—all scroll-reveal elements (`.reveal`) and transitions automatically snap to their final visible state in `src/app.css`.

---

## 6. Mandatory CSS Verification Checklist

Before committing any CSS or component change, run:

```bash
pnpm check:css       # Verifies 0 undeclared CSS custom properties across src/**/*.{css,svelte}
pnpm check           # svelte-check (0 errors, 0 warnings, including unused CSS selectors)
pnpm lint            # Prettier + ESLint
pnpm test:unit --run # Vitest unit tests
pnpm test:e2e        # Playwright end-to-end verification
```
