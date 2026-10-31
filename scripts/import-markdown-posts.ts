// Idempotent importer for the 40 production Markdown blog posts in `content/blog-posts/blog-post-*.md`.
// Run with: `pnpm db:import-posts` (imports as 'draft' by default; pass `--publish` to import as 'published').

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { sanitizePostHtml } from '../src/lib/sanitize-post-html.ts';
import { ensureDbReady } from '../src/lib/server/db/index.ts';
import {
	authors,
	categories,
	postCategories,
	posts,
	postTags,
	tags
} from '../src/lib/server/db/schema.ts';
import { generateSlug } from '../src/lib/shared/seo/slug.ts';
import { countContentWords, normalizePostHeadings } from '../src/lib/shared/seo/toc.ts';

interface ParsedMarkdownPost {
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
	coverImageCaption: string;
	contentHtml: string;
	faqItemsJson: string;
}

function extractTableField(md: string, labelPattern: string): string {
	const regex = new RegExp(`\\|\\s*[^|]*${labelPattern}[^|]*\\|\\s*\`([^\`]+)\`\\s*\\|`, 'i');
	const match = md.match(regex);
	return match?.[1]?.trim() ?? '';
}

function extractBulletCodeField(section: string, labelPattern: string): string {
	const regex = new RegExp(`-\\s*\\*\\*[^*]*${labelPattern}[^*]*\\*\\*\\s*\`([^\`]+)\``, 'i');
	const match = section.match(regex);
	return match?.[1]?.trim() ?? '';
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

	const categoryRaw = extractTableField(rawMd, '`category`') || 'Options & Greeks Mastery';
	const catSlugMatch = rawMd.match(/\|[^|]*`category`[^|]*\|[^|]*slug:\s*([a-z0-9-]+)/i);
	const categorySlug = catSlugMatch?.[1]?.trim() || generateSlug(categoryRaw);

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

	const coverSection = rawMd.split('### 2.2')[0] ?? rawMd;
	const coverImage = extractBulletCodeField(coverSection, '`src`:');
	const coverImageAlt = extractBulletCodeField(coverSection, '`alt_text`');
	const coverImageCaption = extractBulletCodeField(coverSection, '`caption`');

	const htmlBlockMatch = rawMd.match(/```html\s*([\s\S]*?)```/i);
	const rawHtml = htmlBlockMatch?.[1]?.trim() ?? '';
	const contentHtml = sanitizePostHtml(rawHtml);

	const faqSectionMatch = rawMd.match(/##\s*5\.[\s\S]*?```json\s*(\[[\s\S]*?\])\s*```/i);
	const faqItemsJson = faqSectionMatch?.[1]?.trim() ?? '[]';

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
		coverImageCaption,
		contentHtml,
		faqItemsJson
	};
}

export async function importMarkdownPosts(options?: {
	dir?: string;
	publish?: boolean;
	dryRun?: boolean;
}): Promise<{ imported: number; updated: number }> {
	const dir = options?.dir ?? resolve(process.cwd(), 'content/blog-posts');
	const publish = Boolean(options?.publish);
	const dryRun = Boolean(options?.dryRun);
	const files = readdirSync(dir)
		.filter((f) => /^blog-post-\d+-.+\.md$/.test(f))
		.sort();

	if (dryRun) {
		let parsedCount = 0;
		for (const file of files) {
			const rawMd = readFileSync(join(dir, file), 'utf8');
			const parsed = parseMarkdownPostFile(file, rawMd);
			if (parsed.contentHtml) parsedCount += 1;
		}
		return { imported: parsedCount, updated: 0 };
	}

	const db = await ensureDbReady();

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

	let imported = 0;
	let updated = 0;

	for (const file of files) {
		const rawMd = readFileSync(join(dir, file), 'utf8');
		const parsed = parseMarkdownPostFile(file, rawMd);
		if (!parsed.contentHtml) continue;

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

		const shouldPublish = publish || existing?.status === 'published';
		const values = {
			title: parsed.title,
			slug: parsed.slug,
			excerpt: parsed.excerpt,
			content: normalizedHtml,
			coverImage: parsed.coverImage || null,
			coverImageAlt: parsed.coverImageAlt || null,
			coverImageCaption: parsed.coverImageCaption || null,
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
			status: shouldPublish ? ('published' as const) : ('draft' as const),
			published: shouldPublish,
			publishedAt: shouldPublish ? (existing?.publishedAt ?? now) : null,
			updatedAt: now,
			contentUpdatedAt: now
		};

		let postId: number;
		if (existing) {
			await db.update(posts).set(values).where(eq(posts.id, existing.id));
			postId = existing.id;
			updated += 1;
		} else {
			const [created] = await db.insert(posts).values(values).returning();
			postId = created.id;
			imported += 1;
		}

		await db.delete(postCategories).where(eq(postCategories.postId, postId));
		await db.insert(postCategories).values({ postId, categoryId: cat.id });

		await db.delete(postTags).where(eq(postTags.postId, postId));
		if (tagIds.length > 0) {
			await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
		}
	}

	return { imported, updated };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const publish = process.argv.includes('--publish');
	const dryRun = process.argv.includes('--dry-run');
	importMarkdownPosts({ publish, dryRun })
		.then((res) => {
			console.log(
				`[import-markdown-posts] Completed${dryRun ? ' (dry-run)' : ''}: ${res.imported} imported, ${res.updated} updated (status=${publish ? 'published' : 'draft'}).`
			);
			process.exit(0);
		})
		.catch((err) => {
			console.error('[import-markdown-posts] Failed:', err);
			process.exit(1);
		});
}
