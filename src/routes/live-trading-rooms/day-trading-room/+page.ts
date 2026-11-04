import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildDayTradingRoomJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Join our live stock, ETF, and options day trading room. Real-time voice, screen share, and exact entries and stops. People over profits. Zero hype.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Day Trading Room',
		description: DESCRIPTION,
		keywords: [
			'live day trading room',
			'options scalping room',
			'live voice and screen share trading room',
			'intraday stock and options trading room',
			'Mark McGoldrick trading lineage',
			'non-repainting day trading indicators',
			'Revolution Trading Pros day trading room'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Live Day Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Live Day Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildDayTradingRoomJsonLd(SITE_ORIGIN)
	};
};
