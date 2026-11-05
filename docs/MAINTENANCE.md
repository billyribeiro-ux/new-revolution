# Maintenance deployments

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

Maintenance mode is a **deployment-time** switch. It does not change an existing deployment and does not use the source project's CMS switch. The Vercel build command must run `pnpm build`, which runs `scripts/maintenance-build.mjs` after the Vercel adapter. The script installs routing and independent Node functions in `.vercel/output` using the [Build Output API](https://vercel.com/docs/build-output-api/configuration).

1. Account for existing tabs: versions older than this integration do not have the navigation check, and already downloaded content cannot be recalled. Ask visitors to reload, or wait for those sessions to end, before relying on client-navigation behavior. A protected Preview can verify the normal integration without exposing the unfinished site publicly.
2. To enable, set the Vercel project's build environment variable `MAINTENANCE_MODE=true` for the intended environment and create a new deployment. Verify a staged **Production** deployment with Production variables before promoting it; a normal Preview uses different variables. Merely editing an environment variable does not update an existing deployment.
3. To disable, remove the variable or set it to `false`, then create and verify a new deployment. Vercel environment changes affect [new deployments only](https://vercel.com/docs/environment-variables). Do not deploy or promote without the owner's authorization.

For a local build-output inspection, run `MAINTENANCE_MODE=true pnpm build`; inspect `.vercel/output/config.json` and `.vercel/output/functions/__maintenance_page.func`. Run `pnpm build` with the variable unset to regenerate normal output. `pnpm preview` serves SvelteKit's output, not Vercel's routing table, and therefore cannot itself demonstrate the deployment gate. Run `node --test tests/maintenance/build-output.test.mjs` for the output rules and function responses.

The enabled routing table matches before Vercel's filesystem route, so it also covers prerendered pages. Page and other non-API requests receive the independent HTML function; API requests receive a JSON function. Both return 503 with `no-store` browser and Vercel CDN headers and no `Retry-After` (there is no configured reliable reopening time). The status endpoint is a separate no-store function in normal deployments. The root layout checks it before completing a client-side navigation; a failed or unexpected check causes a document navigation. Content already displayed or previously downloaded in an open tab cannot be recalled.

Immutable assets and exact health, waitlist signup/confirmation/unsubscribe, signed Resend webhook,
authenticated waitlist worker, and privacy-policy paths bypass maintenance. Namespace lookalikes
and nested suffixes stay blocked. Operational handlers enforce methods and authentication;
confirmation and opt-out links are read-only GET documents followed by explicit POST actions.
Admin/auth, the existing publisher cron, lead capture and unrelated APIs remain blocked.
Maintenance is an availability control; immutable bundles remain accessible.

The maintenance page is generated from `scripts/templates/maintenance.html`. The build embeds the root stylesheet from Vite's client manifest and the existing square brand emblem, so its tokens, layout and logo do not depend on another successful request. Fontsource imports remain solely in `src/app.css`; the embedded compiled stylesheet refers to that deployment's same-origin immutable WOFF2 files. If fonts cannot load, the notice uses the configured system fallback. The build checks that every template CSS token is declared and that referenced assets exist.

The chart now uses a first-party bundled Lightweight Charts/GSAP entry, with continuous simulated
candlesticks, volume and EMA. It remains visible on mobile and provides pause/restart and a native
candle table. Reduced motion starts paused; offscreen/hidden playback stops advancing. The native
waitlist form initializes independently and works without JavaScript. The retry button still performs
a full document reload. See [waitlist operations](reviews/maintenance-waitlist/OPERATIONS.md) for
configuration, privacy, encryption, scheduling and the outstanding cloud/mailbox release checks.

Preview locally after `pnpm build` using `pnpm preview` and `/maintenance/index.html`. The local
preview is not Vercel's routing engine. Capture defaults off until explicitly configured.
`WAITLIST_SIGNUPS_ENABLED=true` controls both generated signup markup at build time and API
acceptance at runtime. Unset, `false` and other values keep the prepared email section visible inside a disabled native
fieldset, with a clear availability note. The support notice, chart and retry remain available. Enabling capture requires the documented
database/provider/scheduler/mailbox evidence and a new build. An unavailable backend returns an
honest error and never a saved-success message.

Before production use, verify a Vercel preview with direct and nested URLs, an already-open tab from the normal integration deployment, 503 status/body and cache headers, API and health exceptions, assets, and a second deployment with maintenance off. Local route-table tests and `vercel dev` are not proof of deployed CDN behavior. Deployments may have skew-protected clients or intermediary caches; verify the actual hostname and deployment configuration used by visitors.

## Active Vercel setup (checked 2026-11-04)

- Project: `new-revolution`, team `will-ribeiros-projects`; resumed with the verified maintenance deployment on `revolutiontradingpros.com` and `www.revolutiontradingpros.com`.
- Production: `MAINTENANCE_MODE=true`. Preview: `MAINTENANCE_MODE=false`. These are build-time values; changing either requires a new build.
- Only `main` is retained after branch consolidation. The former `develop` Preview URL records the earlier rollout; a deleted branch is not a current development workflow. `new-revolution-topaz.vercel.app` is a Production alias, not a development Preview.
- Project build override: `pnpm build`. Auto-assignment of custom Production domains is disabled; merges can create staged Production builds, but serving them publicly requires deliberate promotion.
- Production waitlist database, email/provider, encryption, rate-limit and capture-enable variables were absent at the release investigation. Capture stays off, with the prepared form visibly disabled, until the waitlist release prerequisites are satisfied.
- Preview has its own Neon database, `revolution-preview`, provisioned on `free_v3` in `iad1`. The existing two SQL migrations initialized 50 tables on the verified empty database. It is connected only to Preview; no Production database or admin account was provisioned by this operation. Configure Production services before eventually disabling maintenance. Preview media storage still needs its own Blob configuration before uploads can be used.
- Preserve `ssr.noExternal` for `sanitize-html` and `htmlparser2` in `vite.config.ts`: the Vercel Node 24 loader rejected their external CommonJS-to-ESM require even though local Node 26 checks passed. After changing these dependencies or SSR bundling, verify deployed dynamic pages and unauthenticated admin API 401 responses, not just prerendered pages.

For a future cutover from a paused or older deployment, temporarily protect **All Deployments** before resuming, keep automatic Production-domain assignment disabled, and verify the staged maintenance build before promoting it. Restore the existing authentication scope that exempts Production domains only after confirming the public domains point to maintenance. Vercel's resume operation reset `autoAssignCustomDomains` to `true` during this rollout; it was explicitly returned to `false`. Recheck the actual settings after resuming rather than assuming they remain unchanged.

Deployment evidence and verification boundaries: [2026-11-03 rollout](reviews/maintenance-design/PRODUCTION_DEPLOYMENT.md).

## A merged release is not a published release

On 2026-11-04, the public domains still served `dpl_A7dnFG1hp9gczTQdDXxKG71FsPM3`
from November 3 while the newer `main` build was `READY`. The project setting
`autoAssignCustomDomains=false` kept that newer build staged. A successful Git push, squash
merge or green build does not prove the public maintenance page changed.

For an owner-authorized production update:

1. Complete the [Vite+ gates](VITE_PLUS_WORKFLOW.md), including `pnpm build`, generated-page
   contracts, both capture states and browser verification. Confirm the merged commit SHA.
2. Inspect the exact new **Production** deployment with `vercel inspect <deployment-id> --json`.
   Confirm its commit, `READY` state and Production environment. Preview success is insufficient.
3. Check that staged build with `vercel curl / --deployment <deployment-id>` and the applicable
   nested paths, blocked APIs, immutable chart/font assets and no-store headers. Check capture
   behavior against the actual Production configuration, without submitting real email addresses.
4. Promote that verified deployment with `vercel promote <deployment-id> --scope will-ribeiros-projects`.
   Keep automatic domain assignment disabled; it protects subsequent unverified builds.
5. Independently fetch both public domains and load the canonical domain in a clean browser.
   Verify the new hero and chart, 503/no-store response, support/capture state, image dimensions,
   form identifiers, keyboard controls and narrow-screen layout. Record the deployment ID and
   evidence before reporting the public update complete. If it fails, restore the last verified
   maintenance deployment and investigate.

Vercel documents this as [promoting a staged production build](https://vercel.com/docs/deployments/promoting-a-deployment)
and provides the [promotion CLI](https://vercel.com/docs/cli/promote). Promotion reassigns the
Production domains to the selected build; it is a separate release step.

## Current maintenance / development handoff

The maintenance chart uses conventional green/red candles and volume, bounded intrabar movement
and crosshair inspection. It remains explicitly simulated; it is not represented as live market data.
The complete waitlist section remains visible while services are disconnected. See
[the connection checklist](WAITLIST_SETUP.md) for enabling the form, immediate thank-you/confirmation
mail, welcome receipt and separately consented progress updates. The owner will connect services later.

Use the [protected development Preview](https://new-revolution-development-will-ribeiros-projects.vercel.app)
for ongoing website work, with `MAINTENANCE_MODE=false`;
`pnpm dev` also runs the normal local website. Public Production remains in maintenance. Do not
use a Production deployment alias as the development URL or expose the unfinished website on a
custom development domain.

The stable alias currently pins the verified PR #25 Preview (`8560523`), whose tree equals merged
`main` (`6c35cf2`). It requires Vercel sign-in. Repoint it only after verifying a newer normal Preview,
as documented in [waitlist setup](WAITLIST_SETUP.md); it does not automatically follow `main`.
