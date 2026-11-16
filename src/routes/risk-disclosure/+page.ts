import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildRiskDisclosurePageJsonLd,
	getCanonicalUrl,
	RISK_DISCLOSURE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Risk & Regulatory Disclosure';
	const description = RISK_DISCLOSURE_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'options trading risk disclosure',
			'CFTC Rule 4.41 disclosure',
			'OCC standardized options risk',
			'FINRA Rule 4210 intraday margin disclosure',
			'T+1 settlement risk disclosure',
			`${BRAND.name} risk disclosure`
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
		jsonLdSchema: buildRiskDisclosurePageJsonLd(SITE_ORIGIN)
	};
};
