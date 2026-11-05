# Blog freshness targets (`docs/blog/FRESHNESS.md`)

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](../BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

**Status:** Phase 1a done (headers and tags); purge not connected. Targets marked _measure first_ are not promises until measured on a Vercel preview deployment.

> **2026-11-05 listing exception:** homepage and `/blog` index now use `setNoStoreCache` for automatic CMS discovery. The 300-second cached behavior below still applies to article/taxonomy and other callers of `setPublicReadCache`; this follow-up does not connect the CDN purger.

## Current behavior (evidence: `docs/blog/COVERAGE_MATRIX.md`, `src/lib/server/posts/cache.ts`)

| Surface                                                          | Cache-Control                                                                     | Cache tags                       | Worst-case stale window                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| Article (public)                                                 | `public, max-age=0, s-maxage=300, stale-while-revalidate=60, stale-if-error=3600` | `blog-post:<slug>`, `blog-lists` | 5 min fresh + 1 min stale-while-revalidate = 6 min          |
| Index, category, tag (public)                                    | same                                                                              | `blog-lists`                     | 6 min                                                       |
| Private, password, admin, 403                                    | `private, no-store, no-cache, must-revalidate`                                    | none                             | none                                                        |
| Unknown article, category, tag; out-of-range or malformed `page` | no `Cache-Control` (not cached)                                                   | none                             | none                                                        |
| `/rss.xml`                                                       | `s-maxage=3600` + the same stale directives                                       | `blog-feed`                      | 61 min                                                      |
| `/sitemap.xml`                                                   | `s-maxage=300` + the same stale directives                                        | `blog-sitemap`                   | 6 min                                                       |
| Scheduled publish                                                | Vercel cron every minute (`vercel.json`)                                          | n/a                              | up to about 60 s after `scheduledAt`, plus the window above |

`stale-if-error=3600` applies only while the origin is failing: during an outage an unpublished post could still be served for up to an hour. Before Phase 1a these windows were 5 minutes + 24 hours (`stale-while-revalidate=86400`, `stale-if-error=86400`).

## Purge (Phase 1b, blocked on authorization)

Every lifecycle event already calls `invalidatePublicBlogCache`, which now maps the invalidated paths to tags (`tagsForInvalidatedPaths`) and passes them to a registered `BlogCachePurger`. **No purger is registered**, so tags are recorded in memory and nothing is purged. Registering one needs either the `@vercel/functions` dependency or a Vercel API token as an environment variable (both require owner authorization), plus a preview deployment to measure. Use **delete** (not invalidate) for unpublish and delete so the next request reaches the origin. Source: Vercel "Purging Vercel CDN Cache" (last_updated 2026-09-03).

| Event                  | Tags purged                                                   |
| ---------------------- | ------------------------------------------------------------- |
| Publish, edit, restore | `blog-post:<slug>`, `blog-lists`, `blog-feed`, `blog-sitemap` |
| Rename                 | the above for the new slug, plus `blog-post:<old-slug>`       |
| Unpublish, delete      | the same set, using delete                                    |

## Targets

| Event                                                               | Target                                                  | Basis                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Unpublish or delete stops serving the post                          | _measure first_ (aim: 60 s)                             | Vercel documents delete-by-tag but not propagation time |
| Publish or meaningful edit appears on article, lists, feed, sitemap | _measure first_ (aim: 60 s)                             | same                                                    |
| Until the purger exists                                             | 6 minutes (articles, lists, sitemap), 61 minutes (feed) | the header values above                                 |

Google's crawling and indexing of any change is independent of these targets.
