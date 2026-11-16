import { BRAND } from '#lib/config/brand.ts';
import { definePageMetaTags } from 'svelte-meta-tags';
import { coursesCatalog } from '#lib/data/courses.ts';
import { buildTodoPageMetaTags, type TodoPageSpec } from '#lib/data/todo-pages.ts';
import {
	buildSingleCourseJsonLd,
	getCanonicalUrl,
	SITE_ORIGIN,
	isNoIndexRoute
} from '#lib/seo/structured-data.ts';
import type { EntryGenerator, PageLoad } from './$types';

const DESCRIPTION =
	'Inside The Move Prior to The Move Ultra curriculum: Monthly-to-1-Minute pure price structure, asymmetric options selection, and binary invalidation stops.';

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

function buildCourseTodoSpec(slug: string): TodoPageSpec {
	const matched = coursesCatalog.find((c) => c.slug === slug || c.id === slug);
	const pageName = matched ? matched.title : `Trading Course (${slug})`;
	const shortTitle = matched ? `${matched.code.split('//')[0].trim()} — TODO` : 'Course — TODO';
	return {
		route: `/store/courses/${slug}`,
		slug,
		pageName,
		metaTitle: shortTitle.slice(0, 32),
		metaDescription:
			`Dedicated course syllabus placeholder for ${pageName}. Replaces shared flagship fallback rendering on /store/courses/${slug}.`.slice(
				0,
				158
			),
		categoryBadge: `${matched?.code ?? 'STORE COURSE'} · TODO`,
		summary: matched
			? `${matched.hook} ${matched.coreOutcome}`
			: 'Dedicated course product page pending standalone curriculum, module breakdown, and enrollment buildout.',
		connectedFrom: 'Courses Store catalog (/store/courses) card link.',
		todoChecklist: matched
			? [
					...matched.syllabus,
					'Build dedicated course landing layout, video module previews, and enrollment package cards.'
				]
			: [
					'Write standalone course syllabus, module breakdown, and suitability criteria.',
					'Connect course enrollment package cards once Store launches.'
				],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Courses', href: '/store/courses' },
			{ label: `${matched?.code.split('//')[0].trim() ?? slug} (TODO)` }
		],
		relatedLinks: [
			{
				label: 'All Trading Courses (/store/courses)',
				href: '/store/courses',
				description: 'Return to the 8-course institutional curriculum.'
			},
			{
				label: 'Flagship Built Course: Move Prior to The Move™ Ultra',
				href: '/store/courses/move-prior-to-the-move-ultra',
				description: 'View the fully built flagship course and indicator bundle page.'
			},
			...(matched
				? [
						{
							label: matched.room.label.replace(/\s*→$/, ''),
							href: matched.room.href,
							description: 'Explore the live room or resource paired with this course.'
						}
					]
				: [])
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
		const todoSpec = buildCourseTodoSpec(slug);
		return {
			...buildTodoPageMetaTags(todoSpec),
			slug,
			todoSpec,
			jsonLdSchema: buildSingleCourseJsonLd(SITE_ORIGIN, slug)
		};
	}

	const pageTags = definePageMetaTags({
		// 29 chars before suffix -> "Move Prior to The Move Course | Brand" (55 chars total)
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
			title: `Move Prior to The Move Course | ${BRAND.name}`,
			description: DESCRIPTION
		},
		twitter: {
			title: `Move Prior to The Move Course | ${BRAND.name}`,
			description: DESCRIPTION
		}
	});

	return {
		...pageTags,
		slug,
		todoSpec: undefined,
		jsonLdSchema: buildSingleCourseJsonLd(SITE_ORIGIN, slug)
	};
};
