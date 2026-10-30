# IMPLEMENTATION PROMPT: Production blog editor + blog system (port from tx-360)

You are implementing a complete blog authoring and publishing system in THIS repository. It is a port of a system that already runs in production in another repo ("tx-360", a SvelteKit marketing site with an admin CMS). Everything below was audited from that source code with file and line evidence. Your job is to reproduce the strengths, and fix the listed defects instead of copying them.

## 0. Operating rules (read first, obey throughout)

1. **Zero assumptions about THIS repo.** Before writing anything, read it: `package.json`, framework version, ORM, auth, CSS approach, icon library, test setup, existing admin layout, existing `$lib/server` conventions. Then write a short "Adaptation map" (a table: tx-360 concept -> this repo's equivalent, or "missing, I will create it"). Do not invent files that you have not looked for. Where this prompt names a library and this repo already uses a different one for the same job, use this repo's one and say so.
2. **Read before write.** Never edit a file you have not read in this session.
3. **Evidence over memory.** Every library API you use (TipTap 3, sanitize-html, Svelte 5 runes, SvelteKit remote functions, Drizzle, sharp, Vercel Blob, Shiki) must be checked against installed source or current docs, not recalled. If the Svelte MCP is available, call `list-sections`, then `get-documentation` for every relevant section, write the code, then run `svelte-autofixer` on every `.svelte` and `.svelte.ts` file until clean. If the rust or other MCPs are irrelevant, ignore them.
4. **Phase it.** Ship in the phases in section 14, each as its own commit set, each ending green. Do not start phase N+1 until phase N passes its checks. Test what changed, not the whole suite each time; run the full gate once before the final push.
5. **Honest data.** No fabricated posts, authors, metrics or screenshots. Seed only clearly labelled fixtures flagged `is_fixture = true` and excluded from every public query.
6. **No silent failures.** No empty `catch {}`, no swallowed promise rejections. Every failure either shows a visible message or is logged with context. (The source system violated this in several places; they are listed as defects in section 13.)
7. **No em dashes or en dashes** in any user-visible string, UI text, seed copy or generated content. Use commas, colons, parentheses, or the word "to" for ranges. Enforce with a lint rule and a server-side transform (section 7.4).
8. **Svelte 5 runes only.** `$props`, `$state`, `$derived`, `$effect`, snippets. No `export let`, no `$:`, no slots, no `createEventDispatcher`. Use `$state.raw` for large objects that are only ever replaced wholesale.
9. **Accessibility is a requirement, not polish.** Every control has an accessible name, toggles use `aria-pressed`, disclosures use `aria-expanded` plus `aria-controls`, dialogs use `aria-modal` plus a focus trap plus Escape, status changes are announced through a live region.
10. **If something in this prompt is ambiguous or conflicts with the repo, stop and ask one targeted question.** Do not guess.

## 1. Goal and scope

Build, end to end:

- An **admin post editor** (rich text, SEO panel, social panel, FAQ panel, publish box, taxonomy, media picker, revisions, autosave, keyboard shortcuts, unsaved-changes guard).
- A **media library** (upload pipeline, variants, metadata, picker modal, full page).
- A **server layer** (schema, services, publish gate, content transforms, revisions, slug rename redirects, scheduled publishing cron, caching).
- A **public blog** (index, post page, category and tag pages, TOC, related posts, JSON-LD, RSS, sitemap, password-protected posts).
- **Tests** at unit, server, component and e2e level, including a prose parity check between the editor canvas and the public render.

Out of scope unless the repo already has them: comments UI, member auth, i18n, series UI, co-author UI. The data model reserves columns for some of these (section 5); do not build their UI.

## 2. Target stack (verify against this repo, adapt where it differs)

| Layer             | Source system used                                                                      | Notes                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Framework         | SvelteKit 3 + Svelte 5 runes, TypeScript                                                | Runes mode compiler option on                                           |
| Editor            | TipTap 3 (`^3.32.0`), HTML string in and out                                            | Not JSON                                                                |
| Sanitizer         | `sanitize-html`, one shared config                                                      | Used on server write, server read, editor paste, HTML source mode       |
| DB                | Postgres (Neon HTTP driver) + Drizzle                                                   | Source used `neon-http`, which has no interactive transactions; see 5.5 |
| Validation        | Zod 4                                                                                   | Schemas live in a shared (client + server) folder                       |
| Images            | `sharp`, Vercel Blob (`@vercel/blob`)                                                   |                                                                         |
| Code highlighting | Shiki, server side at render time                                                       | Theme `github-dark`                                                     |
| Icons             | `phosphor-svelte`, per-icon imports                                                     |                                                                         |
| CSS               | Hand-authored, design tokens, cascade layers                                            | No utility framework                                                    |
| Tests             | Vitest (jsdom client config, node server config), `@testing-library/svelte`, Playwright |                                                                         |
| Hosting           | Vercel serverless, cron                                                                 |                                                                         |

If this repo differs (different ORM, host, storage), keep every behavioural contract below and swap the plumbing.

## 3. Architecture

### 3.1 Routes

- Admin posts is **one route** with five in-page views: Posts, Trash, Authors, Categories, Tags. The editor is a lazy-loaded component (`await import(...)`) with a spinner and a visible failure fallback ("Failed to load editor", with retry).
  - Improvement over source: make the editor **URL-addressable** (`/admin/posts/new`, `/admin/posts/[id]`). The source kept it as in-page state, so a reload dropped the user back to the list. If you do this, the unsaved-changes guard must still work (section 8.6).
- Admin pages load posts, trashed posts, authors, categories, tags in parallel, each with a 15 second timeout wrapper and a visible error state.
- Mutations use typed server RPC (SvelteKit remote functions or this repo's equivalent), each starting with an admin authorization check. Keep a thin REST layer only if this repo needs one; if you build REST, it must share the same service functions and the same error mapping as the RPC layer (the source had two diverging implementations of the SEO-gate error mapping, and the REST one lacked duplicate-slug mapping).
- Public routes: `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`, `/blog/+error.svelte`, `/rss.xml`, `/sitemap.xml`, `/blogs` (301 to `/blog`).

### 3.2 Server code layout

- `src/lib/server/services/posts.ts` (create, update, quick update, autosave, revisions, trash, restore, lists), `categories.ts`, `tags.ts`, `authors.ts`, `media.ts`
- `src/lib/server/posts/` (`visibility.ts`, `cache.ts`, `highlight.ts`)
- `src/lib/server/db/save-post.ts` (atomic post save plus redirect writes)
- `src/lib/shared/schemas/*.ts` (Zod)
- `src/lib/shared/seo/` (`score.ts`, `content-transform.ts`, `autofill.ts`, `meta-budget.ts`, `slug.ts`, `taxonomy.ts`, `rss.ts`)
- `src/lib/sanitize-post-html.ts`
- `src/lib/tiptap/` (custom extensions)
- `src/lib/components/admin/` (editor UI), `src/lib/components/blog/` (public components)

## 4. UI specification: the post editor

Component tree: `PostEditor` (state owner) -> `PostEditorTopBar`, `PostEditorMainColumn`, `PostEditorSidebar`, plus panels. A pure helper module `post-editor/form-actions.ts` holds `PostFormState`, `createEmptyForm()`, `buildPostPayload()`, `hydrateFromFullPost()`, `canonicalFieldsAfterSave()`, `attachEditorShortcuts()`, `attachBeforeUnloadGuard()`. Keep this split so the logic is unit-testable without rendering.

### 4.1 Layout

- Two-column grid: `minmax(0, 1fr)` main, `minmax(280px, 320px)` sidebar. Collapse to one column at 960px. Extra tweaks at 768px and 640px. The top bar must wrap rather than overflow on a 393px-wide phone.
- **Improvement:** when collapsed to one column, keep a sticky bottom action bar with Save and Publish. In the source, the Publish box dropped below all content on mobile and only the top bar Save remained.
- Do not set `container-type` unless a `@container` query uses it (the source set it and never used it).

### 4.2 Main column (top to bottom)

1. **Title**: `#post-title`, sr-only label "Post Title", placeholder "Add title".
2. **Permalink/slug**: input `#post-slug`, `aria-label="Post slug"`, `maxlength=75`, live counter `n/75`, amber outside 3 to 75. **Always render the input** (defect in source: `{#if slug}` made the field vanish when emptied). Normalise on typing with a light normaliser, and on blur and save with the full one (section 7.3).
3. **Add Media** button (cover image picker).
4. **Rich text editor** (section 6) with a live word count under `data-testid="post-body-word-count"`.
5. **Excerpt**: textarea, 3 rows, counter `n/160`, amber over 160. The 160 limit is **soft** and not enforced by validation.
6. **Focus keyword**: ONE input only. (Source had two inputs bound to the same state, one in a misnamed "Slug & Focus Keyword" box and one in the SEO panel. Keep the SEO panel one.)
7. **Collapsible panels**, one open at a time: SEO, Social (Twitter), FAQ, Advanced, Readability. Use real disclosures exactly as the source does: an `<h3>` containing a `<button aria-expanded aria-controls>`, with panel bodies kept in the DOM and hidden via `hidden` (not an ARIA tablist). The source already does this in both the main column and the sidebar; keep it. Persistence uses TWO keys with different roles: `wp-editor-panels` stores the open state of the eight SIDEBAR panels only (publish, author, categories, featuredImage, tags, postAttributes, toc, customFields; defaults: first six open, toc and customFields closed), and `wp-editor-active-tab` stores the single open MAIN-COLUMN panel, validated against the known list (`content, seo, faq, twitter, advanced, readability`; `content` means all metaboxes collapsed). Source bug: only NEW posts read the stored tab, existing posts always open on `content` because `loadFullPost` never calls `loadActiveTab()`. REQUIREMENT: open every post, new or existing, on the stored tab, falling back to `content` only when the stored value is missing or invalid.

### 4.3 SEO panel

- Score gauge: class `good` at 80 and above, `warning` 50 to 79, `bad` below 50. Labels: "Excellent", "Needs Work", "Poor". If no issues: "All checks passed!". Below the gauge, a plain list of issue messages (source: a `<ul>` of strings with no icons or severities; REQUIREMENT here: add severity icons plus text, never colour alone, and surface blocking issues first). **Use one set of thresholds everywhere**: the panel badge in the collapsed header used 70 in the source while the gauge used 50/80 and the gate 80. Use 80 as the single "good" line and derive the badge from the same function.
- Inputs: Meta Title, Meta Description, Google search preview (title, `host › blog › slug` line, description), OG Image, Canonical URL, Secondary Keywords (chip input: comma or Enter commits, Backspace on empty removes last chip, blur commits, case-insensitive de-dupe), OG Title, OG Description, `noindex` and `nofollow` checkboxes, Schema Type select (Article, BlogPosting, NewsArticle, HowTo).
- Meta title counter measures the **rendered** title: the brand suffix `" | <Brand>"` is appended only if the total stays within 60 characters. Show `n/60 rendered` and an informational (not warning) note when the brand is dropped.
- Meta title **follows the post title** until the operator edits it (track the last copied value in a plain, non-reactive variable). A loaded existing post resets this tracker so an existing meta title is never overwritten.
- Score recompute: derive with `$derived`, but **debounce** or schedule for idle (source recomputed on every keystroke; the word count likewise).

### 4.4 Social panel

Twitter card type (`summary`, `summary_large_image`), Twitter title (max 70), Twitter description (max 200), Twitter image, and a preview card.

### 4.5 FAQ panel

Rows of question input and answer textarea with add and remove. Helper text: FAQ rich results are retired by Google, so the markup is emitted for other engines; advise 3 or more items with answers over 40 characters (source copy: aim for 3 or more; FAQ rich results retired May 2026, markup still emitted for Bing Copilot, and visible Q&A still helps AI answer surfaces). Key rows with a WeakMap (not by index) so removal does not shift focus state. Stored as a JSON string.

### 4.6 Advanced panel

Pingbacks checkbox. Revision list (section 8.5).

### 4.7 Sidebar panels (each collapsible, state persisted)

- **Publish box**: section 8.3.
- **Author**: `<select>` with a visible `<label>` (source had none), plus inline "Add New Author" (name only; slug generated).
- **Categories**: multi-select checkboxes, "Set as primary", `Primary` label. Rules: first selected becomes primary; unchecking the primary promotes the first remaining; none selected gives `null`. Inline add accepts a comma list; existing names are reused case-insensitively; more than 2 brand-new names triggers a confirm. **Do not offer global category deletion from inside the post editor** (the source did, which destroys the category for every post).
- **Featured image**: cover image, alt text, caption. `<img>` has `width=1200 height=675` and lazy loading. "Remove" clears image, alt and caption. "Replace image" only opens the picker; on selection the chosen media item's image, alt (`alt_text || ''`) and caption (`caption || ''`) overwrite the three fields, and `ogImage` is set only if it was empty. Cancelling the picker changes nothing.
- **Tags**: chips with remove "x" buttons, available tags as "+ name" buttons, inline add (Enter or Add), "No tags yet" empty state. **Dedupe tag ids** before sending.
- **Post attributes**: Post Format (standard, aside, image, link, quote, status, video, audio, gallery, chat), Template (default, full_width, sidebar_left, sidebar_right, landing), checkboxes: Featured, Pillar Content, Sticky, Comments. Every control labelled.
- **Table of contents**: derived from h1 to h6 of the content using the SAME shared heading-id function as the public renderer (section 10.3), so ids always match (source: positional `heading-N` ids; the editor panel already skips empty headings and the public side drops a leading title-duplicate heading, so they can diverge today), "Copy MD" button that handles clipboard failure with a toast.
- **Custom fields**: key and value rows with a count badge.

### 4.8 Top bar

Source top bar: Back button, page title ("Edit Post" or "Add New Post"), dirty dot, autosave status, and a Save (new post) or Update (existing post) button. The Preview link is NOT in the top bar: in the source it sits in the Publish box and shows only when the post is published. REQUIREMENTS here: the dirty dot gets a real text alternative (source: `title` only) and the status text sits in a `role="status"` live region.

- The source ALREADY reserves a fixed-height slot (about 3.5rem) for the autosave failure banner, and the banner is already `role="alert"` with the last successful save time and a Retry button. Keep both as is.
- Autosave status text: add a `role="status"` live region (missing in the source).
- **Naming**: one verb for one behaviour. In the source "Update" in the top bar saved and stayed, while "Update" in the Publish box saved and closed, and the latter carried a misleading `title="Save (⌘S)"`. Use: top bar "Save" (stay), Publish box "Publish" or "Update and close" (close), and make tooltips match real shortcuts.

### 4.9 Form state model (rune rules)

- `form = $state(createEmptyForm())` deep proxy mutated through `bind:` is acceptable here because panels mutate nested objects (FAQ rows, custom fields).
- `revisionsData`, `diffRevision`, `panelState` are replaced wholesale: use `$state.raw`.
- Plain `let` (non-reactive) for: `disposed`, `loadGeneration` (stale-response guard), `autosaveTimer`, `leaveConfirmed`, `leavePrompt`, `metaTitleCopiedFrom`.
- **Do not reassign a prop locally.** The source reassigned `editingPost` after an in-place create, relying on Svelte keeping the override until the parent changes. Instead, expose an `onCreated(post)` callback so the parent owns the id, or hold the id in the editor's own state.
- Dirty tracking: set explicitly from handlers, and after a save compare a serialised snapshot of `{form, postFormat, customFields}` taken before the request with the current one; if they differ the post is still dirty (so edits typed during an in-flight save are not lost or overwritten).
- Never adopt the server's saved row over text the user typed while the save was in flight.
- Adopt server-rewritten fields (title, slug, content, excerpt, meta, OG, Twitter, FAQ) after a save **only when the field was non-blank** and nothing changed since, so server-side autofill defaults do not become frozen user values.

### 4.10 New-post scaffold

`createEmptyForm().content` is a non-empty scaffold (Key Takeaways list, definition heading, body headings, FAQ reminder) so the "content cannot be empty" check never triggers on an untouched post. **Improvements:** make the scaffold generic (no locality-specific copy), mark placeholders with a sentinel string that the publish gate detects (section 7.6; the source's sentinel is the literal text `IMAGE PLACEHOLDER (replace with a real image before publishing)`), and do not count an untouched scaffold as dirty.

## 5. Data model (Postgres + Drizzle)

Use `timestamptz` for every timestamp in this port. (The source used `timestamp` without time zone on content tables, which caused ambiguity for direct API callers.) Forward-only, idempotent migrations (`IF NOT EXISTS`). Never edit a shipped migration.

### 5.1 Tables

**authors**: `id` serial PK; `name` text NOT NULL; `slug` varchar(255) NOT NULL UNIQUE; `email`, `bio`, `short_bio`, `job_title`, `company`, `credentials`, `expertise` text; `years_experience` int; `linkedin`, `twitter`, `website`, `avatar`, `avatar_alt` text; `is_active` bool default true; timestamps. Index on `is_active`.

**categories**: `id`; `name`; `slug` varchar(255) UNIQUE; `description`, `meta_title`, `meta_description`, `pillar_content`, `icon`, `color`, `image`, `image_alt` text; `parent_id` int **with a self-referencing FK** (source had none, so no cycle protection); `sort_order` int default 0; `is_active` bool default true; timestamps. Index on `parent_id`.

**tags**: `id`; `name`; `slug` varchar(255) UNIQUE; `description`; `created_at`; add `updated_at`.

**posts**:

- Content: `id`, `title` NOT NULL, `slug` varchar(255) NOT NULL UNIQUE, `excerpt`, `content` NOT NULL, `author_id` FK, `co_author_ids` text (JSON array, reserved), `category_id` FK (primary category).
- Cover: `cover_image`, `cover_image_alt`, `cover_image_caption`.
- SEO: `meta_title`, `meta_description`, `og_title`, `og_description`, `og_image`, `canonical_url`, `focus_keyword`, `secondary_keywords` (JSON), `robots_noindex` bool false, `robots_nofollow` bool false, `schema_type` default `BlogPosting`.
- Twitter: `twitter_card_type` default `summary_large_image`, `twitter_title`, `twitter_description`, `twitter_image`.
- Derived: `reading_time` int, `word_count` int, `table_of_contents` text (JSON), `faq_items` text (JSON).
- State: `status` varchar(32) default `'draft'` **NOT NULL with a CHECK** limiting it to `draft, review, scheduled, published, archived` (source: nullable, no check); `visibility` default `'public'` with a CHECK for `public, members, password_protected`; `published` bool (legacy mirror) with `CHECK ((status = 'published') = published)`; `password` text; `template`, `post_format`, `custom_fields`.
- Flags: `featured`, `is_pillar`, `is_sticky` bool false; `comments_enabled` true; `pingbacks_enabled` false.
- Reserved: `language` default `'en'`, `translation_of_id`, `series_id`, `series_order`.
- `is_fixture` bool NOT NULL default false.
- Timestamps: `created_at`, `updated_at`, `content_updated_at`, `published_at`, `scheduled_at`, `expires_at`, `deleted_at`.
- Indexes: `(deleted_at, status)`, `published_at`, `scheduled_at`, `expires_at`, `author_id`, `category_id`, partial index on `is_fixture` where true. **Declare the CHECK and partial index in the ORM schema too** (source kept them only in raw migrations, so they drifted). Add a CHECK `expires_at IS NULL OR scheduled_at IS NULL OR expires_at > scheduled_at`.
- Featured uniqueness: enforce atomically in the save transaction (section 7.9). A partial unique index is optional; if you add one, verify the expression syntax against this repo's Postgres version before relying on it.

**post_tags** PK `(post_id, tag_id)`, both FKs ON DELETE CASCADE, index on `tag_id`. **post_categories** same shape. **related_posts** PK `(post_id, related_post_id)`, `sort_order`, CHECK `post_id <> related_post_id`.

**revisions**: `id`, `post_id` FK CASCADE, `user_id` FK SET NULL (**actually write it**; source never did), `content_snapshot`, `title_snapshot`, `excerpt_snapshot`, `word_count`, `word_count_delta` default 0, `change_type` default `'manual'` (`manual|publish|autosave|restore`), `created_at`. Index `(post_id, created_at)`.

**redirects**: `id`, `source_path` text NOT NULL, `target_path`, `type` int default 301, `hits` int default 0 (**increment it** or drop it; source never incremented), `is_active`, `created_at`. Add a **unique partial index** on `source_path WHERE is_active`.

**media**: `id` text PK (UUID), `filename`, `slug` varchar(255) UNIQUE, `mime_type`, `size_bytes` int, `width`, `height`, `title`, `alt_text`, `description`, `caption`, `folder` (all text default `''`), `blob_url`, `blob_pathname`, `deleted_at`, timestamps. Indexes `(deleted_at, created_at)`, `folder`, `mime_type`. **Add a real `folders` concept** or normalise `folder` (section 9.6).

**audit_log** (NEW; source had none for content): `id`, `at`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `summary` jsonb. Write a row for every post, category, tag, author and media mutation, plus content-transform reports.

### 5.2 Status machine

Statuses: `draft | review | scheduled | published | archived`. "Trashed" is NOT a status: it is `deleted_at IS NOT NULL`, orthogonal to status.

- `published` boolean is written as `status === 'published'` everywhere.
- `published_at` is stamped on the first transition to published and kept afterwards.
- The cron performs the TIME-DRIVEN transitions: `scheduled -> published` when `scheduled_at <= now`, and `published -> archived` when `expires_at <= now`. The editor and quick update can also set any status by hand (for example `scheduled -> published` directly, or `archived` manually).
- No transition validator existed in the source; keep any-to-any editing, but add a **confirmation** when a live post is moved off `published` (section 8.3).
- `review` has no workflow logic in the source; keep it as a stored value, document that.

### 5.3 Public visibility predicate (single source of truth)

`status='published' AND visibility='public' AND robots_noindex=false AND is_fixture=false AND deleted_at IS NULL`. Export both a SQL fragment and a pure `isPubliclyIndexablePost(row)` mirror, and **use the fragment everywhere** (the source duplicated it inline in `/blog` load).

### 5.4 Soft delete

`getPostById` MUST filter `deleted_at IS NULL` for the editor (source bug: it could edit trashed posts). Trash view uses a separate query. Permanent delete removes the post, then cascades; also deactivate redirect rows pointing at the deleted slug.

### 5.5 Atomicity

The source ran the post update, then separate statements for category pivot, revision, tags and related posts over an HTTP driver without a transaction, so a mid-sequence failure left a post with wiped taxonomy. **Required:** perform the whole save (post row, redirect handling, all pivots, revision, featured demotion) in ONE transaction. If the driver cannot do interactive transactions, use its batch API with a single atomic CTE or `db.batch`, or switch the write path to a transaction-capable driver. Dedupe all id arrays before insert.

## 6. Rich text editor (TipTap 3)

Pin `@tiptap/*` to the same minor. Packages (note: `Color` is imported from `@tiptap/extension-text-style`, so the separate `@tiptap/extension-color` package is installed but unused in the source; skip it unless you import from it): core, pm, starter-kit, character-count, color, highlight, image, link, placeholder, subscript, superscript, table, table-cell, table-header, table-row, task-item, task-list, text-align, text-style, typography, underline, youtube.

### 6.1 Extension registration (exact order)

1. `StarterKit.configure({ link: false, underline: false })`
2. `Underline`
3. `Link.configure({ openOnClick: false, HTMLAttributes: {} })`. VERIFIED against `@tiptap/core` `Extendable.configure`, which uses `mergeDeep(this.options, options)`: passing `{}` does NOT clear the library defaults, so every link created without explicit attributes (autolink, paste, markdown-style input) defaults to `target="_blank"` and `rel="noopener noreferrer nofollow"`, INCLUDING internal links. In this port set `HTMLAttributes: { target: null, rel: null, class: null }` explicitly, decide `target`/`rel` per link in the link popover (external: `_blank` + `noopener noreferrer`; internal: none; `nofollow` only when the user ticks it), and pin the behaviour with a test that round-trips an internal and an external link.
4. `ImageWithDimensions` (custom, `inline: false`)
5. `Placeholder` ("Start writing your blog post...")
6. `TextAlign` for `heading, paragraph, image`, alignments left, center, right, justify
7. `Highlight.configure({ multicolor: true })`
8. `Superscript`, `Subscript`
9. `Table.configure({ resizable: true })`, `TableRow`, `TableCell`, `TableHeader`
10. `Typography`
11. `CharacterCount` (no limit)
12. `Youtube.configure({ width: 640, height: 360, nocookie: true })` (**use nocookie**; source used youtube.com)
13. `TextStyle`, `Color`
14. `FontSize`, `FontFamily`, `BlockStyle` (custom, global attributes)
15. `TaskList`, `TaskItem.configure({ nested: true })`
16. `Callout`, `Vimeo` (custom)

Code blocks: StarterKit's default plus a **language selector** (source had none, so every editor-created code block was plaintext on the public site). Emit `class="language-xxx"` on `<code>`.

### 6.2 Custom nodes and marks

**ImageWithDimensions** (extends Image). Attributes:

- `class`: default and always `blog-image`.
- `dataAlign` <-> `data-align`: accepts only `left|center|right`; also parsed from legacy classes: `blog-image--{x}` on the img only, and `align{x}` on the img or the enclosing figure.
- `width`, `height`.
- `linkHref`, `linkTarget`, `linkRel`: parsed from an enclosing `<a href>`; rendered by the node-level `renderHTML`.
- `caption`: parsed from enclosing `<figure>` `figcaption` or `.wp-caption-text`.
- Node `renderHTML`: build the `<img>`; wrap in `<a href target rel>` when `linkHref` is non-empty (default target `_blank`, rel `noopener noreferrer`); wrap in `<figure class="blog-image-figure"><img/><figcaption>` when `caption` is non-empty. (The source had a redundant second `caption ?` ternary after an early return; do not copy it.)

**Callout**: block node, `content: 'block+'`, `defining: true`, attribute `type` (`info|warning|success|danger`, **validate on parse**; source did not) <-> `data-callout-type`; `parseHTML: div[data-callout-type]`; renders `<div data-callout-type="T" class="callout callout--T">`. Commands `setCallout`, `toggleCallout`.

**Vimeo**: block atom, draggable; attrs `src`, `width` (640), `height` (360); `parseHTML: div[data-vimeo-id]` rebuilding `https://player.vimeo.com/video/{id}`, with a NaN guard on width and height (source had none); `renderHTML` extracts the id with several URL regexes, emits `<div class="vimeo-embed" data-vimeo-id data-width data-height><iframe src="https://player.vimeo.com/video/{id}?badge=0&autopause=0&player_id=0" ... allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Vimeo video player">`. **No empty `h=` query parameter.** If the id cannot be extracted, the command returns false and shows a visible error; do not emit an "invalid" node whose class the sanitizer later strips.

**FontSize, FontFamily**: global attributes on the `textStyle` mark, parsed from and rendered to inline style. **Fonts**: 24 options grouped Sans, Serif, Display, Monospace, Handwriting, each with a quoted stack and generic fallback. The Google Fonts URL for the editor MUST list exactly the same families as the options (source omitted Montserrat and mislabelled the empty option "Montserrat"), and the **same fonts must load on the public site** or posts that use them render in the fallback.

**BlockStyle**: global attributes `fontFamily`, `fontSize`, `color` on paragraph and heading so pasted block-level styles survive `setContent`.

### 6.3 Toolbar behaviour

- Primary toolbar (`role="toolbar" aria-label="Post content formatting"`): block-format select (Paragraph, H1 to H6), font family select, font size select (presets 8 to 48px), Bold, Italic, bulleted list, numbered list, blockquote, align left/center/right/**justify** (source lacked a justify button despite allowing it), link popover, insert image (opens media picker), and an advanced-toolbar toggle with `aria-expanded`.
- Advanced toolbar: strike, underline, text color, highlight color, clear formatting, table menu, YouTube/Vimeo/X embeds, callout menu (4 types), emoji picker, find and replace, undo/redo, paste-as-plain-text toggle (`aria-pressed`), HTML source toggle, fullscreen toggle, shortcuts dialog. **Add** buttons the source lacks on the main toolbars: code block, horizontal rule, task list, superscript, subscript, and inline code (source: inline code exists only in the bubble menu). Table menu: the source already has Insert 3x3, Add Column After, Add Row After, Delete Column, Delete Row, Delete Table; ADD the "before" variants, merge and split cells, and toggle header row.
- Accessibility reality of the source, so you know what to add: `aria-pressed` exists ONLY on the bubble menu and image control menu; the primary and advanced toolbars use a CSS `active` class only, and there is no `aria-expanded` or `aria-haspopup` anywhere in the editor folder. Every `aria-*` attribute named in this section 6.3 (including `aria-expanded` on the advanced toggle and `aria-pressed` on the paste-mode toggle above) is therefore a REQUIREMENT, not source behaviour.
- **All toggle buttons use `aria-pressed`.** All dropdown menus (table, callout, emoji, link) are real popovers: `aria-haspopup`, `aria-expanded`, arrow-key navigation, Escape closes, and dismissal by `focusout` with a relatedTarget check, **not** `onblur` plus `setTimeout(200)` (the source's link popover abandoned that pattern after a touch bug; the other three still used it).
- Link popover: URL input, "New tab" and "Nofollow" checkboxes, Apply and Unlink; Enter applies, Escape closes. When "New tab" is on, set `rel` to include BOTH `noopener` and `noreferrer`.
- Bubble menu (custom component, positioned from `coordsAtPos`, rendered outside the overflow-clipped editor): Bold, Italic, Underline, Strike, Highlight, Inline code, Clear formatting, Link (⌘K). All `aria-pressed` where applicable.
- Slash menu: triggered by `/` at document start or after whitespace; commands: Paragraph, H1 to H4 (add H5 and H6), Blockquote, Code Block, Bullet List, Ordered List, Task List, Divider, Table, YouTube, Vimeo, Callout (4 types), and **add** Image and X embed. Substring or id-prefix filtering; ArrowUp/Down/Enter/Escape; set `aria-activedescendant` and `aria-controls` so screen readers follow the selection. Enter with zero matches must NOT be swallowed.
- Image control menu (`role="toolbar" aria-label="Image controls"`): align left/center/right/none (`aria-pressed`), Alt (flag when empty), Replace, Remove, alt and title editor with Save and Cancel. Opens on double-click, on touch `pointerup`, **and via keyboard** when an image node is selected plus a documented shortcut.
- Find and Replace: `role="search"`, inputs have `aria-label`s, literal text matching, "Replace all" is ONE undo step, does not cross block boundaries, preserves links, images and marks. **Actually implement ⌘F** (source advertised it but never wired it).
- Status bar: `{words} words · {characters} characters · {readingTime} min read` in a `role="status"` region. Reading time `max(1, ceil(words/200))`. One word counter, not two that can disagree.
- The ProseMirror surface gets `role="textbox"`, `aria-multiline="true"`, an accessible name ("Post content").
- Keyboard shortcuts dialog lists every real shortcut.

### 6.4 Block-format behaviour (source defect: do not copy)

In the source, choosing a heading or paragraph from the block-format select also set an inline `font-size` span (18px, or 32/24/18.72/16/13.28/10.72px for headings), so saved HTML carried fixed pixel sizes that diverged from the public fluid `clamp()` sizes, and the slash menu did not do this. **Block format must only change the node type.** Font size is applied only when the user explicitly picks a size. Also: `setFontFamily('')` must remove only the `fontFamily` attribute, not the entire `textStyle` mark (source removed colour and size too).

### 6.5 Content sync (parent <-> editor)

- HTML string in, HTML string out. `onUpdate(html)` fires on every document-changing transaction, **unsanitised**; sanitisation happens on the server and on paste.
- Parent -> editor: an effect that (a) skips in HTML-source mode, (b) skips once when `content === lastEmittedToParent` (echo guard), (c) otherwise runs `syncEditorContent`: bail if equal to `getHTML()`; parse; find the diff range with `findDiffStart/End`; replace only that range with `setMeta('preventUpdate', true)`. This is evidenced to preserve the caret (it was added to fix a post-save caret jump); whether it also preserves undo history is NOT evidenced in the source, so test that separately and do not promise it. Add a test for it.
- Read initial content with `untrack`. Create the editor from an attachment or mount hook, with a `mounted` flag suppressing reactive writes during construction. Bump a `docTick` state on each transaction/selection update so derived toolbar state recomputes.
- HTML source mode: textarea (`aria-label="HTML source"`), sanitise on input, emit sanitised HTML to parent. **While in HTML mode, do not ignore external content updates** (source paused the sync effect and dropped them). Returning to visual mode sanitises and `setContent(clean, { emitUpdate: false })`.
- Do not double-emit from "Replace all".

### 6.6 Paste, drop, upload

- Plain-paste mode (closure flag, no editor recreation): insert `text/plain` only.
- Normal mode: first `image/*` item uploads and inserts; otherwise `text/html` goes through the sanitiser then `insertContent`. If sanitised result is empty, do nothing but still return handled.
- Drop of `image/*` files uploads each.
- **Upload errors are shown** (toast plus inline), never only `console.error`.
- Replace image: track the node position through transactions, then patch only `src/width/height`, keeping alt, title, alignment, caption. Cover cases: deleted during upload, editor destroyed.
- X/Twitter embed: validate the host is `twitter.com` or `x.com` and the path contains `/status/<digits>`; **escape** the URL before building HTML. Make the node real: add a dedicated `Tweet` node with `data-tweet-url`, or the blockquote schema will drop `class` and `data-tweet-url` (source: the embed is inserted as `<blockquote class="twitter-embed" data-tweet-url=...>`; the sanitiser allows those, but no Tweet node exists and StarterKit's blockquote declares neither attribute, so ProseMirror parsing drops them. This is certain from the schema but no test covers the editor round trip, so write one).

### 6.7 Editor CSS and public parity

- A shared structural stylesheet `prose.css` under a root class `.prose-base`, applied BOTH to the editor `.ProseMirror` (via `editorProps.attributes.class`) and to the public post body. It owns structure only: max-width 900px, fluid font sizing, line-height, headings, lists, task lists, blockquote, code and pre, marks, links, hr, tables, images and figures (`blog-image`, `blog-image-figure`, `data-align`), iframes, `[data-youtube-video]` and `.vimeo-embed` at 16/9. Colour and border live on the consuming surface.
- Do **not** hardcode a separate dark pixel-size heading scale in the editor stylesheet (source did, so editor and public could drift). The editor theme must be switchable (light/dark) and must preview text colours faithfully. Never default `textColor` to white.
- Define public styles for everything the editor can produce: callouts (4 variants), task lists with visible checkboxes (see 7.1), tweet embeds, mark colours, h5 and h6.
- Keep a single source for the callout palette.

## 7. Server logic

### 7.1 Sanitiser (`sanitizePostHtml`)

One shared config with `sanitize-html`, used on: server create/update, autosave, public read, editor paste, HTML source mode.

- **Allowed tags**: h1-h6, p, div, span, br, hr, a, strong, b, em, i, u, s, strike, sub, sup, mark, small, abbr, cite, q, time, blockquote, pre, code, ul, ol, li, dl, dt, dd, label, figure, figcaption, img, table, caption, colgroup, col, thead, tbody, tfoot, tr, th, td, iframe. **Add** `input` restricted to `type=checkbox` with `checked` and `disabled` only (source dropped it, so saved task lists lost their checkboxes), and consider `kbd`, `del`, `ins`.
- **Attributes**: `*`: style, title, lang, dir(ltr|rtl|auto). `a`: href, rel, target(_blank|_self). `img`: src, srcset, sizes, alt, width, height, loading(lazy|eager), decoding(async|sync|auto), data-align(left|center|right). `iframe`: src, width, height, frameborder, allow, allowfullscreen, loading. `div`: data-vimeo-id (digits), data-width, data-height, data-youtube-video, data-callout-type(info|warning|success|danger). `blockquote`: cite, data-tweet-url. `q`: cite. `mark`: data-color. `ul`: data-type=taskList. `ol`: start, reversed, type(1|a|A|i|I). `li`: value, data-type=taskItem, data-checked(true|false). `th`: colspan, rowspan, colwidth, scope. `td`: colspan, rowspan, colwidth. `col`: span, width. `colgroup`: span. `time`: datetime.
- **No `id` attributes** (heading anchors are generated at render time).
- **Allowed classes**: `blog-image`, `blog-image-figure`, `alignleft`, `aligncenter`, `alignright`, `wp-caption`, `wp-caption-text`, `callout`, `callout--{info|warning|success|danger}`, `twitter-embed`, `vimeo-embed`; on `code`: `/^language-[a-z0-9-]+$/i`. Editor-state classes like `ProseMirror-selectednode` are never allowed.
- **Protocols**: https, http, mailto, tel (a: all four; img additionally `data:image/(png|jpe?g|gif|webp|avif);base64,...` only; iframe: https only). Disallow protocol-relative URLs. Drop `srcset` that contains `data:`.
- **Iframes**: only hosts `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com`, `player.vimeo.com`; https; no credentials or port; path must start `/embed/` (YouTube) or `/video/` (Vimeo). An iframe without a valid src is removed. `allow` filtered to: accelerometer, autoplay, clipboard-write, encrypted-media, gyroscope, picture-in-picture, fullscreen, web-share. `width` and `height` match `^\d{1,5}%?$`.
- **Styles**: re-parse declarations with a strict allowlist: color, background-color (hex, named word, rgb[a]/hsl[a] with limited chars), font-family (`^[\w\s'",-]+$`), font-size (px/pt/em/rem/% or keywords), font-style, font-weight, letter-spacing, line-height, text-align, text-decoration, text-transform; on `table` and `col` only: width and min-width as lengths. No `mso-*`, float, margin, padding, display, position.
- Numeric attrs (`width, height, data-width, data-height, colspan, rowspan, span`) must be 1 to 5 digits with optional `%`. `colwidth` is comma-separated digits.
- `a[target=_blank]` gains `rel="noopener noreferrer"` (source added `noopener` only). Never auto-add nofollow; preserve if present.
- Word and Google Docs cleanup: `<b style="font-weight:normal">` becomes a span; attribute-less spans are unwrapped; `mso-*` and Mso classes removed; conditional comments and `<o:p>` removed.
- Drop whole subtree for: head, script, style, textarea, option, xmp, noscript, template, svg, math, form, button, select, object, embed, canvas.
- Post-pass: 3 or more consecutive `<br>` inside a `<p>` become paragraph breaks; empty or NBSP-only paragraphs removed; re-sanitise if text changed.
- Export `isWordHtml` and `isGoogleDocsHtml` only if something uses them.
- Must be **idempotent** (run twice, same output). Test it.

Tests to port: parser boundaries (active URL schemes, entity-encoded and control-character-split `javascript:`, `srcdoc`, `xmlns`, host-in-query spoofing), iframes, srcset and data URLs, CSS functions/escapes/breakout, foreign namespaces, table geometry, highlight and task-list state, Word/Docs paste, heading-level preservation h1 to h6, editor-owned classes, classic HTML-mode paste round trip.

### 7.2 Zod schemas (`shared/schemas/posts.ts`)

- `title` min 1. `slug` min 3, max 75, `^[a-z0-9]+(?:-[a-z0-9]+)*$`. `excerpt` nullish, **no max** (soft limit only). `content` min 1.
- `authorId`, `categoryId`: positive int nullish. `categoryIds`, `tagIds`, `relatedPostIds`: arrays of positive ints, **refined unique**.
- `coverImage`, `ogImage`, `canonicalUrl`, `twitterImage`: `url()` or `''`.
- `metaTitle` and `ogTitle`: add a max (source had none; use the budget constants). `metaDescription` max 155. `ogDescription`: add a max. `twitterTitle` max 70, `twitterDescription` max 200.
- `secondaryKeywords`, `faqItems`, `customFields`, `coAuthorIds`: validate the JSON shape, including **types** of question and answer (source only checked the keys).
- `twitterCardType` enum, `schemaType` enum (`Article|BlogPosting|NewsArticle|HowTo`), `status` enum default draft, `visibility` enum default public, `template` enum, `postFormat` 10-value enum.
- `password`: **required, min length, when `visibility = 'password_protected'`**; cleared when visibility changes to anything else (source left stale plaintext passwords).
- `scheduledAt`, `expiresAt`: parseable dates. `requireUsableScheduledAt`: a `scheduled` post needs a `scheduledAt` that is not more than 60 000 ms in the past. Add `expiresAt > scheduledAt`.
- `postUpdateSchema` = create schema + `id` + `relatedPostIds`. Treat PUT as full replace and **document it**: omitting `tagIds` removes all tags. Prefer a PATCH-style schema for partial updates.
- `postAutosaveSchema`: id, title (**allow empty**; source required min 1 so autosave failed for untitled drafts), content, excerpt.
- `postQuickUpdateSchema`: id required; title, slug, status, authorId, categoryId, featured, isPillar, isSticky optional.
- Categories, tags, authors: add slug regex and max; use the shared meta budget constants (source category `metaDescription` max was 160 vs the budget's 155); validate URLs and email; hex-validate category `color`.
- Media PATCH: add a Zod schema with max lengths (source had none).

### 7.3 Slugs

Constants: `SLUG_MIN_LEN=3`, `SLUG_TARGET_LEN=70`, `SLUG_MAX_LEN=75`. Two normalisers: typing-time `normaliseSlug(text, 75)` (lowercase, strip diacritics, collapse non-alphanumerics to hyphens, trim hyphens, clip at a hyphen if one lies beyond 50% of max) and save-time `generateSlug` (same plus trim trailing stub words: a, an, and, at, be, but, by, for, from, in, is, it, of, on, or, our, so, the, to, we, with, you). New posts auto-derive the slug from the title **only until the operator edits the slug field manually** (source overwrote manual edits on every title keystroke). Existing posts never auto-rename. Maintain a **reserved slug list** (source had none). Show a live uniqueness check (debounced) in addition to the server 409 `DUPLICATE_SLUG`.

### 7.4 Content transforms (run on every create and update, BEFORE the gate; the source only pino-logs a "transforms applied" line, here write an audit row too)

Order in `applyContentSeoTransforms`:

1. Strip the first `<h1>` or `<h2>` whose normalised text equals the title.
2. One media lookup: `SELECT ... FROM media WHERE blob_url IN (<img srcs>) AND deleted_at IS NULL` (the `deleted_at IS NULL` filter is NEW; the source also matched soft-deleted rows).
3. Inject `width` and `height` on `<img>` when either is missing and the media row has both (never invent).
4. Backfill EMPTY alt from `media.alt_text` (never overwrite an explicit alt).
5. Replace em and en dashes in the body with HTML-aware logic: **skip `<pre>`, `<code>`, attribute values and URLs** (source rewrote those). Rules: digit-dash-optional `$`-digit becomes "<a> to <b>"; leading dash at line start or after `>` is dropped; everything else becomes ", "; then collapse `,\s*,`.
6. Replace dashes in title, metaTitle, metaDescription, excerpt, coverImageAlt, coverImageCaption, ogTitle, ogDescription, twitterTitle, twitterDescription, faqItems (exactly the source's field list). ADDITIONS in this port, not source behaviour: also focusKeyword, secondaryKeywords, and category and tag text.

**Transforms must also run on**: quick update titles, autosave snapshots, and restore (strip the stored text, not only the posts row). Then run the sanitiser. **Then** run autofill. **Then** run the gate on the FINAL values (source gated pre-sanitise, pre-autofill input, so the gate could pass content that sanitising later changed, and a title-equal autofilled cover alt passed storage but would fail the next gate).

### 7.5 Autofill (blank fields only, never overwrite)

Meta title from title truncated at a word boundary to 60. Meta description: first sentence of excerpt or plain content, capped 155; if shorter than 70, take a truncated chunk. Excerpt from meta description. OG title, description, image from meta and cover. Twitter fields from OG; card default `summary_large_image`. Cover alt: caption, else **do not default to the title** (the gate rejects alt equal to title). Focus keyword: first two non-stop words of the title. Schema type `BlogPosting`; language `en`. Canonical is never filled.

### 7.6 Publish gate (`getSeoScore`, `enforcePublishSeoGate`)

`PUBLISH_GATE_MIN_SCORE = 80`. `publishable = score >= 80 AND no blocking issue`. Score clamped 0 to 100. Constants: `CONTENT_MIN_WORDS=600`, `CONTENT_THIN_WORDS=300`. Budget constants live ONLY in `meta-budget.ts`: meta title 30 to 60, meta description 70 to 155, Twitter title 70, Twitter description 200, excerpt 160 (soft). The brand suffix `" | <Brand>"` is added only if the rendered total stays within 60.

Deductions (BLOCK means `blocking: true`):

| Check                                                                                                                                                                                                                                                          | Severity | Points            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- |
| Missing meta title                                                                                                                                                                                                                                             | error    | -10 BLOCK         |
| Meta title > 60                                                                                                                                                                                                                                                | warn     | -5                |
| Meta title < 30                                                                                                                                                                                                                                                | warn     | -5                |
| Meta title starts with a lowercase letter                                                                                                                                                                                                                      | error    | -10 BLOCK         |
| Missing meta description                                                                                                                                                                                                                                       | error    | -10 BLOCK         |
| Meta description > 155                                                                                                                                                                                                                                         | warn     | -5                |
| Meta description < 70                                                                                                                                                                                                                                          | warn     | -5                |
| No cover image AND no OG image                                                                                                                                                                                                                                 | error    | -10 BLOCK         |
| Cover set, alt blank                                                                                                                                                                                                                                           | error    | -10 BLOCK         |
| Cover alt (normalised) equals title                                                                                                                                                                                                                            | error    | -10 BLOCK         |
| Body `<img>` missing width or height                                                                                                                                                                                                                           | warn     | -4 (once)         |
| Body images exist, focus keyword set, none has it in alt                                                                                                                                                                                                       | warn     | -3                |
| Missing excerpt                                                                                                                                                                                                                                                | warn     | -5                |
| No author                                                                                                                                                                                                                                                      | error    | -8 BLOCK          |
| No category                                                                                                                                                                                                                                                    | error    | -5 BLOCK          |
| 0 tags                                                                                                                                                                                                                                                         | error    | -5 BLOCK          |
| 1 tag                                                                                                                                                                                                                                                          | warn     | -2                |
| No focus keyword                                                                                                                                                                                                                                               | error    | -8 (not blocking) |
| Keyword missing in meta title (if non-empty)                                                                                                                                                                                                                   | warn     | -5                |
| Keyword missing in meta description                                                                                                                                                                                                                            | warn     | -5                |
| Keyword not in slug (spaces to hyphens)                                                                                                                                                                                                                        | warn     | -3                |
| Keyword not in plain body                                                                                                                                                                                                                                      | warn     | -5                |
| Words < 300                                                                                                                                                                                                                                                    | error    | -10 BLOCK         |
| 300 <= words < 600                                                                                                                                                                                                                                             | warn     | -3                |
| ANY body h1 or h2 whose normalised text equals the title (scan stops at first hit)                                                                                                                                                                             | warn     | -3                |
| Slug > 70 chars                                                                                                                                                                                                                                                | warn     | -3                |
| Slug has 3 or more stop words, using the GATE's own 17-word set: the, and, for, are, but, not, you, all, can, had, her, was, one, our, out, with, from (this is NOT the 22-word trailing-stub list used by the slug generator in 7.3; keep two separate lists) | warn     | -3                |
| 0 distinct external authority domains                                                                                                                                                                                                                          | error    | -12 BLOCK         |
| 1 distinct external authority domain                                                                                                                                                                                                                           | error    | -8 (not blocking) |
| No FAQ                                                                                                                                                                                                                                                         | warn     | -5                |
| 1 or 2 FAQ items                                                                                                                                                                                                                                               | warn     | -3                |
| 3+ FAQ items, some answer < 40 chars                                                                                                                                                                                                                           | warn     | -2                |
| Freshness: `publishedAt` and the row's `updatedAt` (NOT `content_updated_at`) within 24h of each other AND age > 180 days; only evaluated when both dates are supplied                                                                                         | warn     | -4                |
| Unresolved placeholder sentinel in content                                                                                                                                                                                                                     | error    | -100              |
| Any em or en dash in content, titles, meta, excerpt, cover alt/caption, OG/Twitter, FAQ                                                                                                                                                                        | error    | -25               |

Mark the placeholder and dash errors as `blocking: true` explicitly (source relied on the score arithmetic). External authority counting: distinct hostnames from absolute http(s) `<a href>`, `www.` stripped; exclude the site's own domain, localhost, `*.local`, and social/shorteners (facebook, instagram, linkedin, pinterest, reddit, threads.net, tiktok, twitter, x.com, youtube, youtu.be, t.co, bit.ly, goo.gl, tinyurl). Words: tags to spaces, collapse whitespace, split.

Gate placement: runs on create when status is published or scheduled; on update when the transition is to published, or any save with status scheduled; on quick update on the same conditions; on restore only when currently scheduled. Already-live posts are NOT re-gated on edit (a documented lockout incident). Failure throws an error whose message starts with `SEO_GATE_BLOCKED:`; the request boundary (RPC and REST alike) maps it to HTTP 422 with the text after the prefix as the body, and the editor shows it as a **multi-line, newline-preserving** message. Source behaviour of that text: the section headed "Blocking errors" lists EVERY error-severity issue (including non-blocking ones such as "No focus keyword"), followed by the first 3 warnings. Keep it, or filter to `blocking: true` and rename the heading honestly. Also note the source's body checks only recognise double-quoted `alt="..."` and quoted `href="..."`, and its own-host exclusion is hard-coded to the site's domain; make both robust and configurable here. The cron does not gate, so also **re-check the gate (or at least required relations) when the cron publishes**, or refuse to schedule posts whose category or tags can later be removed (source's category deletion silently stripped categories from already-gated scheduled posts; tags and authors correctly returned 409; make categories do the same).

### 7.7 Revisions

- Snapshot title, content, excerpt, word count and `word_count_delta` = new count minus the POST's stored `word_count` before the save (source: not the previous revision's count; 0 on create); `user_id` set to the acting user.
- Writers and `change_type`: create `manual`; update `publish` when it newly published, else `manual`; quick update only when the title changed (snapshot of the CURRENT content, new title); autosave `autosave`; restore `restore`.
- **Autosave must dedupe**: skip insert when the snapshot hash equals the latest revision. **Retention**: keep all `manual`, `publish`, `restore`; keep only the latest N autosaves (e.g. 20) per post and prune older ones in the same transaction. List query returns the latest 50 **without** full content (id, type, date, word count, delta), and fetches content only for the diff or restore request.
- Restore: verify the revision belongs to the post; strip dashes; re-gate only if currently scheduled; recompute metrics; set `content_updated_at` and `updated_at`; write a `restore` revision containing the STRIPPED text. Restores title, content, excerpt only (not slug, SEO, taxonomy, FAQ); say so in the UI.

### 7.8 Metrics

`reading_time = ceil(words/200)` (0 for empty). `word_count` from tags-to-spaces, collapsed. `table_of_contents`: computed with the same shared heading-id function as the public renderer (section 10.3; source used positional `heading-<index>` ids from a regex); use a parser or an `s`-flag regex so headings spanning newlines are captured. `content_updated_at` bumps ONLY when title or body text changed; `modifiedAt = content_updated_at ?? updated_at`. **Bump it on quick-update title changes too** (source did not, so sitemap `lastmod` and JSON-LD `dateModified` went stale).

### 7.9 Featured, pillar, sticky

At most one featured post. Source behaviour: after every create, update and quick update where the saved row has `featured = true`, ALL other posts are demoted with no status or trash filter, so saving a featured draft or trashed post unfeatures the live spotlight; it is also non-atomic, so concurrent saves can leave two. Required here: demote others only when the saved post is itself `published` and not deleted (a featured draft stays a draft flag and demotes nothing), and do it inside the save transaction (or rely on a partial unique index over published, undeleted featured posts). `listFeaturedPosts(limit=3)` uses the public predicate ordered by `published_at desc`.

### 7.10 Taxonomy writes

Category primary = `categoryId` if in the set else the first. Pivots are replaced inside the save transaction. Quick update with `categoryId` must **not** collapse a multi-category post to one: add the primary category to the set or leave the pivot untouched unless the full set is provided. Tags and related posts deduped; related excludes self; persist related on create as well as update, and **honour `sort_order` on read, capped at 3** (source returned manual related posts unordered and uncapped).

### 7.11 Slug rename and redirects (`savePostWithRedirect`)

One atomic statement or transaction with an advisory lock and `SELECT ... FOR UPDATE`:

- A rename creates a 301 `/blog/<old>` -> `/blog/<new>` only when the prior row had `published = true` and slugs differ.
- Existing active redirects pointing at the old path are repointed to the new path (chains collapse).
- A redirect whose source equals the new path is deactivated (rename-back case).
- Insert the new row only if no active redirect with that `source_path` exists (backed by the unique partial index).
- Return `renamedFromSlug` and `prevPublished`; the caller announces both URLs to search engines.
- The editor shows a **confirmation** ("Renaming a published post creates a permanent redirect from the old URL") before saving a published-post rename.
- Redirect serving hook: runs before the router, GET and HEAD only, skips `/_app/`, `/api/`, `/admin/`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`; exact `source_path` match on `is_active`; preserve query string; 301 (or 302 if `type=302`); `cache-control: public, max-age=300`; increment `hits`; on lookup error log a warning and continue. Normalise trailing slash and case before matching.
- Trashing or permanently deleting a post deactivates redirects whose target is its path. (Optionally return 410 for deleted slugs.)
- Rewrite internal links in other posts' bodies on rename, or at least report them in the save result.

### 7.12 Search engine notification

On transitions into or out of public visibility, live edits, renames, trash, restore, and cron publish and archive: submit to IndexNow and ping the sitemap. Do NOT block the save response on it (source `await`ed it, adding latency): run via `waitUntil` or a queue, log failures. Add a retry marker so slugs from a cron run that died after the UPDATE still get announced.

### 7.13 Scheduled publish cron

`GET /api/cron/publish-scheduled`, every minute, schedule in `vercel.json`. Scheduling and expiry are both KEEP decisions (the owner confirmed). Evidence from the source: this cron is the only thing that flips `scheduled -> published` and `published -> archived`, and the source declares it as `* * * * *` in `vercel.json`. NOT evidenced: whether the target host plan actually honours a per-minute schedule. Before relying on it, read the host's current cron limits from its official docs (do not trust memory) and test that the cron fires on the target plan. FALLBACK if per-minute is not allowed: keep the cron on the finest allowed schedule (for example daily) AND make the public-visibility rule in 5.3 treat a post with `status='scheduled' AND scheduled_at <= now()` as published at read time, so posts go live on time even when the sweep is late; likewise treat `expires_at <= now()` as not public at read time. The sweep then only syncs stored status, sitemap, RSS and search-engine pings.

- Auth: require `Authorization: Bearer <CRON_SECRET>`; compare with `timingSafeEqual`; 500 in production when the secret is unset; 401 on mismatch.
- Publish: one atomic `UPDATE posts SET status='published', published=true, published_at=COALESCE(published_at, now()), updated_at=now() WHERE status='scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= now() AND deleted_at IS NULL RETURNING id, slug`.
- Archive: `UPDATE ... SET status='archived', published=false WHERE status='published' AND expires_at IS NOT NULL AND expires_at <= now() AND deleted_at IS NULL`.
- Notify via `Promise.allSettled`. Idempotent by construction (0 rows on re-run). Log start and end with a request id.
- Also exclude `is_fixture` rows.
- Timestamps: the editor sends ISO UTC (`new Date(datetimeLocal).toISOString()`); display the scheduled time with date AND time and the timezone in the Publish box.

### 7.14 Caching

`PUBLIC_READ_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400'`. Helper `setPublicReadCache(setHeaders, locals, request)` applies it only when there is no admin session and the method is GET or HEAD; use the helper on the post page too (source set the header inline there). Locked, members and admin responses must be `no-store`. Never serialise `password` to the client (a past shared-cache leak). On DB failure throw 503 so `stale-if-error` can serve the last copy. **Add real invalidation** (tag or path purge) after post mutations where the host supports it; the source relied only on a 5 minute s-maxage.

### 7.15 Password-protected and members posts

- Plaintext storage was a deliberate source decision; **prefer hashing** the password (scrypt) and storing a per-post secret salt/version in the cookie HMAC instead of embedding the password.
- Cookie `post_pw_<id>`: HMAC-SHA256 token, `httpOnly`, `sameSite=lax`, `secure`, `path=/blog/<slug>` (**re-issue or key by id when the slug changes**, since a rename invalidates the path), `maxAge` 24h. Secret from env; **fail closed** (refuse to start unlocking) if no secret is configured. Never ship a constant fallback secret.
- Compare with `timingSafeEqual` over equal-length buffers (hash both sides to hide length).
- Unlock action: empty password -> 400; post must be published, protected, undeleted -> else 404; rate limit 10 attempts per 10 minutes per IP per slug (**apply before** revealing the 404 distinction); wrong password 401; limit 429. Works without JavaScript (plain form POST) with `role="alert"` error and `autocomplete="current-password"`.
- Locked payload: return ONLY title, slug, breadcrumbs and a generic notice. Strip `metaDescription`, `ogDescription`, `twitterDescription`, `coverImage`, `wordCount`, `readingTime`, `coverImageCaption`, author bios, TOC, FAQ, content, excerpt, password (source leaked meta, cover and counts into the meta tags and JSON-LD of locked posts). Emit no Article, Person or FAQ JSON-LD for locked posts. Locked posts are `noindex`.
- `members` visibility returns 403 for non-admins (no member auth exists; say so in the UI).

### 7.16 Auth, CSRF, rate limits, audit

- Every admin mutation and read calls an `requireAdmin()` guard first (401 without a session, 403 without the admin role). A global hook returns JSON 401 for unauthenticated `/api/admin/` and `/api/media/` calls.
- CSRF: reject mutating requests whose `Origin` or `Referer` host mismatches (403); session cookie `SameSite=Strict`; **also reject when both headers are absent** on cookie-authenticated mutating requests, or enable the framework's built-in CSRF option.
- Rate limits (Postgres-backed with in-memory fallback): REST post writes 60/min per IP; **RPC post writes too** (source had none); media upload 30/min; media writes 60/min; password unlock 10 per 10 min per IP per slug.
- Audit rows for every mutation (section 5.1).

## 8. Editor behaviours

### 8.1 Save flow (`savePost({ closeAfter, status? })`)

Pre-checks, each failing with a visible message: title required; slug valid (3 to 75, regex) after normalising; content not empty or `<p></p>`; slug auto-derived from the title if blank. Target status goes into the payload only and is committed to `form.status` after the server accepts, unless the operator changed it meanwhile. After a successful create, adopt the returned id. Results: adopt canonical fields (4.9); if `closeAfter` and not dirty -> `onSaved({ close: true })`; else refresh `lastSavedAt`, restart autosave, show "Saved". Error classification: 409 `DUPLICATE_SLUG` or Postgres `23505` -> slug message; 422 -> server body verbatim (preserve newlines); else a generic refusal message.

### 8.2 Autosave

- Interval 60 000 ms, only while dirty.
- **New unsaved posts MUST also be backed up**: write the form to a `localStorage` draft key (`post-draft:new` or `post-draft:<id>`) on a 2 second debounce, restore on load with a "Recovered unsaved draft, Restore or Discard" banner. (Source: new posts were never autosaved and a crash lost everything.)
- Server autosave payload: id, title, content, excerpt only. It inserts a revision row with `change_type='autosave'` and never touches the post row. It sanitises content.
- Autosave success must clear the "dirty since last autosave" flag it uses to decide whether to run (separate from the "unsaved vs the post row" flag), so it does not insert a revision every minute with no changes.
- Failure: "Autosave failed" chip plus Retry, `role="alert"` banner.
- **Conflict detection**: send the post's `updated_at` (or a version integer) with every update and autosave; the server rejects with 409 `STALE_WRITE` when it differs, and the editor offers "Reload latest" or "Overwrite" (source was last-write-wins).

### 8.3 Publish box

- Buttons: "Save Draft" (stay), primary (Publish / Update / Schedule; label by status and schedule), "Preview" (source: a link inside the Publish box, shown only when editing a PUBLISHED post; REQUIREMENT: **add a draft preview** via a signed, expiring preview token or the admin visibility bypass; source had no draft preview), "Move to Trash" when editing.
- Status select (all five), Visibility select with password field (masked input, not `type=text`), Schedule and Expires `datetime-local` inputs. Setting a schedule date on a non-published post flips status to `scheduled`; clearing it on a scheduled post reverts to `draft`. Show date AND time.
- **"Save Draft" on a published post must confirm** ("This unpublishes the post and notifies search engines") before it unpublishes (source did it silently).
- Every select and input has an associated `<label>`.

### 8.4 Trash

In-editor: styled confirm "Move post to Trash?" -> soft delete -> close with toast. Trash view: Restore (confirm), Delete Permanently (confirm, danger), "Delete all permanently" (Empty Trash confirm, with the count). Bulk trash is sequential, reports failures per post, keeps failed ones selected. Use the project's styled dialog, never `window.confirm`.

### 8.5 Revision UI

"Load Revisions" button (lazy). List item: change type, date, word count with delta, Diff, Restore. Diff modal (`role="dialog"`, `aria-modal`, focus trap, Escape): compares the revision to the **live form state including unsaved edits**; tabs Content, Title, Excerpt; unified or split; added and removed word counts; legend. Word-level diff: run it **off the main thread** (worker) or use a linear-space diff (Myers) because the source's LCS table is O(n·m) in memory. Show HTML structure changes (images, links) at least as markers. Restore: styled confirm with title "Restore this revision?", message "Any unsaved changes in the editor will be lost.", confirm label "Restore", tone warning, then reload the post and toast.

### 8.6 Unsaved-changes guard

- `beforeunload`: set `returnValue` when dirty and not leave-confirmed.
- Client navigation: cancel and show the styled "Discard unsaved changes?" dialog (confirm label "Discard", tone warning); on Discard set `leaveConfirmed` and replay (popstate replays `history.go(delta)`; external or non-app routes use `location.assign`; else `goto`). `leavePrompt ??=` prevents stacked prompts. Skip `willUnload` navigations (the native prompt handles them).
- Export `canClose()` and use it for Back, Escape and view switches. Author, Category and Tag editors get the same guard (source had none).

### 8.7 Keyboard shortcuts (window listener)

`Cmd/Ctrl+S` save and stay (ignore while saving); `Cmd/Ctrl+Shift+P` publish and close (requires ready, not saving, title present); `Cmd/Ctrl+Shift+D` save draft and stay; `Escape` closes unless focus is in input, textarea or select **or a modal is open**. Source: only Cmd/Ctrl+S compares `e.key === 's'` (breaks with Caps Lock); the P and D shortcuts already accept both cases, and Escape is not modal-aware. REQUIREMENT: compare `e.key.toLowerCase()` for all three.

### 8.8 Other admin editors

- Author: name, slug, job title, company, credentials, expertise, short bio, bio, avatar URL (+ **avatar alt input**, source had none), email, LinkedIn, Twitter, website, **years of experience input** (source had none).
- Category: name, slug, description, meta title, meta description, color (default brand green), **preserve `is_active`** on save (source forced true).
- Tag: name, slug, description.
- Quick edit row: title, slug, status (**read options from the status enum**, not a hardcoded list), author, category, Featured/Pillar/Sticky; on failure the row stays open with `role="alert"`.

## 9. Media library

### 9.1 Two surfaces over one API

- Full page `/admin/media` and a modal picker (`mode='insert'` for the editor, cover mode for the featured image). **Unify them**: one component set with feature flags, so the page also gets folders, bulk actions, rename and insert settings (source's page lacked all of these).
- Both: grid view (**also add list view**), debounced search (300 ms), sort (Newest, Oldest, Title, Size, Filename), pagination with "Page X of Y (N items)", drag-and-drop and button upload with progress, alt text editing, copy URL, delete with styled confirm. Grid `<img>` always has `width` and `height` (fall back to 300x300).
- Modal: folder filter and create, multi-select with shift-range, bulk delete, bulk move (with "Root"), insert settings (alignment none/left/center/right; link-to none/media/custom URL; size thumbnail/medium/large/full; caption checkbox disabled when no caption), keyboard navigation (arrows, Enter, Escape layering: cancel edit, then multi-select, then close), double-click to insert, focus trap.
- Edit form: Title, Alt Text, Description, Caption, Filename (display name only). **Enforce alt text** on images used in posts (the asterisk in the source was cosmetic).
- **Add**: usage tracking ("Used in N posts", computed by scanning `cover_image`, `og_image`, `twitter_image` and body `<img src>`), **delete protection** when in use, MIME filter UI, MIME allowlist, restore from trash for media.
- Replace server-error swallowing: client list/get/update/delete helpers must surface the server's error message (source threw only "Failed to update media (400)").
- XHR upload gets a timeout, `onabort`, `ontimeout`, and a cancel button.

### 9.2 Limits (constants in one shared file)

`MEDIA_UPLOAD_MAX_BYTES = 4_000_000` (the host rejects bodies above 4.5 MB before the handler runs), `MEDIA_REQUEST_MAX_BYTES = 4_400_000`, `MEDIA_METADATA_MAX_BYTES = 16_000` (UTF-8 bytes across fields), allowed metadata keys `title, alt_text, description, caption, folder`. Every UI hint must read from these constants (source's page said "Max 20 MB" while the server enforced 4 MB). List `per_page` clamped 1 to 100 (default 24). Variant widths 480, 800, 1200, only strictly below the original, never upscaled. WebP quality 82.

### 9.3 `POST /api/media/upload`

1. Admin guard, then rate limit (30 per minute per IP, 429).
2. Content type must be `multipart/form-data` (415). Declared content length over 4.4 MB -> 413. Stream and count the body so a missing or lying length still hits 413. Malformed form -> 400.
3. Validate: exactly one `file` (400 otherwise); must be a File; **allowlist** `image/png, image/jpeg, image/gif, image/webp, image/avif, image/svg+xml` on the SNIFFED type, not only the declared one; size over limit -> 413; unknown keys, duplicate keys, non-text values -> 400; metadata over limit -> 413.
4. Convert: sniff real format from magic bytes (PNG, JPEG, GIF, WebP, SVG by text prologue). WebP, SVG, GIF pass through with the **sniffed** mime. Everything else: `rotate()` then WebP quality 82. **On encode failure, reject with 422** (source failed open and stored unsniffed bytes under the declared mime). **Sanitise SVG** (strip script, event handlers, foreignObject, external references) or reject SVG.
5. Dimensions from sharp or a header reader; on failure log a warning and store null.
6. Variants: when the final type is WebP and width is known, upload `{sanitisedStem}-{hex12}-{width}w.webp` objects for the original and each smaller variant (`addRandomSuffix:false`, public, `image/webp`, in parallel). On any failure delete the stored siblings and fall back to a single object put. Skip variants for images 480px wide or narrower.
7. Insert the row (UUID id, `slug = blob.pathname`, stored byte size, metadata defaults `''`). **If the insert fails, delete the uploaded blobs** (source orphaned them).
8. Respond 200 (or 201) with the item JSON. Rethrow HttpErrors untouched; other errors return 500 and are logged.

### 9.4 `GET /api/media/list`

Zod query: `page`, `per_page`, `search`, `folder`, `mime_type`, `sort`. Excludes soft-deleted. **Search uses `ILIKE` with `%` and `_` escaped** (source was case-sensitive and wildcard-injectable). Folder exact; MIME prefix. Sorts: filename asc, title asc, size desc, oldest asc, default newest. Response `{ items, total, page, per_page }`.

### 9.5 `/api/media/[id]`

- GET: 404 if missing or soft-deleted.
- PATCH: Zod-validated; accepts title (alias name), alt_text (alias altText), description, caption, folder, filename; trims; `null` becomes `''`; empty filename 400; apply the dash transform; **single atomic `UPDATE ... WHERE id AND deleted_at IS NULL RETURNING`** (0 rows -> 404), not select, update, select.
- DELETE: refuse with 409 and a usage list when referenced by any post; otherwise delete the blob and variant siblings **before** the soft delete, and if the blob delete fails, abort (source soft-deleted anyway, leaving divergence); write an audit row; return 204.

### 9.6 Item shape and sizes (source defect: fake sizes)

`MediaItem = { id, filename, slug, mime_type, size_bytes, width, height, title, alt_text, description, caption, folder, urls: { original, large, medium, thumbnail, webp }, available_sizes: [{ value, label, url, width, height, available }], created_at, updated_at }`. **`urls.thumbnail`, `medium`, `large` and `available_sizes` MUST point at the real 480, 800 and 1200 variants** and report their real dimensions, with `available:false` when a variant does not exist. The source returned the original URL for every size, so the Size dropdown was cosmetic. The cover picker stores the largest variant URL, from which the renderer derives `srcset`.
Folders: free-text column in the source with these defects: `loadFolders` asked for 1000 items but the server capped at 100, so folders were discovered from the newest 100 items only; and Root was both `''` and `'/'`. Use ONE representation (`''`), a distinct `SELECT DISTINCT folder` endpoint, and normalise on write.

### 9.7 Backfill script

Port `scripts/backfill-blog-image-variants.ts` only if existing media lacks variants: dry run by default, `--apply` to write; allow-list the blob host; cap downloads at 15 MiB with a 30 s timeout; skip images already following the width naming convention, non-raster, or 480px and narrower; UPDATE conditional on the old URL (idempotent); never delete the old blob; also update `media` rows, `og_image` and body references (source updated only `posts.cover_image`); exit non-zero on any failure; add a test.

## 10. Public blog

### 10.1 Blog index (`/blog`)

Server `load` (no client fetching), three queries in parallel: published list, active categories, featured (3). H1, search link, author byline, category pill nav (`aria-label="Blog categories"`, "All" with `aria-current="page"`), "Featured Articles" (card 0 eager with `fetchpriority=high`, the rest lazy), divider, "All Articles" grid. **Paginate** (source rendered every post). DB failure -> 503. Category pill row lists categories with at least one published post.

### 10.2 Post page (`/blog/[slug]`)

- Load: select with author and category joins on `slug`, published, not fixture, not deleted (**also filter visibility and expiry consistently**); 404 if missing; 403 for members; password branch (7.15). Body pipeline in the source: on the server `stripDuplicateLeadImage(sanitizePostHtml(content))` then Shiki highlight; then in the page component (`$derived`) `normalizePostHeadings`, `processContentImages`, `lazyifyContentImages`. Keep that split (or move all of it server side). Related posts: manual first, else ranked (source: manual rows are fetched with `inArray` and NO `ORDER BY sort_order` and NO limit, so admin order is ignored and the list is uncapped; REQUIREMENT here: order by `sort_order`, cap at 3).
- Order: breadcrumb, header (category badge, H1, excerpt, author, date, reading time, tags), cover figure, layout with TOC aside and main (prose, local service block, guide CTA, FAQ, author box, share, related), "Back to all articles". **Add** previous and next post links and a reading-progress bar (both absent in source).
- Cover: `<picture>` with a WebP `<source>` when a variant `srcset` exists, `<img>` with `srcset`, `sizes`, alt (or title), `width`/`height` matching the file's real ratio or CSS `aspect-ratio` from stored dimensions, eager plus `fetchpriority=high`, `decoding=async`.
- Body images: add `loading=lazy`, `decoding=async`, and `width`/`height` from the media table when missing. Remove a leading bare `<img>` whose file stem matches the cover's.
- Author box: use the post author's own row for name, title, credentials, bio, links (source hardcoded the founder's LinkedIn, website, email and `/about#steven-johnson` for every post).
- Share: source has X (`https://twitter.com/intent/tweet`, `aria-label="Share on Twitter"`), LinkedIn, email, all `target=_blank rel="noopener noreferrer"` with `aria-hidden` icons. REQUIREMENTS here: use `x.com/intent/post` and label it "X", add copy-link and native share, and make labels say "opens in new tab".
- FAQ: `<details>/<summary>` list; malformed JSON should log, not silently yield `[]`.
- Comments: none. Do not ship dead comment CSS.

### 10.3 Heading ids and TOC

`normalizePostHeadings(html, title)` runs on the sanitised body and returns the body with ids plus the TOC list: demote body h1 to h2; remove a first heading equal to the title; headings titled "cta" or "call to action" are excluded from the TOC but still get an id; strip author-supplied ids. **Use stable slug-based ids** (`why-fractional-cfo`, with `-2` dedupe suffixes), not positional `heading-N` (source's positional ids broke deep links whenever headings moved). The editor TOC panel and the public renderer must use the same function. TOC renders when there are 3 or more entries, as real `<a href="#id">` inside `<details open>` rendered server side (crawlable and works without JS); collapsed after mount on narrow screens; click does `preventDefault` plus smooth scroll; scroll-spy via an effect with `offsetTop <= scrollY + 150`, `aria-current="location"` on the active item; levels 3 to 6 indented; `scroll-margin-top: 120px` on h2 to h4 (source sets it on h2 and h3 only; h4 had none, which is a bug); sticky aside at 1180px and up, two-column list 768 to 1179, dropdown below 768. Use `$derived` for the TOC; do not select and ignore a stored `table_of_contents` column (source did).

### 10.4 Related posts ranking

Score = shared tags x 2, + 3 same category, + 4 if slug is in a configurable `INTERNAL_LINK_PRIORITY_SLUGS` list (move it to config or a DB flag). Ties: newest `published_at`, then lower id. Top 3. Candidates: newest 40 public posts excluding the current one. Manual `related_posts` rows win, ordered by `sort_order`, capped at 3. REQUIREMENT: related cards use `srcset` and `sizes` (source: plain `<img src width=400 height=225 loading=lazy>`, no srcset).

### 10.5 Taxonomy pages

Category page: category must be active; posts matched by primary id OR pivot; 0 public posts -> 404; **`noindex,follow` when fewer than `TAXONOMY_MIN_INDEXABLE_POSTS = 2`**. Tag page: 0 posts -> 404; indexable only when `count >= 5` and `count <= 0.75 x total public posts` (`isTagIndexable`). Sidebars list only indexable taxonomies, **always including the current one** (source hid the current category when it had one post and rendered an empty "All Categories" heading). Paginate. The sitemap uses the same two rules.

### 10.6 SEO head (one `SEO` component for every page)

- `<title>` with brand suffix only if the total is <= 60; description; canonical **only on indexable pages**; robots `index|noindex, follow|nofollow` plus `max-image-preview:large, max-snippet:-1, max-video-preview:-1` only when indexable.
- OG: type, url, title, description, image, **image alt from the cover alt** (source defaulted alt text to the meta description), site name, locale; `og:image:width/height` only when real dimensions are stored (store them). Article: `article:author`, `published_time`, `modified_time`, `section`, de-duplicated `tag`s.
- Twitter: card (`summary` only if the post sets it), url, title, description, image, **image alt**, site when configured.
- `author` meta (source hardcodes a default founder name when none is passed; derive it from the post author), self-referential `hreflang` `en` and `x-default`, OpenSearch autodiscovery. RSS autodiscovery lives in the ROOT layout in the source, not in the SEO component; keep it in one place.
- Post `dateModified` prefers `content_updated_at`, then `updated_at`, `published_at`, `created_at`. Use the same rule on the blog index.

### 10.7 JSON-LD

Sitewide: `Organization` (with `areaServed` ONLY here) and `WebSite` with a `SearchAction`. Post: `Article` when pillar else `BlogPosting` with `@id` (`<url>#article`), `headline`, `description`, `image` (`ImageObject` with url, caption; source omits width and height because real dimensions are not stored, REQUIREMENT here: store dimensions on the post/media row and emit width and height, and emit `og:image:width/height` too), `thumbnailUrl`, `datePublished`, `dateModified`, `inLanguage`, `wordCount`, `isAccessibleForFree`, `author` (Person: `@id`, name, jobTitle, description, image, url, sameAs, worksFor, knowsAbout), `publisher {@id}`, `mainEntityOfPage` (`WebPage`), `isPartOf {@id}`, `speakable`, `keywords`, `articleSection`. Separate `BreadcrumbList`. `FAQPage` when FAQ exists and the post is not locked. **Reference the Person by `@id` instead of emitting it twice.** Blog index: `Blog` with `blogPost` (`BlogPosting` x first 10); source has NO `BreadcrumbList` on `/blog`, add one. Category and tag: `CollectionPage` with an `ItemList` plus `BreadcrumbList`. Serialise safely (escape `<`).

### 10.8 Feeds

- **RSS 2.0**: up to 50 newest public posts; channel (title, link, description, language, `lastBuildDate`, `atom:link rel=self`, image); items with `title`, `link`, `guid isPermaLink=true`, description, `pubDate`, `dc:creator`, `category`, `enclosure` only when type and byte length are real. **Add `content:encoded`** (the namespace was declared and unused), set `lastBuildDate` from the newest **modified** date, never fall back to `new Date()` for `pubDate`.
- **Sitemap**: static pages, `/blog` (with `lastmod` from the newest modified post), posts (with `lastmod` and `<image:image>` for the cover), indexable categories and tags. Share one `escapeXml` and one `absoluteUrl` between feeds (source: RSS imports `escapeXml` from the shared rss module but the sitemap defines its own copy, and both define their own `absoluteUrl`).
- Both go through an XML response helper: sha256 ETag, 304 on `If-None-Match` (supports lists, `W/`, `*`), 503 with `Retry-After: 60` and `no-store` on DB error. Cache: RSS `s-maxage=3600`, sitemap `s-maxage=300`.
- `robots.txt`: allow `/`, disallow `/admin` and `/api/`, list the sitemap.

### 10.9 Other public details

- Code highlighting with Shiki, theme `github-dark`, languages: javascript, typescript, tsx, jsx, svelte, html, css, json, bash, shell, sql, python, go, rust, yaml, markdown, xml, diff; unknown language -> plaintext. Cache the highlighter promise but **reset it if initialisation rejects** (source cached a rejection forever). **Log** per-block failures.
- View tracking (source uses `fetch` with `keepalive: true` and an empty `.catch`, not `sendBeacon`; referrer sent only on first load): a client call posts `{ path, referrer? }` to a page-view endpoint on every non-admin navigation, dropping consecutive duplicates. Log failures at debug level instead of swallowing.
- `/blog/+error.svelte`: 404 "Article not found", 403 "This post isn't available", 5xx "Something went wrong on our end", `noindex,nofollow`.
- Reduced motion respected everywhere; every list-surface card uses ONE `PostCard` (source's homepage block and featured card had divergent markup).

## 11. Design tokens and CSS

Use the repo's tokens and cascade layers. Put the shared prose structure in one stylesheet, import it inside the correct `@layer`, and let component styles supply colour only. No raw hex or rgba where a token exists (source hard-coded `#1A5F4F`, `#0d1117`, gold and green rgba gradients in several places); add tokens instead. Logical properties, native nesting, OKLCH where lightness matters. Keep the post body max width 900px, the TOC breakpoints above, and a sticky TOC at 1180px.

## 12. Tests (mandatory, test what changed per phase)

- **Unit (jsdom)**: schemas (valid and invalid), `getSeoScore` (one test per row of the table), content transforms (every step, plus the code and attribute dash exclusions), slug helpers, sanitiser (all cases in 7.1), `form-actions` (`canonicalFieldsAfterSave`, payload building, primary category rules), TipTap extensions (round trip parse/render for ImageWithDimensions, Callout, Vimeo, FontSize/FontFamily, BlockStyle), `syncEditorContent` caret behaviour, find and replace (literal, one undo step, boundaries), slash filtering, `handlePaste`, editor-actions (link, block format MUST NOT add font-size, font-family unset keeps colour), related-post ranking, TOC id generation, `isTagIndexable`.
- **Component**: PostEditor (blocked saves while pending, later edits stay dirty, publish failure leaves status untouched, canonical adoption, edits typed during a save are not overwritten, shortcuts, guard), MediaLibrary (focus trap, partial bulk failures keep selection, stale load responses ignored, folder list reload), RevisionDiffViewer, ImageControlMenu, modals.
- **Server (node config, `*.test.ts`)**: services against a real Postgres where behaviour is transactional (use `*.db.spec.ts` naming): atomic save rollback, publish-gate transitions (positive control, blocks with no category, cover alt equal to title, dashes stripped), scheduled patch rules (author required, past `scheduledAt` refused, 60 s grace), slug rename and redirect chains and rename-back, revision creation, dedupe and pruning, restore, featured demotion scoping, visibility predicate, cron idempotency and secret handling, media upload (every 4xx path, conversion fallback, variants and cleanup), media delete protection, unlock rate limit and cookie flags, locked payload has no leaked fields, caching headers by role.
- **E2E (Playwright, chromium, firefox, webkit; mobile projects separate)**: editor loads; toolbar tooltips and advanced controls; word counters update; pasted HTML is sanitised; media modal persists metadata and inserts with alignment, link and size, plus image control menu (No align, Replace, Alt and Title focus, Remove); Save keeps the editor open; **Publish leaves the editor with a real positive assertion** (assert navigation back to the list and the post's new status; the source's test passes vacuously and uses a fixed sleep); unsaved-navigation dialog (Cancel stays, Discard navigates, no native dialog); trash, restore, permanent delete; scheduled publish; password gate unlock; draft recovery after reload; stale-write conflict.
- **Prose parity**: for each viewport (1280, 1440) render the public post and the editor canvas for fixture posts with DIFFERENT bodies (source seeded identical bodies, producing byte-identical baselines) and diff structure plus pixels (`maxDiffPixelRatio 0.005`); assert both carry `prose-base` and `max-width: 900px`. (Source state: only `chromium-darwin` baselines exist and the suite is skipped on every other project and platform. REQUIREMENT for this port: also commit linux baselines or run the pixel diff in CI inside a pinned container, otherwise CI only checks structure.)
- **Hermetic E2E database**: global setup aborts unless `DATABASE_URL` points to localhost; seeds draft prose fixtures flagged `is_fixture=true` plus the two published e2e posts with `is_fixture=false` (public queries exclude fixtures, so published test posts cannot be flagged); global teardown deletes only rows matching an anchored slug regex; one author and one category are seeded because the publish gate blocks without them.
- Use `.toPass()` retry loops for hydration waits, never fixed sleeps.

## 13. Defects found in the source system (fix; do NOT replicate)

Editor: block-format adds inline px font sizes; `setFontFamily('')` removes the whole text style; ⌘F advertised, not wired; X embed: URL interpolated unescaped with no host check, and its class and data attribute are dropped by the editor schema (certain from the schema, untested); upload errors only logged; Montserrat missing from the font URL, editor fonts not loaded publicly; sanitiser drops task checkboxes and strips the invalid-Vimeo class; the sanitiser adds `noopener` but not `noreferrer` to pasted `_blank` links (the editor's own link popover always writes `noopener noreferrer`); sync effect paused in HTML mode; Replace All double-emits; dropdowns dismissed by `onblur` plus timeout; primary and advanced toolbar toggles lack `aria-pressed` (the bubble and image menus have it); slash menu lacks `aria-activedescendant` and swallows Enter on zero matches; no code-block language selector.
Editor UI: slug input vanishes when emptied; slug overwritten on title keystroke; autosave inserts a revision every minute with no change and never clears dirty; no draft recovery for new posts; "Save Draft" silently unpublishes a live post; inconsistent "Update" semantics and misleading `⌘S` tooltip; three different score thresholds (50/80, 70, 80); duplicate focus keyword inputs; existing posts ignore the saved tab; `getPostById` returns trashed posts; forced `isActive:true` on author and category updates; quick edit collapses categories and hardcodes statuses; plaintext post password in a `type=text` field; no concurrency control; missing label associations; unlabelled autosave status; score recomputed per keystroke; diff viewer is O(n·m); no draft preview; reassigned prop (`editingPost`); Cmd+S shortcut is case-sensitive (breaks with Caps Lock); no rate limit or audit on RPC mutations.
Server: REST `PUT /api/admin/posts/[id]` parses with the CREATE schema, which strips unknown keys, so `relatedPostIds` is always dropped and the service then deletes every related-post row (silent data loss; build one update schema and test that omitted vs empty `relatedPostIds` behave as documented); gate ran before sanitise and autofill; no transaction across pivots and revisions, duplicate tag ids break it; category deletion strips categories from scheduled posts; featured demotion unscoped and non-atomic; quick update skips dash stripping, `content_updated_at`, writes stale-content revisions, never clears passwords; REST lacks duplicate-slug mapping; media MIME check is declared-type only, encode failure fails open, SVG unsanitised, blob orphaned on insert failure, delete ignores usage, fake size URLs, case-sensitive wildcard search; revisions never pruned, `user_id` never written; cron compares secrets non-constant-time and plan cadence unverified; schema drift (CHECK and partial index missing from ORM schema, `hits` never incremented, non-unique redirect sources); category `metaDescription` max 160 vs 155; Shiki rejection cached forever; no audit table; `password_protected` allowed with no password; stale comments (transform order, scheduled gating).
Public: locked-post metadata leak; manual related posts unordered and uncapped; no prev/next, progress bar or pagination; positional heading ids and ignored stored TOC; author box hardcoded (note: slug rename redirects ARE wired in the source on both full update and quick update through `savePostWithRedirect`; keep both paths on it, and add a test per path); OG alt falls back to description; blog index `dateModified` uses a different rule; fixed 1200x675 cover attributes vs real ratio; dead comment CSS; RSS `lastBuildDate` ignores edits and `pubDate` falls back to now; category sidebar hides the current category.
Docs and tests: authoring guide has wrong section cross-references and omits the upload cap and variants; two identical pairs of parity baselines (the two public posts share the same seeded body, so 4 PNGs collapse to 2 distinct images); the "Publish leaves the editor" e2e test passes vacuously (it asserts nothing positive about leaving, only that IF the editor stays open a gate toast is visible, and it uses a fixed 1.5 s sleep); media tests cover only a thin slice: upload and conversion and variants have unit tests (`media-upload.test.ts`, `image-convert.test.ts`, `image-variants.test.ts`) and the upload handler has a few 4xx tests, but there are NO server tests for media PATCH or DELETE, none for the upload happy path with real conversion and variants through the handler, and none for the backfill script.

## 14. Phases (each: branch, commits, targeted tests green, summary of what you skipped)

1. **Foundations**: adaptation map, schema and migrations, shared constants (`meta-budget`, `slug`, `taxonomy`, `media-upload`), Zod schemas, audit table, sanitiser plus its test suite.
2. **Server services**: posts (transforms, autofill, gate, atomic save, redirects, revisions, featured), taxonomy, authors, media service, cron, caching, rate limits, audit writes. Server tests.
3. **Media pipeline and library UI**: upload, conversion, variants, API, unified library, tests.
4. **Rich text editor**: extensions, toolbars, menus, sync, paste, CSS parity. Component tests.
5. **Post editor shell**: form state, panels, SEO, publish box, autosave plus local draft recovery, conflict detection, guard, shortcuts, revisions UI, trash. Component and e2e tests.
6. **Public blog**: index, post, category, tag, TOC, related, JSON-LD, RSS, sitemap, password gate, error page. Route and e2e tests.
7. **Parity, accessibility pass, performance pass** (debounced score, off-thread diff), prose-parity snapshots, full gate once, docs.

At the end of each phase print: files created or changed, tests added and their results, anything skipped and why, and any open question. Run the full test gate exactly once, before the final push. Never push to the default branch directly; use a feature branch and a pull request.

## 15. Definition of done

- All section 13 defects are fixed or have an explicit written reason they were not.
- Every row of the gate table in 7.6 has a test; every sanitiser rule in 7.1 has a test.
- A real browser screenshot of the built editor and of a published post at 1280 and 1440 widths exists, and the editor canvas and public render match structurally.
- Accessibility: keyboard-only walkthrough of create, edit, insert image, publish, trash and restore works; every control has an accessible name; no focus traps without an exit.
- No `console.log`, no swallowed errors, no em or en dashes in user-visible strings, no `window.confirm/alert/prompt`.
- `svelte-autofixer` (or the repo's equivalent) reports no issues on every Svelte file touched.
