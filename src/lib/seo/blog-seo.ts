import { definePageMetaTags } from 'svelte-meta-tags';
import {
	BRAND_NAME,
	BRAND_SOCIAL_IMAGE_HEIGHT,
	BRAND_SOCIAL_IMAGE_PATH,
	BRAND_SOCIAL_IMAGE_WIDTH,
	SITE_ORIGIN,
	buildOrganizationEntity
} from './structured-data';
import { computeRenderedTitle } from '#lib/shared/seo/meta-budget';

export interface BlogBreadcrumbItem {
	name: string;
	path: string;
}

export interface BlogSeoHeadInput {
	title: string;
	description: string;
	pathname: string;
	indexable?: boolean;
	nofollow?: boolean;
	ogType?: 'website' | 'article';
	ogTitle?: string | null;
	ogDescription?: string | null;
	ogImage?: string | null;
	ogImageAlt?: string | null;
	ogImageWidth?: number | null;
	ogImageHeight?: number | null;
	twitterCard?: 'summary' | 'summary_large_image';
	twitterTitle?: string | null;
	twitterDescription?: string | null;
	twitterImage?: string | null;
	twitterImageAlt?: string | null;
	authorName?: string | null;
	publishedTime?: string | null;
	modifiedTime?: string | null;
	section?: string | null;
	tags?: string[];
}

export function resolvePostModifiedIso(post: {
	contentUpdatedAt?: Date | string | null;
	updatedAt?: Date | string | null;
	publishedAt?: Date | string | null;
	createdAt?: Date | string | null;
}): string {
	const raw = post.contentUpdatedAt ?? post.updatedAt ?? post.publishedAt ?? post.createdAt;
	if (!raw) return new Date(0).toISOString();
	const parsed = raw instanceof Date ? raw : new Date(raw);
	return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export function buildBlogPageMetaTags(input: BlogSeoHeadInput) {
	const indexable = input.indexable ?? true;
	const nofollow = input.nofollow ?? false;
	const cleanPath = input.pathname === '/' ? '' : input.pathname.replace(/\/+$/, '');
	const canonicalUrl = `${SITE_ORIGIN}${cleanPath}`;

	const renderedBudget = computeRenderedTitle(input.title, BRAND_NAME);
	const titleTemplate = renderedBudget.brandAppended ? `%s | ${BRAND_NAME}` : '%s';
	const fullTitle = renderedBudget.renderedTitle;

	const resolvedOgImage =
		input.ogImage && input.ogImage.startsWith('http')
			? input.ogImage
			: input.ogImage
				? `${SITE_ORIGIN}${input.ogImage}`
				: `${SITE_ORIGIN}${BRAND_SOCIAL_IMAGE_PATH}`;

	const resolvedOgAlt = (input.ogImageAlt || input.title).trim();
	const resolvedTwitterImage =
		input.twitterImage && input.twitterImage.startsWith('http')
			? input.twitterImage
			: input.twitterImage
				? `${SITE_ORIGIN}${input.twitterImage}`
				: resolvedOgImage;

	const dedupedTags = input.tags
		? Array.from(new Set(input.tags.map((t) => t.trim()).filter(Boolean)))
		: [];

	const robotsDirective = `${indexable ? 'index' : 'noindex'}, ${nofollow ? 'nofollow' : 'follow'}`;

	const additionalMetaTags: Array<
		{ name: string; content: string } | { property: string; content: string }
	> = [
		{ name: 'theme-color', content: '#0b0e12' },
		{ property: 'og:locale:alternate', content: 'en_CA' }
	];

	if (input.authorName?.trim()) {
		additionalMetaTags.push({
			name: 'author',
			content: input.authorName.trim()
		});
	}

	return definePageMetaTags({
		title: input.title,
		titleTemplate,
		description: input.description,
		canonical: indexable ? canonicalUrl : undefined,
		robots: robotsDirective,
		additionalRobotsProps: indexable
			? {
					maxSnippet: -1,
					maxImagePreview: 'large',
					maxVideoPreview: -1
				}
			: undefined,
		languageAlternates: indexable
			? [
					{ hrefLang: 'en-us', href: canonicalUrl },
					{ hrefLang: 'en-ca', href: canonicalUrl },
					{ hrefLang: 'x-default', href: canonicalUrl }
				]
			: [],
		openGraph: {
			type: input.ogType ?? 'website',
			url: canonicalUrl,
			locale: 'en_US',
			siteName: BRAND_NAME,
			title: input.ogTitle?.trim() || fullTitle,
			description: input.ogDescription?.trim() || input.description,
			images: [
				{
					url: resolvedOgImage,
					secureUrl: resolvedOgImage,
					alt: resolvedOgAlt,
					...(input.ogImageWidth && input.ogImageHeight
						? {
								width: input.ogImageWidth,
								height: input.ogImageHeight
							}
						: !input.ogImage
							? {
									width: BRAND_SOCIAL_IMAGE_WIDTH,
									height: BRAND_SOCIAL_IMAGE_HEIGHT
								}
							: {})
				}
			],
			...(input.ogType === 'article'
				? {
						article: {
							publishedTime: input.publishedTime ?? undefined,
							modifiedTime: input.modifiedTime ?? undefined,
							section: input.section ?? undefined,
							authors: input.authorName ? [input.authorName] : undefined,
							tags: dedupedTags.length > 0 ? dedupedTags : undefined
						}
					}
				: {})
		},
		twitter: {
			cardType: input.twitterCard ?? 'summary_large_image',
			title: input.twitterTitle?.trim() || input.ogTitle?.trim() || fullTitle,
			description:
				input.twitterDescription?.trim() || input.ogDescription?.trim() || input.description,
			image: resolvedTwitterImage,
			imageAlt: input.twitterImageAlt?.trim() || resolvedOgAlt
		},
		additionalMetaTags
	});
}

function buildBlogWebsiteEntity(origin: string) {
	return {
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: BRAND_NAME,
		publisher: {
			'@id': `${origin}/#organization`
		}
	};
}

function buildBreadcrumbEntity(origin: string, pageUrl: string, items: BlogBreadcrumbItem[]) {
	return {
		'@type': 'BreadcrumbList',
		'@id': `${pageUrl}#breadcrumb`,
		itemListElement: items.map((item, idx) => ({
			'@type': 'ListItem',
			position: idx + 1,
			name: item.name,
			item: `${origin}${item.path === '/' ? '' : item.path}`
		}))
	};
}

export function buildBlogIndexJsonLd(
	posts: Array<{
		title: string;
		slug: string;
		excerpt?: string | null;
		coverImage?: string | null;
		publishedAt?: Date | string | null;
		updatedAt?: Date | string | null;
		contentUpdatedAt?: Date | string | null;
		author?: { name: string; slug: string } | null;
	}>,
	origin = SITE_ORIGIN
) {
	const pageUrl = `${origin}/blog`;
	const topTen = posts.slice(0, 10);

	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildOrganizationEntity(origin),
			buildBlogWebsiteEntity(origin),
			buildBreadcrumbEntity(origin, pageUrl, [
				{ name: 'Home', path: '/' },
				{ name: 'Blog', path: '/blog' }
			]),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Trading Insights & Market Structure Blog | ${BRAND_NAME}`,
				isPartOf: { '@id': `${origin}/#website` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Blog',
				'@id': `${pageUrl}#blog`,
				url: pageUrl,
				name: `${BRAND_NAME} Blog`,
				publisher: { '@id': `${origin}/#organization` },
				blogPost: topTen.map((p) => ({
					'@type': 'BlogPosting',
					'@id': `${origin}/blog/${p.slug}#article`,
					headline: p.title,
					url: `${origin}/blog/${p.slug}`,
					description: p.excerpt ?? '',
					datePublished: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
					dateModified: resolvePostModifiedIso(p),
					...(p.coverImage ? { image: p.coverImage } : {}),
					...(p.author
						? {
								author: {
									'@type': 'Person',
									name: p.author.name
								}
							}
						: {})
				}))
			}
		]
	};
}

const CROP_ORDER = ['16x9', '4x3', '1x1'] as const;

/**
 * Article `image` entries: one absolute ImageObject per crop, ordered 16x9, 4x3, 1x1. Crops under 50,000 px
 * (Google's minimum, docs/SEO_EVIDENCE.md row 19) or with a non-positive size are dropped; callers fall back to
 * the single cover ImageObject when this returns [].
 */
function buildArticleCropImages(
	crops: Array<{ aspect: string; url: string; width: number; height: number }> | null | undefined,
	origin: string,
	caption?: string | null
): Array<Record<string, unknown>> {
	if (!crops?.length) return [];
	const out: Array<Record<string, unknown>> = [];
	for (const aspect of CROP_ORDER) {
		const crop = crops.find((c) => c.aspect === aspect);
		if (!crop?.url || !(crop.width > 0) || !(crop.height > 0)) continue;
		if (crop.width * crop.height < 50_000) continue;
		out.push({
			'@type': 'ImageObject',
			url: crop.url.startsWith('http') ? crop.url : `${origin}${crop.url}`,
			width: crop.width,
			height: crop.height,
			...(caption ? { caption } : {})
		});
	}
	return out;
}

export function buildBlogPostJsonLd(
	input: {
		locked?: boolean;
		slug: string;
		title: string;
		description?: string;
		coverImage?: string | null;
		coverImageCaption?: string | null;
		coverImageWidth?: number | null;
		coverImageHeight?: number | null;
		/** Fixed-ratio cover crops (see getMediaCropsForUrl). Used for Article `image` when present. */
		coverImageCrops?: Array<{ aspect: string; url: string; width: number; height: number }> | null;
		publishedAt?: Date | string | null;
		updatedAt?: Date | string | null;
		contentUpdatedAt?: Date | string | null;
		createdAt?: Date | string | null;
		wordCount?: number | null;
		isPillar?: boolean;
		schemaType?: string | null;
		focusKeyword?: string | null;
		secondaryKeywords?: string[];
		category?: { name: string; slug: string } | null;
		author?: {
			name: string;
			slug: string;
			jobTitle?: string | null;
			shortBio?: string | null;
			bio?: string | null;
			avatar?: string | null;
			linkedin?: string | null;
			twitter?: string | null;
			website?: string | null;
			expertise?: string | null;
		} | null;
		faqItems?: Array<{ question: string; answer: string }>;
	},
	origin = SITE_ORIGIN
) {
	const pageUrl = `${origin}/blog/${input.slug}`;
	const breadcrumbs: BlogBreadcrumbItem[] = [
		{ name: 'Home', path: '/' },
		{ name: 'Blog', path: '/blog' },
		...(input.category && !input.locked
			? [{ name: input.category.name, path: `/blog/category/${input.category.slug}` }]
			: []),
		{ name: input.title, path: `/blog/${input.slug}` }
	];

	// Section 7.15: Locked posts emit ONLY Organization, WebSite, and BreadcrumbList
	if (input.locked) {
		return {
			'@context': 'https://schema.org',
			'@graph': [
				buildOrganizationEntity(origin),
				buildBlogWebsiteEntity(origin),
				buildBreadcrumbEntity(origin, pageUrl, breadcrumbs)
			]
		};
	}

	const graph: Record<string, unknown>[] = [
		buildOrganizationEntity(origin),
		buildBlogWebsiteEntity(origin),
		buildBreadcrumbEntity(origin, pageUrl, breadcrumbs)
	];

	let authorId = `${origin}/#organization`;
	if (input.author) {
		authorId = `${origin}/#author-${input.author.slug}`;
		const sameAs = [input.author.linkedin, input.author.twitter, input.author.website].filter(
			(u): u is string => Boolean(u && u.trim())
		);

		graph.push({
			'@type': 'Person',
			'@id': authorId,
			name: input.author.name,
			...(input.author.jobTitle ? { jobTitle: input.author.jobTitle } : {}),
			...(input.author.shortBio || input.author.bio
				? { description: input.author.shortBio || input.author.bio }
				: {}),
			...(input.author.avatar ? { image: input.author.avatar } : {}),
			...(sameAs.length > 0 ? { sameAs } : {}),
			worksFor: { '@id': `${origin}/#organization` },
			...(input.author.expertise
				? {
						knowsAbout: input.author.expertise
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean)
					}
				: {})
		});
	}

	const articleType = input.isPillar ? 'Article' : input.schemaType || 'BlogPosting';

	const keywordsList = [
		...(input.focusKeyword ? [input.focusKeyword] : []),
		...(input.secondaryKeywords ?? [])
	].filter(Boolean);

	const imageNode = input.coverImage
		? {
				'@type': 'ImageObject',
				url: input.coverImage.startsWith('http')
					? input.coverImage
					: `${origin}${input.coverImage}`,
				...(input.coverImageCaption ? { caption: input.coverImageCaption } : {}),
				...(input.coverImageWidth && input.coverImageHeight
					? {
							width: input.coverImageWidth,
							height: input.coverImageHeight
						}
					: {})
			}
		: undefined;

	const articleImages = buildArticleCropImages(
		input.coverImageCrops,
		origin,
		input.coverImageCaption
	);

	graph.push({
		'@type': articleType,
		'@id': `${pageUrl}#article`,
		headline: input.title,
		description: input.description ?? '',
		...(imageNode
			? {
					image: articleImages.length > 0 ? articleImages : imageNode,
					thumbnailUrl: imageNode.url
				}
			: {}),
		datePublished: input.publishedAt
			? new Date(input.publishedAt).toISOString()
			: resolvePostModifiedIso(input),
		dateModified: resolvePostModifiedIso(input),
		inLanguage: 'en-US',
		...(input.wordCount ? { wordCount: input.wordCount } : {}),
		isAccessibleForFree: true,
		author: { '@id': authorId },
		publisher: { '@id': `${origin}/#organization` },
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': pageUrl
		},
		isPartOf: { '@id': `${origin}/#website` },
		speakable: {
			'@type': 'SpeakableSpecification',
			cssSelector: ['h1', '.article-excerpt']
		},
		...(keywordsList.length > 0 ? { keywords: keywordsList.join(', ') } : {}),
		...(input.category ? { articleSection: input.category.name } : {})
	});

	if (input.faqItems && input.faqItems.length > 0) {
		graph.push({
			'@type': 'FAQPage',
			'@id': `${pageUrl}#faq`,
			mainEntity: input.faqItems.map((faq) => ({
				'@type': 'Question',
				name: faq.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: faq.answer
				}
			}))
		});
	}

	return {
		'@context': 'https://schema.org',
		'@graph': graph
	};
}

export function buildTaxonomyCollectionJsonLd(
	input: {
		kind: 'category' | 'tag';
		name: string;
		slug: string;
		description?: string | null;
		posts: Array<{ title: string; slug: string }>;
	},
	origin = SITE_ORIGIN
) {
	const pagePath = `/blog/${input.kind}/${input.slug}`;
	const pageUrl = `${origin}${pagePath}`;

	return {
		'@context': 'https://schema.org',
		'@graph': [
			buildOrganizationEntity(origin),
			buildBlogWebsiteEntity(origin),
			buildBreadcrumbEntity(origin, pageUrl, [
				{ name: 'Home', path: '/' },
				{ name: 'Blog', path: '/blog' },
				{ name: input.name, path: pagePath }
			]),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#collection`,
				url: pageUrl,
				name: `${input.name} Articles | ${BRAND_NAME}`,
				description: input.description ?? `Articles filed under ${input.name}.`,
				isPartOf: { '@id': `${origin}/#website` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				mainEntity: {
					'@type': 'ItemList',
					itemListElement: input.posts.map((p, idx) => ({
						'@type': 'ListItem',
						position: idx + 1,
						name: p.title,
						url: `${origin}/blog/${p.slug}`
					}))
				}
			}
		]
	};
}
