# Blog implementation and publishing guide

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](docs/BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

Initial CMS audit: commit `e896ebc`, **November 5, 2026**. Subsequent automatic discovery and menu behavior is verified in [the current acceptance record](docs/reviews/blog-navigation-2026-11-05/VERIFICATION.md). This is the current CMS workflow, with known gaps called out explicitly. Re-read the linked implementation before using this guide after a code change. The [audit and 0DTE implementation plan](docs/reviews/blog-audit-2026-11-05/AUDIT.md) and its machine-readable evidence explain the findings behind these instructions.

## 1. Read this before adding a post

Read [AGENTS.md](AGENTS.md), [the Vite+ workflow](docs/VITE_PLUS_WORKFLOW.md), [the CSS standard](docs/CSS_STANDARDS.md), [SEO decisions](docs/seo/DECISIONS.md), [the launch tracker](docs/seo/LAUNCH_TRACKER.md), and [coordination rules](docs/AGENT_COORDINATION.md). Claim your files in your own worktree. Read the admin/auth plan, changelog and temporary registry before changing the editor, auth, hooks or database.

**A blog article is a database record rendered by `/blog/[slug]`. Do not create a new Svelte route for each article.** All four public blog templates use `+page.server.ts` with `prerender = false`; see [the index loader](src/routes/blog/+page.server.ts), [article loader](src/routes/blog/[slug]/+page.server.ts), and category/tag loaders. This differs from the generic prerendered marketing-page instructions. Preserve the existing architecture when entering CMS content; resolve that policy inconsistency explicitly before attempting a rendering migration.

Putting Markdown in `blogs/`, `content/blog-posts/`, or the repository root does **not** make it appear on the website. `mdsvex` configuration does not connect those directories to the database.

**Published and publicly indexable are separate states.** The owner authorized blog indexing on November 5, 2026; the promoted application removes `/blog` from `UNLAUNCHED_ROUTE_PREFIXES`. Eligible published posts and qualifying archives enter the generated sitemap automatically. Draft, protected and excluded content remain ineligible, and the store stays gated. Public responses and the exact deployment were verified in [indexing release evidence](docs/reviews/blog-indexing-release-2026-11-05/VERIFICATION.md).

### 1.1 Automatic homepage and blog placement

Publishing an eligible public CMS record now populates **both** the homepage blog section and `/blog` through `getPublicBlogListing` in [the shared discovery service](src/lib/server/services/blog-discovery.ts). Do not add a title/card to a static array, homepage component or JSON-LD file.

- Select the editor's **Featured** checkbox for the lead article. This is separate from **Featured Image**, which is the cover image. The existing save transaction permits one published featured record and demotes the previous one when another is selected.
- If no eligible post is marked featured, the newest eligible publication automatically occupies the lead position. The lead appears at the top of the first unfiltered page, once; all other eligible posts appear below in publication order.
- Regular posts are paginated **after** removing the lead: 12 per `/blog` page and 6 per homepage section page. Older posts remain reachable through `/blog?page=2` and `/?blogPage=2#blog`; counts include the lead without repeating it in the grid. Searching lists every matching post normally, including the featured article.
- Draft, future-scheduled, expired, trashed, fixture, noindex and protected/member-only records do not become public cards. Saving a Markdown file is still not a CMS save or publication.
- The homepage now uses SSR (`prerender = false`) to include saved card content in initial HTML without rebuilding. Homepage and blog-index responses are no-store so a fresh request sees publication changes; other blog surfaces still have the cache limitations recorded below.
- The homepage cards, Blog menu and footer link are visible while indexing remains gated. `MAIN_NAVIGATION` supplies desktop/mobile menus and `buildNavigationElements()` automatically supplies navigation JSON-LD; `isNavigationHrefVisible()` controls menu visibility separately from `isLaunchedHref()`. No per-post title edits belong in navigation or schema source. Noindex/canonical suppression, sitemap exclusion and homepage article-ItemList exclusion remain in force. Maintenance availability is separate; the owner authorized it off on November 5 until further instruction. Check the current release evidence.

Verify a draft is absent from both listings, publish through the normal service gate, then fetch both pages and inspect the actual card, cover and article link. Verify the chosen feature appears once above the regular grid. Test new publications, switching the feature and unpublishing. The image-flow E2E now checks actual initial HTML and 320/1440px browser rendering of both surfaces after publication.

**Shared layout contract (November 5 follow-up):** archive, search, category and tag pages use the existing `.container` and `.section` primitives; article/protected shells use the same outer container. `src/app.css` sets a maximum of 1320px from 1024px, 1440px from 1280px and 1536px from 1536px. Prose stays at most 900px wide. New CMS articles inherit this automatically; never add per-post widths or stretch article text to the viewport. See [layout/release acceptance](docs/reviews/blog-layout-release-2026-11-05/VERIFICATION.md).

## 2. Establish the actual environment

Confirm the selected checkout, branch, database target, storage driver and preview origin without printing secrets. Never assume a local preview and a deployed Preview share content.

Evidence: [database initialization](src/lib/server/db/index.ts), [media storage](src/lib/server/media-storage.ts), [Playwright configuration](playwright.config.ts), and [environment example](.env.example).

- Real PostgreSQL URLs use PostgreSQL; this initializer does not run its PGlite migrations/seed against PostgreSQL. Follow the existing migration runbook for the selected environment.
- `memory://...` creates a process-local database. A separate seed command cannot seed the running preview's memory database.
- `pglite://...` selects `.svelte-kit/pglite-blog` under the **current working directory**. The suffix does not select a different file. Use a separate worktree for isolation and one database-owning application process at a time.
- Non-test PGlite initialization can add two public demo articles and a protected demo article. Those rows, dates, metrics, images and author credentials are fixtures, not approved business evidence.
- Local `MEDIA_STORAGE=disk` writes `.data/media`; durable hosted media needs the configured storage service. Local disk URLs do not become hosted production assets by committing the post.
- Use the repository's temporary seed procedure only for an isolated local test account. Revoke the account when testing ends. Do not reuse production credentials.

## 3. Prepare a publication package

Keep editorial research separate from the public article body. Prepare:

1. A distinct, useful topic and stable lowercase hyphenated slug. Search existing CMS posts and the 40 archived packages first. The 0DTE subject already overlaps `spx-0dte-options-gamma-exposure-guide` and `zero-dte-risk-management-and-position-sizing-rules`; choose the intended relationship before creating another pillar.
2. A visible H1 title, concise excerpt, body HTML, source ledger, author, primary category, tags and optional related articles.
3. A short `metaTitle` and unique `metaDescription`. **Use 30–33 raw title characters and 140–155 description characters** to satisfy the intersection of current house rules and CMS limits. The CMS permits raw titles up to 60 and conditionally omits the brand suffix; do not confuse that permissiveness with the stricter house convention. `metaDescription` at 156–158 characters is rejected by the CMS schema even though the marketing standard permits that range.
4. Original, finalized cover/body graphics with alt text, dimensions, captions and provenance. Label hypothetical figures visibly. Match alt text and captions to the actual image, not to the image you intend to create later.
5. A claim ledger: exact claim, primary URL, source publication/as-of date, retrieval date, relevant passage or calculation, and reviewer. Verify financial, tax, regulatory and broker-specific statements at the time of publication. A link's existence alone does not verify the claim.

Do not invent author credentials, live desk routines, performance results, probabilities, publication dates or market data. Do not promise search positions. A `site:` query cannot establish a complete indexed-page count; see [Google's limitations](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site).

## 4. Prepare supported article HTML

The CMS stores **HTML**, not Markdown, MDX or Svelte. The [TipTap extension registry](src/lib/tiptap/index.ts) and [sanitizer](src/lib/sanitize-post-html.ts) define supported content.

- Start with prose or an H2. The template already renders the H1, excerpt, author, publication date and cover. Do not paste a second article title or cover at the start of the body.
- Use H2 sections and H3 subsections in order. [Heading normalization](src/lib/shared/seo/toc.ts) assigns stable unique IDs and derives the TOC. Review the saved result; hand-written IDs are stripped by sanitization.
- The shared article template renders a nested, collapsible TOC for enabled posts with at least three headings at viewport widths of 1180px and above. It is hidden below that width. Do not paste a manual TOC into article content; verify heading links, keyboard disclosure and desktop/mobile visibility in the saved post.
- Use real `<a href>` links, paragraphs, lists, blockquotes, figures and semantic tables. For wide tables, use an allowed `<div class="table-scroll">` wrapper and test it on mobile. Do not paste `<head>`, scripts, styles, Svelte components or metadata into the body.
- There is no registered math renderer. Replace LaTeX such as `$$\\frac{700}{1000}$$` with readable text, e.g. `700 / (700 + 300) = 70%`, or a verified accessible graphic with equivalent text.
- Store FAQs in the editor's FAQ fields as plain question/answer strings. The article template renders native `<details>`. Pasted body `<details>/<summary>` wrappers are stripped; FAQPage JSON-LD is prohibited by project policy.
- Server transforms remove a duplicate leading title heading, inject known media dimensions/alt text, replace em/en dashes, sanitize content and autofill blank metadata. Review that output; do not rely on automatic copy changes to preserve financial meaning.

The public template adds a service CTA, FAQs, author box, sharing, previous/next and related posts, then the shared footer. Account for those when writing body CTAs; avoid repeated boilerplate. The template's indicator CTA still points into the gated store, a recorded launch concern.

Some saved controls do not have a public implementation yet: alternate templates/post formats, comments/pingbacks, co-authors, translation linkage and series ordering are persisted fields, but the current public article does not implement those features. Keep the default template/format and English content; do not promise a comment area, extra author bylines or localized pages because a field can be saved. Subtitle, the series-name badge and TOC visibility are implemented through the editor's internal custom fields. The article graph currently hardcodes `en-US`.

Featured, pillar and sticky have distinct effects. Only one undeleted published post can be featured; publishing another featured post demotes the previous one. Sticky affects list ordering; pillar adds the cornerstone badge and currently selects Article schema. Manual related posts are public-filtered and capped at three; with none selected, the fallback ranks up to 40 recent candidates by shared tags, category and a hardcoded priority-slug bonus. See `services/posts.ts:1469` and `db/save-post.ts:158`.

## 5. Upload real media before publishing

Use **Media Library → Upload Files**, or the editor's image upload/paste/drop workflow. Set the media item's descriptive alt text and caption, then select the real stored item for both cover and inline use. The editor's **Featured Image → Choose from Media Library** populates the cover fields; it does not generate the image.

Evidence: [upload endpoint](src/routes/api/media/upload/+server.ts), [media service](src/lib/server/services/media.ts), [image picker](src/lib/components/admin/post-editor/image-pick.ts), [cover variants](src/lib/shared/cover-srcset.ts), [cover crops](src/lib/shared/cover-crops.ts).

The raster pipeline stores encoded files/variants and cover crops. Use the URLs and dimensions returned by storage; never invent `-480w`, `-800w`, `-1200w` or crop URLs. Verify each response's MIME type, decodability and actual appearance.

**`/images/blog/<anything>.webp` is not proof that a real image exists.** The placeholder endpoint returns an SVG with HTTP 200 even for arbitrary missing filenames. The source probe demonstrated a **100/100 publishable score with nonexistent placeholder cover/body URLs**. Inspect the returned bytes and image itself. An imported media row with `sizeBytes = 0` is a placeholder specification.

The article cover uses eager loading and high fetch priority. Body images are made lazy and asynchronous; dimensions are obtained from known media or explicit HTML attributes. Verify the actual saved public HTML. Do not place a second above-the-fold hero inside the lazy-loaded body.

## 6. Create and save through the CMS

1. Sign in through `/admin/login` with the authorized admin account for the selected environment.
2. Open `/admin/posts/new`. Set title and inspect the automatically generated slug before saving. Slugs are 3–75 characters, lowercase letters/numbers with single hyphens, with reserved names rejected. The SEO target is at most 70 characters.
3. In the body editor, switch to **HTML Source** to enter prepared HTML, or use the visual editor. Do not paste the entire research package. Switch back and inspect tables, links, figures and headings.
4. Select a real author, primary category and tags. IDs are environment-specific; obtain them from the current editor/server response. Never hardcode IDs copied from another database. Use at least one tag; two meaningful tags avoid the single-tag warning.
5. Set the cover from the media library, then fill SEO/social fields deliberately. Leave the canonical override blank for normal first-party posts so the canonical derives from the site origin and slug. Do not enter localhost, staging or an unverified cross-domain canonical.
6. Keep `status = draft`. Use **Save Draft**, reload, and confirm body, metadata, taxonomy, cover, alt text and image URLs survived the save.
7. Use the signed draft preview produced by the editor. Inspect the page as a reader. Draft previews must be noindex/no-store; never publish their token in a public document, issue or link map.

Evidence: [PostEditor](src/lib/components/admin/PostEditor.svelte), [form/payload helpers](src/lib/components/admin/post-editor/form-actions.ts), [remote functions](src/routes/admin/posts/posts.remote.ts), [post service](src/lib/server/services/posts.ts).

Autosave is not a full save: it snapshots title/body/excerpt into revisions and does not persist every sidebar field. Background autosave starts after a post has an ID; manual saving is required for a new draft. At most 20 autosave revisions are retained. Signed previews can show a newer autosave's title/body/excerpt over the saved record, so reload and compare the final saved version before release.

## 7. Programmatic authoring uses the same service

The proposed [blog intake automation plan](docs/blog/AUTOMATION_PLAN.md) defines a shared validator, one-package draft importer, preview report and later publication hardening. Those tools are **not implemented yet**; use the existing CMS/API workflow below until the guide is updated with verified commands.

**Do not add each new title to a JSON-LD file.** The article loader supplies the saved post data to `buildBlogPostJsonLd` in `src/lib/seo/blog-seo.ts`; the builder derives the headline, author, dates and media. Save the content fields and verify the generated graph. Change a shared builder only when changing the schema behavior, with its corresponding tests.

For automation, prefer an authorized authenticated request to the existing REST API, or a controlled server-side call to `createPost`/`updatePost`/`patchPost`. Do not write SQL inserts as the normal publishing workflow.

| Operation        | Existing endpoint                                   | Important behavior                                                                         |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| List/get         | `GET /api/admin/posts`, `GET /api/admin/posts/<id>` | Admin session required                                                                     |
| Create draft     | `POST /api/admin/posts`                             | JSON input validated by `postCreateSchema`; returns `{ post }`                             |
| Full replacement | `PUT /api/admin/posts/<id>`                         | Supply current taxonomy/related arrays; omitted arrays default to empty and replace pivots |
| Partial update   | `PATCH /api/admin/posts/<id>`                       | Omitted arrays remain intact; include `expectedUpdatedAt` to detect stale writes           |
| Trash            | `DELETE /api/admin/posts/<id>`                      | Removes from public reads; do not use permanent deletion for routine corrections           |

Use the [input schemas](src/lib/shared/schemas/posts.ts), not database column names, to construct the payload. Important shapes:

```ts
// Illustrative field shapes, not an executable publish script.
// Resolve authorId/categoryId/tagIds and media URLs from the target CMS.
{
	title: '0DTE SPX Options Strategy Guide',
	slug: '0dte-spx-options-strategy-guide',
	content: verifiedBodyHtml,
	excerpt: reviewedExcerpt,
	metaTitle: '0DTE SPX Options Strategy Guide',
	metaDescription: reviewedDescription, // 140–155 chars
	authorId,
	categoryId,
	categoryIds: [categoryId],
	tagIds,
	relatedPostIds: [],
	coverImage: uploadedCoverUrl,
	coverImageAlt: reviewedCoverAlt,
	focusKeyword: '0DTE SPX options strategy',
	secondaryKeywords: JSON.stringify(['SPX settlement', 'defined-risk spreads']),
	faqItems: JSON.stringify(reviewedQuestionAnswerPairs),
	schemaType: 'BlogPosting',
	status: 'draft',
	visibility: 'public',
	robotsNoindex: false,
	isFixture: false
}
```

JSON-bearing fields such as `faqItems` and `secondaryKeywords` are strings containing JSON; taxonomy IDs are number arrays. Advanced editor fields use `customFields` as a JSON array of `{ key, value }` strings. Do not add a custom JSON-LD block for an ordinary article. Avoid `forceOverwrite`; a stale-write response requires reviewing the current version first.

## 8. The old Markdown importer is a special-purpose tool

[scripts/import-markdown-posts.ts](scripts/import-markdown-posts.ts) reads only `content/blog-posts/blog-post-<digits>-<slug>.md`. It expects the existing archive's exact package structure:

1. A metadata table with backtick-labelled fields and backtick-delimited values (`title`, `slug`, `metaTitle`, `metaDescription`, `excerpt`, `focusKeyword`, `secondaryKeywords`, `category`, `tags`, `schemaType`).
2. `## 2.` image specifications with `### 2.<number>` subsections and `src`, `alt_text`, `title`, `caption`, `image_description` fields. The first image is treated as the cover.
3. The **first fenced `html` block** as the body. It does not convert ordinary Markdown prose into HTML.
4. FAQ data in the JSON block under `## 5.`. It can extract questions from legacy FAQPage packages, but public schema must still follow current policy.

Verified non-writing inspection:

```bash
pnpm db:import-posts --dry-run
```

This audit returned **40 parsed bodies and 201 image placeholders**. That count does not verify factual accuracy, real image existence or publish readiness.

**Do not use this importer to update approved live posts.** Its non-dry run loops over all matching files, directly upserts post/media/taxonomy rows, defaults posts to draft, clears publication dates in draft mode, replaces tag/category pivots and advances content modification dates. It deletes the synthetic protected demo post. It bypasses the normal publish gate, revision creation, audit/cache/redirect lifecycle and per-post transaction. `--publish` changes all matching imports to published without those protections. There is no CLI single-file or custom-directory option. The exported function has a `dir` option; the CLI does not parse one.

For a new format such as `blogs/0DTE-spx-options-strategy.md`, convert approved content into a CMS draft through §6/§7. If a reusable importer is needed, implement and test explicit file selection, parse validation, dry-run diffs, service-layer saves and collision handling first. Do not silently broaden the legacy importer.

## 9. Understand the publish gate and its limits

The server evaluates the final transformed/autofilled payload. A post must score **at least 80/100 and have zero blocking issues**. See [score.ts](src/lib/shared/seo/score.ts) and [meta-budget.ts](src/lib/shared/seo/meta-budget.ts).

Blocking checks include missing meta title/description, a lowercase initial meta-title letter, no cover or OG image, cover alt missing/equal to the title, no author/category/tag, fewer than 300 body words, no external authority domain, the exact unresolved-placeholder sentinel, and em/en dashes left in checked fields. One authority domain is a nonblocking penalty; two distinct domains avoid it. FAQs are a scoring recommendation, not permission to emit FAQ schema.

The gate runs on published/scheduled creation, transitions into published, and scheduled saves. **It does not re-gate edits to already-published posts.** Continue the full editorial/media checks on every live edit.

A green score does not prove image existence, source credibility, mathematical correctness, claim accuracy, originality, author credentials, successful delivery, good mobile layout or actual indexing. The placeholder probe, nested-schema probe and browser screenshots in this audit demonstrate these limits.

## 10. Publishing, scheduling and correction behavior

After review, use **Publish** or **Schedule**. The current sidebar uses the browser's detected time zone and converts its local datetime input to an ISO instant. Confirm that label explicitly; do not assume New York time. Programmatic timestamps must include `Z` or a numeric offset even though the current schema incorrectly accepts offsetless dates. This is a documented repair item, not an endorsed API behavior.

Public reads include published posts and due scheduled posts, provided they are not expired, trashed or fixtures. Public lists/feed additionally require public visibility and `robotsNoindex = false`. `published` is a legacy boolean; the read predicate uses lifecycle status and timestamps. Password-protected content requires unlock and stays private/noindex; members visibility currently returns 403 to non-admins and is not a complete paid-member access system.

The scheduled/expiry sweep lives at `/api/cron/publish-scheduled`, requires the configured cron secret, and is declared in `vercel.json`. Due scheduled posts can become readable before the sweep, so verify both read-time visibility and the eventual publication timestamp. Do not promise a fixed hosted publishing/cache propagation time without measurement.

Manual first publish assigns the actual publication time. Meaningful changes to title/body/excerpt/cover advance `contentUpdatedAt`; metadata-only writes do not. The service supports `minorEdit` on full updates for small corrections; the ordinary editor payload does not currently expose it. Do not forge a date to match a research brief.

Renaming a previously published slug through the service creates/repoints redirects and rewrites stored internal links transactionally. Verify the old URL and new URL afterward. Trashed posts return 404; restoring from Trash returns them to **draft** and requires explicit republication. Historical instructions saying restore keeps a post live are stale.

## 11. Verify the saved result

Run the Svelte MCP `svelte-autofixer` on every Svelte component/module you analyze or change, targeting the installed version. Fetch relevant official Svelte documentation and inspect suggestions manually. Compiler analysis cannot validate HTML strings stored in the CMS or the financial content.

For application changes, use the existing gates; do not replace the complete build with the Vite+ built-in:

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

Authenticated E2E needs the isolated seeded account described in `docs/VITE_PLUS_WORKFLOW.md`; skipped admin tests do not validate publishing. Avoid competing builds/previews using the same PGlite file or port. For content-only CMS changes, the essential proof is the actual target preview/public response; repository tests use their own fixtures and cannot certify a different hosted database's article.

Against `pnpm preview --port 4173`, verify:

- Draft public URL 404; signed preview noindex/no-store; published URL 200. Protected bodies must be absent from locked HTML and serialized page data.
- One title/description/robots tag, one H1, one unified JSON-LD graph; DOM breadcrumbs equal schema names/positions. Canonical absent while gated; after an authorized launch, canonical must use the production origin and strip tracking queries.
- Real author and visible dates agree with the schema. Use the existing `SEO.svelte` wrapper; do not paste the brief's raw `<script>` or add another metadata system. Note the current founder-ID discrepancy in the audit before changing author builders.
- Every cover/body/variant URL decodes to the intended graphic, has matching alt/caption/dimensions, and uses self-hosted fonts where relevant. Inspect image bytes rather than just HTTP 200.
- All internal/outbound citations and CTAs resolve and support the associated claims. Test TOC anchors and disclosure, search, category/tag pages, sharing and responsive layouts at 320/375/768/1179/1180/1440 widths.
- RSS contains the correct live public content and no private content. The blog indexing launch is live; eligible published posts appear in the generated sitemap, while protected, excluded and thin archive content remains restricted. Verify actual sitemap entries and public canonical/indexing directives. `docs/seo/audit/02-inventory.json` contains deterministic local test fixtures; `urls.md` and the release crawl record describe production URLs.
- Errors have the expected status. Slug redirects resolve directly to the live target; malformed/out-of-range pagination returns 404.

Cache invalidation currently records tags but has **no registered CDN purger**. Article/list/sitemap headers use 300 seconds plus 60 seconds stale revalidation; RSS uses 3600 plus 60. Outage behavior can retain stale responses longer. These are configured headers, not measured hosted freshness guarantees. Read [FRESHNESS.md](docs/blog/FRESHNESS.md) before promising immediate unpublish or update visibility.

## 12. Handoff

Record the final slug/post ID/environment, approved sources, actual media URLs, actual publication time, tests with results/skips, preview evidence and remaining blockers. Update `CHANGELOG.md` under Unreleased and finish the coordination claim. Update the temporary registry only if creating/removing a temporary mechanism.

Do not remove launch protection, deploy, mass-import, retire old public URLs or claim production/Search Console verification as a side effect of adding an article. Those are separate actions with their own evidence and authorization.

## 12. First reviewed article example

The [0DTE SPX package](content/articles/0dte-spx-options-strategy-guide/README.md) shows the separation between source research, corrected CMS body, environment-independent metadata, plain FAQs, encoded graphics and a claim ledger. The owner selected `blogs/first-blog.md`; its original bytes remain intact. Follow the package's actual upload/save mapping and [acceptance evidence](docs/reviews/first-blog-2026-11-05/VERIFICATION.md), rather than posting the entire source brief or treating the package JSON as a ready REST request. A `MediaItem` upload response exposes `urls.original` and `available_sizes`; `blobUrl` and `variantsJson` are database-row fields.

CMS HTML has no Svelte scope classes. The shared article template applies `overflow-x: auto` to `.table-scroll` through `:global` so wide semantic comparison tables remain inside the reading column. Code blocks already scroll independently. Check real rich content at narrow widths; short paragraph fixtures did not reveal the original table overflow.

## 13. First hosted publication: verified operating facts

The first package is now [published](https://www.revolutiontradingpros.com/blog/0dte-spx-options-strategy-guide) as Production post 1, explicitly approved by the owner after verification. See [actual state](docs/reviews/first-blog-2026-11-05/production.json) and [acceptance](docs/reviews/first-blog-2026-11-05/VERIFICATION.md). The preserved package’s `status: draft` describes its intake request, not a command to revert the live record. Always inspect the current CMS record and `expectedUpdatedAt` before updating it.

Production media uses the public, Production-only Blob store described in `docs/MEDIA_STORAGE.md`. The normal upload pipeline supplied all saved URLs, width variants and cover crops; no static filename guesses or placeholder media rows were used. The controlled first-publication operator called existing services, with a private per-post retry receipt and exact-body/concurrency guards. It is not a new supported generic importer. No admin account was provisioned as a side effect.

Sensitive Vercel exports can contain masked values. A nonempty string is not evidence of a usable preview secret. Prefer the authenticated CMS/editor, which signs previews on the server. An authorized operator needs genuine private signing material; never use a masked export or a development fallback. The first setup provisioned a fresh Production preview key only after confirming no protected/trashed posts. Do not repeat key changes for routine new articles. Keep tokens and private environment files outside tracked evidence. The first operator’s SvelteKit dev runner also generated `.svelte-kit/generated/dev/env/config.js` containing private environment values; that ignored generated file was removed after use and the remaining artifacts/public HTML were scanned. Check generated operator artifacts as well as the original environment file when cleaning up trusted CLI work.

Automatic hosted CDN purging remains unimplemented. For this publication, the operator explicitly deleted cached content with the existing Vercel CLI tags `blog-lists`, `blog-feed`, `blog-sitemap` and `blog-post:0dte-spx-options-strategy-guide`, then measured the public responses. That manual result does not complete the automation plan or prove future propagation time. Preserve the existing pnpm/Vite+ commands for code verification and verify actual target CMS content separately.
