# Enterprise CSS Architecture, Typography & Fragment Standards (`docs/CSS_STANDARDS.md`)

> **Single Source of Truth (SSOT):** [`src/app.css`](../src/app.css)  
> **Automated Guards:** [`scripts/check-css-tokens.mjs`](../scripts/check-css-tokens.mjs) (`pnpm check:css`), [`scripts/font-policy.mjs`](../scripts/font-policy.mjs), [`scripts/typography-standard.spec.ts`](../scripts/typography-standard.spec.ts), and [`src/routes/typography-wcag.e2e.ts`](../src/routes/typography-wcag.e2e.ts).

This document is the authoritative CSS, design-token, 3-font pipeline, fluid-typography, zero-`#`-fragment, and accessibility engineering standard for `new-revolution-web`.

---

## 1. Architecture Overview & Cascade Layer Ownership

| Tier                       | Location                                                                           | Scope & Responsibility                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :------------------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Global SSOT**         | `src/app.css`                                                                      | `@font-face` declarations, `@layer` order, `:root` design tokens (`129` verified custom properties), reset, base typography, `.container` (`96rem` / `1536px`), `.btn`, `.skip`, `.reveal`, shared `.inner-page` marketing primitives (`.page-hero`, `.content-section`, `.section-header`, `.section-kicker`, `.section-h2`, `.card-grid`, `.info-card`, `.pricing-card`, `.faq-list`, `.cta-banner`, `.disclaimer-strip`), and responsive cascade. |
| **2. Scoped Styles**       | `<style>` in `*.svelte`                                                            | Component- and route-specific layout, states, and refinements scoped by the Svelte 5 compiler. Consumes tokens from `src/app.css`; never redefines global tokens.                                                                                                                                                                                                                                                                                    |
| **3. Domain Raw-HTML CSS** | `src/lib/styles/prose.css`, `sunday-alpha-protocol.css`, `admin/media-library.css` | Wrapped in `@layer components` where database-rendered HTML (`{@html}`) or shared admin controls require unscoped selectors.                                                                                                                                                                                                                                                                                                                         |

### Cascade Layer Order (`src/app.css`)

```css
@layer reset, tokens, base, typography, layout, components, utilities, responsive;
```

- **Zero CSS Frameworks:** Never install Tailwind, Sass/SCSS, Less, PostCSS plugins, or CSS-in-JS.
- **Zero Specificity Wars:** Never use `!important` outside `@media (prefers-reduced-motion: reduce)` in `src/app.css`.
- **Zero Undeclared Tokens:** Every `var(--token)` in `src/**/*.{css,svelte}` must be declared in `src/app.css` or on a local parent selector (`pnpm check:css`). An undeclared `var(--missing)` invalidates its declaration at computed-value time.

---

## 2. Canonical Design Tokens (`src/app.css` `:root`)

### 2.1 Core Brand & Surface Tokens

| Token                  | Value                                 | Semantic Role                                                                               |
| :--------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------ |
| `--bg`                 | `#0b0e12`                             | Primary dark obsidian canvas (`body` background)                                            |
| `--bg-soft`            | `#11151a`                             | Elevated dark section background                                                            |
| `--panel`              | `#151a20`                             | Primary dark card / panel surface                                                           |
| `--panel2`             | `#1b2027`                             | Secondary elevated panel / hover / control background                                       |
| `--line`               | `#2b313a`                             | Primary structural hairline border (`1px solid var(--line)`)                                |
| `--line-strong`        | `#394149`                             | Emphasized hairline / panel border                                                          |
| `--off`                | `#f3f2ed`                             | Primary warm daylight surface (`.section--light`, `.content-section.is-light`)              |
| `--off2`               | `#eae9e2`                             | Secondary warm daylight surface                                                             |
| `--ink`                | `#11151a`                             | High-contrast dark ink text on `--off`, `--off2`, and `--acid` surfaces                     |
| `--acid`               | `#dcff65`                             | Primary institutional chartreuse accent (CTAs, active indicators, dark-surface focus rings) |
| `--acid2`              | `#b9e64f`                             | Secondary chartreuse accent                                                                 |
| `--acid-text-on-light` | `#3d4e15` / `--kicker-color: #4b5f1d` | Accessible dark-olive accent text/focus on light `--off` surfaces (≥ 6.3:1 AA contrast)     |
| `--coral`              | `#ff7969`                             | Risk, invalidation, warning, and negative-variance accent                                   |

### 2.2 Text, Interactive & Layout Tokens

| Token              | Value                            | Role & Contrast                                                                    |
| :----------------- | :------------------------------- | :--------------------------------------------------------------------------------- |
| `--text`           | `#f4f5f0`                        | Primary copy on dark surfaces (> 16:1 on `--bg`)                                   |
| `--text-secondary` | `#aab3b7`                        | Long-form secondary copy on dark surfaces (> 8.2:1 on `--bg`)                      |
| `--muted`          | `#a0a7ad`                        | Muted metadata / labels on dark surfaces (> 7.3:1 on `--bg`)                       |
| `--lightmuted`     | `#58616b`                        | Secondary copy on light `--off` surfaces (> 5.7:1 on `--off`; **never** on `--bg`) |
| `--max`            | `96rem` (`1536px` @ `16px` root) | Shared `.container` border-box cap (includes inline padding)                       |
| `--gutter`         | `24px`–`112px`                   | Responsive total inline gutter (`padding-inline: calc(var(--gutter) / 2)`)         |
| `--nav-height`     | `73px`                           | Sticky navigation bar height offset                                                |
| `--ease-out`       | `cubic-bezier(0.22, 1, 0.36, 1)` | Standard institutional motion easing                                               |

---

## 3. Self-Hosted 3-Font Pipeline & Zero Font `href` Policy

All fonts are self-hosted `.woff2` binaries in `static/fonts/` (`PlusJakartaSans-{SemiBold,Bold,ExtraBold}.woff2`, `Inter-{Regular,Medium,SemiBold}.woff2`, and `GeistMono-Variable.woff2`), licensed under `OFL-1.1` ([`static/fonts/LICENSES.txt`](../static/fonts/LICENSES.txt)), and declared via `@font-face` **exclusively** in `src/app.css` with `font-display: optional`.

### 3.1 Canonical Font Roles

| Token            | Backward-Compatible Aliases          | Family Stack                                                                                            | Shipped Weights        | Primary Usage                                                                              |
| :--------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------ | :--------------------- | :----------------------------------------------------------------------------------------- |
| `--font-display` | `--font-heading`, `--font-secondary` | `'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', -apple-system, BlinkMacSystemFont, sans-serif`      | `600`, `700`, `800`    | Hero headlines, `h1`–`h4`, `.eyebrow`, `.seo-kicker`, navigation, buttons, KPI callouts    |
| `--font-sans`    | `--font-body`, `--font-primary`      | `'Inter', 'Inter Fallback', -apple-system, BlinkMacSystemFont, sans-serif`                              | `400`, `500`, `600`    | `body`, `.lead`, editorial copy, FAQ answers, form controls, UI descriptions               |
| `--font-mono`    | —                                    | `'Geist Mono', 'Geist Mono Fallback', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | `100`–`900` (variable) | Tickers, strikes, timestamps, D3/SVG chart telemetry, `.breadcrumb-list`, code/rule blocks |

### 3.2 Mandatory Font Loading Rules & Documented Exceptions

1. **Zero Font `href` Tags Anywhere:** Never emit `<link rel="preload" as="font" href="...">`, `<link href="...woff2">`, external font stylesheet `<link>` tags, or external `@import url(...)`.
2. **No Framework Font Preload Injection:** `shouldPreload` in [`src/hooks.server.ts`](../src/hooks.server.ts) returns `true` only for `input.type === 'js' || input.type === 'css'` and `false` for `font`.
3. **Immutable Caching:** `/fonts/*` is served with `Cache-Control: public, max-age=31536000, immutable` in both `vercel.json` (production) and `dev-static-font-cache` in `vite.config.ts` (development), eliminating `304` revalidation swaps (`0.0000` refresh CLS).
4. **Editor Font Normalization:** Rich-text CMS parsing/sanitization ([`src/lib/shared/brand-font.ts`](../src/lib/shared/brand-font.ts)) normalizes supported display/body families to `var(--font-display)` / `var(--font-sans)` and strips unsupported font declarations without mutating stored revision history.
5. **Documented Standalone Exceptions:**
   - `pnpm build` (`scripts/maintenance-build.mjs`) emits same-origin `/brand-ui.css` for standalone maintenance/operational HTML responses.
   - [`src/lib/server/svg-brand-font.ts`](../src/lib/server/svg-brand-font.ts) embeds one licensed bundled WOFF2 as a `data:font/woff2;base64,...` URI inside server-generated placeholder SVGs rendered in `<img>` context (where external stylesheets are blocked by browsers).
   - Outbound HTML emails (`src/lib/server/email/`, `src/lib/server/waitlist/email.ts`) use email-client fallback stacks.

### 3.3 Always-Fluid Typography Scale (`[375px, 1536px]` Linear `rem + vi` + Split-Column $C^0$ `cqi`)

Every HTML typography tier above the `0.75rem` (`12px`) visual legibility floor scales linearly from `375px` (`23.4375rem`) to `1536px` (`96rem`, `--max`) with zero dead zone below `1536px`:

$$\text{slope} = \frac{F_{\max} - F_{\min}}{1536 - 375}, \qquad \text{intercept (rem)} = \frac{F_{\min} - \text{slope} \times 375}{16}$$

| Token (`:root` SSOT) | Aliases                                          | Fluid Formula (`375px` → `1536px`)                 | Range (`px` @ `16px` root)     |
| :------------------- | :----------------------------------------------- | :------------------------------------------------- | :----------------------------- |
| `--step-hero`        | `--text-hero`, `--text-display-h1`               | `clamp(2rem, 1.637rem + 1.55vi, 3.125rem)`         | `32px` → `50px`                |
| `--step-h1`          | `--text-h1`, `--blog-h1`                         | `clamp(1.75rem, 1.459rem + 1.24vi, 2.65rem)`       | `28px` → `42.4px`              |
| `--step-h2`          | `--text-h2`, `--text-section-h2`, `--blog-h2`    | `clamp(1.5rem, 1.258rem + 1.034vi, 2.25rem)`       | `24px` → `36px`                |
| `--step-h3`          | `--text-h3`, `--text-card-h3`, `--blog-h3`       | `clamp(1.125rem, 1.044rem + 0.345vi, 1.375rem)`    | `18px` → `22px`                |
| `--step-sub`         | `--text-sub`                                     | `clamp(1.0625rem, 1.002rem + 0.258vi, 1.25rem)`    | `17px` → `20px`                |
| `--step-lead`        | `--text-lead`                                    | `clamp(1.0625rem, 1.022rem + 0.172vi, 1.1875rem)`  | `17px` → `19px`                |
| `--step-h4`          | `--text-h4`, `--blog-h4`                         | `clamp(0.9375rem, 0.917rem + 0.086vi, 1rem)`       | `15px` → `16px`                |
| `--step-body`        | `--text-body`, `--blog-body`                     | `clamp(0.9375rem, 0.917rem + 0.086vi, 1rem)`       | `15px` → `16px`                |
| `--step-body-sm`     | `--text-body-sm`                                 | `clamp(0.84375rem, 0.813rem + 0.129vi, 0.9375rem)` | `13.5px` → `15px`              |
| `--text-eyebrow`     | —                                                | `clamp(0.75rem, 0.669rem + 0.345vi, 1rem)`         | `12px` → `16px`                |
| `--step-sm`          | `--text-sm`, `--text-seo-kicker`                 | `clamp(0.75rem, 0.71rem + 0.172vi, 0.875rem)`      | `12px` → `14px`                |
| `--step-caption`     | `--text-caption`                                 | `clamp(0.75rem, 0.729rem + 0.086vi, 0.8125rem)`    | `12px` → `13px`                |
| `--step-xs`          | `--text-xs`, `--step-breadcrumb`, `--step-micro` | `0.75rem`                                          | `12px` visual legibility floor |

1. **WCAG 1.4.4 Zoom Invariant:** Never write bare `vw`/`vi`/`cqi` middle terms (`clamp(12px, 1.2vw, 16px)` fails `200%` text zoom) and keep $F_{\max} / F_{\min} \le 2.5$.
2. **Split-Column $C^0$ Continuity (`container-type: inline-size` + `min(viRamp, cqiRamp)`):** Multi-column split heroes (`HeroSection.svelte`, `.inner-page .hero-section__content`, `.inner-page .hero-section__main`) declare `container-type: inline-size` and `clamp(minRem, min(viRamp, cqiRamp), maxRem)` calibrated at the `1024px` split boundary so font sizes scale monotonically across every single pixel (`0.00px` step across `1024px ↔ 1023px`).
3. **Weights, Unitless Leading, OpenType & Numerals:**
   - Root sets `html { font-size: 100%; font-synthesis-weight: none; font-synthesis-style: none; }`.
   - Use semantic weight tokens (`--weight-regular: 400`, `--weight-medium: 500`, `--weight-semibold: 600`, `--weight-bold: 700`, `--weight-extrabold: 800`); never use `450`, `750`, `900`, or `font-style: italic` on public marketing surfaces (`scripts/typography-standard.spec.ts`).
   - Always use unitless `line-height` (`--leading-*`), never fixed `rem`/`px` (`line-height: 1.5rem` fails `scripts/typography-standard.spec.ts` and WCAG `1.4.12`).
   - Scope `Inter` OpenType `'cv02', 'cv03', 'cv04', 'cv11'` to `body` (never `html`, and reset to `normal` on headings/display/mono).
   - Scope `font-variant-numeric: tabular-nums` to `table, th, td, time, code, pre, kbd, samp, output, svg text, .tabular-nums` while keeping running prose proportional.
   - Size inline eyebrow bars and gaps in `em` (`inline-size: 1.4375em; gap: 0.75em`), and hero heading width caps in stable `rem` (never `ch`, which shifts on font fallback).

---

## 4. Zero `#` URL Fragments Policy

1. **No Navigable `#` Hash Links:** Never emit `#section` fragments in navigable `<a href="...">` links, canonical URLs, Open Graph URLs, or sitemaps.
2. **Programmatic Section Jumps:** Use `<button type="button" onclick={() => scrollToSection('section-id')}>` ([`src/lib/utils/scroll.ts`](../src/lib/utils/scroll.ts)) for in-page navigation and article TOC jumps (`TableOfContents.svelte` / `article-toc.ts`), which scrolls smoothly (or `instant` under `prefers-reduced-motion`) and focuses the target without mutating `window.location`.
3. **Skip Link & Incoming Hash Sanitization:** Every page renders `<a class="skip" href="#<main-id>">Skip to content</a>` first in DOM (`pnpm check:pages` enforces matching `id` on `<main>`). [`src/routes/+layout.svelte`](../src/routes/+layout.svelte) runs `stripLocationHash()` on mount, `afterNavigate`, and `hashchange` to scroll to any incoming `#id` and immediately clear the address-bar hash via `window.history.replaceState`.
4. **JSON-LD `@id` Graph URIs:** Internal Schema.org graph identifiers (`#webpage`, `#breadcrumb`, `/#organization`, `/#founder`, `/#website`, `/#logo`) inside `<script type="application/ld+json">` identify graph nodes rather than browser navigation URLs and remain valid.

---

## 5. Svelte 5 Component Styling & `CatalogCard` System

1. **Class Syntax:** Use Svelte 5 `clsx` array/object syntax (`class={['chip', { 'is-active': active }]}`), never legacy `class:is-active={active}`.
2. **Sharp Institutional Geometry:** Primary marketing cards, buttons, and structural panels use crisp `0px` (`border-radius: 0`) corners with `1px solid var(--line)` hairlines.
3. **Zero-Jitter Tab Panels:** Interactive multi-tab panels (such as Hero Fit Guides) stack all panels inside a single CSS Grid cell (`grid-area: 1 / 1`) toggling inactive panels with `visibility: hidden; opacity: 0; pointer-events: none` (`inert`) so switching tabs produces `0px` vertical height jitter.
4. **Breadcrumb Exclusivity:** Archetype A (`.inner-page`) routes use inline `<nav class="breadcrumb-bar" aria-label="Breadcrumb">` styled globally in `src/app.css`. Archetype B bespoke pages (`/resources`, `/resources/etf-stocks-list`, `/resources/stock-indexes-list`) use `<Breadcrumb />` (`src/lib/components/layout/Breadcrumb.svelte`). Never nest `<Breadcrumb />` inside `.inner-page`.
5. **`CatalogCard` / `CatalogGrid` / `FilterChips` (`src/lib/components/ui/`):**
   - `CatalogCard` owns card shell geometry, hover (`@media (hover: hover) and (pointer: fine)`), `:has(.catalog-card__link:focus-visible)` keyboard ring, `12px` text floor, and `44px` tap targets.
   - Consumers (`CourseCard`, `IndicatorCard`) pass content snippets and render one `<a class="catalog-card__link" href={resolve('/store/courses/[slug]', { slug })}>` inside `title`.
   - Use semantic internal tokens (`--_text`, `--_text-2`, `--_muted`, `--_line`, `--_accent`, `--_accent-text`) and pass `tone="light"` on light sections so `--_accent-text` resolves to AA-compliant `--acid-text-on-light`.
   - `CatalogGrid` sets `align-items: start` (`1` col `<768px`, `2` cols `>=768px`, `3` cols `>=1280px`) so expanding a `<details>` disclosure on one card never stretches sibling cards.

---

## 6. Responsive Breakpoints, Scrollbar Gutters & Accessibility (WCAG 2.2 AA)

### 6.1 Six-Breakpoint Mobile-First Cascade (`src/app.css`)

| Breakpoint | Media Query           | `--max` Border-Box Cap | `--gutter` (Total Inline Inset) | Inner Content Width (`>=1536px`) |
| :--------- | :-------------------- | :--------------------- | :------------------------------ | :------------------------------- |
| **Base**   | Default (`320px+`)    | `96rem`                | `24px` (`12px` each side)       | `100% - 24px`                    |
| **xs**     | `(min-width: 480px)`  | `96rem`                | `36px` (`18px` each side)       | `100% - 36px`                    |
| **sm**     | `(min-width: 640px)`  | `96rem`                | `44px` (`22px` each side)       | `100% - 44px`                    |
| **md**     | `(min-width: 768px)`  | `96rem`                | `56px` (`28px` each side)       | `100% - 56px`                    |
| **lg**     | `(min-width: 1024px)` | `96rem`                | `40px` (`20px` each side)       | `100% - 40px`                    |
| **xl**     | `(min-width: 1280px)` | `96rem`                | `64px` (`32px` each side)       | `100% - 64px`                    |
| **2xl**    | `(min-width: 1536px)` | `96rem` (`1536px`)     | `112px` (`56px` each side)      | **`1424px`**                     |

- **Scrollbar Gutter Contract:** Public routes reserve `scrollbar-gutter: stable` on root, upgrading at `@media (min-width: 118.75rem)` (`1900px`) to `scrollbar-gutter: stable both-edges` so the centered `1536px` frame and `/blog/[slug]` external left-margin TOC rail maintain exact symmetric geometry ([`docs/BLOG_CONTRACT.md`](BLOG_CONTRACT.md)).

### 6.2 Normative WCAG 2.2 AA Compliance vs. `12px` Visual Floor

- **Visual Floor vs. WCAG Law:** WCAG 2.2 defines no minimum pixel font size; `0.75rem` (`12px`, `--step-xs`) is our engineering visual legibility floor for HTML copy.
- **Verified WCAG 2.2 AA Gates (`src/routes/typography-wcag.e2e.ts`):**
  - **SC 1.4.3 (Contrast):** ≥ `4.5:1` normal text, ≥ `3.0:1` large text; `var(--acid)` fills always pair with `color: var(--ink)` (> `14:1`).
  - **SC 1.4.4 (`200%` Resize):** Setting root `font-size: 32px` at `1280px` produces zero document horizontal overflow (`Navbar` `ResizeObserver` switches cleanly to `.is-compact`).
  - **SC 1.4.10 (`320px` Reflow):** `document.documentElement.scrollWidth <= 320` at `320px` viewport across all templates.
  - **SC 1.4.12 (Text Spacing):** Normative `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, and paragraph spacing `2em` cause zero clipped text or control overlap.
  - **SC 2.5.8 (Target Size) & Keyboard Focus:** Interactive controls meet WCAG target sizing (`44px` on primary touch CTAs/cards, `>=24px` on admin checkboxes) and preserve the `3px solid var(--acid)` `:focus-visible` outline.
