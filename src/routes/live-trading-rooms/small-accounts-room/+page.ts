import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSmallAccountsRoomJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import type { PageLoad } from './$types';

const DESCRIPTION =
	'Explore a proposed small-account trading education room focused on position sizing and risk awareness. Concept in development; paid enrollment unavailable.';

/** Static marketing page: identical for every visitor, so it is rendered once at build time (SSG). */
export const prerender = true;

export const load: PageLoad = ({ url }) => {
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		title: 'Small Accounts Trading Room',
		description: DESCRIPTION,
		keywords: [
			'small accounts trading room',
			'how to grow a $500 trading account',
			'small account options trading room',
			'T+1 cash account day trading',
			'avoid PDT rule $500 account',
			'Mark McGoldrick trading lineage',
			'Revolution Trading Pros small accounts room'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Small Accounts Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Small Accounts Trading Room | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSmallAccountsRoomJsonLd(SITE_ORIGIN)
	};
};
