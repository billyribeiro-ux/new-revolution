import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildEtfStocksListJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Complete ETF stocks list covering SPY, QQQ, IWM, and all 11 S&P 500 sector ETFs. Compare options liquidity, expense ratios, and institutional setups.';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 30 chars before suffix -> "ETF Stocks List & Sector Guide | Brand" (56 chars total)
		title: 'ETF Stocks List & Sector Guide',
		description: DESCRIPTION,
		keywords: [
			'ETF stocks list',
			'sector ETFs list',
			'SPY QQQ IWM options',
			'S&P 500 GICS sector ETFs',
			'ETFs vs mutual funds'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `ETF Stocks List & Sector Guide | ${BRAND.name}`,
			description: DESCRIPTION
		},
		twitter: {
			title: `ETF Stocks List & Sector Guide | ${BRAND.name}`,
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildEtfStocksListJsonLd(SITE_ORIGIN)
	};
};
