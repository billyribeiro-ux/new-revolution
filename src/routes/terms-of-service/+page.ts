import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	buildTermsOfServicePageJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Terms of Service & Disclosures';
	const description =
		'Review the Terms of Service, educational risk disclosures, and U.S. (SEC/CFTC/FINRA) and Canadian (OSC/BCSC/ASC) regulatory notices for our platform.';
	const canonical = getCanonicalUrl(url);

	return {
		...definePageMetaTags({
			title,
			description,
			canonical,
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
		}),
		jsonLdSchema: buildTermsOfServicePageJsonLd(SITE_ORIGIN)
	};
};
