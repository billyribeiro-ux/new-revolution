# Production maintenance / development Preview rollout

Date: 2026-11-03. Project `new-revolution`, team `will-ribeiros-projects`. Owner explicitly authorized resuming and deploying after the audit.

## Deployment and access separation

- Initial published maintenance deployment: `dpl_A7dnFG1hp9gczTQdDXxKG71FsPM3`, built from `e126374`. Both public domains display the custom maintenance page. Pages, nested routes, admin and API requests are blocked as documented; `/api/health` and immutable assets remain exceptions.
- First corrected normal Preview: `dpl_6YxbvS8kpG3QnvcGa2M5oGHk4pJ7`, built from the SSR runtime fix in PR #20. The stable development URL is <https://new-revolution-git-develop-will-ribeiros-projects.vercel.app>. Its Vercel authentication remains enabled. Later `develop` deployments can supersede this initial Preview.
- Environment scopes: Production maintenance `true`, Preview maintenance `false`; independent generated auth/password secrets; Preview origin set to the stable development URL. No credentials are recorded here.
- The project is resumed. The effective build command is `pnpm build`. Automatic custom Production-domain assignment remains disabled, so a later merge does not automatically replace the public maintenance deployment.
- Before resuming, authentication was temporarily enabled for all deployments to protect the old Production version. After the verified maintenance build was promoted, the original `all_except_custom_domains` scope was restored. The resume API changed automatic domain assignment to `true`; it was explicitly reset to `false` before proceeding.

## Data isolation

A new Neon resource named `revolution-preview` was created under the existing integration, explicitly using `free_v3`, region `iad1`, with Neon Auth disabled because the app already uses Better Auth. Only Preview is connected. The database had no public tables before initialization; `0000_blog_system.sql` and `0001_content_updated_at_backfill.sql` created 50 tables. No existing database was repurposed, no demo content or admin account was inserted, and no Production database was connected. Preview media uploads still require separate Blob configuration.

## Runtime issue found and fixed

A deployed unauthenticated `/api/admin/posts` request returned 500. Runtime logs identified `ERR_REQUIRE_ESM`: `sanitize-html`'s CommonJS entry required ESM-only `htmlparser2` in Vercel's `nodejs24.x` loader. Normal local checks had not reproduced it. Importing the external sanitizer with `node --no-experimental-require-module` reproduced the failure. After adding these packages to `ssr.noExternal`, the compiled admin API module imported successfully with that flag, and the deployed endpoint returned its intended 401. Sanitization rules and dependency versions were not changed.

## Verified results

- Full required gate on the runtime fix: CSS tokens, Svelte diagnostics (0 errors/warnings), plain TypeScript, full lint, 529 unit tests, production build, 47 prerendered page contracts, 3 SEO tests and 35 authenticated browser tests (no skips). Local seed account revoked afterward.
- Deployed maintenance: direct and nested pages return the custom HTML with 503; blocked APIs return JSON with 503; cache headers include `no-store`; self-hosted WOFF2 responds 200 with a valid WOFF2 signature.
- Live browser checks at 375 and 1440 pixels: maintenance layout has no horizontal overflow, fonts load, and no external font requests occur. The expected failed-navigation console line reflects HTTP 503; no application JavaScript or hydration failure was observed.
- Protected normal Preview: `/`, `/about`, `/blog`, `/admin/login` return 200; the maintenance state is false; `/api/health` returns 200 with database readiness true; unauthenticated admin/media APIs return 401; an unknown blog path returns 404; an unknown-account sign-in returns the generic 400 refusal.
- Normal Preview browser check: homepage renders with loaded fonts, no horizontal overflow, no failed resource responses and no console/page errors. An unauthenticated request to the Preview URL is redirected to Vercel authentication.

The public Production configuration remains a maintenance deployment. The Preview is a development environment, not evidence that Production's database, email, media, analytics and CMS account provisioning are ready for launch. Keep those release requirements separate from toggling maintenance off.
