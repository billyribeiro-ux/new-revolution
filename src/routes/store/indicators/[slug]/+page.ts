import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import { indicatorsCatalog } from '#lib/data/indicators.ts';
import { buildTodoPageMetaTags, type TodoPageSpec } from '#lib/data/todo-pages.ts';
import {
	buildSingleIndicatorJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Explore The Move Prior to The Move chart-structure study suite for multi-timeframe price exhaustion, supply/demand zones, and disciplined stop placement.';

const FLAGSHIP_SLUG = 'move-prior-to-the-move-system';

/** Prerender canonical indicator product pages at build time (SSG). */
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ slug: 'move-prior-to-the-move-system' },
	{ slug: 'move-prior-to-the-move-pro' },
	{ slug: 'mp-early-in-n-out-pro' },
	{ slug: 'multi-timeframe-squeeze-pro' },
	{ slug: 'institutional-volume-absorption' },
	{ slug: 'spx-dealer-gamma-levels' },
	{ slug: 'volatility-regime-compass' },
	{ slug: 'anchored-vwap-liquidity-bands' },
	{ slug: 'options-expected-move-corridor' },
	{ slug: 'mp-early-in-n-out' },
	{ slug: 'liquidity-sweep-radar' },
	{ slug: 'compression-squeeze-matrix' },
	{ slug: 'spx-gamma-zones' },
	{ slug: 'abandoned-bar-exhaustion' },
	{ slug: 'smart-money-volume-delta' },
	{ slug: 'hot-zone-time-structure' },
	{ slug: 'true-thrust-trend-ribbon' }
];

function humanizeSlug(slug: string): string {
	return slug
		.split('-')
		.map((part) =>
			part === 'spx' || part === 'vwap' || part === 'mp'
				? part.toUpperCase()
				: `${part.charAt(0).toUpperCase()}${part.slice(1)}`
		)
		.join(' ');
}

function buildIndicatorTodoSpec(slug: string): TodoPageSpec {
	const matched = indicatorsCatalog.find((i) => i.slug === slug || i.id === slug);
	const pageName = matched ? matched.name : `${humanizeSlug(slug)} Indicator`;
	return {
		route: `/store/indicators/${slug}`,
		slug,
		pageName,
		metaTitle: 'Indicator Product — TODO',
		metaDescription:
			`Dedicated indicator product placeholder for ${pageName}. Replaces shared flagship fallback rendering on /store/indicators/${slug}.`.slice(
				0,
				158
			),
		categoryBadge: `${matched?.codeName ?? 'STORE INDICATOR'} · TODO`,
		summary: matched
			? `${matched.hook} ${matched.whatItExposes}`
			: `Dedicated indicator product page for ${pageName}, pending standalone chart telemetry preview, platform specs, and license provisioning.`,
		connectedFrom: 'Indicators Store catalog (/store/indicators) card link.',
		todoChecklist: [
			`Build interactive chart telemetry preview for ${pageName}.`,
			`Document bar-close calculation rules, supported timeframes (${matched?.timeframes ?? '1-Min to Weekly'}), and ThinkorSwim / TradingView inputs.`,
			'Connect indicator license entitlement and workspace template delivery once Store launches.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Indicators', href: '/store/indicators' },
			{ label: `${pageName} (TODO)` }
		],
		relatedLinks: [
			{
				label: 'All Custom Indicators (/store/indicators)',
				href: '/store/indicators',
				description: 'Return to the full 8-indicator catalog.'
			},
			{
				label: 'Flagship Built Indicator: Move Prior to The Move™ System',
				href: '/store/indicators/move-prior-to-the-move-system',
				description: 'View the fully built flagship indicator product page.'
			},
			{
				label: 'Institutional Market Scanners',
				href: '/store/scanners',
				description: 'Pair chart indicators with real-time market scanners.'
			}
		]
	};
}

export const load: PageLoad = ({ url, params }) => {
	const slug = params?.slug || FLAGSHIP_SLUG;
	const isFlagship = slug === FLAGSHIP_SLUG;
	// The flagship is the only indexable product, and only once /store has launched (#lib/data/launch-gate.ts).
	const indexable = isFlagship && !isNoIndexRoute(url.pathname);
	const canonicalUrl = getCanonicalUrl(url);

	if (!isFlagship) {
		const todoSpec = buildIndicatorTodoSpec(slug);
		return {
			...buildTodoPageMetaTags(todoSpec),
			slug,
			todoSpec,
			jsonLdSchema: buildSingleIndicatorJsonLd(SITE_ORIGIN, slug)
		};
	}

	const pageTags = definePageMetaTags({
		// 27 chars before suffix -> "MP Early In & Out Indicator | Brand" (53 chars total)
		title: 'MP Early In & Out Indicator',
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
			'MP Early In and Out indicator',
			'MP_EarlyInNOut Pro indicator',
			'The Move Prior to The Move Pro System',
			'ThinkorSwim chart structure study',
			'TradingView order flow squeeze indicator',
			'ThinkorSwim mobile app custom indicator'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `MP Early In & Out Indicator | ${BRAND.name}`,
			description: DESCRIPTION
		},
		twitter: {
			title: `MP Early In & Out Indicator | ${BRAND.name}`,
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		slug,
		todoSpec: undefined,
		jsonLdSchema: buildSingleIndicatorJsonLd(SITE_ORIGIN, slug)
	};
};
