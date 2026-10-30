import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSingleScannerJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.';

/** Prerender canonical scanner product pages at build time (SSG). */
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ slug: 'high-octane-scanner' },
	{ slug: 'move-prior-to-the-move-radar' },
	{ slug: 'multi-timeframe-squeeze-scanner' },
	{ slug: 'liquidity-sweep-stop-hunt-scanner' },
	{ slug: 'small-account-affordable-options-scanner' },
	{ slug: 'working-pro-eod-swing-scanner' },
	{ slug: 'spx-dealer-gamma-iv-skew-scanner' },
	{ slug: 'smart-money-relative-volume-scanner' },
	{ slug: 'opening-bell-gap-and-go-fade-scanner' }
];

export const load: PageLoad = ({ url, params }) => {
	const slug = params?.slug || 'high-octane-scanner';
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 27 chars before suffix -> "High Octane Options Scanner | Revolution Trading Pros" (53 chars total)
		title: 'High Octane Options Scanner',
		description: DESCRIPTION,
		keywords: [
			'High Octane Scanner',
			'ThinkorSwim options scanner',
			'TradingView real-time scanner',
			'18-timeframe squeeze scanner',
			'small account options scanner',
			'institutional order flow scanner'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'High Octane Options Scanner | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'High Octane Options Scanner | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSingleScannerJsonLd(SITE_ORIGIN, slug)
	};
};

