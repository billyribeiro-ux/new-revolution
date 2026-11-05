# Blog handoff for every agent

**Reference date: November 5, 2026.** Read this before adding or updating a blog article, editor workflow, blog metadata or intake automation. Re-check the linked source and current environment before acting; a dated plan is not proof of implementation.

## Required reading and current status

**First article published, November 5:** the owner explicitly selected “Publish after verification.” The [0DTE SPX guide](https://www.revolutiontradingpros.com/blog/0dte-spx-options-strategy-guide) is Production CMS post 1, featured on homepage/archive, with six real Blob media originals and generated crops/variants. PR #29 is squash-merged as `e94fc23`; published deployment `dpl_EbGSBSiqZEEQnmTdKQ21TQpTnhEg` keeps maintenance off. Read [publication evidence](reviews/first-blog-2026-11-05/VERIFICATION.md) and [actual state](reviews/first-blog-2026-11-05/production.json). Prepared `post.json` remains a draft-intake source, not the live record’s current status; never replay it over the published post. Indexing remains separately gated.

1. [Blog implementation and publishing guide](../blog%20implementation.md): the existing executable CMS/API workflow, input shapes, real-media checks and public verification.
2. [Blog intake automation plan](blog/AUTOMATION_PLAN.md): the proposed package contract, shared preparation service, draft intake, preview checks and acceptance criteria. **The new intake tooling is not implemented.** Its operation names are proposals, not runnable package scripts.
3. [Blog audit and article implementation plan](reviews/blog-audit-2026-11-05/AUDIT.md): source/browser findings and the exact reviewed draft's blockers. The audit does not approve later draft revisions.
4. [Official Svelte documentation review](reviews/blog-audit-2026-11-05/SVELTE_AUTOMATION_REVIEW.md) and [164-section coverage ledger](reviews/blog-audit-2026-11-05/svelte-doc-review.json): official framework basis, version limits and reviewed sections.
5. [Agent standards](../AGENTS.md), [coordination](AGENT_COORDINATION.md), [Vite+ workflow](VITE_PLUS_WORKFLOW.md) and [changelog](../CHANGELOG.md): work isolation, current commands and actual changes.

## Rules supported by the audit

- **Articles are CMS database records rendered by the existing `/blog/[slug]` route.** Saving a Markdown file under `blogs/` or `content/` does not publish it. Do not create a Svelte route for each article or use a legacy static card list as the publication source. See [the loader](../src/routes/blog/[slug]/+page.server.ts) and [post services](../src/lib/server/services/posts.ts).
- **JSON-LD already uses post data automatically.** Save title, author, dates, taxonomy and media through the CMS. Do not maintain a manual title list or paste an article's raw schema script into the body. Change shared builders only to change schema behavior, with the appropriate tests. See [blog SEO](../src/lib/seo/blog-seo.ts).
- **Use the existing authenticated CMS/API and service lifecycle.** The old archive importer directly upserts records and bypasses lifecycle protections; do not use its writing mode as the normal new-post workflow. The proposed replacement needs explicit one-package selection, read-only validation, conflict checks, durable retry handling and a saved-draft preview.
- **Verify real media.** Placeholder image URLs can return HTTP 200 with SVG bytes and can pass the current SEO score. Confirm decoded files, variants, dimensions, appearance and provenance through the trusted media pipeline.
- **Publishing and launching are separate.** `/blog` remains launch-gated in the audited application. A saved or published record does not authorize removing the gate, deployment or a bulk import. Check the actual launch policy before reporting visibility or sitemap inclusion.
- **Mechanical validation is not financial approval.** Verify the exact claims, source periods, calculations, credentials and strategy promises. Attach any editorial approval to the exact saved revision; a green score does not certify facts.
- **Publication automation has prerequisites.** Gate parity for live edits, explicit schedule offsets, scheduled publication dates and hosted cache purge/retry remain implementation work. Query refresh is not CDN purge. See [freshness](blog/FRESHNESS.md).
- **Use the installed stack.** This review verified Svelte 5.57.3 / Kit 3.1.1; Kit 3.2 could not be verified. Do not label the evidence as a pinned 3.2 manual or upgrade as a side effect of reading it.
- **Use the official Svelte MCP for Svelte work.** Discover sections, read relevant documentation and run the autofixer on every component/module analyzed or changed, re-running after fixes. Compiler checks do not validate stored article HTML or financial claims. Preserve the existing pnpm/Vite+ scripts.
- **Generic marketing-page recipes do not create CMS articles.** The homepage and blog templates use SSR with `prerender = false` for the owner-requested automatic CMS discovery; other build-time-stable marketing routes retain SSG. Generic per-page/new-builder instructions do not apply every time an author adds a CMS record.

Older prompts, adaptation notes and dated progress tables can describe prior stages. For current blog operations, follow the publishing guide and re-read the source; do not repeat an old implementation or treat proposed tooling as complete.

## Implemented discovery, separate from proposed intake

The owner-requested discovery structure is implemented in `src/lib/server/services/blog-discovery.ts` and the homepage/blog route loaders. Every eligible published CMS post feeds both surfaces. One marked featured article leads; when none is marked, the newest publication leads. Regular posts exclude that lead before pagination (6 per homepage section page, 12 per blog page). Search includes matching featured posts as normal results.

The homepage is now a documented SSR exception so new saved publications appear without a rebuild. Its blog section renders independently of the older homepage launch-hide condition; Blog is visible in desktop/mobile menus, footer and navigation JSON-LD from the shared navigation data. Indexing, sitemap and homepage article-ItemList exclusions remain in force. See `isNavigationHrefVisible()` versus `isLaunchedHref()`; menu visibility does not launch indexing. Homepage and blog-index reads are no-store. Other cache/publishing hardening and the intake CLI remain proposed work. Do not report the entire automation plan complete.

A new repository draft still needs an approved CMS save/publication. This change does not import the archived Markdown packages, invent authors/media or publish the 0DTE article. See [publishing placement instructions](../blog%20implementation.md#11-automatic-homepage-and-blog-placement) and [the owner decision](seo/DECISIONS.md#7-automatic-cms-discovery-and-featured-placement-2026-11-05).

Implementation and acceptance evidence: [575 unit/component tests, 40 authenticated browser tests, 3 SEO tests and reviewed screenshots](reviews/blog-discovery-2026-11-05/VERIFICATION.md). These are local implementation results; check the branch/release state before assuming a hosted deployment contains the feature.

The owner’s subsequent November 5 instruction has been completed: PR #27 is squash-merged and the normal public website is deployed with maintenance off. Current deployment state is recorded in [layout/release acceptance](reviews/blog-layout-release-2026-11-05/VERIFICATION.md). Restore maintenance only on the owner’s later instruction. That availability release did not import an article. The owner subsequently selected `blogs/first-blog.md`, approved publication after verification, and the corrected first article is now published as recorded above.

The owner subsequently selected `blogs/first-blog.md` for article preparation. Its original bytes are preserved; the corrected body, metadata, source ledger, real graphics and portable reader copy are in [the first-article package](../content/articles/0dte-spx-options-strategy-guide/README.md). Check [its acceptance record](reviews/first-blog-2026-11-05/VERIFICATION.md) for the exact saved revision, actual publication and environment; package files do not publish themselves. Do not revert to the older brief or treat unverified desk statistics as approved facts.

The SSR homepage’s `getDeskStatus` remote prerender must retain `{ dynamic: true }`. The November 5 hosted check found that default build-only prerender functions can pass Vite preview while throwing in the generated Vercel handler. Preserve `tests/deployment/vercel-runtime.e2e.ts` and verify deployed HTTP/browser behavior after changing rendering mode.

Blog shells now use the same responsive `.container` as the rest of the website (1536px maximum on large screens); article prose retains a 900px reading limit. Treat `src/app.css` as the width/gutter evidence, rather than inventing a viewport-specific width for a post.

## Agent-document coverage

The following **40 existing Markdown entry points, prompts, standards and runbooks** now carry a dated blog-handoff reference. `CLAUDE.md` also imports this file explicitly. The identical SEO-standard copies use the same repository-root path text to preserve their byte-for-byte parity.

- [AGENTS.md](../AGENTS.md)
- [ARCHCITECURE_AND_SEO.md](../ARCHCITECURE_AND_SEO.md)
- [CLAUDE.md](../CLAUDE.md)
- [CSS.md](../CSS.md)
- [GEMINI.md](../GEMINI.md)
- [README.md](../README.md)
- [SEO-Prompt.md](../SEO-Prompt.md)
- [SEO_STANDARD.md](../SEO_STANDARD.md)
- [blog implementation.md](../blog%20implementation.md)
- [blog-editor-report.md](../blog-editor-report.md)
- [blog-posts.md](../blog-posts.md)
- [docs/ADMIN_AUTH_PLAN.md](ADMIN_AUTH_PLAN.md)
- [docs/ADMIN_LOCAL_LOGIN.md](ADMIN_LOCAL_LOGIN.md)
- [docs/AGENT_COORDINATION.md](AGENT_COORDINATION.md)
- [docs/BLOG_ADAPTATION_MAP.md](BLOG_ADAPTATION_MAP.md)
- [docs/CSS_STANDARDS.md](CSS_STANDARDS.md)
- [docs/MAINTENANCE.md](MAINTENANCE.md)
- [docs/MAINTENANCE_EXPERIENCE_PLAN.md](MAINTENANCE_EXPERIENCE_PLAN.md)
- [docs/MEDIA_STORAGE.md](MEDIA_STORAGE.md)
- [docs/MEDIA_UI_CONTRACT.md](MEDIA_UI_CONTRACT.md)
- [docs/NEW_PAGE_PLAYBOOK.md](NEW_PAGE_PLAYBOOK.md)
- [docs/SEO_EVIDENCE.md](SEO_EVIDENCE.md)
- [docs/TEMPORARY.md](TEMPORARY.md)
- [docs/VITE_PLUS_WORKFLOW.md](VITE_PLUS_WORKFLOW.md)
- [docs/WAITLIST_SETUP.md](WAITLIST_SETUP.md)
- [docs/blog/AUTOMATION_PLAN.md](blog/AUTOMATION_PLAN.md)
- [docs/blog/COVERAGE_MATRIX.md](blog/COVERAGE_MATRIX.md)
- [docs/blog/FRESHNESS.md](blog/FRESHNESS.md)
- [docs/blog-editor-implementation-prompt.md](blog-editor-implementation-prompt.md)
- [docs/seo/DECISIONS.md](seo/DECISIONS.md)
- [docs/seo/LAUNCH_TRACKER.md](seo/LAUNCH_TRACKER.md)
- [docs/seo/OPERATIONS.md](seo/OPERATIONS.md)
- [docs/seo/SEO_STANDARD.md](seo/SEO_STANDARD.md)
- [follow-up-prompt.md](../follow-up-prompt.md)
- [improve-layout-prompt.md](../improve-layout-prompt.md)
- [mind-blower.md](../mind-blower.md)
- [nuclear-mind-blower.md](../nuclear-mind-blower.md)
- [revolution-trading-pros-color-style-guide.md](../revolution-trading-pros-color-style-guide.md)
- [seo-audit.md](../seo-audit.md)
- [seo-verify.md](../seo-verify.md)

`CHANGELOG.md` records the handoff change and links here. This file supplies the shared status and required reading so future updates have one maintained destination.

Editorial inputs under `blogs/` and `content/`, root code/content samples (`blog-sample.md`, `blog-sample-fixed.md`, `menu-submenu.md`) and dated evidence under `docs/reviews/` or `docs/seo/audit/` are reference artifacts, not operational entry points. Their authored content is preserved by this implementation. The owner separately retired `old-footer.md` on main; it is not an active reference. When consulting an artifact, start with the current handoff above rather than treating the artifact as a fresh implementation directive.

For every future agent prompt, README, playbook or runbook added to this repository, include a relative link to this handoff when it can guide blog work, and add it to this coverage list. Keep the current/proposed distinction accurate when automation is implemented; replace proposed names with tested commands and evidence.

## Historical handoff-only validation

Verified all **40** coverage-list entries carry exactly one handoff reference, every handoff link resolves, the Claude import exists, the SEO-standard copies remain byte-identical, audit-prompt YAML front matter is unchanged, and the four root reference artifacts remain untouched. Changed-file Vite+ formatting checks cover **44 files**, with whitespace checks for the tracked diff. The isolated worktree uses the installed toolchain with the same verification-only dependency-reinstall override documented in the Svelte review; no project tooling configuration changed.

The original handoff-only update changed no application behavior. Current navigation and publishing acceptance is recorded in [the November 5 verification](reviews/blog-navigation-2026-11-05/VERIFICATION.md). Re-run these documentation checks when adding an entry point or changing a handoff link.
