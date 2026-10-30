import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	foreignKey,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const authors = pgTable(
	'authors',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		email: text('email'),
		bio: text('bio'),
		shortBio: text('short_bio'),
		jobTitle: text('job_title'),
		company: text('company'),
		credentials: text('credentials'),
		expertise: text('expertise'),
		yearsExperience: integer('years_experience'),
		linkedin: text('linkedin'),
		twitter: text('twitter'),
		website: text('website'),
		avatar: text('avatar'),
		avatarAlt: text('avatar_alt'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('authors_is_active_idx').on(table.isActive)]
);

export const categories = pgTable(
	'categories',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		description: text('description'),
		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		pillarContent: text('pillar_content'),
		icon: text('icon'),
		color: text('color').default('#4b5f1d'),
		image: text('image'),
		imageAlt: text('image_alt'),
		parentId: integer('parent_id'),
		sortOrder: integer('sort_order').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('categories_parent_id_idx').on(table.parentId),
		foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: 'categories_parent_id_fkey'
		}).onDelete('set null'),
		check('categories_no_self_parent_check', sql`${table.parentId} IS NULL OR ${table.parentId} <> ${table.id}`)
	]
);

export const tags = pgTable('tags', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const posts = pgTable(
	'posts',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		excerpt: text('excerpt'),
		content: text('content').notNull(),
		authorId: integer('author_id').references(() => authors.id, { onDelete: 'set null' }),
		coAuthorIds: text('co_author_ids'),
		categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),

		coverImage: text('cover_image'),
		coverImageAlt: text('cover_image_alt'),
		coverImageCaption: text('cover_image_caption'),
		coverImageWidth: integer('cover_image_width'),
		coverImageHeight: integer('cover_image_height'),

		metaTitle: text('meta_title'),
		metaDescription: text('meta_description'),
		ogTitle: text('og_title'),
		ogDescription: text('og_description'),
		ogImage: text('og_image'),
		canonicalUrl: text('canonical_url'),
		focusKeyword: text('focus_keyword'),
		secondaryKeywords: text('secondary_keywords'),
		robotsNoindex: boolean('robots_noindex').notNull().default(false),
		robotsNofollow: boolean('robots_nofollow').notNull().default(false),
		schemaType: varchar('schema_type', { length: 64 }).notNull().default('BlogPosting'),

		twitterCardType: varchar('twitter_card_type', { length: 64 })
			.notNull()
			.default('summary_large_image'),
		twitterTitle: text('twitter_title'),
		twitterDescription: text('twitter_description'),
		twitterImage: text('twitter_image'),

		readingTime: integer('reading_time').notNull().default(0),
		wordCount: integer('word_count').notNull().default(0),
		tableOfContents: text('table_of_contents'),
		faqItems: text('faq_items'),

		status: varchar('status', { length: 32 }).notNull().default('draft'),
		visibility: varchar('visibility', { length: 32 }).notNull().default('public'),
		published: boolean('published').notNull().default(false),
		password: text('password'),
		template: varchar('template', { length: 64 }).notNull().default('default'),
		postFormat: varchar('post_format', { length: 64 }).notNull().default('standard'),
		customFields: text('custom_fields'),

		featured: boolean('featured').notNull().default(false),
		isPillar: boolean('is_pillar').notNull().default(false),
		isSticky: boolean('is_sticky').notNull().default(false),
		commentsEnabled: boolean('comments_enabled').notNull().default(true),
		pingbacksEnabled: boolean('pingbacks_enabled').notNull().default(false),

		language: varchar('language', { length: 16 }).notNull().default('en'),
		translationOfId: integer('translation_of_id'),
		seriesId: integer('series_id'),
		seriesOrder: integer('series_order'),

		isFixture: boolean('is_fixture').notNull().default(false),
		searchNotifyPending: boolean('search_notify_pending').notNull().default(false),

		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		contentUpdatedAt: timestamp('content_updated_at', { withTimezone: true }),
		publishedAt: timestamp('published_at', { withTimezone: true }),
		scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
		expiresAt: timestamp('expires_at', { withTimezone: true }),
		deletedAt: timestamp('deleted_at', { withTimezone: true })
	},
	(table) => [
		index('posts_deleted_status_idx').on(table.deletedAt, table.status),
		index('posts_published_at_idx').on(table.publishedAt),
		index('posts_scheduled_at_idx').on(table.scheduledAt),
		index('posts_expires_at_idx').on(table.expiresAt),
		index('posts_author_id_idx').on(table.authorId),
		index('posts_category_id_idx').on(table.categoryId),
		index('posts_is_fixture_partial_idx')
			.on(table.isFixture)
			.where(sql`${table.isFixture} = true`),
		uniqueIndex('posts_single_live_featured_idx')
			.on(table.featured)
			.where(
				sql`${table.featured} = true AND ${table.status} = 'published' AND ${table.deletedAt} IS NULL`
			),
		check(
			'posts_status_check',
			sql`${table.status} IN ('draft', 'review', 'scheduled', 'published', 'archived')`
		),
		check(
			'posts_visibility_check',
			sql`${table.visibility} IN ('public', 'members', 'password_protected')`
		),
		check('posts_published_mirror_check', sql`(${table.status} = 'published') = ${table.published}`),
		check(
			'posts_schedule_expiry_check',
			sql`${table.expiresAt} IS NULL OR ${table.scheduledAt} IS NULL OR ${table.expiresAt} > ${table.scheduledAt}`
		)
	]
);

export const postTags = pgTable(
	'post_tags',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.tagId] }),
		index('post_tags_tag_id_idx').on(table.tagId)
	]
);

export const postCategories = pgTable(
	'post_categories',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		categoryId: integer('category_id')
			.notNull()
			.references(() => categories.id, { onDelete: 'cascade' })
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.categoryId] }),
		index('post_categories_category_id_idx').on(table.categoryId)
	]
);

export const relatedPosts = pgTable(
	'related_posts',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		relatedPostId: integer('related_post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.relatedPostId] }),
		check('related_posts_no_self_check', sql`${table.postId} <> ${table.relatedPostId}`)
	]
);

export const revisions = pgTable(
	'revisions',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		contentSnapshot: text('content_snapshot').notNull(),
		titleSnapshot: text('title_snapshot').notNull(),
		excerptSnapshot: text('excerpt_snapshot'),
		wordCount: integer('word_count').notNull().default(0),
		wordCountDelta: integer('word_count_delta').notNull().default(0),
		changeType: varchar('change_type', { length: 32 }).notNull().default('manual'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('revisions_post_created_idx').on(table.postId, table.createdAt),
		check(
			'revisions_change_type_check',
			sql`${table.changeType} IN ('manual', 'publish', 'autosave', 'restore')`
		)
	]
);

export const redirects = pgTable(
	'redirects',
	{
		id: serial('id').primaryKey(),
		sourcePath: text('source_path').notNull(),
		targetPath: text('target_path').notNull(),
		type: integer('type').notNull().default(301),
		hits: integer('hits').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('redirects_active_source_path_uidx')
			.on(table.sourcePath)
			.where(sql`${table.isActive} = true`)
	]
);

export interface MediaVariantRecord {
	width: number;
	height: number;
	url: string;
	pathname: string;
}

export const media = pgTable(
	'media',
	{
		id: text('id').primaryKey(),
		filename: text('filename').notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		mimeType: text('mime_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		width: integer('width'),
		height: integer('height'),
		title: text('title').notNull().default(''),
		altText: text('alt_text').notNull().default(''),
		description: text('description').notNull().default(''),
		caption: text('caption').notNull().default(''),
		folder: text('folder').notNull().default(''),
		blobUrl: text('blob_url').notNull(),
		blobPathname: text('blob_pathname').notNull(),
		variantsJson: jsonb('variants_json').$type<Record<string, MediaVariantRecord>>(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('media_deleted_created_idx').on(table.deletedAt, table.createdAt),
		index('media_folder_idx').on(table.folder),
		index('media_mime_type_idx').on(table.mimeType)
	]
);

export const mediaFolders = pgTable('media_folders', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const auditLog = pgTable(
	'audit_log',
	{
		id: serial('id').primaryKey(),
		at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
		actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
		action: text('action').notNull(),
		entityType: text('entity_type').notNull(),
		entityId: text('entity_id').notNull(),
		summary: jsonb('summary').$type<Record<string, unknown>>().notNull().default({})
	},
	(table) => [index('audit_log_entity_idx').on(table.entityType, table.entityId, table.at)]
);

export const rateLimits = pgTable('rate_limits', {
	key: text('key').primaryKey(),
	count: integer('count').notNull().default(1),
	resetAt: timestamp('reset_at', { withTimezone: true }).notNull()
});

export const pageViews = pgTable(
	'page_views',
	{
		id: serial('id').primaryKey(),
		path: text('path').notNull(),
		referrer: text('referrer'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('page_views_path_idx').on(table.path, table.createdAt)]
);

export * from './auth.schema';
