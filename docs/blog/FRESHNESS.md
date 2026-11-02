# Blog freshness targets (`docs/blog/FRESHNESS.md`)

**Status:** provisional. Targets marked _measure first_ are not promises until Phase 1 measures them on a Vercel preview deployment.

## Current behavior (evidence)

| Surface                                | Mechanism today                                                                                                                          | Worst-case stale window                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Article, index, category, tag (public) | `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400` (`src/lib/server/posts/cache.ts:4`) | 5 minutes fresh, then up to 24 hours stale while revalidating     |
| Private, password and admin responses  | `private, no-store, no-cache, must-revalidate`                                                                                           | none                                                              |
| `/rss.xml`                             | `s-maxage=3600` plus stale directives                                                                                                    | 1 hour fresh, then stale window                                   |
| `/sitemap.xml`                         | `s-maxage=300` plus stale directives                                                                                                     | 5 minutes fresh, then stale window                                |
| Purge                                  | `invalidatePublicBlogCache` only appends to an in-memory log (`cache.ts:18-26`); no CDN purge                                            | no purge exists                                                   |
| Scheduled publish                      | Vercel cron every minute (`vercel.json`)                                                                                                 | up to about 60 s after `scheduledAt`, plus the cache window above |

## Decided approach (owner approval 2026-11-02, see `docs/seo/DECISIONS.md` §6)

Purge by cache tag on every publish, edit, rename, unpublish, delete and restore. Use **delete** (not invalidate) for unpublish and delete, so the next request reaches the origin and gets the 404. Tags: one per post, plus `blog-index`, `blog-category-<slug>`, `blog-tag-<slug>`, `blog-feed`, `blog-sitemap`. Source: Vercel "Purging Vercel CDN Cache" (last_updated 2026-09-03).

## Targets

| Event                                                                  | Target                                                                                                                          | Basis                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Unpublish or delete: article URL stops serving the post                | _measure first_ (aim: 60 s)                                                                                                     | Vercel documents delete-by-tag but not propagation time |
| Publish or meaningful edit appears on article, index, feed and sitemap | _measure first_ (aim: 60 s)                                                                                                     | same                                                    |
| Until measured                                                         | stale ceiling of 5 minutes **only if** `stale-while-revalidate` is reduced; with today's headers the honest ceiling is 24 hours | `cache.ts:4`                                            |

Google's crawling and indexing of any change is independent of these targets and is not controlled by them.
