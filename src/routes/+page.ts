import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	BRAND_SLOGAN,
	buildHomepageJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Stock & Options Trading Room, Mentorship & Custom Indicators',
		description:
			'Explore Revolution Trading Pros: stock and options trading rooms, swing trading, small-account mentorship ($500+), custom indicators, trading courses, and video watchlists. Trading involves substantial risk.',
		keywords: [
			'live stock and options trading room',
			'best options trading mentorship',
			'honest trading education',
			'swing trading alerts for working professionals',
			'small account options mentorship',
			'how to grow a $500 trading account',
			'video trading watchlist with entries and stops',
			'institutional trading indicators no repaint',
			'1 on 1 stock trading mentorship application',
			'free institutional trading playbook pdf',
			'SPX Profit Pulse',
			'Explosive Swings',
			'Revolution Trading Pros'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `${BRAND_NAME} | ${BRAND_SLOGAN}`,
			description:
				'Stock and options trading education, live rooms, mentorship, watchlists, and transparent case studies. People over profits.'
		},
		twitter: {
			title: `${BRAND_NAME} — Live Trading Rooms, Mentorship & Indicators`,
			description:
				'Stock and options trading education, live rooms, mentorship, watchlists, and transparent case studies. People over profits.'
		}
	});

	const jsonLdSchema = buildHomepageJsonLd(SITE_ORIGIN);

	return {
		...pageTags,
		jsonLdSchema
	};
};
