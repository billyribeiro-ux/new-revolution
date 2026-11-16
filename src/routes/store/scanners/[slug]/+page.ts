import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import { FLAGSHIP_SCANNER_SLUG, scannersCatalog } from '#lib/data/scanners.ts';
import { buildTodoPageMetaTags, type TodoPageSpec } from '#lib/data/todo-pages.ts';
import {
	buildSingleScannerJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Review the High Octane market scanner architecture for filtering multi-timeframe volatility compression, relative volume, and liquid options candidates.';

/** Prerender canonical scanner product pages at build time (SSG). */
export const prerender = true;

export const entries: EntryGenerator = () => [
	{ slug: 'high-octane-scanner' },
	{ slug: 'move-prior-to-the-move-radar' },
	{ slug: 'multi-timeframe-squeeze-scanner' },
	{ slug: 'liquidity-sweep-stop-hunt-scanner' },
	{ slug: 'small-account-affordable-options-scanner' },
	{ slug: 'working-pro-eod-swing-scanner' },
	{ slug: 'spx-dealer-gamma-iv-skew-scanner' },
	{ slug: 'smart-money-relative-volume-scanner' },
	{ slug: 'opening-bell-gap-and-go-fade-scanner' }
];

function buildScannerTodoSpec(slug: string): TodoPageSpec {
	const matched = scannersCatalog.find((s) => s.slug === slug || s.id === slug);
	const pageName = matched ? matched.name : `Market Scanner (${slug})`;
	return {
		route: `/store/scanners/${slug}`,
		slug,
		pageName,
		metaTitle: 'Market Scanner — TODO',
		metaDescription:
			`Dedicated scanner product placeholder for ${pageName}. Replaces shared flagship fallback rendering on /store/scanners/${slug}.`.slice(
				0,
				158
			),
		categoryBadge: `${matched?.code ?? 'STORE SCANNER'} · TODO`,
		summary: matched
			? `${matched.hook} ${matched.description}`
			: 'Dedicated market scanner product page pending standalone live radar preview and filter documentation.',
		connectedFrom: 'Scanners Store catalog (/store/scanners) card link.',
		todoChecklist: matched
			? [
					...matched.features,
					'Build standalone interactive scanner preview and ThinkorSwim / TradingView import links.'
				]
			: [
					'Build standalone scanner filter documentation and radar preview.',
					'Connect scanner license provisioning once Store launches.'
				],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Scanners', href: '/store/scanners' },
			{ label: `${matched?.code.split('//')[0].trim() ?? slug} (TODO)` }
		],
		relatedLinks: [
			{
				label: 'All Market Scanners (/store/scanners)',
				href: '/store/scanners',
				description: 'Return to the 8-scanner institutional radar catalog.'
			},
			{
				label: 'Flagship Built Scanner: High Octane Scanner™',
				href: '/store/scanners/high-octane-scanner',
				description: 'View the fully built High Octane Scanner interactive product page.'
			},
			{
				label: 'Pure Price-Action Methodology',
				href: '/methodology',
				description: 'Pair market scanners with 100% indicator-free price structure.'
			}
		]
	};
}

export const load: PageLoad = ({ url, params }) => {
	const slug = params?.slug || FLAGSHIP_SCANNER_SLUG;
	const isFlagship = slug === FLAGSHIP_SCANNER_SLUG;
	// The flagship is the only indexable product, and only once /store has launched (#lib/data/launch-gate.ts).
	const indexable = isFlagship && !isNoIndexRoute(url.pathname);
	const canonicalUrl = getCanonicalUrl(url);

	if (!isFlagship) {
		const todoSpec = buildScannerTodoSpec(slug);
		return {
			...buildTodoPageMetaTags(todoSpec),
			slug,
			todoSpec,
			jsonLdSchema: buildSingleScannerJsonLd(SITE_ORIGIN, slug)
		};
	}

	const pageTags = definePageMetaTags({
		// 27 chars before suffix -> "High Octane Options Scanner | Brand" (53 chars total)
		title: 'High Octane Options Scanner',
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
			'High Octane Scanner',
			'ThinkorSwim options scanner',
			'TradingView real-time scanner',
			'18-timeframe squeeze scanner',
			'small account options scanner',
			'institutional order flow scanner'
		],
		openGraph: {
			type: 'website',
			url: canonicalUrl,
			title: `High Octane Options Scanner | ${BRAND.name}`,
			description: DESCRIPTION
		},
		twitter: {
			title: `High Octane Options Scanner | ${BRAND.name}`,
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		slug,
		todoSpec: undefined,
		jsonLdSchema: buildSingleScannerJsonLd(SITE_ORIGIN, slug)
	};
};
