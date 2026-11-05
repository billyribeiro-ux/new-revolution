# Blog design verification — November 5, 2026

The live production archive and published article were inspected before the change at phone, desktop, and ultrawide widths. The desktop featured card began at approximately 1025px in a 1440px viewport and cropped its 16:9 artwork; the risk disclosure copy occupied a centered block of approximately 766px inside a substantially wider footer container.

The revised archive was rendered locally at 375, 768, 1440, and 2420px using an isolated copy of the article and media, plus local preview records to exercise the remaining-articles grid. At 1440px the featured card begins at approximately 814px, its artwork retains a 16:9 box, and the disclosure copy aligns with the 1376px footer container. At 2420px the container is centered and 1536px wide. At 375px the document width remains 375px. Production article data and the disclosure wording were not modified.

The Svelte MCP autofixer reported no issues for the archive, shared post card, and footer. The regression suite checks footer/container alignment across 320–2420px, archive search including long unbroken terms, featured media, publishing and discovery, JSON-LD, and article overflow. The final run passed 575 unit/component tests, 44 Chromium end-to-end tests, 15 Firefox and 15 WebKit end-to-end tests, three SEO checks, the production build and 46 prerender contracts. `pnpm check:css` and `pnpm check` passed; Oxlint, Svelte ESLint and changed-file formatting passed. `pnpm lint` stopped at two pre-existing, unchanged formatting failures: `blogs/first-blog.md` and `blogs/head-to-head-blog.md`. The test database and temporary admin accounts were local and disposable.

## Public release

PR [#31](https://github.com/billyribeiro-ux/new-revolution/pull/31) was squash-merged as `7e317301ae923b74c99826c9a1cdbc801b300536`. Production deployment `dpl_9LaYzMKyN2JVb3eZrawor6Ntcfue` was promoted after its protected homepage, archive and article returned 200 with the published article and article schema. The public domain was confirmed to resolve to that deployment.

After promotion, Chromium, Firefox and WebKit each rendered the homepage, archive and article at 320, 1440 and 2420px: 27 cases passed. Each checked response status, absence of horizontal overflow and disclosure/container alignment. Archive checks verified one featured card, loaded media, the visible search control and desktop media proportions; article checks verified the title and four body figures. Maintenance remained off. This public verification does not claim a full accessibility audit or a new SEO audit.
