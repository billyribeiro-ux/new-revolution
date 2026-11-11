import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	SITE_ORIGIN,
	buildEditorialPolicyPageJsonLd,
	getCanonicalUrl
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Editorial Policy & Standards';
	const description =
		'Read how AI is used in this trading education website concept, its content limitations, source verification goals, and process for reporting possible errors.';
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
		jsonLdSchema: buildEditorialPolicyPageJsonLd(SITE_ORIGIN)
	};
};
