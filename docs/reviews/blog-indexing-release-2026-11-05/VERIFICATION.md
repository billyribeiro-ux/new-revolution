# Blog indexing Production release — November 5, 2026

The owner authorized launching blog indexing, keeping the www canonical host and keeping the store gated. PR #35 was squash-merged as application commit `33a1346d23a81273e79f9a481e39648bb3006adf`. Its READY Production deployment `dpl_BsMg9eQAp53q2NAAbhG58Fc9TZyj` (`new-revolution-hazrqww4u-will-ribeiros-projects.vercel.app`) was staged but had not replaced the public domain: automatic custom-domain assignment is disabled. A merged build alone therefore did not make the indexing changes public.

## Verification and promotion

The existing authenticated Vercel CLI checked the staged Production application before promotion. Its homepage and archive linked the actual published 0DTE article; the article emitted indexable metadata, its www canonical and a unified BlogPosting graph with matching identifiers. The generated sitemap contained both requested blog URLs and excluded the store. The CMS database was healthy, the health response identified `33a1346`, protected admin posts returned 401, and an unknown article returned 404. See [stage proof](stage-proof.json).

The operator promoted that exact deployment with `vercel promote dpl_BsMg9eQAp53q2NAAbhG58Fc9TZyj --yes`. The public domain was then tested without any bypass credentials. [Release identity](release-identity.json) confirms the public alias resolves to this deployment. The private deployment hostname continues to redirect anonymous requests to Vercel authentication. Maintenance remains off. No source application, CMS record, database schema, credentials, project launch controls or Preview protection was changed in this release-verification work.

## Public results

- `/blog` and `/blog/0dte-spx-options-strategy-guide` return HTTP 200, emit `index` metadata and matching www canonicals, carry no HTTP `noindex` directive, and appear in the XML sitemap. The homepage and archive link to the actual published article.
- All **19 sitemap URLs** return 200, have matching canonicals, allow Googlebot and have no noindex directive. Their non-www equivalents redirect to www in one 308 hop. The independent public inventory contains **52 HTML pages: 19 indexable and 33 noindex**. The remaining store and thin blog archive gates are intentional. Thirteen stale local fixture candidates returned 404; they are not public sitemap entries. See [crawl](sitemap-crawl.json), [redirects](redirects.json), [public HTTP results](public-proof.json) and the updated root `urls.md`.
- The live homepage, blog index, real article and `/watchlist` passed **24 browser cases**: Chromium, Firefox and WebKit at 320px and 1440px. Each case checks status, canonical, indexing metadata, one H1, horizontal overflow, font readiness, broken loaded images and uncaught page errors; homepage/archive cases also check the article link. [Browser results](browser-proof.json) and Chromium screenshots are alongside this file. The archive desktop and article mobile captures were visually reviewed.
- **16 live marketing, navigation, room, resource and store pages** contain Sunday Alpha Protocol and no longer contain the former Explosive Swings product label. See [label results](product-labels.json).

## Robots.txt and future articles

The existing Googlebot `Allow: /` rule already permits both requested blog paths; no Disallow rule blocks them. Google documents Allow and Disallow as path-based crawl rules, while Sitemap takes an absolute sitemap URL. Individual article URLs do not need to be registered in robots.txt. The live robots file now references `https://www.revolutiontradingpros.com/sitemap.xml`. [Google robots specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec).

The release removed the old blog indexing gate; adding redundant Allow lines would not have overridden the former page/header noindex directives. Eligible published CMS posts already enter the generated sitemap and structured data automatically. Thin archive thresholds and draft/protected/excluded-post checks remain in force. [Google noindex documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

The XML sitemap is ready for submission in the verified Search Console property. Search Console submission and Google-selected index/canonical state were **not** verified in this run. These public tests prove technical eligibility, not Google indexing, crawl timing or rankings. The remaining account-side and store/CMS work is recorded in `todo.md`. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Reproducing the evidence

The evidence scripts pin this historical deployment and application SHA; later releases require deliberately updating those expected identities. From a repository checkout with its locked dependencies and installed Playwright browsers, the browser proof can be repeated with `pnpm exec node docs/reviews/blog-indexing-release-2026-11-05/verify-browser.mjs`; set `BLOG_INDEX_PROOF_DIR` to an output directory. `python3 docs/reviews/blog-indexing-release-2026-11-05/verify-http.py public` repeats the live HTTP assertions and writes its result under `/private/tmp`; its `stage` mode uses the authenticated Vercel CLI. Do not copy credentials into committed evidence. The application build/test command contract remains `docs/VITE_PLUS_WORKFLOW.md`.

No application code changed after PR #35, so its recorded 576 unit/component, build, Svelte, CSS, 46-page prerender and SEO gate results were not represented as newly run here. This run adds real staged/public deployment, crawl, redirect and browser proof. The source-draft formatting exceptions and authenticated local admin-suite limits recorded in the prior changelog remain separate matters.
