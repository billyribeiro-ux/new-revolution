# Maintenance deployments

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
preview is not Vercel's routing engine. Capture defaults off until explicitly configured; an unavailable
backend returns an honest error and never a saved-success message.

Before production use, verify a Vercel preview with direct and nested URLs, an already-open tab from the normal integration deployment, 503 status/body and cache headers, API and health exceptions, assets, and a second deployment with maintenance off. Local route-table tests and `vercel dev` are not proof of deployed CDN behavior. Deployments may have skew-protected clients or intermediary caches; verify the actual hostname and deployment configuration used by visitors.

## Active Vercel setup (2026-11-03)

- Project: `new-revolution`, team `will-ribeiros-projects`; resumed with the verified maintenance deployment on `revolutiontradingpros.com` and `www.revolutiontradingpros.com`.
- Production: `MAINTENANCE_MODE=true`. Preview: `MAINTENANCE_MODE=false`. These are build-time values; changing either requires a new build.
- Development branch: `develop`. Use <https://new-revolution-git-develop-will-ribeiros-projects.vercel.app> for the normal application. It requires Vercel authentication. `new-revolution-topaz.vercel.app` is a Production alias, not the development Preview.
- Project build override: `pnpm build`. Auto-assignment of custom Production domains is disabled; merges can create staged Production builds, but serving them publicly requires deliberate promotion.
- Preview has its own Neon database, `revolution-preview`, provisioned on `free_v3` in `iad1`. The existing two SQL migrations initialized 50 tables on the verified empty database. It is connected only to Preview; no Production database or admin account was provisioned by this operation. Configure Production services before eventually disabling maintenance. Preview media storage still needs its own Blob configuration before uploads can be used.
- Preserve `ssr.noExternal` for `sanitize-html` and `htmlparser2` in `vite.config.ts`: the Vercel Node 24 loader rejected their external CommonJS-to-ESM require even though local Node 26 checks passed. After changing these dependencies or SSR bundling, verify deployed dynamic pages and unauthenticated admin API 401 responses, not just prerendered pages.

For a future cutover from a paused or older deployment, temporarily protect **All Deployments** before resuming, keep automatic Production-domain assignment disabled, and verify the staged maintenance build before promoting it. Restore the existing authentication scope that exempts Production domains only after confirming the public domains point to maintenance. Vercel's resume operation reset `autoAssignCustomDomains` to `true` during this rollout; it was explicitly returned to `false`. Recheck the actual settings after resuming rather than assuming they remain unchanged.

Deployment evidence and verification boundaries: [2026-11-03 rollout](reviews/maintenance-design/PRODUCTION_DEPLOYMENT.md).
