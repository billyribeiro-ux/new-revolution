-- Forward-only, idempotent data migration (blog-editor-report.md, Phase 2 / G3).
-- `content_updated_at` is the editorial modification date behind dateModified, RSS and sitemap lastmod.
-- Readers previously fell back to `updated_at`, which any row write moves, so a published post with no
-- editorial date now takes its publication date instead. Rows that were never published stay NULL (no date is
-- better than an invented one). Re-running changes nothing: only NULL rows are touched.
UPDATE "posts"
SET "content_updated_at" = "published_at"
WHERE "content_updated_at" IS NULL
  AND "published_at" IS NOT NULL;
