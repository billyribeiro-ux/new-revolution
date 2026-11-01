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
	const title = 'Sunday Alpha Protocol™ Watchlist';
	const description =
		'Institutional stock & options swing blueprints by Billy Ribeiro. Every Sunday at 5 PM EST, get 5-7 setups with 15m triggers, cent stops & 1:2.50+ R:R.';
	const canonical = getCanonicalUrl(url);

	return {
		...definePageMetaTags({
			title,
			description,
			canonical,
			openGraph: {
				type: 'website',
				url: canonical,
				title: `Sunday Alpha Protocol™ — Institutional Swing Trading Blueprint | ${BRAND_NAME}`,
				description
			},
			twitter: {
				title: `Sunday Alpha Protocol™ — Engineered by Billy Ribeiro | ${BRAND_NAME}`,
				description
			}
		}),
		jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
	};
};
