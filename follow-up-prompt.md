Continue the maintenance integration. Your previous response is a discovery report, not a completed implementation.

Use the findings you already established. Do not repeat repository discovery unless you need to verify something that may have changed.

CONFIRMED CONTEXT

- Source: `/Users/billyribeiro/dev/revolution-trading-pros`.
- Destination: the current repository.
- Destination uses Svelte 5.57.3, SvelteKit 3.1.1, adapter-vercel 7.0.2, and pnpm, subject to confirmation from its current manifests.
- Marketing routes are prerendered.
- The source maintenance page includes animated simulated market data, lightweight-charts, GSAP, and a notification endpoint.
- The source hook uses HTTP 307 redirects.
- The notification endpoint stores subscribers in memory.
- Svelte MCP tools were unavailable in your previous session.

YOUR REQUIRED OUTCOME

Implement and verify a complete maintenance mode in this repository, adapting the source page’s design and behavior to the destination architecture.

Discovery is already sufficient to begin engineering. Resolve the routing problem through focused investigation, implementation, and experiments. Architectural uncertainty is work to perform; it is not, by itself, a blocker requiring the user.

Do not return another findings-only handoff while authorized implementation or verification work remains possible.

1. ESTABLISH ACCEPTANCE CRITERIA

The completed implementation must demonstrate:

- Maintenance enabled: covered page requests return the maintenance experience with HTTP 503.
- Maintenance disabled: normal application behavior returns.
- Direct requests and navigation from an already-open application behave consistently within a documented activation model.
- Required maintenance assets load successfully.
- API routes, health checks, authentication, and operational access have explicit, justified behavior.
- Maintenance content cannot become incorrectly stuck in caches after deactivation.
- Protected application content is not served through a route that the maintenance gate is intended to cover.
- Any bypass is server-authorized and cannot be enabled through an untrusted client flag.
- The transferred page works without console errors, hydration failures, broken assets, or inaccessible core interactions.
- Activation and deactivation procedures describe their actual deployment requirements.

Do not promise instantaneous switching if the chosen mechanism requires redeployment. Define the supported behavior precisely.

2. RESOLVE THE PRERENDERING AND VERCEL ROUTING DESIGN

Investigate how requests reach this application in development, the adapter output, and Vercel deployment.

Evaluate a small number of viable approaches, then choose and implement the simplest one that satisfies the acceptance criteria. Consider build/deployment-time maintenance variants, targeted rendering changes, or another officially supported routing mechanism when justified.

Do not:
- Assume a SvelteKit hook intercepts prerendered assets.
- Introduce Vercel middleware that conflicts with supported SvelteKit deployment guidance.
- Globally disable prerendering without evaluating its impact.
- Treat inability to access production as inability to implement and verify locally.
- Spend the entire task comparing options without building a testable candidate.

Use official, version-relevant documentation. Create a minimal routing experiment if needed. Inspect generated deployment output and test the chosen design.

Unless an existing requirement demands runtime switching, a documented deployment-time switch is an acceptable default. Implement it completely if it meets the application’s needs.

Distinguish:
- Behavior proven locally.
- Behavior established from generated adapter output.
- Behavior requiring a Vercel preview or production environment.

Never present those as equivalent evidence.

3. TRANSFER AND ADAPT THE PAGE

Inspect the source implementation closely, then transfer its relevant:
- Layout and visual hierarchy.
- Components, styles, assets, and animations.
- Chart behavior and responsive states.
- Maintenance messaging and user interactions.

Adapt the code to destination conventions and installed dependencies. Preserve the intended design without copying obsolete patterns, secrets, unrelated configuration, or unsafe behavior.

Use idiomatic Svelte 5:
- Clear state ownership and appropriate reactivity.
- Derived values for computed state.
- Effects only for actual side effects.
- Correct cleanup of charts, animations, listeners, timers, and subscriptions.
- Safe browser-only initialization.
- Reduced-motion support.
- Semantic, keyboard-accessible controls.
- Responsive layouts that handle small screens and long content.

Clearly identify simulated market data as simulated or illustrative.

4. COMPLETE THE NOTIFICATION BEHAVIOR HONESTLY

Inspect the destination for an existing durable subscription or notification service.

If one exists, integrate with it using server-side validation, suitable abuse protection, accessible feedback, and explicit error handling.

Do not transfer an in-memory subscriber store into a serverless deployment.

If no durable service is available:
- Complete the maintenance page and routing independently.
- Do not leave an active form that pretends to save subscriptions.
- Omit the unavailable notification interaction or provide an existing, truthful contact/status alternative.
- Document the precise external dependency required to enable subscriptions later.

Lack of notification infrastructure must not block the rest of the implementation.

5. IMPLEMENT AND TEST IN COHERENT INCREMENTS

Make working changes now. For each increment:
- State the specific behavior being implemented.
- Implement it.
- Run the relevant checks.
- Inspect the actual result.
- Fix failures before proceeding.

Add focused regression tests for the maintenance gate and meaningful route exceptions.

Test at least:
- Enabled and disabled states.
- Root and representative nested routes.
- Direct navigation and client navigation.
- Maintenance assets.
- Relevant API and health-check behavior.
- Response status and cache headers.
- Activation/deactivation lifecycle.
- Notification success and failure only if that integration is implemented.

Use the actual project scripts. Run applicable formatting, linting, Svelte/TypeScript checks, tests, and production builds. Inspect adapter output where it is material to routing correctness.

Run the rendered page in an available browser and inspect:
- Desktop and mobile layouts.
- Keyboard operation and focus.
- Reduced motion.
- Chart and animation cleanup.
- Console and network errors.
- Repeated navigation and reloads.

6. TOOL AVAILABILITY IS A VERIFICATION LIMITATION

Use Svelte MCP documentation, analysis, and autofix tools if they are actually available.

If they remain unavailable, continue with official documentation, repository tooling, Svelte checks, tests, builds, and browser inspection.

Do not claim MCP verification occurred. Do not leave otherwise implementable work unfinished solely because a preferred tool is missing.

Apply the same principle to deployment access: complete local implementation and all available verification, then identify the exact deployment-only check remaining.

7. STOP ONLY FOR A CONCRETE DEPENDENCY

A genuine blocker is a specific missing credential, permission, unavailable source artifact, or unresolved product requirement that prevents a particular operation.

For each blocker:
- Identify exactly which operation it prevents.
- Complete all independent work.
- Preserve a runnable, reviewable implementation.
- Ask only for the minimum input needed to continue.

A design choice you can investigate, an unavailable optional tool, or a failed first approach is not sufficient reason to stop.

Do not deploy or publish without authorization. Do not modify unrelated application behavior or overwrite existing user changes.

8. REQUIRED HANDOFF

Return:
- What you actually implemented.
- The important changed files.
- The chosen routing design and why it covers prerendered requests.
- Exact activation and deactivation instructions.
- Commands executed and their actual results.
- Browser scenarios actually exercised.
- Any remaining deployment-only verification or external integration dependency.

Clearly distinguish completed work from unresolved work. Do not say “complete” if required behavior remains unimplemented or unverified.

Begin by resolving the routing design into a testable implementation, then transfer the page and finish the integration. Continue through verification rather than returning another plan.