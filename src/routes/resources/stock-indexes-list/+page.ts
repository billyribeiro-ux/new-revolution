import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildStockIndexesListJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	STOCK_INDEXES_LIST_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);
	const rawTitle = 'Cash-Settled Indexes & 1256 Guide';
	const fullTitle = `${rawTitle} | ${BRAND.name}`;

	const pageTags = definePageMetaTags({
		// 33 chars before suffix -> "Cash-Settled Indexes & 1256 Guide | Brand" (<= 60 chars total)
		title: rawTitle,
		description: STOCK_INDEXES_LIST_DESCRIPTION,
		keywords: [
			'cash-settled index options',
			'section 1256 options tax',
			'SPX XSP NDX RUT VIX tickers',
			'SPX vs SPY options assignment',
			'stock market indexes list'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: fullTitle,
			description: STOCK_INDEXES_LIST_DESCRIPTION
		},
		twitter: {
			title: fullTitle,
			description: STOCK_INDEXES_LIST_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildStockIndexesListJsonLd(SITE_ORIGIN)
	};
};
