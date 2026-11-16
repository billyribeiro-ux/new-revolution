import { definePageMetaTags } from 'svelte-meta-tags';
import {
	ALERT_SERVICES_HUB_DESCRIPTION,
	BRAND_NAME,
	buildAlertServicesHubJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Options & SPX Alert Services';
	const description = ALERT_SERVICES_HUB_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'options alert services',
			'SPX 0DTE alert service',
			'swing trading options alerts',
			'SPX Profit Pulse',
			'Sunday Alpha Protocol',
			'price action options watchlists'
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
		jsonLdSchema: buildAlertServicesHubJsonLd(SITE_ORIGIN)
	};
};
