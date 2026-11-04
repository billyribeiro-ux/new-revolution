import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildStockIndexesListJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Comprehensive stock market indexes list and guide. Track S&P 500 ($SPX), Dow Jones ($DJI), Nasdaq ($NDX), Russell 2000 ($RUT), VIX, and global benchmarks.';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 25 chars before suffix -> "Stock Market Indexes List | Revolution Trading Pros" (51 chars total)
		title: 'Stock Market Indexes List',
		description: DESCRIPTION,
		keywords: [
			'stock indexes list',
			'major stock market indexes',
			'SPX DJI NDX RUT VIX tickers',
			'S&P 500 index ETFs',
			'global stock indexes list'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Stock Market Indexes List | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Stock Market Indexes List | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildStockIndexesListJsonLd(SITE_ORIGIN)
	};
};
