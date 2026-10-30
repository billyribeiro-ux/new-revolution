import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSingleIndicatorJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.';

/** Prerender canonical indicator product pages at build time (SSG). */
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ slug: 'move-prior-to-the-move-system' },
	{ slug: 'move-prior-to-the-move-pro' },
	{ slug: 'mp-early-in-n-out-pro' },
	{ slug: 'multi-timeframe-squeeze-pro' },
	{ slug: 'institutional-volume-absorption' },
	{ slug: 'spx-dealer-gamma-levels' },
	{ slug: 'volatility-regime-compass' },
	{ slug: 'anchored-vwap-liquidity-bands' },
	{ slug: 'options-expected-move-corridor' }
];

export const load: PageLoad = ({ url, params }) => {
	const slug = params?.slug || 'move-prior-to-the-move-system';
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 27 chars before suffix -> "MP Early In & Out Indicator | Revolution Trading Pros" (53 chars total)
		title: 'MP Early In & Out Indicator',
		description: DESCRIPTION,
		keywords: [
			'MP Early In and Out indicator',
			'MP_EarlyInNOut Pro indicator',
			'The Move Prior to The Move Pro System',
			'non-repainting ThinkorSwim indicator',
			'TradingView order flow squeeze indicator',
			'ThinkorSwim mobile app custom indicator'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'MP Early In & Out Indicator | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'MP Early In & Out Indicator | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSingleIndicatorJsonLd(SITE_ORIGIN, slug)
	};
};
