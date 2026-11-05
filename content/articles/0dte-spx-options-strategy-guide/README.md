# First blog: reviewed publication package

Read the [current CMS publishing guide](../../../blog%20implementation.md) and [agent handoff](../../../docs/BLOG_AGENT_HANDOFF.md) first. This package is based on `blogs/first-blog.md`, whose original bytes are preserved and hashed in `post.json`. Research notes, competitor claims and the embedded Argon prompt are not article body content.

- `article.html`: complete CMS body template, without a duplicate H1/cover. Four `asset:<key>` image bindings must be replaced with the real uploaded URLs before saving. Never submit an unresolved template.
- `post.json`: environment-independent editorial metadata and plain FAQ pairs. This is **not** a REST payload: resolve author/taxonomy IDs and encode the JSON-bearing fields according to the CMS schema.
- `assets.json` and `assets/`: five original diagrams plus card/social derivatives, actual dimensions, byte budgets, captions, provenance and SHA-256 hashes. SVGs are editable sources with the self-hosted OFL font embedded; WebPs are upload candidates.
- `study.thinkscript`: the complete price-only study embedded in the article. Source-reviewed, not compiled or replayed in thinkorswim. Do not call it a dealer gamma model or production-validated trading tool.
- `CLAIM_LEDGER.md`: primary-source decisions and corrected mathematics.
- [Acceptance record](../../../docs/reviews/first-blog-2026-11-05/VERIFICATION.md): exact tested revision, environment and limitations.

## Save the package

1. Inspect the actual target CMS for slug collisions. The archived 0DTE and position-sizing packages are not an approved reason to overwrite or bulk-import anything.
2. Upload each WebP through the media library or existing media service. Keep returned `MediaItem.urls.original`, dimensions, available sizes and cover crops. Do not use the database row's `blobUrl` field name on a `MediaItem` response.
3. Replace each `asset:<key>` in the body with that asset's returned URL. Use `execution-map` as cover and `execution-map-social` as OG image. The card derivative is supplied for design review; the normal CMS upload pipeline also creates the actual card-width variants. Do not invent suffix URLs.
4. Resolve/create the real author and taxonomy through the existing services. Keep credentials/experience empty until documented. Map FAQs and secondary keywords to JSON strings; supply category/tag IDs as numeric arrays. Set `featured=true` for the lead placement and `isPillar=false` for the selected BlogPosting schema. The actual schema field is `featured`, not `isFeatured`.
5. Save **draft** through `createPost` or the authenticated editor/API, reload, compare normalized content and inspect the signed preview. No manually edited article-title array or schema script is needed.
6. Review the exact revision and publish only in the intended environment. Publication automatically supplies homepage/archive placement. Indexing remains separately gated; do not remove that gate as a side effect of publishing one article.

No new importer command is claimed. The temporary local operator used the existing services and actual sanitizer/gate; it is not a supported deployment CLI. For application changes use the existing `pnpm` scripts and full `pnpm build` from [the Vite+ contract](../../../docs/VITE_PLUS_WORKFLOW.md). Content-only acceptance must inspect the exact saved article; fixture-only repository tests cannot validate a different hosted record.
