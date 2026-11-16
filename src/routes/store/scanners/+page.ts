import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildScannersStoreJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

/**
 * Character-locked metadata for `/store/scanners`:
 * - `<title>`: "Live Stock & Options Scanners | Brand"
 *   (29 chars before suffix, 55 chars total — safely below Google's 60-char / 580px limit)
 * - `<meta name="description">`: 148 chars total — zero desktop/mobile SERP truncation
 */
const PAGE_TITLE = 'Live Stock & Options Scanners';
const FULL_TITLE = `Live Stock & Options Scanners | ${BRAND.name}`;
const PAGE_DESCRIPTION =
	'Explore stock and options market scanners filtering liquid S&P 500 equities, sector ETFs, relative volume expansion, and tight bid-ask spread criteria.';

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = url ? getCanonicalUrl(url) : `${SITE_ORIGIN}/store/scanners`;

	const pageTags = definePageMetaTags({
		title: PAGE_TITLE,
		description: PAGE_DESCRIPTION,
		canonical: canonicalUrl,
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: FULL_TITLE,
			description: PAGE_DESCRIPTION
		},
		twitter: {
			title: FULL_TITLE,
			description: PAGE_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildScannersStoreJsonLd(SITE_ORIGIN)
	};
};
