# First article acceptance: November 5, 2026

Owner-selected input: `blogs/first-blog.md`. Original bytes are preserved and hashed in the [package metadata](../../../content/articles/0dte-spx-options-strategy-guide/post.json). The article is a separate, corrected candidate, not an endorsement of the source brief's claims or embedded agent prompt.

## Prepared content

See [the complete package](../../../content/articles/0dte-spx-options-strategy-guide/README.md), [portable reader copy](../../../content/articles/0dte-spx-options-strategy-guide/review.html), [source decisions](../../../content/articles/0dte-spx-options-strategy-guide/CLAIM_LEDGER.md) and [recomputed package checks](package-check.json). The raw SEO title is 31 characters and description 149. No invented publication date, credentials, live quote, backtest or desk routine is supplied.

Five original diagrams and two derivatives decode as WebP and satisfy their declared dimensions/byte budgets. Illustrations explicitly distinguish hypothetical examples, base-rate assumptions, conditional hedging and terminal payoffs from market data or expected returns. The editable SVGs embed the locally sourced Sofia Sans font; its OFL license is included. No third-party trading screenshot or generated performance record is used.

Every one of the 20 citations/CTA URLs returned 200 in [the dated link check](source-links.json). The primary pages were also read for claim support; a response status alone is not fact verification. The IRS file retrieved is the 2025 Form 6781 revision, stated explicitly in the article. Competitor rank claims, unsupported empirical edge claims and unverifiable broker permissions were omitted. ThinkScript is source-reviewed against Schwab references, **not compiled or replayed in thinkorswim**.

## Actual CMS save and discovered defect

The existing author/category/tag/media/post services saved one draft in an isolated local PGlite database with disk media. No hosted database, account, article or storage object was changed. Actual stored body metrics: 3,199 words / 16 minutes; normal service transforms and sanitization apply. The gate returns 97/100, publishable, with one nonblocking warning that the descriptive inline-image alt text does not repeat the exact focus phrase. This score is a mechanical result, not financial approval.

The initial temporary operator confused database media fields with the `MediaItem` response. Its first draft had missing cover/OG and failed the gate; mapping to the actual `urls.original` response corrected the saved draft. No production API or application behavior was changed to hide that error. Uploaded media URLs and sizes come from the actual pipeline, not filename guesses.

The exact rich article exposed a real mobile defect: `.table-scroll` wrappers computed to `overflow-x: visible`; 438px/527px tables expanded a 320px document to 539px. The ThinkScript block was already locally scrollable and was not the cause. A narrowly scoped `.article-prose :global(.table-scroll)` rule now contains table overflow. A permanent authenticated E2E appends wide table/code content, verifies local scrolling and document containment, then restores its own test post. [Three-engine before/after evidence](overflow-browser.json), [official Svelte MCP](overflow-mcp.json) and [template/documentation audit](svelte-mcp.json) support the repair.

## Completed verification

| Check                                      | Result                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| CSS tokens / Svelte diagnostics            | Pass; 0 errors and 0 warnings                                                                                  |
| Unit/component suite                       | 575 passed, 79 files; `--maxWorkers 4`                                                                         |
| Complete `pnpm build` / static contracts   | Pass, maintenance output included; 46 pages                                                                    |
| Standalone SEO suite                       | 3 passed                                                                                                       |
| Full authenticated Chromium E2E            | 44 passed                                                                                                      |
| Firefox / WebKit publishing and layout E2E | 15 / 15 passed                                                                                                 |
| Final browser failures, skips, flaky cases | 0 / 0 / 0                                                                                                      |
| Exact saved draft against production build | 15 cases: 3 engines × 5 widths; 7 package images decode                                                        |
| Exact local publication rehearsal          | 18 cases: 3 engines × 2 widths × homepage/archive/article; 3 graph crops decode                                |
| Local withdrawal / final saved state       | Public article 404; absent from homepage/archive/RSS; signed preview 200, no-store/noindex; final status draft |
| Official Svelte MCP                        | Final article/table fix and unchanged discovery components clean at 5.57.3, async enabled                      |

The draft checks cover one H1, real cover plus four figures, two semantic tables, native FAQ interactions, working TOC targets, one unified graph with referenced author, full breadcrumb-label parity, no canonical while gated, no document overflow and a reading column no wider than 900px. Images were awaited until loaded before decode; the earlier dev-server probe's image-decode abort was not accepted as a pass. Production-build checks ran without the temporary native-sanitizer override used only for local service ingestion.

The local publication rehearsal proves the exact record is marked `featured=true`, appears once as the lead on both listings, receives its real service publication timestamp and word count in JSON-LD, appears in RSS and remains absent from the launch-gated sitemap. No title array or manual schema script was edited. The temporary operator initially used the unsupported `isFeatured` spelling; the final package and saved record use the actual schema's `featured` field. The article was returned to draft afterward. Local publication is not hosted publication or an indexing launch; no CDN propagation guarantee is claimed.

Full `pnpm lint` still reports formatting in the two separately inherited references `blogs/first-blog.md` and `blogs/head-to-head-blog.md`. Their original bytes are intentionally preserved. Owned files pass formatting; Oxlint and Svelte ESLint pass separately. No timeout, worker configuration, SEO/CWV threshold or existing assertion was lowered. New generated evidence was formatted before the final check. See command logs, gate results and browser summaries alongside this record.

[Exact draft proof](browser-draft.json), [publication proof](local-publication-browser.json), [withdrawal proof](withdrawal.json), [saved CMS result](cms-draft.json) and viewport/full-page screenshots record actual outcomes. Full test-suite screenshots remain dated synthetic fixture evidence, separate from this article's own captures. All throwaway local admin accounts were revoked.

## Delivery boundary

This is a prepared, verified **draft** from the owner-selected brief. Hosted article/media publication and indexing launch have not occurred. Production maintenance stays off. The standalone [reader copy](../../../content/articles/0dte-spx-options-strategy-guide/review.html) is available for editorial review without a secret preview token; it is not a new website route. The application table fix and article package are in [draft PR #29](https://github.com/billyribeiro-ux/new-revolution/pull/29), pending integration; tested application/package source fingerprints are recorded alongside this report. The claim ledger identifies all substantive changes and retained limitations, including untested thinkorswim runtime and omitted unsupported statistics.
