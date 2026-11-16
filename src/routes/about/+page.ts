import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	ABOUT_PAGE_DESCRIPTION,
	buildAboutJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'About Us & Proven Track Record',
		description: ABOUT_PAGE_DESCRIPTION,
		keywords: [
			'Mark McGoldrick trading mentor',
			'Goldman Sachs Global Special Situations Group',
			'Mount Kellett Capital Management',
			'The Move Prior to The Move',
			'Billy Ribeiro trader',
			`${BRAND.name} founder`
		],
		openGraph: {
			type: 'profile',
			profile: {
				firstName: 'Billy',
				lastName: 'Ribeiro'
			},
			url: canonicalUrl,
			title: `About Us & Proven Track Record | ${BRAND.name}`,
			description: ABOUT_PAGE_DESCRIPTION
		},
		twitter: {
			title: `About Us & Proven Track Record | ${BRAND.name}`,
			description: ABOUT_PAGE_DESCRIPTION
		}
	});

	const jsonLdSchema = buildAboutJsonLd(SITE_ORIGIN);

	return {
		...pageTags,
		jsonLdSchema
	};
};
