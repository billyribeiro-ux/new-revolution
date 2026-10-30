// Folder: src/routes/sitemap.xml/
// File:   +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const baseUrl = 'https://revolutiontradingpros.com';
	const today = new Date().toISOString().split('T')[0];

	// 1. Automatically discover every +page.svelte route in src/routes/
	const pageModules = import.meta.glob('/src/routes/**/+page.svelte');

	const discoveredRoutes = Object.keys(pageModules)
		.map((filePath) => {
			return (
				filePath
					.replace('/src/routes', '')
					.replace('/+page.svelte', '')
					.replace(/\/\([^)]+\)/g, '') || // Strip SvelteKit route groups like /(marketing)
				'/'
			);
		})
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

	// 2. Dynamic Blog Posts & Course/Indicator Pages (Fetch from your Laravel API in production)
	const dynamicRoutes = [
		{ path: '/store/courses/move-prior-to-the-move-ultra', lastmod: today },
		{ path: '/store/indicators/move-prior-to-the-move-system', lastmod: today },
		{ path: '/store/scanners/high-octane-scanner', lastmod: today },
		{ path: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight', lastmod: '2026-10-28' },
		{
			path: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			lastmod: '2026-10-24'
		},
		{
			path: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine',
			lastmod: '2026-10-20'
		}
	];

	const staticEntries = discoveredRoutes.map((path) => ({
		path,
		lastmod: today
	}));

	const allRoutes = [...staticEntries, ...dynamicRoutes];

	const urlNodes = allRoutes
		.map(({ path, lastmod }) => {
			const fullUrl = `${baseUrl}${path === '/' ? '' : path}`;
			return [
				'  <url>',
				`    <loc>${fullUrl}</loc>`,
				`    <lastmod>${lastmod}</lastmod>`,
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
