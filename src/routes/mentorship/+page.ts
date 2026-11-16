import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildMentorshipJsonLd,
	getCanonicalUrl,
	MENTORSHIP_PAGE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: '1-on-1 Trading Mentorship',
		description: MENTORSHIP_PAGE_DESCRIPTION,
		keywords: [
			'1-on-1 trading mentorship',
			'private options trading mentor',
			'portfolio manager trading mentorship',
			'professional trader coaching',
			'price action trading coach',
			'Mark McGoldrick mentorship'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `1-on-1 Trading Mentorship | ${BRAND.name}`,
			description: MENTORSHIP_PAGE_DESCRIPTION
		},
		twitter: {
			title: `1-on-1 Trading Mentorship | ${BRAND.name}`,
			description: MENTORSHIP_PAGE_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildMentorshipJsonLd(SITE_ORIGIN)
	};
};
