-- Additive rolling-deployment contract: NULL is pending, never an implicit searchable value.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_text text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_excluded boolean;
CREATE INDEX IF NOT EXISTS posts_search_pending_idx ON posts (id) WHERE search_text IS NULL;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_search_projection_pair' AND conrelid = 'posts'::regclass) THEN
  ALTER TABLE posts ADD CONSTRAINT posts_search_projection_pair
   CHECK ((search_text IS NULL) = (search_excluded IS NULL));
 END IF;
END $$;

CREATE OR REPLACE FUNCTION invalidate_post_search_projection() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'INSERT' THEN
  NEW.search_text := NULL;
  NEW.search_excluded := NULL;
 ELSIF ROW(NEW.title, NEW.excerpt, NEW.content, NEW.faq_items, NEW.custom_fields, NEW.cover_image, NEW.cover_image_caption)
  IS DISTINCT FROM ROW(OLD.title, OLD.excerpt, OLD.content, OLD.faq_items, OLD.custom_fields, OLD.cover_image, OLD.cover_image_caption) THEN
  NEW.search_text := NULL;
  NEW.search_excluded := NULL;
 END IF;
 RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS posts_invalidate_search_projection ON posts;
CREATE TRIGGER posts_invalidate_search_projection
 BEFORE INSERT OR UPDATE OF title, excerpt, content, faq_items, custom_fields, cover_image, cover_image_caption ON posts
 FOR EACH ROW EXECUTE FUNCTION invalidate_post_search_projection();
