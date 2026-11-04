import { sql } from 'drizzle-orm';
import {
	bigserial,
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
import { user } from './auth.schema.ts';

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
		check(
			'categories_no_self_parent_check',
			sql`${table.parentId} IS NULL OR ${table.parentId} <> ${table.id}`
		)
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
		check(
			'posts_published_mirror_check',
			sql`(${table.status} = 'published') = ${table.published}`
		),
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
	/** Absent = a width variant (key is the width, e.g. "800"). `'crop'` = a fixed-ratio SEO crop (key `crop-16x9`), never part of a srcset. */
	kind?: 'crop';
	aspect?: '16x9' | '4x3' | '1x1';
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
		userAgent: text('user_agent'),
		sessionId: text('session_id'),
		country: text('country'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('page_views_path_idx').on(table.path, table.createdAt),
		index('page_views_created_at_idx').on(table.createdAt),
		index('page_views_session_id_idx').on(table.sessionId),
		index('page_views_country_idx').on(table.country),
		index('page_views_referrer_idx').on(table.referrer)
	]
);

export const leads = pgTable(
	'leads',
	{
		id: serial('id').primaryKey(),
		email: varchar('email', { length: 320 }).notNull(),
		name: text('name'),
		source: text('source').default('lead_form'),
		sourcePage: text('source_page'),
		status: text('status').default('new'),
		ip: text('ip'),
		userAgent: text('user_agent'),
		resendMessageId: text('resend_message_id'),
		welcomeCompletedAt: timestamp('welcome_completed_at', { withTimezone: true }),
		emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		deletedAt: timestamp('deleted_at', { withTimezone: true })
	},
	(t) => [
		index('leads_resend_message_id_idx').on(t.resendMessageId),
		index('leads_created_at_idx').on(t.createdAt),
		index('leads_email_idx').on(t.email),
		uniqueIndex('leads_live_email_unique_idx')
			.on(sql`lower(${t.email})`)
			.where(sql`${t.deletedAt} IS NULL`),
		index('leads_status_idx').on(t.status),
		index('leads_alive_created_at_idx').on(t.deletedAt, t.createdAt)
	]
);

export const contactSubmissions = pgTable(
	'contact_submissions',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		phone: text('phone'),
		company: text('company'),
		message: text('message').notNull(),
		status: text('status').default('unread'),
		readAt: timestamp('read_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [
		index('contact_submissions_status_idx').on(t.status),
		index('contact_submissions_created_at_idx').on(t.createdAt)
	]
);

export const emailEvents = pgTable(
	'email_events',
	{
		id: serial('id').primaryKey(),
		leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }),
		messageId: text('message_id'),
		event: text('event').notNull(),
		metadata: text('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		svixId: text('svix_id')
	},
	(t) => [
		index('email_events_lead_id_idx').on(t.leadId),
		index('email_events_message_id_idx').on(t.messageId),
		index('email_events_event_idx').on(t.event),
		index('email_events_created_at_idx').on(t.createdAt),
		uniqueIndex('email_events_svix_id_uq').on(t.svixId)
	]
);

export const userJourneys = pgTable(
	'user_journeys',
	{
		id: serial('id').primaryKey(),
		sessionId: text('session_id').notNull(),
		leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }),
		firstVisitAt: timestamp('first_visit_at', { withTimezone: true }),
		leadCapturedAt: timestamp('lead_captured_at', { withTimezone: true }),
		emailDeliveredAt: timestamp('email_delivered_at', { withTimezone: true }),
		emailOpenedAt: timestamp('email_opened_at', { withTimezone: true }),
		emailClickedAt: timestamp('email_clicked_at', { withTimezone: true }),
		landingPage: text('landing_page'),
		referrer: text('referrer'),
		utmSource: text('utm_source'),
		utmMedium: text('utm_medium'),
		utmCampaign: text('utm_campaign'),
		utmTerm: text('utm_term'),
		utmContent: text('utm_content'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(t) => [
		index('user_journeys_session_id_idx').on(t.sessionId),
		index('user_journeys_lead_id_idx').on(t.leadId)
	]
);

export const series = pgTable('series', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description'),
	coverImage: text('cover_image'),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		email: varchar('email', { length: 320 }).notNull().unique(),
		passwordHash: text('password_hash'),
		role: text('role').notNull().default('subscriber'),
		avatarUrl: text('avatar_url'),
		bio: text('bio'),
		socialLinks: text('social_links'),
		isActive: boolean('is_active').notNull().default(true),
		inviteToken: text('invite_token'),
		inviteExpiresAt: timestamp('invite_expires_at', { withTimezone: true }),
		lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('users_invite_token_idx').on(t.inviteToken),
		index('users_last_active_at_idx').on(t.lastActiveAt)
	]
);

export const comments = pgTable(
	'comments',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		parentId: integer('parent_id'),
		authorName: text('author_name'),
		authorEmail: text('author_email'),
		authorUrl: text('author_url'),
		userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
		content: text('content').notNull(),
		contentHtml: text('content_html'),
		status: text('status').default('pending'),
		upvotes: integer('upvotes').default(0),
		downvotes: integer('downvotes').default(0),
		ip: text('ip'),
		userAgent: text('user_agent'),
		editedAt: timestamp('edited_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [
		index('comments_post_id_idx').on(t.postId),
		index('comments_parent_id_idx').on(t.parentId),
		index('comments_status_idx').on(t.status),
		index('comments_created_at_idx').on(t.createdAt)
	]
);

export const webhooks = pgTable(
	'webhooks',
	{
		id: serial('id').primaryKey(),
		url: text('url').notNull(),
		secret: text('secret'),
		events: text('events').notNull(),
		isActive: boolean('is_active').default(true),
		lastTriggered: timestamp('last_triggered', { withTimezone: true }),
		lastStatus: integer('last_status'),
		failCount: integer('fail_count').default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('webhooks_is_active_idx').on(t.isActive)]
);

export const editorialNotes = pgTable(
	'editorial_notes',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
		content: text('content').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('editorial_notes_post_id_idx').on(t.postId)]
);

export const siteSettings = pgTable('site_settings', {
	key: text('key').primaryKey(),
	value: text('value'),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const contentTemplates = pgTable(
	'content_templates',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description'),
		category: text('category'),
		blockStructure: text('block_structure').notNull(),
		thumbnail: text('thumbnail'),
		isActive: boolean('is_active').default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(t) => [index('content_templates_category_idx').on(t.category)]
);

export const adminSessions = pgTable(
	'admin_sessions',
	{
		tokenHash: text('token_hash').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		absoluteExpiresAt: timestamp('absolute_expires_at', { withTimezone: true }).notNull(),
		lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
		userAgent: text('user_agent'),
		ip: text('ip'),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('admin_sessions_expires_at_idx').on(t.expiresAt),
		index('admin_sessions_user_id_idx').on(t.userId),
		index('admin_sessions_absolute_expires_at_idx').on(t.absoluteExpiresAt)
	]
);

export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;

export const rateLimitBuckets = pgTable(
	'rate_limit_buckets',
	{
		key: varchar('key', { length: 191 }).primaryKey(),
		count: integer('count').notNull().default(0),
		resetAt: timestamp('reset_at', { withTimezone: true }).notNull()
	},
	(t) => [index('rate_limit_buckets_reset_at_idx').on(t.resetAt)]
);

export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		tokenHash: text('token_hash').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		email: text('email').notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('password_reset_tokens_user_id_idx').on(t.userId),
		index('password_reset_tokens_expires_at_idx').on(t.expiresAt)
	]
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const authEvents = pgTable(
	'auth_events',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
		eventType: text('event_type').notNull(),
		success: boolean('success').notNull(),
		ip: text('ip'),
		userAgent: text('user_agent'),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('auth_events_user_created_idx').on(t.userId, t.createdAt),
		index('auth_events_type_created_idx').on(t.eventType, t.createdAt)
	]
);

export type AuthEvent = typeof authEvents.$inferSelect;
export type NewAuthEvent = typeof authEvents.$inferInsert;

export type AuthEventType =
	| 'login_succeeded'
	| 'login_failed'
	| 'login_locked_out'
	| 'logout'
	| 'password_reset_requested'
	| 'password_reset_completed'
	| 'password_reset_rejected'
	| 'sessions_revoked'
	| 'admin_password_rotated';

export const adminNotifications = pgTable(
	'admin_notifications',
	{
		id: serial('id').primaryKey(),
		type: text('type').notNull(),
		severity: text('severity').notNull().default('info'),
		title: text('title').notNull(),
		body: text('body'),
		targetHref: text('target_href').notNull(),
		sourceTable: text('source_table'),
		sourceId: integer('source_id'),
		dedupeKey: text('dedupe_key').notNull(),
		metadata: jsonb('metadata').$type<Record<string, unknown>>(),
		occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
		readAt: timestamp('read_at', { withTimezone: true }),
		clickedAt: timestamp('clicked_at', { withTimezone: true }),
		archivedAt: timestamp('archived_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		uniqueIndex('admin_notifications_dedupe_key_idx').on(t.dedupeKey),
		index('admin_notifications_read_occurred_idx').on(t.readAt, t.occurredAt),
		index('admin_notifications_type_occurred_idx').on(t.type, t.occurredAt),
		index('admin_notifications_source_idx').on(t.sourceTable, t.sourceId),
		index('admin_notifications_active_occurred_idx')
			.on(t.occurredAt)
			.where(sql`${t.archivedAt} IS NULL`)
	]
);

export const clickEvents = pgTable(
	'click_events',
	{
		id: bigserial('id', { mode: 'bigint' }).primaryKey(),
		sourcePath: text('source_path').notNull(),
		targetPath: text('target_path').notNull(),
		targetHost: text('target_host'),
		linkText: text('link_text'),
		sessionId: text('session_id'),
		userAgent: text('user_agent'),
		country: text('country'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('click_events_created_at_idx').on(t.createdAt),
		index('click_events_target_path_idx').on(t.targetPath),
		index('click_events_source_path_idx').on(t.sourcePath),
		index('click_events_session_id_idx').on(t.sessionId)
	]
);

export const clickEventsHourly = pgTable(
	'click_events_hourly',
	{
		hourBucket: timestamp('hour_bucket', { withTimezone: true }).notNull(),
		sourcePath: text('source_path').notNull(),
		targetPath: text('target_path').notNull(),
		clicks: integer('clicks').notNull().default(0),
		uniques: integer('uniques').notNull().default(0)
	},
	(t) => [
		primaryKey({ columns: [t.hourBucket, t.sourcePath, t.targetPath] }),
		index('click_events_hourly_bucket_idx').on(t.hourBucket)
	]
);

export const notificationPreferences = pgTable(
	'notification_preferences',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		enabled: boolean('enabled').notNull().default(true),
		digestFrequency: text('digest_frequency').notNull().default('immediate'),
		quietHoursStart: text('quiet_hours_start'),
		quietHoursEnd: text('quiet_hours_end'),
		tz: text('tz').notNull().default('UTC'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [uniqueIndex('notification_prefs_user_type_uq').on(t.userId, t.type)]
);

export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;

export type ClickEventHourly = typeof clickEventsHourly.$inferSelect;
export type NewClickEventHourly = typeof clickEventsHourly.$inferInsert;

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;

export const integrationConnections = pgTable(
	'integration_connections',
	{
		id: serial('id').primaryKey(),
		provider: text('provider').notNull(),
		displayName: text('display_name').notNull(),
		enabled: boolean('enabled').notNull().default(false),
		status: text('status').notNull().default('not_configured'),
		config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
		secretCiphertext: text('secret_ciphertext'),
		secretLastFour: text('secret_last_four'),
		secretUpdatedAt: timestamp('secret_updated_at', { withTimezone: true }),
		lastTestStatus: text('last_test_status'),
		lastTestAt: timestamp('last_test_at', { withTimezone: true }),
		lastTestError: text('last_test_error'),
		lastTestEvidence: jsonb('last_test_evidence').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		uniqueIndex('integration_connections_provider_idx').on(t.provider),
		index('integration_connections_status_idx').on(t.status),
		index('integration_connections_enabled_idx').on(t.enabled)
	]
);

export const integrationTestRuns = pgTable(
	'integration_test_runs',
	{
		id: serial('id').primaryKey(),
		connectionId: integer('connection_id').references(() => integrationConnections.id, {
			onDelete: 'set null'
		}),
		provider: text('provider').notNull(),
		status: text('status').notNull(),
		error: text('error'),
		evidence: jsonb('evidence').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('integration_test_runs_connection_created_idx').on(t.connectionId, t.createdAt),
		index('integration_test_runs_provider_created_idx').on(t.provider, t.createdAt)
	]
);

export const emailSequences = pgTable(
	'email_sequences',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		triggerSource: text('trigger_source').notNull().default('lead_magnet'),
		isActive: boolean('is_active').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('email_sequences_trigger_active_idx').on(t.triggerSource, t.isActive)]
);

export const emailSequenceSteps = pgTable(
	'email_sequence_steps',
	{
		id: serial('id').primaryKey(),
		sequenceId: integer('sequence_id')
			.notNull()
			.references(() => emailSequences.id, { onDelete: 'cascade' }),
		stepIndex: integer('step_index').notNull(),
		delayDays: integer('delay_days').notNull().default(7),
		subject: text('subject').notNull(),
		bodyHtml: text('body_html').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [uniqueIndex('email_sequence_steps_seq_step_idx').on(t.sequenceId, t.stepIndex)]
);

export const emailEnrollments = pgTable(
	'email_enrollments',
	{
		id: serial('id').primaryKey(),
		leadId: integer('lead_id')
			.notNull()
			.references(() => leads.id, { onDelete: 'cascade' }),
		sequenceId: integer('sequence_id')
			.notNull()
			.references(() => emailSequences.id, { onDelete: 'cascade' }),
		currentStep: integer('current_step').notNull().default(0),
		status: text('status').notNull().default('active'),
		nextSendAt: timestamp('next_send_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('email_enrollments_status_next_send_idx').on(t.status, t.nextSendAt),
		index('email_enrollments_lead_id_idx').on(t.leadId),
		uniqueIndex('email_enrollments_lead_seq_idx').on(t.leadId, t.sequenceId)
	]
);

export const emailSends = pgTable(
	'email_sends',
	{
		id: serial('id').primaryKey(),
		enrollmentId: integer('enrollment_id')
			.notNull()
			.references(() => emailEnrollments.id, { onDelete: 'cascade' }),
		stepIndex: integer('step_index').notNull(),
		resendMessageId: text('resend_message_id'),
		sentAt: timestamp('sent_at', { withTimezone: true }),
		status: text('status').notNull().default('pending'),
		payload: jsonb('payload').$type<{
			from: string;
			to: string;
			replyTo?: string;
			subject: string;
			html: string;
			headers: Record<string, string>;
		}>(),
		firstAttemptAt: timestamp('first_attempt_at', { withTimezone: true }),
		leaseToken: text('lease_token'),
		leaseUntil: timestamp('lease_until', { withTimezone: true }),
		attempts: integer('attempts').notNull().default(0),
		lastError: text('last_error')
	},
	(t) => [
		uniqueIndex('email_sends_enrollment_step_idx').on(t.enrollmentId, t.stepIndex),
		index('email_sends_resend_message_id_idx').on(t.resendMessageId)
	]
);

export const emailSuppressions = pgTable(
	'email_suppressions',
	{
		id: serial('id').primaryKey(),
		email: varchar('email', { length: 320 }).notNull(),
		reason: text('reason').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [uniqueIndex('email_suppressions_email_idx').on(t.email)]
);

export const scheduledCalls = pgTable(
	'scheduled_calls',
	{
		id: serial('id').primaryKey(),
		name: text('name'),
		email: varchar('email', { length: 320 }).notNull(),
		scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
		endAt: timestamp('end_at', { withTimezone: true }),
		status: text('status').notNull().default('scheduled'),
		calendlyEventUri: text('calendly_event_uri').notNull(),
		inviteeUri: text('invitee_uri'),
		payloadJson: jsonb('payload_json').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		uniqueIndex('scheduled_calls_event_uri_idx').on(t.calendlyEventUri),
		index('scheduled_calls_scheduled_at_idx').on(t.scheduledAt),
		index('scheduled_calls_email_idx').on(t.email),
		index('scheduled_calls_status_idx').on(t.status)
	]
);

export const campaigns = pgTable(
	'campaigns',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		type: text('type').notNull().default('popup'),
		status: text('status').notNull().default('draft'),
		targetingJson: jsonb('targeting_json').$type<Record<string, unknown>>(),
		contentJson: jsonb('content_json').$type<Record<string, unknown>>(),
		startsAt: timestamp('starts_at', { withTimezone: true }),
		endsAt: timestamp('ends_at', { withTimezone: true }),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('campaigns_status_alive_idx').on(t.status, t.deletedAt),
		index('campaigns_alive_created_idx').on(t.deletedAt, t.createdAt)
	]
);

export const campaignVariants = pgTable(
	'campaign_variants',
	{
		id: serial('id').primaryKey(),
		campaignId: integer('campaign_id')
			.notNull()
			.references(() => campaigns.id, { onDelete: 'cascade' }),
		key: text('key').notNull(),
		weight: integer('weight').notNull().default(50),
		contentJson: jsonb('content_json').$type<Record<string, unknown>>()
	},
	(t) => [uniqueIndex('campaign_variants_campaign_key_idx').on(t.campaignId, t.key)]
);

export const campaignEvents = pgTable(
	'campaign_events',
	{
		id: bigserial('id', { mode: 'bigint' }).primaryKey(),
		campaignId: integer('campaign_id')
			.notNull()
			.references(() => campaigns.id, { onDelete: 'cascade' }),
		variantKey: text('variant_key'),
		type: text('type').notNull(),
		sessionId: text('session_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('campaign_events_campaign_type_created_idx').on(t.campaignId, t.type, t.createdAt)]
);

export const consentRecords = pgTable(
	'consent_records',
	{
		id: bigserial('id', { mode: 'bigint' }).primaryKey(),
		anonId: text('anon_id').notNull(),
		categories: jsonb('categories').$type<Record<string, boolean>>().notNull(),
		policyVersion: integer('policy_version').notNull().default(1),
		ip: text('ip'),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		index('consent_records_anon_id_idx').on(t.anonId),
		index('consent_records_created_at_idx').on(t.createdAt)
	]
);

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
export type RelatedPost = typeof relatedPosts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;
export type UserJourney = typeof userJourneys.$inferSelect;
export type NewUserJourney = typeof userJourneys.$inferInsert;
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Revision = typeof revisions.$inferSelect;
export type NewRevision = typeof revisions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Redirect = typeof redirects.$inferSelect;
export type NewRedirect = typeof redirects.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type NewAdminNotification = typeof adminNotifications.$inferInsert;
export type IntegrationConnection = typeof integrationConnections.$inferSelect;
export type NewIntegrationConnection = typeof integrationConnections.$inferInsert;
export type IntegrationTestRun = typeof integrationTestRuns.$inferSelect;
export type NewIntegrationTestRun = typeof integrationTestRuns.$inferInsert;
export type EditorialNote = typeof editorialNotes.$inferSelect;
export type NewEditorialNote = typeof editorialNotes.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type NewContentTemplate = typeof contentTemplates.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type EmailSequence = typeof emailSequences.$inferSelect;
export type NewEmailSequence = typeof emailSequences.$inferInsert;
export type EmailSequenceStep = typeof emailSequenceSteps.$inferSelect;
export type NewEmailSequenceStep = typeof emailSequenceSteps.$inferInsert;
export type EmailEnrollment = typeof emailEnrollments.$inferSelect;
export type NewEmailEnrollment = typeof emailEnrollments.$inferInsert;
export type EmailSend = typeof emailSends.$inferSelect;
export type NewEmailSend = typeof emailSends.$inferInsert;
export type EmailSuppression = typeof emailSuppressions.$inferSelect;
export type NewEmailSuppression = typeof emailSuppressions.$inferInsert;
export type ScheduledCall = typeof scheduledCalls.$inferSelect;
export type NewScheduledCall = typeof scheduledCalls.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type CampaignVariant = typeof campaignVariants.$inferSelect;
export type NewCampaignVariant = typeof campaignVariants.$inferInsert;
export type CampaignEvent = typeof campaignEvents.$inferSelect;
export type NewCampaignEvent = typeof campaignEvents.$inferInsert;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type NewConsentRecord = typeof consentRecords.$inferInsert;

export * from './auth.schema.ts';

export * from './waitlist-schema.ts';
