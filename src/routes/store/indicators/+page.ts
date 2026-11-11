import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildIndicatorsStoreJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Public concept metadata: describes development status without advertising an active offer. */
const DESCRIPTION =
	'Preview proposed trading indicator concepts for chart study, market structure, and risk education. AI-assisted development; no purchases or downloads offered.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 25 chars before suffix -> "Custom Trading Indicators | Revolution Trading Pros" (51 chars total)
		title: 'Custom Trading Indicators',
		description: DESCRIPTION,
		keywords: [
			'custom trading indicators',
			'non-repainting trading indicators',
			'ThinkorSwim custom indicators',
			'TradingView order flow indicators',
			'institutional liquidity sweep indicator',
			'volatility squeeze indicator',
			'The Move Prior to The Move'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Custom Trading Indicators | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Custom Trading Indicators | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildIndicatorsStoreJsonLd(SITE_ORIGIN)
	};
};
