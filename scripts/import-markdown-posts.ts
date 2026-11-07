// Idempotent importer for the 40 production Markdown blog posts in `content/blog-posts/blog-post-*.md`.
// Run with: `pnpm db:import-posts` (imports as 'draft' by default; pass `--publish` to import as 'published').

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { persistPostSearchProjection } from '../src/lib/server/posts/search-persistence.ts';
import { sanitizePostHtml } from '../src/lib/sanitize-post-html.ts';
import { ensureDbReady } from '../src/lib/server/db/index.ts';
import {
	authors,
	categories,
	media,
	mediaFolders,
	postCategories,
	posts,
	postTags,
	tags
} from '../src/lib/server/db/schema.ts';
import { generateSlug } from '../src/lib/shared/seo/slug.ts';
import { countContentWords, normalizePostHeadings } from '../src/lib/shared/seo/toc.ts';

export interface ParsedImageSpec {
	src: string;
	alt: string;
	title: string;
	caption: string;
	description: string;
	width: number;
	height: number;
	isCover: boolean;
}

export interface ParsedMarkdownPost {
	filename: string;
	title: string;
	slug: string;
	metaTitle: string;
	metaDescription: string;
	excerpt: string;
	focusKeyword: string;
	secondaryKeywords: string;
	categoryName: string;
	categorySlug: string;
	tagSlugs: string[];
	schemaType: 'Article' | 'BlogPosting' | 'NewsArticle' | 'HowTo';
	isPillar: boolean;
	coverImage: string;
	coverImageAlt: string;
	coverImageTitle: string;
	coverImageCaption: string;
	coverImageDescription: string;
	coverImageWidth: number;
	coverImageHeight: number;
	images: ParsedImageSpec[];
	contentHtml: string;
	faqItemsJson: string;
}

function escapeHtmlAttr(val: string): string {
	return val
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

const CANONICAL_CATEGORY_NAMES: Record<string, string> = {
	'market-structure': 'Market Structure',
	'options-mastery': 'Options & Greeks Mastery',
	'institutional-execution': 'Institutional Order Flow',
	'trading-psychology': 'Risk & Psychology',
	'small-accounts': '$500+ Small Accounts',
	'working-professionals': 'Swing & Working Pros'
};

function extractTableField(md: string, labelPattern: string): string {
	const regex = new RegExp(`\\|\\s*[^|]*${labelPattern}[^|]*\\|\\s*\`([^\`]+)\`[^|]*\\|`, 'i');
	const match = md.match(regex);
	return match?.[1]?.trim() ?? '';
}

function extractBulletCodeField(section: string, labelPattern: string): string {
	const regex = new RegExp(`-\\s*\\*\\*[^*]*${labelPattern}[^*]*\\*\\*\\s*\`([^\`]+)\``, 'i');
	const match = section.match(regex);
	return match?.[1]?.trim() ?? '';
}

function extractBulletPlainField(section: string, labelPattern: string): string {
	const regex = new RegExp(`-\\s*\\*\\*[^*]*${labelPattern}[^*]*\\*\\*\\s*(.+)$`, 'im');
	const match = section.match(regex);
	return match?.[1]?.trim() ?? '';
}

function parseSection2Images(rawMd: string): ParsedImageSpec[] {
	const sec2 = rawMd.split(/^##\s+3\./m)[0]?.split(/^##\s+2\./m)[1] ?? '';
	const subsections = sec2.split(/^###\s+2\.\d+\s+/m).slice(1);
	const specs: ParsedImageSpec[] = [];

	for (let i = 0; i < subsections.length; i++) {
		const sub = subsections[i];
		const isCover = i === 0;
		const src = extractBulletCodeField(sub, '`src`');
		const alt = extractBulletCodeField(sub, '`alt_text`');
		const title = extractBulletCodeField(sub, '`title`');
		const caption = extractBulletCodeField(sub, '`caption`');
		const description = extractBulletPlainField(sub, '`image_description`');
		const dimMatch = sub.match(/width="(\d+)"\s+height="(\d+)"/i);
		const width = dimMatch?.[1] ? Number.parseInt(dimMatch[1], 10) : 1200;
		const height = dimMatch?.[2] ? Number.parseInt(dimMatch[2], 10) : isCover ? 630 : 675;

		if (src) {
			specs.push({
				src,
				alt,
				title,
				caption,
				description,
				width,
				height,
				isCover
			});
		}
	}

	return specs;
}

export function parseMarkdownPostFile(filename: string, rawMd: string): ParsedMarkdownPost {
	const h1Match = rawMd.match(/^#\s+Blog Post #\d+:\s+(.+)$/m);
	const title = extractTableField(rawMd, '`title`') || h1Match?.[1]?.trim() || filename;
	const slugFromFilename = filename.replace(/^blog-post-\d+-/, '').replace(/\.md$/, '');
	const slug = extractTableField(rawMd, '`slug`') || slugFromFilename;

	const metaTitle = extractTableField(rawMd, '`metaTitle`') || title.slice(0, 60);
	const metaDescription = extractTableField(rawMd, '`metaDescription`');
	const excerpt = extractTableField(rawMd, '`excerpt`') || metaDescription;
	const focusKeyword = extractTableField(rawMd, '`focusKeyword`');
	const secondaryKeywords = extractTableField(rawMd, '`secondaryKeywords`') || '[]';

	const catSlugMatch = rawMd.match(/\|[^|]*`category`[^|]*\|[^|]*slug:\s*([a-z0-9-]+)/i);
	const rawExtractedCategory = extractTableField(rawMd, '`category`');
	const categorySlug =
		catSlugMatch?.[1]?.trim() || generateSlug(rawExtractedCategory || 'Options & Greeks Mastery');
	const categoryRaw =
		rawExtractedCategory ||
		CANONICAL_CATEGORY_NAMES[categorySlug] ||
		'Options & Greeks Mastery';

	const tagsRaw = extractTableField(rawMd, '`tags`') || '[]';
	let tagSlugs: string[] = [];
	try {
		const parsed = JSON.parse(tagsRaw);
		if (Array.isArray(parsed)) {
			tagSlugs = parsed.map((t) => String(t).trim()).filter(Boolean);
		}
	} catch {
		tagSlugs = [];
	}

	const schemaTypeRaw = extractTableField(rawMd, '`schemaType`');
	const schemaType: ParsedMarkdownPost['schemaType'] =
		schemaTypeRaw === 'Article' || schemaTypeRaw === 'NewsArticle' || schemaTypeRaw === 'HowTo'
			? schemaTypeRaw
			: 'BlogPosting';
	const isPillar = /isPillar:\s*true/i.test(rawMd);

	const images = parseSection2Images(rawMd);
	const coverSpec = images.find((img) => img.isCover);

	const coverSection = rawMd.split('### 2.2')[0] ?? rawMd;
	const coverImage = coverSpec?.src || extractBulletCodeField(coverSection, '`src`');
	const coverImageAlt = coverSpec?.alt || extractBulletCodeField(coverSection, '`alt_text`');
	const coverImageTitle = coverSpec?.title || extractBulletCodeField(coverSection, '`title`');
	const coverImageCaption = coverSpec?.caption || extractBulletCodeField(coverSection, '`caption`');
	const coverImageDescription =
		coverSpec?.description || extractBulletPlainField(coverSection, '`image_description`');
	const coverImageWidth = coverSpec?.width ?? 1200;
	const coverImageHeight = coverSpec?.height ?? 630;

	const inlineBySrc = new Map<string, ParsedImageSpec>();
	for (const img of images) {
		if (!img.isCover) {
			inlineBySrc.set(img.src, img);
		}
	}

	const htmlBlockMatch = rawMd.match(/```html\s*([\s\S]*?)```/i);
	const rawHtmlWithFaq = htmlBlockMatch?.[1]?.trim() ?? '';
	const rawHtmlWithoutFaq = rawHtmlWithFaq
		.replace(/<section[^>]*class="article-faq"[^>]*>[\s\S]*?<\/section>/gi, '')
		.trim();

	// Enrich every in-body <img> tag with its `data-description`, `alt`, and `title` from Section 2
	const enrichedHtml = rawHtmlWithoutFaq.replace(/<img\b([^>]*)>/gi, (fullTag, attrs: string) => {
		const srcMatch = attrs.match(/\bsrc="([^"]+)"/i);
		const srcVal = srcMatch?.[1]?.trim() ?? '';
		const spec = inlineBySrc.get(srcVal);
		if (!spec) return fullTag;

		let updatedAttrs = attrs;
		if (!/\balt="/i.test(updatedAttrs) && spec.alt) {
			updatedAttrs += ` alt="${escapeHtmlAttr(spec.alt)}"`;
		}
		if (!/\btitle="/i.test(updatedAttrs) && spec.title) {
			updatedAttrs += ` title="${escapeHtmlAttr(spec.title)}"`;
		}
		if (!/\bdata-description="/i.test(updatedAttrs) && spec.description) {
			updatedAttrs += ` data-description="${escapeHtmlAttr(spec.description)}"`;
		}
		return `<img${updatedAttrs}>`;
	});

	const contentHtml = sanitizePostHtml(enrichedHtml);

	let faqItemsJson = '[]';
	const faqJsonMatch = rawMd.match(/##\s*5\.[\s\S]*?```json\s*([\s\S]*?)\s*```/i);
	if (faqJsonMatch?.[1]) {
		try {
			const parsedJson = JSON.parse(faqJsonMatch[1].trim());
			if (Array.isArray(parsedJson)) {
				faqItemsJson = JSON.stringify(parsedJson);
			} else if (parsedJson && Array.isArray(parsedJson['@graph'])) {
				const faqNode = parsedJson['@graph'].find(
					(node: { '@type'?: string; mainEntity?: unknown }) => node?.['@type'] === 'FAQPage'
				);
				if (faqNode && Array.isArray(faqNode.mainEntity)) {
					const items = faqNode.mainEntity
						.map((q: { name?: string; acceptedAnswer?: { text?: string } }) => ({
							question: String(q?.name ?? '').trim(),
							answer: String(q?.acceptedAnswer?.text ?? '').trim()
						}))
						.filter((item: { question: string; answer: string }) => item.question && item.answer);
					faqItemsJson = JSON.stringify(items);
				}
			}
		} catch {
			faqItemsJson = '[]';
		}
	}

	return {
		filename,
		title,
		slug,
		metaTitle,
		metaDescription,
		excerpt,
		focusKeyword,
		secondaryKeywords,
		categoryName: categoryRaw,
		categorySlug,
		tagSlugs,
		schemaType,
		isPillar,
		coverImage,
		coverImageAlt,
		coverImageTitle,
		coverImageCaption,
		coverImageDescription,
		coverImageWidth,
		coverImageHeight,
		images,
		contentHtml,
		faqItemsJson
	};
}

export async function importMarkdownPosts(options?: {
	dir?: string;
	publish?: boolean;
	dryRun?: boolean;
}): Promise<{ imported: number; updated: number; mediaPlaceholders: number }> {
	const dir = options?.dir ?? resolve(process.cwd(), 'content/blog-posts');
	const publish = Boolean(options?.publish);
	const dryRun = Boolean(options?.dryRun);
	const files = readdirSync(dir)
		.filter((f) => /^blog-post-\d+-.+\.md$/.test(f))
		.sort();

	if (dryRun) {
		let parsedCount = 0;
		let mediaCount = 0;
		for (const file of files) {
			const rawMd = readFileSync(join(dir, file), 'utf8');
			const parsed = parseMarkdownPostFile(file, rawMd);
			if (parsed.contentHtml) parsedCount += 1;
			mediaCount += parsed.images.length;
		}
		return { imported: parsedCount, updated: 0, mediaPlaceholders: mediaCount };
	}

	const db = await ensureDbReady();

	// Remove synthetic E2E-only password post from dev DB if present
	await db.delete(posts).where(eq(posts.slug, 'private-desk-quarterly-gamma-levels-briefing'));

	// Ensure default author Billy Ribeiro exists
	let [author] = await db.select().from(authors).where(eq(authors.slug, 'billy-ribeiro')).limit(1);
	if (!author) {
		[author] = await db
			.insert(authors)
			.values({
				name: 'Billy Ribeiro',
				slug: 'billy-ribeiro',
				jobTitle: 'Founder & Head Institutional Trader',
				credentials: 'Mentored by Mark "Goldfinger" McGoldrick',
				bio: 'Founder of Revolution Trading Pros, leading live options execution and institutional market structure research.',
				avatar: '/logo.png',
				isActive: true
			})
			.returning();
	}

	// Ensure 'blog-placeholders' folder exists in mediaFolders
	const [existingFolder] = await db
		.select()
		.from(mediaFolders)
		.where(eq(mediaFolders.name, 'blog-placeholders'))
		.limit(1);
	if (!existingFolder) {
		await db.insert(mediaFolders).values({ name: 'blog-placeholders' });
	}

	let imported = 0;
	let updated = 0;
	let mediaPlaceholders = 0;

	for (const file of files) {
		const rawMd = readFileSync(join(dir, file), 'utf8');
		const parsed = parseMarkdownPostFile(file, rawMd);
		if (!parsed.contentHtml) continue;

		// Upsert all image placeholders (cover + in-body) into the `media` library table
		for (const imgSpec of parsed.images) {
			const filePart = imgSpec.src.split('/').pop() || `${parsed.slug}.webp`;
			const mediaSlug = filePart.replace(/\.[a-z0-9]+$/i, '').slice(0, 240);
			const mediaId = `placeholder_${mediaSlug}`;

			const [existingMedia] = await db
				.select()
				.from(media)
				.where(eq(media.slug, mediaSlug))
				.limit(1);

			const mediaValues = {
				filename: filePart,
				slug: mediaSlug,
				mimeType: 'image/webp',
				sizeBytes: 0,
				width: imgSpec.width,
				height: imgSpec.height,
				title: imgSpec.title,
				altText: imgSpec.alt,
				description: imgSpec.description,
				caption: imgSpec.caption,
				folder: 'blog-placeholders',
				blobUrl: imgSpec.src,
				blobPathname: imgSpec.src.replace(/^\/+/, ''),
				updatedAt: new Date()
			};

			if (existingMedia) {
				await db.update(media).set(mediaValues).where(eq(media.id, existingMedia.id));
			} else {
				await db.insert(media).values({
					id: mediaId,
					...mediaValues
				});
			}
			mediaPlaceholders += 1;
		}

		// Upsert category
		let [cat] = await db
			.select()
			.from(categories)
			.where(eq(categories.slug, parsed.categorySlug))
			.limit(1);
		if (!cat) {
			[cat] = await db
				.insert(categories)
				.values({
					name: parsed.categoryName,
					slug: parsed.categorySlug,
					isActive: true
				})
				.returning();
		} else if (cat.name !== parsed.categoryName) {
			[cat] = await db
				.update(categories)
				.set({ name: parsed.categoryName, updatedAt: new Date() })
				.where(eq(categories.id, cat.id))
				.returning();
		}

		// Upsert tags
		const tagIds: number[] = [];
		for (const tSlug of parsed.tagSlugs) {
			let [tag] = await db.select().from(tags).where(eq(tags.slug, tSlug)).limit(1);
			if (!tag) {
				const tagName = tSlug
					.split('-')
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(' ');
				[tag] = await db.insert(tags).values({ name: tagName, slug: tSlug }).returning();
			}
			tagIds.push(tag.id);
		}

		const { html: normalizedHtml, toc } = normalizePostHeadings(parsed.contentHtml, parsed.title);
		const wordCount = countContentWords(normalizedHtml);
		const readingTime = Math.max(1, Math.ceil(wordCount / 200));
		const now = new Date();

		const [existing] = await db.select().from(posts).where(eq(posts.slug, parsed.slug)).limit(1);

		const shouldPublish = publish;
		const customFieldsObj: Record<string, string> = {};
		if (parsed.coverImageTitle) customFieldsObj.coverImageTitle = parsed.coverImageTitle;
		if (parsed.coverImageDescription) {
			customFieldsObj.coverImageDescription = parsed.coverImageDescription;
		}

		const values = {
			title: parsed.title,
			slug: parsed.slug,
			excerpt: parsed.excerpt,
			content: normalizedHtml,
			coverImage: parsed.coverImage || null,
			coverImageAlt: parsed.coverImageAlt || null,
			coverImageCaption: parsed.coverImageCaption || null,
			coverImageWidth: parsed.coverImageWidth,
			coverImageHeight: parsed.coverImageHeight,
			authorId: author.id,
			categoryId: cat.id,
			metaTitle: parsed.metaTitle,
			metaDescription: parsed.metaDescription,
			ogTitle: `${parsed.metaTitle} | Revolution Trading Pros`,
			ogDescription: parsed.metaDescription,
			ogImage: parsed.coverImage || null,
			twitterCardType: 'summary_large_image' as const,
			twitterTitle: parsed.metaTitle,
			twitterDescription: parsed.metaDescription,
			twitterImage: parsed.coverImage || null,
			focusKeyword: parsed.focusKeyword || null,
			secondaryKeywords: parsed.secondaryKeywords,
			schemaType: parsed.schemaType,
			isPillar: parsed.isPillar,
			wordCount,
			readingTime,
			tableOfContents: JSON.stringify(toc),
			faqItems: parsed.faqItemsJson,
			customFields: JSON.stringify(customFieldsObj),
			status: shouldPublish ? ('published' as const) : ('draft' as const),
			published: shouldPublish,
			publishedAt: shouldPublish ? (existing?.publishedAt ?? now) : null,
			updatedAt: now,
			contentUpdatedAt: now
		};

		const postId = await db.transaction(async (tx) => {
			const [saved] = existing
				? await tx.update(posts).set(values).where(eq(posts.id, existing.id)).returning()
				: await tx.insert(posts).values(values).returning();
			await persistPostSearchProjection(tx, saved);
			return saved.id;
		});
		if (existing) updated += 1;
		else imported += 1;

		await db.delete(postCategories).where(eq(postCategories.postId, postId));
		await db.insert(postCategories).values({ postId, categoryId: cat.id });

		await db.delete(postTags).where(eq(postTags.postId, postId));
		if (tagIds.length > 0) {
			await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
		}
	}

	return { imported, updated, mediaPlaceholders };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const publish = process.argv.includes('--publish');
	const dryRun = process.argv.includes('--dry-run');
	importMarkdownPosts({ publish, dryRun })
		.then((res) => {
			console.log(
				`[import-markdown-posts] Completed${dryRun ? ' (dry-run)' : ''}: ${res.imported} imported, ${res.updated} updated, ${res.mediaPlaceholders} image placeholders synced (status=${publish ? 'published' : 'draft'}).`
			);
			process.exit(0);
		})
		.catch((err) => {
			console.error('[import-markdown-posts] Failed:', err);
			process.exit(1);
		});
}
