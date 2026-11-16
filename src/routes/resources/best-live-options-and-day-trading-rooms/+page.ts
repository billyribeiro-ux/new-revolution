import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BEST_TRADING_ROOMS_DESCRIPTION,
	BRAND_NAME,
	buildBestTradingRoomsComparisonJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Best Options Trading Rooms 2026';
	const description = BEST_TRADING_ROOMS_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'best options trading rooms 2026',
			'best live day trading rooms',
			'price action trading room vs indicator room',
			'SPX live trading room comparison',
			'small account options trading room'
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
		jsonLdSchema: buildBestTradingRoomsComparisonJsonLd(SITE_ORIGIN)
	};
};
