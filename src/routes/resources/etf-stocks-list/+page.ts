import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildEtfStocksListJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Comprehensive ETF stock list and sector guide. Explore top liquid ETFs (SPY, QQQ, IWM, XLK, XLF), benefits, and ETF vs. mutual fund comparisons.';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 29 chars before suffix -> "ETF Stock List & Sector Guide | Revolution Trading Pros" (55 chars total)
		title: 'ETF Stock List & Sector Guide',
		description: DESCRIPTION,
		keywords: [
			'ETF stock list',
			'exchange traded funds list',
			'sector ETFs list',
			'SPY QQQ IWM VTI ETFs',
			'ETF vs mutual fund comparison',
			'options trading ETFs'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'ETF Stock List & Sector Guide | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'ETF Stock List & Sector Guide | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildEtfStocksListJsonLd(SITE_ORIGIN)
	};
};

