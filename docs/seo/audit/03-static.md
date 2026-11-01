# Phase 3b — Static Code & AST Checks (`03-static.md`)

**Date:** 2026-10-31  
**Branch:** `seo/audit-2026-10-31`

---

## 1. `export const ssr = false` on Indexable Routes (`IDX-01`)

- **Status:** `PASS`
- **Evidence:**
  - `[CMD]` `rg -n "export const ssr" src/ vite.config.ts` → exit code `0`:
    - `[CODE src/routes/admin/analytics/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/leads/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/inbox/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/subscribers/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/campaigns/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/sequences/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/calls/+page.ts:1]` `export const ssr = false;`
    - `[CODE src/routes/admin/consent/+page.ts:1]` `export const ssr = false;`
  - Zero indexable routes export `ssr = false`. All 8 occurrences are private `/admin/*` routes (`expectedIndexable: false`).

---

## 2. `trailingSlash` Consistency (`IDX-11`)

- **Status:** `PASS` (default `'never'` enforced consistently)
- **Evidence:**
  - `[CMD]` `rg -n "trailingSlash" src/ vite.config.ts` → exit code `1` (no overrides; SvelteKit 3 default `'never'` applies across all routes `[DOC https://svelte.dev/docs/kit/page-options §trailingSlash]`).
  - `[CODE src/lib/seo/structured-data.ts:69-85]` `getCanonicalUrl(url)` strips trailing slashes (`pathname.replace(/\/+$/, '')`) on non-root paths.
  - `[CODE src/hooks.server.ts:21-27]` `normaliseRedirectLookupPath(pathname)` strips trailing slashes.

---

## 3. Prerendering & `handleHttpError` / `handleUnseenRoutes` (`IDX-05`)

- **Status:** `FAIL`
- **Evidence:**
  - `[CODE vite.config.ts:12-13]` defines `PLANNED_ROUTE_PATTERN = /^\/(live-trading-rooms|alert-services|store|resources|blogs|memberships|login|signup|register|contact|privacy-policy|terms-of-service)(\/|$)/;`
  - `[CODE vite.config.ts:26-36]` configures `prerender.handleHttpError` to silently `console.warn` and `return` when `status === 404 && PLANNED_ROUTE_PATTERN.test(path)`, suppressing 14 broken internal links during `pnpm build` (`[CMD]` `pnpm build` emitted 18 `[prerender] planned route not built yet` warnings in `00-environment.md`).
  - `[CODE vite.config.ts:26-36]` does not configure `handleUnseenRoutes` explicitly.
  - `[DOC https://svelte.dev/docs/kit/@sveltejs-kit-vite §prerender]` states `sveltekit({ prerender: { handleHttpError, handleUnseenRoutes } })` is configured in `vite.config.ts` in SvelteKit 3.

---

## 4. Paraglide i18n Strategy & `urlPatterns` (`I18N-01`, `I18N-02`, `I18N-06`)

- **Status:** `N-A` (Single-locale site `en`, no Paraglide installed; however see `MAP-05` / `I18N-03` finding below)
- **Evidence:**
  - `[CODE package.json:63-112]` — `@inlang/paraglide-js` is not installed.
  - `[CODE src/app.html:2]` — `<html lang="en">` hardcoded.
  - **Related `I18N-03` / `MAP-05` Finding (`FAIL`):** Despite being a single-URL English site with no regional URL variants, `[CODE src/routes/+layout.ts:35-39]` and `[CODE src/routes/sitemap.xml/+server.ts:138-140]` emit `hreflang="en-us"`, `hreflang="en-ca"`, and `hreflang="x-default"` all pointing to the exact same canonical URL.

---

## 5. Legacy `$app/stores` Usage (`META-05` / `SK:$app-state`)

- **Status:** `PASS`
- **Evidence:**
  - `[CMD]` `rg -n "\$app/stores" src/` → exit code `1` (`0` matches).
  - All components use `page` from `$app/state` (e.g., `[CODE src/routes/+layout.svelte:5]`, `[CODE src/routes/blog/+error.svelte:3]`, `[CODE src/lib/components/layout/Navbar.svelte:4]`).

---

## 6. JSON-LD Serializer Escaping (`SD-02`)

- **Status:** `FAIL`
- **Evidence:**
  - `[CODE node_modules/svelte-meta-tags/dist/JsonLd.svelte:22]` serializes JSON-LD via `JSON.stringify(schema).replace(/</g, '\\u003c')` — it escapes `<`, but does **not** escape `>`, `&`, `U+2028`, or `U+2029` as required by `SD-02`.
  - `[CODE src/routes/blog/[slug]/+page.svelte:39-44]` `serializeJsonLd` escapes `<`, `>`, `&`, `\u2028`, `\u2029` on `/blog/[slug]`, `/blog` (`[CODE src/routes/blog/+page.svelte:17-22]`), `/blog/category/[slug]` (`[CODE src/routes/blog/category/[slug]/+page.svelte:15-20]`), and `/blog/tag/[slug]` (`[CODE src/routes/blog/tag/[slug]/+page.svelte:15-20]`), whereas all 18 static marketing/store routes use `<JsonLd>` from `svelte-meta-tags` (`[CODE src/routes/+page.svelte:8]`, `[CODE src/routes/about/+page.svelte:6]`, etc.), which only escapes `<`.

---

## 7. Image Optimization & `<enhanced:img>` (`PERF-04`, `MEDIA-01`, `MEDIA-02`, `MEDIA-03`)

- **Status:** `PASS`
- **Evidence:**
  - `[CODE vite.config.ts:16-18]` `enhancedImages()` precedes `sveltekit()` in the Vite `plugins` array.
  - `[CODE src/lib/components/layout/Navbar.svelte:142]` `<enhanced:img src={logo} alt="Revolution Trading Pros emblem" fetchpriority="high" />`
  - `[CODE src/lib/components/layout/Footer.svelte:55]` `<enhanced:img src={logo} alt="Revolution Trading Pros emblem" />`
  - `[CODE src/lib/components/blog/PostCard.svelte:62-75]` and `[CODE src/routes/blog/[slug]/+page.svelte:337-350]` render `<picture>` with `<source type="image/webp" srcset={...}>` and explicit `width`, `height`, `alt`, `loading`, and `fetchpriority`.
  - `[CMD]` `03-baseline.json` (`missingAltCount: 0`, `missingDimensionsCount: 0` across all 74 URLs).

---

## 8. Critical Font Preload in `handle` Hook (`PERF-05`)

- **Status:** `FAIL`
- **Evidence:**
  - `[CODE src/hooks.server.ts:145]` calls `return svelteKitHandler({ event, resolve, auth, building });` without passing a custom `preload` filter (`resolve(event, { preload: ({ type }) => type === 'js' || type === 'css' || type === 'font' })`) as documented in `[DOC https://svelte.dev/docs/kit/performance § Preloading]`.
  - `[CODE src/app.css:10-13]` imports `@fontsource-variable/montserrat` and `@fontsource-variable/sofia-sans` (`font-display: swap`), which are bundled as WOFF2 assets under `/_app/immutable/assets/`, but `resolve` does not include `type === 'font'` in `preload`.

---

## 9. Third-Party `<script>` Tags (`PERF-06`)

- **Status:** `PASS`
- **Evidence:**
  - `[CMD]` `rg -n "<script" src/app.html src/routes/` shows zero third-party `<script src="...">` tags in `src/app.html` (`[CODE src/app.html:1-12]`) or route components.

---

## 10. Sitemap `<changefreq>` and `<priority>` Emission (`MAP-04`)

- **Status:** `PASS`
- **Evidence:**
  - `[CODE src/routes/sitemap.xml/+server.ts:127-161]` emits only `<loc>`, `<lastmod>`, and `<xhtml:link>` inside `<url>` elements; zero `<changefreq>` or `<priority>` tags are emitted.
  - `[HTTP]` `GET http://localhost:4279/sitemap.xml` (`03-baseline.json` lines 44-45: `"hasChangefreq": false, "hasPriority": false`).
