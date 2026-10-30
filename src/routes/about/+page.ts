import { definePageMetaTags } from 'svelte-meta-tags';
import { buildAboutJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'About Us & Proven Track Record',
		description:
			'Mentored by Goldman Sachs legend Mark McGoldrick, we called the 2020 & 2022 tops/bottoms and made 600% overnight on OXY puts. People over profits.',
		keywords: [
			'Mark McGoldrick trading mentor',
			'traders who called 2020 and 2022 market tops',
			'institutional order flow trading',
			'Goldman Sachs prop trading strategies for retail',
			'OXY put options trade',
			'real verifiable trading track record',
			'Revolution Trading Pros founder'
		],
		openGraph: {
			type: 'profile',
			profile: {
				firstName: 'Billy',
				lastName: 'Ribeiro'
			},
			url: canonicalUrl,
			title: 'About Us & Proven Track Record | Revolution Trading Pros',
			description:
				'Mentored by Goldman Sachs legend Mark McGoldrick, we called the 2020 & 2022 tops/bottoms and made 600% overnight on OXY puts. People over profits.'
		},
		twitter: {
			title: 'About Us & Proven Track Record | Revolution Trading Pros',
			description:
				'Mentored by Goldman Sachs legend Mark McGoldrick, we called the 2020 & 2022 tops/bottoms and made 600% overnight on OXY puts. People over profits.'
		}
	});

	const jsonLdSchema = buildAboutJsonLd(SITE_ORIGIN);

	return {
		...pageTags,
		jsonLdSchema
	};
};
