import { defineBaseMetaTags } from 'svelte-meta-tags';
import { BRAND } from '#lib/config/brand.ts';
import {
	BRAND_SOCIAL_IMAGE_HEIGHT,
	BRAND_SOCIAL_IMAGE_PATH,
	BRAND_SOCIAL_IMAGE_WIDTH,
	getCanonicalUrl,
	HOME_PAGE_DESCRIPTION,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);
	const noIndex = isNoIndexRoute(url.pathname);
	const brandName = BRAND.name;
	const brandSlogan = BRAND.slogan;
	const socialImageUrl = `${BRAND.domain}${BRAND_SOCIAL_IMAGE_PATH}`;

	const baseTags = defineBaseMetaTags({
		title: 'Stock & Options Trading Rooms',
		titleTemplate: `%s | ${brandName}`,
		robots: noIndex ? 'noindex, nofollow' : 'index, follow',
		additionalRobotsProps: noIndex
			? undefined
			: {
					maxSnippet: -1,
					maxImagePreview: 'large',
					maxVideoPreview: -1
				},
		description: HOME_PAGE_DESCRIPTION,
		canonical: canonicalUrl,
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			locale: 'en_US',
			siteName: brandName,
			title: `${brandName} | ${brandSlogan}`,
			description: HOME_PAGE_DESCRIPTION,
			images: [
				{
					url: socialImageUrl,
					secureUrl: socialImageUrl,
					type: 'image/png',
					width: BRAND_SOCIAL_IMAGE_WIDTH,
					height: BRAND_SOCIAL_IMAGE_HEIGHT,
					alt: `${brandName}: ${brandSlogan}`
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image',
			image: socialImageUrl,
			imageAlt: `${brandName}: ${brandSlogan}`
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
