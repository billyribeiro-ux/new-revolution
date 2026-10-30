# REVOLUTION TRADING PROS — MASTER ARCHITECTURE, COPYWRITING & OCT 2026 SEO DIRECTIVE (FOR ARGON AI)

> **SYSTEM MANDATE FOR ARGON:** You are building and maintaining **Revolution Trading Pros** (`https://revolutiontradingpros.com`) using **Svelte 5 (Runes: `$state`, `$derived`, `$props`, `$effect`)** and **SvelteKit**. You must strictly obey every architectural, SEO, routing, sitemap, landing page, copywriting, and native CSS rule in this document without deviation.

---

## 1. BRAND IDENTITY, CORE ETHOS & VERIFIED AUTHORITY PILLARS

Every marketing page, component, metadata tag, and JSON-LD schema block must faithfully reflect our core identity:

1. **The Anti-Guru Standard (People Over Profits):**
   - Unlike 95% of trading education services that exist to make money selling overpriced courses and fake, repainted "holy grail" indicators, **Revolution Trading Pros focuses on PEOPLE and member success—not making money off subscriptions.**
   - Our founder has stood on the losing end in the past and built this platform so traders finally know they found what they have been searching for—with **zero hype, zero lies, and zero BS**.
2. **Institutional Pedigree & Wall Street Lineage:**
   - Directly mentored by former Wall Street **Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick**, who explicitly called our founder **"the future of trading."**
   - Positioned as **the only retail trader feared by Wall Street**.
3. **Hard, Verifiable Market Proof (Must Be Framed With Institutional Mechanics for YMYL Compliance):**
   - **2020 Macro Call:** Accurately called both the **2020 COVID Crash Top and Generational Bottom** in real time.
   - **2022 Macro Call:** Accurately called both the **2022 Bull Market Top and Bear Market Bottom** in real time.
   - **Live Single-Stock Options Proof (+600% Overnight on OXY):** Embarrassed **Warren Buffett live on Occidental Petroleum (OXY)**—while Buffett went long millions of dollars and retail chased the headline, we spotted institutional liquidity exhaustion, shorted via defined-risk **OXY Put Options live**, and banked **600% overnight**.
4. **Who We Cover (No Trader Left Behind):**
   - **Working Professionals (9-to-5 Schedules):** Multi-day swing setups and pre-planned video watchlists with exact entries, exits, and stops.
   - **Active Day Traders, Options Scalpers & Full-Time Pros:** Real-time live market voice, screen sharing, and institutional order flow execution.
   - **Small Account Traders ($500+ Starting Capital):** Dedicated room and strict risk-control strategies built for accounts starting as low as **$500**.
   - **Affordable Alert-Only Members (`SPX Profit Pulse` & `Explosive Swings`):** Detailed video watchlists and alerts with exact targeted entries, profit exits, and stop-loss levels.
   - **1-on-1 Mentorship:** Strictly by **application and approval only** (never a direct "Buy Now" checkout).
5. **Approved Slogans:**
   - **Primary Institutional Triad:** _"Educate. Innovate. Prosper."_
   - **Movement Closer:** _"Wall Street Protects Its Own. Mark 'Goldfinger' McGoldrick Called Us the Future of Trading. We Are the Present and the Future—We Are the Revolution!"_
6. **STRICT PRICING RULE:**
   - **NEVER display or mention dollar prices** for memberships, rooms, alerts, courses, indicators, or scanners anywhere on the site unless the user explicitly overrides this rule later. _(Note: Referencing "$500+ Small Accounts" as a trader's starting brokerage capital is required)._

---

## 2. CANONICAL NAVIGATION MENU & URL ROUTING HIERARCHY

Never invent, reorder, or rename top-level navigation items. All navigation components (`Navbar.svelte`, `Footer.svelte`, breadcrumbs, and internal links) must follow this exact 8-item menu and submenu order:

| Menu Order | Top-Level Label          | Type        | Submenu Items (Exact Order)                                                  | Canonical SvelteKit Route Path                                                                                                  |
| :--------- | :----------------------- | :---------- | :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **1**      | **Live Trading Rooms ▾** | Dropdown    | 1. `Day Trading Room`<br>2. `Swing Trading Room`<br>3. `Small Accounts Room` | `/live-trading-rooms/day-trading-room`<br>`/live-trading-rooms/swing-trading-room`<br>`/live-trading-rooms/small-accounts-room` |
| **2**      | **Alert Services ▾**     | Dropdown    | 1. `SPX Profit Pulse`<br>2. `Explosive Swings`                               | `/alert-services/spx-profit-pulse`<br>`/alert-services/explosive-swings`                                                        |
| **3**      | **Mentorship**           | Direct Link | _(No submenu — 1-on-1 Application & Approval Only)_                          | `/mentorship`                                                                                                                   |
| **4**      | **Store ▾**              | Dropdown    | 1. `Courses`<br>2. `Indicators`<br>3. `Scanners`                             | `/store/courses`<br>`/store/indicators`<br>`/store/scanners`                                                                    |
| **5**      | **Our Mission**          | Direct Link | _(No submenu — People Over Profits Manifesto)_                               | `/our-mission`                                                                                                                  |
| **6**      | **About**                | Direct Link | _(No submenu — Founder Story, Goldman Sachs Pedigree & Track Record)_        | `/about`                                                                                                                        |
| **7**      | **Blogs**                | Direct Link | _(No submenu — Latest 3 shown on Homepage + Top-Right "See All Blogs" CTA)_  | `/blogs` _(Posts at `/blogs/[slug]`)_                                                                                           |
| **8**      | **Resources ▾**          | Dropdown    | 1. `Options Calculator`<br>2. `ETF Stocks List`<br>3. `Stock Indexes List`   | `/resources/options-calculator`<br>`/resources/etf-stocks-list`<br>`/resources/stock-indexes-list`                              |

_Additional Mandatory YMYL Footer & Utility Routes:_

- `/contact`, `/privacy-policy`, `/terms-of-service` (Indexable, included in sitemap)
- `/login` (Non-indexable, excluded from sitemap)

---

## 3. SITEMAP AUTOMATION, SERVICE RENAMING & LANDING PAGE LAWS

### 3.1 Why `sitemap.xml` Is a Folder in SvelteKit

In SvelteKit’s filesystem router, URL segments are directory names and server endpoints must be named `+server.ts`. Therefore, the XML sitemap MUST live at:

- **Directory:** `src/routes/sitemap.xml/`
- **File:** `+server.ts`
- **Full Path:** `src/routes/sitemap.xml/+server.ts`

### 3.2 Zero-Maintenance Auto-Discovery Sitemap Code

Do **NOT** hardcode a static array of marketing routes that breaks when a service is renamed. Always use Vite’s `import.meta.glob('/src/routes/**/+page.svelte')` so the sitemap automatically discovers every indexable route and excludes private/ad routes:

```typescript
// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const baseUrl = '[https://revolutiontradingpros.com](https://revolutiontradingpros.com)';
	const today = new Date().toISOString().split('T')[0];

	// 1. Auto-discover all indexable SvelteKit pages from the filesystem
	const pageModules = import.meta.glob('/src/routes/**/+page.svelte');

	const discoveredRoutes = Object.keys(pageModules)
		.map((filePath) => {
			return (
				filePath
					.replace('/src/routes', '')
					.replace('/+page.svelte', '')
					.replace(/\/\([^)]+\)/g, '') || '/' // Strip SvelteKit route groups like /(marketing)
			);
		})
		.filter((route) => {
			// Exclude dynamic [slug] templates, auth/admin routes, and /lp/ ad squeeze pages
			return (
				!route.includes('[') &&
				!route.startsWith('/lp') &&
				!route.startsWith('/login') &&
				!route.startsWith('/register') &&
				!route.startsWith('/dashboard') &&
				!route.startsWith('/admin') &&
				!route.startsWith('/checkout')
			);
		});

	// 2. Dynamic Blog Articles (Fetch from Laravel API in production)
	const blogPosts = [
		{ path: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight', lastmod: '2026-10-28' },
		{
			path: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			lastmod: '2026-10-24'
		},
		{
			path: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine',
			lastmod: '2026-10-20'
		}
	];

	const staticEntries = discoveredRoutes.map((path) => ({
		path,
		lastmod: today
	}));

	const allRoutes = [...staticEntries, ...blogPosts];

	const urlNodes = allRoutes
		.map(({ path, lastmod }) => {
			const fullUrl = `${baseUrl}${path === '/' ? '' : path}`;
			return [
				'  <url>',
				`    <loc>${fullUrl}</loc>`,
				`    <lastmod>${lastmod}</lastmod>`,
				`    <xhtml:link rel="alternate" hreflang="en-us" href="${fullUrl}" />`,
				`    <xhtml:link rel="alternate" hreflang="en-ca" href="${fullUrl}" />`,
				`    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />`,
				'  </url>'
			].join('\n');
		})
		.join('\n');

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="[http://www.sitemaps.org/schemas/sitemap/0.9](http://www.sitemaps.org/schemas/sitemap/0.9)" xmlns:xhtml="[http://www.w3.org/1999/xhtml](http://www.w3.org/1999/xhtml)">',
		urlNodes,
		'</urlset>'
	].join('\n');

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
			'X-Robots-Tag': 'noindex'
		}
	});
};
```

### 3.3 Protocol When Renaming a Service

Whenever the user changes the name of a service (e.g., renaming a room or alert service):

1. **Update the Route Folder:** Rename the corresponding folder in `src/routes/...` to match the new SEO slug. (Because `sitemap.xml/+server.ts` uses `import.meta.glob`, the sitemap updates automatically).
2. **Update Internal Links & Schema:** Update the label and `href` in `Navbar.svelte`, `Footer.svelte`, homepage cards, and the JSON-LD `OfferCatalog`.
3. **Enforce a 301 Permanent Redirect (If Previously Indexed):** If the old URL was already live in production, add a `301` redirect from the old path to the new path inside `src/hooks.server.ts` so 100% of Google PageRank transfers to the new URL and zero `404` errors occur.

### 3.4 Protocol for Landing Pages (Preventing Keyword Cannibalization)

Every landing page falls into one of two strict buckets under Google’s October 29, 2026 Spam & Cannibalization rules:

- **BUCKET 1: Unique Evergreen / Organic Offer Landing Pages**
  - _Definition:_ A page for a brand-new standalone product, tool, or lead magnet that does NOT duplicate an existing menu page's primary keyword.
  - _Action:_ Place in a standard route folder (e.g., `src/routes/free-trading-ebook/+page.svelte`). Use `<meta name="robots" content="index, follow" />`. It will automatically be included in `sitemap.xml`.
- **BUCKET 2: Paid Ad, Promo, Webinar, or A/B Test Squeeze Pages**
  - _Definition:_ A promotional landing page pitching an existing service (e.g., an ad funnel page for the Day Trading Room, Explosive Swings, or a seasonal promo).
  - _Action:_ **NEVER index these pages** or they will cannibalize the #1 organic ranking of the main service page.
    1. Place all campaign/ad squeeze pages inside **`src/routes/lp/[campaign-slug]/+page.svelte`**.
    2. Inject `<meta name="robots" content="noindex, nofollow" />` inside `<svelte:head>`.
    3. Point `<link rel="canonical" href="https://revolutiontradingpros.com/[main-service-path]" />` to the main canonical service page if it duplicates a core offer.
    4. Our `sitemap.xml` filter (`!route.startsWith('/lp')`) automatically keeps all `/lp/` pages out of the XML sitemap.

---

## 4. PURE NATIVE CSS, TYPOGRAPHY (`MONTSERRAT` + `SOFIA SANS`) & BREAKPOINTS

### 4.1 Styling Law: 100% Pure Native Scoped CSS

- **BANNED:** Do NOT use Tailwind CSS utility classes, Bootstrap, or external UI component libraries.
- **REQUIRED:** Write clean, semantic HTML5 and scoped native CSS inside each Svelte 5 component's `<style>` block, using global design tokens from `src/app.css`.
- **Visual Mode (Wireframe / Editorial Phase):** Use crisp, high-contrast black-and-white editorial styling (`#000000`, `#111111`, `#444444`, `#cccccc`, `#f7f7f7`, `#ffffff`), strong `1.5px–2px` structural borders, and zero distracting animations unless explicitly requested later.

### 4.2 Typography Specification (`Montserrat` + `Sofia Sans`)

<!--Load both fonts in `src/app.html`:
```html
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)" />
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin="anonymous" />
<link
  href="[https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Sofia+Sans:ital,wdth,wght@0,75..125,400..800;1,75..125,400..700&display=swap](https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Sofia+Sans:ital,wdth,wght@0,75..125,400..800;1,75..125,400..700&display=swap)"
  rel="stylesheet"
/>
```-->

Apply these exact typographic assignments, weights (`wght`), widths (`wdth`), and line-width character measures (`max-width` in `ch`):

| Element                                       | Font Family  | Weight (`wght`)    | Width (`wdth` / `font-stretch`) | Size (`clamp` / `rem`)             | Letter Spacing               | Max Line Width (`ch`) |
| :-------------------------------------------- | :----------- | :----------------- | :------------------------------ | :--------------------------------- | :--------------------------- | :-------------------- |
| **Primary Hero `<h1>` Display**               | `Montserrat` | `900`              | `100%`                          | `clamp(2rem, 4.2vw, 3.35rem)`      | `-0.03em`                    | `22ch`                |
| **Section Headings `<h2>`**                   | `Montserrat` | `800`              | `100%`                          | `clamp(1.65rem, 3vw, 2.5rem)`      | `-0.025em`                   | `26ch`                |
| **Card / Tier Headings `<h3>`**               | `Montserrat` | `800`              | `100%`                          | `clamp(1.15rem, 1.8vw, 1.5rem)`    | `-0.015em`                   | `32ch`                |
| **Section Eyebrows & `<h1>` SEO Kicker**      | `Montserrat` | `800`              | `100%`                          | `0.75rem – 0.8125rem`              | `0.10em` (Uppercase)         | `65ch`                |
| **Navbar Links & Buttons / CTAs**             | `Montserrat` | `700` / `800`      | `100%`                          | `0.8125rem – 0.875rem`             | `0.04em` (Uppercase on CTAs) | `fit-content`         |
| **Verified Proof Metrics (`+600%`, `$500+`)** | `Montserrat` | `900`              | `100%`                          | `clamp(1.25rem, 2vw, 1.75rem)`     | `-0.02em` (`tabular-nums`)   | `fit-content`         |
| **Hero Lead Paragraph**                       | `Sofia Sans` | `500`              | `100%` (`"wdth" 100`)           | `clamp(1.0625rem, 1.25vw, 1.2rem)` | `0em`                        | `66ch`                |
| **Standard Body Copy (`<p>`)**                | `Sofia Sans` | `400` (`700` bold) | `100%` (`"wdth" 100`)           | `1rem` (16px)                      | `0.005em`                    | `66ch`                |
| **Bullet Lists (`<li>`)**                     | `Sofia Sans` | `400` (`700` lead) | `100%` (`"wdth" 100`)           | `0.9375rem` (15px)                 | `0.005em`                    | `58ch`                |
| **Badges, Timestamps & Dossier Meta**         | `Sofia Sans` | `700`              | `87.5%` (`"wdth" 87.5`)         | `0.75rem` (12px)                   | `0.06em` (Uppercase)         | `fit-content`         |
| **Form Inputs & Dropdowns**                   | `Sofia Sans` | `500`              | `100%` (`"wdth" 100`)           | `0.9375rem` (15px)                 | `0em`                        | `100%`                |
| **Footer YMYL Legal Disclosures**             | `Sofia Sans` | `400`              | `92.5%` (`"wdth" 92.5`)         | `0.75rem` (12px)                   | `0.01em`                     | `115ch`               |

### 4.3 Mandatory Enterprise Responsive Breakpoints

Every component must be built **mobile-first** (`320px` base, minimum `48px` tap targets) and scale cleanly across these 6 enterprise media queries:

1. `@media (min-width: 480px)` — Large Mobile
2. `@media (min-width: 640px)` — Small Tablet / Phablet (2-column micro-grids & button rows)
3. `@media (min-width: 768px)` — Tablet Portrait (2-column cards, visible header quick-actions)
4. `@media (min-width: 1024px)` — Enterprise Desktop (12-column asymmetric grids, full horizontal navbar)
5. `@media (min-width: 1280px)` — Wide Desktop (`1440px` max container, expanded grid gaps)
6. `@media (min-width: 1536px)` — Ultra-Wide / Multi-Monitor Trading Desk (`1536px` max container)

---

## 5. OCTOBER 29, 2026 GOOGLE SEO, GEO & YMYL COMPLIANCE CHECKLIST

Before marking any page or component complete, Argon must verify:

- [ ] **Single Dual-Layer `<h1>` Per Page:** The `<h1>` contains a semantic SEO kicker `<span class="seo-kicker">` targeting the primary commercial keyword cluster, followed by the main high-conviction display headline.
- [ ] **Strict Heading Hierarchy:** `<h1>` → `<h2>` → `<h3>`. Never skip heading levels for visual sizing.
- [ ] **US & Canada Hreflang Tags:** Every indexable page includes `en-us`, `en-ca`, and `x-default` alternate links plus a self-referencing `<link rel="canonical">`.
- [ ] **Crawlable `<a href="/...">` Links:** Never use `#hash` links when linking to core rooms, alert services, store items, mentorship, or blog posts—always link to the real route path so PageRank flows through the site architecture.
- [ ] **Homepage Blog & Lead Magnet Requirements:**
  - The Homepage **Free Trading eBook** section captures `firstName`, `email`, and `traderProfile` via a SvelteKit progressive-enhancement `<form method="POST" action="?/claimFreeEbook">`.
  - The Homepage **Latest Blogs** section displays the latest **3 blog posts** in a 3-column responsive grid and features a **"See All Blogs →"** button positioned at the **top right** of the section header linking to `/blogs`.
- [ ] **Mandatory YMYL Financial Disclaimer:** The global `Footer.svelte` component always renders the US (SEC/CFTC/FINRA) and Canadian (OSC/BCSC/ASC) educational and risk disclosure statement.
