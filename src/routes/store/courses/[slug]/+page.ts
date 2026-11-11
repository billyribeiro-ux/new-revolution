import { definePageMetaTags } from 'svelte-meta-tags';
import {
	buildSingleCourseJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Preview the Move Prior to The Move course concept, proposed lessons, and illustrative study tools. In development; no purchases or paid enrollment available.';

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
	const isFlagship = slug === FLAGSHIP_SLUG;
	// The flagship is the only indexable product, and only once /store has launched (#lib/data/launch-gate.ts).
	const indexable = isFlagship && !isNoIndexRoute(url.pathname);
	const canonicalUrl = getCanonicalUrl(url);

	const pageTags = definePageMetaTags({
		// 29 chars before suffix -> "Move Prior to The Move Course | Revolution Trading Pros" (55 chars total)
		title: 'Move Prior to The Move Course',
		description: DESCRIPTION,
		canonical: indexable ? canonicalUrl : undefined,
		robots: indexable ? 'index, follow' : 'noindex, nofollow',
		additionalRobotsProps: indexable
			? {
					maxSnippet: -1,
					maxImagePreview: 'large',
					maxVideoPreview: -1
				}
			: undefined,
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
