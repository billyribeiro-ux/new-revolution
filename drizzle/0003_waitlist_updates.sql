-- Add progress updates without changing existing subscriptions or their recorded consent.
ALTER TABLE waitlist_email_outbox
 DROP CONSTRAINT IF EXISTS waitlist_email_outbox_purpose_check;
ALTER TABLE waitlist_email_outbox
 ADD CONSTRAINT waitlist_email_outbox_purpose_check
 CHECK (purpose IN ('confirm','receipt','launch','update'));
