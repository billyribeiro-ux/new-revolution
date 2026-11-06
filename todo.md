# Indexing and launch follow-up

Updated November 5, 2026. Check the deployed site before marking an item done; local changes do not prove a production release or Google indexing.

- [x] Promote and verify the blog indexing and www canonical-domain release. Public deployment `dpl_BsMg9eQAp53q2NAAbhG58Fc9TZyj` serves application `33a1346`; all 19 sitemap URLs passed live HTTP, canonical and crawl checks. See `docs/reviews/blog-indexing-release-2026-11-05/VERIFICATION.md`.
- [ ] Submit `https://www.revolutiontradingpros.com/sitemap.xml` in the verified Google Search Console property and monitor the Page Indexing report. Google controls crawl and indexing timing and does not guarantee rankings.
- [ ] Complete the store's product content, pricing, checkout, legal and operational launch review. The `/store` section remains noindex and excluded from the sitemap until the owner authorizes launch; follow `docs/seo/LAUNCH_TRACKER.md` and the SEO standard when ready.
- [ ] Review thin blog category and tag archives as content grows. Their existing eligibility thresholds remain in force; publishing eligible content feeds the sitemap automatically.
- [ ] Complete the remaining CMS publication, scheduled-publication and cache-invalidation work described in `docs/blog/AUTOMATION_PLAN.md` and `docs/blog/FRESHNESS.md`; sitemap discovery does not eliminate editorial review or guarantee immediate cache refresh.
- [x] Verify the Sunday Alpha Protocol wording in 16 live navigation, marketing, room, resource and store pages.
- [x] Verify the live Sunday Alpha Protocol `/watchlist` page, internal navigation, canonical and sitemap entry in three browser engines.
- [ ] Confirm Google indexing for `/watchlist`, `/blog` and the published article in Search Console after sitemap submission; public HTTP checks do not establish Google index status.

- [x] Complete the repository font/supplied-fragment investigation, publish verified fixes and update the shared agent policy. PR #37 application `e62c340` is live; see `docs/reviews/font-fragment-audit-2026-11-05/RELEASE.md`. Source-draft formatting exceptions and the unrelated remaining launch tasks above are not represented as resolved.
