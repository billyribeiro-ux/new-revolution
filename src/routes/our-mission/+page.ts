import { definePageMetaTags } from 'svelte-meta-tags';
import { buildMissionJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Our Mission: People Over Profits',
		description:
			'Educate, Innovate, and Prosper. We put people over profits with honest live trading rooms, $500+ small account mentorship, and zero fake indicators.',
		keywords: [
			'honest stock and options trading education',
			'anti-guru trading community',
			'non-repainting trading indicators',
			'affordable trading mentorship',
			'people over profits trading',
			'Revolution Trading Pros mission'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Our Mission: People Over Profits | Revolution Trading Pros',
			description:
				'Educate, Innovate, and Prosper. We put people over profits with honest live trading rooms, $500+ small account mentorship, and zero fake indicators.'
		},
		twitter: {
			title: 'Our Mission: People Over Profits | Revolution Trading Pros',
			description:
				'Educate, Innovate, and Prosper. We put people over profits with honest live trading rooms, $500+ small account mentorship, and zero fake indicators.'
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildMissionJsonLd(SITE_ORIGIN)
	};
};
