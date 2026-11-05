# Official Svelte documentation review for blog automation

Reference date: **November 5, 2026**. This is a follow-up to the blog workflow audit, not another completed application implementation or production audit.

## Coverage and provenance

Called the official Svelte MCP `list_sections`, then `get_documentation` for **every `kit/` and `svelte/` section** in that index: **164 sections**, 1,135,316 characters in the combined retrieval. The parent and three Svelte skill reviewers read the complete assigned sections, including examples, migrations, APIs, compiler/runtime diagnostics and legacy references. Large responses were read in smaller contiguous slices; truncated attempts were re-read before reporting coverage.

| Reviewer             | Assigned sections                                                        | Count |
| -------------------- | ------------------------------------------------------------------------ | ----- |
| Parent               | Kit introduction through remote functions                                | 11    |
| Svelte Kit reviewer  | Kit environment variables through the final deprecated environment alias | 67    |
| Svelte core reviewer | Svelte overview through Svelte 5 migration                               | 55    |
| Svelte API reviewer  | Svelte FAQ, runtime/compiler APIs, diagnostics and all legacy sections   | 31    |

[The coverage ledger](svelte-doc-review.json) lists every section and official URL. Separate CLI/AI product manuals are outside this Svelte/Kit corpus. This was a collaborative review of the currently served docs, not a claim of permanent memory or an immutable November 5 archive. Full source text is not vendored; the ledger does not pretend to be a hashed documentation snapshot.

## Version evidence

- This checkout uses **Svelte 5.57.3 / Kit 3.1.1**; `package.json`, lockfile and installed dependencies were checked. `vite.config.ts` already enables compiler async and remote functions.
- The [official Kit changelog](https://raw.githubusercontent.com/sveltejs/kit/main/packages/kit/CHANGELOG.md) starts at **3.1.1** when fetched. The [requested 3.2.0 release-tag URL](https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%403.2.0) returned **404**. A Kit 3.2 release could not be verified; do not describe this review as a version-pinned 3.2 manual.
- Current unversioned reference pages contain legacy and newer material together. The installed types/compiler/tests remain the compatibility gate; reading newer documentation does not authorize an upgrade.

## Findings applied to the design

1. **Intake is application logic.** SvelteKit supplies server rendering and transports, not an automatic mapping of arbitrary repository Markdown into this CMS. Keep parsing and validation shared and saves behind the existing post service. [Server-only modules](https://svelte.dev/docs/kit/server-only-modules), [form actions](https://svelte.dev/docs/kit/form-actions)
2. **Remote functions are optional and experimental.** Keep the existing authenticated REST API as the CLI boundary. A thin remote handler or progressively enhanced form can serve an admin UI. Use runtime schemas and session permissions; never authorize from caller-controlled remote `event.url`, `params` or `route`. Query handlers cannot access those properties. [Remote functions](https://svelte.dev/docs/kit/remote-functions), [hooks](https://svelte.dev/docs/kit/hooks)
3. **Current SSR is suitable for CMS publishing.** It provides initial HTML and metadata without a per-post route or deployment. SSG entries can be discovered automatically if a future deliberate rendering migration is chosen, but build-time snapshots need a separate rebuild/freshness workflow. [Page options](https://svelte.dev/docs/kit/page-options), [SEO](https://svelte.dev/docs/kit/seo)
4. **Article HTML bypasses component compilation.** `{@html}` does not compile Svelte or apply scoped styles to injected descendants. Sanitize server-side, preserve anchored global typography and inspect actual DOM, headings, accessibility and mobile layout. Svelte MCP/compiler analysis cannot certify CMS HTML or factual claims. [Raw HTML](https://svelte.dev/docs/svelte/@html), [compiler warnings](https://svelte.dev/docs/svelte/compiler-warnings#css_unused_selector)
5. **Use deterministic server normalization.** `$effect` and `onMount` are browser-only and cannot supply authoritative public metadata or publication checks. Hydration does not reliably repair differing HTML/image attributes. Use derived UI state for reports and pass the same normalized content into rendering. [Effects](https://svelte.dev/docs/svelte/$effect), [runtime warnings](https://svelte.dev/docs/svelte/runtime-warnings#hydration_html_changed)
6. **Keep user/session state scoped.** Avoid mutable module-level draft state across requests; use request context and per-component state. Explicitly handle mutation rejections; render boundaries do not catch arbitrary event-handler/background failures. [State management](https://svelte.dev/docs/kit/state-management), [boundaries](https://svelte.dev/docs/svelte/svelte-boundary)
7. **Runtime media requires the existing upload pipeline.** `enhanced-img` operates on build-time assets, not future CMS uploads. Validate bytes, dimensions, variants and actual appearance through trusted storage. [Images](https://svelte.dev/docs/kit/images)
8. **Client refresh is not CDN purge.** Refresh active queries/load data through the appropriate APIs; separately implement and measure hosted cache invalidation. Preview/authenticated responses must bypass shared caches. Serverless filesystem writes and `waitUntil` are not durable publishing storage/queues. [Navigation](https://svelte.dev/docs/kit/$app-navigation), [Vercel adapter](https://svelte.dev/docs/kit/adapter-vercel)
9. **Use layered tests.** Test pure preparation logic directly, transactional retries/conflicts in the service, and the actual saved content/permissions in browser tests. The repository's Vite+/pnpm contract overrides generic installation/command examples in official tutorials. [Svelte testing](https://svelte.dev/docs/svelte/testing), [local tooling contract](../../VITE_PLUS_WORKFLOW.md)

## Documentation drift and limits

- The official [Kit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) says `$app/stores` was removed; the repository AGENTS text calls it deprecated. The repository already forbids using it. Record this wording discrepancy without introducing deprecated APIs.
- Current Svelte basic-markup and bind documentation describe same-event binding/handler order differently. The proposed intake must consume submitted/validated values and test installed behavior, not depend on that wording ambiguity.
- No per-article JSON-LD title list is needed: that conclusion comes from the **repository's actual loader/builders**, not a generic framework promise. [Blog SEO builder](../../../src/lib/seo/blog-seo.ts), [article loader](../../../src/routes/blog/[slug]/+page.server.ts)
- No production storage, publication, scheduling, cache freshness, indexing or financial claim was certified by this documentation review. The complete proposed workflow and acceptance criteria are in [AUTOMATION_PLAN.md](../../blog/AUTOMATION_PLAN.md).

## Validation of this documentation change

Changed files are Markdown/JSON only. Validation for this follow-up:

- Python standard-library checks: valid JSON, **164 unique section paths**, all four reviewer ranges covering each section exactly once, **52 existing local link targets** across the plan/guide/review, and all documented project script names present in `package.json`.
- Changed-file `pnpm exec vp fmt --check`: six files checked after formatting the four initially reported files. The isolated worktree uses the already-installed local Vite+ toolchain with `pnpm --config.verify-deps-before-run=false exec vp fmt` to avoid an unrelated dependency reinstall; this is verification setup, not a new project workflow or configuration change.
- `git diff --check`: no whitespace errors.
- `git diff --stat e896ebc..3289454 -- src scripts package.json pnpm-lock.yaml vite.config.ts`: empty, confirming the cited application baseline through that main commit.

No new runtime gates were run for this documentation-only change. The original runtime gate results remain historical evidence for the audited application, not tests of the proposed automation.
