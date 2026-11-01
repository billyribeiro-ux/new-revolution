import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	buildRefundPolicyPageJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Cancellation & Refund Policy';
	const description =
		'Transparent subscription cancellation, billing terms, and refund policy for Revolution Trading Pros memberships, alert services, and digital software.';
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
		jsonLdSchema: buildRefundPolicyPageJsonLd(SITE_ORIGIN)
	};
};
