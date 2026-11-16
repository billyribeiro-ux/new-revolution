import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildLiveTradingRoomsHubJsonLd,
	getCanonicalUrl,
	LIVE_TRADING_ROOMS_HUB_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing hub: identical for every visitor, rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Live Trading Rooms';
	const description = LIVE_TRADING_ROOMS_HUB_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'live trading rooms',
			'live stock and options trading rooms',
			'day trading room',
			'swing trading room for working professionals',
			'small accounts trading room',
			'defined risk options trading education',
			`${BRAND.name} trading rooms`
		],
		openGraph: {
			type: 'website',
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
		jsonLdSchema: buildLiveTradingRoomsHubJsonLd(SITE_ORIGIN)
	};
};
