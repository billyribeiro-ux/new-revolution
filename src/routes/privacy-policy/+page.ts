import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	buildPrivacyPolicyPageJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Privacy Policy & Data Security';
	const description =
		'Learn how Revolution Trading Pros collects, protects, and handles member account data, cookies, and analytics across US and Canadian jurisdictions.';
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
		jsonLdSchema: buildPrivacyPolicyPageJsonLd(SITE_ORIGIN)
	};
};
