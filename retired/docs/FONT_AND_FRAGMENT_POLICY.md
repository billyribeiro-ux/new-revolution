# Font loading and URL fragment policy

> **Layout, typography and copy contract: November 8, 2026.** Follow the [shared 1536px (96rem), two-font and blog interaction contract](blog/LAYOUT_AND_CONTENT_CONTRACT.md) and [`docs/CSS_STANDARDS.md`](CSS_STANDARDS.md).

## Strictly Static Self-Hosted Fonts (Zero Font `href` Tags)

1. **Static `@font-face` in `src/app.css` Only:** All website fonts (`Plus Jakarta Sans` weights `600`, `700`, `800`; `Inter` weights `400`, `500`, `600`; and `Geist Mono` variable `100`–`900`) are stored as local `.woff2` files in `static/fonts/` and declared exclusively via `@font-face` in `src/app.css`.
2. **Font `href` is Strictly Forbidden:** Never use `<link rel="preload" as="font" href="...">`, `<link href="...woff2">`, or any external font stylesheet `<link href="...">` anywhere in the application. `shouldPreload` in `src/hooks.server.ts` preloads only `js` and `css` chunks and never preloads `font` files.
3. **Three Institutional Brand Font Roles:** Website and admin views use `Plus Jakarta Sans` (`--font-display`, `--font-heading`), `Inter` (`--font-sans`, `--font-body`), and `Geist Mono` (`--font-mono`). Rich-text CMS parsing, serialization, and sanitization (`src/lib/shared/brand-font.ts`) normalize supported display/body names to `var(--font-display)` and `var(--font-sans)` and strip unsupported family declarations.
4. **Automated Enforcement (`pnpm check:css`):** `scripts/font-policy.mjs` and `scripts/check-css-tokens.mjs` reject external font providers, `<link>` tags with `as="font"` or font `href`s, `@font-face` rules outside `src/app.css`, and D3/CSS font declarations that bypass `var(--font-*)`.

## Standalone Web and Image Delivery

- `pnpm build` derives `/brand-ui.css` from the compiled root stylesheet, rewrites asset URLs against that build, and emits preview/Vercel copies.
- The isolated generated placeholder SVG embeds one licensed bundled `Geist Sans` WOFF2 via `src/lib/server/svg-brand-font.ts` as a `data:font/woff2;base64,...` URI because SVGs rendered in `<img>` context cannot load external stylesheets.

## Zero `#` URL Fragments Policy

- **`#` Fragments in URLs Are Forbidden:** Never emit `#section` hash fragments in `<a href="...">` links, canonical URLs, Open Graph URLs, or sitemaps.
- **In-Page Scrolling:** Use programmatic `scrollToSection(id)` (`src/lib/utils/scroll.ts`) with `<button type="button">` controls (and TOC buttons in `TableOfContents.svelte`), which smoothly scrolls the target element into view and moves keyboard focus without mutating `window.location` or adding a `#` to the URL bar.
- **Incoming URL Sanitization:** The root layout (`src/routes/+layout.svelte`) strips any incoming `#fragment` from the browser address bar via `history.replaceState` after scrolling to the target element.
- **JSON-LD `@id` Identifiers:** Internal Schema.org graph node identifiers (`#organization`, `#webpage`, `#article`) inside `<script type="application/ld+json">` identify graph entities and are not navigable page URLs.
