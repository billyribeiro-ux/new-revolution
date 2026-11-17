# New Page & Component Playbook (`docs/NEW_PAGE_PLAYBOOK.md`)

> **Audience:** Every AI agent and engineer adding, graduating, or modifying a public route, catalog card, or Svelte 5 component.  
> **Precedence:** Live code > [`AGENTS.md`](../AGENTS.md) > this playbook > [`docs/CSS_STANDARDS.md`](CSS_STANDARDS.md) > [`docs/SEO_STANDARD.md`](SEO_STANDARD.md).

All commands use `pnpm` exclusively ([`docs/VITE_PLUS_WORKFLOW.md`](VITE_PLUS_WORKFLOW.md)). Note the **CMS Blog Exception**: new blog articles are created and published through the CMS (`/admin/posts`), never as static Svelte route folders — read [`docs/BLOG_CONTRACT.md`](BLOG_CONTRACT.md) before touching `/` or `/blog/**`.

---

## 1. Choose the Page Archetype

Pick one archetype deliberately and never mix their breadcrumb or container primitives on the same route:

| Dimension            | **Archetype A — `.inner-page` (Default for All New Pages)**                                                                                  | **Archetype B — Bespoke Data Hub**                                             |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Used By**          | `/about`, `/our-mission`, `/mentorship`, `/live-trading-rooms` + 3 child rooms, 2 alert services, `/contact`, legal/trust pages, `/store/**` | `/resources`, `/resources/etf-stocks-list`, `/resources/stock-indexes-list`    |
| **Stylesheet**       | Global `.inner-page` system in `src/app.css` + concise scoped `<style>` in `+page.svelte`                                                    | Scoped `<style>` in `+page.svelte` consuming `:root` tokens from `src/app.css` |
| **`<main>` Element** | `<main id="<slug>-page" class="inner-page <slug>-page">`                                                                                     | `<main id="<slug>-page" class="<slug>-page">`                                  |
| **Breadcrumb**       | Inline `<nav class="breadcrumb-bar" aria-label="Breadcrumb">` (styled by `src/app.css`)                                                      | `<Breadcrumb items={[...]} />` (`src/lib/components/layout/Breadcrumb.svelte`) |

> **Never render `<Breadcrumb />` inside an `.inner-page` `<main>`** — `src/app.css` already styles `.inner-page .breadcrumb-bar*`, so combining them double-styles padding and borders.

---

## 2. Pre-Flight Reading & Svelte MCP Mandate

Before writing a single line of code:

1. Read [`AGENTS.md`](../AGENTS.md), [`docs/CSS_STANDARDS.md`](CSS_STANDARDS.md), and [`docs/SEO_STANDARD.md`](SEO_STANDARD.md).
2. Read one complete sibling route end-to-end:
   - **Archetype A Hub / Room:** `src/routes/live-trading-rooms/` (`+page.ts`, `+page.svelte`, `page.svelte.spec.ts`) + `src/lib/data/live-trading-rooms-hub.ts`.
   - **Archetype A Content Page:** `src/routes/mentorship/` (`+page.ts`, `+page.svelte`).
   - **Archetype B Data Hub:** `src/routes/resources/etf-stocks-list/` + `src/lib/data/etf-stocks-list.ts`.
3. **Run Svelte MCP First (Mandatory):**
   - Call `list-sections`, then `get-documentation` for all relevant Svelte 5 / SvelteKit sections (`$props`, `$state`, `$derived`, `snippet`, `@render`, `class`, `scoped-styles`, `kit/seo`, `kit/$app-paths`).
   - After authoring/editing any `.svelte` or `.svelte.ts` file, run `svelte-autofixer` (`desired_svelte_version: "5.57.3"`) until **zero issues and zero suggestions** remain.

---

## 3. Files to Create or Graduate, In Exact Order

### Step 3.1 — Static Content Module: `src/lib/data/<slug>.ts`

- Keep static arrays, matrices, and typed interfaces at module scope (`const` / `readonly`), never inside `$state()` in a component.
- **Single-Owner FAQ Rule:** Export `export const YOUR_PAGE_FAQ_ITEMS: readonly FaqItem[]` in [`src/lib/seo/structured-data.ts`](../src/lib/seo/structured-data.ts) (`FaqItem` imported from `#lib/data/homepage.ts`) and import it into `+page.svelte`. Never duplicate FAQ strings in two files.
- **Regulatory Accuracy:** Ensure any account-sizing or settlement copy reflects **FINRA Rule 4210 intraday margin** (`$2,000` baseline, effective June 4, 2026) and **T+1 cash settlement** — never legacy $25,000 PDT claims.

### Step 3.2 — Unified `@graph` Builder & Unit Spec: `src/lib/seo/structured-data.ts` + `.spec.ts`

Add a typed builder returning one `@graph` referencing the shared canonical entity builders (`buildOrganizationEntity`, `buildFounderEntity`, `buildOfferCatalogEntity`, `buildWebSiteEntity`), a `WebPage` / `CollectionPage` / `ProfilePage` / `ContactPage` node (whose `description` equals `+page.ts` `description`), a `BreadcrumbList` matching visible DOM breadcrumbs 1-to-1 (`SD-05`), and eligible `Service` / `SoftwareApplication` / `Product` / `ItemList` nodes:

- **Never emit** `FAQPage`, `HowTo`, `Course`, `CourseInstance`, `SpeakableSpecification`, `SpecialAnnouncement`, `ClaimReview`, or `SearchAction` (`SD-10`, `SD-15`).
- Add a `describe('buildYourPageJsonLd', ...)` suite in [`src/lib/seo/structured-data.spec.ts`](../src/lib/seo/structured-data.spec.ts) asserting JSON serializability, closed `@id` reference resolution, unique top-level `@id`s, and domain-node properties.

### Step 3.3 — Prerendered Route Loader: `src/routes/<route>/+page.ts`

```ts
import { definePageMetaTags } from 'svelte-meta-tags';
import { BRAND } from '#lib/config/brand.ts';
import { SITE_ORIGIN, buildYourPageJsonLd, getCanonicalUrl } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Concise Page Title'; // <= 33 chars (renders <= 60 chars with ` | ${BRAND.name}`)
	const description =
		'Unique 140-158 character summary explaining the exact educational value, institutional workflow, and defined-risk discipline covered on this page.';
	const canonical = getCanonicalUrl(url);

	return {
		...definePageMetaTags({
			title,
			description,
			canonical,
			openGraph: {
				type: 'website',
				url: canonical,
				title: `${title} | ${BRAND.name}`,
				description
			},
			twitter: {
				title: `${title} | ${BRAND.name}`,
				description
			}
		}),
		jsonLdSchema: buildYourPageJsonLd(SITE_ORIGIN)
	};
};
```

- **Non-Indexable Routes (`IDX-08`):** For member-auth, enrollment, launch-gated, or `[TODO]` routes, pass `robots: 'noindex, nofollow'`, `additionalRobotsProps: undefined`, and `canonical: getCanonicalUrl(url)`.

### Step 3.4 — Svelte 5 Page Component: `src/routes/<route>/+page.svelte`

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { YOUR_PAGE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { CONCEPT_PREVIEW } from '#lib/shared/development-status.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#<slug>-page">Skip to content</a>

<Navbar />

<main id="<slug>-page" class="inner-page <slug>-page">
	{#if CONCEPT_PREVIEW}
		<aside class="disclaimer-strip" aria-label="Proposed product and demonstration notice">
			<p><strong>Proposed concept, not an available service.</strong> …</p>
		</aside>
	{/if}

	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-current="page">Page Breadcrumb Label</li>
			</ol>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="<slug>-h1">
		<div class="container">
			<h1 id="<slug>-h1">…</h1>
			<button type="button" class="btn btn--acid" onclick={() => scrollToSection('<slug>-faq')}>
				Review Program FAQs
			</button>
		</div>
	</section>

	<section id="<slug>-faq" class="content-section" aria-labelledby="<slug>-faq-h2">
		<div class="container">
			<h2 id="<slug>-faq-h2" class="section-h2">Frequently Asked Questions</h2>
			<div class="faq-list">
				{#each YOUR_PAGE_FAQ_ITEMS as faq, idx (faq.id)}
					<details class="faq-item" open={idx === 0}>
						<summary>{faq.question}</summary>
						<p>{faq.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>
</main>

<Footer />
```

**Critical Implementation Rules:**

1. **No Duplicate PreFooter:** `<Footer />` already renders `HaveQuestions` and `SocialShareBar` via `PreFooter`. Never mount them inside `<main>`.
2. **Typed `resolve()` & Zero `#` Links:** Wrap every internal `<a href>` with `resolve('/about')` or two-argument `resolve('/resources/[slug]', { slug })`. Never build `<a href="#section">` in-page links — use `<button type="button" onclick={() => scrollToSection('id')}>`.
3. **Fluid Typography & Unitless Line-Height:** Use SSOT fluid tokens (`var(--step-*)`), semantic weights (`var(--weight-*)`), and unitless `line-height` (`1.5`, never `1.5rem`). Split-column heroes must set `container-type: inline-size` on the copy column and use $C^0$-continuous `min(viRamp, cqiRamp)` (`docs/CSS_STANDARDS.md` §3.3).
4. **Native `<details>` FAQs:** Keep every FAQ answer in server-rendered HTML via `<details>` (never `{#if open}`).

### Step 3.5 — Component / Route Spec: `src/routes/<route>/page.svelte.spec.ts`

Import `describe, expect, it` from `'vite-plus/test'` and `page` from `'vite-plus/test/browser'`, `await render(...)`, and assert:

1. `load()` metadata (`title` length `<= 33`, `description` length `140–158`, exact `SITE_ORIGIN` canonical).
2. Single `<h1>`, skip link `href` matching `<main id>`, breadcrumb `aria-current="page"`, and rendered FAQ count matching `YOUR_PAGE_FAQ_ITEMS.length`.
3. Interactive control states (`aria-pressed` / `aria-selected`, live `role="status"` updates, empty states).

---

## 4. Graduating a `[TODO]` Route & Wiring Site-Wide Discovery

All planned routes currently exist as `noindex, nofollow` `<TodoPageShell />` placeholders tracked in [`src/lib/data/todo-pages.ts`](../src/lib/data/todo-pages.ts) (`T16` in [`docs/TEMPORARY.md`](TEMPORARY.md)). When graduating one into a real built page:

| Step                           | File                                                     | Action                                                                                                                                                                                                                                                                               |
| :----------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Graduate `[TODO]` entry** | `src/lib/data/todo-pages.ts`                             | Remove the graduated route from `TODO_STATIC_PAGES`, `TODO_RESOURCE_PAGES`, or `TODO_ENROLL_PAGES` so `isTodoRoute(pathname)` returns `false` (and for `/resources/[slug]`, create the dedicated static folder `src/routes/resources/<slug>/` which takes precedence over `[slug]`). |
| **2. Navigation & Footer**     | `src/lib/data/homepage.ts` (+ `launch-gate.ts` if gated) | Verify/update `FULL_NAVIGATION` (`MAIN_NAVIGATION`) and `FULL_FOOTER_COLUMNS` (`FOOTER_COLUMNS`), and update navigation/footer counts in `src/lib/data/homepage.spec.ts` and `src/routes/page.svelte.e2e.ts` if items changed.                                                       |
| **3. Sitemap**                 | `src/routes/sitemap.xml/+server.ts`                      | Static indexable routes are discovered automatically once `isNoIndexRoute(pathname)` is `false`. Dynamic `[slug]` routes must be listed in `dynamicRoutes` with verifiable `lastmod` dates only (never emit `<priority>` or `<changefreq>`).                                         |
| **4. SEO Audit Inventory**     | `docs/seo/audit/02-inventory.json`                       | Update or add the concrete URL entry (`indexable: true` for public indexable pages; `indexable: false` for `/login`, `/register`, `/enroll/*`, or launch-gated `/store/*`) so `pnpm test:seo` (`tests/seo/seo-standard.spec.ts`) asserts its live contract.                          |
| **5. Trackers & Ledger**       | `todo.md`, `docs/TEMPORARY.md`, `CHANGELOG.md`           | Check off the route in `todo.md`, update the `T16` count in `docs/TEMPORARY.md`, and add an entry under `[Unreleased]` in `CHANGELOG.md`.                                                                                                                                            |

---

## 5. Verification Protocol & Definition of Done

### 5.1 Targeted Checks While Iterating

- **CSS / `.svelte` Styling:** `pnpm check:css && pnpm check` + `svelte-autofixer`
- **Data / JSON-LD:** `pnpm exec vp test run src/lib/seo/structured-data.spec.ts`
- **Route Component:** `pnpm exec vp test run src/routes/<route>/page.svelte.spec.ts`

### 5.2 Full Gate (Run Once Before Committing/Pushing to `main`)

```sh
pnpm format
pnpm check:css
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
pnpm check:pages
pnpm test:seo
pnpm exec playwright test
```

### 5.3 Runtime & Visual Proof Checklist

- [ ] `svelte-autofixer` (`5.57.3`) returned `0` issues and `0` suggestions on every touched `.svelte` / `.svelte.ts` file.
- [ ] `pnpm check:pages` passes all `99`+ prerendered contracts (`1` `<h1>`, valid `.skip` link, `https://www.revolutiontradingpros.com` canonical or clean `noindex` without canonical, valid JSON-LD).
- [ ] Zero horizontal overflow (`scrollWidth <= clientWidth`) across `320px`, `375px`, `768px`, `1024px`, `1280px`, `1440px`, `1536px`, and `1920px`, and under `200%` root font scaling (`32px`).
- [ ] Zero literal font-family names, zero `<link as="font">` tags, zero navigable `#fragment` links, zero `outline: none` without `:focus-visible`, and zero legacy $25k PDT claims.

Owner master-spec update (November 16, 2026): keep developer planning details in the source registry and roadmap; public unavailable routes render `AvailabilityPage` through `TodoPageShell`, without TODO strings or build checklists. Noindex utility pages retain production self-canonicals. Use `consolidateJsonLdGraph` to emit each named entity once; blog graphs include shared Website/Founder/Catalog entities.
