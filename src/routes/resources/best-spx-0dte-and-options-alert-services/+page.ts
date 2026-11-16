import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BEST_OPTIONS_ALERTS_DESCRIPTION,
	BRAND_NAME,
	buildBestOptionsAlertsComparisonJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Best SPX & Options Alerts 2026';
	const description = BEST_OPTIONS_ALERTS_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'best SPX 0DTE alert service 2026',
			'best options alert services',
			'options swing trading alerts comparison',
			'SPX Profit Pulse vs options signal services',
			'Section 1256 SPX index options alerts'
		],
		openGraph: {
			type: 'article',
			url: canonical,
			title: `${title} | ${BRAND_NAME}`,
			description
		},
		twitter: {
			title: `${title} | ${BRAND_NAME}`,
			description
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildBestOptionsAlertsComparisonJsonLd(SITE_ORIGIN)
	};
};
