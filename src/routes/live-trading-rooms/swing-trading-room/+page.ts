import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSwingTradingRoomJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Stock, ETF, and options swing trading room built for working professionals. Pre-planned entries, profit targets, and stops. People over profits.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Swing Trading Room',
		description: DESCRIPTION,
		keywords: [
			'swing trading room',
			'swing trading for working professionals',
			'multi-day stock and options trading room',
			'options swing trading alerts',
			'9-to-5 swing trading workflow',
			'Mark McGoldrick trading lineage',
			'Revolution Trading Pros swing trading room'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Live Swing Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Live Swing Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSwingTradingRoomJsonLd(SITE_ORIGIN)
	};
};
