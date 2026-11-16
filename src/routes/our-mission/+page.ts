import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildMissionJsonLd,
	getCanonicalUrl,
	MISSION_PAGE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Our Mission: People Over Profits',
		description: MISSION_PAGE_DESCRIPTION,
		keywords: [
			'honest stock and options trading education',
			'anti-guru trading community',
			'price action trading without indicators',
			'affordable trading mentorship',
			'people over profits trading',
			`${BRAND.name} mission`
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Our Mission: People Over Profits | ${BRAND.name}`,
			description: MISSION_PAGE_DESCRIPTION
		},
		twitter: {
			title: `Our Mission: People Over Profits | ${BRAND.name}`,
			description: MISSION_PAGE_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildMissionJsonLd(SITE_ORIGIN)
	};
};
