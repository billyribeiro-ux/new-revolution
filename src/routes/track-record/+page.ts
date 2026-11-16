import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	buildTrackRecordJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	TRACK_RECORD_PAGE_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const title = 'Trade Ledger & Case Studies';
	const description = TRACK_RECORD_PAGE_DESCRIPTION;
	const canonical = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title,
		description,
		canonical,
		keywords: [
			'trading track record',
			'options trade ledger',
			'verified trading case studies',
			'stop out transparency',
			'Billy Ribeiro market calls',
			'CFTC Rule 4.41 trading disclosure'
		],
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
	});

	return {
		...pageTags,
		jsonLdSchema: buildTrackRecordJsonLd(SITE_ORIGIN)
	};
};
