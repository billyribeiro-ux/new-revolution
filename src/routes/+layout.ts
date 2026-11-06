import { defineBaseMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	BRAND_SLOGAN,
	BRAND_SOCIAL_IMAGE_HEIGHT,
	BRAND_SOCIAL_IMAGE_PATH,
	BRAND_SOCIAL_IMAGE_WIDTH,
	getCanonicalUrl,
	SITE_ORIGIN,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);
	const noIndex = isNoIndexRoute(url.pathname);
	const socialImageUrl = `${SITE_ORIGIN}${BRAND_SOCIAL_IMAGE_PATH}`;

	const baseTags = defineBaseMetaTags({
		title: 'Stock & Options Trading Rooms',
		titleTemplate: `%s | ${BRAND_NAME}`,
		robots: noIndex ? 'noindex, nofollow' : 'index, follow',
		additionalRobotsProps: noIndex
			? undefined
			: {
					maxSnippet: -1,
					maxImagePreview: 'large',
					maxVideoPreview: -1
				},
		description:
			'Live stock and options trading rooms, $500+ small-account mentorship, non-repainting indicators, courses, and video watchlists. People over profits.',
		canonical: noIndex ? undefined : canonicalUrl,
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			locale: 'en_US',
			siteName: BRAND_NAME,
			title: `${BRAND_NAME} | ${BRAND_SLOGAN}`,
			description:
				'Stock and options trading education, live rooms, mentorship, watchlists, and transparent case studies. People over profits.',
			images: [
				{
					url: socialImageUrl,
					secureUrl: socialImageUrl,
					type: 'image/png',
					width: BRAND_SOCIAL_IMAGE_WIDTH,
					height: BRAND_SOCIAL_IMAGE_HEIGHT,
					alt: `${BRAND_NAME}: ${BRAND_SLOGAN}`
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image',
			image: socialImageUrl,
			imageAlt: `${BRAND_NAME}: ${BRAND_SLOGAN}`
		},
		additionalMetaTags: [
			{
				name: 'theme-color',
				content: '#0b0e12'
			}
		]
	});

	return {
		...baseTags
	};
};
