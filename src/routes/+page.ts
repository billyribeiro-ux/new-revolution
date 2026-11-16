import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	BRAND_SLOGAN,
	buildHomepageJsonLd,
	getCanonicalUrl,
	HOME_PAGE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Server-rendered CMS discovery keeps new publications visible without a redeploy. */
export const prerender = false;

export const load: PageLoad = ({ url, data }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Live Stock & Options Trading Rooms',
		description: HOME_PAGE_DESCRIPTION,
		keywords: [
			'live stock and options trading room',
			'price action trading without indicators',
			'The Move Prior to The Move',
			'swing trading alerts for working professionals',
			'small account options mentorship',
			'FINRA Rule 4210 intraday margin',
			'SPX Profit Pulse',
			'Sunday Alpha Protocol',
			`${BRAND.name}`
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `${BRAND_NAME} | ${BRAND_SLOGAN}`,
			description: HOME_PAGE_DESCRIPTION
		},
		twitter: {
			title: `${BRAND_NAME}: Pure Price Action Rooms & Alert Blueprints`,
			description: HOME_PAGE_DESCRIPTION
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
