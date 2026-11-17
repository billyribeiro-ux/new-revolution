import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildMembershipsJsonLd,
	getCanonicalUrl,
	MEMBERSHIPS_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';
export const prerender = true;
export const load: PageLoad = ({ url }) => ({
	...definePageMetaTags({
		title: 'Compare Trading Memberships',
		description: MEMBERSHIPS_DESCRIPTION,
		canonical: getCanonicalUrl(url)
	}),
	jsonLdSchema: buildMembershipsJsonLd(SITE_ORIGIN)
});
