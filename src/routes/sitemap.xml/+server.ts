// Folder: src/routes/sitemap.xml/
// File:   +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://revolutiontradingpros.com';

	// 1. Automatically discover every +page.svelte route in src/routes/
	const pageModules = import.meta.glob('/src/routes/**/+page.svelte');

	const allRoutes = Object.keys(pageModules).map((filePath) => {
		return (
			filePath
				.replace('/src/routes', '')
				.replace('/+page.svelte', '')
				.replace(/\/\([^)]+\)/g, '') || // Strip SvelteKit route groups like /(marketing)
			'/'
		);
	});

	// Dynamic `[param]` templates that exist in the build; a slug URL is only listable if one matches it.
	const dynamicTemplates = allRoutes
		.filter((route) => route.includes('['))
		.map((route) => new RegExp(`^${route.replace(/\[[^\]]+\]/g, '[^/]+')}$`));
	const hasRoute = (path: string) => dynamicTemplates.some((template) => template.test(path));

	const discoveredRoutes = allRoutes
		.filter((route) => {
			// Exclude dynamic [slug] templates, demo/ad squeeze routes, and private/auth routes
			return (
				!route.includes('[') &&
				!route.startsWith('/demo') &&
				!route.startsWith('/lp') &&
				!route.startsWith('/login') &&
				!route.startsWith('/register') &&
				!route.startsWith('/dashboard') &&
				!route.startsWith('/admin') &&
				!route.startsWith('/checkout')
			);
		})
		.sort((a, b) => {
			if (a === '/') return -1;
			if (b === '/') return 1;
			return a.localeCompare(b);
		});

	// 2. Dynamic slug pages. `lastmod` is optional and is only emitted when it is a real, recorded date:
	//    Google uses it only if it is consistently and verifiably accurate, so a build-date stamp is worse than none.
	//    An entry is listed only when a route template for it exists in the build (no 404s in the sitemap).
	const dynamicRoutes: { path: string; lastmod?: string }[] = [
		{ path: '/store/courses/move-prior-to-the-move-ultra' },
		{ path: '/store/indicators/move-prior-to-the-move-system' },
		{ path: '/store/scanners/high-octane-scanner' },
		{ path: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight', lastmod: '2026-10-28' },
		{
			path: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			lastmod: '2026-10-24'
		},
		{
			path: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine',
			lastmod: '2026-10-20'
		}
	].filter(({ path }) => hasRoute(path));

	const entries: { path: string; lastmod?: string }[] = [
		...discoveredRoutes.map((path) => ({ path })),
		...dynamicRoutes
	];

	const urlNodes = entries
		.map(({ path, lastmod }) => {
			const fullUrl = `${baseUrl}${path === '/' ? '' : path}`;
			return [
				'  <url>',
				`    <loc>${fullUrl}</loc>`,
				...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
				`    <xhtml:link rel="alternate" hreflang="en-us" href="${fullUrl}" />`,
				`    <xhtml:link rel="alternate" hreflang="en-ca" href="${fullUrl}" />`,
				`    <xhtml:link rel="alternate" hreflang="x-default" href="${fullUrl}" />`,
				'  </url>'
			].join('\n');
		})
		.join('\n');

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		urlNodes,
		'</urlset>'
	].join('\n');

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
			'X-Robots-Tag': 'noindex'
		}
	});
};
