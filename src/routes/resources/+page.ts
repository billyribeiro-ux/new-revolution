import { definePageMetaTags } from 'svelte-meta-tags';
import { buildResourcesHubJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Access free stock and options trading resources: our interactive Options Calculator, ETF Stocks List, Stock Indexes List, and institutional guides.';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 30 chars before suffix -> "Free Stock & Options Resources | Revolution Trading Pros" (56 chars total)
		title: 'Free Stock & Options Resources',
		description: DESCRIPTION,
		keywords: [
			'free stock and options resources',
			'options profit calculator',
			'etf stocks list',
			'stock indexes list',
			'institutional trading guides'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Free Stock & Options Resources | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Free Stock & Options Resources | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildResourcesHubJsonLd(SITE_ORIGIN)
	};
};
