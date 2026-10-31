# New Page & Component Playbook

> **Audience:** every AI agent and engineer adding or changing a route, component, or stylesheet in this repo.
> **Status:** mandatory. Follow it top to bottom; do not skip a step because it "looks obvious".
> **Precedence when documents disagree:** `AGENTS.md` > this playbook > `docs/CSS_STANDARDS.md` > `GEMINI.md`.
> (If you find a real disagreement, the repo's actual behavior is the tiebreaker: fix the document, and say so in your report.)
> **Rule of thumb:** this file tells you _what to do and in what order_. `AGENTS.md` and `CSS_STANDARDS.md` own the
> _rules_ (token names, font rules, metadata limits). If you need a rule, read it there; do not copy it here.

Every command below is `pnpm` only (`npm`, `yarn`, `bun` are blocked). Never install tooling globally.

---

## 0. The 60-second summary

1. Decide the page archetype (§1). Default is **Archetype A (inner-page)**.
2. Read the files in §2. Fetch Svelte docs with the Svelte MCP **before** writing a `.svelte` file.
3. Create the files in §3 in that order: data → structured-data builder (+ spec) → `+page.ts` → `+page.svelte` → page spec.
4. Wire the page into the site (§4): homepage `LIVE_ROUTES`, navigation/footer data, planned-route bookkeeping, remove `as '/'` casts.
5. Run the **targeted** checks (§7.1), then `svelte-autofixer` as the LAST gate on every `.svelte` file.
6. Run the **full gate once** (§7.2) before a push or merge, plus the visual diff (§7.3) if you changed an existing page.
7. Walk the Definition of Done (§9). Report what you ran and what you skipped.

---

## 1. Choose the archetype

The repo has two page shapes. Pick one deliberately; do not mix them on one page.

|                | **A. Inner-page (default for every new page)**                                                                                                                                      | **B. Bespoke hub page (legacy shape)**        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Used by        | `/about`, `/our-mission`, `/mentorship`, 3 live rooms, `/alert-services/spx-profit-pulse`, `/blogs`, `/store/**`                                                                    | `/resources`, `/resources/etf-stocks-list`    |
| Stylesheet     | `import '#lib/styles/inner-page.css'` (global, scoped under `.inner-page`) + a small scoped `<style>` for page-only rules                                                           | Everything in the page's own scoped `<style>` |
| `<main>`       | `<main id="<slug>-page" class="inner-page <slug>-page">`                                                                                                                            | `<main id="..." class="<slug>-page">`         |
| Breadcrumb     | Inline markup using `.breadcrumb-bar` / `.breadcrumb-list` from `inner-page.css`                                                                                                    | `src/lib/components/layout/Breadcrumb.svelte` |
| Shared classes | `.page-hero`, `.content-section`, `.section-header`, `.section-kicker`, `.section-h2`, `.card-grid`, `.info-card`, `.pricing-card`, `.faq-list`, `.cta-banner`, `.disclaimer-strip` | none (page owns them)                         |

**Never use the `Breadcrumb.svelte` component inside a `.inner-page` page.** `inner-page.css` styles
`.inner-page .breadcrumb-bar*` globally; the component has its own scoped copy of those rules, so the two would stack and conflict.
Likewise never copy Archetype B's page-local `.btn`, `.meta-label`, `.section-kicker` rules into an Archetype A page.

If you are _editing_ an existing page, stay in its archetype. Migrating a page between archetypes is a separate, explicit task.

---

## 2. Pre-flight reading (do this before writing anything)

Read, in this order. Do not rely on memory.

1. `AGENTS.md` (all of it), `docs/CSS_STANDARDS.md` (all of it), and `docs/SEO_EVIDENCE.md` (the official-source log behind every SEO rule).
2. A **sibling page of the same archetype** end to end. Good references:
   - Archetype A, content page: `src/routes/mentorship/` (`+page.ts`, `+page.svelte`) and `buildMentorshipJsonLd` + `MENTORSHIP_FAQ_ITEMS` in `src/lib/seo/structured-data.ts`.
   - Archetype B, data-driven hub: `src/routes/resources/etf-stocks-list/` with `src/lib/data/etf-stocks-list.ts`.
3. `src/app.css` (tokens, layers, global `.skip`, `.container`, reduced-motion rule) and, for Archetype A, `src/lib/styles/inner-page.css`.
4. Svelte MCP (mandatory, every time, no task too small):
   - `mcp__svelte__list-sections`, then `mcp__svelte__get-documentation` for every matching section
     (typically `svelte/$state`, `$derived`, `$props`, `snippet`, `@render`, `each`, `class`, `style`, `scoped-styles`,
     `global-styles`, `custom-properties`, `kit/accessibility`, `kit/seo`, `kit/$app-paths`).
   - Read the `svelte-core-bestpractices` skill.
   - **Read docs first, write second.**
5. If you touch `.rs` files in this monorepo, the rust-analyzer MCP rules in the user-level instructions apply instead of this playbook.

---

## 3. Files to create, in order

Use the route `<route>` (e.g. `resources/options-calculator`), the slug `<slug>` (e.g. `options-calculator`),
and the URL `https://revolutiontradingpros.com/<route>`. In code samples `YOUR_PAGE_*` / `buildYourPageJsonLd` stand for
your page's real names (e.g. `OPTIONS_CALCULATOR_FAQ_ITEMS`, `buildOptionsCalculatorJsonLd`).

### 3.1 Static content: `src/lib/data/<slug>.ts` (only if the page has more than a few strings)

- Move types and content arrays out of the component into a module. Module scope is created once, not per component instance.
  Reference: `src/lib/data/etf-stocks-list.ts`, `src/lib/data/resources-hub.ts`.
- Plain `const`/`export`; no `$state` here (nothing in this file is reactive).
- **FAQ copy has exactly one owner:** an `export const YOUR_PAGE_FAQ_ITEMS: readonly FaqItem[]` in
  `src/lib/seo/structured-data.ts` (type `FaqItem` is `{ id, question, answer }`, imported from `#lib/data/homepage.ts`).
  The page renders from that export. **Never paste FAQ text into a component.**
- If the JSON-LD needs a list that the page also shows (e.g. the 12 ETFs), import the data module into
  `structured-data.ts` and derive the list; do not keep a second copy. (`structured-data.ts` already does this for `featuredETFs`.)
- Hrefs: type as `string` only if some targets are planned routes; otherwise prefer `RouteId` from `$app/types`.

### 3.2 Structured data: `src/lib/seo/structured-data.ts` + `src/lib/seo/structured-data.spec.ts`

Add, next to the closest existing builder:

```ts
export const YOUR_PAGE_FAQ_ITEMS: readonly FaqItem[] = [
	{ id: 'kebab-case-id', question: '…', answer: '…' }
	// every item must appear verbatim in the visible FAQ
] as const;

export function buildYourPageJsonLd(origin: string) {
	const pageUrl = `${origin}/<route>`;
	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage' /* or CollectionPage / ItemPage */,
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: '<Title> | Revolution Trading Pros',
				description: '<same string as +page.ts>',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: '<Page>', item: pageUrl }
				]
			},
			// domain node(s): Service / Course / SoftwareApplication / ItemList …
			// FAQPage only if the page shows a visible FAQ (Google retired FAQ rich results in May 2026; this is not a ranking tactic):
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: YOUR_PAGE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}
```

Rules: one `@graph` per page; reference shared `@id`s (`ORGANIZATION_ID`, `FOUNDER_ID`, `WEBSITE_ID`, `OFFER_CATALOG_ID`) through the
`build*Entity` helpers, never re-declare them; every `@id` is defined once; every `{ '@id': … }` reference resolves in the graph.

**Spec (required)** in `structured-data.spec.ts`, copy the shape of `describe('buildMentorshipJsonLd')`:

```ts
describe('buildYourPageJsonLd', () => {
	const graph = (build < Name > JsonLd(ORIGIN)['@graph']) as Node[];

	it('is JSON-serialisable and every @id reference resolves inside the graph', () => {
		expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('defines each top-level node @id only once', () => {
		const topIds = graph.map((n) => n['@id']);
		expect(new Set(topIds).size).toBe(topIds.length);
	});

	it('keeps FAQ schema in sync with the visible FAQ source', () => {
		/* compare names to YOUR_PAGE_FAQ_ITEMS */
	});
	// plus one assertion on the domain node (type, item count, audience, offers…)
});
```

### 3.3 `src/routes/<route>/+page.ts`

Follow `AGENTS.md` §3.1 exactly (import `definePageMetaTags`, `SITE_NAME`, `SITE_ORIGIN`, `getCanonicalUrl`).
Existing pages also return `jsonLdSchema: buildYourPageJsonLd(SITE_ORIGIN)` next to the spread tags (see `src/routes/mentorship/+page.ts`).

```ts
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonical = getCanonicalUrl(url);
	return {
		...definePageMetaTags({ title, description, canonical, openGraph: { … }, twitter: { … } }),
		jsonLdSchema: buildYourPageJsonLd(SITE_ORIGIN)
	};
};
```

House rules (count them, do not eyeball). **Titles and descriptions have no length limit in Google's docs**; these windows are our own convention (`docs/SEO_EVIDENCE.md` rows 4-5). Do not justify them as "Google requires":

- `title` ≤ **33** characters (the layout appends ` | Revolution Trading Pros`, +26, rendered title must be 30–60).
- `description` **140–158** characters, unique per route, and **the same string** is used in the JSON-LD `WebPage.description`.
- `canonical` and every OG URL come from `getCanonicalUrl(url)` / `SITE_ORIGIN`. Never `localhost`, never `http://sveltekit-prerender`.
- Dynamic `[slug]` routes that render shared fallback content: canonicalize non-flagship slugs to the flagship slug (`AGENTS.md` §3.2).

### 3.4 `src/routes/<route>/+page.svelte` (Archetype A skeleton)

```svelte
<!-- src/routes/<route>/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { YOUR_PAGE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#<slug>-page">Skip to content</a>

<Navbar />

<main id="<slug>-page" class="inner-page <slug>-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		… copy the markup from src/routes/mentorship/+page.svelte …
	</nav>

	<section class="section hero-section" aria-labelledby="<slug>-h1">
		<div class="container …">
			<h1 id="<slug>-h1">…</h1>
			<!-- the ONLY h1 on the page -->
		</div>
	</section>

	<!-- sections: h2 per section, h3 inside; strictly descending, no skipped levels -->

	<section class="section" aria-labelledby="<slug>-faq-h2">
		<div class="container">
			<h2 id="<slug>-faq-h2">…</h2>
			{#each YOUR_PAGE_FAQ_ITEMS as faq, idx (faq.id)}
				<details class="faq-item" open={idx === 0}>
					<summary>{faq.question}</summary>
					<p>{faq.answer}</p>
				</details>
			{/each}
		</div>
	</section>
</main>

<Footer />
```

Notes that are easy to get wrong:

- **`<Footer />` already renders `HaveQuestions` and `SocialShareBar`** (via `PreFooter`, `showPreFooter` defaults to `true`).
  Do **not** add them to the page.
- The skip link `href` must equal the `<main>` `id`. `pnpm check:pages` verifies it.
- **FAQs use native `<details>/<summary>`** so every answer is in the prerendered HTML. A JS-driven accordion that only renders the
  expanded answer (`{#if expanded}`) hides the other answers from crawlers while the JSON-LD still lists them. That breaks 1:1 parity.
- Internal links: `href={resolve('/path')}`. A hash or query goes **inside** the call, `resolve('/resources#etfs-by-sector')`
  (type-checked, lint-clean, verified). Same-page anchors are plain `href="#id"`. Do **not** build links with template literals or
  concatenation (`` `${resolve('/x')}#y` `` fails `svelte/no-navigation-without-resolve`). Links to routes that do not exist yet:
  `resolve('/path' as '/')`, see §4.
- Archetype B pages additionally use `<Breadcrumb items={[…]}>` (props are `RouteId`s, resolved inside the component; `class` lands on the
  inner box, e.g. `class="container"` when the page's content box is the global `.container`).

### 3.5 Page spec: `src/routes/<route>/page.svelte.spec.ts`

Vitest browser project (`client`). Copy `src/routes/resources/etf-stocks-list/page.svelte.spec.ts`:

1. A `load()` test that locks title, description (assert the exact string **and** `.length`), canonical/OG URL.
2. A render test: `render(Page, { data: { pageMetaTags: {}, jsonLdSchema: buildYourPageJsonLd(SITE_ORIGIN) } as never })`, then assert the h1
   by role/name and the counts that matter (cards, rows, FAQ items).
3. For every interactive control, a behavior test: click/fill, assert `aria-pressed`/`aria-expanded`, resulting DOM, live-region text,
   and the empty state. (`requireAssertions` is on: every test needs an `expect`.)
4. A landmark test: `a.skip` href equals the `<main>` id; breadcrumb last item is `aria-current="page"` and is not a link.

### 3.6 Adding a catalog card (courses, indicators, scanners, blog, ...)

Follow this exact recipe; `CourseCard`, `IndicatorCard` and `BlogCard` are the working references.

1. **Data module** `src/lib/data/<things>.ts` (module scope): a typed `interface` with a real `slug` (never a hash or a special-cased id), `featured?: boolean` on at most one lead item, a filter-option list derived from the catalog length (`All X (${catalog.length})`), and nothing page-specific. The Schema.org list in `structured-data.ts` derives from the same array (name/description = the visible title/hook) so JSON-LD text matches the cards.
2. **Card component** `src/lib/components/<domain>/<Thing>Card.svelte`: `interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'>` with the item, optional `headingLevel`, `class?: ClassValue`, spread `...rest` onto `<CatalogCard>`. Compose snippets (`top`/`media`, `eyebrow`, `title`, `intro`, default children, `footer`). The `title` snippet renders the single `<a class="catalog-card__link" href={detailHref}>` where `detailHref = $derived(resolve('/route/[slug]', { slug }))`. Disclosures are native `<details>`. Style only the content in the component's scoped `<style>`.
3. **Page**: `<FilterChips label=... options=... bind:value />` then `<CatalogGrid items key isFeatured total noun>` with `{#snippet children(item)}<ThingCard {item} />{/snippet}`. No per-page grid CSS, no `role="tablist"`.
4. **Specs**: one component spec (`*.svelte.spec.ts`: link target, heading level, class + rest forwarding, disclosure open state, featured marker) and the page spec (list semantics, filter `aria-pressed`, status text). Note: `render()` returns a promise in this repo's vitest-browser-svelte, and a prop literally named `intro` collides with `mount()` options, so pass props via `{ props: {...} }` in that case.
5. **Remove** the old global CSS for the mock from `inner-page.css` (check no other page uses the classes first) and prove no regression elsewhere with the pixel diff (§7.3).
6. **Editing ONE card (blog cards).** Every post in `src/lib/data/blog-hub.ts` is an independent object, and the file header lists what each field does. Content (title, excerpt, category, dates, cover `image`) is edited in place. The look of a single card is edited only in that post's optional `presentation` block, with no component code involved: `focus: [x, y]` (percent anchor of the cover when cropped), `overlay: 'soft' | 'standard' | 'strong'` (scrim strength; all three are verified AA), `accent: 'acid' | 'acid2' | 'coral'` (badge + focus ring). Mock covers live in `static/blog-mocks/*.svg` (each stamped "MOCK COVER"); swap `image.src` for a real cover and drop `mock: true`. A cover should have a visually quiet top (title) and bottom (excerpt) third.
7. **Light sections**: pass `tone="light"` to the `FilterChips`, the `CatalogGrid` and every card on a light surface (the `/blogs` list is the reference). Never reuse `--acid` as text or as a focus outline there.
8. **Device check**: the width list and measurements in `docs/CSS_STANDARDS.md` §4.10, plus a computed WCAG contrast pass over every text node (composite semi-transparent backgrounds first; Chrome returns `color(srgb …)` for `color-mix()`). Disable the global `html { scroll-behavior: smooth }` in the test page, or Playwright click coordinates go stale.

---

## 4. Wire the page into the site

Do all that apply. Each item names the exact file.

| Step                      | File                                                                                                   | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sitemap                   | `src/routes/sitemap.xml/+server.ts`                                                                    | Static routes: automatic (it globs `src/routes/**/+page.svelte`, excluding `[slug]`, `/demo`, `/lp`, auth/admin). Slug pages: add an entry to `dynamicRoutes`; it is listed **only if a matching `[param]` route template exists** (no 404s in the sitemap). `lastmod` only with a real recorded date; never today's date (Google ignores unverifiable `lastmod`; `priority`/`changefreq` are ignored, do not emit). The e2e fetches every `<loc>` and expects 200. |
| Homepage preview toast    | `src/routes/+page.svelte` → `LIVE_ROUTES`                                                              | Add the new path so homepage links navigate instead of showing the "preview route" toast. (Only the homepage uses this.)                                                                                                                                                                                                                                                                                                                                            |
| Header menu               | `src/lib/data/homepage.ts` → `MAIN_NAVIGATION`                                                         | Add/adjust the `NavItem` child if the page belongs in the menu (`label`, `href`, `previewTarget`, `icon`, `description`). Icons come from `src/lib/components/layout/nav-icons.ts`.                                                                                                                                                                                                                                                                                 |
| Footer                    | `src/lib/data/homepage.ts` → `FOOTER_COLUMNS` (and `bottomLinks` in `Footer.svelte` for legal/contact) | Add the link where appropriate.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Counts in tests           | `src/lib/data/homepage.spec.ts`, `src/routes/page.svelte.e2e.ts`                                       | If you changed navigation/footer entries, update the exact counts those tests assert.                                                                                                                                                                                                                                                                                                                                                                               |
| Planned-route bookkeeping | `vite.config.ts` → `PLANNED_ROUTE_PATTERN`                                                             | See below.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Remove casts              | every `resolve('<route>' as '/')`                                                                      | Once the route exists, drop the cast so the compiler checks it from now on.                                                                                                                                                                                                                                                                                                                                                                                         |

**`PLANNED_ROUTE_PATTERN` is a section-prefix regex, not a per-page list.** It lets a 404 under a whole section
(`live-trading-rooms|alert-services|store|resources|blogs|memberships|login|signup|register|contact|privacy-policy|terms-of-service`)
pass prerendering with a warning. Therefore:

- Single-page entries (`memberships`, `login`, `signup`, `register`, `contact`, `privacy-policy`, `terms-of-service`): when you build that
  page, **delete the entry from the regex**; a later broken link to it must fail the build again.
- Multi-page sections (`resources`, `store`, `blogs`, `live-trading-rooms`, `alert-services`): leave the entry until **every** planned page
  in the section exists, then delete it.
- After editing the regex, run `pnpm build` and read the `[prerender] planned route not built yet` warnings. They are the exact to-do
  list of remaining missing pages. Then find all casts with `grep -rn "as '/'" src` and remove the ones for routes that now exist.

**Currently missing routes that are linked** (verify with the build warnings; this list rots):
`/resources/options-calculator`, `/alert-services/explosive-swings`, `/signup`, `/contact`
(the `/resources` hub test expects "Get Started Free" to link to `/signup`).

When a missing page is built, also update copy that says it is a "planned" or "preview" feature, and add it to the JSON-LD lists that
describe the section (for example `RESOURCES_HUB_UTILITIES` in `structured-data.ts`).

---

## 5. Svelte 5 rules (hard evidence: official docs + the autofixer)

Source of truth: Svelte MCP docs and `svelte-core-bestpractices`. Violations that were found and fixed in this repo are listed.

- **Runes only.** `$props()`, `$state`, `$derived`, `$effect`. Never `export let`, `$:`, `on:click`, `<slot>`, `<svelte:component>`, `use:action`
  (use `{@attach}`), stores for component state.
- `$state` only for values that change and are read reactively. Static content is a plain module-level const (§3.1).
  Large objects that are only reassigned use `$state.raw`.
- Compute with `$derived` / `$derived.by`, never `$effect`. Hoist work out of per-item callbacks (compute the lowercased search query
  **once** in `$derived.by`, not once per filtered item).
- Props that feed other values go through `$derived` (props can change).
- **Keyed `{#each}`** with a unique, stable key (never the index). Add `{:else}` for the empty state when the list can be empty.
- **Classes:** `class={['base', { 'is-x': cond }]}` (clsx array/object). Not the `class:` directive. For a prop that carries classes, type it
  `ClassValue` from `svelte/elements` and apply with an array (`Breadcrumb.svelte`).
- **Dynamic CSS values:** `style:--name={value}` plus `var(--name)` in `<style>`; no inline style strings, no JS-driven styling.
- **Parent → child styling:** custom properties or a `class` prop. Never `:global` to reach into a child you own.
- Share repeated markup+CSS as a scoped component with a `children` snippet (`Breadcrumb.svelte`), not copied CSS.
- **Declaration tags, not `{@const}`:** the Svelte docs mark `{@const x = y}` as legacy since 5.56; write `{const x = $derived(y)}` inside blocks (verified: Prettier, `svelte-check` and the autofixer accept it).
- **Typed dynamic routes:** `resolve('/store/courses/[slug]', { slug: course.slug })` is checked against the route manifest (a wrong param key fails `pnpm check`); use it instead of template strings or `as '/'` whenever the route exists.
- **Reusable components** (references: `CourseCard.svelte`, `FilterChips.svelte`, `Breadcrumb.svelte`): `interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class'>` + `class?: ClassValue` + `...rest` spread; `$props.id()` for `aria-labelledby`; `<svelte:element this={\`h${level}\`}>`for a configurable heading level;`<script lang="ts" generics="T extends string">`with`$bindable()` for a typed v-model (`FilterChips`); data comes in as one typed prop (`course`), never as 15 loose props. Add a component spec (`*.svelte.spec.ts`) for its contract.
- Do not suppress compiler warnings (`svelte-ignore`) to hide a problem. Example: `tabindex="0"` on a `role="region"` triggers
  `a11y_no_noninteractive_tabindex`; the correct answer was to remove it (modern browsers focus scrollers natively), not to ignore it.
- **`svelte-autofixer` (MCP) is the LAST gate on every modified `.svelte` file.** Pass the whole real file when it is reasonably sized;
  for very large pages pass the real `<script>` plus every changed template region and say so in your report. Repeat until it returns
  no issues and no suggestions.

---

## 6. CSS, accessibility and SEO rules that bite

Rules live in `docs/CSS_STANDARDS.md`; these are the traps that actually happened here.

**Fonts / tokens**

- Fonts only through `var(--font-display)`, `var(--font-sans)`, `var(--font-mono)`. A literal `'Montserrat'` / `'Sofia Sans'` matches no
  loaded face (Fontsource registers only `* Variable`) and silently falls back to system fonts. `pnpm check:css` fails on it.
- No `font-stretch` / `font-variation-settings: 'wdth'` (both fonts ship only `wght`).
- Every `var(--x)` must be declared in `src/app.css` or on a local parent selector (`pnpm check:css`).
- Reuse an existing token when the value is identical; do not invent a near-duplicate grey. One-off values stay local.
- Colour contrast: acid (`--acid`) is never text on light surfaces; acid backgrounds pair with `color: var(--ink)`.

**Accessibility**

- Exactly one `<h1>`; `h1 → h2 → h3` with no skipped level.
- Skip link first in the document, `href` equal to the `<main>` id.
- Toggle/filter buttons: `role="group"` + `aria-pressed` (style from `[aria-pressed='true']` so visual and accessible state cannot
  diverge). Use `role="tablist"` **only** with real `tabpanel`s and arrow-key handling.
- Result lists that change under user input get a polite live region (`role="status"`: "Showing N of M") and an empty state.
- External links: `target="_blank" rel="noopener noreferrer"` **and** an accessible name that says it opens in a new tab
  (the visible text must be contained in the accessible name). Decorative glyphs (`↗`, `✓`) get `aria-hidden="true"`.
- Never leave a focusable element without a visible focus indicator. Do not write `outline: none` on `:focus`; the global
  `:focus-visible` ring in `src/app.css` applies. A border-colour change alone is not a focus indicator.
- Motion: do not add per-component `prefers-reduced-motion` blocks; `src/app.css` has the global rule. Do keep transitions short and on
  `transform`/`opacity`.
- Images: always `width` + `height` (or `aspect-ratio`) to prevent CLS.
- No `window.confirm/alert/prompt`.

**Layout**

- Mobile-first; breakpoints `480 / 640 / 768 / 1024 / 1280 / 1536`.
- The global `.container` (in `src/app.css`, `layout` layer) also applies to any element with that class **even if the page defines its
  own scoped `.container`**. Combined, they set the content box. When extracting a section into a component, copy both effects or pass
  `class="container"` through; a pixel diff (§7.3) catches this.
- Integer `line-height` on newly inserted rows (e.g. `1.5rem`) so the inserted height is a whole number of pixels and the diff below the
  insertion is exactly zero.

**SEO**

- `pnpm check:pages` after `pnpm build` verifies: one h1, a valid skip link, canonical on `https://revolutiontradingpros.com`, no
  `localhost`/`sveltekit-prerender`, parseable JSON-LD, and FAQ JSON-LD text present in the visible HTML.
- Description/title lengths are asserted in the page spec (§3.5); they are house conventions, not Google rules.
- Before making **any** SEO claim or adding markup "for Google", read `docs/SEO_EVIDENCE.md` (official sources, quoted, dated). Key facts: FAQ rich results are gone (May 2026); structured data must match visible text; no special markup is needed for AI Overviews; no confirmed ranking update exists for Oct 30, 2026. Anything not in that log must be fetched from the official page and added there first.
- Sitemap rules are in §4. URLs: lowercase, hyphens, never change content by `#fragment`.

---

## 7. Verification protocol

The project owner's rule: **test what changed; the full gate runs once, immediately before a push or merge.** Every gate run costs money.
Say what you ran and what you skipped.

### 7.1 Targeted (after each logical change)

| Changed                            | Run                                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| a `.svelte` file                   | its page/component spec, `pnpm check` (svelte-check: 0 errors, **0 warnings**, which includes unused CSS selectors), then `svelte-autofixer` |
| `structured-data.ts` / data module | `pnpm exec vitest run src/lib` and the page spec that renders it                                                                             |
| a stylesheet or CSS in a component | `pnpm check:css`, `pnpm check`                                                                                                               |
| a doc or script                    | `pnpm exec prettier --check <file>` and run the script itself                                                                                |

Use `pnpm exec vitest run <path>` for a single spec. Browser specs run in Chromium via Playwright.

### 7.2 Full gate (once, before push/merge)

```bash
pnpm check:css
pnpm check
pnpm lint            # prettier --check . && eslint .  (includes svelte/no-navigation-without-resolve)
pnpm test:unit --run
pnpm build
pnpm check:pages     # all prerendered pages; must be fully green (50/50 at last run)
pnpm exec playwright test   # e2e; `pnpm test:e2e` also runs `playwright install` (a download), avoid unless browsers are missing
```

`pnpm lint` fails on any `<a href>` that is not wrapped in `resolve()`. Prettier reformats `.svelte` aggressively: run
`pnpm exec prettier --write <file>` and then re-run `pnpm check`.

Never push to `main`. Branch first, push once, merge separately (a push invalidates the green checks you were about to merge).

### 7.3 Visual regression (mandatory when you change an existing page's markup or CSS)

Compare real screenshots before and after. Procedure:

1. `pnpm build` from the **current** tree (a stale `pnpm preview` serves the previous build: always rebuild before measuring).
2. `pnpm exec vite preview --port 4173`, screenshot each affected route at **1280 px and 390 px**, `fullPage: true`, after
   `await document.fonts.ready` and with animations/transitions disabled (`*{animation:none!important;transition:none!important}`).
3. `git stash -u`, rebuild, screenshot again as "before", `git stash pop`.
4. Diff pixel-by-pixel (a canvas in Chromium is enough; no diff library is installed). Expected result: **0 differing pixels**, or, if you
   inserted content, 0 above the insertion and 0.000 % below it after shifting by the inserted height.
5. Any non-zero region is a regression until explained. Crop the region and look at it.

### 7.4 Runtime evidence (not just "tests pass")

- Fonts: in Chromium, `getComputedStyle(h1).fontFamily` starts with `"Montserrat Variable"`; `document.fonts` lists only the `* Variable`
  faces; the network log has **no** non-localhost requests and only `*.woff2` files from `/_app/immutable/assets/`.
- Overflow: `document.documentElement.scrollWidth - clientWidth === 0` at 320/480/640/768/1024/1280/1536 px.
- Keyboard: first `Tab` focuses the skip link and `Enter` moves focus to `<main>`; every control works with Enter/Space; focus ring visible.

---

## 8. Known debt and gotchas (verified; do not "fix" by accident, do not copy)

Do not spread these patterns. Fix them only as an explicit, scoped task and re-run §7.3. (Resolved 2026-10-30, with evidence: skip links on all 50 pages, `stock-indexes-list` FAQ parity, dead `font-stretch`/`wdth` declarations removed with 100/100 screenshots identical, sitemap `lastmod`/404 entries.)

1. **Near-duplicate greys** (`#333b43`, `#2b3239`, `#30363c`, `#2f363d`, `#3e454c`, …) repeat in `inner-page.css` and store pages.
   Consolidating them shifts pixels and needs a visual sign-off; do not merge them silently.
2. **Hub JSON-LD wording** (`RESOURCES_HUB_UTILITIES`) differs from the visible utility names on `/resources`. Aligning them changes SEO output;
   needs an owner decision.
3. **Planned-route links** (`as '/'` casts) exist wherever a target page is missing (§4). The cast hides route typos; remove it as soon as the
   route exists.
4. `resolve()` is typed per route. A `RouteId` _union_ is not accepted, so `Breadcrumb.svelte` has one contained, commented `as '/'` cast.
5. **Safari keyboard scrolling** of wide `overflow-x: auto` tables (e.g. the ETF comparison table) is unverified; Chromium/Firefox make
   scroll containers focusable natively.
6. Prettier will rewrite attribute layout in `.svelte` files; never hand-edit around it, and never use `sed` for multi-line attribute edits
   (an edit once removed a closing `>`). Use a script with an exact-match assertion, then Prettier, then `pnpm check`.
7. **Shared checkout, concurrent sessions.** On 2026-10-30 another actor committed (and merged, as PR #2) this work's _uncommitted_
   edits mid-session under an unrelated message, and `git switch` then silently replaced files. Do all verification in an isolated
   `git worktree add /tmp/<name> -b <branch> origin/main` (+ `pnpm install --frozen-lockfile --offline`), never `git stash` in a shared
   checkout, and re-read `git status` before trusting a baseline.
8. **Keep non-source files out of `src/`.** A 578-line prompt `.md` committed under `src/` made `pnpm lint` fail on `main`
   (`prettier --check .`). Put docs and prompts in `docs/`.
9. **Do not trust a template you have not compiled.** The old `AGENTS.md` `+page.ts` template imported a nonexistent `SITE_NAME` and a
   nonexistent `/og-default.png`; it never type-checked. When you change a template, paste it into a temp route and run `pnpm check`.
10. **FAQ markup is not a Google feature anymore** (retired May 2026). Do not add FAQ sections or `FAQPage` nodes for SEO; keep parity
    on the ones that exist (`docs/SEO_EVIDENCE.md` rows 1-2).

---

## 9. Definition of Done (copy into your report; every box must be true or explicitly explained)

**Files**

- [ ] `+page.ts` (prerender, metadata within limits, canonical via `getCanonicalUrl`) and `+page.svelte` (correct archetype).
- [ ] Data module (if large) and `*_FAQ_ITEMS` single source; no copied FAQ/ETF/list text.
- [ ] `buildYourPageJsonLd` + its spec added to `structured-data.spec.ts`; one `@graph`, shared `@id`s, resolves, unique ids.
- [ ] Page spec with load/render/behavior/landmark tests.

**Wiring (§4)**

- [ ] `LIVE_ROUTES`, `MAIN_NAVIGATION` / `FOOTER_COLUMNS` updated as applicable; test counts updated.
- [ ] `PLANNED_ROUTE_PATTERN` entry removed when its page/section is complete; `as '/'` casts for this route removed.
- [ ] Sitemap contains the route (checked in the built output).

**Quality**

- [ ] Svelte docs fetched via MCP before writing; `svelte-autofixer` clean on every modified `.svelte` file (state how much of each file it saw).
- [ ] `pnpm check` 0 errors / 0 warnings; `pnpm check:css`; `pnpm lint`; specs pass.
- [ ] `pnpm build` then `pnpm check:pages <route>`: ok.
- [ ] Runtime evidence (§7.4) and, for changed existing pages, the pixel diff (§7.3).
- [ ] No new `font-family` literals, no new near-duplicate hex values, no `outline: none` on focus, no `class:` directives, no `:global` into owned children.

**Report**

- [ ] Every SEO statement is backed by `docs/SEO_EVIDENCE.md` or you added a sourced row there.
- [ ] State exactly what was run, with results, what was skipped and why, and any gap or limitation. Never claim a check passed unless it was executed.
- [ ] Update this playbook (§8) if you discovered a new landmine or retired a known one.
