<script lang="ts">
	import * as declaredPublicEnv from '$app/env/public';
	import { BRAND, syncClientBrandEnv } from '#lib/config/brand.ts';
	import appStylesheet from '../app.css?url';
	import { asset } from '$app/paths';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import type { LayoutProps } from './$types';

	syncClientBrandEnv(declaredPublicEnv as unknown as Record<string, string | undefined>);

	let { data, children }: LayoutProps = $props();

	// The matching SSR-head bootstrap restores reloads before Kit's modules arrive.
	// SPA navigation and BFCache continue to use Kit and the browser's own state.
	function saveDocumentScrollPosition() {
		try {
			sessionStorage.setItem(
				'rtp:page-reload-scroll:v1',
				JSON.stringify({
					path: location.pathname + location.search,
					x: scrollX,
					y: scrollY,
					savedAt: Date.now()
				})
			);
		} catch {
			// Storage can be disabled; Kit retains its normal restoration fallback.
		}
	}

	function stripLocationHash(): void {
		if (typeof window === 'undefined' || !window.location.hash) return;
		const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
		if (id) {
			const target = document.getElementById(id);
			if (target) {
				const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
			}
		}
		window.history.replaceState(
			window.history.state,
			'',
			window.location.pathname + window.location.search
		);
	}

	afterNavigate(() => {
		stripLocationHash();
	});

	// A deployment can replace prerendered pages with maintenance responses.
	// Check on client navigation as well, including when Kit has preloaded a page.
	onNavigate(async ({ to }) => {
		try {
			const response = await fetch('/maintenance-state.json', { cache: 'no-store' });
			const state: unknown = await response.json();
			if (
				response.ok &&
				typeof state === 'object' &&
				state !== null &&
				'maintenance' in state &&
				state.maintenance === false
			)
				return;
		} catch {
			// Let a document request surface network or maintenance errors.
		}
		window.location.assign(to?.url.href ?? window.location.href);
		return new Promise<never>(() => {});
	});

	const isAdminArea = $derived(
		page.url.pathname === '/admin' || page.url.pathname.startsWith('/admin/')
	);

	let metaTags = $derived.by(() => {
		const merged = deepMerge(data.baseMetaTags, page.data.pageMetaTags);
		if (page.error || page.status >= 400) {
			return {
				...merged,
				title: `${page.status}: Page Not Found`,
				description: `The requested page could not be found on ${BRAND.name}. Return to our live trading rooms, methodology, resources, or blog.`,
				robots: 'noindex, nofollow',
				additionalRobotsProps: undefined,
				canonical: undefined
			};
		}
		if (typeof merged.robots === 'string' && merged.robots.includes('noindex')) {
			return {
				...merged,
				additionalRobotsProps: undefined,
				canonical: merged.canonical || `${BRAND.domain}${page.url.pathname}`
			};
		}
		return merged;
	});
</script>

<svelte:window onhashchange={stripLocationHash} onpagehide={saveDocumentScrollPosition} />

<svelte:head>
	<link rel="stylesheet" href={appStylesheet} />
	<!-- A full reload must restore before hydration, including when modules load slowly. -->
	<script>
		(() => {
			// A head script can also be inserted during SPA navigation.
			if (document.readyState !== 'loading') return;
			try {
				const key = 'rtp:page-reload-scroll:v1';
				const raw = sessionStorage.getItem(key);
				sessionStorage.removeItem(key);
				if (
					performance.getEntriesByType('navigation')[0]?.type !== 'reload' ||
					location.hash ||
					!raw
				)
					return;
				const position = JSON.parse(raw);
				const age = Date.now() - position.savedAt;
				if (
					position.path !== location.pathname + location.search ||
					!Number.isFinite(age) ||
					age < 0 ||
					age > 60_000 ||
					!Number.isFinite(position.x) ||
					!Number.isFinite(position.y) ||
					position.x < 0 ||
					position.y < 0
				)
					return;
				history.scrollRestoration = 'manual';
				let frames = 0;
				let restored = false;
				function restore() {
					if (restored) return;
					const available = (document.scrollingElement?.scrollHeight ?? 0) - innerHeight;
					if (available >= position.y || document.readyState === 'complete' || frames++ >= 60) {
						restored = true;
						scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
						return;
					}
					requestAnimationFrame(restore);
				}
				document.addEventListener('DOMContentLoaded', restore, { once: true });
				requestAnimationFrame(restore);
			} catch {
				// Invalid or unavailable storage falls back to Kit's normal restoration.
			}
		})();
	</script>

	<!-- Brand emblem icons (static/). Google: square favicon, larger than 48x48 recommended, crawlable at a stable URL. -->
	<link rel="icon" href={asset('favicon.ico')} sizes="48x48" />
	<link rel="icon" href={asset('favicon-48x48.png')} type="image/png" sizes="48x48" />
	<link rel="icon" href={asset('icon-192.png')} type="image/png" sizes="192x192" />
	<link rel="apple-touch-icon" href={asset('apple-touch-icon.png')} />
</svelte:head>

<!-- The admin tree is noindex and sets its own title and robots (admin/+layout.svelte), so it must not inherit the marketing meta.
	 Its error pages render without that layout and still need the error title from MetaTags. -->
{#if !isAdminArea || page.error}
	<MetaTags {...metaTags} />
{/if}

{@render children()}
