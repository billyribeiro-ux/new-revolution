CREATE TABLE IF NOT EXISTS waitlist_subscriptions (
 id text PRIMARY KEY, email text NOT NULL UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','unsubscribed','suppressed')),
 consent_version text NOT NULL, source text NOT NULL DEFAULT 'maintenance',
 created_at timestamptz NOT NULL DEFAULT now(), confirmed_at timestamptz, unsubscribed_at timestamptz
);
CREATE TABLE IF NOT EXISTS waitlist_tokens (
 hash text PRIMARY KEY, subscription_id text NOT NULL REFERENCES waitlist_subscriptions(id) ON DELETE CASCADE,
 purpose text NOT NULL CHECK (purpose IN ('confirm','unsubscribe')), expires_at timestamptz NOT NULL, consumed_at timestamptz
);
CREATE TABLE IF NOT EXISTS waitlist_email_outbox (
 id text PRIMARY KEY, subscription_id text NOT NULL REFERENCES waitlist_subscriptions(id) ON DELETE CASCADE,
 purpose text NOT NULL CHECK (purpose IN ('confirm','receipt','launch')), delivery_key text NOT NULL UNIQUE,
 ciphertext text, state text NOT NULL DEFAULT 'pending', provider_id text UNIQUE,
 attempts integer NOT NULL DEFAULT 0, first_attempt_at timestamptz, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_token text, lease_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz,
 delivery_state text, failure_category text
);
CREATE INDEX IF NOT EXISTS waitlist_outbox_due_idx ON waitlist_email_outbox(state,next_attempt_at);
CREATE TABLE IF NOT EXISTS waitlist_abuse_buckets (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS waitlist_delivery_events (id text PRIMARY KEY, provider_id text NOT NULL, kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS waitlist_events_provider_idx ON waitlist_delivery_events(provider_id);
