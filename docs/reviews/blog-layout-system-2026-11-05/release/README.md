# Release browser probe

Read the [mandatory blog handoff](../../../BLOG_AGENT_HANDOFF.md) before blog operations. This probe performs browser navigation and native disclosure interactions only. It does not create posts, submit forms, send email or change hosted data.

From the repository root:

```bash
pnpm exec node docs/reviews/blog-layout-system-2026-11-05/release/verify-browser.mjs --origin https://www.revolutiontradingpros.com --outdir /private/tmp/blog-release-browser
```

For the disposable local preview fixture:

```bash
pnpm exec node docs/reviews/blog-layout-system-2026-11-05/release/verify-browser.mjs --origin http://localhost:4593 --outdir /private/tmp/blog-local-browser --article institutional-order-flow-and-gamma-flip-playbook --tag spx-options
```

Protected staging can use `--cookie-file /private/tmp/stage-cookies.json`, containing a Playwright storage-state object or cookie array. Cookie values are never written to the report or console. Keep that file outside the repository.

The installed Playwright Chromium, Firefox and WebKit engines are required. The probe records failures and exits nonzero; inspect `browser-verification.json` rather than claiming coverage from the command alone. Chromium screenshots cover all four routes at 375/1440/2440px. A missing viable FAQ boundary is explicitly reported as not exercised. Separate HTTP/indexability checks remain necessary, including thin taxonomy rules. The same-window marker and observer counts establish actual client navigation cleanup; document reloads fail that scenario.

Run the companion HTTP proof against the expected release SHA:

```bash
pnpm exec node docs/reviews/blog-layout-system-2026-11-05/release/verify-http.mjs --origin https://www.revolutiontradingpros.com --sha EXPECTED_SHA --out /private/tmp/http-proof.json
```

It checks all 52 inventory pages plus health, maintenance state, protected surfaces, sitemap, robots, search and the legacy redirect. Protected staging can append `--cookie-file /private/tmp/protected-stage.json`. Review its JSON evidence separately from browser results.

The font inventory probe covers those 52 pages and five special surfaces at 1440px:

```bash
pnpm exec node docs/reviews/blog-layout-system-2026-11-05/release/verify-font-inventory.mjs --origin https://www.revolutiontradingpros.com --out /private/tmp/blog-font-inventory.json
```

It records loaded faces, resources, errors and overflow, accepts the same optional cookie file, and expects tokenless 400/unknown-route 404 responses. It fulfills the exact same-origin passive analytics POST locally with 204 and marks that endpoint untested; all other non-GET requests are blocked and fail the probe. It does not submit account forms.

For a bounded browser diagnostic, `--engine chromium --only-interactions` runs just the three interaction/fallback scenarios. Its JSON scope explicitly records the reduced coverage; it is not a substitute for the default full three-engine run. Progress is saved after every scenario. Native no-JavaScript fragment checks enter a fresh document after extracting the real SSR anchor; events from the probe's intentional extraction-document navigation are excluded from that target-document check.

The browser probe also blocks service workers and every hosted non-GET/HEAD request. Only the exact same-origin passive analytics POST receives a local 204; its hosted behavior remains untested. Unexpected attempted writes are recorded and fail the scenario.
