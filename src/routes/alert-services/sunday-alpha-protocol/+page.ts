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
	const title = 'Sunday Alpha Protocol';
	const description =
		'Explore the Sunday Alpha Protocol concept for weekly stock and options preparation and illustrative plans. In development; paid subscriptions unavailable.';
	const canonical = getCanonicalUrl(url);

	return {
		...definePageMetaTags({
			title,
			description,
			canonical,
			openGraph: {
				type: 'website',
				url: canonical,
				title: `Sunday Alpha Protocol | ${BRAND_NAME}`,
				description
			},
			twitter: {
				title: `Sunday Alpha Protocol | ${BRAND_NAME}`,
				description
			}
		}),
		jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
	};
};
