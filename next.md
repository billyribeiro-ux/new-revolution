<task>
Audit and repair the blog tag/archive pages, article layout, featured images, Table of Contents, and FAQ interactions in this project.

Primary reproduction URL:
https://www.revolutiontradingpros.com/blog/tag/risk-management

Implement durable fixes at the shared component, layout, content-processing, or routing layer responsible for each defect. Complete the work through production verification, documentation, commit, push, and squash merge into main, subject to the repository’s required checks and branch protections.

Begin by inspecting the actual project and rendering the affected pages. Produce an evidence-based implementation plan, save it, then continue with authorized implementation. Do not stop after delivering the plan.

Do not claim perfection, enterprise compliance, plugin parity, or verified performance without supporting evidence.
</task>

<scope_and_authority>

1. Read repository instructions, existing architecture, adopted frontend standards, relevant agent documentation, and prior requirements before editing.
2. Preserve unrelated user work, content, integrations, and existing functionality.
3. Discover exact installed framework versions, package manager, validation commands, deployment adapter, repository remote, and branch state.
4. Use installed-version-compatible Svelte 5/SvelteKit practices and official documentation. Do not silently introduce a framework migration.
5. This project’s requested shared outer-container maximum is 2440 CSS pixels at the standard 16px root setting. Do not silently substitute 1440 or 2400.
6. Treat 2440px as an explicit product design decision, not a Google or Microsoft requirement. Record and resolve any conflicting existing project rule.
7. Recover the previously specified featured-image dimensions from project instructions, assets, documentation, or available conversation context. Do not invent dimensions. If they cannot be recovered, ask one focused question and continue independent repairs.
8. “FAQ” is the intended accordion/dropdown area unless inspection demonstrates otherwise.
   </scope_and_authority>

<phase_1_render_and_diagnose>
Render the live reproduction URL and its local equivalent. Inspect representative blog listing, tag archive, and article pages, including articles with FAQs and long TOCs.

Capture before-state screenshots, URLs, browser errors, relevant DOM/CSS measurements, and interaction recordings where available.

Investigate these reported problems without assuming their cause:

A. Clicking a tag exposes an unwanted “#” somewhere in the interface or URL.
B. Tag/archive pages contain excessive or poorly allocated empty space.
C. Shared page sections and article regions begin at inconsistent horizontal positions.
D. The TOC is incorrectly positioned or moves during hover, scrolling, or FAQ interaction.
E. Featured images have inconsistent dimensions or display widths.
F. Opening an FAQ unexpectedly moves surrounding layout or the TOC.

For the “#” issue, distinguish:

- Visible text or a CSS pseudo-element.
- A URL fragment or placeholder href.
- An incorrectly generated tag route.
- Markdown/content-processing output.
- A heading permalink or legitimate in-page anchor.
- Duplicate prefixing or incorrect encoding.

Inspect tag links from their originating cards/chips, not just by opening the destination directly. Trace the responsible data and component path.

Do not remove legitimate article heading anchors to conceal an unrelated tag defect.

For every finding, record:

- Reproduction steps.
- Expected and observed behavior.
- Affected routes/components/files.
- Evidence.
- Cause confidence: CONFIRMED, LIKELY, or UNRESOLVED.
- Proposed shared repair.
- Acceptance test.

Save the plan and findings under an appropriate project audit directory. Keep authentic reference evidence separate from implementation captures.
</phase_1_render_and_diagnose>

<layout_contract>
Repair the shared layout system rather than adding page-by-page compensating margins.

1. Use full-width section surfaces/backgrounds with a centered, responsive inner container.
2. Use one shared maximum-container token representing 2440px at the standard 16px root. If the project uses relative units, 152.5rem is the equivalent; retain user font scaling and document the unit choice.
3. The maximum includes the container’s inline padding through border-box sizing. Define gutters once and reuse them.
4. The container must shrink to available width. Do not force narrow screens to render a 2440px canvas.
5. Do not stretch sustained article text across the full container. Preserve a readable prose measure and use available space deliberately for navigation, media, and supporting regions.
6. Document the shared outer alignment anchor and article-column alignment anchor. Headers, archive content, article shells, and related sections must follow their defined grid consistently.
7. Do not introduce nested containers that accidentally double gutters.
8. Use content-driven section heights. Do not hide excessive spacing with negative margins, arbitrary fixed heights, global overflow clipping, or whole-page scaling.
9. Repair empty space by identifying its actual source: oversized padding, unnecessary minimum heights, reserved empty columns, container constraints, grid sizing, or missing content.
10. Verify intermediate widths, short viewports, larger text, and wide screens including 2440px and wider.
    </layout_contract>

<toc_reference_and_behavior>
The requested behavior reference is:
TOC-plugin/easy-table-of-contents

Locate that directory and inspect its actual source, version, configuration, styles, and relevant behavior. If unavailable, identify the correct official WordPress plugin source and document the version inspected.

Do not assume every plugin version/configuration behaves identically. Build a parity matrix covering the relevant configured features before implementation. Clearly identify anything that remains unverified.

Implement the relevant behavior natively in Svelte, preserving the project’s content architecture.

Required outcomes:

- Desktop TOC appears in the left rail.
- It is hidden on smaller layouts, with its grid space removed and no invisible focusable controls.
- Reuse an established responsive threshold when appropriate. Otherwise derive and document the threshold from the minimum usable TOC/article widths.
- The article remains readable and usable when the TOC is hidden.
- Heading hierarchy, numbering, exclusions, nesting, and initial expansion follow the verified plugin configuration.
- Heading IDs are deterministic and unique, including duplicate headings and supported non-ASCII text.
- TOC links reach the correct heading with the actual sticky-header offset.
- Direct fragment links, refresh, browser back/forward, and client navigation work correctly.
- Active-section tracking is stable during manual scrolling and anchor navigation.
- Hover/focus/active styling does not change item geometry, shift numbering, translate the main item, or move the article.
- The first/main numbered item, including “1”, remains geometrically stable during hover and active-state changes.
- Sticky positioning respects the header, article boundaries, viewport height, and footer.
- Long TOCs remain usable without trapping page scrolling or hiding keyboard focus.
- Reduced-motion preferences are respected.
- Event listeners, observers, and editor/content subscriptions are cleaned up.
- Article navigation does not duplicate observers or retain the previous article’s TOC.

Inspect parent overflow, transforms, grid/flex alignment, containing blocks, and height dependencies before selecting a sticky/fixed implementation. Prefer a simple CSS solution where it meets the verified behavior.

Do not rewrite the URL or create history entries continuously during passive scroll tracking.
</toc_reference_and_behavior>

<faq_stability>
Reproduce FAQ expansion/collapse at multiple scroll positions, including while the TOC is sticky.

Separate expected expansion of FAQ content from unexpected movement of the page shell, reading position, and TOC.

Repair:

- Accidental shared hover/transition selectors.
- Parent transforms or height animations affecting unrelated regions.
- Layout alignment that vertically repositions the sidebar.
- Sticky containing-block problems.
- Unintended scrollIntoView/focus calls.
- Scroll anchoring or scrollbar-width changes where relevant.

Do not freeze the entire article or clip expanded answers to create apparent stability.

Use accessible controls with correct expanded state, keyboard behavior, focus visibility, and relationships to answer panels.

Measure TOC/article coordinates and scroll position before, during, and after interaction. A low CLS score alone does not establish correct FAQ behavior, because some user-triggered movement may be excluded from that metric.
</faq_stability>

<images_and_google_guidance>
Recover and document the approved featured-image specification before changing its dimensions.

Distinguish:

- Source-image resolution.
- Rendered CSS width.
- Aspect ratio.
- Card thumbnail versus article hero.
- Crop/focal position.
- Responsive source selection.

Apply the approved specification through shared media components/tokens. Images in the same role must follow the same contract; do not force icons, logos, diagrams, thumbnails, and article heroes into one universal size.

Use appropriate width/height or aspect-ratio space reservation, responsive sources/sizes, and loading priorities. Do not lazy-load the likely above-the-fold LCP image without a justified reason.

Avoid enlarging low-resolution files until they become visibly degraded. Identify missing suitable sources.

Check relevant official Google Search Central and web.dev guidance current as of November 5, 2026. Cite the actual guidance used. Do not invent Google-mandated image dimensions, container widths, ranking guarantees, or “10000% compliance.”

Verify image delivery and cropping in the production build.
</images_and_google_guidance>

<implementation_and_verification>

1. Make coherent repairs to shared causes before local exceptions.
2. Use reactive derived values, appropriate browser lifecycle handling, and cleanup. Preserve SSR/hydration consistency.
3. Keep semantic HTML, accessible navigation/forms, server-side authorization, and content sanitization boundaries intact.
4. Add meaningful regression tests for the reported defects and shared behavior.
5. Test:
   - Tag navigation, correct filtering, encoding, direct entry, and absence of unintended “#” output.
   - Representative archives/articles and shared alignment.
   - Desktop TOC, hidden small-screen TOC, hover stability, scrolling, direct anchors, and navigation cleanup.
   - FAQ open/close behavior at top/middle/bottom positions.
   - Approved image roles, dimensions, sources, and crop.
   - Narrow/intermediate/wide widths, implemented breakpoint boundaries, 2440px and wider.
   - Keyboard operation, enlarged text, reduced motion, and relevant accessibility checks.
6. Run applicable Svelte/type/lint/tests and production build. Use the available Svelte analysis tools with the installed version.
7. Test the production output using the supported adapter/preview method, including deep links and configured deployment paths.
8. Inspect runtime errors, hydration warnings, failed required resources, screenshots, and geometry.
9. Measure performance under recorded conditions. Report lab results separately from field data. Do not promise field Core Web Vitals outcomes without field evidence.
10. Preserve comparison settings. Do not change screenshots, suppress warnings, remove tests, or relax criteria to manufacture a pass.

If tooling, access, reference configuration, or approved image dimensions are missing, complete independent work and disclose the precise remaining blocker.
</implementation_and_verification>

<documentation>
Update the changelog and all relevant maintained agent-facing Markdown documents to reflect the final implementation.

Document:

- The shared 2440px layout contract and alignment anchors.
- Responsive behavior and TOC visibility threshold.
- TOC behavior, reference version/configuration, and parity limitations.
- Featured-image specifications and asset handling.
- FAQ stability requirements.
- Component/token ownership.
- Commands and regression tests.
- Migration notes and documented exceptions.

Find and reconcile conflicting guidance. Preserve historical records and unrelated Markdown; do not rewrite every .md file indiscriminately or claim unverified features in documentation.
</documentation>

<git_delivery>
The user authorizes committing, pushing, and squash-merging this scoped work into main.

- Inspect the repository and remote before acting.
- Use the repository’s normal feature-branch/PR workflow.
- Commit only this task’s changes; preserve unrelated work and exclude secrets/audit session credentials.
- Push the feature branch and create or update the PR with the actual problem, final behavior, tests, and evidence.
- Satisfy required CI, review, and branch protections.
- Squash-merge this task’s PR into main when permitted. Do not rewrite unrelated history or force-push main.
- Reconcile merge conflicts carefully and rerun affected verification.
- Verify the resulting main-branch commit and report its SHA and PR link.
- If permissions or required review prevent merging, leave the concrete PR ready and report the exact blocker. Never bypass protections or claim a merge that did not occur.
- Do not perform a separate production deployment unless already authorized.
  </git_delivery>

<final_report>
Provide:

1. Root causes confirmed and repaired.
2. Before/after evidence for each reported issue.
3. Final layout, TOC, FAQ, and image contracts.
4. Tests and production verification results.
5. Updated documentation.
6. Commit, pushed branch, PR, and squash-merge status.
7. Any residual defects, unverified claims, or blockers.

Keep claims limited to observed evidence and tested scope.
</final_report>

<multi_agent_execution>
<objective>
Use subagents for independent investigation, implementation where safely
separable, and verification. Prioritize confirmed root causes and coherent
integration over parallel activity alone.
</objective>

  <ownership>
    <lead_agent>
      Own the shared architecture, implementation contract, integration,
      cross-page regression testing, documentation consistency, and Git delivery.
    </lead_agent>

    <layout_and_routing_agent>
      Investigate tag navigation, unintended hash output, shared containers,
      alignment, spacing, and responsive layout.
    </layout_and_routing_agent>

    <toc_and_faq_agent>
      Investigate plugin behavior, heading anchors, scroll tracking, sticky
      positioning, hover stability, FAQ expansion, and lifecycle cleanup.
    </toc_and_faq_agent>

    <media_and_quality_agent>
      Investigate image specifications, responsive delivery, accessibility,
      performance, and browser-verification coverage.
    </media_and_quality_agent>

  </ownership>

<coordination_rules>
<rule>
Establish shared root causes, acceptance criteria, component boundaries,
and file ownership before parallel implementation.
</rule>
<rule>
Do not allow concurrent edits to shared files. Route shared-layout,
token, configuration, and integration changes through the lead agent.
</rule>
<rule>
Each agent must return evidence, affected files, confidence in its
diagnosis, proposed changes, verification results, and unresolved issues.
</rule>
<rule>
Agents must distinguish confirmed observations from hypotheses and
must not expand the authorized scope independently.
</rule>
</coordination_rules>

<integration_and_release_gate>
<requirement>
The lead agent must reconcile findings and resolve conflicting assumptions
before integrating changes.
</requirement>
<requirement>
Run the complete affected regression suite and production-browser checks
after integration. Passing isolated agent checks is insufficient.
</requirement>
<requirement>
Obtain an independent review of the final integrated diff and browser
evidence before squash-merging. Correct findings and rerun affected checks.
</requirement>
<requirement>
Follow all repository CI, review, and branch-protection requirements.
Subagent approval does not replace required repository approval.
</requirement>
<requirement>
Report remaining defects and unverified coverage honestly. Additional
agents or higher reasoning settings do not constitute proof of correctness.
</requirement>
</integration_and_release_gate>
</multi_agent_execution>
