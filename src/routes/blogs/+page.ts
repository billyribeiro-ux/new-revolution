import { definePageMetaTags } from 'svelte-meta-tags';
import { buildBlogsHubJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.';

/** Static marketing hub: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Stock & Options Trading Blog',
		description: DESCRIPTION,
		keywords: [
			'stock and options trading blog',
			'options greeks guide',
			'$500 small account options strategy',
			'institutional order flow blog',
			'Billy Ribeiro trading articles',
			'Mark McGoldrick trading lineage',
			'Revolution Trading Pros blog'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Stock & Options Trading Blog | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Stock & Options Trading Blog | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildBlogsHubJsonLd(SITE_ORIGIN)
	};
};
