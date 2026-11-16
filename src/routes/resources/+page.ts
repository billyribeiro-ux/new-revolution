import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildResourcesHubJsonLd,
	getCanonicalUrl,
	RESOURCES_HUB_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 30 chars before suffix -> "Free Trading Resources & Tools | Brand" (56 chars total)
		title: 'Free Trading Resources & Tools',
		description: RESOURCES_HUB_DESCRIPTION,
		keywords: [
			'free trading resources',
			'options profit calculator',
			'FINRA intraday margin calculator',
			'etf stocks list',
			'stock indexes list',
			'price action trading guides'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Free Trading Resources & Tools | ${BRAND.name}`,
			description: RESOURCES_HUB_DESCRIPTION
		},
		twitter: {
			title: `Free Trading Resources & Tools | ${BRAND.name}`,
			description: RESOURCES_HUB_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildResourcesHubJsonLd(SITE_ORIGIN)
	};
};
