import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSpxProfitPulseJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

/**
 * Character-locked metadata for `/alert-services/spx-profit-pulse`:
 * - `<title>`: "SPX Profit Pulse Options Alerts | Revolution Trading Pros"
 *   (31 chars before suffix, 57 chars total — safely below Google's 60-char / 580px limit)
 * - `<meta name="description">`: 149 chars total — zero desktop/mobile SERP truncation
 */
const PAGE_TITLE = 'SPX Profit Pulse Options Alerts';
const FULL_TITLE = 'SPX Profit Pulse Options Alerts | Revolution Trading Pros';
const PAGE_DESCRIPTION =
	'Real-time SPX & 0DTE index options alerts with video watchlists, gamma levels, and exact entries, targets, and stops. People over profits. Zero hype.';

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = url
		? getCanonicalUrl(url)
		: `${SITE_ORIGIN}/alert-services/spx-profit-pulse`;

	const pageTags = definePageMetaTags({
		title: PAGE_TITLE,
		description: PAGE_DESCRIPTION,
		canonical: canonicalUrl,
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: FULL_TITLE,
			description: PAGE_DESCRIPTION
		},
		twitter: {
			title: FULL_TITLE,
			description: PAGE_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSpxProfitPulseJsonLd(SITE_ORIGIN)
	};
};
