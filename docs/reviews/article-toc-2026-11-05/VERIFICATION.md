# Article layout and TOC verification — November 5, 2026

## Scope and reference

The owner supplied Easy Table of Contents 2.0.89 locally at `TOC-plugin/easy-table-of-contents/` (the supplied copy is outside the tracked worktree). Its `README.txt` and `assets/js/front.js` document heading-generated links, nested headings, sidebar placement, highlighting, smooth navigation and whole-list visibility controls. The shared Svelte article template implements those reader-facing behaviors using existing server-normalized heading IDs and per-post TOC enablement. Native `details` supplies keyboard and no-JavaScript disclosure behavior. The plugin's WordPress-specific settings, shortcodes, migration tools, third-party integrations and Pro-only options have not been ported; this is not a claim of full plugin feature parity.

## Layout and interaction

The live pre-change article at 1440px placed the title at x=270, cover at x=240 and text at x=434; at 768px its inline TOC occupied about 386px above the article. The shared template now aligns title, cover and text to one reading column (maximum 900px), within the existing responsive site container. A sticky TOC appears alongside the title and article at widths of 1180px and above; it is hidden below that breakpoint. Its visible caret controls a native disclosure; the list scrolls independently, indicates the current heading, follows the active entry when appropriate, and restores it on reopening. Nested ordered lists preserve heading hierarchy for assistive technology. No article content, production database or JSON-LD was changed.

The actual 0DTE article and its local media copy were rendered in Chromium, Firefox and WebKit at 320, 768, 1024, 1180, 1440 and 2420px. All 18 viewport cases, three no-JavaScript cases and three reduced-motion cases passed; desktop checks exercised keyboard disclosure, heading links and long-list reopening, and verified the cover and four body figures load. The before/after measurements were made against the live production article and an isolated local copy respectively. This review is not a complete accessibility audit.

## Engineering checks

- Svelte MCP autofixer: no issues in the changed article component. `pnpm check:css` and `pnpm check`: pass.
- `pnpm test:unit --run --maxWorkers 4`: 576 passed. Full production build and 46 prerendered-page contracts passed; standalone SEO suite: three passed.
- Full authenticated Chromium E2E: 48 passed. Firefox: 24 selected browser tests passed on an isolated alternate port; WebKit: 23 selected tests passed on the same port. One unrelated protected-post unlock test was excluded from WebKit's HTTP preview because that browser did not retain its secure cookie over HTTP; a separate local HTTPS proxy check returned 303, stored a secure cookie and rendered the unlocked post. The test proxy rewrote its upstream Origin for the local preview; this was a targeted cookie/flow check, not a production TLS test.
- Repository-wide `pnpm lint` stops on two unchanged existing formatting issues in `blogs/first-blog.md` and `blogs/head-to-head-blog.md`. Changed-file formatting, Oxlint and Svelte ESLint passed.
- A different local process occupied port 4173 during verification. Alternate-port test configuration and all databases, credentials, TLS files and copied media were disposable and local; the other process was left untouched.
