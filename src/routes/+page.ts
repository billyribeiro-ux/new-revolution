import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	BRAND_SLOGAN,
	buildHomepageJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Server-rendered CMS discovery keeps new publications visible without a redeploy. */
export const prerender = false;

export const load: PageLoad = ({ url, data }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Stock & Options Trading Rooms',
		description:
			'Explore an AI-built trading education concept in development, including proposed rooms, tools, and mentorship. Purchases and paid subscriptions unavailable.',
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
			'Sunday Alpha Protocol',
			'Revolution Trading Pros'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `${BRAND_NAME} | ${BRAND_SLOGAN}`,
			description:
				'Explore an AI-built trading education concept in development, including proposed rooms, tools, and mentorship. Purchases and paid subscriptions unavailable.'
		},
		twitter: {
			title: `${BRAND_NAME}: Live Trading Rooms, Mentorship & Indicators`,
			description:
				'Explore an AI-built trading education concept in development, including proposed rooms, tools, and mentorship. Purchases and paid subscriptions unavailable.'
		}
	});

	const jsonLdSchema = buildHomepageJsonLd(SITE_ORIGIN, [
		...data.blogListing.featuredPosts,
		...data.blogListing.posts
	]);

	return {
		...data,
		...pageTags,
		jsonLdSchema
	};
};
