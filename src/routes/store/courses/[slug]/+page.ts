import { definePageMetaTags } from 'svelte-meta-tags';
import { buildSingleCourseJsonLd, getCanonicalUrl, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim & TradingView tools.';

const FLAGSHIP_SLUG = 'move-prior-to-the-move-ultra';

/** Prerender canonical course landing pages at build time (SSG). */
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ slug: 'move-prior-to-the-move-ultra' },
	{ slug: 'move-prior-to-the-move-masterclass' },
	{ slug: 'small-account-compounding-blueprint' },
	{ slug: 'options-greeks-and-volatility-mastery' },
	{ slug: 'working-pro-swing-trading-system' },
	{ slug: 'spx-0dte-and-index-gamma-execution' },
	{ slug: 'contrarian-distribution-and-shorting' },
	{ slug: 'macro-cycle-inflection-mastery' },
	{ slug: 'institutional-risk-and-trader-psychology' }
];

export const load: PageLoad = ({ url, params }) => {
	const slug = params?.slug || FLAGSHIP_SLUG;
	// Every slug currently renders the same product template (identical title, copy and schema),
	// so non-flagship URLs declare the flagship page as canonical to avoid duplicate-content
	// indexing. Remove this once each product has its own unique content and metadata.
	const canonicalUrl =
		slug === FLAGSHIP_SLUG ? getCanonicalUrl(url) : `${SITE_ORIGIN}/store/courses/${FLAGSHIP_SLUG}`;

	const pageTags = definePageMetaTags({
		// 29 chars before suffix -> "Move Prior to The Move Course | Revolution Trading Pros" (55 chars total)
		title: 'Move Prior to The Move Course',
		description: DESCRIPTION,
		canonical: canonicalUrl,
		keywords: [
			'The Move Prior to The Move course',
			'Move Prior to The Move Ultra indicator',
			'Billy Ribeiro trading course',
			'multi-timeframe volatility squeeze indicator',
			'ThinkorSwim TradingView order flow course',
			'Mark McGoldrick trading mentorship lineage'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: 'Move Prior to The Move Course | Revolution Trading Pros',
			description: DESCRIPTION
		},
		twitter: {
			title: 'Move Prior to The Move Course | Revolution Trading Pros',
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		jsonLdSchema: buildSingleCourseJsonLd(SITE_ORIGIN, slug)
	};
};
