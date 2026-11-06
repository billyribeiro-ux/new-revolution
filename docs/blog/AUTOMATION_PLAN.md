# Blog intake automation plan

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](../BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

Reference date: **November 5, 2026**. **Proposed implementation; not executable tooling.** The audit and publishing guide are implemented documentation. The intake commands, endpoints and review records described below do not exist yet.

## Implemented follow-up: public discovery

The owner's later requirement for automatic homepage/blog placement is implemented separately from this proposed intake pipeline. Both route loaders now use `getPublicBlogListing`, with one featured/newest lead and paginated remaining eligible posts. Homepage SSR and no-store homepage/blog-index reads keep fresh requests synchronized with the CMS. Static placeholder cards were removed. This does **not** implement package ingestion, durable receipts, editorial approval records or hosted cache purging on other surfaces. See [the current handoff](../BLOG_AGENT_HANDOFF.md) and root publishing guide for the actual workflow.

## Decision

Automate one publication package into one reviewed CMS draft, then verify its actual rendered output. Keep the database as the content source and reuse the existing post services. New articles require neither a new Svelte route nor a manual title entry in JSON-LD.

The application audited at `e896ebc` is unchanged in `src/`, `scripts/`, `package.json`, `pnpm-lock.yaml` and `vite.config.ts` through main commit `3289454` (verified with `git diff --stat e896ebc..3289454 --` for those paths). Main's newer Markdown drafts are editorial inputs, not deployed CMS records. The earlier draft audit is tied to its preserved snapshot; do not assume it approves later revisions.

Existing behavior is documented in [the publishing guide](../../blog%20implementation.md) and [the source/browser audit](../reviews/blog-audit-2026-11-05/AUDIT.md). This plan adds an intake workflow, not a second content renderer or metadata system.

## What already happens automatically

| Behavior                                                                                              | Existing implementation                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema validation, content transforms, sanitization, blank-field autofill, metrics and save lifecycle | [Post services](../../src/lib/server/services/posts.ts), [input schemas](../../src/lib/shared/schemas/posts.ts)                                                |
| Transactional saves, revisions, stale-write checking, slug redirects and link rewriting               | [Save transaction](../../src/lib/server/db/save-post.ts)                                                                                                       |
| Article metadata, social fields and JSON-LD from saved post data                                      | [Blog SEO builders](../../src/lib/seo/blog-seo.ts), [article loader](../../src/routes/blog/[slug]/+page.server.ts)                                             |
| Heading normalization and table of contents                                                           | [TOC helpers](../../src/lib/shared/seo/toc.ts)                                                                                                                 |
| Media encoding, variants and crops                                                                    | [Media services](../../src/lib/server/services/media.ts), [storage](../../src/lib/server/media-storage.ts)                                                     |
| Conditional public lists, feeds and sitemap entries                                                   | [Public post services](../../src/lib/server/services/posts.ts), [RSS](../../src/routes/rss.xml/+server.ts), [sitemap](../../src/routes/sitemap.xml/+server.ts) |

These mechanisms have limits. A valid SEO score can still accept placeholder images; existing live edits do not all re-run the publish gate. The owner-authorized blog indexing release is live; automatic sitemap discovery still obeys per-post and archive eligibility. Framework query refreshes do not purge a hosted CDN.

## Official framework basis

The official MCP exposes 164 Svelte and SvelteKit sections, including migrations, deprecated references, APIs and diagnostics. See [the dated documentation review](../reviews/blog-audit-2026-11-05/SVELTE_AUTOMATION_REVIEW.md) for coverage and version limitations.

- **Server mutations:** use existing authenticated REST handlers for the first CLI adapter. An optional admin upload interface can use remote `form` for progressive enhancement or the established `command` pattern for programmatic interactions. Validate inputs at runtime and authenticate every mutation. [Remote functions](https://svelte.dev/docs/kit/remote-functions), [form actions](https://svelte.dev/docs/kit/form-actions)
- **Server boundaries:** keep database, credentials, media inspection and save orchestration in server-only modules. A `.remote.ts` entry belongs outside a server-only directory and delegates to those modules. A standalone CLI should call authenticated HTTP APIs; it must not assume SvelteKit virtual modules or generated remote endpoints are a stable CLI runtime. [Server-only modules](https://svelte.dev/docs/kit/server-only-modules), [remote functions](https://svelte.dev/docs/kit/remote-functions)
- **Rendering:** preserve the current SSR blog templates. Prerendered pages and data are snapshots made at build time; using them would require a separate rebuild/freshness design. SSR already provides article HTML without creating a route per post. [Page options](https://svelte.dev/docs/kit/page-options), [SEO](https://svelte.dev/docs/kit/seo)
- **Content:** imported HTML is data, not Svelte source. `{@html}` does not compile components or apply scoped component CSS to its descendants. Sanitize and normalize on the server; verify the resulting HTML in a browser. Never execute article Markdown as MDsveX/Svelte. [Raw HTML](https://svelte.dev/docs/svelte/@html)
- **State:** use request-scoped server context and per-component UI state. Keep authoritative validation and publication out of `$effect`/`onMount`; use derived UI values where appropriate. [State management](https://svelte.dev/docs/kit/state-management), [effects](https://svelte.dev/docs/svelte/$effect)
- **Media:** `enhanced-img` handles build-time assets; it does not replace the existing runtime CMS upload pipeline. [Images](https://svelte.dev/docs/kit/images)
- **Freshness:** query refresh updates application data for callers; hosted cache purging and durable background jobs are separate concerns. [Remote functions](https://svelte.dev/docs/kit/remote-functions), [Vercel adapter](https://svelte.dev/docs/kit/adapter-vercel)

No framework upgrade is required for this plan. The installed baseline is Svelte 5.57.3 / SvelteKit 3.1.1. On this review, the [official Kit changelog](https://raw.githubusercontent.com/sveltejs/kit/main/packages/kit/CHANGELOG.md) begins at 3.1.1 and the requested [3.2.0 release URL](https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%403.2.0) returns 404. Treat the MCP material as the currently served documentation, not a version-pinned 3.2 manual; compile and test against the installed lockfile.

## Package contract to implement

Use one versioned package directory with an explicit manifest, rather than inferring a post from an arbitrary research brief:

| File                          | Proposed responsibility                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `post.json`                   | `schemaVersion`, stable `packageId`, slug, title, excerpt, metadata, author/category/tag slugs, related-post slugs, FAQ items and media references |
| `body.html`                   | Only the public body; no H1, cover duplication, scripts, metadata or private research                                                              |
| `media/` and manifest entries | Actual source files, intended placement, alt text, caption, provenance and content hashes                                                          |
| `sources.json`                | Claim text, primary source URL, source date/as-of period, retrieval date and supporting passage/calculation                                        |

Resolve slugs to IDs in the selected CMS. A successful lookup in one environment must not authorize IDs in another. Fail on missing or ambiguous author/taxonomy; do not silently invent credentials or create categories. Publication status, lifecycle timestamps, arbitrary custom schema and launch flags are not author-controlled package fields.

Start with HTML because it is the existing CMS format. A later explicit `body.md` option may use a deterministic Markdown-to-HTML parser followed by the same sanitizer. It must not guess which of several article drafts or fenced blocks is the body. Do not import the entire `blogs/0DTE-spx-options-strategy.md` research document as public content. A converter must identify the selected article body and present the extracted metadata/body for review.

The machine-readable contract should accept FAQ arrays and keyword arrays, then serialize the current CMS's JSON-string fields in one adapter. Authors should not have to hand-escape embedded JSON.

## Shared validation and preview

Extract a side-effect-free preparation function from the current transform/sanitize/autofill/metric path. Both a read-only intake report and real saves must call the same preparation logic. Do not duplicate the scoring implementation in the CLI. Preparation must return the normalized candidate, field-level changes, warnings and blockers; it must not save posts, revisions, media or taxonomy.

The report should check:

1. Manifest version, bounded file sizes/counts, package paths, slug validity and explicit target environment. Reject traversal and unsupported fields/formats.
2. Author/category/tag/related-post existence, slug collisions and the current post version for an explicit update.
3. The actual normalized HTML, heading order, duplicate H1, TOC anchors, supported elements, table structure and sanitizer losses. Show meaningful normalization changes before a write.
4. Existing SEO scoring plus the current stricter house intersection: 30–33 raw title characters, 140–155 description characters. Report those as project conventions, not Google limits.
5. Link syntax and internal destination existence against the target route/content inventory. Check external HTTP availability with bounded, approved networking; mark it separately from factual support. Redirects, blocked fetches and missing fragments need visible outcomes rather than a pass.
6. Actual image bytes, decode success, dimensions, trusted storage identity and all required variants. Reject zero-byte rows and placeholder endpoint responses. Do not treat HTTP 200 or a `.webp` suffix as proof of a real graphic.
7. Unresolved authoring markers, publication-date discrepancies and recursively restricted custom schema types. Prefer generated schema and omit arbitrary package JSON-LD entirely.
8. Claim ledger completeness and stale/as-of periods. A complete ledger is a review aid; the checker must not claim it proves the financial statements.

Do media inspection through configured storage and uploaded bytes. Never let an arbitrary URL in an article cause an unrestricted server fetch. Keep draft body text, credentials and signed preview tokens out of public CI logs and artifacts.

## Thin adapters and write behavior

Implement a small CLI with planned operations **check**, **import-draft** and **verify**. These names describe proposed behavior; there are no new package scripts to run yet.

- **check:** local structural checks require no credentials or database initialization. Target-aware validation uses an authenticated, read-only CMS endpoint. Produce a JSON report and readable summary, with a nonzero exit for blockers. No writes, uploads, taxonomy creation or fixture seeding are allowed in this mode.
- **import-draft:** require explicit file/package selection and target origin. Authenticate using the selected environment's authorized admin session; never commit or print session cookies. Upload only real media through the existing media service, record returned URLs, then create one draft through the existing post service. Media upload and post-save are separate operations; record partial failures and owned orphan uploads without assuming an atomic storage/database transaction.
- **Update:** require an explicit target post and `expectedUpdatedAt`. Prefer `PATCH` for partial changes; full replacement must supply the complete intended arrays. Reject published/scheduled targets in the initial draft importer. Never use `forceOverwrite`, downgrade a live post to draft, or replace unrelated posts by matching a filename.
- **Retry:** bind package identity and normalized input/media hash to the target environment and saved post/version. Reserve that identity with a database uniqueness constraint so concurrent retries cannot create duplicates. Identical retries return the existing receipt; changed input produces a reviewed diff. A forward-only migration is needed for durable receipts; a local JSON file alone is insufficient for concurrent imports.
- **verify:** fetch the saved draft's signed preview with authorized credentials and compare the actual normalized body/metadata/media with the report. Redact tokens. Re-read the saved post version; autosave overlays must not certify a different version from the one being approved.

The API/remote/admin adapters must delegate to the same orchestration. Do not broaden or invoke the legacy direct-upsert importer as the new intake writer. Its dry-run remains useful for inspecting archive packages; its normal write path bypasses the desired lifecycle.

## Publication and launch

The first delivery should stop at a verified draft. The normal admin Publish/Schedule controls can remain the release action. A later publication adapter must:

1. Re-read the exact saved content and media hashes, current post version and review evidence; reject approval that belongs to an older revision or different environment.
2. Run the final gate on every resulting published or scheduled save, including edits that were already live. Apply the same rule to REST, remote, quick-edit and restore paths so the CLI cannot become a bypass.
3. Require offset-bearing schedule timestamps and show the intended New York time and actual instant. Resolve the scheduled-read/publication-date race before claiming reliable unattended schedules.
4. Preserve the current launch policy: the blog is open for eligible published posts, and the store remains gated. Publishing a record does not authorize another section launch, production deployment or a bulk import.
5. Report the committed save separately from hosted verification. Add a durable purge/retry mechanism and prove update/unpublish freshness on the actual host before promising immediate delivery. SvelteKit query refresh alone cannot supply that guarantee.

Human editorial review remains necessary for financial claims, credentials, strategy promises, image truth and source interpretation. It should be attached to the exact candidate content hash; the automation must not mark its own generated claims as approved merely because a score is green.

## Implementation order and acceptance evidence

| Stage                       | Changes                                                                                                             | Evidence required                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Shared preparation       | Extract the existing normalization path, define package/report schemas and add one explicit reviewed sample package | Existing service tests retain behavior; malformed packages fail; read-only checks perform zero writes, including uploads and seeds                                                |
| 2. Draft intake             | Authenticated check/import endpoints, thin HTTP CLI, durable receipt uniqueness, media mapping                      | One package creates exactly one draft; repeat/concurrent retries do not duplicate it; conflicts and partial upload failures are observable; unrelated CMS records are unchanged   |
| 3. Preview verification     | Content-specific Playwright runner and private report artifacts                                                     | Draft URL is unavailable publicly, preview is noindex/no-store, real images decode, headings/links/TOC work, mobile tables fit, schema and visible content agree                  |
| 4. Publication hardening    | Gate parity, explicit timezone validation, scheduled timestamp integrity and real hosted cache purge/retry          | Failing content cannot publish through any write path; stale approval is rejected; due schedules have valid dates; measured update/unpublish behavior meets the documented target |
| 5. Optional admin intake UI | Reuse the same schema/report/service, native labeled controls, pending/errors and explicit draft submission         | Keyboard/no-JS behavior where supported, auth/rate-limit enforcement, failure recovery and no second validation implementation                                                    |
| 6. Future-agent handoff     | Replace this proposed contract with implemented commands, schema and real examples in the root publishing guide     | Copy/paste the documented workflow in a clean isolated environment and obtain the expected saved draft/report without unpublished assumptions                                     |

Cover the important failure cases: empty/unsupported body, script/event-handler injection, nested prohibited schema, unknown taxonomy, placeholder cover returning 200, missing variants, broken CTA, duplicate package, concurrent import, stale update, changed approval hash, private draft leakage, offsetless scheduling, failed purge and published edit bypass. Unit-test pure rules and transaction behavior; use browser tests where rendered content or permissions are the actual contract.

Use the existing repository scripts for an application implementation, with an isolated seeded admin for authenticated checks:

```bash
pnpm check:css
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
pnpm check:pages
pnpm test:seo
pnpm test:e2e
```

Run the official Svelte MCP autofixer on every Svelte component/module analyzed or changed and re-run after fixes. It checks Svelte source, not imported article HTML, claim accuracy or a hosted database. Follow [the Vite+ command contract](../VITE_PLUS_WORKFLOW.md); this plan does not authorize dependency/toolchain upgrades. Hosted scheduling, storage and cache tests supplement local `pnpm preview` evidence.

## Scope of this follow-up

This change documents the proposed automation and its evidence. No intake CLI, endpoint, schema migration, publish fix, media upload, CMS write, section launch or deployment was performed. The original audit's runtime tests are historical evidence for that audited application, not tests of the proposed automation.
