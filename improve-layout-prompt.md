> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](docs/BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

> **Fonts and article fragments — November 5, 2026:** Follow the [verified policy](docs/FONT_AND_FRAGMENT_POLICY.md). Same-origin font hrefs and native TOC anchors are valid; verify request origins and keep section fragments out of page canonicals.

Act as a principal frontend engineer specializing in Svelte 5 and SvelteKit, and as a design director specializing in premium trading platforms, financial interfaces, interaction design, and accessibility.

Audit the implemented maintenance-mode experience and produce an evidence-backed design improvement plan. This assignment is an audit and proposal: inspect the code and interact with the running page, but do not modify application code yet.

OBJECTIVE

Propose a maintenance experience that feels unmistakably part of this brand: professional, visually distinctive, trading-focused, polished, and trustworthy.

Aim for exceptional design through typography, composition, restraint, and purposeful interaction. Avoid generic trading dashboards, decorative complexity, excessive animation, and unsupported claims that a design is “award-winning.”

1. UNDERSTAND THE BRAND AND IMPLEMENTATION

- Read applicable repository instructions.
- Confirm the installed framework versions and inspect the maintenance page, its components, assets, styles, and activation behavior.
- Inspect the surrounding website for established logos, colors, typography, spacing, imagery, tone, and interaction patterns.
- Identify what should be preserved, what is inconsistent, and where the maintenance page weakens or strengthens the brand.
- Understand the page’s purpose: explain the interruption, maintain confidence, and give visitors a useful next action.

2. INSPECT THE ACTUAL EXPERIENCE

Run the application and open the maintenance page using the supported activation mechanism.

Inspect representative mobile, tablet, and desktop sizes, including a short laptop viewport. Exercise every visible control and observe loading, hover, focus, error, and reduced-motion states where applicable.

Evaluate:

- First impression and clarity within five seconds.
- Visual hierarchy, composition, alignment, spacing, and balance.
- Typography, readability, contrast, and text wrapping.
- Trading imagery, charts, data density, and animation.
- Navigation, calls to action, status messaging, and notification forms.
- Responsive behavior, overflow, clipping, and content visibility.
- Keyboard access, focus visibility, semantics, and motion sensitivity.
- Rendering stability, asset loading, and animation performance.

Capture screenshots and reference specific components or files when supporting findings. Separate observed problems from subjective design preferences.

If runtime inspection is unavailable, continue the code audit and explicitly identify which visual conclusions remain unverified.

3. RESEARCH RELEVANT DESIGN REFERENCES

Research a small, carefully chosen set of leading trading or financial products and premium maintenance/status experiences available as of the audit date.

Use official sources and firsthand inspection where possible. Explain which specific principles are relevant to this brand, such as chart restraint, typography, status communication, or interaction feedback.

Include source links. Do not copy another product’s branding, assets, or distinctive composition. Do not treat popularity as proof that a pattern fits this page.

4. DEVELOP ONE RECOMMENDED DESIGN DIRECTION

Present one cohesive recommendation with enough detail to review and implement.

Specify:

- The central visual concept and its relationship to the existing brand.
- Page structure and content hierarchy.
- Typography roles, spacing rhythm, content widths, and responsive layout.
- Background treatment, surfaces, borders, color usage, and contrast.
- Trading-related visuals and their intended purpose.
- Interaction behavior, animation timing, and reduced-motion alternatives.
- Maintenance copy, status information, and primary/secondary actions.
- Loading, empty, validation, success, and failure states for any proposed interaction.
- Mobile adaptations and elements that should simplify or disappear at smaller sizes.

Describe where major elements sit and how they behave. Avoid vague prescriptions such as “make it cleaner,” “add polish,” or “make it pop.”

Keep market visuals honest: simulated data must be identifiable as illustrative. Do not propose fabricated live prices, countdowns, progress percentages, or restoration estimates.

Any subscription, status, or notification feature must have a real implementation path. Identify external dependencies rather than assuming they exist.

Include a lightweight annotated layout or wireframe if it makes the recommendation clearer. Label it as a proposal.

5. PROVIDE AN IMPLEMENTABLE PLAN

For each proposed change, include:

Observed issue | proposed change | user/brand benefit | affected components | priority | effort | acceptance criteria

Prioritize:

1. Clarity, broken interactions, accessibility, and responsive defects.
2. Brand consistency, hierarchy, typography, and layout.
3. Purposeful trading visuals and interaction refinement.
4. Optional enhancements with clear value.

Explain meaningful tradeoffs, especially animation versus performance, visual richness versus clarity, and new dependencies versus existing capabilities.

Keep the plan idiomatic to the installed Svelte version. Address lifecycle cleanup for charts and animations, browser-only initialization, and preservation of existing maintenance routing, HTTP status, and caching behavior.

6. DELIVER A CONCRETE DESIGN REVIEW

Provide:

- A candid assessment of the current experience, including its strongest elements.
- Prioritized findings supported by screenshots, code references, or interaction evidence.
- The recommended design direction and annotated layout.
- Proposed maintenance copy.
- A phased implementation plan with measurable acceptance criteria.
- The verification required after implementation.
- Any decisions that genuinely require my input.

Recommend a direction confidently using the existing brand as the default. Ask questions only when the answer would materially change the design.

Do not implement changes during this task. Finish with a concrete, reviewable proposal—not a generic checklist or an offer to start the audit.

Start now by inspecting the implementation and opening the maintenance page.
