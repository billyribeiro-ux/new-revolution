import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildOptionsCalculatorJsonLd,
	getCanonicalUrl,
	OPTIONS_CALCULATOR_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Options Profit & Greeks Tool';
	const description = OPTIONS_CALCULATOR_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'options profit calculator',
			'Black Scholes options Greeks calculator',
			'options breakeven calculator',
			'vertical spread profit calculator',
			'SPX 0DTE options calculator',
			'small account options position sizing'
		],
		openGraph: {
			type: 'website',
			url: canonical,
			title: `${title} | ${BRAND_NAME}`,
			description
		},
		twitter: {
			title: `${title} | ${BRAND_NAME}`,
			description
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildOptionsCalculatorJsonLd(SITE_ORIGIN)
	};
};
