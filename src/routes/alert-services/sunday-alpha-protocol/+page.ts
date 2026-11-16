import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	SUNDAY_ALPHA_PROTOCOL_DESCRIPTION,
	buildSundayAlphaProtocolJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Sunday Alpha Protocol';
	const description = SUNDAY_ALPHA_PROTOCOL_DESCRIPTION;
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
