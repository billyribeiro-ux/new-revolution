import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildMethodologyJsonLd,
	getCanonicalUrl,
	METHODOLOGY_PAGE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Pure Price Action Methodology';
	const description = METHODOLOGY_PAGE_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'price action trading without indicators',
			'The Move Prior to The Move',
			'indicator free options trading',
			'multi timeframe price action',
			'Billy Ribeiro trading methodology',
			'pure price structure trading'
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
		jsonLdSchema: buildMethodologyJsonLd(SITE_ORIGIN)
	};
};
