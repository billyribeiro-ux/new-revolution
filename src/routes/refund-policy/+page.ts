import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	REFUND_POLICY_DESCRIPTION,
	SITE_ORIGIN,
	buildRefundPolicyPageJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Cancellation & Refund Policy';
	const description = REFUND_POLICY_DESCRIPTION;
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
