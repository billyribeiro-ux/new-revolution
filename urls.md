# Website URL inventory

Verified against the public site on November 5, 2026. This is a human-readable snapshot of public HTML pages, not a sitemap file for Google. URLs can change when content is published or removed.

## Sitemap and crawler files

- XML sitemap to submit in Google Search Console: https://www.revolutiontradingpros.com/sitemap.xml
- Robots file: https://www.revolutiontradingpros.com/robots.txt
- RSS feed: https://www.revolutiontradingpros.com/rss.xml
- `/sitemap` and `/sitemap.html` currently return 404. Google does not require an HTML sitemap; the XML sitemap already exists.

Google accepts a hosted XML sitemap or a plain-text sitemap with one fully qualified URL per line. Submit the XML sitemap in Search Console rather than this Markdown document. Submission is a discovery hint, not a guarantee of indexing. See [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Important: canonical-domain mismatch

The public site redirects the non-www domain to the www domain. However, all 17 indexable pages currently declare non-www canonical URLs, and the XML sitemap lists those non-www URLs. On November 5, all 17 sitemap URLs returned HTTP 308 redirects to their www counterparts. The direct www links below returned HTTP 200. Resolve the canonical-domain mismatch before treating this as a clean Google submission; the URLs below identify live destinations, not confirmed final canonical choices.

## Public pages currently allowing indexing (17)

These pages returned HTTP 200 without a `noindex` directive during this check. That does not guarantee Google will index them. The sitemap includes their non-www equivalents; see the canonical-domain issue above.

- https://www.revolutiontradingpros.com/
- https://www.revolutiontradingpros.com/about
- https://www.revolutiontradingpros.com/alert-services/spx-profit-pulse
- https://www.revolutiontradingpros.com/contact
- https://www.revolutiontradingpros.com/editorial-policy
- https://www.revolutiontradingpros.com/live-trading-rooms/day-trading-room
- https://www.revolutiontradingpros.com/live-trading-rooms/small-accounts-room
- https://www.revolutiontradingpros.com/live-trading-rooms/swing-trading-room
- https://www.revolutiontradingpros.com/mentorship
- https://www.revolutiontradingpros.com/our-mission
- https://www.revolutiontradingpros.com/privacy-policy
- https://www.revolutiontradingpros.com/refund-policy
- https://www.revolutiontradingpros.com/resources
- https://www.revolutiontradingpros.com/resources/etf-stocks-list
- https://www.revolutiontradingpros.com/resources/stock-indexes-list
- https://www.revolutiontradingpros.com/terms-of-service
- https://www.revolutiontradingpros.com/watchlist

## Public pages currently marked noindex (35)

These pages returned HTTP 200, but their `noindex` directives tell Google not to include them in search results. The existing sitemap intentionally excludes them. Do not submit them as indexable until the site owner launches the relevant section and its indexing policy is updated. See [Google: Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

### Blog

- https://www.revolutiontradingpros.com/blog
- https://www.revolutiontradingpros.com/blog/0dte-spx-options-strategy-guide
- https://www.revolutiontradingpros.com/blog/category/spx-options
- https://www.revolutiontradingpros.com/blog/tag/0dte-options
- https://www.revolutiontradingpros.com/blog/tag/risk-management

### Courses

- https://www.revolutiontradingpros.com/store/courses
- https://www.revolutiontradingpros.com/store/courses/contrarian-distribution-and-shorting
- https://www.revolutiontradingpros.com/store/courses/institutional-risk-and-trader-psychology
- https://www.revolutiontradingpros.com/store/courses/macro-cycle-inflection-mastery
- https://www.revolutiontradingpros.com/store/courses/move-prior-to-the-move-masterclass
- https://www.revolutiontradingpros.com/store/courses/move-prior-to-the-move-ultra
- https://www.revolutiontradingpros.com/store/courses/options-greeks-and-volatility-mastery
- https://www.revolutiontradingpros.com/store/courses/small-account-compounding-blueprint
- https://www.revolutiontradingpros.com/store/courses/spx-0dte-and-index-gamma-execution
- https://www.revolutiontradingpros.com/store/courses/working-pro-swing-trading-system

### Indicators

- https://www.revolutiontradingpros.com/store/indicators
- https://www.revolutiontradingpros.com/store/indicators/anchored-vwap-liquidity-bands
- https://www.revolutiontradingpros.com/store/indicators/institutional-volume-absorption
- https://www.revolutiontradingpros.com/store/indicators/move-prior-to-the-move-pro
- https://www.revolutiontradingpros.com/store/indicators/move-prior-to-the-move-system
- https://www.revolutiontradingpros.com/store/indicators/mp-early-in-n-out-pro
- https://www.revolutiontradingpros.com/store/indicators/multi-timeframe-squeeze-pro
- https://www.revolutiontradingpros.com/store/indicators/options-expected-move-corridor
- https://www.revolutiontradingpros.com/store/indicators/spx-dealer-gamma-levels
- https://www.revolutiontradingpros.com/store/indicators/volatility-regime-compass

### Scanners

- https://www.revolutiontradingpros.com/store/scanners
- https://www.revolutiontradingpros.com/store/scanners/high-octane-scanner
- https://www.revolutiontradingpros.com/store/scanners/liquidity-sweep-stop-hunt-scanner
- https://www.revolutiontradingpros.com/store/scanners/move-prior-to-the-move-radar
- https://www.revolutiontradingpros.com/store/scanners/multi-timeframe-squeeze-scanner
- https://www.revolutiontradingpros.com/store/scanners/opening-bell-gap-and-go-fade-scanner
- https://www.revolutiontradingpros.com/store/scanners/small-account-affordable-options-scanner
- https://www.revolutiontradingpros.com/store/scanners/smart-money-relative-volume-scanner
- https://www.revolutiontradingpros.com/store/scanners/spx-dealer-gamma-iv-skew-scanner
- https://www.revolutiontradingpros.com/store/scanners/working-pro-eod-swing-scanner

## Inventory boundaries

- Includes live public HTML pages discovered from the website’s links and the repository route inventory, plus the currently published blog article and its category/tag pages.
- Excludes admin, API and other private or operational routes; search/filter query variations; assets and external sites; and 13 inventory paths that returned 404. These are not a list of URLs to submit to Google.
- The XML sitemap is generated by the application. It automatically discovers eligible static routes and, once the blog indexing gate is lifted, eligible CMS-backed blog entries and taxonomy pages. It should remain the source of truth for future submissions.
