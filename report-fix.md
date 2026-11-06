# Root-Cause Diagnosis & Fix Report (`report-fix.md`)

**Date:** November 6, 2026  
**Scope:** Desktop Navbar Visibility (`>= 1536px`), Primary Navigation Centering, Mobile Drawer Submenu Initialization, Max-Width (`--max: 96rem`), and Dev Server SSR

---

## 1. Root-Cause Diagnosis (Hard Evidence)

### Issue A: Desktop Navbar Never Showed on Viewports `>= 1536px` (Only Hamburger Menu Showed)

#### Measured Before-Fix Browser Telemetry

In [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte), the `fitNavigation` attachment compares the inner content width of `.container.nav` (`available`) against the sum of the intrinsic widths of `.brand`, `.nav-links`, `.nav-actions`, and flex gaps (`required`). When `required > available`, `compactNavigation` is set to `true`, which adds `.is-compact` to `header.nav-shell`, hiding `.nav-links` and `.nav-actions` (`display: none`) and displaying `.mobile-toggle` (`display: flex`).

Before the fix, live Chromium measurements at `100%` text size (`16px` root) showed:

| Viewport Width | `.container.nav` Inner Width (`available`) | `brandW`       | `primaryW`     | `actionsW`     | Gaps + Margin | `required`      | `required - available`   | Resulting State                         |
| :------------- | :----------------------------------------- | :------------- | :------------- | :------------- | :------------ | :-------------- | :----------------------- | :-------------------------------------- |
| `1024px`       | `984px`                                    | `159.52px`     | `519.16px`     | `272.42px`     | `13.60px`     | `964.70px`      | `-19.30px`               | Desktop Nav (`is-compact: false`)       |
| `1280px`       | `1216px`                                   | `204.44px`     | `623.27px`     | `312.16px`     | `20.00px`     | `1159.87px`     | `-56.13px`               | Desktop Nav (`is-compact: false`)       |
| `1440px`       | `1376px`                                   | `204.44px`     | `623.27px`     | `312.16px`     | `20.00px`     | `1159.87px`     | `-216.13px`              | Desktop Nav (`is-compact: false`)       |
| **`1536px`**   | **`1424px`**                               | **`250.91px`** | **`767.03px`** | **`363.41px`** | **`44.00px`** | **`1425.35px`** | **`+1.35px` (OVERFLOW)** | **Hamburger Only (`is-compact: true`)** |
| **`1728px`**   | **`1424px`**                               | **`250.91px`** | **`767.03px`** | **`363.41px`** | **`44.00px`** | **`1425.35px`** | **`+1.35px` (OVERFLOW)** | **Hamburger Only (`is-compact: true`)** |
| **`1920px`**   | **`1424px`**                               | **`250.91px`** | **`767.03px`** | **`363.41px`** | **`44.00px`** | **`1425.35px`** | **`+1.35px` (OVERFLOW)** | **Hamburger Only (`is-compact: true`)** |
| **`2560px`**   | **`1424px`**                               | **`250.91px`** | **`767.03px`** | **`363.41px`** | **`44.00px`** | **`1425.35px`** | **`+1.35px` (OVERFLOW)** | **Hamburger Only (`is-compact: true`)** |

#### Why It Happened

1. **Border-Box Gutter Deduction on `.container`**:
   - With `--max: 96rem` (`1536px`) and `.container` using `box-sizing: border-box; max-inline-size: var(--max); padding-inline: calc(var(--gutter) / 2);`, the `112px` gutter at `@media (min-width: 1536px)` (`56px` left + `56px` right) leaves `1536px - 112px = 1424px` of usable inner width (`available = 1424px`).
2. **Unbounded `vw` Brand Scaling & Oversized `@media (min-width: 1536px)` Step in `Navbar.svelte`**:
   - At `@media (min-width: 1536px)`, `.brand-name` used `font-size: clamp(1.05rem, 1.5vw, 1.35rem)` (`vw` viewport scaling inside a width-capped container) alongside enlarged link gaps (`0.9rem`), container gaps (`1.125rem`), and redundant `.nav-actions` left margin (`0.5rem`), totaling `1425.35px` (`1.35px` wider than `1424px`).

---

### Issue B: Desktop Primary Navigation (`.nav-links`) Was Pushed Right Instead of Centered

- In [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte), `.nav-links` had `margin-inline-start: auto` (with `margin-inline-end: 0`), while `.nav-actions` had `margin-inline-start: 0.15rem` / `0.25rem` / `0.5rem`.
- In CSS Flexbox, setting only `margin-inline-start: auto` on the middle flex child pushes all free horizontal space to the left of `.nav-links`, crowding `.nav-links` directly against `.nav-actions` instead of centering it between `.brand` and `.nav-actions`.

---

### Issue C: Mobile Hamburger Menu Opened With "Live Trading Rooms" Submenu Already Expanded

- In [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte):
  1. `openMobileSubmenuId` was initialized to a hardcoded string:
     ```ts
     let openMobileSubmenuId = $state<string | null>('live-trading-rooms');
     ```
  2. `closeAllMenus()` only reset `mobileMenuOpen = false` and `openDropdownId = null`, never resetting `openMobileSubmenuId = null`.
- As a result, opening the hamburger drawer immediately rendered the `"Live Trading Rooms"` accordion expanded (`{#if openMobileSubmenuId === item.id}`), and closing the drawer left any previously opened accordion expanded on subsequent opens.

---

## 2. What Was Implemented & Why

### 2.1 Centered Desktop Navigation & Proportional `@media (min-width: 1536px)` Sizing in [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte)

- **Centered `.nav-links`**:
  - Changed `.nav-links` from `margin-inline-start: auto` to **`margin-inline: auto`** and set `.nav-actions` `margin-inline-start: 0` across all breakpoints.
  - **Why**: In a 3-group flex container (`.brand`, `.nav-links`, `.nav-actions`), `margin-inline: auto` on the middle group distributes remaining free space equally on both sides (`leftGap === rightGap`), keeping the navigation links centered between the brand lockup and CTA buttons at every desktop width.
- **Proportional `@media (min-width: 1536px)` Sizing Without `vw` Overflow**:
  - Replaced `font-size: clamp(1.05rem, 1.5vw, 1.35rem)` on `.brand-name` at `@media (min-width: 1536px)` with a stable `1.15rem` token (`0.58rem` tagline, `0.875rem` nav gap, `0.65rem` link gap, `0.84375rem` link font-size, `9px 12px` action button padding).
  - **Why**: Inside the `1424px` inner content rail of the `96rem` (`1536px`) container, the three desktop navbar groups now require `1278.08px`, leaving **`145.92px` of breathing room** (`72.97px` left of `.nav-links` and `72.95px` right of `.nav-links`) so `fitNavigation` never falsely triggers `.is-compact` at `100%` text size on any desktop viewport (`1024px`–`3440px`), while still switching cleanly to `.is-compact` when the user enlarges text to `200%` (`32px` root font-size).

### 2.2 Clean Mobile Accordion State Initialization & Reset in [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte)

- Changed `openMobileSubmenuId` initial state from `'live-trading-rooms'` to `null`:
  ```ts
  let openMobileSubmenuId = $state<string | null>(null);
  ```
- Updated `closeAllMenus()` to reset `openMobileSubmenuId = null;` whenever the mobile menu or submenus are closed.
- **Why**: Ensures the mobile hamburger menu always opens in a clean, collapsed state with all top-level items visible and resets any expanded accordion when closed.

### 2.3 Restored `96rem` (`1536px`) Outer Max-Width Cap in [`src/app.css`](src/app.css)

- Set `--max: 96rem;` (`1536px`) in [`src/app.css`](src/app.css) while preserving the fluid `border-box` `.container` (`inline-size: 100%; max-inline-size: var(--max); padding-inline: calc(var(--gutter) / 2); margin-inline: auto;`), shared `.inner-page` rails in [`src/lib/styles/inner-page.css`](src/lib/styles/inner-page.css), and `200%` text-scaling reflow in [`src/lib/styles/sunday-alpha-protocol.css`](src/lib/styles/sunday-alpha-protocol.css).

### 2.4 Vite+ Dev SSR `sanitize-html` Pre-Bundling in [`vite.config.ts`](vite.config.ts)

- Added `ssr.optimizeDeps.include: ['sanitize-html']` alongside `ssr.noExternal: ['sanitize-html', 'htmlparser2']` and `server.watch.ignored: ['**/.vercel/**', '**/.svelte-kit/output/**', '**/build/**']` in [`vite.config.ts`](vite.config.ts).
- **Why**: Prevents `ReferenceError: require is not defined` when Vite's dev SSR `ModuleRunner` evaluates CommonJS `sanitize-html`, while keeping `sanitize-html` and `htmlparser2` bundled in production builds for Vercel's Node 24 runtime.

---

## 3. Post-Fix Verification Evidence

### 3.1 Live Browser Desktop Navbar & Centering Telemetry (`http://localhost:5173/`)

| Viewport Width | `is-compact` | `.nav-links` Display | `.mobile-toggle` Display | Left Space (`brand` → `nav-links`) | Right Space (`nav-links` → `nav-actions`) | Centering Delta (`|left - right|`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`1024px`** | `false` | `flex` | `none` | `16.45px` | `16.45px` | **`0.00px`** |
| **`1180px`** | `false` | `flex` | `none` | `94.45px` | `94.45px` | **`0.00px`** |
| **`1280px`** | `false` | `flex` | `none` | `38.08px` | `38.06px` | **`0.02px`** |
| **`1366px`** | `false` | `flex` | `none` | `81.08px` | `81.06px` | **`0.02px`** |
| **`1440px`** | `false` | `flex` | `none` | `118.08px` | `118.06px` | **`0.02px`** |
| **`1512px`** | `false` | `flex` | `none` | `154.08px` | `154.06px` | **`0.02px`** |
| **`1536px`** | `false` | `flex` | `none` | `72.97px` | `72.95px` | **`0.02px`** |
| **`1728px`** | `false` | `flex` | `none` | `72.97px` | `72.95px` | **`0.02px`** |
| **`1920px`** | `false` | `flex` | `none` | `72.97px` | `72.95px` | **`0.02px`** |
| **`2560px`** | `false` | `flex` | `none` | `72.97px` | `72.95px` | **`0.02px`** |

### 3.2 Live Browser Mobile Hamburger Drawer Telemetry (`390×844`)

- On `#mobileToggle` click:
  - `.mobile-submenu` count in DOM: **`0`**
  - `Live Trading Rooms` trigger `aria-expanded`: **`"false"`**
  - `Alert Services` trigger `aria-expanded`: **`"false"`**
  - `Resources` trigger `aria-expanded`: **`"false"`**
- Permanent regression specs added in [`src/lib/components/layout/Navbar.svelte.spec.ts`](src/lib/components/layout/Navbar.svelte.spec.ts).
