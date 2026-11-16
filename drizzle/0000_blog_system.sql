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
	"user_agent" text,
	"session_id" text,
	"country" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "session_id" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "country" text;
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path", "created_at");
CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views" ("created_at");
CREATE INDEX IF NOT EXISTS "page_views_session_id_idx" ON "page_views" ("session_id");
CREATE INDEX IF NOT EXISTS "page_views_country_idx" ON "page_views" ("country");
CREATE INDEX IF NOT EXISTS "page_views_referrer_idx" ON "page_views" ("referrer");

CREATE TABLE IF NOT EXISTS "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" text,
	"source" text DEFAULT 'lead_form',
	"source_page" text,
	"status" text DEFAULT 'new',
	"ip" text,
	"user_agent" text,
	"resend_message_id" text,
	"welcome_completed_at" timestamptz,
	"email_sent_at" timestamptz,
	"created_at" timestamptz DEFAULT now(),
	"deleted_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "leads_resend_message_id_idx" ON "leads" ("resend_message_id");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" ("created_at");
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "leads_live_email_unique_idx" ON "leads" (lower("email")) WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" ("status");
CREATE INDEX IF NOT EXISTS "leads_alive_created_at_idx" ON "leads" ("deleted_at", "created_at");

CREATE TABLE IF NOT EXISTS "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread',
	"read_at" timestamptz,
	"created_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "contact_submissions_status_idx" ON "contact_submissions" ("status");
CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "contact_submissions" ("created_at");

CREATE TABLE IF NOT EXISTS "email_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer REFERENCES "leads"("id") ON DELETE SET NULL,
	"message_id" text,
	"event" text NOT NULL,
	"metadata" text,
	"created_at" timestamptz DEFAULT now(),
	"svix_id" text
);
CREATE INDEX IF NOT EXISTS "email_events_lead_id_idx" ON "email_events" ("lead_id");
CREATE INDEX IF NOT EXISTS "email_events_message_id_idx" ON "email_events" ("message_id");
CREATE INDEX IF NOT EXISTS "email_events_event_idx" ON "email_events" ("event");
CREATE INDEX IF NOT EXISTS "email_events_created_at_idx" ON "email_events" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "email_events_svix_id_uq" ON "email_events" ("svix_id");

CREATE TABLE IF NOT EXISTS "user_journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"lead_id" integer REFERENCES "leads"("id") ON DELETE SET NULL,
	"first_visit_at" timestamptz,
	"lead_captured_at" timestamptz,
	"email_delivered_at" timestamptz,
	"email_opened_at" timestamptz,
	"email_clicked_at" timestamptz,
	"landing_page" text,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "user_journeys_session_id_idx" ON "user_journeys" ("session_id");
CREATE INDEX IF NOT EXISTS "user_journeys_lead_id_idx" ON "user_journeys" ("lead_id");

CREATE TABLE IF NOT EXISTS "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"cover_image" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(320) NOT NULL UNIQUE,
	"password_hash" text,
	"role" text DEFAULT 'subscriber' NOT NULL,
	"avatar_url" text,
	"bio" text,
	"social_links" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"invite_token" text,
	"invite_expires_at" timestamptz,
	"last_active_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "users_invite_token_idx" ON "users" ("invite_token");
CREATE INDEX IF NOT EXISTS "users_last_active_at_idx" ON "users" ("last_active_at");

CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"parent_id" integer,
	"author_name" text,
	"author_email" text,
	"author_url" text,
	"user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
	"content" text NOT NULL,
	"content_html" text,
	"status" text DEFAULT 'pending',
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"ip" text,
	"user_agent" text,
	"edited_at" timestamptz,
	"created_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "comments" ("post_id");
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments" ("parent_id");
CREATE INDEX IF NOT EXISTS "comments_status_idx" ON "comments" ("status");
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments" ("created_at");

CREATE TABLE IF NOT EXISTS "webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"events" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_triggered" timestamptz,
	"last_status" integer,
	"fail_count" integer DEFAULT 0,
	"created_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "webhooks_is_active_idx" ON "webhooks" ("is_active");

CREATE TABLE IF NOT EXISTS "editorial_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
	"user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
	"content" text NOT NULL,
	"created_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "editorial_notes_post_id_idx" ON "editorial_notes" ("post_id");

CREATE TABLE IF NOT EXISTS "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text,
	"updated_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "content_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"block_structure" text NOT NULL,
	"thumbnail" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamptz DEFAULT now(),
	"updated_at" timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "content_templates_category_idx" ON "content_templates" ("category");

CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"expires_at" timestamptz NOT NULL,
	"absolute_expires_at" timestamptz NOT NULL,
	"last_used_at" timestamptz,
	"user_agent" text,
	"ip" text,
	"revoked_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" ("expires_at");
CREATE INDEX IF NOT EXISTS "admin_sessions_user_id_idx" ON "admin_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "admin_sessions_absolute_expires_at_idx" ON "admin_sessions" ("absolute_expires_at");

CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
	"key" varchar(191) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" ("reset_at");

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"email" text NOT NULL,
	"expires_at" timestamptz NOT NULL,
	"used_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" ("expires_at");

CREATE TABLE IF NOT EXISTS "auth_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
	"event_type" text NOT NULL,
	"success" boolean NOT NULL,
	"ip" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "auth_events_user_created_idx" ON "auth_events" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "auth_events_type_created_idx" ON "auth_events" ("event_type", "created_at");

CREATE TABLE IF NOT EXISTS "admin_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"target_href" text NOT NULL,
	"source_table" text,
	"source_id" integer,
	"dedupe_key" text NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamptz DEFAULT now() NOT NULL,
	"read_at" timestamptz,
	"clicked_at" timestamptz,
	"archived_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "admin_notifications_dedupe_key_idx" ON "admin_notifications" ("dedupe_key");
CREATE INDEX IF NOT EXISTS "admin_notifications_read_occurred_idx" ON "admin_notifications" ("read_at", "occurred_at");
CREATE INDEX IF NOT EXISTS "admin_notifications_type_occurred_idx" ON "admin_notifications" ("type", "occurred_at");
CREATE INDEX IF NOT EXISTS "admin_notifications_source_idx" ON "admin_notifications" ("source_table", "source_id");
CREATE INDEX IF NOT EXISTS "admin_notifications_active_occurred_idx" ON "admin_notifications" ("occurred_at") WHERE "archived_at" IS NULL;

CREATE TABLE IF NOT EXISTS "click_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source_path" text NOT NULL,
	"target_path" text NOT NULL,
	"target_host" text,
	"link_text" text,
	"session_id" text,
	"user_agent" text,
	"country" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "click_events_created_at_idx" ON "click_events" ("created_at");
CREATE INDEX IF NOT EXISTS "click_events_target_path_idx" ON "click_events" ("target_path");
CREATE INDEX IF NOT EXISTS "click_events_source_path_idx" ON "click_events" ("source_path");
CREATE INDEX IF NOT EXISTS "click_events_session_id_idx" ON "click_events" ("session_id");

CREATE TABLE IF NOT EXISTS "click_events_hourly" (
	"hour_bucket" timestamptz NOT NULL,
	"source_path" text NOT NULL,
	"target_path" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"uniques" integer DEFAULT 0 NOT NULL,
	PRIMARY KEY ("hour_bucket", "source_path", "target_path")
);
CREATE INDEX IF NOT EXISTS "click_events_hourly_bucket_idx" ON "click_events_hourly" ("hour_bucket");

CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"digest_frequency" text DEFAULT 'immediate' NOT NULL,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"tz" text DEFAULT 'UTC' NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "notification_prefs_user_type_uq" ON "notification_preferences" ("user_id", "type");

CREATE TABLE IF NOT EXISTS "integration_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"display_name" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'not_configured' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_ciphertext" text,
	"secret_last_four" text,
	"secret_updated_at" timestamptz,
	"last_test_status" text,
	"last_test_at" timestamptz,
	"last_test_error" text,
	"last_test_evidence" jsonb,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "integration_connections_provider_idx" ON "integration_connections" ("provider");
CREATE INDEX IF NOT EXISTS "integration_connections_status_idx" ON "integration_connections" ("status");
CREATE INDEX IF NOT EXISTS "integration_connections_enabled_idx" ON "integration_connections" ("enabled");

CREATE TABLE IF NOT EXISTS "integration_test_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_id" integer REFERENCES "integration_connections"("id") ON DELETE SET NULL,
	"provider" text NOT NULL,
	"status" text NOT NULL,
	"error" text,
	"evidence" jsonb,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "integration_test_runs_connection_created_idx" ON "integration_test_runs" ("connection_id", "created_at");
CREATE INDEX IF NOT EXISTS "integration_test_runs_provider_created_idx" ON "integration_test_runs" ("provider", "created_at");

CREATE TABLE IF NOT EXISTS "email_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"trigger_source" text DEFAULT 'lead_magnet' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "email_sequences_trigger_active_idx" ON "email_sequences" ("trigger_source", "is_active");

CREATE TABLE IF NOT EXISTS "email_sequence_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"sequence_id" integer NOT NULL REFERENCES "email_sequences"("id") ON DELETE CASCADE,
	"step_index" integer NOT NULL,
	"delay_days" integer DEFAULT 7 NOT NULL,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_sequence_steps_seq_step_idx" ON "email_sequence_steps" ("sequence_id", "step_index");

CREATE TABLE IF NOT EXISTS "email_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
	"sequence_id" integer NOT NULL REFERENCES "email_sequences"("id") ON DELETE CASCADE,
	"current_step" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"next_send_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "email_enrollments_status_next_send_idx" ON "email_enrollments" ("status", "next_send_at");
CREATE INDEX IF NOT EXISTS "email_enrollments_lead_id_idx" ON "email_enrollments" ("lead_id");
CREATE UNIQUE INDEX IF NOT EXISTS "email_enrollments_lead_seq_idx" ON "email_enrollments" ("lead_id", "sequence_id");

CREATE TABLE IF NOT EXISTS "email_sends" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL REFERENCES "email_enrollments"("id") ON DELETE CASCADE,
	"step_index" integer NOT NULL,
	"resend_message_id" text,
	"sent_at" timestamptz,
	"status" text DEFAULT 'pending' NOT NULL,
	"payload" jsonb,
	"first_attempt_at" timestamptz,
	"lease_token" text,
	"lease_until" timestamptz,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_sends_enrollment_step_idx" ON "email_sends" ("enrollment_id", "step_index");
CREATE INDEX IF NOT EXISTS "email_sends_resend_message_id_idx" ON "email_sends" ("resend_message_id");

CREATE TABLE IF NOT EXISTS "email_suppressions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_suppressions_email_idx" ON "email_suppressions" ("email");

CREATE TABLE IF NOT EXISTS "scheduled_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320) NOT NULL,
	"scheduled_at" timestamptz NOT NULL,
	"end_at" timestamptz,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"calendly_event_uri" text NOT NULL,
	"invitee_uri" text,
	"payload_json" jsonb,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "scheduled_calls_event_uri_idx" ON "scheduled_calls" ("calendly_event_uri");
CREATE INDEX IF NOT EXISTS "scheduled_calls_scheduled_at_idx" ON "scheduled_calls" ("scheduled_at");
CREATE INDEX IF NOT EXISTS "scheduled_calls_email_idx" ON "scheduled_calls" ("email");
CREATE INDEX IF NOT EXISTS "scheduled_calls_status_idx" ON "scheduled_calls" ("status");

CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'popup' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"targeting_json" jsonb,
	"content_json" jsonb,
	"starts_at" timestamptz,
	"ends_at" timestamptz,
	"deleted_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "campaigns_status_alive_idx" ON "campaigns" ("status", "deleted_at");
CREATE INDEX IF NOT EXISTS "campaigns_alive_created_idx" ON "campaigns" ("deleted_at", "created_at");

CREATE TABLE IF NOT EXISTS "campaign_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
	"key" text NOT NULL,
	"weight" integer DEFAULT 50 NOT NULL,
	"content_json" jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS "campaign_variants_campaign_key_idx" ON "campaign_variants" ("campaign_id", "key");

CREATE TABLE IF NOT EXISTS "campaign_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
	"variant_key" text,
	"type" text NOT NULL,
	"session_id" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "campaign_events_campaign_type_created_idx" ON "campaign_events" ("campaign_id", "type", "created_at");

CREATE TABLE IF NOT EXISTS "consent_records" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"anon_id" text NOT NULL,
	"categories" jsonb NOT NULL,
	"policy_version" integer DEFAULT 1 NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "consent_records_anon_id_idx" ON "consent_records" ("anon_id");
CREATE INDEX IF NOT EXISTS "consent_records_created_at_idx" ON "consent_records" ("created_at");

INSERT INTO "users" ("id", "name", "email", "role", "is_active")
VALUES (1, 'Billy Ribeiro', 'welberribeirodrums@gmail.com', 'admin', true)
ON CONFLICT ("email") DO NOTHING;
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
