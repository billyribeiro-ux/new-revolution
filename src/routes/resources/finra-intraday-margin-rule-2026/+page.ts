import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildFinraIntradayMarginGuideJsonLd,
	FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'FINRA Rule 4210 Margin Guide';
	const description = FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'FINRA intraday margin rule 2026',
			'FINRA Regulatory Notice 26-10',
			'FINRA Rule 4210(d)(2)',
			'25000 PDT rule replaced 2026',
			'Intraday Margin Level IML',
			'0DTE options intraday margin rule'
		],
		openGraph: {
			type: 'article',
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
		jsonLdSchema: buildFinraIntradayMarginGuideJsonLd(SITE_ORIGIN)
	};
};
