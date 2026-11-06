# Integrated implementation verification: November 5, 2026

Baseline main `54caa06`; implementation in the isolated `fix/blog-system-20261105` worktree. The approved plan and independent findings are linked in [PLAN.md](PLAN.md), [MEDIA.md](MEDIA.md), [SEARCH_IMPLEMENTATION.md](SEARCH_IMPLEMENTATION.md), [plugin-parity.md](plugin-parity.md) and [copy-evidence.md](copy-evidence.md). The final release is recorded separately; local success does not prove deployment.

## Completed gates

- 674 unit/component tests across 88 files; no skips.
- 71 authenticated Chromium E2E cases, including real local CMS upload/save/autosave/publish/restore, automatic homepage/archive placement, 28 cold card-source cases and wide/short/enlarged-text geometry.
- 26 focused Firefox and 26 WebKit cases: fonts/CSP/referrers, TOC/FAQ/anchors, navigation/noJS/enlarged text, shared index gutters and old-route redirects.
- Three standalone full-inventory SEO cases; 46 static page contracts; four normal/maintenance build-output cases.
- Svelte diagnostics 0 errors / 0 warnings; CSS/font guards, Vite+ code lint and Svelte ESLint pass.
- Official Svelte MCP: 39 components and two attachment modules, all with no issues/suggestions. Module-mode dispatch is required for plain TypeScript attachments; component parser diagnostics were resolved by using the correct analysis mode. See [SVELTE_MCP.json](SVELTE_MCP.json).

The complete `pnpm build` runs through the E2E/SEO server command and includes the maintenance/standalone CSS output stage. The dedicated `node --test tests/maintenance/build-output.test.mjs` command proves both maintenance modes without changing Production's maintenance setting.

The final read-only release probe passed **57/57** local scenarios across three engines. It verifies actual source decoding, shared geometry at 375/1440/2440/2800px, native collapse/history, passive tracking, no-JavaScript fragments, fallback-font readability and same-window observer cleanup (1 → 0 → 1). Last-FAQ coordinates stayed within the existing 1px tolerance in all three engines. See [raw final browser evidence](local/final/browser-verification.json) and the representative archive/article captures beside it. The local fixture has no authored numeric prefixes; the actual published article must supply that release check.

## Inherited repository formatting limitation

`pnpm lint` runs and stops at three unchanged reference artifacts: `blogs/first-blog.md`, `blogs/head-to-head-blog.md` and `docs/reviews/font-fragment-audit-2026-11-05/release/verify-browser.mjs`. Their tracked diff is empty; original inputs and dated evidence are preserved. Owned-file formatting, Vite+ code lint and Svelte ESLint pass separately. No ignore rule, threshold, warning suppression or screenshot baseline was changed to manufacture a pass.

## Corrections discovered during integration

- Navbar text at 200% could place actions outside the viewport. Content-aware switching/wrapping, measured menu space, focus restoration and a shared-data native noJS fallback now pass real browser bounds checks.
- Grid tracks could keep input min-content widths at 200% text; explicit `minmax(0,1fr)` and shrinkable controls fix the actual boxes. A long heading could still paint to 415px inside a 296px box: the shared heading wrap primitive fixes the measured paint overflow without shrinking text or clipping it.
- Index section/CTA padding doubled the new shared gutter. Retain block rhythm and let the child container own inline padding; four viewport cases prove it.
- The initial Sunday shutter briefly obscured the entire viewport. Remove it and the opacity entrance; use a content-driven hero and honest hypothetical-demo labels.
- Two small compiled font subsets were data URLs and violated standalone `font-src 'self'`. The shared build helper externalizes those trusted bytes to hashed same-origin WOFF2 assets. Keep the restrictive CSP and add stylesheet-only no-referrer so URL tokens stay out of asset referrers.
- Hidden sticky CTA is inert. Native TOC/FAQ geometry is measured; long-TOC fixture injection waits for hydration ownership before extending DOM.
- HTML source-size font units follow initial font settings. Retain conservative rem role caps for SSR, then measure actual slots with a cleanup-safe image attachment to support CSS text scaling.

## Test semantics and real protections

Outer border boxes now include padding. Geometry assertions compare inner content edges and preserve the original < 1px tolerance. Raw relative `resolve()` hrefs are valid Kit 3 SSR output; legal links and redirects are compared as resolved same-origin paths, retaining query/fragment checks and the exact expected link set. Search tests use the actual accessible label and exact clear-search action. No SEO/CWV threshold was lowered.

Repeated authenticated runs hit the real login limit. The account was revoked and replaced with a unique disposable account for the successful final run; rate limiting stayed enabled. All three local test administrators are revoked. Production accounts, emails and article originals were untouched.

## Database and evidence boundaries

Production PostgreSQL 18.6 was checked through only its identified `DATABASE_URL`. The additive migration/backfill leaves every preexisting post field/date hash unchanged, with zero pending rows in Production and Preview. No bulk environment export was used; scoped connection files were deleted. See [release/migration.json](release/migration.json) and [release/preview-migration.json](release/preview-migration.json). An earlier automatic review rejected a broad environment collection request; encrypted metadata and single-variable retrieval provided a narrower approved path.

The original provided plugin folder and untracked owner notes remain outside this branch. The source plugin version is 2.0.89; no WordPress settings export exists, so configuration identity is unverified. Published numbering/IDs and current intentional differences are documented.

The local lab collector uses Chromium 375 × 812, DPR 3, on the local production preview without network/CPU throttling. Its DOM accessibility checks are heuristic. Raw metrics are under `local/lab` and `local/changed-lab`; field CWV and Google indexing/rank are not established by this run. Current 1600px images cannot supply genuine 2x detail in every enlarged/wide slot; original resolution is preserved.

## Final visual-review follow-up

The live single-post screenshot exposed a misleading empty “More articles” section whose count included the lead. The narrow presentation fix derives the remainder count without changing service totals and omits that section when the lead is the only post. Four new focused component cases cover this state, singular/plural remainders and the empty archive. The repeated complete suite passes **678 tests across 88 files**; authenticated Chromium E2E repeats **71/71**, including the complete build and SEO cases. Diagnostics remain zero-error/zero-warning, CSS/font guards and code/Svelte lint pass, and all 46 static page contracts pass. The changed component was reanalyzed by official MCP with no issues or suggestions; see [raw follow-up proof](release/archive-remainder-mcp.json). The fourth disposable local administrator was revoked and its credential file deleted. Final follow-up deployment acceptance is recorded in the release report, rather than inferred from local tests.
