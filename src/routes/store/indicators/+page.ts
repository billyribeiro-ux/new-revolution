import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildIndicatorsStoreJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Public concept metadata: describes development status without advertising an active offer. */
const DESCRIPTION =
	'Explore chart-structure study overlays for liquidity zones, multi-timeframe levels, and risk education across ThinkorSwim and TradingView workflows.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 25 chars before suffix -> "Custom Trading Indicators | Brand" (51 chars total)
		title: 'Custom Trading Indicators',
		description: DESCRIPTION,
		keywords: [
			'custom trading indicators',
			'chart structure study overlays',
			'ThinkorSwim custom indicators',
			'TradingView order flow indicators',
			'institutional liquidity sweep indicator',
			'volatility squeeze indicator',
			'The Move Prior to The Move'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Custom Trading Indicators | ${BRAND.name}`,
			description: DESCRIPTION
		},
		twitter: {
			title: `Custom Trading Indicators | ${BRAND.name}`,
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildIndicatorsStoreJsonLd(SITE_ORIGIN)
	};
};
