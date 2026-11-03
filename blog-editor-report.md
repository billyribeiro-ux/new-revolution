# Blog Engine, Rich-Content Editor & Publishing Lifecycle: Requirements, Audit and Plan

**Created:** 2026-11-02 · **Repository state audited:** `main` at `ff8a363` · **Status:** requirements captured, audit complete for the areas listed in Part B.3, decisions approved (2026-11-02), **Phase 0 complete**, **Phase 1a complete** (cache headers, tags, 404 and pagination), Phase 1b (CDN purge) blocked on authorization, Phases 2-9 not started.

This file has three parts:

- **Part A:** the requirements document, reproduced verbatim as supplied by the owner. It is the acceptance baseline.
- **Part B:** the audit of the current code against Part A, with evidence (file and line, or command).
- **Part C:** what is not implemented, and the implementation plan.

Context that changes how Part A applies (owner statement, 2026-11-02): **all blog posts are placeholders/mock content.** `/blog` stays behind the launch gate (`src/lib/data/launch-gate.ts`, `docs/TEMPORARY.md` T10). The engine is therefore verified with fixtures only, and mock posts must be deleted or fixture-flagged before un-gating (`docs/seo/LAUNCH_TRACKER.md` §A).

---

## Part A: Requirements (verbatim)

```text
Audit and implement the Blog Engine, Rich-Content Editor, and Publishing Lifecycle end to end for this existing Svelte/SvelteKit TypeScript project.

SCOPE:
Cover the blog index, article pages, category/tag/author archives, pagination, editor and backend contracts, rich-content processing, blog metadata, structured data, images, feeds, and sitemap synchronization.

Preserve existing design, layouts, component interfaces, business logic, content, and working features.

Do not modify unrelated marketing, product, or application pages except for necessary shared navigation, metadata, security, or sitemap integration. Keep shared changes narrow and verify their effects.

Implement in the workspace and safe test environments. Do not deploy, publish or unpublish live content, modify production CMS records, run destructive migrations, or change external settings without explicit authorization.

=====================================================================
1. DISCOVERY, SOURCES, AND EXISTING CONTRACTS
=====================================================================

Read applicable repository instructions.

Inspect:
- Package manifests and lockfiles.
- Installed Svelte, SvelteKit, TypeScript, Vite, adapter, and relevant libraries.
- Hosting and deployment configuration.
- Existing blog routes, layouts, metadata utilities, and route registries.
- Editor schemas, storage models, APIs, permissions, and publication mechanisms.
- Existing tests, image pipelines, feeds, sitemaps, and cache behavior.

Use official documentation compatible with the installed versions:
- Svelte/SvelteKit documentation and release notes.
- TypeScript documentation where relevant.
- Google Search Central documentation and updates.
- Relevant hosting, CMS, editor, and security documentation.

Record versions, review date, and supporting URLs. Respect any requested historical cutoff.

Classify acceptance criteria as:
- Official requirement or eligibility condition.
- Official recommendation.
- Project/business requirement.
- Engineering/security/accessibility requirement.
- Optional enhancement.

Do not invent Google character limits, word counts, mandatory heading counts, image byte limits, special AI requirements, or ranking guarantees.

Do not assume a registry, file, test, configuration, or defect exists without inspecting it.

Establish baseline checks where feasible. Preserve meaningful tests and distinguish existing failures from regressions introduced by this task.

Do not delete, skip, or weaken assertions merely to make checks pass. Explain and justify corrections to incorrect or outdated tests.

Do not perform unrelated dependency upgrades, framework migrations, or component rewrites.

=====================================================================
2. FRAMEWORK AND TYPESCRIPT COMPATIBILITY
=====================================================================

Use APIs and configuration supported by the installed toolchain.

For new Svelte components, use modern runes-mode syntax where appropriate:
- $props()
- $state()
- $derived() / $derived.by()
- Snippets and {@render ...}

Preserve existing component mode when a narrow blog change does not require conversion. Do not mix incompatible syntax within a component or migrate unrelated code simply because it was touched.

Where supported:
- Use page from $app/state.
- Keep metadata reactive across navigation and component reuse.
- Use appropriate generated route types in route files.
- Use explicit shared types for reusable components and utilities.

Do not introduce any casts or suppression comments to conceal type errors.

Verify installed-version conventions before changing:
- Configuration locations and aliases.
- Response helpers.
- Error and redirect handling.
- Refresh/invalidation APIs.
- Server-only boundaries.
- Hooks and adapter behavior.

Apply documented server-only filename-segment and directory rules—not a blanket rule for every name containing “server.”

=====================================================================
3. ROUTE AND PUBLICATION INVENTORY
=====================================================================

Inventory existing routes and concrete URL sources:
- Blog index.
- Article pages.
- Category/tag archives.
- Author pages.
- Pagination and query variants.
- Search or filtering, if present.
- Draft and preview routes.
- Scheduled, published, unpublished, and deleted content.
- Historical slugs and redirects.
- RSS/Atom feeds.
- Sitemap integration.
- Relevant production and nonproduction environments.

Create a coverage matrix containing:
- Intended public accessibility and indexability.
- Publication-state eligibility.
- HTTP status.
- SSR/prerendering behavior.
- Metadata ownership and source.
- Canonical/query policy.
- Structured-data applicability.
- Feed/sitemap eligibility.
- Cache behavior.
- Implementation and verification status.

Use pass, fail, not applicable, or not verified. Report full URL checks separately from representative template checks.

For feeds, preserve and verify existing formats. If no feed exists, implement one appropriate format using established project conventions unless the task or project requirements specify otherwise. Do not create both RSS and Atom without a reason.

=====================================================================
4. RENDERING, ROUTING, AND HTTP BEHAVIOR
=====================================================================

Ensure important public article content and metadata are available in initial SSR or prerendered HTML.

Verify:
- Direct requests and refreshes.
- Hydration.
- Client navigation and back/forward behavior.
- Reused components.
- Error responses.
- Archive and pagination transitions.

Establish explicit policies for:
- Published articles.
- Unknown slugs.
- Drafts and previews.
- Unpublished articles.
- Permanently deleted articles.
- Renamed articles.

Return appropriate statuses and redirects:
- 200 for available published content.
- 301/308 for intentional permanent slug redirects.
- 404 for missing/unavailable content where appropriate.
- 410 only where deliberate permanent-removal policy calls for it.

Do not implement 410 behavior using a 404 call. Prevent soft 404s.

Maintain historical slug redirects without loops or unnecessary chains. Verify handling of slug collisions and reuse according to project policy.

Use crawlable a[href] links for indexable navigation.

For indexable pagination, provide distinct crawlable URLs and appropriate individual canonical URLs. Do not canonicalize every subsequent page to page one.

Treat filter/search indexability and query parameters according to explicit route policies.

=====================================================================
5. METADATA AND HEAD OWNERSHIP
=====================================================================

Establish clear ownership for singleton SEO elements across layouts, pages, shared components, and metadata libraries.

Preserve a working pattern or consolidate where necessary. Do not assume page-level tags automatically override layout defaults.

Verify initial HTML and navigation for missing, duplicate, conflicting, or stale:
- Titles.
- Meta descriptions.
- Canonicals.
- Robots directives.
- Applicable social metadata.

Preserve valid repeated elements such as alternate-language links or multiple image entries.

Provide accurate page-specific metadata for articles and archives, with sensible fallbacks.

Use verified production origins for absolute canonicals and social URLs. Preserve content-defining query parameters according to route policy; remove tracking parameters where appropriate.

Respect established metadata budgets and validation severity as project rules. Do not describe character counts as Google requirements or guarantee display length.

For article social metadata, provide applicable:
- og:title
- og:type=article
- og:url
- og:description
- og:image
- og:image:alt
- Actual image dimensions where known
- Publication/modification timestamps
- Author profile relationship
- Appropriate X card metadata

Do not invent dates, URLs, or assets. Keep metadata factually consistent with the article without requiring identical wording across every field.

=====================================================================
6. EDITOR, VALIDATION, AND STORAGE PIPELINE
=====================================================================

Trace:
editor → validation → API/storage → rendering → metadata → structured data →
feeds/sitemap → caches.

Preserve established backend contracts and model valid states explicitly.

Support appropriate fields and defaults for:
- Title and slug.
- Summary/excerpt.
- Optional SEO title and description.
- Controlled canonical overrides.
- Truthful author attribution.
- Publication and meaningful modification dates.
- Featured image, appropriate alt treatment, and dimensions.
- Categories/tags.
- Publication states and scheduling.

Separate:
- Security blockers.
- Invalid content-model/storage input.
- Required publication fields.
- Structured-data defects.
- Editorial suggestions.

Preserve intentional project blocking/warning severity. Do not block publishing merely because an optional Google recommendation is absent.

Validate slug uniqueness on the authoritative backend, including concurrent-write behavior where applicable.

Define a trustworthy content-modification date. Do not use unrelated database updates to manufacture editorial freshness.

=====================================================================
7. AUTHORIZATION, PREVIEWS, AND PRIVATE CONTENT
=====================================================================

Inspect and enforce server-side authorization for:
- Editor access.
- Content reads and writes.
- Preview access to specific posts.
- Publishing, scheduling, unpublishing, and deletion.
- Relevant media operations.

Do not rely on hidden UI controls or client-side checks.

Ensure draft, preview, and future scheduled content is excluded from public:
- Article routes.
- Archive/list queries.
- APIs and serialized page data.
- Search results within the application.
- Feeds.
- Sitemaps.

Use authentication or appropriately scoped, expiring preview access according to existing architecture. Prevent preview credentials from leaking into public links or outputs.

Use noindex as an indexing safeguard where appropriate, not as access control. Do not expose private content just so a crawler can read noindex.

Verify cached responses do not retain content after access or publication changes.

Where assets themselves are confidential, verify their access policy separately; protecting the article page does not establish asset privacy.

Inspect relevant environment protections. Do not require runtime hooks to protect output served directly as static or prerendered files.

=====================================================================
8. SCHEDULING, PUBLICATION, AND CACHE FRESHNESS
=====================================================================

Identify the actual publication mechanism:
- Request-time eligibility.
- Scheduled jobs.
- CMS events/webhooks.
- Rebuild/deployment triggers.
- Other verified mechanisms.

Define and implement scheduling timezone, stored timestamp interpretation, and the exact eligibility transition.

Address retries, duplicate events, missed events, and recovery according to the existing architecture. Do not invent a scheduler merely to satisfy a preferred design.

Define a measurable freshness requirement for:
- Article responses.
- Archives.
- Metadata and structured data.
- Feeds.
- Sitemap output.
- Relevant caches.

Do not promise “immediate” updates without a defined mechanism and verified timing.

For prerendered content, account for how generated output is rebuilt or replaced after publication changes.

Verify publishing, meaningful edits, slug changes, scheduling, unpublishing, and deletion using fixtures or isolated test content.

Distinguish application freshness from Google's independent crawling and indexing timelines.

=====================================================================
9. RICH CONTENT, SANITIZATION, AND TOC
=====================================================================

Inspect every input and rendering path:
- Rich-text AST.
- Markdown.
- Pasted HTML.
- API writes/imports.
- Embeds.
- Raw HTML insertion.
- SVG or other rich media where supported.

Use robust schema validation and maintained sanitization mechanisms appropriate to the rendering context.

Define allowed:
- Elements and attributes.
- URL schemes.
- Embed origins.
- Rich-media capabilities.

Prevent executable markup, dangerous event handlers, unsafe URL schemes, and unauthorized embeds. Do not use regex-only HTML sanitization.

Verify transformations after sanitization do not reintroduce unsafe content.

Treat JSON-LD serialization, article HTML sanitization, and SVG handling as separate security boundaries.

Preserve legitimate semantic content such as tables, description lists, figures, captions, and blockquotes where supported.

As a project convention, the article template may own the H1 while body sections begin at H2. Preserve a logical hierarchy; do not label every additional H1 as a Google violation.

If a TOC is appropriate:
- Generate deterministic, collision-safe heading IDs.
- Handle repeated headings and Unicode.
- Preserve existing deep links where feasible.
- Provide accessible jump links.
- Verify anchors after rendering and navigation.

Do not introduce a TOC solely as an assumed Google requirement.

=====================================================================
10. IMAGES, DISCOVER, AND PERFORMANCE
=====================================================================

Inspect actual image storage, processing, delivery, and components.

Apply established project presets where appropriate. Identify exact dimensions, formats, and byte budgets as project requirements—not universal Google rules.

Preserve original masters, chart readability, meaningful crops, and appropriate aspect ratios. Generate responsive candidates according to actual rendered sizes and display density.

For Discover-oriented imagery, follow current official large-image and preview recommendations. Distinguish recommendations from eligibility and appearance guarantees.

Do not claim that exactly 1200×675, WebP, or under-100-KB files are mandatory for Google.

Use accurate intrinsic dimensions or appropriate layout reservations. Do not guarantee zero page-wide CLS from image dimensions alone.

Determine loading behavior from placement:
- Do not lazy-load likely LCP images.
- Use high fetch priority selectively.
- Lazy-load appropriate offscreen images.
- Do not automatically lazy-load every archive card.
- Treat decoding behavior as an implementation choice.

Provide informative alternatives for meaningful images and empty alt text for decorative images. Provide nearby explanation/data for complex charts.

Measure relevant loading and layout behavior. Distinguish lab diagnostics from field Core Web Vitals; do not infer a field pass from source inspection or Lighthouse alone.

=====================================================================
11. STRUCTURED DATA AND SAFE JSON-LD
=====================================================================

Implement applicable BlogPosting or Article structured data using verified content.

Use Person or Organization authorship according to reality. Include identifying URLs, sameAs, avatars, and credentials only where applicable and verified.

Use publisher information consistent with shared site entities. Do not duplicate conflicting Organization definitions.

For logos, follow current Google dimensions, crawlability, and supported-format guidance. Do not impose a raster-only rule.

Generate BreadcrumbList from a meaningful actual navigation hierarchy. Do not force a category level when it does not apply.

Keep structured data factually consistent with visible content, authorship, dates, representative images, and canonical identity.

Distinguish schema.org validity from current Google feature support and required versus recommended properties.

Do not automatically emit FAQPage for visible FAQs. Google's FAQ rich-result feature was retired in 2026. Use it only for a documented alternative purpose or explicit project requirement.

Serialize JSON-LD safely at the actual HTML insertion boundary. For raw JSON embedded in an HTML script element, an appropriate pattern is:

JSON.stringify(schema).replace(/</g, '\\u003c')

Preserve valid JSON and original values. Avoid double escaping.

Test:
- Closing-script sequences, including mixed case.
- Comment-open sequences.
- Quotes, ampersands, Unicode, and markup-like strings.
- Lossless JSON round-tripping.
- Safe containment in final rendered HTML.
- No injected elements.
- Correct SSR and client-navigation behavior.

Do not accept a helper substring assertion alone as proof of safe output.

=====================================================================
12. ROBOTS POLICY, SITEMAPS, AND FEEDS
=====================================================================

For intended public indexable pages, verify there are no unintended indexing restrictions.

Explicit index/follow is optional. Set snippet/image/video preview permissions according to publisher policy and applicable recommendations.

Inspect combined HTTP and HTML directives. Do not let public defaults override preview or environment protections.

Integrate eligible canonical blog URLs into the existing sitemap architecture without duplicating unrelated sitemap ownership.

Verify:
- Correct production origin.
- Canonical, indexable URL selection.
- Exclusion of private, draft, future scheduled, redirected, error, and noindex URLs.
- XML escaping and content types.
- Applicable sitemap size/URL limits.
- Accurate publication-state and cache synchronization.

Include lastmod only when a trustworthy meaningful modification date exists. Otherwise omit it. Do not stamp every URL with build/request time.

For feeds, verify the selected RSS/Atom format, valid escaping, stable item identity, absolute URLs where required, correct dates, publication-state filtering, and appropriate content sanitization.

Do not assume removing a URL from a sitemap or feed immediately removes it from external search indexes.

=====================================================================
13. TESTING AND FINAL REPORT
=====================================================================

Use the project's actual verification commands and existing test architecture.

Run appropriate:
- Type checking.
- Unit/security tests.
- Integration/browser tests.
- Production build checks.

Test representative routes from every distinct template and publication policy, plus broader automated URL checks where feasible.

Inspect actual HTTP responses, raw initial HTML, client navigation, endpoints, and lifecycle transitions.

Add meaningful tests for changed behavior. Fix regressions introduced by this task. Report unrelated baseline failures separately rather than silently expanding scope.

Do not weaken tests to obtain passing results.

Mark any check not verified whenever sufficient evidence is unavailable. Explain the blocker, completed inspection, and exact remaining action. Do not infer deployed correctness from local tests.

If backend or external changes are necessary but inaccessible or unauthorized, complete available work and identify the precise unfinished dependency.

Deliver:
1. Files created/modified and reasons.
2. Installed versions, official sources, and review date.
3. Blog Route & Publication Coverage Matrix.
4. Commands run and actual outcomes.
5. Security and lifecycle evidence.
6. Project requirements preserved and justified test changes.
7. Pre-existing failures, remaining defects, and unverified checks.
8. Exact external deployment or integration actions still required.

Do not claim complete compliance, zero defects, guaranteed security, immediate
Google indexing changes, Discover appearance, rankings, or AI citations.
```

---

## Part B: Audit of the current implementation

Evidence is a file path with line numbers, or a command. "Not verified" means I did not inspect it; it is not a pass.

### B.1 Sources checked (review date 2026-11-02)

| Source                                                                                          | What it established                                                                                                                                |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading` | Each paginated page gets its own canonical; do not canonicalize to page 1; use real URLs, not fragments; `rel=next/prev` unused by Google.         |
| `developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap`                    | 50 MB / 50,000 URLs per sitemap; `lastmod` used only if consistently and verifiably accurate; `changefreq`/`priority` ignored.                     |
| `developers.google.com/search/docs/appearance/structured-data/article`                          | No required properties; `author`, `datePublished`, `dateModified`, `headline`, `image` recommended; images in 16x9, 4x3, 1x1, at least 50K pixels. |
| `developers.google.com/search/docs/appearance/google-discover`                                  | At least 1200 px wide, `max-image-preview:large`; eligibility is not a guarantee.                                                                  |
| Svelte MCP: `kit/server-only-modules`, `kit/errors`, `kit/hooks`                                | `server` filename segment or `server` directory; `error(status)` takes the status passed; prerendered pages bypass `handle`.                       |

Installed toolchain facts used: SvelteKit 3.1.1, Svelte 5.57.3, `sanitize-html` 2.18.1, adapter `@sveltejs/adapter-vercel` 7.0.2 (`package.json`). The Google pages showed no "updated" date at fetch time.

### B.2 What is already implemented (with evidence)

| Requirement (Part A §)                            | State       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §6 Slug uniqueness on the backend                 | Pass        | `slug ... .notNull().unique()` on posts (`src/lib/server/db/schema.ts:31`, `:57`, `:89`, `:100`); a database constraint is authoritative under concurrent writes. The error mapping for a violation is not verified.                                                                                                                                                                                                                                     |
| §4 Renamed-article redirects                      | Pass        | `src/lib/server/db/save-post.ts:215-262`: inside one transaction it repoints existing redirects to the new slug (collapses chains), deactivates a redirect whose source equals the new slug (rename-back), then inserts or updates a 301. Unique active-source index: `schema.ts:287`.                                                                                                                                                                   |
| §4 Redirect serving                               | Pass        | `src/hooks.server.ts` `resolveBlogRedirect`: `/blogs` → `/blog` at 308; DB redirects for `/blog/*` at 301/302 with query preserved.                                                                                                                                                                                                                                                                                                                      |
| §7 Server-side authorization                      | Pass        | `requireAdmin(event)` on every remote function in `src/routes/admin/posts/posts.remote.ts` (lines 65-232) and on media upload/list (`src/routes/api/media/upload/+server.ts:77`, `list/+server.ts:13`); a global 401 guard covers `/api/admin/` and `/api/media/` in the hook.                                                                                                                                                                           |
| §7 Expiring preview access                        | Pass        | `signDraftPreviewToken` HMAC with one-hour default expiry (`src/lib/server/posts/visibility.ts:212-219`); verification compares in constant time (`:222`). Preview pages are `noindex` and `nofollow` (`blog/[slug]/+page.server.ts:290-291`).                                                                                                                                                                                                           |
| §7 Drafts and private content out of public reads | Pass (code) | `publicIndexablePostPredicate` and `livePostReadPredicate` (`visibility.ts:76-101`) exclude deleted, fixture, expired and not-yet-due content; password-protected and members posts handled separately (`posts.ts:1575-1581`). Not yet proven across every public query; see C.                                                                                                                                                                          |
| §7 No-store for private responses                 | Pass        | `PRIVATE_NO_STORE_CACHE` vs `PUBLIC_READ_CACHE` selected per request (`src/lib/server/posts/cache.ts:28-45`).                                                                                                                                                                                                                                                                                                                                            |
| §8 Publication mechanism                          | Pass        | Vercel cron every minute (`vercel.json`) calls `/api/cron/publish-scheduled`; `src/lib/server/services/cron.ts:53-73` promotes `scheduled` rows whose `scheduledAt <= now` atomically, excluding fixtures and deleted rows.                                                                                                                                                                                                                              |
| §9 Sanitization library                           | Pass        | `sanitize-html` (`src/lib/sanitize-post-html.ts:1`), scheme allow-list `http, https, mailto, tel` (`:468`), iframes `https` only (`:472`), exact-host allow-list `ALLOWED_IFRAME_HOSTS` then path checks for YouTube and Vimeo (`:234-257`), `svg`, `math`, `form`, `button`, `object`, `embed` disallowed (`:68-76`). An earlier suspicion that `host.includes('youtube')` allowed look-alike hosts was wrong: it runs only after the exact-host check. |
| §9 TOC                                            | Partial     | `src/lib/shared/seo/toc.ts` has collision-safe `slugifyHeadingId(text, usedIds)`; deep-link stability and Unicode behavior not verified.                                                                                                                                                                                                                                                                                                                 |
| §10 Archive-card image loading                    | Pass        | `PostCard.svelte:62-70`: `srcset`/`sizes` from stored variants, `loading` is `eager` only when the `eager` prop is set, `fetchpriority` high only then.                                                                                                                                                                                                                                                                                                  |
| §12 RSS format and escaping                       | Pass        | `src/lib/shared/seo/rss.ts`: RSS 2.0 with `content:encoded` in CDATA (with `]]>` splitting, `:15`), `atom:link rel="self"` (`:143`), escaped XML, 50-item cap, content run through `sanitizePostHtml` (`rss.xml/+server.ts:53`). One feed format only, as required.                                                                                                                                                                                      |
| §12 Sitemap hygiene                               | Pass        | Uses the existing generator; no `changefreq`/`priority`; `lastmod` omitted for static routes (`sitemap.xml/+server.ts`). Blog entries excluded while `/blog` is gated.                                                                                                                                                                                                                                                                                   |
| §11 No FAQPage                                    | Pass        | `FAQPage` removed (`docs/seo/DECISIONS.md` §4); blog JSON-LD runs through `dropRestrictedJsonLdNodes` (`blog-seo.spec.ts`).                                                                                                                                                                                                                                                                                                                              |
| §11 JSON-LD escaping                              | Partial     | `serializeJsonLd` escapes `<`, `>`, `&`, U+2028/9 (`structured-data.ts:65-72`) and the hook re-escapes script blocks in final HTML (`escapeJsonLdBlocksInHtml`). Proof is only in `structured-data.spec.ts`; see gap G7.                                                                                                                                                                                                                                 |
| §13 Existing tests                                | Pass        | `blog-routes.spec.ts` (8), `posts.db.spec.ts`, `sanitize-post-html.spec.ts`, `blog-seo.spec.ts`, `blog-system.e2e.ts` (all passing at `f84eaea`).                                                                                                                                                                                                                                                                                                        |

### B.3 Gaps (not implemented, or defective)

Severity: **P0** security or correctness risk, **P1** lifecycle or SEO correctness, **P2** completeness.

| ID  | Sev | Part A § | Gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Evidence                                                                                        |
| --- | --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| G1  | P0  | 8, 7     | **Partly addressed in Phase 1a:** the stale window is now 5 + 1 minutes (was 5 minutes + 24 hours), every public response carries a `Vercel-Cache-Tag`, and `invalidatePublicBlogCache` maps paths to tags and calls a registered purger. **Still open:** no purger is registered (needs your authorization for `@vercel/functions` or a Vercel token) and nothing is measured on a deployment. Original finding: `invalidatePublicBlogCache` only appended to an in-memory log. | `src/lib/server/posts/cache.ts`; `src/lib/server/posts/cache-tags.ts`; `docs/blog/FRESHNESS.md` |
| G2  | P1  | 4        | **No 410 policy.** Deleted posts are soft-deleted (`deletedAt`) but every unavailable slug returns 404 (`error(404)` at `blog/[slug]/+page.server.ts:101`, `:456`). No decision recorded on permanent removal, so removed URLs look identical to never-existed ones.                                                                                                                                                                                                             | `grep -rn 410 src/routes/blog` finds nothing.                                                   |
| G3  | P1  | 6, 12    | **Modification date is not trustworthy.** `resolvePostModifiedDate` falls back `contentUpdatedAt ?? updatedAt ?? publishedAt ?? createdAt` (`src/lib/shared/seo/rss.ts:27-37`), and `save-post.ts:171-173` also falls back to `updatedAt` when the title and content did not change. Unrelated updates (featured toggle, counters) can therefore surface as editorial freshness in sitemap `lastmod`, feeds and `dateModified`.                                                  | `rss.ts:27`, `save-post.ts:171`.                                                                |
| G4  | P1  | 3, 5     | **No author archives and no author profile relationship.** There is no `/blog/author/[slug]` route; the author `Person` URL is `author.website` or `/about` for every post, so authorship does not point to a page that uniquely identifies the author. An `authors` table exists.                                                                                                                                                                                               | `ls src/routes/blog` (no author dir); `blog-seo.ts:396`; `schema.ts:26`.                        |
| G5  | P1  | 4        | **Fixed in Phase 1a:** malformed and out-of-range `page` return 404 uncached; pages 2+ are indexable with self-canonicals and a `(Page n)` title suffix; search stays noindex. Pagination links use `pageHref` so page 1 always links to the bare URL.                                                                                                                                                                                                                           | `blog-pagination.spec.ts` (25 tests, mutation-checked); `docs/blog/COVERAGE_MATRIX.md`          |
| G6  | P1  | 12       | **RSS item identity changes on rename.** `guid` is the post URL with `isPermaLink="true"`, so a slug change produces a new guid and readers show a duplicate. There is no stored stable identifier.                                                                                                                                                                                                                                                                              | `rss.ts:121`.                                                                                   |
| G7  | P1  | 11, 13   | **JSON-LD safety is proven only at the helper level.** Part A explicitly rejects helper-substring assertions. There is no test that renders a page whose title, excerpt or author contains `</script>`, `<!--`, mixed case and Unicode, then parses the final HTML, and none for client-side navigation. The article page is rendered through `svelte-meta-tags` `JsonLd` (`components/blog/SEO.svelte:22`); how it serializes was not verified.                                 | `grep -rln u003c src --include='*.spec.ts'` returns only `structured-data.spec.ts`.             |
| G8  | P1  | 8        | **Scheduling timezone and transition are undefined.** The schema accepts "parseable date" strings (`schemas/posts.ts:249`) and rejects times more than 60 s in the past, but the timezone of the editor's `datetime-local` value, how it is stored, and the exact eligibility instant at read time versus the cron promotion were not verified. Retry, duplicate-event and missed-run recovery are not documented.                                                               | `schemas/posts.ts:249-300`; `cron.ts:53-73`.                                                    |
| G9  | P1  | 9        | **Post-sanitization regex rewriting is untested for safety.** After `sanitizeHtml`, the code rewrites HTML with regexes (`<span>` unwrapping, `<p>` normalization), and the slug-rename path rewrites link `href`s in every other post with a regex that hardcodes `revolutiontradingpros.com`, loading all posts inside the transaction. Part A requires proof that transforms do not reintroduce unsafe content.                                                               | `sanitize-post-html.ts:781-797`; `save-post.ts:253-262`.                                        |
| G10 | P1  | 4        | **Redirect loop and chain safety only partly covered.** Rename-back and chain collapse are handled, but a cycle created through two renames or a manual `redirects` row, and a redirect whose target is an unpublished or deleted post, have no guard or test. The hook serves redirects only for `/blog/` paths.                                                                                                                                                                | `save-post.ts:215-262`; `hooks.server.ts` `resolveBlogRedirect`.                                |
| G11 | P2  | 10       | **Archive card image dimensions are hard-coded** at 800x450 regardless of the real asset (`PostCard.svelte:67-68`); cover alt-text enforcement at publish time and decorative-image handling were not verified.                                                                                                                                                                                                                                                                  | `PostCard.svelte:67`.                                                                           |
| G12 | P2  | 5        | **Phase 0 verified no duplicate or missing title, description, canonical or robots tag on any probed template** (index, article, category, tag). Still open: the full `og:*`/`article:*` set, `og:image` dimensions and author profile tags.                                                                                                                                                                                                                                     | `docs/blog/COVERAGE_MATRIX.md` §2                                                               |
| G13 | P2  | 3        | **Coverage matrix now exists (Phase 0)** with a re-runnable probe (`scripts/blog-coverage-probe.mjs`). Draft, scheduled-future, deleted, fixture and preview states are still not probed over HTTP because that needs fixtures.                                                                                                                                                                                                                                                  | `docs/blog/COVERAGE_MATRIX.md`                                                                  |
| G14 | P2  | 7        | **Media confidentiality unverified.** Draft posts' cover images and in-body media are served through `/media/[...path]` and `/images/blog/[...file]`; their access policy for unpublished posts was not inspected.                                                                                                                                                                                                                                                               | `src/routes/media/[...path]/+server.ts` not read.                                               |
| G15 | P1  | 4, 8     | **Fixed in Phase 1a:** cache headers are set only after a category, tag or page is known to exist, so their 404s carry no `Cache-Control`.                                                                                                                                                                                                                                                                                                                                       | `blog-pagination.spec.ts`; `docs/blog/COVERAGE_MATRIX.md`                                       |

### B.4 Not inspected in this audit

Category and tag archive logic beyond the status codes above, the rich-text editor extensions and paste handling, the markdown importer (`scripts/import-markdown-posts.ts`), media pipeline presets and byte budgets, the blog graph built by `buildBlogPostJsonLd`, client-navigation behavior, sitemap size at scale, and hosting-level cache behavior on Vercel. These are in the plan as verification work, not assumed to pass.

---

## Part C: Implementation plan

Standards for every phase: work in an isolated worktree off `main`; test fixtures only (posts flagged `isFixture`, never the mock content); every change has a failing test first where a defect is claimed; no weakening of existing assertions; `pnpm check`, targeted unit and DB specs, the blog and SEO e2e specs, and the format and lint gates run before merge; the full gate runs once before push. No production data, deployments or external settings are touched.

### Decisions (approved by the owner 2026-11-02; recorded in `docs/seo/DECISIONS.md` §6)

1. **Deleted posts return 404**, not 410 (Google treats all 4xx except 429 the same). Prevent soft 404s. (G2 closes as "no change"; guards stay.)
2. **No author archives now.** Authorship points at the founder `Person` (`#founder`, `/about`); revisit with a second real author. (G4 becomes "link the article author to `#founder` by `@id`".)
3. **Pagination:** pages 2+ indexable with self-canonicals, out-of-range pages 404, search noindex. (G5)
4. **Cache freshness:** purge by cache tag on every lifecycle event, using delete for unpublish and delete. The numeric target is set after measuring on a preview deployment. **Needs your authorization** for either the `@vercel/functions` dependency or a Vercel API token, and for a preview deployment. (G1, G15)
5. **Scheduling:** UTC instants, explicit editor time zone (default `America/New_York`), offset required on input. (G8)

### Phases

| Phase | Goal                                                    | Work                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Acceptance (measurable)                                                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | **Done 2026-11-02:** baseline and matrix                | Record the baseline results at `main`. Build the coverage matrix (Part A §3) as a generated artifact from the route files and publication states. Add `docs/blog/FRESHNESS.md` with the agreed targets.                                                                                                                                                                                                                                                     | Matrix covers every template (index, article, category, tag, author if built, feeds, sitemap) by state (published, draft, scheduled-future, unpublished, deleted, renamed, fixture, password, members). Baseline test results recorded.                         |
| 1     | **G1 / G15 cache freshness (P0)** (1a done, 1b blocked) | Replace the log-only `invalidatePublicBlogCache` with a real mechanism chosen from the verified Vercel options (on-demand revalidation, or shorter `s-maxage` without long `stale-while-revalidate` for post and archive routes). Call it from publish, edit, slug change, unpublish, delete, restore and the cron promotion. Make the scheduled-publish path invalidate archives, feed and sitemap too.                                                    | A test publishes, edits, renames, unpublishes and deletes a fixture, and asserts the freshness target for article, archive, feed and sitemap. Verified on a Vercel preview deployment, not inferred from local tests (needs authorization to deploy a preview). |
| 2     | **G3 trustworthy modified date**                        | Add an explicit editorial modification date (`dateModified` source) updated only when title, body, excerpt, cover or meaningful metadata change, with an editor "minor edit" option. Remove the `updatedAt` fallback from `resolvePostModifiedDate` and `save-post.ts`; backfill with the existing `contentUpdatedAt` or `publishedAt`, never `updatedAt`. Forward-only, idempotent migration.                                                              | A toggle of `featured` or a counter bump leaves `dateModified`, feed dates and sitemap `lastmod` unchanged; a body edit changes them. A post with no trustworthy date omits `lastmod`.                                                                          |
| 3     | **G10 removal and redirect integrity**                  | Deleted posts stay 404 (decision 1). Add tests proving a deleted slug returns 404 with no soft 404 and no cache entry that outlives the purge. Add redirect-cycle and dangling-target guards in `save-post.ts` and a periodic integrity check. Cover slug reuse after delete.                                                                                                                                                                               | Tests: deleted → 404, renamed → 301 once, no chain, no loop, a redirect to an unpublished target is not served, slug reuse follows the recorded policy.                                                                                                         |
| 4     | **G7 / G9 security proofs**                             | Add rendered-HTML JSON-LD tests (SSR and client navigation) with hostile strings; round-trip equality. Add a sanitizer regression corpus (event handlers, `javascript:` and encoded schemes, SVG, `data:`, iframe look-alikes, nested/mutated markup) and run the post-sanitize regex steps against it; replace the hardcoded-domain regex link rewriter with a parser-based rewrite (using the origin constant) and batch it outside the long transaction. | Corpus passes before and after the transform steps; no executable output; JSON-LD output parses back to the original object; link rewrite touches only `href` values that match the old slug.                                                                   |
| 5     | **G4 authorship**                                       | No archive route (decision 2). Make the article JSON-LD author reference the site-wide founder `Person` by `@id` (`#founder`) instead of a separate inline `Person`; keep the visible byline consistent.                                                                                                                                                                                                                                                    | Article graph has one `Person` for the founder; no duplicate or conflicting author nodes; `author.url` resolves to `/about`.                                                                                                                                    |
| 6     | **G5 pagination (done in 1a) / G6 feed identity**       | Record the pagination decision in `docs/seo/DECISIONS.md`; implement self-canonicals if pages 2+ become indexable; return 404 for out-of-range pages (no soft 404). Add a stable `guid` (stored UUID, `isPermaLink="false"`) for new items and keep existing URLs' guid for already-published items to avoid mass duplicates.                                                                                                                               | `?page=` beyond the last page is 404; `?page=1` canonicalizes to the bare URL; renamed post keeps its guid; feed validates.                                                                                                                                     |
| 7     | **G8 scheduling contract**                              | Document and enforce one timezone from editor input to storage (UTC instant) and display; define eligibility as `scheduledAt <= now` at read time and in the cron; add idempotency and a missed-run catch-up test (cron down for N minutes, then runs).                                                                                                                                                                                                     | Tests for DST boundaries, duplicate cron invocations, missed runs; the editor shows the timezone explicitly.                                                                                                                                                    |
| 8     | **G11-G14 metadata, images, media**                     | Audit rendered `<head>` for article, index, category, tag, author (single title, description, canonical, robots; complete `og:*`, `article:*`, `og:image:alt`, dimensions). Replace hard-coded card dimensions with stored dimensions or an explicit aspect-ratio reservation. Verify draft-media access policy. Measure LCP and CLS in the lab for the article and index templates and label them lab.                                                     | No duplicate or conflicting singleton tags in raw HTML on any template; image dimensions match assets; documented media policy; lab measurements recorded and labeled as lab, not field.                                                                        |
| 9     | Hardening and sign-off                                  | Run the full gate once; update `docs/seo/LAUNCH_TRACKER.md` §D with the restored blog assertions; produce the final report in the Part A §13 format (files, versions and sources, matrix, commands, evidence, pre-existing failures, unverified items, external actions).                                                                                                                                                                                   | Gate green; every unverified item named with its blocker.                                                                                                                                                                                                       |

### Risks and constraints

- **Launch gate interaction:** while `/blog` is gated, sitemap and indexability behavior cannot be exercised end to end; tests must run with the gate open in a test configuration, and the production gate stays closed until mock content is gone.
- **Migrations** (Phase 2, 6) must be forward-only and idempotent and must not run against production without authorization.
- **Phase 1 depends on a hosting capability** that must be confirmed against current Vercel documentation and a preview deployment; this cannot be proven locally.
- **Scope discipline:** no dependency upgrades, no editor rewrites, no changes to marketing pages beyond the narrow shared integrations named in Part A.

### Phase 0 results (2026-11-02)

- **Baseline at `main` (`857ce49`):** `pnpm check` 0 errors, 0 warnings; production build succeeds; blog and SEO suites 16 of 16 passing (run at `f84eaea`; later commits are documentation only).
- **Artifacts:** `docs/blog/COVERAGE_MATRIX.md` (generated by `scripts/blog-coverage-probe.mjs`, as shipped and un-gated), `docs/blog/FRESHNESS.md`, `docs/seo/DECISIONS.md` §6.
- **New or confirmed findings:** G5 confirmed (`?page=999` returns 200); G15 added (cacheable 404 for unknown categories and tags); G12 narrowed (singleton head tags are not duplicated).
- **Not verified yet:** draft, scheduled-future, deleted, fixture and preview states over HTTP (need fixtures); a populated page 2; deployed CDN behavior.

### Phase 1a results (2026-11-02)

- **Changed:** `src/lib/shared/blog/pagination.ts` (strict `page` parsing, out-of-range check, `pageHref`), `src/lib/server/posts/cache-tags.ts` (tag rules and path-to-tag mapping), `cache.ts` (one Cache-Control builder, `Vercel-Cache-Tag`, purger seam), the index, category, tag and article loaders, feed and sitemap headers, `blog-seo.ts` (page-aware canonical), and the three archive templates' pagination links.
- **Tests added:** `pagination.spec.ts`, `cache-tags.spec.ts`, `blog-pagination.spec.ts` (25 loader-level tests with 13 fixture posts, mutation-checked), and two `blog-seo.spec.ts` cases. Server project: 33 files, 326 tests, all passing. No existing assertion was weakened or removed.
- **Verified over HTTP** on a production build: malformed and out-of-range pages and unknown categories and tags return 404 with no cache header; public responses send `swr=60` and `Vercel-Cache-Tag`; `docs/blog/COVERAGE_MATRIX.md` regenerated.
- **Gates:** `pnpm check` 0 errors and 0 warnings, format clean, lint exit 0, e2e (SEO contract, homepage, blog) 16 of 16.
- **Not done in 1a:** the CDN purge (1b), any measurement on a deployment, and a decision on `stale-if-error` (kept at an hour).

### Phase 2 results (2026-11-02)

- **Changed:** `resolvePostModifiedDate` / `resolvePostModifiedIso` (`contentUpdatedAt ?? publishedAt ?? none`), `save-post.ts` (bump rule, `minorEdit`), `PostCard.svelte`, the loaders and sitemap query (no `updatedAt`), `blog-seo.ts` (omit unknown dates), and `drizzle/0001_content_updated_at_backfill.sql` with the migration runners.
- **Tests added:** 14 (`modified-date.db.spec.ts`, `modified-date.spec.ts`). Mutation-checked: restoring the `updatedAt` fallback fails 2 of them. Server project: 38 files, 361 tests passing. `pnpm check` 0 errors and 0 warnings; format clean; lint shows only existing warnings.
- **Not done:** the editor "minor edit" checkbox (UI; server contract is in place), running the backfill against production, e2e re-run (sitemap `lastmod` is not rendered while `/blog` is gated).

### Out of scope until authorized

Deploying, publishing or unpublishing live content, editing production CMS records, destructive migrations, changing hosting or Search Console settings.
