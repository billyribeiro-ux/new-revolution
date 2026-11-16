import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSpxProfitPulseJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	SPX_PROFIT_PULSE_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

const PAGE_TITLE = 'SPX Profit Pulse Options Alerts';
const FULL_TITLE = `SPX Profit Pulse Options Alerts | ${BRAND.name}`;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = url
		? getCanonicalUrl(url)
		: `${SITE_ORIGIN}/alert-services/spx-profit-pulse`;

	const pageTags = definePageMetaTags({
		title: PAGE_TITLE,
		description: SPX_PROFIT_PULSE_DESCRIPTION,
		canonical: canonicalUrl,
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: FULL_TITLE,
			description: SPX_PROFIT_PULSE_DESCRIPTION
		},
		twitter: {
			title: FULL_TITLE,
			description: SPX_PROFIT_PULSE_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSpxProfitPulseJsonLd(SITE_ORIGIN)
	};
};
