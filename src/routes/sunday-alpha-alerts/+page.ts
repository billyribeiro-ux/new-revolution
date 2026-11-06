import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	buildSundayAlphaProtocolJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Sunday Alpha Alerts';
	const description =
		'Explore Sunday Alpha Alerts stock and options research, weekly preparation, entry scenarios, risk levels, and educational tools for independent traders.';
	const canonical = getCanonicalUrl(url);

	return {
		...definePageMetaTags({
			title,
			description,
			canonical,
			openGraph: {
				type: 'website',
				url: canonical,
				title: `Sunday Alpha Alerts | ${BRAND_NAME}`,
				description
			},
			twitter: {
				title: `Sunday Alpha Alerts | ${BRAND_NAME}`,
				description
			}
		}),
		jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
	};
};
