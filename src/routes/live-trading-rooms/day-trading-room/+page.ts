import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildDayTradingRoomJsonLd,
	DAY_TRADING_ROOM_DESCRIPTION,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Day Trading Room',
		description: DAY_TRADING_ROOM_DESCRIPTION,
		keywords: [
			'live day trading room',
			'SPX options day trading room',
			'live voice and screen share trading room',
			'intraday stock and options trading room',
			'price action day trading without indicators',
			`${BRAND.name} day trading room`
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Live Day Trading Room | ${BRAND.name}`,
			description: DAY_TRADING_ROOM_DESCRIPTION
		},
		twitter: {
			title: `Live Day Trading Room | ${BRAND.name}`,
			description: DAY_TRADING_ROOM_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildDayTradingRoomJsonLd(SITE_ORIGIN)
	};
};
