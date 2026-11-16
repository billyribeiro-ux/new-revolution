import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSwingTradingRoomJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	SWING_TRADING_ROOM_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Swing Trading Room',
		description: SWING_TRADING_ROOM_DESCRIPTION,
		keywords: [
			'swing trading room',
			'swing trading for working professionals',
			'multi-day stock and options trading room',
			'options swing trading alerts',
			'9-to-5 swing trading workflow',
			`${BRAND.name} swing trading room`
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Live Swing Trading Room | ${BRAND.name}`,
			description: SWING_TRADING_ROOM_DESCRIPTION
		},
		twitter: {
			title: `Live Swing Trading Room | ${BRAND.name}`,
			description: SWING_TRADING_ROOM_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSwingTradingRoomJsonLd(SITE_ORIGIN)
	};
};
