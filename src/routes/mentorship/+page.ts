import { definePageMetaTags } from 'svelte-meta-tags';
import { buildMentorshipJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Explore our proposed one-on-one trading mentorship concept, including learning goals, process review, and risk education. No applications or paid enrollment.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: '1-on-1 Trading Mentorship',
		description: DESCRIPTION,
		keywords: [
			'1-on-1 trading mentorship',
			'private options trading mentor',
			'portfolio manager trading mentorship',
			'professional trader coaching',
			'struggling trader turnaround',
			'Mark McGoldrick mentorship'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: '1-on-1 Trading Mentorship | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: '1-on-1 Trading Mentorship | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildMentorshipJsonLd(SITE_ORIGIN)
	};
};
