import { definePageMetaTags } from 'svelte-meta-tags';
import { buildCoursesStoreJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** 148 Characters Total (Zero Desktop/Mobile SERP Truncation) */
const DESCRIPTION =
	'Self-paced stock, ETF, and options trading courses. Master institutional order flow, Options Greeks, and $500+ small account compounding. Zero hype.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 31 chars before suffix -> "Stock & Options Trading Courses | Revolution Trading Pros" (57 chars total)
		title: 'Stock & Options Trading Courses',
		description: DESCRIPTION,
		keywords: [
			'stock and options trading courses',
			'options greeks course',
			'small account trading course',
			'institutional order flow course',
			'swing trading course for working professionals',
			'The Move Prior to The Move course'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Stock & Options Trading Courses | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Stock & Options Trading Courses | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildCoursesStoreJsonLd(SITE_ORIGIN)
	};
};
