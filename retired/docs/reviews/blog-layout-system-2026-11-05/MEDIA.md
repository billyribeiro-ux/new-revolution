# Blog archive and media implementation evidence

Date: November 5, 2026. This record covers archive/card changes in the shared implementation worktree. It does not claim a deployed release or field Core Web Vitals results.

## Recovered owner specification

`blogs/first-blog.md`, section 2A, specifies source/derivative roles independently of CSS container width:

| Role                             | Approved image dimensions | WebP budget                                               |
| -------------------------------- | ------------------------- | --------------------------------------------------------- |
| Article hero / top featured card | 1600 × 900, or 1200 × 675 | under 90 KB                                               |
| Regular archive card             | 800 × 450                 | under 35 KB                                               |
| Inline diagram                   | 1200 × 675                | under 75 KB, with stricter per-image limits in section 2B |
| Social / OpenGraph               | 1200 × 630                | under 80 KB                                               |

The section-specific hero row also describes a 1200 × 675 card derivative. The corrected article package's general regular-card derivative is 800 × 450. These roles do not prescribe a 2440px-wide image.

`content/articles/0dte-spx-options-strategy-guide/assets.json` records and hashes the delivered files: hero 1600 × 900 / 62,810 bytes; regular derivative 800 × 450 / 26,474 bytes; social 1200 × 630 / 37,422 bytes. The four 1200 × 675 inline files are 43,032, 50,628, 44,138 and 48,132 bytes and satisfy their individual limits. The publication record in `docs/reviews/first-blog-2026-11-05/production.json` identifies real stored 480/800/1200 variants and the original 1600px cover.

## Confirmed baseline defects

Read-only Chromium measurements against the pre-change live site found:

- At a 320px viewport, a card's media link was 294 × 165.375px while its image element was 294 × 157.375px. Global anchor padding contributed 4px above and below the image. A wrapper-only aspect-ratio assertion missed the defect.
- Homepage featured media used a variable-height cover crop, while archive featured media used contain. The same informational artwork had different crop behavior by surface.
- At 2440px, the homepage featured slot was approximately 767px wide but declared 50vw, or 1220px. A fresh DPR1 load selected the 1600px cover. This observation applies to the homepage's cold first load; later pages in that measurement context could reuse cached larger candidates and are not evidence of independent over-fetching.
- The old outer container capped at 1536px. The new owner-approved 2440px border-box shell supersedes that layout decision.

## Implemented contract

- `PostCard.svelte` resets media-link padding and minimum dimensions at the shared component boundary. Its media frame is 16:9, with `object-fit: contain`, on home/index/category/tag/related cards and both visual tones.
- Regular cards cap at 25rem. Featured and single-result cards cap at 75rem, splitting equally at 48rem. The maximum desktop image slot is 599px after the card border; regular maximum is 398px. Stacked narrow layouts use the existing responsive site gutters.
- Server `sizes` preserves the normal-text caps, borders and gutter fallback rather than uncapped 50vw. The image attachment then measures the actual slot and updates `sizes` in pixels, including after root text or wrapping changes. Stored intrinsic image dimensions remain intact. Only the appropriate initial archive image is eager/high priority; the homepage section remains lazy below the fold.
- Cards consume only `coverImageSrcset` supplied from verified active media records. A filename alone cannot create responsive candidates. Unknown media uses its original URL.
- The 1600px master can supply DPR2 for the capped desktop card slot. A 900px article hero has a separate density limit: its 2× target exceeds 1600px. No raster is upscaled to invent detail; article sizes and reading-column geometry are owned by the article template.

## Search and archive integration

All three archive views share `BlogArchive`, `ArchiveControls` and `ArchiveResults`. Header, search, topic navigation and results align to the shared outer container. There is no reserved sidebar or independent centered 820px heading wrapper. Search uses native GET, supports `search` and legacy `q` on server loads, and preserves the normalized query when switching topics or pages. Reset links retain the current archive. Decorative tag hashes were removed from archive copy and metadata. Search responses are no-store, noindex and have no canonical; an existing archive with zero search matches remains a useful 200 response.

Category pillar markup remains sanitized by the category server loader before the explicitly named `sanitizedPillarHtml` rendering boundary. No duplicate client-side sanitizer dependency was introduced.

## Verification completed at component/loader stage

- `pnpm check`: zero errors and zero warnings after integration of the current owners' changes.
- `pnpm test:unit --run --project server src/routes/blog/blog-pagination.spec.ts src/routes/blog/blog-routes.spec.ts`: 42 tests passed in the shared worktree, including scoped full-body searches through legacy `q`, normalization, no-store/noindex/no canonical, and empty search states.
- Focused client suite for `PostCard.svelte.spec.ts`, `archive.svelte.spec.ts` and `BlogSection.svelte.spec.ts`: 17 tests passed after the intermediate-width and larger-text corrections below. Tests measure both link and image boxes with global CSS, verify both tones, card caps, real route/query/reset targets, and prevent filename-derived srcsets.
- Scoped ESLint passed for all eight changed/new Svelte archive/card/home components. Official Svelte MCP autofixer returned no issues or suggestions for those components after correction.

## Early integrated preview observation and correction

Read-only Chromium inspection used the built preview at `http://localhost:4593`, not the development server. The article link was discovered from `/blog`: `/blog/institutional-order-flow-and-gamma-flip-playbook`. Its real category and tag were `/blog/category/market-structure` and `/blog/tag/spx-options`.

All 20 combinations of home/index/category/tag and 320/768/1440/2440/2800px returned 200, without browser page errors or clipped archive content. The heading and card edge matched the navbar content edge exactly:

| Viewport | Shared content edge |
| -------- | ------------------- |
| 320px    | 12px                |
| 768px    | 28px                |
| 1440px   | 32px                |
| 2440px   | 56px                |
| 2800px   | 236px               |

The mobile image/link both measured 294 × 165.375px; desktop featured image/link both measured 599 × 336.9375px. Every measured card used contain; wide cards capped at 1200px and regular cards at 400px. Controls-to-results spacing measured 32px at mobile/tablet, about 43px at 1440px and 48px at 2440px. Screenshots of the 1440px index and 320px tag were visually inspected.

This inspection exposed a real intermediate-width issue: the first regular collection implementation chose one 400px column inside a 712px inner width, even though two 344px cards and a 24px gap fit. The archive and homepage regular collections now use wrapping flex items with a 20rem basis, `min-inline-size: min(100%, 20rem)` and 25rem maximum. Featured/single-result layouts retain their 75rem grids. Two browser regressions measure 344px + 24px + 344px on one row at 712px. This correction passed all 16 focused client tests and another official Svelte MCP audit with no findings.

The early preview predates final verified-srcset enrichment and this flex correction. Its geometry observations do not establish final source selection or final deployed behavior; those require the final build gate below.

## Built-output verification gate

`src/routes/admin/image-flow.e2e.ts` extends the existing disposable authenticated CMS upload/publish fixture. Its layout matrix checks 320, 375, 768, 1179, 1180, 1181, 1440, 2440, 2800 and 3000px, including both outer-box geometry and the actual heading/content edge. Its cold media test creates a fresh browser context for every route/viewport/DPR pair, decodes the selected response with Sharp, checks actual image/link geometry and compares the selected source to available verified candidates. It attaches `cold-card-media.json` containing dimensions, selected URLs and byte counts.

The lead's production build, authenticated preview run, full browser matrix and deployed verification are the remaining integration gates at this stage. Append their actual outcome to the final verification record; the existence of these tests is not a claim that those gates have run.

## Larger-text source selection

The independent review identified another real distinction: CSS card caps use the computed root font (`25rem` and `75rem`), while font units in HTML `sizes` use the media-query unit environment. A 32px root therefore cannot be repaired by mechanically replacing `398px` with `calc(25rem - 2px)`.

Cold browser experiments used real generated 480/800/1200/1600px PNG responses, intercepted entirely in memory. All 12 combinations of Chromium/Firefox/WebKit, DPR1/2 and regular/wide roles agreed. Raw results are in [local/font-size-source-experiment.json](local/font-size-source-experiment.json):

| Role at 32px root | Actual CSS width | Rem-only source DPR1 / DPR2 | Measured source DPR1 / DPR2 |
| ----------------- | ---------------- | --------------------------- | --------------------------- |
| Regular           | 798px            | 480 / 800px                 | 800 / 1600px                |
| Wide              | 1163px           | 800 / 1200px                | 1200 / 1600px               |

`size-card-image.ts` now uses a Svelte attachment to preserve SSR fallback metadata, measure the actual image width on mount and observe subsequent size changes. It updates only `sizes`; intrinsic dimensions, `src`, verified `srcset`, lazy/eager loading and fetch priority remain intact. Cleanup disconnects ResizeObserver, removes the resize listener and cancels any queued animation frame. Reactive fallback changes re-run the attachment, rather than overwriting a previously measured slot indefinitely.

A browser component regression uses real canvas-generated responsive PNGs, grows root text from 16px to 32px and verifies both measured width metadata and sufficient selected source pixels. The authenticated cold E2E matrix adds root 32px regular/lazy and unique-result wide/eager cases at DPR1/2. These final-build cases remain subject to the integration gate above.

At 200% text a wide card can exceed the 1600px source's true 2× density capacity. Selection uses the best recorded source; it cannot invent missing detail. The test explicitly caps the density requirement at the actual largest recorded candidate.

## Primary guidance used

- [SvelteKit images](https://svelte.dev/docs/kit/images): local enhanced images versus CMS media, intrinsic dimensions, responsive sources and appropriate loading priority.
- [Responsive images](https://web.dev/learn/design/responsive-images): source selection depends on actual slot sizes and pixel density.
- [LCP optimization](https://web.dev/articles/optimize-lcp): make the actual LCP image discoverable and avoid lazy loading it.
- [Google image guidance](https://developers.google.com/search/docs/appearance/google-images): descriptive image context/alt text and standard discoverable image markup.
- [HTML image source-size processing](https://html.spec.whatwg.org/multipage/images.html#source-size-2) and [CSS font-relative units outside elements](https://drafts.csswg.org/css-values/#font-relative-lengths): source-size units use the media-query environment, which explains the measured larger-text difference.

Lab tests and cold candidate selection are not field CWV evidence. Do not label them as field performance or promise ranking results.

Final integration: SSR source sizes now use conservative rem-based role caps with viewport bounds; the measured image attachment refines them to actual pixel slots after hydration. Source-size font units use the browser initial font, so the attachment remains necessary for CSS root-text scaling. Initial-integration captures are under `local/initial-integration` and predate the final shutter, navigation, heading-wrap and source-size fixes.
