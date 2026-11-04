import { definePageMetaTags } from 'svelte-meta-tags';
import { buildResourcesHubJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Free stock, ETF, and options trading resources. Access beginner guides, position size and options calculators, video tutorials, and market analysis.';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 30 chars before suffix -> "Free Trading Resources & Tools | Revolution Trading Pros" (56 chars total)
		title: 'Free Trading Resources & Tools',
		description: DESCRIPTION,
		keywords: [
			'free trading resources',
			'options profit calculator',
			'etf stocks list',
			'stock indexes list',
			'institutional trading guides'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Free Trading Resources & Tools | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Free Trading Resources & Tools | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildResourcesHubJsonLd(SITE_ORIGIN)
	};
};
