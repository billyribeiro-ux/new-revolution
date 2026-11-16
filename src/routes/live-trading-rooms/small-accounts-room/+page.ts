import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSmallAccountsRoomJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	SMALL_ACCOUNTS_ROOM_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Small Accounts Trading Room',
		description: SMALL_ACCOUNTS_ROOM_DESCRIPTION,
		keywords: [
			'small accounts trading room',
			'$500 small options account risk management',
			'small account options trading room',
			'T+1 cash account day trading',
			'FINRA Rule 4210 intraday margin small account',
			`${BRAND.name} small accounts room`
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `Small Accounts Trading Room | ${BRAND.name}`,
			description: SMALL_ACCOUNTS_ROOM_DESCRIPTION
		},
		twitter: {
			title: `Small Accounts Trading Room | ${BRAND.name}`,
			description: SMALL_ACCOUNTS_ROOM_DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSmallAccountsRoomJsonLd(SITE_ORIGIN)
	};
};
