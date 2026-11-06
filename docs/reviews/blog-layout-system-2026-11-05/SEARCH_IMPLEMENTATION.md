# Search implementation evidence: November 5, 2026

Current blog operations remain governed by the [mandatory handoff](../../BLOG_AGENT_HANDOFF.md). This records local implementation and verification, not a Production migration or release.

## Implemented behavior

- `getPublicBlogListing` and `listPublicPosts` share one public eligibility, category/tag intersection and keyword predicate. The keyword is a normalized, case-insensitive literal substring; `%`, `_` and backslash are escaped. Count and page queries run in the same read-only repeatable-read transaction. Filtered listings have no separate featured lead.
- Search includes title, summary, prepared authored body, displayed subtitle/series/cover caption and authored FAQ questions/answers. HTML attributes, image URLs/alt attributes, embedded scripts/styles, SEO-only metadata and common page/footer/CTA boilerplate do not become article search text.
- Search and public rendering share `preparePublicPostContent`. Parser callbacks preserve inline words, separate block boundaries, decode entities exactly once and normalize Unicode whitespace. Literal encoded markup remains literal text. NUL decoded from historical JSON becomes the HTML replacement character, rather than causing a PostgreSQL text write failure.
- Custom-field arrays and flat string maps are parsed semantically. Any explicit string `true` exclusion wins; malformed legacy metadata is excluded from keyword search. Search exclusion does not change ordinary publication visibility, taxonomy discovery or sitemap eligibility.
- Migration `0004_post_search_projection.sql` adds paired nullable `search_text`/`search_excluded`, a pair constraint, a pending-row index and source invalidation trigger. NULL explicitly means pending. The design uses no `pg_input_is_valid`, recent full-text parser feature or extension.
- New source writes persist both derived values in their source transaction. Covered paths: shared create/update/quick-update (including clone requests), revision restore, Trash restore, internal-link rewrites, legacy importer post writes, image-variant reference rewrites and local preview initialization. Autosaves remain unpublished revision snapshots and do not alter public search.
- Older/direct writers invalidate projections through the trigger. Public reads derive only pending eligible candidates in bounded batches without writing them; matching uses the same database `ILIKE` as persisted text. Exclusions apply before exact totals and pagination. Pending ID predicates bind a single PostgreSQL integer-array value instead of creating one query parameter per result.
- Cover cards resolve srcset from exact active media originals or recorded variants in one lookup per listing. Unknown/deleted URLs get no invented siblings; stored cover dimensions remain authoritative and crop variants do not enter the width ladder.

## Verified locally

| Verification                                                                                                                            | Result                                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Focused projection, persistence, discovery, existing post lifecycle, modification-date, backfill CLI and image-reference backfill tests | 74 passed across 7 specs               |
| `pnpm check`                                                                                                                            | 0 errors, 0 warnings                   |
| `pnpm exec vp lint` on backend/search/script files                                                                                      | Passed                                 |
| Changed-file `pnpm exec vp fmt`                                                                                                         | Passed                                 |
| Apply all five migrations to an in-memory PGlite database, then replay migration 0004                                                   | Passed; both columns present           |
| Native Node 26 CLI dry run and apply against explicitly in-memory empty databases                                                       | Passed; zero pending, no hosted access |

Focused command:

```sh
pnpm exec vp test run src/lib/server/posts/search-projection.spec.ts src/lib/server/posts/search-projection.db.spec.ts src/lib/server/services/blog-discovery.db.spec.ts src/lib/server/services/posts.db.spec.ts src/lib/server/db/modified-date.db.spec.ts scripts/backfill-post-search.spec.ts scripts/backfill-blog-image-variants.spec.ts --project server
```

The regressions cover pending/persisted parity, inline words/entities, attribute-only false positives, all accepted exclusion serializations, malformed metadata, exact pre-pagination totals, combined taxonomy filters without duplicates, privacy/publication exclusions, legacy invalidation without read-time writes, literal SQL wildcard characters, stale backfill CAS rejection without timestamp changes, lifecycle persistence and real media-record srcset resolution.

## Release procedure and limits

Apply the additive migration before deploying the new query code. Existing deployments can continue writing while the invalidation trigger is installed. The new application preserves correctness while projections are pending.

Using an already authorized target connection in the operator environment, inspect a dry run before applying:

```sh
pnpm exec node --env-file-if-exists=.env scripts/backfill-post-search.ts --dry-run --batch-size=100
pnpm exec node --env-file-if-exists=.env scripts/backfill-post-search.ts --apply --batch-size=100
```

The command never exports credentials. It processes a finite starting ID range with bounded batches. Updates compare every source input, populate only still-pending rows and preserve article content/editorial dates. Concurrent edits are skipped, remain correct through the read-only fallback and are picked up by another pass. Confirm `pending: 0`, exercise the staged keyword/taxonomy URLs, then promote the verified application without enabling maintenance. Retain the trigger and fallback for old deployment writers.

No Production engine version was established in this audit. Bulk Production environment export was rejected by automatic approval review and was not retried or bypassed. No hosted database read/write, migration, backfill, deployment or email operation was performed by the search implementation agent. Integrated application, browser and release gates belong to the lead's final verification.

## Independent review of the lead's changes

Read-only Chromium checks used the early integrated preview at `http://localhost:4593`. All non-GET/HEAD browser requests were intercepted; no confirmation, unsubscribe, signup or lead mutation was submitted. Findings were delivered to the lead for correction; a later build must verify the resulting fixes.

1. **Standalone CSP conflict:** `/api/unsubscribe?token=invalid` and both waitlist token documents loaded the two intended brand fonts and had matching inline-style SHA-256 hashes, but each reported two `font-src` CSP violations with `blockedURI: data`. The generated root CSS contains Vite-inlined Sofia Cyrillic-ext normal/italic WOFF2 faces while `brandDocumentCsp` allowed only `'self'`. Allow the trusted inline font source or change the font build asset policy, then verify zero violations.
2. **New stylesheet request copies the unsubscribe token:** the `/brand-ui.css` request carried a full same-origin Referer containing the unsubscribe query token. A stylesheet-link `referrerpolicy="no-referrer"` avoids placing the token in asset access logs while preserving the document's existing same-origin form policy.
3. **Hidden Sunday CTA remains keyboard-focusable:** initial `.sticky-bar` had `aria-hidden="true"`, top 1022px at a 1000px viewport, no inert state and a link with `tabIndex: 0`. Add inert while hidden and verify keyboard focus cannot enter the offscreen CTA.

Verified positive controls:

- SVG response: 200, `image/svg+xml`, `no-cache`; embedded font decodes to `wOF2`, 40,372 bytes; actual `document.fonts` reports Sofia Sans Variable loaded; zero external font requests and zero CSP violations.
- Generated `brand-ui.css`: 29,336 bytes; all 18 immutable asset URL references exist; no external URL references; preview and Vercel static copies are identical.
- Maintenance build-output suite: 4/4 passed. The exact `/brand-ui.css` exception retains no-cache, `/brand-ui.css/extra` stays blocked during maintenance, and immutable font assets remain accessible. These tests operate in disposable output directories and do not enable maintenance on the application or hosted site.
- `/watchlist?utm_source=audit` returns 308; browser navigation retains `#pricing`. Destination H1, breadcrumb and canonical agree on Sunday Alpha Alerts; graph and visible links contain no old watchlist/explosive-swings URL.
- Official Svelte MCP autofixer returned no issues or suggestions for the Sunday component analyzed during this review.
