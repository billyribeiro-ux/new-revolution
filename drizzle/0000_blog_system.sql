-- Forward-only, idempotent migration for the blog authoring and publishing system.
-- Every timestamp column uses TIMESTAMPTZ.

CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL;

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("user_id");

CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("user_id");

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE IF NOT EXISTS "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"email" text,
	"bio" text,
	"short_bio" text,
	"job_title" text,
	"company" text,
	"credentials" text,
	"expertise" text,
	"years_experience" integer,
	"linkedin" text,
	"twitter" text,
	"website" text,
	"avatar" text,
	"avatar_alt" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "authors_is_active_idx" ON "authors" ("is_active");

CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"meta_title" text,
	"meta_description" text,
	"pillar_content" text,
	"icon" text,
	"color" text DEFAULT '#4b5f1d',
	"image" text,
	"image_alt" text,
	"parent_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "categories_no_self_parent_check" CHECK ("parent_id" IS NULL OR "parent_id" <> "id")
);
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories" ("parent_id");

CREATE TABLE IF NOT EXISTS "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"excerpt" text,
	"content" text NOT NULL,
	"author_id" integer REFERENCES "authors"("id") ON DELETE SET NULL,
	"co_author_ids" text,
	"category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
	"cover_image" text,
	"cover_image_alt" text,
	"cover_image_caption" text,
	"cover_image_width" integer,
	"cover_image_height" integer,
	"meta_title" text,
	"meta_description" text,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"canonical_url" text,
	"focus_keyword" text,
	"secondary_keywords" text,
	"robots_noindex" boolean DEFAULT false NOT NULL,
	"robots_nofollow" boolean DEFAULT false NOT NULL,
	"schema_type" varchar(64) DEFAULT 'BlogPosting' NOT NULL,
	"twitter_card_type" varchar(64) DEFAULT 'summary_large_image' NOT NULL,
	"twitter_title" text,
	"twitter_description" text,
	"twitter_image" text,
	"reading_time" integer DEFAULT 0 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"table_of_contents" text,
	"faq_items" text,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"visibility" varchar(32) DEFAULT 'public' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"password" text,
	"template" varchar(64) DEFAULT 'default' NOT NULL,
	"post_format" varchar(64) DEFAULT 'standard' NOT NULL,
	"custom_fields" text,
	"featured" boolean DEFAULT false NOT NULL,
	"is_pillar" boolean DEFAULT false NOT NULL,
	"is_sticky" boolean DEFAULT false NOT NULL,
	"comments_enabled" boolean DEFAULT true NOT NULL,
	"pingbacks_enabled" boolean DEFAULT false NOT NULL,
	"language" varchar(16) DEFAULT 'en' NOT NULL,
	"translation_of_id" integer,
	"series_id" integer,
	"series_order" integer,
	"is_fixture" boolean DEFAULT false NOT NULL,
	"search_notify_pending" boolean DEFAULT false NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL,
	"content_updated_at" timestamptz,
	"published_at" timestamptz,
	"scheduled_at" timestamptz,
	"expires_at" timestamptz,
	"deleted_at" timestamptz,
	CONSTRAINT "posts_status_check" CHECK ("status" IN ('draft', 'review', 'scheduled', 'published', 'archived')),
	CONSTRAINT "posts_visibility_check" CHECK ("visibility" IN ('public', 'members', 'password_protected')),
	CONSTRAINT "posts_published_mirror_check" CHECK (("status" = 'published') = "published"),
	CONSTRAINT "posts_schedule_expiry_check" CHECK ("expires_at" IS NULL OR "scheduled_at" IS NULL OR "expires_at" > "scheduled_at")
);

CREATE INDEX IF NOT EXISTS "posts_deleted_status_idx" ON "posts" ("deleted_at", "status");
CREATE INDEX IF NOT EXISTS "posts_published_at_idx" ON "posts" ("published_at");
CREATE INDEX IF NOT EXISTS "posts_scheduled_at_idx" ON "posts" ("scheduled_at");
CREATE INDEX IF NOT EXISTS "posts_expires_at_idx" ON "posts" ("expires_at");
CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts" ("author_id");
CREATE INDEX IF NOT EXISTS "posts_category_id_idx" ON "posts" ("category_id");
CREATE INDEX IF NOT EXISTS "posts_is_fixture_partial_idx" ON "posts" ("is_fixture") WHERE "is_fixture" = true;
CREATE UNIQUE INDEX IF NOT EXISTS "posts_single_live_featured_idx" ON "posts" ("featured") WHERE "featured" = true AND "status" = 'published' AND "deleted_at" IS NULL;

CREATE TABLE IF NOT EXISTS "post_tags" (
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"tag_id" integer NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
	PRIMARY KEY ("post_id", "tag_id")
);
CREATE INDEX IF NOT EXISTS "post_tags_tag_id_idx" ON "post_tags" ("tag_id");

CREATE TABLE IF NOT EXISTS "post_categories" (
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"category_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
	PRIMARY KEY ("post_id", "category_id")
);
CREATE INDEX IF NOT EXISTS "post_categories_category_id_idx" ON "post_categories" ("category_id");

CREATE TABLE IF NOT EXISTS "related_posts" (
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"related_post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"sort_order" integer DEFAULT 0 NOT NULL,
	PRIMARY KEY ("post_id", "related_post_id"),
	CONSTRAINT "related_posts_no_self_check" CHECK ("post_id" <> "related_post_id")
);

CREATE TABLE IF NOT EXISTS "revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
	"content_snapshot" text NOT NULL,
	"title_snapshot" text NOT NULL,
	"excerpt_snapshot" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"word_count_delta" integer DEFAULT 0 NOT NULL,
	"change_type" varchar(32) DEFAULT 'manual' NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "revisions_change_type_check" CHECK ("change_type" IN ('manual', 'publish', 'autosave', 'restore'))
);
CREATE INDEX IF NOT EXISTS "revisions_post_created_idx" ON "revisions" ("post_id", "created_at");

CREATE TABLE IF NOT EXISTS "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_path" text NOT NULL,
	"target_path" text NOT NULL,
	"type" integer DEFAULT 301 NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "redirects_active_source_path_uidx" ON "redirects" ("source_path") WHERE "is_active" = true;

CREATE TABLE IF NOT EXISTS "media" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"title" text DEFAULT '' NOT NULL,
	"alt_text" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"folder" text DEFAULT '' NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"variants_json" jsonb,
	"deleted_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "media_deleted_created_idx" ON "media" ("deleted_at", "created_at");
CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media" ("folder");
CREATE INDEX IF NOT EXISTS "media_mime_type_idx" ON "media" ("mime_type");

CREATE TABLE IF NOT EXISTS "media_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"at" timestamptz DEFAULT now() NOT NULL,
	"actor_user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "audit_log_entity_idx" ON "audit_log" ("entity_type", "entity_id", "at");

CREATE TABLE IF NOT EXISTS "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"referrer" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path", "created_at");
