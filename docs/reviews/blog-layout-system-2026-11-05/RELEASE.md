# Verified shared layout and blog release: November 5, 2026

[PR #39](https://github.com/billyribeiro-ux/new-revolution/pull/39) was squash-merged as `37a23f29491f872dbc736cb67ad701cb89112941` after its Vercel build, Preview checks and automated agent review passed. Independent local integration reviews are recorded in [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md). The verified Production deployment is `dpl_5jQtjbTdBmeHLYQBK8kMDZHRWZRG`, at `new-revolution-2dhdbttvh-will-ribeiros-projects.vercel.app`.

The operator verified that exact staged deployment, then ran `vercel promote dpl_5jQtjbTdBmeHLYQBK8kMDZHRWZRG --yes`. Anonymous public checks use no bypass cookies. `vercel inspect www.revolutiontradingpros.com` resolves to the same deployment ID, and public health identifies `37a23f2` with a healthy database. See [identity proof](release/identity.json) and the [merged PR/check record](release/application-pr.json). Later documentation builds remain staged unless deliberately verified and promoted.

## Live acceptance

| Check                                                                       |      Staged |    Public | Evidence                                                                   |
| --------------------------------------------------------------------------- | ----------: | --------: | -------------------------------------------------------------------------- |
| HTTP, metadata, graph, sitemap, robots, privacy, search and redirect policy |   63 passed | 63 passed | [stage](release/stage-http.json), [public](release/public-http.json)       |
| Chromium, Firefox and WebKit rendering/interactions                         |   57 passed | 57 passed | [stage](release/stage-browser.json), [public](release/public-browser.json) |
| Full public inventory and special-surface font audit                        |   57 passed | 57 passed | [stage](release/stage-fonts.json), [public](release/public-fonts.json)     |
| Additional body-search, RSS, crawler-header and redirect checks             | Not claimed | 30 passed | [public](release/public-runtime.json)                                      |

All 52 public inventory pages return 200. The 19 eligible pages have the expected www canonical, no noindex, and exactly match the generated sitemap; the 33 gated store/thin-taxonomy pages retain noindex and omit canonical tags. Search variants remain no-store/noindex without canonicals. Anonymous admin access returns 401, an unknown article returns 404, maintenance is off, and the private deployment hostname still requires Vercel authentication.

The public runtime checks use `GetYYYYMMDD`, observed in the article's code rather than its title or summary. Index, category, tag and legacy `q` searches each render exactly the published article; an unmatched keyword renders zero cards. RSS includes the article. All 19 sitemap URLs also pass with a simulated Googlebot user-agent header; this does not establish actual Google crawling or indexing. Non-www blog/article/product URLs redirect to www, and the old product route preserves both query and native fragment navigation.

## Rendering, fonts and interactions

The four primary routes were measured at 375, 1440, 2440 and 2800px in all three engines. Shared container positions and actual image boxes pass; images decode to real pixels, retain full diagram content and select genuine available variants. Local regressions additionally cover 1179/1180/1181px, narrow/intermediate widths, short viewports, enlarged text, keyboard navigation, cold DPR 1/2 selection and reduced motion. Source-density limits remain documented rather than hidden by upscaling.

The actual published article supplies authored numeric TOC prefixes, resolving the local fixture's coverage gap. All three public engines pass hover/number geometry, keyboard-native collapse/expand, direct no-JavaScript fragments, history navigation and passive tracking without URL changes. Last-FAQ expansion has **0px** unintended movement in measured panel, summary and scroll coordinates. A window marker proves true client navigation; article observer counts are **1 → 0 → 1** across article → Blog → history return, with no document reload. Raw coordinates are in the browser and identity reports.

All 52 public pages load both primary brand faces. The 57-surface public audit records **154 font and 259 stylesheet responses**, all successful and same-origin, with zero overflow, runtime errors, unexpected console errors or unfinished resources. The two existing metric-matched fallback aliases are accepted only when their registered rules are local-only, their descriptors match the loaded face, and they occupy the secondary position in the correct SSOT token. They are browser fallbacks, not additional downloaded families. Hosted analytics is intentionally untested: the probes locally fulfill only the exact passive pageview POST; every other attempted write fails.

The lead visually inspected the archive/article captures and the actual staged article header/cover and footer disclosure. Representative public captures: [blog desktop](release/public-blog-1440.jpg), [blog mobile](release/public-blog-375.jpg), [tag archive](release/public-tag-1440.jpg), [published article](release/public-article-1440.jpg), [Sunday Alpha Alerts](release/public-sunday-1440.jpg). These capture specified lab conditions, not field performance or a complete accessibility certification.

## Local gates and controlled rollout

[Local verification](VERIFICATION.md) records 674 unit/component tests, 71 authenticated Chromium cases, 26 focused Firefox and 26 WebKit cases, three SEO cases, 46 static page contracts, four maintenance-output cases and 41 clean official Svelte MCP analyses. Complete builds, Svelte diagnostics, CSS/font guards and code/Svelte lint pass. Full `pnpm lint` still reports formatting in three unchanged reference artifacts; no ignores or thresholds were changed to hide them.

The additive search migration and concurrency-safe backfill preceded application promotion. Production had one post and Preview had none; both have zero pending projections. All original Production post-field/date hashes match before and after migration/backfill. See [Production](release/migration.json) and [Preview](release/preview-migration.json). Original editorial briefs, article sources and revision history were preserved. All four disposable local administrators, including the final archive regression account, were revoked and their credential files were deleted; no Production administrator or email was created.

Probe corrections were evidence-based and did not change the application: no-JavaScript settling cannot depend on disabled animation callbacks; same-document fragment navigation has no new HTTP response; disabled Chromium scripts can report intentional CSP blocks; Firefox lazy image decoding must wait for a stable requested source; and hydration can discover an error-page stylesheet after the initial load event. Strict font/style failures, actual broken images and normal-JavaScript CSP errors remain failures. A scoped staged retry initially required destination-ownership evidence; linked Vercel inspection established the exact deployment/project before automatic review approved it. No rejection was bypassed.

## Remaining boundaries

Store launch, Search Console submission/index confirmation, dedicated Sunday Recon enrollment, higher-density originals and the separate proposed CMS intake/cache work remain in [todo.md](../../../todo.md). Publishing already drives the homepage, blog listings, JSON-LD, RSS and eligible sitemap records from CMS data; no manual per-title JSON-LD entry is needed. WordPress configuration identity remains unverified because no settings export was supplied. Rankings, field CWV, hosted analytics operation and unsupported legacy performance claims are not certified by these checks.
