# Website layout and blog interaction contract

> **Blog work: November 5, 2026.** Read the [mandatory blog handoff](../BLOG_AGENT_HANDOFF.md) and [font/fragment policy](../FONT_AND_FRAGMENT_POLICY.md). This contract supersedes earlier container, font-choice and punctuation recipes. Implementation evidence is maintained in [the current audit](../reviews/blog-layout-system-2026-11-05/PLAN.md); a plan does not establish deployment. See the [verified release evidence](../reviews/blog-layout-system-2026-11-05/RELEASE.md) for actual deployed status.

## Shared outer and reading anchors

`src/app.css` owns the only outer maximum: `--max:96rem` (1536 CSS px at a 16px root). `.container` is 100% available inline size, border-box, centered, with `max-inline-size:var(--max)` and `padding-inline:calc(var(--gutter)/2)`. Never redefine its outer cap or nest it just to add gutters. Section backgrounds remain full width. The border-box edge and inner content edge are different measurement anchors.

Total gutters remain 24/36/44/56/40/64/112px at base/480/640/768/1024/1280/1536 widths. At 1440px the inner edge is 32px; at 1536px it is 56px; at wider viewports the centered 1536px frame starts at `(viewport - 1536) / 2` and content 56px inside that frame. These are product decisions, not search-engine requirements. Preserve user root-font scaling.

Article title, cover, prose, CTA, FAQ, author bio, share bar and related articles align 100% flush with the `.container` inner content edges (`1424px` max inner width at `>=1536px`). The left TOC rail sits outside the `.container` in the left viewport margin only from `118.75rem` (`1900px`, where `>=238px` of left margin accommodates `>=16px` left screen padding + `194px–260px` TOC + `28px–40px` padding before the article). Related/footer/archive content follows the shared outer content edge. No competing internal width caps, doubled gutters, fixed article heights, whole-page scaling or overflow clipping to conceal bad sizing.

## Archive, search and media

Index/category/tag share BlogArchive, ArchiveControls and ArchiveResults. No decorative tag hash or empty sidebar column. Results follow the heading/controls by 2–3rem. Regular cards cap 25rem; one-result cards cap 75rem and split equally from 48rem. Preserve GET query/topic state, explicit empty results and page controls. The service total includes the lead; the “More articles” display subtracts the displayed lead and omits the remainder section when none remain. Do not duplicate the lead or show an empty remainder as a positive result count.

Use `search`, accept legacy `q`, preserve search when changing category/tag, reset page on filter changes. Clear search stays in the archive; clear all returns /blog. Matching covers title, summary, subtitle/series, prepared visible body, captions and FAQ. Only unfiltered /blog has a separate lead; filtered results include the featured article normally. Search is no-store/noindex/no canonical. Existing post/taxonomy eligibility remains authoritative.

Approved original image roles: hero 1600×900 or 1200×675 under 90KB; regular 800×450 under 35KB; inline 1200×675 under 75KB; social 1200×630 under 80KB. Recovered from the preserved first-blog source and verified asset manifest. Informational diagrams stay uncropped 16:9. Reserve dimensions and reset media-link padding/min-height. Real media variants determine srcset; sizes describes actual slots. Prioritize the likely LCP image. Record insufficient high-density source resolution; never invent detail by upscaling. [Google images](https://developers.google.com/search/docs/appearance/google-images), [responsive sources](https://web.dev/learn/images/descriptive), [LCP](https://web.dev/articles/optimize-lcp).

## TOC and FAQ

The reference source is owner-provided Easy Table of Contents 2.0.89. No WordPress settings export was supplied. Follow the audit parity matrix; do not claim identical prior configuration. Preserve authored numbering, published IDs, nesting/exclusions, initial open state and per-post enablement. Duplicate/non-ASCII headings require deterministic unique IDs.

The native TOC hides below 118.75rem (1900px) with its focusable controls removed so it never shifts or cramps the container-flush blog content. Header measurement drives sticky inset+0.5rem and anchor/spy inset+1.5rem. Keep native anchors and collapse, stable hover/focus/active geometry, direct fragments/reload/back/forward/noJS, no passive URL changes, wheel chaining and cleanup. A bounded attachment reduces only navigation height near the reading boundary; natural sticky exit is expected when less than a usable row remains.

FAQs use native details, initially open first answer and independent toggles. Expanding an answer changes expected article height; it must not reposition an otherwise viable sticky TOC or unexpectedly scroll the reader. Measure geometry and scrollY, not CLS alone. Acceptance is ≤1px unintended shift where space remains. Test short viewports, 1899/1900/1920 boundaries, 2440+, 200% text, keyboard and reduced motion.

## Fonts and editorial punctuation

Only Montserrat display and Sofia Sans body/data/editor/code are intentional website/admin families. `--font-mono` is a compatibility alias to Sofia, not a third font. Fontsource CSS is imported once in app.css; same-origin hrefs remain valid. See the shared font policy for editor normalization, standalone CSS and the embedded SVG image exception. Actual email-client typography has delivery fallbacks.

Preserve CMS originals and revision history. Remove unsupported font declarations without losing content/other formatting. Reviewed source-copy edits remove unnecessary em dashes contextually; quotations, attribution, symbols, numeric ranges, code and URLs retain appropriate punctuation. CMS saves do not mechanically replace punctuation. `editorial_em_dash` is a zero-point nonblocking review advisory; en dashes are allowed. A green score does not verify claims or authorship.

## Search projection operations

Internal paired nullable search_text/search_excluded fields are derived, not editorial input. A source-change trigger invalidates them for older writers. Current writes refresh in the same transaction, separately after source updates. Read-only repeatable-read search derives pending records without writing, sharing eligibility/count/page predicates. Malformed nonempty custom metadata is excluded from search until repaired; valid flat-map and entry-array forms are supported.

Apply the new forward-only 0004 migration before the compatible deployment. `DATABASE_URL` must be the operator's intended database; never export bulk credentials. Run `pnpm db:backfill-post-search --dry-run`, then the same command with `--apply` after reviewing the summary. Keyset batches compare every source input, preserve dates and leave raced rows pending. Repeat safely until pending=0. Retain the trigger and read fallback after rollout. Complete/retry backfill promptly: pending body batches are bounded, but matching identifiers accumulate for the shared predicate. A future preparation/projection algorithm change requires an additive invalidation migration before re-backfill; the current CLI fills pending rows only. Restore/import/clone/internal rewrites must preserve projection parity.

## Validation and delivery

Use the existing pnpm scripts from [Vite+ workflow](../VITE_PLUS_WORKFLOW.md): check:css, check, lint, test:unit --run, build, check:pages, test:seo, test:e2e. Official Svelte MCP analyzes each changed component/module again after corrections. Production preview and the generated Vercel handler are separate gates; verify deployed requests/browser behavior too. Use disposable local administrators; revoke them afterward. No transport emails are needed for this task.

The product route is `/alert-services/sunday-alpha-protocol`. Update navigation, breadcrumbs, metadata, unified JSON-LD and inventories through their existing owners. Membership links are enquiries; no checkout or weekly Recon enrollment is established. Demonstrations remain visibly hypothetical. Maintenance stays off until the owner's later instruction. Store launch and Google indexing confirmation remain separate tasks.
